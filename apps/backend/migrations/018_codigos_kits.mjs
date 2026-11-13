const versao = '018_codigos_kits';

export async function executar(pool) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE kits_documentais ADD COLUMN IF NOT EXISTS codigo TEXT;

      WITH numerados AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY formulario_id, ordem, id) AS numero
        FROM kits_documentais WHERE codigo IS NULL
      )
      UPDATE kits_documentais AS kit
      SET codigo = 'KIT' || LPAD(numerados.numero::TEXT, GREATEST(3, LENGTH(numerados.numero::TEXT)), '0')
      FROM numerados WHERE kit.id = numerados.id;

      CREATE UNIQUE INDEX IF NOT EXISTS uq_kits_documentais_codigo ON kits_documentais(codigo);
      ALTER TABLE kits_documentais ALTER COLUMN codigo SET NOT NULL;
    `);
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versao]);
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}
