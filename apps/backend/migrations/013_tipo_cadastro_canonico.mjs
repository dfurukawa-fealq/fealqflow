const versao = '013_tipo_cadastro_canonico';

export async function executar(pool) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      DO $$
      DECLARE
        restricao RECORD;
      BEGIN
        FOR restricao IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'cadastros_formularios'::regclass
            AND contype = 'c'
            AND pg_get_constraintdef(oid) LIKE '%tipo_cadastro%'
        LOOP
          EXECUTE format('ALTER TABLE cadastros_formularios DROP CONSTRAINT %I', restricao.conname);
        END LOOP;
      END $$;

      UPDATE cadastros_formularios
      SET tipo_cadastro = CASE
        WHEN lower(translate(tipo_cadastro, 'áÁ', 'aA')) = 'formulario' THEN 'formulario'
        WHEN lower(tipo_cadastro) = 'documento' THEN 'documento'
        ELSE tipo_cadastro
      END;

      UPDATE cadastros_formularios
      SET documentos_solicitados = (
        SELECT COALESCE(jsonb_agg(
          CASE
            WHEN lower(translate(item->>'tipo', 'áÁ', 'aA')) = 'formulario'
              THEN jsonb_set(item, '{tipo}', '"formulario"'::jsonb)
            WHEN lower(item->>'tipo') = 'documento'
              THEN jsonb_set(item, '{tipo}', '"documento"'::jsonb)
            ELSE item
          END ORDER BY ordem
        ), '[]'::jsonb)
        FROM jsonb_array_elements(documentos_solicitados) WITH ORDINALITY AS itens(item, ordem)
      )
      WHERE jsonb_typeof(documentos_solicitados) = 'array';

      ALTER TABLE cadastros_formularios
        ALTER COLUMN tipo_cadastro SET DEFAULT 'formulario';
      ALTER TABLE cadastros_formularios
        ADD CONSTRAINT cadastros_formularios_tipo_cadastro_canonico_check
        CHECK (tipo_cadastro IN ('formulario', 'documento'));
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
