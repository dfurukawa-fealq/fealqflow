import fs from 'node:fs';
import path from 'node:path';

const versao = '015_acoes_itens_kit_documental';

export async function executar(pool, root) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const itens = JSON.parse(fs.readFileSync(path.join(root, 'data', 'itens_kit_documental.json'), 'utf8'));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`ALTER TABLE itens_kit_documental
      ADD COLUMN IF NOT EXISTS permite_anexo BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS permite_modelo BOOLEAN NOT NULL DEFAULT FALSE`);

    for (const item of itens) {
      const permiteAnexo = item.permite_anexo ?? item.tipo === 'upload';
      const permiteModelo = item.permite_modelo ?? (item.tipo === 'upload' && Boolean(item.url_template));
      await client.query(`UPDATE itens_kit_documental
        SET permite_anexo = $1, permite_modelo = $2, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $3`, [permiteAnexo, permiteModelo, item.id]);
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
