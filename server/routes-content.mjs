import { Router } from 'express';
import { z } from 'zod';
import { query } from './db.mjs';
import { requireAuth } from './auth.mjs';

const router = Router();

// ── Boards ────────────────────────────────────────────────────────────────────
router.get('/boards', async (_req, res) => {
  const { rows } = await query(
    `select id, slug, title, description, sort_order,
            (select count(*) from pf_posts p where p.board_id = b.id) as posts,
            (select count(*) from pf_posts p where p.board_id = b.id
              and p.created_at > now() - interval '1 day') as today
     from pf_boards b
     order by sort_order asc`
  );
  return res.json({ boards: rows });
});

// ── Posts (public list, with optional auth gating for full body) ─────────────
const PostListSchema = z.object({
  board: z.string().optional(),
  tab: z.enum(['hot', 'latest']).optional().default('latest'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

router.get('/posts', async (req, res) => {
  const parsed = PostListSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_query' });
  const { board, tab, limit } = parsed.data;

  const order = tab === 'hot' ? 'p.likes desc, p.views desc' : 'p.created_at desc';

  const params = [limit];
  let where = '';
  if (board) {
    params.push(board);
    where = 'where b.slug = $2';
  }

  const { rows } = await query(
    `select p.id, p.title, p.tag, p.views, p.likes, p.replies, p.badge,
            p.created_at, b.slug as board_slug, b.title as board_title,
            u.username as author, u.nickname as author_nickname,
            case when $${params.length + 1}::boolean then p.body else null end as body
     from pf_posts p
     left join pf_boards b on b.id = p.board_id
     left join pf_users u on u.id = p.author_id
     ${where}
     order by ${order}
     limit $1`,
    [...params, Boolean(req.user)]
  );

  return res.json({
    posts: rows.map((r) => ({
      ...r,
      // never expose internal IDs to anonymous users; keep slugs/usernames as identity
      preview: r.body ? null : '로그인 후 본문 전체 열람 가능합니다.',
    })),
    requiresLogin: !req.user,
  });
});

router.get('/posts/:id', async (req, res) => {
  const { rows } = await query(
    `select p.*, b.slug as board_slug, u.username as author
     from pf_posts p
     left join pf_boards b on b.id = p.board_id
     left join pf_users u on u.id = p.author_id
     where p.id = $1`,
    [req.params.id]
  );
  const post = rows[0];
  if (!post) return res.status(404).json({ error: 'not_found' });
  if (!req.user) {
    return res.json({
      post: {
        id: post.id,
        title: post.title,
        tag: post.tag,
        board_slug: post.board_slug,
        author: post.author,
        created_at: post.created_at,
        preview: '로그인 후 본문 전체 열람 가능합니다.',
      },
      requiresLogin: true,
    });
  }
  await query('update pf_posts set views = views + 1 where id = $1', [post.id]);
  return res.json({ post });
});

const NewPostSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(20000),
  boardSlug: z.string().min(1).max(40),
  tag: z.string().max(40).optional(),
});

router.post('/posts', requireAuth, async (req, res) => {
  const parsed = NewPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { title, body, boardSlug, tag } = parsed.data;
  const board = await query('select id from pf_boards where slug = $1', [boardSlug]);
  if (!board.rows[0]) return res.status(400).json({ error: 'unknown_board' });

  const { rows } = await query(
    `insert into pf_posts (board_id, author_id, title, body, tag)
     values ($1, $2, $3, $4, $5)
     returning id, title, created_at`,
    [board.rows[0].id, req.user.id, title, body, tag ?? null]
  );
  return res.status(201).json({ post: rows[0] });
});

// ── Studies ───────────────────────────────────────────────────────────────────
router.get('/studies', async (_req, res) => {
  const { rows } = await query(
    `select id, title, description as desc, status, week, total
     from pf_studies order by created_at desc limit 20`
  );
  return res.json({ studies: rows });
});

// ── Showcases ─────────────────────────────────────────────────────────────────
router.get('/showcases', async (_req, res) => {
  const { rows } = await query(
    `select id, title, genre, author_handle as author, description, image_url
     from pf_showcases order by created_at desc limit 20`
  );
  return res.json({ showcases: rows });
});

// ── Subscribe ─────────────────────────────────────────────────────────────────
const SubscribeSchema = z.object({ email: z.string().email() });
router.post('/subscribe', async (req, res) => {
  const parsed = SubscribeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  await query(
    `insert into pf_subscribers (email, kind) values ($1, 'digest')
     on conflict (email) do nothing`,
    [parsed.data.email]
  );
  return res.json({ ok: true });
});

export default router;
