import fs from 'node:fs';
import path from 'node:path';

const versao = '019_instituicoes_executoras';

export async function executar(pool, root) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);

  const catalogo = JSON.parse(fs.readFileSync(path.join(root, 'data', 'unidades_usp.json'), 'utf8'));
  const executoras = catalogo.filter((item) => item.categoria === 'instituicao_executora');
  if (!Array.isArray(catalogo) || executoras.length === 0) {
    throw new Error('O catálogo oficial de instituições executoras está vazio ou inválido.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE unidades_usp ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'unidade_usp';
      ALTER TABLE unidades_usp ADD COLUMN IF NOT EXISTS fonte TEXT;
      ALTER TABLE unidades_usp ALTER COLUMN sigla DROP NOT NULL;
      ALTER TABLE unidades_usp DROP CONSTRAINT IF EXISTS unidades_usp_sigla_key;
      CREATE INDEX IF NOT EXISTS idx_unidades_usp_categoria_active_sigla
        ON unidades_usp(categoria, active, sigla);
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

    for (const item of executoras) {
      if (!item || typeof item.id !== 'string' || (item.sigla !== null && typeof item.sigla !== 'string')
        || typeof item.descricao !== 'string' || typeof item.active !== 'boolean') {
        throw new Error('Registro inválido em data/unidades_usp.json.');
      }
      await client.query(inserir, [item.id.trim(), item.sigla?.trim() || null, item.descricao.trim(), item.active,
        item.categoria, item.fonte || null]);
    }

    const idsExecutoras = executoras.map((item) => item.id);
    // O JSON gerado do CSV é a fonte oficial: remove do banco entradas legadas e
    // quaisquer linhas que já não façam parte do cadastro oficial.
    await client.query('DELETE FROM unidades_usp WHERE NOT (id = ANY($1::text[]))', [idsExecutoras]);
    if (!aplicada.rowCount) await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versao]);
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}
