export async function executar(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS processo_eventos (
    id BIGSERIAL PRIMARY KEY,
    processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
    acao TEXT NOT NULL,
    resultado TEXT NOT NULL CHECK (resultado IN ('inicio', 'sucesso', 'falha')),
    detalhe TEXT NOT NULL DEFAULT '',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_processo_eventos_data ON processo_eventos(processo_id, id DESC);
  INSERT INTO schema_migrations(version) VALUES ('020_eventos_processo') ON CONFLICT DO NOTHING;`);
}
