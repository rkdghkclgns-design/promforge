import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.mjs';
import { tryAuth } from './auth.mjs';
import authRoutes from './routes-auth.mjs';
import contentRoutes from './routes-content.mjs';
import adminRoutes from './routes-admin.mjs';
import geminiRoutes from './routes-gemini.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const app = express();

// Security: a sane CSP that still allows the Babel-Standalone prototype to run.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://unpkg.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'", config.supabase.url].filter(Boolean),
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(tryAuth);

app.get('/api/health', (_req, res) => res.json({ ok: true, env: config.env }));

app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gemini', geminiRoutes);

// Static frontend.
app.use(express.static(publicDir, { maxAge: config.env === 'production' ? '1h' : 0 }));

// SPA fallback: any non-API route returns the index.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(publicDir, 'index.html'));
});

// JSON error handler.
app.use((err, _req, res, _next) => {
  console.error('[server] unhandled', err);
  res.status(500).json({ error: 'internal_error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`PromForge server listening on http://localhost:${config.port}`);
  });
}

export default app;
