/* PromForge — minimal markdown renderer (returns React nodes).
   Supports: # ## ### headings, **bold**, *italic*, `inline code`,
   ```code blocks```, [text](url), ![alt](src), - lists, |tables|.
*/
(function () {
  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Inline parser → array of React nodes (plain string + spans).
  function parseInline(text, keyPrefix = "i") {
    const nodes = [];
    let i = 0, k = 0;
    const push = (n) => nodes.push(n);
    const re = /(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > i) push(text.slice(i, m.index));
      if (m[1]) push(React.createElement("img", { key: `${keyPrefix}-${k++}`, src: m[3], alt: m[2], className: "md-img" }));
      else if (m[4]) push(React.createElement("a", { key: `${keyPrefix}-${k++}`, href: m[6], target: "_blank", rel: "noopener noreferrer", className: "md-link" }, m[5]));
      else if (m[7]) push(React.createElement("strong", { key: `${keyPrefix}-${k++}` }, m[8]));
      else if (m[9]) push(React.createElement("em", { key: `${keyPrefix}-${k++}` }, m[10]));
      else if (m[11]) push(React.createElement("code", { key: `${keyPrefix}-${k++}`, className: "md-inline-code" }, m[12]));
      i = m.index + m[0].length;
    }
    if (i < text.length) push(text.slice(i));
    return nodes;
  }

  function renderMarkdown(src) {
    if (!src) return null;
    const lines = src.split(/\r?\n/);
    const out = [];
    let i = 0, key = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Code block
      const fence = line.match(/^```(\w*)\s*$/);
      if (fence) {
        const lang = fence[1];
        i++;
        const buf = [];
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        if (i < lines.length) i++;
        out.push(React.createElement("pre", { key: key++, className: "md-pre" + (lang ? ` md-lang-${lang}` : "") },
          React.createElement("code", null, buf.join("\n"))));
        continue;
      }

      // Heading
      const h = line.match(/^(#{1,4})\s+(.+?)\s*$/);
      if (h) {
        const tag = `h${Math.min(h[1].length + 2, 6)}`; // h1 → h3 etc, keep lower hierarchy
        out.push(React.createElement(tag, { key: key++, className: "md-h" }, parseInline(h[2], `h${key}`)));
        i++;
        continue;
      }

      // Table (must be at start of group)
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
        const header = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        i += 2; // skip header + separator
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          rows.push(lines[i].replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
          i++;
        }
        out.push(React.createElement("div", { key: key++, className: "md-table-wrap" },
          React.createElement("table", { className: "md-table" },
            React.createElement("thead", null,
              React.createElement("tr", null, header.map((c, j) =>
                React.createElement("th", { key: j }, parseInline(c, `th${key}-${j}`))))),
            React.createElement("tbody", null, rows.map((r, ri) =>
              React.createElement("tr", { key: ri }, r.map((c, j) =>
                React.createElement("td", { key: j }, parseInline(c, `td${key}-${ri}-${j}`)))))))));
        continue;
      }

      // List
      if (/^\s*[-*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
          i++;
        }
        out.push(React.createElement("ul", { key: key++, className: "md-ul" },
          items.map((t, j) => React.createElement("li", { key: j }, parseInline(t, `li${key}-${j}`)))));
        continue;
      }

      // Blockquote
      if (/^>\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^>\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^>\s+/, ""));
          i++;
        }
        out.push(React.createElement("blockquote", { key: key++, className: "md-blockquote" },
          items.map((t, j) => React.createElement("div", { key: j }, parseInline(t, `bq${key}-${j}`)))));
        continue;
      }

      // Empty line → spacer
      if (!line.trim()) { i++; continue; }

      // Paragraph (consume consecutive non-special lines)
      const buf = [];
      while (i < lines.length
        && lines[i].trim()
        && !/^(#{1,4})\s+/.test(lines[i])
        && !/^```/.test(lines[i])
        && !/^\s*[-*]\s+/.test(lines[i])
        && !/^>\s+/.test(lines[i])
        && !/^\s*\|.*\|\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      out.push(React.createElement("p", { key: key++, className: "md-p" }, parseInline(buf.join(" "), `p${key}`)));
    }
    return out;
  }

  window.PF_MD = { renderMarkdown };
})();
