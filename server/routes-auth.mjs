import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from './db.mjs';
import {
  hashPassword,
  verifyPassword,
  issueToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from './auth.mjs';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const SignupSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email().max(160),
  password: z.string().min(4).max(128),
  nickname: z.string().min(1).max(40).optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

router.post('/signup', loginLimiter, async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { username, email, password, nickname } = parsed.data;

  const exists = await query(
    'select 1 from pf_users where username = $1 or email = $2 limit 1',
    [username, email]
  );
  if (exists.rows.length) {
    return res.status(409).json({ error: 'already_exists' });
  }

  const passwordHash = await hashPassword(password);
  const { rows } = await query(
    `insert into pf_users (username, email, password_hash, nickname, role)
     values ($1, $2, $3, $4, 'user')
     returning id, username, email, nickname, role, created_at`,
    [username, email, passwordHash, nickname ?? username]
  );
  const user = rows[0];
  const token = issueToken(user);
  setAuthCookie(res, token);

  await query(
    'insert into pf_audit_logs (user_id, action, ip) values ($1, $2, $3)',
    [user.id, 'signup', req.ip]
  );

  return res.status(201).json({ user });
});

router.post('/login', loginLimiter, async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input' });
  }
  const { username, password } = parsed.data;

  const { rows } = await query(
    'select id, username, email, nickname, role, password_hash from pf_users where username = $1 limit 1',
    [username]
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = issueToken(user);
  setAuthCookie(res, token);

  await query(
    'update pf_users set last_login_at = now() where id = $1',
    [user.id]
  );
  await query(
    'insert into pf_audit_logs (user_id, action, ip) values ($1, $2, $3)',
    [user.id, 'login', req.ip]
  );

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    },
  });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
