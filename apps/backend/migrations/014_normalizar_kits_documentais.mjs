import fs from 'node:fs';
import path from 'node:path';

const versao = '014_normalizar_kits_documentais';
const lerJson = (root, nome) => JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));

export async function executar(pool, root) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const kitsArquivo = lerJson(root, 'kits_documentais.json');
  const itensArquivo = lerJson(root, 'itens_kit_documental.json');
  const documentosArquivo = lerJson(root, 'cadastro_documentos.json');
  const formulariosArquivo = lerJson(root, 'cadastros_formularios.json');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE cadastros_formularios ADD COLUMN IF NOT EXISTS dados_legados JSONB NOT NULL DEFAULT '{}'::jsonb;

      CREATE TABLE IF NOT EXISTS cadastro_documentos (
        id TEXT PRIMARY KEY REFERENCES cadastros_formularios(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL DEFAULT '',
        template_url TEXT NOT NULL DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS kits_documentais (
        id TEXT PRIMARY KEY,
        formulario_id TEXT NOT NULL REFERENCES cadastros_formularios(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL DEFAULT '',
        campo_condicional TEXT,
        operador_condicional TEXT CHECK (operador_condicional IS NULL OR operador_condicional = 'equals'),
        valor_condicional TEXT,
        ordem INTEGER NOT NULL DEFAULT 0,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK ((campo_condicional IS NULL AND operador_condicional IS NULL AND valor_condicional IS NULL)
          OR (campo_condicional IS NOT NULL AND operador_condicional IS NOT NULL AND valor_condicional IS NOT NULL))
      );
      CREATE TABLE IF NOT EXISTS itens_kit_documental (
        id TEXT PRIMARY KEY,
        kit_id TEXT NOT NULL REFERENCES kits_documentais(id) ON DELETE CASCADE,
        cadastro_documento_id TEXT REFERENCES cadastro_documentos(id) ON DELETE SET NULL,
        identificador TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL DEFAULT '',
        tipo TEXT NOT NULL CHECK (tipo IN ('gerado', 'upload', 'externo', 'aceite')),
        obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
        url_template TEXT NOT NULL DEFAULT '',
        observacao_condicional TEXT,
        acao_email JSONB,
        campo_condicional TEXT,
        operador_condicional TEXT CHECK (operador_condicional IS NULL OR operador_condicional = 'equals'),
        valor_condicional TEXT,
        ordem INTEGER NOT NULL DEFAULT 0,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (kit_id, identificador),
        CHECK ((campo_condicional IS NULL AND operador_condicional IS NULL AND valor_condicional IS NULL)
          OR (campo_condicional IS NOT NULL AND operador_condicional IS NOT NULL AND valor_condicional IS NOT NULL))
      );
      CREATE INDEX IF NOT EXISTS idx_kits_documentais_formulario ON kits_documentais(formulario_id, ativo, ordem);
      CREATE INDEX IF NOT EXISTS idx_itens_kit_documental_kit ON itens_kit_documental(kit_id, ativo, ordem);

      INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active)
      SELECT c.id, c.nome, COALESCE(d.descricao, ''), COALESCE(d.template_url, ''), d.active
      FROM documentos_cadastro d
      JOIN cadastros_formularios c ON c.id = d.id
      ON CONFLICT (id) DO NOTHING;

      UPDATE cadastros_formularios
      SET dados_legados = dados_legados || jsonb_build_object('documentos_solicitados', documentos_solicitados)
      WHERE jsonb_typeof(documentos_solicitados) = 'array' AND jsonb_array_length(documentos_solicitados) > 0;
    `);

    for (const formulario of formulariosArquivo) {
      await client.query(`INSERT INTO cadastros_formularios
        (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao,
         active, habilitado, nseq, dados_legados)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          dados_legados = EXCLUDED.dados_legados || cadastros_formularios.dados_legados`,
      [formulario.id, formulario.nome, formulario.tipo, formulario.tipo_cadastro,
        formulario.linha_apoio_id || '', formulario.status, formulario.normas || '',
        JSON.stringify(formulario.periodos_submissao || []), formulario.active !== false,
        formulario.habilitado !== false, Number(formulario.nseq || 0),
        JSON.stringify(formulario.dados_legados || {})]);
    }
    for (const documento of documentosArquivo) {
      await client.query(`INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active)
        VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome, descricao = EXCLUDED.descricao, template_url = EXCLUDED.template_url,
        active = EXCLUDED.active, atualizado_em = CURRENT_TIMESTAMP`,
      [documento.id, documento.nome, documento.descricao || '', documento.template_url || '', documento.active !== false]);
    }
    for (const kit of kitsArquivo) {
      await client.query(`INSERT INTO kits_documentais
        (id, formulario_id, nome, descricao, campo_condicional, operador_condicional, valor_condicional, ordem, ativo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [kit.id, kit.formulario_id, kit.nome, kit.descricao || '', kit.campo_condicional || null,
        kit.operador_condicional || null, kit.valor_condicional ?? null, Number(kit.ordem || 0), kit.ativo !== false]);
    }
    for (const item of itensArquivo) {
      await client.query(`INSERT INTO itens_kit_documental
        (id, kit_id, cadastro_documento_id, identificador, titulo, descricao, tipo, obrigatorio, url_template,
         observacao_condicional, acao_email, campo_condicional, operador_condicional, valor_condicional, ordem, ativo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING`,
      [item.id, item.kit_id, item.cadastro_documento_id || null, item.identificador, item.titulo,
        item.descricao || '', item.tipo, item.obrigatorio !== false, item.url_template || '',
        item.observacao_condicional || null, item.acao_email ? JSON.stringify(item.acao_email) : null,
        item.campo_condicional || null, item.operador_condicional || null, item.valor_condicional ?? null,
        Number(item.ordem || 0), item.ativo !== false]);
    }

    await client.query(`
      INSERT INTO kits_documentais (id, formulario_id, nome, descricao, ordem, ativo)
      SELECT 'kit-legado-' || c.id, c.id, 'Kit documental principal', 'Migrado de documentos_solicitados', 1, TRUE
      FROM cadastros_formularios c
      WHERE c.tipo_cadastro = 'formulario' AND jsonb_array_length(c.documentos_solicitados) > 0
        AND NOT EXISTS (SELECT 1 FROM kits_documentais k WHERE k.formulario_id = c.id);

      INSERT INTO itens_kit_documental
        (id, kit_id, identificador, titulo, descricao, tipo, obrigatorio, url_template, ordem, ativo)
      SELECT 'item-legado-' || c.id || '-' || elemento.ordem,
        'kit-legado-' || c.id,
        COALESCE(elemento.item->>'id', 'item-' || elemento.ordem),
        COALESCE(elemento.item->>'nome', 'Documento'), COALESCE(elemento.item->>'info', ''),
        CASE WHEN elemento.item->>'tipo' = 'formulario' THEN 'gerado' ELSE 'upload' END,
        COALESCE((elemento.item->>'obrigatorio')::boolean, TRUE), COALESCE(elemento.item->>'url_template', ''),
        elemento.ordem::integer, TRUE
      FROM cadastros_formularios c
      CROSS JOIN LATERAL jsonb_array_elements(c.documentos_solicitados) WITH ORDINALITY AS elemento(item, ordem)
      WHERE EXISTS (SELECT 1 FROM kits_documentais k WHERE k.id = 'kit-legado-' || c.id)
      ON CONFLICT (id) DO NOTHING;

      ALTER TABLE cadastros_formularios DROP COLUMN documentos_solicitados;
      DROP TABLE IF EXISTS documentos_cadastro;
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
