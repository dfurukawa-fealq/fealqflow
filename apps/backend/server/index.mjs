import 'dotenv/config';
import express from 'express';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { executar as criarBasePostgreSQL } from '../migrations/00_database_create.mjs';
import { executar as executarCatalogoPostgreSQL } from '../migrations/008_catalogo_postgresql.mjs';
import { executar as executarAutenticacao } from '../migrations/010_autenticacao_admin.mjs';
import { hashPassword, verifyPassword } from './passwords.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Configure DATABASE_URL para iniciar o backend PostgreSQL.');

const resultadoBootstrap = await criarBasePostgreSQL(databaseUrl);
console.info(`Banco PostgreSQL ${resultadoBootstrap.criada ? 'criado' : 'já existente'}: ${resultadoBootstrap.nome}`);

const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});
pool.on('error', () => console.error('Falha inesperada em uma conexão PostgreSQL ociosa.'));

try {
  await pool.query('SELECT 1');
  await executarCatalogoPostgreSQL(pool, root);
  await executarAutenticacao(pool);
} catch (erro) {
  await pool.end();
  console.error('Falha ao conectar ou migrar o PostgreSQL. Verifique acesso, permissões e migrations.');
  throw erro;
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return next();
});
app.use(express.json({ limit: '2mb' }));
app.use('/templates', express.static(path.join(root, 'template')));

const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const nomeCookieSessao = 'fealqflow_admin';
const duracaoSessaoMs = 12 * 60 * 60 * 1000;
const cookieSecure = process.env.COOKIE_SECURE === 'true'
  || (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production');
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const lerTokenCookie = (request) => {
  const cookies = request.headers.cookie?.split(';') || [];
  const cookie = cookies.map((item) => item.trim()).find((item) => item.startsWith(`${nomeCookieSessao}=`));
  return cookie?.slice(nomeCookieSessao.length + 1) || '';
};
const definirCookieSessao = (response, token, maxAgeSeconds = Math.floor(duracaoSessaoMs / 1000)) => {
  const partes = [`${nomeCookieSessao}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`];
  if (cookieSecure) partes.push('Secure');
  response.append('Set-Cookie', partes.join('; '));
};
const validarOrigem = (request, response, next) => {
  const origem = request.get('origin');
  let corresponde = false;
  try {
    const host = request.get('x-forwarded-host') || request.get('host');
    corresponde = Boolean(origem) && new URL(origem).origin === `${request.protocol}://${host}`;
  } catch {
    corresponde = false;
  }
  if (!corresponde) return response.status(403).json({ error: 'Origem da requisição inválida.' });
  return next();
};
const buscarSessao = async (request) => {
  const token = lerTokenCookie(request);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.role, s.id AS session_id
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > CURRENT_TIMESTAMP
      AND s.revoked_at IS NULL AND u.is_active = TRUE
  `, [hashToken(token)]);
  if (!rows[0]) return null;
  await pool.query('UPDATE user_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1', [rows[0].session_id]);
  return { id: rows[0].id, sessionId: rows[0].session_id, username: rows[0].username, role: rows[0].role };
};
const exigirAdmin = (request, response, next) => {
  buscarSessao(request).then((usuario) => {
    if (!usuario || usuario.role !== 'admin') return response.status(401).json({ error: 'Autenticação administrativa necessária.' });
    request.usuarioAutenticado = usuario;
    return next();
  }).catch(next);
};
const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const serializar = (row) => ({
  id: row.id,
  nome: row.nome,
  area: row.area || row.tipo,
  tipo: row.tipo_cadastro || 'Formulário',
  linhaApoioId: row.linha_apoio_id,
  status: row.status,
  normas: row.normas,
  periodosSubmissao: parseJson(row.periodos_submissao, []),
  documentosSolicitados: parseJson(row.documentos_solicitados, []),
  active: Boolean(row.active),
});

const normalizarChaveDocumento = (nome) => nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
const chaveComparacaoDocumento = (nome) => normalizarChaveDocumento(nome).replace(/[^\p{L}\p{N}]/gu, '');
const validarId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(id);

const validar = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON inválido.';
  if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.length > 200) return 'Nome inválido (máximo 200 caracteres).';
  if (!['Projetos', 'Programa de Apoio'].includes(body.area)) return 'Área inválida.';
  if (!['Formulário', 'Documento'].includes(body.tipo)) return 'Tipo inválido.';
  if (body.tipo === 'Formulário' && (typeof body.linhaApoioId !== 'string' || !body.linhaApoioId.trim() || body.linhaApoioId.length > 120)) return 'Linha de apoio inválida.';
  if (!['Aberto', 'Fechado'].includes(body.status)) return 'Status inválido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID inválido.';
  if (body.normas !== undefined && (typeof body.normas !== 'string' || body.normas.length > 500000)) return 'Texto de regras inválido ou grande demais.';
  if (body.active !== undefined && typeof body.active !== 'boolean') return 'Status de ativação inválido.';
  if (body.periodosSubmissao !== undefined && (!Array.isArray(body.periodosSubmissao) || body.periodosSubmissao.length > 100)) return 'Calendário inválido.';
  if (body.documentosSolicitados !== undefined && (!Array.isArray(body.documentosSolicitados) || body.documentosSolicitados.length > 200)) return 'Lista de documentos inválida.';
  for (const periodo of body.periodosSubmissao || []) {
    if (!periodo || typeof periodo !== 'object' || !validarId(periodo.id)
      || typeof periodo.dataInicio !== 'string' || periodo.dataInicio.length > 30
      || typeof periodo.dataFim !== 'string' || periodo.dataFim.length > 30
      || !['Aberto', 'Fechado'].includes(periodo.status)) return 'Período de submissão inválido.';
  }
  for (const documento of body.documentosSolicitados || []) {
    if (!documento || typeof documento !== 'object' || !validarId(documento.id)
      || typeof documento.nome !== 'string' || documento.nome.length > 200
      || (documento.info !== undefined && (typeof documento.info !== 'string' || documento.info.length > 500000))
      || (documento.url_template !== undefined && (typeof documento.url_template !== 'string' || documento.url_template.length > 2048))) return 'Documento solicitado inválido.';
  }
  return null;
};

const validarDocumento = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON inválido.';
  if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.length > 200) return 'Nome inválido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID inválido.';
  if (body.descricao !== undefined && (typeof body.descricao !== 'string' || body.descricao.length > 500000)) return 'Descrição inválida ou grande demais.';
  if (body.template_url !== undefined && (typeof body.template_url !== 'string' || body.template_url.length > 2048)) return 'URL de modelo inválida.';
  if (body.active !== undefined && typeof body.active !== 'boolean') return 'Status de ativação inválido.';
  return null;
};

const hashSenhaFicticia = await hashPassword(randomBytes(32).toString('hex'));
const usuarioPublico = (usuario) => ({ id: usuario.id, username: usuario.username, role: usuario.role });

app.post('/api/auth/login', validarOrigem, asyncRoute(async (request, response) => {
  const username = typeof request.body?.username === 'string' ? request.body.username.trim().toLocaleLowerCase('pt-BR') : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!username || username.length > 120 || Buffer.byteLength(password, 'utf8') > 1024) {
    return response.status(400).json({ error: 'Usuário ou senha inválidos.' });
  }

  const chaveTentativa = hashToken(`${request.ip}\0${username}`);
  await pool.query("DELETE FROM auth_login_attempts WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL '1 day'");
  const bloqueio = await pool.query(`
    SELECT blocked_until > CURRENT_TIMESTAMP AS bloqueado
    FROM auth_login_attempts WHERE key_hash = $1
  `, [chaveTentativa]);
  if (bloqueio.rows[0]?.bloqueado) {
    return response.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
  }

  const resultadoUsuario = await pool.query(
    'SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1',
    [username],
  );
  const usuario = resultadoUsuario.rows[0];
  const senhaCorreta = await verifyPassword(password, usuario?.password_hash || hashSenhaFicticia);
  if (!usuario || !usuario.is_active || usuario.role !== 'admin' || !senhaCorreta) {
    const tentativa = await pool.query(`
      INSERT INTO auth_login_attempts (key_hash, failures, window_started_at, updated_at)
      VALUES ($1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (key_hash) DO UPDATE SET
        failures = CASE
          WHEN auth_login_attempts.window_started_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN 1
          ELSE auth_login_attempts.failures + 1
        END,
        window_started_at = CASE
          WHEN auth_login_attempts.window_started_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN CURRENT_TIMESTAMP
          ELSE auth_login_attempts.window_started_at
        END,
        blocked_until = CASE
          WHEN (CASE WHEN auth_login_attempts.window_started_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
            THEN 1 ELSE auth_login_attempts.failures + 1 END) >= 5
            THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
          ELSE NULL
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING failures, blocked_until > CURRENT_TIMESTAMP AS bloqueado
    `, [chaveTentativa]);
    if (tentativa.rows[0]?.bloqueado) {
      return response.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
    }
    return response.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  const token = randomBytes(32).toString('base64url');
  const expiracao = new Date(Date.now() + duracaoSessaoMs);
  await pool.query('DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP OR revoked_at IS NOT NULL');
  await pool.query('INSERT INTO user_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [
    randomUUID(), usuario.id, hashToken(token), expiracao,
  ]);
  await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [usuario.id]);
  await pool.query('DELETE FROM auth_login_attempts WHERE key_hash = $1', [chaveTentativa]);
  definirCookieSessao(response, token);
  return response.json({ user: usuarioPublico(usuario) });
}));

app.get('/api/auth/me', asyncRoute(async (request, response) => {
  const usuario = await buscarSessao(request);
  if (!usuario) definirCookieSessao(response, '', 0);
  return response.json({ user: usuario ? usuarioPublico(usuario) : null });
}));

app.post('/api/auth/logout', validarOrigem, asyncRoute(async (request, response) => {
  const token = lerTokenCookie(request);
  if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
    await pool.query('UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(token)]);
  }
  definirCookieSessao(response, '', 0);
  return response.status(204).send();
}));

app.post('/api/auth/change-password', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const senhaAtual = typeof request.body?.senhaAtual === 'string' ? request.body.senhaAtual : '';
  const novaSenha = typeof request.body?.novaSenha === 'string' ? request.body.novaSenha : '';
  if (Buffer.byteLength(senhaAtual, 'utf8') > 1024 || Buffer.byteLength(novaSenha, 'utf8') > 1024
    || [...novaSenha].length < 12) {
    return response.status(400).json({ error: 'A nova senha deve ter pelo menos 12 caracteres.' });
  }

  const usuario = await pool.query('SELECT password_hash FROM users WHERE id = $1 AND is_active = TRUE', [request.usuarioAutenticado.id]);
  if (!usuario.rows[0] || !(await verifyPassword(senhaAtual, usuario.rows[0].password_hash))) {
    return response.status(401).json({ error: 'A senha atual não confere.' });
  }

  const novoHash = await hashPassword(novaSenha);
  const novoToken = randomBytes(32).toString('base64url');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [novoHash, request.usuarioAutenticado.id]);
    await client.query(`
      UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL
    `, [request.usuarioAutenticado.id, request.usuarioAutenticado.sessionId]);
    await client.query(`
      UPDATE user_sessions SET token_hash = $1, created_at = CURRENT_TIMESTAMP,
        expires_at = $2, last_seen_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND revoked_at IS NULL
    `, [hashToken(novoToken), new Date(Date.now() + duracaoSessaoMs), request.usuarioAutenticado.sessionId]);
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }

  definirCookieSessao(response, novoToken);
  return response.json({ ok: true });
}));

const buscarDocumentosPrincipais = async () => {
  const { rows } = await pool.query("SELECT * FROM cadastros_formularios WHERE tipo_cadastro = 'Documento'");
  return rows;
};

const buscarDocumentoPrincipal = async (id, nome) => {
  const documentos = await buscarDocumentosPrincipais();
  const chave = nome ? chaveComparacaoDocumento(nome) : '';
  return documentos.find((documento) => documento.id === id)
    || documentos.find((documento) => chave && chaveComparacaoDocumento(documento.nome) === chave);
};

const salvarDocumentoPrincipal = async (id, documento, existente) => {
  const idPrincipal = existente?.id || id;
  const nome = documento.nome.trim();
  const atual = existente ? parseJson(existente.documentos_solicitados, [])[0] : undefined;
  const conteudo = [{
    id: idPrincipal,
    nome,
    info: documento.descricao ?? atual?.info ?? '',
    url_template: documento.template_url ?? atual?.url_template ?? '',
  }];
  const { rows } = await pool.query(`
    INSERT INTO cadastros_formularios
      (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados, active)
    VALUES ($1, $2, $3, 'Documento', '', 'Fechado', '', '[]'::jsonb, $4::jsonb, TRUE)
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome, tipo_cadastro = 'Documento', documentos_solicitados = EXCLUDED.documentos_solicitados,
      active = TRUE, atualizado_em = CURRENT_TIMESTAMP
    RETURNING *
  `, [idPrincipal, nome, existente?.tipo || 'Projetos', JSON.stringify(conteudo)]);
  return rows[0];
};

app.get('/api/health', asyncRoute(async (_request, response) => {
  await pool.query('SELECT 1');
  return response.json({ ok: true, database: 'available', engine: 'postgresql' });
}));

app.get('/api/documentos', asyncRoute(async (_request, response) => {
  const { rows } = await pool.query("SELECT * FROM cadastros_formularios WHERE tipo_cadastro = 'Documento' AND active = TRUE ORDER BY nome");
  return response.json(rows.map((row) => {
    const doc = parseJson(row.documentos_solicitados, [])[0] || {};
    return { id: row.id, nome: row.nome, descricao: doc.info || '', template_url: doc.url_template || '', active: Boolean(row.active) };
  }));
}));

app.post('/api/documentos', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarDocumento(request.body);
  if (error) return response.status(400).json({ error });
  const id = request.body.id || randomUUID();
  const registro = await pool.query('SELECT tipo_cadastro FROM cadastros_formularios WHERE id = $1', [id]);
  if (registro.rowCount && registro.rows[0].tipo_cadastro !== 'Documento') return response.status(409).json({ error: 'O ID pertence a outro tipo de cadastro.' });
  const existente = await buscarDocumentoPrincipal(id);
  if (existente) return response.status(409).json({ error: 'Documento já cadastrado; use PUT para editar.' });
  const mesmoNome = (await buscarDocumentosPrincipais()).find((documento) =>
    documento.active && chaveComparacaoDocumento(documento.nome) === chaveComparacaoDocumento(request.body.nome));
  if (mesmoNome) return response.status(409).json({ error: 'Já existe um documento com este nome. Edite o cadastro existente.' });
  const row = await salvarDocumentoPrincipal(id, request.body, existente);
  const doc = parseJson(row.documentos_solicitados, [])[0] || {};
  return response.status(201).json({ id: row.id, nome: row.nome, descricao: doc.info || '', template_url: doc.url_template || '', active: Boolean(row.active) });
}));

app.put('/api/documentos/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarDocumento(request.body);
  if (error) return response.status(400).json({ error });
  if (!validarId(request.params.id) || (request.body.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const existente = await buscarDocumentoPrincipal(request.params.id);
  if (!existente) return response.status(404).json({ error: 'Documento não encontrado no catálogo principal.' });
  const chaveNome = chaveComparacaoDocumento(request.body.nome);
  const mesmoNome = (await buscarDocumentosPrincipais()).find((documento) =>
    documento.active && documento.id !== existente.id && chaveComparacaoDocumento(documento.nome) === chaveNome);
  if (mesmoNome) return response.status(409).json({ error: 'Já existe outro documento com este nome.' });
  const row = await salvarDocumentoPrincipal(existente.id, request.body, existente);
  const doc = parseJson(row.documentos_solicitados, [])[0] || {};
  return response.json({ id: row.id, nome: row.nome, descricao: doc.info || '', template_url: doc.url_template || '', active: Boolean(row.active) });
}));

app.delete('/api/documentos/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const existente = await buscarDocumentoPrincipal(request.params.id);
  if (!existente) return response.status(404).json({ error: 'Documento não encontrado no catálogo principal.' });
  await pool.query('UPDATE cadastros_formularios SET active = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [existente.id]);
  return response.status(204).send();
}));

app.get('/api/formularios', asyncRoute(async (_request, response) => {
  const { rows } = await pool.query('SELECT * FROM cadastros_formularios ORDER BY nome');
  return response.json(rows.map(serializar));
}));

app.post('/api/formularios', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  const id = request.body.id || randomUUID();
  const documentos = request.body.documentosSolicitados || [{
    id, nome: request.body.nome, info: request.body.descricao || '', url_template: request.body.template_url || '',
  }];
  try {
    const { rows } = await pool.query(`
      INSERT INTO cadastros_formularios
        (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
      RETURNING *
    `, [id, request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []), JSON.stringify(documentos)]);
    return response.status(201).json(serializar(rows[0]));
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'Este ID já existe; use PUT para atualizar o cadastro.' });
    throw erro;
  }
}));

app.put('/api/formularios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  if (!validarId(request.params.id) || (request.body.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rows } = await pool.query(`
    UPDATE cadastros_formularios SET
      nome = $1, tipo = $2, tipo_cadastro = $3, linha_apoio_id = $4, status = $5, normas = $6,
      periodos_submissao = $7::jsonb, documentos_solicitados = $8::jsonb,
      active = $9, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `, [request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
    request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []),
    JSON.stringify(request.body.documentosSolicitados || []), request.body.active !== false, request.params.id]);
  if (!rows[0]) return response.status(404).json({ error: 'Formulário não encontrado.' });
  return response.json(serializar(rows[0]));
}));

app.delete('/api/formularios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rowCount } = await pool.query('UPDATE cadastros_formularios SET active = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [request.params.id]);
  if (!rowCount) return response.status(404).json({ error: 'Formulário não encontrado.' });
  return response.status(204).send();
}));

app.use('/api', (_request, response) => response.status(404).json({ error: 'Rota da API não encontrada.' }));
app.use(express.static(path.join(root, 'dist')));
app.get('*', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));
app.use((erro, _request, response, _next) => {
  const status = Number.isInteger(erro?.status) && erro.status >= 400 && erro.status < 500 ? erro.status : 500;
  if (status === 500) console.error('Falha interna na API:', erro?.code || 'erro desconhecido');
  const mensagem = status === 413 ? 'Requisição grande demais.' : status === 400 ? 'JSON inválido.' : 'Erro interno do servidor.';
  return response.status(status).json({ error: mensagem });
});

const port = Number(process.env.API_PORT || 3333);
const servidor = app.listen(port, () => console.log(`FealqFlow API disponível na porta ${port} (PostgreSQL).`));
const encerrar = () => servidor.close(async () => {
  await pool.end();
  process.exit(0);
});
process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
