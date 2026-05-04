import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.mjs';
import { query } from './db.mjs';

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hashed) => bcrypt.compare(plain, hashed);

export const issueToken = (user) =>
  jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtTtl }
  );

const readToken = (req) => {
  const fromCookie = req.cookies?.[config.cookieName];
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization ?? '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

export const tryAuth = async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const { rows } = await query(
      'select id, username, email, nickname, role from pf_users where id = $1',
      [payload.sub]
    );
    if (rows[0]) req.user = rows[0];
  } catch {
    // Invalid token — treat as anonymous.
  }
  return next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  return next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  return next();
};

export const setAuthCookie = (res, token) => {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(config.cookieName, { path: '/' });
};
