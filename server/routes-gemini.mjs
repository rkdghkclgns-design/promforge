import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from './config.mjs';
import { requireAuth } from './auth.mjs';

const router = Router();

const limiter = rateLimit({ windowMs: 60 * 1000, limit: 20 });

const SearchSchema = z.object({
  query: z.string().min(1).max(500),
});

// Calls a Supabase Edge Function (which holds GEMINI_API_KEY in its secret store).
// Node never sees the key — it just forwards user queries.
router.post('/search', requireAuth, limiter, async (req, res) => {
  const parsed = SearchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

  const { url, anonKey, geminiFunctionName } = config.supabase;
  if (!url || !anonKey) {
    return res.status(503).json({ error: 'gemini_not_configured' });
  }

  try {
    const upstream = await fetch(`${url}/functions/v1/${geminiFunctionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ query: parsed.data.query }),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({ error: 'upstream_error', status: upstream.status, detail: text });
    }
    return res.type('application/json').send(text);
  } catch (err) {
    return res.status(502).json({ error: 'upstream_unreachable', detail: String(err) });
  }
});

export default router;
