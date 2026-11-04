import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executar as executarCatalogoJson } from '../../../database/migrations/004_catalogo_formularios_json.mjs';
import { executar as executarCalendarioFormularios } from '../../../database/migrations/005_vincular_calendario_formularios.mjs';
import { executar as executarCatalogoProjetos } from '../../../database/migrations/006_completar_catalogo_projetos.mjs';
import { executar as executarUnificarDocumentos } from '../../../database/migrations/007_unificar_documentos_cadastro.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const databaseUrl = process.env.DATABASE_URL || 'file:/app/database/fealqflow.db';
const databasePath = databaseUrl.startsWith('file:') ? databaseUrl.slice(5) : databaseUrl;
const databaseDirectory = path.dirname(databasePath);
fs.mkdirSync(databaseDirectory, { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(`
  CREATE TABLE IF NOT EXISTS cadastros_formularios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Projetos', 'Programa de Apoio')),
    linha_apoio_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Aberto', 'Fechado')),
    normas TEXT NOT NULL DEFAULT '',
    periodos_submissao TEXT NOT NULL DEFAULT '[]',
    documentos_solicitados TEXT NOT NULL DEFAULT '[]',
    active INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS documentos_cadastro (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    template_url TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
try { database.exec("ALTER TABLE cadastros_formularios ADD COLUMN tipo_cadastro TEXT NOT NULL DEFAULT 'FormulÃ¡rio'"); } catch {}
executarCatalogoJson(database, root);
executarCalendarioFormularios(database, root);
executarCatalogoProjetos(database, root);
executarUnificarDocumentos(database);

const app = express();
app.use((_request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (_request.method === 'OPTIONS') return response.sendStatus(204);
  return next();
});
app.use(express.json({ limit: '2mb' }));
app.use('/templates', express.static(path.join(root, 'template')));

const parseJson = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};

const serializar = (row) => ({
  id: row.id,
  nome: row.nome,
  area: row.area || row.tipo,
  tipo: row.tipo_cadastro || 'FormulÃ¡rio',
  linhaApoioId: row.linha_apoio_id,
  status: row.status,
  normas: row.normas,
  periodosSubmissao: parseJson(row.periodos_submissao, []),
  documentosSolicitados: parseJson(row.documentos_solicitados, []),
  active: Boolean(row.active),
});

const normalizarChaveDocumento = (nome) => nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');

const validar = (body) => {
  if (!body.nome?.trim()) return 'Nome do formulÃ¡rio Ã© obrigatÃ³rio.';
  if (!['Projetos', 'Programa de Apoio'].includes(body.area)) return 'Ãrea invÃ¡lida.';
  if (!['FormulÃ¡rio', 'Documento'].includes(body.tipo)) return 'Tipo invÃ¡lido.';
  if (body.tipo === 'FormulÃ¡rio' && !body.linhaApoioId?.trim()) return 'Linha de apoio Ã© obrigatÃ³ria.';
  if (!['Aberto', 'Fechado'].includes(body.status)) return 'Status invÃ¡lido.';
  return null;
};

app.get('/api/health', (_request, response) => response.json({ ok: true }));

const buscarDocumentoPrincipal = (id, nome) => {
  const documentos = database.prepare("SELECT * FROM cadastros_formularios WHERE tipo_cadastro = 'Documento'").all();
  const chave = nome ? normalizarChaveDocumento(nome).replace(/[^\p{L}\p{N}]/gu, '') : '';
  return documentos.find((documento) => documento.id === id)
    || documentos.find((documento) => chave && normalizarChaveDocumento(documento.nome).replace(/[^\p{L}\p{N}]/gu, '') === chave);
};

const salvarDocumentoPrincipal = (id, documento, existente) => {
  const idPrincipal = existente?.id || id;
  const nome = documento.nome.trim();
  const atual = existente ? parseJson(existente.documentos_solicitados, [])[0] : undefined;
  const conteudo = [{
    id: idPrincipal,
    nome,
    info: documento.descricao ?? atual?.info ?? '',
    url_template: documento.template_url ?? atual?.url_template ?? '',
  }];
  database.prepare(`INSERT INTO cadastros_formularios
    (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados, active)
    VALUES (?, ?, ?, 'Documento', '', 'Fechado', '', '[]', ?, 1)
    ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, tipo_cadastro = 'Documento',
      documentos_solicitados = excluded.documentos_solicitados, active = 1, atualizado_em = CURRENT_TIMESTAMP`)
    .run(idPrincipal, nome, existente?.tipo || 'Projetos', JSON.stringify(conteudo));
  return database.prepare('SELECT * FROM cadastros_formularios WHERE id = ?').get(idPrincipal);
};

app.get('/api/documentos', (_request, response) => {
  const rows = database.prepare("SELECT * FROM cadastros_formularios WHERE tipo_cadastro = 'Documento' AND active = 1 ORDER BY nome").all();
  response.json(rows.map((row) => {
    const doc = parseJson(row.documentos_solicitados, [])[0] || {};
    return { id: row.id, nome: row.nome, descricao: doc.info || '', template_url: doc.url_template || '', active: Boolean(row.active) };
  }));
});

app.post('/api/documentos', (request, response) => {
  if (!request.body.nome?.trim()) return response.status(400).json({ error: 'Nome do documento é obrigatório.' });
  const id = request.body.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const existente = buscarDocumentoPrincipal(id, request.body.nome);
  if (!existente) {
    const mesmoNome = database.prepare("SELECT nome FROM cadastros_formularios WHERE tipo_cadastro = 'Documento' AND active = 1").all()
      .find((documento) => normalizarChaveDocumento(documento.nome).replace(/[^\p{L}\p{N}]/gu, '') === normalizarChaveDocumento(request.body.nome).replace(/[^\p{L}\p{N}]/gu, ''));
    if (mesmoNome) return response.status(409).json({ error: 'Já existe um documento com este nome. Edite o cadastro existente.' });
  }
  const row = salvarDocumentoPrincipal(id, request.body, existente);
  return response.status(existente ? 200 : 201).json({ id: row.id, nome: row.nome, descricao: parseJson(row.documentos_solicitados, [])[0]?.info || '', template_url: parseJson(row.documentos_solicitados, [])[0]?.url_template || '', active: Boolean(row.active) });
});

app.put('/api/documentos/:id', (request, response) => {
  if (!request.body.nome?.trim()) return response.status(400).json({ error: 'Nome do documento é obrigatório.' });
  const existente = buscarDocumentoPrincipal(request.params.id, request.body.nome);
  if (!existente) return response.status(404).json({ error: 'Documento não encontrado no catálogo principal.' });
  const row = salvarDocumentoPrincipal(existente.id, request.body, existente);
  return response.json({ id: row.id, nome: row.nome, descricao: parseJson(row.documentos_solicitados, [])[0]?.info || '', template_url: parseJson(row.documentos_solicitados, [])[0]?.url_template || '', active: Boolean(row.active) });
});

app.delete('/api/documentos/:id', (request, response) => {
  let existente = buscarDocumentoPrincipal(request.params.id);
  if (!existente) {
    const legado = database.prepare('SELECT nome FROM documentos_cadastro WHERE id = ?').get(request.params.id);
    if (legado) existente = buscarDocumentoPrincipal('', legado.nome);
  }
  if (!existente) return response.status(404).json({ error: 'Documento não encontrado no catálogo principal.' });
  database.prepare('UPDATE cadastros_formularios SET active = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').run(existente.id);
  return response.status(204).send();
});
app.get('/api/formularios', (_request, response) => {
  const rows = database.prepare('SELECT * FROM cadastros_formularios ORDER BY nome').all();
  response.json(rows.map(serializar));
});

app.post('/api/formularios', (request, response) => {
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  const id = request.body.id || `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  database.prepare(`INSERT INTO cadastros_formularios
    (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, tipo = excluded.tipo,
      tipo_cadastro = excluded.tipo_cadastro, linha_apoio_id = excluded.linha_apoio_id,
      status = excluded.status, normas = excluded.normas,
      periodos_submissao = excluded.periodos_submissao,
      documentos_solicitados = excluded.documentos_solicitados, active = 1,
      atualizado_em = CURRENT_TIMESTAMP`)
    .run(id, request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []),
      JSON.stringify(request.body.documentosSolicitados || [{ id, nome: request.body.nome, info: request.body.descricao || '', url_template: request.body.template_url || '' }]));
  const row = database.prepare('SELECT * FROM cadastros_formularios WHERE id = ?').get(id);
  return response.status(201).json(serializar(row));
});

app.put('/api/formularios/:id', (request, response) => {
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  const result = database.prepare(`UPDATE cadastros_formularios SET
    nome = ?, tipo = ?, tipo_cadastro = ?, linha_apoio_id = ?, status = ?, normas = ?,
    periodos_submissao = ?, documentos_solicitados = ?, active = ?, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?`).run(
      request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []),
      JSON.stringify(request.body.documentosSolicitados || []), request.body.active === false ? 0 : 1, request.params.id,
    );
  if (result.changes === 0) return response.status(404).json({ error: 'FormulÃ¡rio nÃ£o encontrado.' });
  const row = database.prepare('SELECT * FROM cadastros_formularios WHERE id = ?').get(request.params.id);
  return response.json(serializar(row));
});

app.delete('/api/formularios/:id', (request, response) => {
  const result = database.prepare('UPDATE cadastros_formularios SET active = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').run(request.params.id);
  if (result.changes === 0) return response.status(404).json({ error: 'FormulÃ¡rio nÃ£o encontrado.' });
  return response.status(204).send();
});

// Standalone: a API tambÃ©m entrega o build da SPA para uso no Portainer.
app.use(express.static(path.join(root, 'dist')));
app.get('*', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));

const port = Number(process.env.API_PORT || 3333);
app.listen(port, () => console.log(`FealqFlow API disponÃ­vel em http://localhost:${port}`));
