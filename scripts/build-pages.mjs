// Pre-builds the static frontend for GitHub Pages so the browser never
// has to load Babel Standalone (the warning the user saw).
//
// What it does:
//   1. Recursively walks public/
//   2. Transpiles every *.jsx file to *.js with esbuild
//      (JSX, automatic React runtime — but we keep classic for global React)
//   3. Copies every non-jsx file unchanged
//   4. Rewrites index.html:
//      • Removes the @babel/standalone <script> tag
//      • Replaces every <script type="text/babel" src="X.jsx"> with
//        a plain <script src="X.js">
//
// Output: dist/  (committed-ignored — built fresh in CI)
import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SRC = path.join(root, "public");
const OUT = path.join(root, "dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

function rewriteHtml(html) {
  // Remove the Babel Standalone script (any src containing @babel/standalone).
  let out = html.replace(
    /<script[^>]*@babel\/standalone[^>]*><\/script>\s*/g,
    ""
  );
  // Convert each Babel JSX script tag to a plain JS one.
  // <script type="text/babel" src="js/foo.jsx"></script>
  // → <script src="js/foo.js"></script>
  out = out.replace(
    /<script\s+type=["']text\/babel["']\s+src=["']([^"']+)\.jsx["']><\/script>/g,
    (_, p1) => `<script src="${p1}.js"></script>`
  );
  // Defensive: also convert inline <script type="text/babel"> blocks if any
  // remain. We transpile the inner JSX with esbuild and inline as plain JS.
  out = out.replace(
    /<script\s+type=["']text\/babel["']\s*>([\s\S]*?)<\/script>/g,
    (_, body) => {
      try {
        const result = esbuild.transformSync(body, {
          loader: "jsx",
          jsx: "transform",
          jsxFactory: "React.createElement",
          jsxFragment: "React.Fragment",
          target: "es2020",
        });
        return `<script>${result.code}</script>`;
      } catch (err) {
        console.error("inline babel block failed:", err);
        return `<script type="text/babel">${body}</script>`;
      }
    }
  );
  return out;
}

async function main() {
  console.log(`[build-pages] src=${SRC}`);
  console.log(`[build-pages] out=${OUT}`);
  await ensureDir(OUT);

  const files = await walk(SRC);
  let jsxCount = 0, copied = 0, htmlCount = 0;

  for (const file of files) {
    const rel = path.relative(SRC, file);
    const dest = path.join(OUT, rel);
    await ensureDir(path.dirname(dest));

    if (file.endsWith(".jsx")) {
      const code = await readFile(file, "utf8");
      const result = await esbuild.transform(code, {
        loader: "jsx",
        jsx: "transform",
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
        target: "es2020",
        sourcefile: rel,
      });
      // Output as .js with the same relative path
      const jsDest = dest.replace(/\.jsx$/, ".js");
      await writeFile(jsDest, result.code, "utf8");
      jsxCount++;
    } else if (file.endsWith(".html")) {
      const html = await readFile(file, "utf8");
      await writeFile(dest, rewriteHtml(html), "utf8");
      htmlCount++;
    } else {
      await copyFile(file, dest);
      copied++;
    }
  }

  console.log(
    `[build-pages] done: ${jsxCount} jsx → js, ${htmlCount} html rewritten, ${copied} other copied.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
