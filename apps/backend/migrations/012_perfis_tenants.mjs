export async function executar(pool) {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS perfil TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant TEXT;

    UPDATE users
    SET perfil = CASE WHEN role = 'admin' THEN 'admin' ELSE COALESCE(perfil, 'projeto') END,
        tenant = CASE WHEN role = 'admin' THEN 'global' ELSE COALESCE(tenant, 'projeto') END
    WHERE perfil IS NULL OR tenant IS NULL OR role = 'admin';

    ALTER TABLE users ALTER COLUMN perfil SET DEFAULT 'projeto';
    ALTER TABLE users ALTER COLUMN tenant SET DEFAULT 'projeto';
    ALTER TABLE users ALTER COLUMN perfil SET NOT NULL;
    ALTER TABLE users ALTER COLUMN tenant SET NOT NULL;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_perfil_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_perfil_check CHECK (perfil IN ('admin', 'projeto', 'prog_apoio'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_tenant_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_tenant_check CHECK (tenant IN ('global', 'projeto', 'prog_apoio'));
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_users_perfil_tenant ON users (perfil, tenant);
  `);
  await pool.query(`
    INSERT INTO schema_migrations (version) VALUES ('012_perfis_tenants')
    ON CONFLICT (version) DO NOTHING
  `);
}
