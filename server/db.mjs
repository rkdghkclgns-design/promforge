import pg from 'pg';
import { config } from './config.mjs';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  // Pool-level errors should be visible. Process errors handled at server boot.
  console.error('[db] pool error', err);
});

export const query = (text, params) => pool.query(text, params);

export const tx = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
