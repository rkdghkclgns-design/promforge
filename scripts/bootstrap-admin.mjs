// Ensures the admin account exists with the configured password.
// Safe to run repeatedly; updates the password hash in place if it exists.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, query } from '../server/db.mjs';
import { config } from '../server/config.mjs';

async function main() {
  const { username, password } = config.admin;
  const hash = await bcrypt.hash(password, 10);

  const existing = await query(
    'select id from pf_users where username = $1',
    [username]
  );

  if (existing.rows[0]) {
    await query(
      `update pf_users set password_hash = $1, role = 'admin' where username = $2`,
      [hash, username]
    );
    console.log(`✓ admin user '${username}' updated.`);
  } else {
    await query(
      `insert into pf_users (username, email, password_hash, nickname, role)
       values ($1, $2, $3, $4, 'admin')`,
      [username, `${username}@promforge.local`, hash, '관리자']
    );
    console.log(`✓ admin user '${username}' created.`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('bootstrap failed:', err);
  process.exit(1);
});
