import { randomUUID } from 'node:crypto';
import { hashPassword } from '../server/passwords.mjs';

export async function executar(pool) {
  const username = process.env.ADMIN_USER?.trim().toLocaleLowerCase('pt-BR');
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error('Configure ADMIN_USER e ADMIN_PASSWORD no ambiente para inicializar o acesso administrativo.');
  }
  if (username.length > 120 || Buffer.byteLength(password, 'utf8') > 1024) {
    throw new Error('ADMIN_USER ou ADMIN_PASSWORD excede o limite permitido.');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expiry ON user_sessions (user_id, expires_at);
    CREATE TABLE IF NOT EXISTS auth_login_attempts (
      key_hash CHAR(64) PRIMARY KEY,
      failures INTEGER NOT NULL DEFAULT 0,
      window_started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      blocked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const version = '010_autenticacao_admin';
  await pool.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING', [version]);

  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (!existing.rowCount) {
    const passwordHash = await hashPassword(password);
    await pool.query(`
      INSERT INTO users (id, username, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [randomUUID(), username, passwordHash]);
  }
}
