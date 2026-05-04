import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

// Smoke tests that exercise the pure auth helpers without needing a DB.
// Note: requires env vars to be set when importing auth.mjs (which loads config).

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgres://stub:stub@localhost:5432/stub';
process.env.JWT_SECRET ||= 'test-secret';

const { hashPassword, verifyPassword, issueToken } = await import('../auth.mjs');

test('hashPassword + verifyPassword roundtrip', async () => {
  const hash = await hashPassword('1124');
  assert.ok(hash.startsWith('$2'), 'should look like a bcrypt hash');
  assert.equal(await verifyPassword('1124', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
});

test('issueToken produces a JWT-shaped string', () => {
  const token = issueToken({ id: 'u1', username: 'admin', role: 'admin' });
  const parts = token.split('.');
  assert.equal(parts.length, 3);
});

test('bcrypt cost is at least 10', async () => {
  const hash = await hashPassword('any');
  // bcrypt format: $2a$<cost>$...
  const cost = Number(hash.split('$')[2]);
  assert.ok(cost >= 10, `cost ${cost} should be >= 10`);
});
