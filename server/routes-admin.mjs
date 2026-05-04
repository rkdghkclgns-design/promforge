import { Router } from 'express';
import { query } from './db.mjs';
import { requireAdmin } from './auth.mjs';

const router = Router();

router.use(requireAdmin);

router.get('/overview', async (_req, res) => {
  const [users, posts, comments, sessions] = await Promise.all([
    query('select count(*)::int as n from pf_users'),
    query('select count(*)::int as n from pf_posts'),
    query('select coalesce(sum(replies), 0)::int as n from pf_posts'),
    query(
      `select count(*)::int as n from pf_audit_logs
       where action = 'login' and created_at > now() - interval '1 day'`
    ),
  ]);
  return res.json({
    kpi: {
      total_users: users.rows[0].n,
      total_posts: posts.rows[0].n,
      total_comments: comments.rows[0].n,
      logins_24h: sessions.rows[0].n,
    },
  });
});

router.get('/users', async (_req, res) => {
  const { rows } = await query(
    `select id, username, email, nickname, role, created_at, last_login_at
     from pf_users order by created_at desc limit 200`
  );
  return res.json({ users: rows });
});

router.get('/audit', async (_req, res) => {
  const { rows } = await query(
    `select a.id, a.action, a.meta, a.ip, a.created_at, u.username
     from pf_audit_logs a
     left join pf_users u on u.id = a.user_id
     order by a.created_at desc limit 200`
  );
  return res.json({ logs: rows });
});

router.get('/subscribers', async (_req, res) => {
  const { rows } = await query(
    'select email, kind, created_at from pf_subscribers order by created_at desc limit 500'
  );
  return res.json({ subscribers: rows });
});

export default router;
