export async function executarProcessos(pool) {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS processos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      protocolo VARCHAR(40) UNIQUE NOT NULL,
      categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('projeto', 'apoio')),
      formulario_id VARCHAR(120) NOT NULL,
      formulario_nome VARCHAR(255) NOT NULL,
      formulario_rota TEXT NOT NULL DEFAULT '',
      chave_criacao UUID,
      titulo TEXT NOT NULL DEFAULT '',
      solicitante_nome VARCHAR(255) NOT NULL DEFAULT '',
      solicitante_email VARCHAR(255) NOT NULL DEFAULT '',
      status VARCHAR(30) NOT NULL DEFAULT 'rascunho',
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      inativado_em TIMESTAMPTZ,
      inativado_por UUID,
      dados_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      acesso_hash VARCHAR(64),
      versao INTEGER NOT NULL DEFAULT 0,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      enviado_em TIMESTAMPTZ,
      finalizado_em TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS processo_documentos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL,
      obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
      status VARCHAR(30) NOT NULL DEFAULT 'pendente',
      arquivo_nome TEXT,
      arquivo_url TEXT,
      enviado_em TIMESTAMPTZ,
      validado_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_processos_categoria_status ON processos (categoria, status);
    CREATE INDEX IF NOT EXISTS idx_processos_atualizado ON processos (atualizado_em DESC);
    CREATE INDEX IF NOT EXISTS idx_processo_documentos_processo ON processo_documentos (processo_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_processo_documentos_nome ON processo_documentos (processo_id, nome);
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS acesso_hash VARCHAR(64);
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS versao INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS formulario_rota TEXT NOT NULL DEFAULT '';
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS chave_criacao UUID;
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS inativado_em TIMESTAMPTZ;
    ALTER TABLE processos ADD COLUMN IF NOT EXISTS inativado_por UUID;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_processos_chave_criacao ON processos (chave_criacao);
  `);
}
