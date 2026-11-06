import 'dotenv/config';
import express from 'express';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { executar as criarBasePostgreSQL } from '../migrations/00_database_create.mjs';
import { executar as executarCatalogoPostgreSQL } from '../migrations/008_catalogo_postgresql.mjs';
import { executar as executarAutenticacao } from '../migrations/010_autenticacao_admin.mjs';
import { executarProcessos } from '../migrations/011_processos.mjs';
import { executar as executarPerfisTenants } from '../migrations/012_perfis_tenants.mjs';
import { hashPassword, verifyPassword } from './passwords.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const pastaAnexos = process.env.UPLOAD_DIR || path.join(root, 'uploads');
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
  await executarPerfisTenants(pool);
  await executarProcessos(pool);
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
// Em HTTP local/rede interna, o cookie não pode ter Secure. Em produção com HTTPS,
// configure COOKIE_SECURE=true na stack.
const cookieSecure = process.env.COOKIE_SECURE === 'true';
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
    SELECT u.id, u.username, u.role, u.perfil, u.tenant, s.id AS session_id
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > CURRENT_TIMESTAMP
      AND s.revoked_at IS NULL AND u.is_active = TRUE
  `, [hashToken(token)]);
  if (!rows[0]) return null;
  await pool.query('UPDATE user_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1', [rows[0].session_id]);
  return {
    id: rows[0].id,
    sessionId: rows[0].session_id,
    username: rows[0].username,
    role: rows[0].role,
    perfil: rows[0].perfil,
    tenant: rows[0].tenant,
  };
};
const exigirSessao = (request, response, next) => {
  buscarSessao(request).then((usuario) => {
    if (!usuario) return response.status(401).json({ error: 'Autenticação necessária.' });
    request.usuarioAutenticado = usuario;
    return next();
  }).catch(next);
};
const exigirAdmin = (request, response, next) => {
  buscarSessao(request).then((usuario) => {
    if (!usuario || usuario.role !== 'admin') return response.status(401).json({ error: 'Autenticação administrativa necessária.' });
    request.usuarioAutenticado = usuario;
    return next();
  }).catch(next);
};
const escopoDoUsuario = (usuario) => usuario?.role === 'admin' || usuario?.perfil === 'admin' || usuario?.tenant === 'global'
  ? null
  : usuario?.tenant || usuario?.perfil || null;
const usuarioPodeAcessarCategoria = (usuario, categoria) => {
  const escopo = escopoDoUsuario(usuario);
  return !escopo || escopo === categoria;
};
const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};
const normalizarCaminhoTemplate = (caminho) => typeof caminho === 'string'
  ? caminho.trim().replace(/^\/?template\//i, '/templates/')
  : '';
const normalizarDocumentosSolicitados = (valor) => {
  const documentos = parseJson(valor, []);
  if (!Array.isArray(documentos)) return [];
  return documentos.filter((documento) => documento && typeof documento === 'object').map((documento) => ({
    ...documento,
    tipo: documento.tipo === 'FormulÃ¡rio' || documento.tipo === 'Formulário' ? 'Formulário' : 'Documento',
    obrigatorio: documento.obrigatorio !== false,
    url_template: normalizarCaminhoTemplate(documento.url_template),
  }));
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
  documentosSolicitados: normalizarDocumentosSolicitados(row.documentos_solicitados),
  active: Boolean(row.active),
  habilitado: row.habilitado !== false,
  nSeq: Number(row.nseq || 0),
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
      || (documento.tipo !== undefined && !['Documento', 'FormulÃ¡rio', 'Formulário'].includes(documento.tipo))
      || (documento.obrigatorio !== undefined && typeof documento.obrigatorio !== 'boolean')
      || (documento.documentoId !== undefined && !validarId(documento.documentoId))
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
const usuarioPublico = (usuario) => ({
  id: usuario.id,
  username: usuario.username,
  role: usuario.role,
  perfil: usuario.perfil,
  tenant: usuario.tenant,
});

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
    'SELECT id, username, password_hash, role, perfil, tenant, is_active FROM users WHERE username = $1',
    [username],
  );
  const usuario = resultadoUsuario.rows[0];
  const senhaCorreta = await verifyPassword(password, usuario?.password_hash || hashSenhaFicticia);
  if (!usuario || !usuario.is_active || !['admin', 'user'].includes(usuario.role) || !senhaCorreta) {
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

app.get('/api/usuarios', exigirAdmin, asyncRoute(async (_request, response) => {
  const { rows } = await pool.query(`
    SELECT id, username, role, perfil, tenant, is_active, created_at, updated_at, last_login_at
    FROM users ORDER BY username
  `);
  return response.json(rows);
}));

app.post('/api/usuarios', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const username = typeof request.body?.username === 'string' ? request.body.username.trim().toLocaleLowerCase('pt-BR') : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const role = request.body?.role === 'user' ? 'user' : 'admin';
  const perfil = ['admin', 'projeto', 'prog_apoio'].includes(request.body?.perfil) ? request.body.perfil : 'projeto';
  const tenant = perfil === 'admin' ? 'global' : perfil;
  const confirmPassword = typeof request.body?.confirmPassword === 'string' ? request.body.confirmPassword : '';
  if (!username || username.length > 120 || [...password].length < 12 || password !== confirmPassword) {
    return response.status(400).json({ error: 'Usuário válido e senha com pelo menos 12 caracteres são obrigatórios.' });
  }
  const existente = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  if (existente.rowCount) return response.status(409).json({ error: 'Usuário já cadastrado.' });
  const hash = await hashPassword(password);
  const { rows } = await pool.query(`
    INSERT INTO users (id, username, password_hash, role, perfil, tenant, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, TRUE)
    RETURNING id, username, role, perfil, tenant, is_active, created_at, updated_at, last_login_at
  `, [randomUUID(), username, hash, role, perfil, tenant]);
  return response.status(201).json(rows[0]);
}));

app.put('/api/usuarios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const username = typeof request.body?.username === 'string' ? request.body.username.trim().toLocaleLowerCase('pt-BR') : '';
  const role = request.body?.role === 'user' ? 'user' : 'admin';
  const perfil = ['admin', 'projeto', 'prog_apoio'].includes(request.body?.perfil) ? request.body.perfil : 'projeto';
  const tenant = perfil === 'admin' ? 'global' : perfil;
  const ativo = request.body?.is_active !== false;
  if (!username || username.length > 120) return response.status(400).json({ error: 'Usuário inválido.' });
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const hash = password ? await hashPassword(password) : null;
  const { rows } = await pool.query(`
    UPDATE users SET username = $1, role = $2, perfil = $6, tenant = $7, is_active = $3,
      password_hash = COALESCE($4, password_hash), updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, username, role, perfil, tenant, is_active, created_at, updated_at, last_login_at
  `, [username, role, ativo, hash, request.params.id, perfil, tenant]);
  if (!rows[0]) return response.status(404).json({ error: 'Usuário não encontrado.' });
  return response.json(rows[0]);
}));

app.post('/api/usuarios/:id/senha', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const confirmPassword = typeof request.body?.confirmPassword === 'string' ? request.body.confirmPassword : '';
  if ([...password].length < 12 || password !== confirmPassword) {
    return response.status(400).json({ error: 'A senha deve ter pelo menos 12 caracteres e a confirmação deve coincidir.' });
  }
  const hash = await hashPassword(password);
  const resultado = await pool.query(`
    UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND is_active = TRUE RETURNING id
  `, [hash, request.params.id]);
  if (!resultado.rowCount) return response.status(404).json({ error: 'Usuário não encontrado ou inativo.' });
  return response.status(204).send();
}));

app.post('/api/auth/logout', validarOrigem, asyncRoute(async (request, response) => {
  const token = lerTokenCookie(request);
  if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
    await pool.query('UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(token)]);
  }
  definirCookieSessao(response, '', 0);
  return response.status(204).send();
}));

app.post('/api/auth/change-password', validarOrigem, exigirSessao, asyncRoute(async (request, response) => {
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

app.get('/api/processos', exigirSessao, asyncRoute(async (request, response) => {
  const filtros = [];
  const valores = [];
  const categoriaSolicitada = request.query.categoria === 'projeto' || request.query.categoria === 'apoio'
    ? request.query.categoria : null;
  const categoriaEscopo = escopoDoUsuario(request.usuarioAutenticado);
  if (categoriaSolicitada && !usuarioPodeAcessarCategoria(request.usuarioAutenticado, categoriaSolicitada)) {
    return response.status(403).json({ error: 'Seu perfil não possui acesso a esta área.' });
  }
  if (categoriaSolicitada || categoriaEscopo) {
    valores.push(categoriaSolicitada || categoriaEscopo);
    filtros.push(`p.categoria = $${valores.length}`);
  }
  if (typeof request.query.status === 'string' && request.query.status.trim()) {
    valores.push(request.query.status.trim());
    filtros.push(`p.status = $${valores.length}`);
  }
  filtros.push('p.ativo = TRUE');
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const { rows } = await pool.query(`
    SELECT p.id, p.protocolo, p.categoria, p.formulario_id, p.formulario_nome, p.formulario_rota,
      p.titulo, p.solicitante_nome, p.solicitante_email, p.status,
      p.criado_em, p.atualizado_em,
      COUNT(d.id) FILTER (WHERE d.obrigatorio)::int AS documentos_total,
      COUNT(d.id) FILTER (WHERE d.obrigatorio AND d.status IN ('enviado', 'validado'))::int AS documentos_anexados,
      COALESCE(
        json_agg(
          json_build_object(
            'id', d.id,
            'nome', d.nome,
            'obrigatorio', d.obrigatorio,
            'status', d.status,
            'arquivo_nome', d.arquivo_nome
          ) ORDER BY d.id
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'::json
      ) AS documentos
    FROM processos p
    LEFT JOIN processo_documentos d ON d.processo_id = p.id
    ${where}
    GROUP BY p.id ORDER BY p.atualizado_em DESC
  `, valores);
  return response.json(rows);
}));

app.get('/api/processos/resumo', exigirSessao, asyncRoute(async (request, response) => {
  const valores = [];
  const filtroEscopo = escopoDoUsuario(request.usuarioAutenticado);
  if (filtroEscopo) valores.push(filtroEscopo);
  const { rows } = await pool.query(`
    SELECT COUNT(*) FILTER (WHERE status IN ('rascunho', 'em_preenchimento'))::int AS iniciadas,
      COUNT(*) FILTER (WHERE status IN ('pendente', 'pronto_para_envio'))::int AS pendentes,
      COUNT(*) FILTER (WHERE status IN ('analise', 'enviado', 'aprovado', 'rejeitado', 'finalizada'))::int AS finalizadas
    FROM processos ${filtroEscopo ? 'WHERE categoria = $1' : ''}
  `, valores);
  return response.json(rows[0]);
}));

app.post('/api/processos', validarOrigem, asyncRoute(async (request, response) => {
  const body = request.body || {};
  if (!['projeto', 'apoio'].includes(body.categoria) || typeof body.formularioId !== 'string'
    || !/^[a-z0-9-]{1,120}$/.test(body.formularioId)
    || typeof body.formularioNome !== 'string' || !body.formularioNome.trim() || body.formularioNome.length > 255
    || typeof body.formularioRota !== 'string'
    || body.formularioRota.length > 255
    || !body.formularioRota.startsWith(body.categoria === 'projeto' ? '/projetos/form-' : '/programas-de-apoio/apoio-')
    || !/^\/[a-z0-9/-]+$/.test(body.formularioRota)
    || body.formularioId !== body.formularioRota.split('/').pop()
    || typeof body.chaveCriacao !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.chaveCriacao)
    || typeof body.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.token)) {
    return response.status(400).json({ error: 'Categoria e formulário são obrigatórios.' });
  }
  const usuario = await buscarSessao(request);
  if (usuario && !usuarioPodeAcessarCategoria(usuario, body.categoria)) {
    return response.status(403).json({ error: 'Seu perfil não pode iniciar processos nesta área.' });
  }
  const processoId = randomUUID();
  const token = body.token;
  const protocolo = `${body.categoria === 'apoio' ? 'APO' : 'PRJ'}-${new Date().getFullYear()}/${processoId.slice(0, 8).toUpperCase()}`;
  const { rows } = await pool.query(`
    INSERT INTO processos (id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, acesso_hash, chave_criacao)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (chave_criacao) DO NOTHING
    RETURNING id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, status, dados_json, versao, criado_em, atualizado_em
  `, [processoId, protocolo, body.categoria, body.formularioId, body.formularioNome.trim(), body.formularioRota, hashToken(token), body.chaveCriacao]);
  if (rows[0]) return response.status(201).json({ ...rows[0], token });
  const { rows: repetidos } = await pool.query(`
    SELECT id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, status,
      dados_json, versao, criado_em, atualizado_em, acesso_hash FROM processos WHERE chave_criacao = $1
  `, [body.chaveCriacao]);
  const existente = repetidos[0];
  if (!existente || existente.acesso_hash !== hashToken(token) || existente.formulario_rota !== body.formularioRota) {
    return response.status(409).json({ error: 'Tentativa de criação já utilizada.' });
  }
  const { acesso_hash: _hash, ...processo } = existente;
  return response.json({ ...processo, token });
}));

const uuidValido = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const autorizarProcesso = async (request, response, next) => {
  if (!uuidValido(request.params.id)) return response.status(400).json({ error: 'UUID inválido.' });
  const token = request.get('x-processo-token') || '';
  const { rows } = await pool.query('SELECT acesso_hash, categoria, ativo FROM processos WHERE id = $1', [request.params.id]);
  if (!rows[0]) return response.status(404).json({ error: 'Processo não encontrado.' });
  if (!rows[0].ativo) return response.status(410).json({ error: 'Processo inativado.' });
  const esperado = rows[0].acesso_hash;
  const recebido = /^[A-Za-z0-9_-]{43}$/.test(token) ? hashToken(token) : '';
  const autorizado = Boolean(esperado && recebido && esperado.length === recebido.length
    && timingSafeEqual(Buffer.from(esperado), Buffer.from(recebido)));
  if (!autorizado) {
    const usuario = await buscarSessao(request);
    if (!usuario || !usuarioPodeAcessarCategoria(usuario, rows[0].categoria)) {
      return response.status(403).json({ error: 'Acesso ao processo não autorizado.' });
    }
  }
  return next();
};

app.get('/api/processos/:id', asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { rows } = await pool.query(`
    SELECT id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota,
      titulo, solicitante_nome, solicitante_email, status, ativo, dados_json, versao, criado_em, atualizado_em, enviado_em
    FROM processos WHERE id = $1
  `, [request.params.id]);
  const { rows: documentos } = await pool.query(`
    SELECT nome AS id, arquivo_nome, status, enviado_em FROM processo_documentos WHERE processo_id = $1
  `, [request.params.id]);
  return response.json({ ...rows[0], documentos });
}));

app.post('/api/processos/inativar', validarOrigem, exigirSessao, asyncRoute(async (request, response) => {
  const ids = request.body?.ids;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some((id) => !uuidValido(id))) {
    return response.status(400).json({ error: 'Seleção de processos inválida.' });
  }
  const escopo = escopoDoUsuario(request.usuarioAutenticado);
  const valores = [ids];
  const filtroCategoria = escopo ? 'AND categoria = $2' : '';
  if (escopo) valores.push(escopo);
  const { rows } = await pool.query(`
    UPDATE processos
    SET ativo = FALSE, inativado_em = CURRENT_TIMESTAMP, inativado_por = $${valores.length + 1}, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ANY($1::uuid[]) AND ativo = TRUE ${filtroCategoria}
    RETURNING id
  `, [...valores, request.usuarioAutenticado.id]);
  return response.json({ inativados: rows.map((row) => row.id) });
}));

app.patch('/api/processos/:id', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { dados, versao } = request.body || {};
  if (!dados || typeof dados !== 'object' || Array.isArray(dados) || !Number.isInteger(versao) || versao < 0) {
    return response.status(400).json({ error: 'Dados ou versão do rascunho inválidos.' });
  }
  const { rows } = await pool.query(`
    UPDATE processos SET dados_json = $1::jsonb, versao = versao + 1,
      titulo = LEFT(COALESCE($4, titulo), 500),
      solicitante_nome = LEFT(COALESCE($5, solicitante_nome), 255),
      solicitante_email = LEFT(COALESCE($6, solicitante_email), 255),
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = $2 AND versao = $3 AND status IN ('rascunho', 'em_preenchimento')
    RETURNING id, status, dados_json, versao, atualizado_em
  `, [JSON.stringify(dados), request.params.id, versao,
    typeof request.body.titulo === 'string' ? request.body.titulo : null,
    typeof request.body.solicitanteNome === 'string' ? request.body.solicitanteNome : null,
    typeof request.body.solicitanteEmail === 'string' ? request.body.solicitanteEmail : null]);
  if (!rows[0]) return response.status(409).json({ error: 'Rascunho alterado em outra aba ou já enviado. Reabra o processo antes de continuar.' });
  return response.json(rows[0]);
}));

app.post('/api/processos/:id/enviar', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { versao } = request.body || {};
  if (!Number.isInteger(versao) || versao < 0) return response.status(400).json({ error: 'Versão inválida.' });
  const { rows: pendencias } = await pool.query(`
    SELECT COUNT(*)::int AS total FROM processo_documentos
    WHERE processo_id = $1 AND obrigatorio = TRUE AND status NOT IN ('enviado', 'validado')
  `, [request.params.id]);
  if (pendencias[0].total > 0) return response.status(409).json({ error: 'Conclua os documentos obrigatórios antes de enviar.' });
  const { rows } = await pool.query(`
    UPDATE processos SET status = 'enviado', enviado_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP,
      versao = versao + 1
    WHERE id = $1 AND versao = $2 AND status IN ('rascunho', 'em_preenchimento')
      AND NOT EXISTS (SELECT 1 FROM processo_documentos d WHERE d.processo_id = processos.id
        AND d.obrigatorio = TRUE AND d.status NOT IN ('enviado', 'validado'))
    RETURNING id, protocolo, status, versao, enviado_em
  `, [request.params.id, versao]);
  if (!rows[0]) return response.status(409).json({ error: 'Processo já enviado ou alterado em outra aba.' });
  return response.json(rows[0]);
}));

const validarCodigoDocumento = (codigo) => typeof codigo === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(codigo);
app.put('/api/processos/:id/documentos', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const documentos = request.body?.documentos;
  if (!Array.isArray(documentos) || documentos.length > 100
    || documentos.some((item) => !item || !validarCodigoDocumento(item.id)
      || typeof item.obrigatorio !== 'boolean' || typeof item.concluido !== 'boolean')
    || new Set(documentos.map((item) => item.id)).size !== documentos.length) {
    return response.status(400).json({ error: 'Lista de documentos inválida.' });
  }
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const { rows: processos } = await cliente.query('SELECT status FROM processos WHERE id = $1 FOR UPDATE', [request.params.id]);
    if (!['rascunho', 'em_preenchimento'].includes(processos[0]?.status)) {
      await cliente.query('ROLLBACK');
      return response.status(409).json({ error: 'O processo já foi enviado.' });
    }
    for (const item of documentos) await cliente.query(`
      INSERT INTO processo_documentos (processo_id, nome, obrigatorio, status) VALUES ($1, $2, $3, $4)
      ON CONFLICT (processo_id, nome) DO UPDATE SET obrigatorio = EXCLUDED.obrigatorio,
        status = CASE WHEN processo_documentos.arquivo_url IS NOT NULL THEN processo_documentos.status ELSE EXCLUDED.status END
    `, [request.params.id, item.id, item.obrigatorio, item.concluido ? 'validado' : 'pendente']);
    await cliente.query('UPDATE processo_documentos SET obrigatorio = FALSE WHERE processo_id = $1 AND NOT (nome = ANY($2::text[]))',
      [request.params.id, documentos.map((item) => item.id)]);
    const { rows } = await cliente.query('SELECT nome AS id, arquivo_nome, status, enviado_em FROM processo_documentos WHERE processo_id = $1', [request.params.id]);
    await cliente.query('COMMIT');
    return response.json(rows);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally { cliente.release(); }
}));
const corpoArquivo = express.raw({ type: 'application/octet-stream', limit: '15mb' });
app.post('/api/processos/:id/documentos/:codigo', validarOrigem, asyncRoute(autorizarProcesso), corpoArquivo, asyncRoute(async (request, response) => {
  if (!validarCodigoDocumento(request.params.codigo) || !Buffer.isBuffer(request.body) || !request.body.length) {
    return response.status(400).json({ error: 'Documento inválido.' });
  }
  const tipo = request.get('x-arquivo-tipo') || '';
  const extensoes = { 'application/pdf': '.pdf', 'image/png': '.png', 'image/jpeg': '.jpg' };
  const extensao = extensoes[tipo];
  const assinaturaValida = tipo === 'application/pdf' ? request.body.subarray(0, 5).toString() === '%PDF-'
    : tipo === 'image/png' ? request.body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : tipo === 'image/jpeg' ? request.body.subarray(0, 3).equals(Buffer.from([255, 216, 255])) : false;
  if (!extensao || !assinaturaValida) return response.status(400).json({ error: 'Envie um PDF, PNG ou JPEG válido.' });
  const { rows: estados } = await pool.query('SELECT status FROM processos WHERE id = $1', [request.params.id]);
  if (!['rascunho', 'em_preenchimento'].includes(estados[0]?.status)) return response.status(409).json({ error: 'O processo já foi enviado.' });
  let nomeOriginal = '';
  try { nomeOriginal = decodeURIComponent(request.get('x-arquivo-nome') || '').replace(/[\\/\r\n]/g, '').slice(0, 255); }
  catch { return response.status(400).json({ error: 'Nome do arquivo inválido.' }); }
  if (!nomeOriginal) return response.status(400).json({ error: 'Nome do arquivo inválido.' });
  const destino = `${randomUUID()}${extensao}`;
  const { rows: anteriores } = await pool.query('SELECT arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  await mkdir(path.join(pastaAnexos, request.params.id), { recursive: true });
  await writeFile(path.join(pastaAnexos, request.params.id, destino), request.body, { flag: 'wx' });
  try {
    const { rows } = await pool.query(`
      INSERT INTO processo_documentos (processo_id, nome, status, arquivo_nome, arquivo_url, enviado_em)
      VALUES ($1, $2, 'enviado', $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (processo_id, nome) DO UPDATE SET status = 'enviado', arquivo_nome = EXCLUDED.arquivo_nome,
        arquivo_url = EXCLUDED.arquivo_url, enviado_em = CURRENT_TIMESTAMP
      RETURNING nome AS id, arquivo_nome, status, enviado_em
    `, [request.params.id, request.params.codigo, nomeOriginal, destino]);
    if (anteriores[0]?.arquivo_url) await unlink(path.join(pastaAnexos, request.params.id, anteriores[0].arquivo_url)).catch(() => undefined);
    return response.status(201).json(rows[0]);
  } catch (erro) {
    await unlink(path.join(pastaAnexos, request.params.id, destino)).catch(() => undefined);
    throw erro;
  }
}));

app.get('/api/processos/:id/documentos/:codigo', asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  if (!validarCodigoDocumento(request.params.codigo)) return response.status(400).json({ error: 'Documento inválido.' });
  const { rows } = await pool.query('SELECT arquivo_nome, arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  if (!rows[0]?.arquivo_url) return response.status(404).json({ error: 'Documento não encontrado.' });
  let bytes;
  try { bytes = await readFile(path.join(pastaAnexos, request.params.id, rows[0].arquivo_url)); }
  catch (erro) {
    if (erro?.code === 'ENOENT') return response.status(404).json({ error: 'Arquivo não encontrado no armazenamento.' });
    throw erro;
  }
  response.setHeader('Content-Type', rows[0].arquivo_url.endsWith('.pdf') ? 'application/pdf' : rows[0].arquivo_url.endsWith('.png') ? 'image/png' : 'image/jpeg');
  response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(rows[0].arquivo_nome)}`);
  response.setHeader('Cache-Control', 'private, no-store');
  return response.send(bytes);
}));

app.delete('/api/processos/:id/documentos/:codigo', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  if (!validarCodigoDocumento(request.params.codigo)) return response.status(400).json({ error: 'Documento inválido.' });
  const { rows: estados } = await pool.query('SELECT status FROM processos WHERE id = $1', [request.params.id]);
  if (!['rascunho', 'em_preenchimento'].includes(estados[0]?.status)) return response.status(409).json({ error: 'O processo já foi enviado.' });
  const { rows } = await pool.query('SELECT arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  await pool.query(`UPDATE processo_documentos SET arquivo_nome = NULL, arquivo_url = NULL, enviado_em = NULL, status = 'pendente'
    WHERE processo_id = $1 AND nome = $2`, [request.params.id, request.params.codigo]);
  if (rows[0]?.arquivo_url) await unlink(path.join(pastaAnexos, request.params.id, rows[0].arquivo_url)).catch(() => undefined);
  return response.status(204).end();
}));

app.get('/api/documentos', asyncRoute(async (request, response) => {
  const usuario = await buscarSessao(request);
  const escopo = escopoDoUsuario(usuario);
  const area = escopo === 'projeto' ? 'Projetos' : escopo === 'prog_apoio' ? 'Programa de Apoio' : null;
  const valores = area ? [area] : [];
  const { rows } = await pool.query(`SELECT * FROM cadastros_formularios
    WHERE tipo_cadastro = 'Documento' AND active = TRUE AND habilitado = TRUE
    ${area ? 'AND tipo = $1' : ''} ORDER BY nome`, valores);
  return response.json(rows.map((row) => {
    const doc = parseJson(row.documentos_solicitados, [])[0] || {};
    return { id: row.id, nome: row.nome, descricao: doc.info || '', template_url: normalizarCaminhoTemplate(doc.url_template), active: Boolean(row.active), area: row.tipo };
  }));
}));

app.get('/api/modelos-docx', exigirAdmin, asyncRoute(async (_request, response) => {
  const arquivos = await readdir(path.join(root, 'template'), { withFileTypes: true });
  const modelos = arquivos
    .filter((arquivo) => arquivo.isFile() && !arquivo.name.startsWith('~$') && /\.(docx|pdf)$/i.test(arquivo.name))
    .map((arquivo) => ({ nome: arquivo.name, tipo: path.extname(arquivo.name).slice(1).toLowerCase(), caminho: `/templates/${encodeURIComponent(arquivo.name)}` }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return response.json(modelos);
}));

app.post('/api/modelos-documentos', validarOrigem, exigirAdmin, express.raw({ type: '*/*', limit: '25mb' }), asyncRoute(async (request, response) => {
  const nomeInformado = request.get('x-file-name') || '';
  const nome = path.basename(decodeURIComponent(nomeInformado)).replace(/[^\p{L}\p{N}._ -]/gu, '_').trim();
  if (!nome || !/\.(docx|pdf)$/i.test(nome) || nome.startsWith('~$')) return response.status(400).json({ error: 'Envie um arquivo DOCX ou PDF válido.' });
  if (!Buffer.isBuffer(request.body) || request.body.length === 0) return response.status(400).json({ error: 'O arquivo enviado está vazio.' });
  await writeFile(path.join(root, 'template', nome), request.body, { flag: 'wx' }).catch((erro) => {
    if (erro?.code === 'EEXIST') throw Object.assign(new Error('Já existe um modelo com este nome.'), { status: 409 });
    throw erro;
  });
  return response.status(201).json({ nome, caminho: `/templates/${encodeURIComponent(nome)}`, tipo: path.extname(nome).slice(1).toLowerCase() });
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

app.get('/api/formularios', asyncRoute(async (request, response) => {
  const usuario = await buscarSessao(request);
  const escopo = escopoDoUsuario(usuario);
  const area = escopo === 'projeto' ? 'Projetos' : escopo === 'prog_apoio' ? 'Programa de Apoio' : null;
  const valores = area ? [area] : [];
  const { rows } = await pool.query(`SELECT * FROM cadastros_formularios
    ${area ? 'WHERE tipo = $1' : ''} ORDER BY nseq ASC, nome ASC`, valores);
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
        (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados, habilitado, nseq)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11)
      RETURNING *
    `, [id, request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []), JSON.stringify(documentos), request.body.habilitado !== false, Number(request.body.nSeq || 0)]);
    return response.status(201).json(serializar(rows[0]));
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'Este ID já existe; use PUT para atualizar o cadastro.' });
    throw erro;
  }
}));

app.put('/api/formularios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const chavesAtualizacaoParcial = Object.keys(request.body || {});
  if (chavesAtualizacaoParcial.length > 0 && chavesAtualizacaoParcial.every((chave) => chave === 'active' || chave === 'habilitado' || chave === 'nSeq')) {
    const { rows } = await pool.query(`
      UPDATE cadastros_formularios SET
        active = COALESCE($1, active), habilitado = COALESCE($2, habilitado), nseq = COALESCE($3, nseq), atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `, [typeof request.body.active === 'boolean' ? request.body.active : null, typeof request.body.habilitado === 'boolean' ? request.body.habilitado : null, Number.isFinite(Number(request.body.nSeq)) ? Number(request.body.nSeq) : null, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: 'Formulário não encontrado.' });
    return response.json(serializar(rows[0]));
  }
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  if (!validarId(request.params.id) || (request.body.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rows } = await pool.query(`
    UPDATE cadastros_formularios SET
      nome = $1, tipo = $2, tipo_cadastro = $3, linha_apoio_id = $4, status = $5, normas = $6,
      periodos_submissao = $7::jsonb, documentos_solicitados = $8::jsonb,
      active = $9, habilitado = $10, nseq = $11, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = $12
    RETURNING *
  `, [request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
    request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []),
    JSON.stringify(request.body.documentosSolicitados || []), request.body.active !== false, request.body.habilitado !== false, Number(request.body.nSeq || 0), request.params.id]);
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
