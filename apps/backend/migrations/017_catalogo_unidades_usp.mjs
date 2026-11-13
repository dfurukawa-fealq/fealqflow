import fs from 'node:fs';
import path from 'node:path';

const versao = '017_catalogo_unidades_usp';

export async function executar(pool, root) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const unidades = JSON.parse(fs.readFileSync(path.join(root, 'data', 'unidades_usp.json'), 'utf8'));
  if (!Array.isArray(unidades)) throw new Error('data/unidades_usp.json precisa conter uma lista de unidades.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS unidades_usp (
        id TEXT PRIMARY KEY,
        sigla TEXT NOT NULL DEFAULT '',
        descricao TEXT NOT NULL DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        categoria TEXT NOT NULL DEFAULT 'unidade_usp',
        fonte TEXT,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (length(trim(id)) > 0),
        CHECK (length(trim(sigla)) <= 120)
      );
      ALTER TABLE unidades_usp ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'unidade_usp';
      ALTER TABLE unidades_usp ADD COLUMN IF NOT EXISTS fonte TEXT;
      ALTER TABLE unidades_usp ALTER COLUMN sigla DROP NOT NULL;
      ALTER TABLE unidades_usp DROP CONSTRAINT IF EXISTS unidades_usp_sigla_key;
      CREATE INDEX IF NOT EXISTS idx_unidades_usp_active_sigla ON unidades_usp(categoria, active, sigla);
    `);

    const inserir = `INSERT INTO unidades_usp (id, sigla, descricao, active, categoria, fonte)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        sigla = EXCLUDED.sigla,
        descricao = EXCLUDED.descricao,
        active = EXCLUDED.active,
        categoria = EXCLUDED.categoria,
        fonte = EXCLUDED.fonte,
        atualizado_em = CURRENT_TIMESTAMP`;
    for (const unidade of unidades) {
      if (!unidade || typeof unidade.id !== 'string' || (unidade.sigla !== null && typeof unidade.sigla !== 'string')
        || typeof unidade.descricao !== 'string' || typeof unidade.active !== 'boolean'
        || !['unidade_usp', 'instituicao_executora'].includes(unidade.categoria || 'unidade_usp')) {
        throw new Error('Unidade inválida em data/unidades_usp.json.');
      }
      await client.query(inserir, [unidade.id.trim(), unidade.sigla?.trim() || null, unidade.descricao.trim(), unidade.active,
        unidade.categoria || 'unidade_usp', unidade.fonte || null]);
    }

    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versao]);
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}
