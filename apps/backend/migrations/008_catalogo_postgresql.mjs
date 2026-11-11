import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const lerJson = (root, nome) => JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));

export async function executar(pool, root) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cadastros_formularios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('Projetos', 'Programa de Apoio')),
      tipo_cadastro TEXT NOT NULL DEFAULT 'formulario' CHECK (tipo_cadastro IN ('formulario', 'documento')),
      linha_apoio_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('Aberto', 'Fechado')),
      normas TEXT NOT NULL DEFAULT '',
      periodos_submissao JSONB NOT NULL DEFAULT '[]'::jsonb,
      documentos_solicitados JSONB NOT NULL DEFAULT '[]'::jsonb,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      habilitado BOOLEAN NOT NULL DEFAULT TRUE,
      nseq INTEGER NOT NULL DEFAULT 0,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS documentos_cadastro (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL DEFAULT '',
      template_url TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cadastros_formularios_nome ON cadastros_formularios (nome);
    CREATE INDEX IF NOT EXISTS idx_cadastros_formularios_tipo ON cadastros_formularios (tipo_cadastro, active);
  `);

  await pool.query('ALTER TABLE cadastros_formularios ADD COLUMN IF NOT EXISTS nseq INTEGER NOT NULL DEFAULT 0');
  await pool.query('ALTER TABLE cadastros_formularios ADD COLUMN IF NOT EXISTS habilitado BOOLEAN NOT NULL DEFAULT TRUE');

  await pool.query(`ALTER TABLE cadastros_formularios
    ADD COLUMN IF NOT EXISTS tipo_cadastro TEXT NOT NULL DEFAULT 'formulario'`);

  // A definição acima é mantida apenas para permitir a evolução de bancos antigos.
  // Depois da normalização, impede que a tabela substituída reapareça a cada inicialização.
  const catalogoNormalizado = await pool.query(
    "SELECT 1 FROM schema_migrations WHERE version = '014_normalizar_kits_documentais'",
  );
  if (catalogoNormalizado.rowCount) await pool.query('DROP TABLE IF EXISTS documentos_cadastro');

  const versaoImportacao = '008_importacao_sqlite_catalogo';
  const importacaoAplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versaoImportacao]);
  if (!importacaoAplicada.rowCount) {
    const caminhoSqlite = process.env.LEGACY_SQLITE_PATH || path.join(root, 'database', 'fealqflow.db');
    if (fs.existsSync(caminhoSqlite)) {
      const sqlite = new DatabaseSync(caminhoSqlite, { readOnly: true });
      const colunas = sqlite.prepare("PRAGMA table_info('cadastros_formularios')").all().map((coluna) => coluna.name);
      if (colunas.includes('id') && colunas.includes('tipo_cadastro')) {
        const registros = sqlite.prepare('SELECT * FROM cadastros_formularios').all();
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          for (const registro of registros) {
            const periodos = parseJsonSeguro(registro.periodos_submissao, []);
            const documentos = parseJsonSeguro(registro.documentos_solicitados, []);
            await client.query(`
              INSERT INTO cadastros_formularios
                (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados, active)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10)
              ON CONFLICT (id) DO NOTHING
            `, [registro.id, registro.nome, registro.tipo, normalizarTipoCadastro(registro.tipo_cadastro),
              registro.linha_apoio_id || '', registro.status, registro.normas || '', JSON.stringify(periodos),
              JSON.stringify(documentos), registro.active !== 0]);
          }
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versaoImportacao]);
          await client.query('COMMIT');
        } catch (erro) {
          await client.query('ROLLBACK');
          throw erro;
        } finally {
          client.release();
          sqlite.close();
        }
      } else {
        sqlite.close();
        throw new Error('O banco SQLite legado não contém o esquema esperado para os formulários.');
      }
    } else {
      await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versaoImportacao]);
    }
  }

  const versao = '009_catalogo_postgresql';
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const registros = lerJson(root, 'cadastros_formularios.json').map((item) => ({
    id: item.id,
    nome: item.nome,
    tipo: item.tipo,
    tipoCadastro: normalizarTipoCadastro(item.tipo_cadastro),
    linhaApoioId: item.linha_apoio_id,
    status: item.status,
    normas: item.normas,
    periodos: item.periodos_submissao || [],
    documentos: item.documentos_solicitados || [],
  }));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of registros) {
      await client.query(`
        INSERT INTO cadastros_formularios
          (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
        ON CONFLICT (id) DO NOTHING
      `, [item.id, item.nome, item.tipo, item.tipoCadastro, item.linhaApoioId, item.status,
        item.normas, JSON.stringify(item.periodos), JSON.stringify(item.documentos)]);
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

const parseJsonSeguro = (valor, fallback) => {
  if (typeof valor !== 'string') return valor ?? fallback;
  try { return JSON.parse(valor); } catch { return fallback; }
};

const normalizarTipoCadastro = (valor) => {
  const tipo = String(valor || 'formulario').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return tipo === 'documento' ? 'documento' : 'formulario';
};
