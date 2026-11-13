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
import { executar as executarTipoCadastroCanonico } from '../migrations/013_tipo_cadastro_canonico.mjs';
import { executar as executarKitsDocumentais } from '../migrations/014_normalizar_kits_documentais.mjs';
import { executar as executarAcoesItensKit } from '../migrations/015_acoes_itens_kit_documental.mjs';
import { executar as executarCodigosFormulariosComoIds } from '../migrations/016_codigos_formularios_como_ids.mjs';
import { executar as executarUnidadesUSP } from '../migrations/017_catalogo_unidades_usp.mjs';
import { executar as executarCodigosKits } from '../migrations/018_codigos_kits.mjs';
import { executar as executarInstituicoesExecutoras } from '../migrations/019_instituicoes_executoras.mjs';
import { executar as executarEventosProcesso } from '../migrations/020_eventos_processo.mjs';
import { hashPassword, verifyPassword } from './passwords.mjs';
import { carregarFormulariosArquivo, erroFonteSomenteLeitura, fonteDaArea, fontesDados } from './fontesDados.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const pastaAnexos = process.env.UPLOAD_DIR || path.join(root, 'uploads');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Configure DATABASE_URL para iniciar o backend PostgreSQL.');

const resultadoBootstrap = await criarBasePostgreSQL(databaseUrl);
console.info(`Banco PostgreSQL ${resultadoBootstrap.criada ? 'criado' : 'jÃ¡ existente'}: ${resultadoBootstrap.nome}`);

const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});
pool.on('error', () => console.error('Falha inesperada em uma conexÃ£o PostgreSQL ociosa.'));

try {
  await pool.query('SELECT 1');
  await executarCatalogoPostgreSQL(pool, root);
  await executarAutenticacao(pool);
  await executarPerfisTenants(pool);
  await executarTipoCadastroCanonico(pool);
  await executarKitsDocumentais(pool, root);
  await executarAcoesItensKit(pool, root);
  await executarProcessos(pool);
  await executarCodigosFormulariosComoIds(pool);
  await executarUnidadesUSP(pool, root);
  await executarCodigosKits(pool);
  await executarInstituicoesExecutoras(pool, root);
  await executarEventosProcesso(pool);
} catch (erro) {
  await pool.end();
  console.error('Falha ao conectar ou migrar o PostgreSQL. Verifique acesso, permissÃµes e migrations.');
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
// Em HTTP local/rede interna, o cookie nÃ£o pode ter Secure. Em produÃ§Ã£o com HTTPS,
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
  if (!corresponde) return response.status(403).json({ error: 'Origem da requisiÃ§Ã£o invÃ¡lida.' });
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
    if (!usuario) return response.status(401).json({ error: 'AutenticaÃ§Ã£o necessÃ¡ria.' });
    request.usuarioAutenticado = usuario;
    return next();
  }).catch(next);
};
const exigirAdmin = (request, response, next) => {
  buscarSessao(request).then((usuario) => {
    if (!usuario || usuario.role !== 'admin') return response.status(401).json({ error: 'AutenticaÃ§Ã£o administrativa necessÃ¡ria.' });
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
const buscarItensKitDocumental = async (formularioId, executor = pool) => {
  const { rows: kits } = await executor.query(`SELECT id FROM kits_documentais
    WHERE formulario_id = $1 AND ativo = TRUE ORDER BY ordem, criado_em LIMIT 1`, [formularioId]);
  if (!kits[0]) return [];
  const { rows } = await executor.query(`SELECT * FROM itens_kit_documental
    WHERE kit_id = $1 AND ativo = TRUE ORDER BY ordem, criado_em`, [kits[0].id]);
  return rows.map((item) => ({
    id: item.identificador,
    nome: item.titulo,
    tipo: item.tipo === 'gerado' ? 'formulario' : 'documento',
    documentoId: item.cadastro_documento_id || undefined,
    referenciaTipo: item.cadastro_documento_id ? 'documento' : 'url',
    obrigatorio: item.obrigatorio !== false,
    permiteAnexo: item.permite_anexo,
    permiteModelo: item.permite_modelo,
    info: item.descricao || '',
    url_template: normalizarCaminhoTemplate(item.url_template),
  }));
};

const serializar = (row, itensKitDocumental = []) => ({
  id: row.id,
  nome: row.nome,
  area: row.area || row.tipo,
  tipo: row.tipo_cadastro || 'formulario',
  linhaApoioId: row.linha_apoio_id,
  status: row.status,
  normas: row.normas,
  periodosSubmissao: parseJson(row.periodos_submissao, []),
  itensKitDocumental,
  active: Boolean(row.active),
  habilitado: row.habilitado === true,
  nSeq: Number(row.nseq || 0),
});

const serializarComKit = async (row, executor = pool) => {
  if (row.tipo_cadastro !== 'documento') return serializar(row, await buscarItensKitDocumental(row.id, executor));
  let documento = row;
  if (row.descricao === undefined) {
    const { rows } = await executor.query('SELECT descricao, template_url FROM cadastro_documentos WHERE id = $1', [row.id]);
    documento = { ...row, ...rows[0] };
  }
  return serializar(row, [{ id: row.id, nome: row.nome, tipo: 'documento', obrigatorio: true,
    info: documento.descricao || '', url_template: normalizarCaminhoTemplate(documento.template_url) }]);
};

const normalizarChaveDocumento = (nome) => nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
const chaveComparacaoDocumento = (nome) => normalizarChaveDocumento(nome).replace(/[^\p{L}\p{N}]/gu, '');
const validarId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(id);

const validar = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON invÃ¡lido.';
  if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.length > 200) return 'Nome invÃ¡lido (mÃ¡ximo 200 caracteres).';
  if (!['Projetos', 'Programa de Apoio'].includes(body.area)) return 'Ãrea invÃ¡lida.';
  if (!['formulario', 'documento'].includes(body.tipo)) return 'Tipo inválido.';
  if (body.tipo === 'formulario' && (typeof body.linhaApoioId !== 'string' || !body.linhaApoioId.trim() || body.linhaApoioId.length > 120)) return 'Linha de apoio inválida.';
  if (!['Aberto', 'Fechado'].includes(body.status)) return 'Status invÃ¡lido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID invÃ¡lido.';
  if (body.normas !== undefined && (typeof body.normas !== 'string' || body.normas.length > 500000)) return 'Texto de regras invÃ¡lido ou grande demais.';
  if (body.active !== undefined && typeof body.active !== 'boolean') return 'Status de ativaÃ§Ã£o invÃ¡lido.';
  if (body.periodosSubmissao !== undefined && (!Array.isArray(body.periodosSubmissao) || body.periodosSubmissao.length > 100)) return 'CalendÃ¡rio invÃ¡lido.';
  if (body.itensKitDocumental !== undefined && (!Array.isArray(body.itensKitDocumental) || body.itensKitDocumental.length > 200)) return 'Lista de documentos invÃ¡lida.';
  for (const periodo of body.periodosSubmissao || []) {
    if (!periodo || typeof periodo !== 'object' || !validarId(periodo.id)
      || typeof periodo.dataInicio !== 'string' || periodo.dataInicio.length > 30
      || typeof periodo.dataFim !== 'string' || periodo.dataFim.length > 30
      || !['Aberto', 'Fechado'].includes(periodo.status)) return 'PerÃ­odo de submissÃ£o invÃ¡lido.';
  }
  for (const documento of body.itensKitDocumental || []) {
    if (!documento || typeof documento !== 'object' || !validarId(documento.id)
      || typeof documento.nome !== 'string' || documento.nome.length > 200
      || (documento.tipo !== undefined && !['documento', 'formulario'].includes(documento.tipo))
      || (documento.obrigatorio !== undefined && typeof documento.obrigatorio !== 'boolean')
      || (documento.documentoId !== undefined && !validarId(documento.documentoId))
      || (documento.info !== undefined && (typeof documento.info !== 'string' || documento.info.length > 500000))
      || (documento.url_template !== undefined && (typeof documento.url_template !== 'string' || documento.url_template.length > 2048))) return 'Documento solicitado invÃ¡lido.';
  }
  return null;
};

const validarDocumento = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON invÃ¡lido.';
  if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.length > 200) return 'Nome invÃ¡lido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID invÃ¡lido.';
  if (body.descricao !== undefined && (typeof body.descricao !== 'string' || body.descricao.length > 500000)) return 'DescriÃ§Ã£o invÃ¡lida ou grande demais.';
  if (body.template_url !== undefined && (typeof body.template_url !== 'string' || body.template_url.length > 2048)) return 'URL de modelo invÃ¡lida.';
  if (body.active !== undefined && typeof body.active !== 'boolean') return 'Status de ativaÃ§Ã£o invÃ¡lido.';
  return null;
};

const validarUnidadeUSP = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON inválido.';
  if (!validarId(body.id)) return 'ID inválido.';
  if (typeof body.sigla !== 'string' || body.sigla.length > 120) return 'Sigla inválida.';
  if (typeof body.descricao !== 'string' || !body.descricao.trim() || body.descricao.length > 240) return 'Descrição inválida.';
  if (body.active !== undefined && typeof body.active !== 'boolean') return 'Status de ativação inválido.';
  return null;
};

const validarCondicaoCatalogo = (body) => {
  const valores = [body.campo_condicional, body.operador_condicional, body.valor_condicional];
  const preenchidos = valores.filter((valor) => valor !== undefined && valor !== null && valor !== '').length;
  if (preenchidos !== 0 && preenchidos !== valores.length) return false;
  if (body.operador_condicional != null && body.operador_condicional !== 'equals') return false;
  return valores.every((valor) => valor == null || valor === '' || (typeof valor === 'string' && valor.length <= 160));
};

const validarKitDocumental = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON inválido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID inválido.';
  if (!validarId(body.formulario_id)) return 'formulario_id inválido.';
  if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.length > 200) return 'Nome inválido.';
  if (body.descricao !== undefined && (typeof body.descricao !== 'string' || body.descricao.length > 2000)) return 'Descrição inválida.';
  if (!Number.isInteger(Number(body.ordem ?? 0)) || Number(body.ordem ?? 0) < 0) return 'Ordem inválida.';
  if (body.ativo !== undefined && typeof body.ativo !== 'boolean') return 'Status de ativação inválido.';
  if (!validarCondicaoCatalogo(body)) return 'Condição inválida; informe campo, operador equals e valor juntos.';
  return null;
};

const validarItemKitDocumental = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Corpo JSON inválido.';
  if (body.id !== undefined && !validarId(body.id)) return 'ID inválido.';
  if (body.kit_id !== undefined && !validarId(body.kit_id)) return 'kit_id inválido.';
  if (body.cadastro_documento_id != null && !validarId(body.cadastro_documento_id)) return 'cadastro_documento_id inválido.';
  if (typeof body.identificador !== 'string' || !body.identificador.trim() || body.identificador.length > 120) return 'Identificador inválido.';
  if (typeof body.titulo !== 'string' || !body.titulo.trim() || body.titulo.length > 240) return 'Título inválido.';
  if (body.descricao !== undefined && (typeof body.descricao !== 'string' || body.descricao.length > 500000)) return 'Descrição inválida.';
  if (!['gerado', 'upload', 'externo', 'aceite'].includes(body.tipo)) return 'Tipo de item inválido.';
  if (body.obrigatorio !== undefined && typeof body.obrigatorio !== 'boolean') return 'obrigatorio inválido.';
  if (body.permite_anexo !== undefined && typeof body.permite_anexo !== 'boolean') return 'permite_anexo inválido.';
  if (body.permite_modelo !== undefined && typeof body.permite_modelo !== 'boolean') return 'permite_modelo inválido.';
  if (body.ativo !== undefined && typeof body.ativo !== 'boolean') return 'Status de ativação inválido.';
  if (body.url_template !== undefined && (typeof body.url_template !== 'string' || body.url_template.length > 2048)) return 'url_template inválido.';
  if (body.observacao_condicional !== undefined && (typeof body.observacao_condicional !== 'string' || body.observacao_condicional.length > 2000)) return 'observacao_condicional inválida.';
  if (body.acao_email !== undefined && body.acao_email !== null && (typeof body.acao_email !== 'object' || Array.isArray(body.acao_email))) return 'acao_email inválida.';
  if (!Number.isInteger(Number(body.ordem ?? 0)) || Number(body.ordem ?? 0) < 0) return 'Ordem inválida.';
  if (!validarCondicaoCatalogo(body)) return 'Condição inválida; informe campo, operador equals e valor juntos.';
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
    return response.status(400).json({ error: 'UsuÃ¡rio ou senha invÃ¡lidos.' });
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
    return response.status(401).json({ error: 'UsuÃ¡rio ou senha invÃ¡lidos.' });
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
    return response.status(400).json({ error: 'UsuÃ¡rio vÃ¡lido e senha com pelo menos 12 caracteres sÃ£o obrigatÃ³rios.' });
  }
  const existente = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  if (existente.rowCount) return response.status(409).json({ error: 'UsuÃ¡rio jÃ¡ cadastrado.' });
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
  if (!username || username.length > 120) return response.status(400).json({ error: 'UsuÃ¡rio invÃ¡lido.' });
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const hash = password ? await hashPassword(password) : null;
  const { rows } = await pool.query(`
    UPDATE users SET username = $1, role = $2, perfil = $6, tenant = $7, is_active = $3,
      password_hash = COALESCE($4, password_hash), updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, username, role, perfil, tenant, is_active, created_at, updated_at, last_login_at
  `, [username, role, ativo, hash, request.params.id, perfil, tenant]);
  if (!rows[0]) return response.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado.' });
  return response.json(rows[0]);
}));

app.post('/api/usuarios/:id/senha', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const confirmPassword = typeof request.body?.confirmPassword === 'string' ? request.body.confirmPassword : '';
  if ([...password].length < 12 || password !== confirmPassword) {
    return response.status(400).json({ error: 'A senha deve ter pelo menos 12 caracteres e a confirmaÃ§Ã£o deve coincidir.' });
  }
  const hash = await hashPassword(password);
  const resultado = await pool.query(`
    UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND is_active = TRUE RETURNING id
  `, [hash, request.params.id]);
  if (!resultado.rowCount) return response.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado ou inativo.' });
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
    return response.status(401).json({ error: 'A senha atual nÃ£o confere.' });
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
  const { rows } = await pool.query(`SELECT c.*, d.descricao, d.template_url
    FROM cadastros_formularios c JOIN cadastro_documentos d ON d.id = c.id
    WHERE c.tipo_cadastro = 'documento'`);
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`INSERT INTO cadastros_formularios
      (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, active)
      VALUES ($1, $2, $3, 'documento', '', 'Fechado', '', '[]'::jsonb, TRUE)
      ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, tipo_cadastro = 'documento',
        active = TRUE, atualizado_em = CURRENT_TIMESTAMP RETURNING *`,
    [idPrincipal, nome, existente?.tipo || 'Projetos']);
    const descricao = documento.descricao ?? existente?.descricao ?? '';
    const templateUrl = documento.template_url ?? existente?.template_url ?? '';
    await client.query(`INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active)
      VALUES ($1,$2,$3,$4,TRUE) ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome,
      descricao = EXCLUDED.descricao, template_url = EXCLUDED.template_url, active = TRUE,
      atualizado_em = CURRENT_TIMESTAMP`, [idPrincipal, nome, descricao, templateUrl]);
    await client.query('COMMIT');
    return { ...rows[0], descricao, template_url: templateUrl };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};

const salvarKitPrincipal = async (executor, formularioId, nomeFormulario, documentos) => {
  const { rows: kits } = await executor.query(`SELECT id FROM kits_documentais
    WHERE formulario_id = $1 ORDER BY ordem, criado_em LIMIT 1`, [formularioId]);
  const kitId = kits[0]?.id || `kit-formulario-${formularioId}`;
  if (!kits[0]) {
    await executor.query(`INSERT INTO kits_documentais (id, formulario_id, nome, descricao, ordem, ativo)
      VALUES ($1,$2,$3,'',1,TRUE)`, [kitId, formularioId, `Kit Documental - ${nomeFormulario}`]);
  }
  await executor.query('DELETE FROM itens_kit_documental WHERE kit_id = $1', [kitId]);
  for (let indice = 0; indice < documentos.length; indice += 1) {
    const documento = documentos[indice];
    await executor.query(`INSERT INTO itens_kit_documental
      (id, kit_id, cadastro_documento_id, identificador, titulo, descricao, tipo, obrigatorio,
       permite_anexo, permite_modelo, url_template, ordem, ativo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE)`,
    [`item-${randomUUID()}`, kitId, documento.documentoId || null, documento.id, documento.nome,
      documento.info || '', documento.tipo === 'formulario' ? 'gerado' : 'upload',
      documento.obrigatorio !== false, documento.permiteAnexo ?? documento.tipo !== 'formulario',
      documento.permiteModelo ?? Boolean(documento.url_template), documento.url_template || '', indice + 1]);
  }
};

app.get('/api/health', asyncRoute(async (_request, response) => {
  await pool.query('SELECT 1');
  return response.json({ ok: true, database: 'available', engine: 'postgresql', dataSources: fontesDados });
}));

// Catálogo de unidades USP. A leitura ativa é pública para formulários futuros;
// alterações e a listagem administrativa exigem perfil administrador.
app.get('/api/unidades', asyncRoute(async (_request, response) => {
  const { rows } = await pool.query("SELECT id, sigla, descricao, active FROM unidades_usp WHERE active = TRUE AND categoria = 'instituicao_executora' ORDER BY descricao");
  return response.json(rows);
}));

app.get('/api/instituicoes-executoras', asyncRoute(async (_request, response) => {
  const { rows } = await pool.query("SELECT id, sigla, descricao, active FROM unidades_usp WHERE active = TRUE AND categoria = 'instituicao_executora' ORDER BY descricao");
  return response.json(rows);
}));

app.get('/api/admin/unidades', exigirAdmin, asyncRoute(async (_request, response) => {
  const { rows } = await pool.query("SELECT id, sigla, descricao, active, criado_em, atualizado_em FROM unidades_usp WHERE categoria = 'instituicao_executora' ORDER BY descricao");
  return response.json(rows);
}));

app.post('/api/unidades', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarUnidadeUSP(request.body);
  if (error) return response.status(400).json({ error });
  try {
    const { rows } = await pool.query(`INSERT INTO unidades_usp (id, sigla, descricao, active, categoria)
      VALUES ($1, $2, $3, $4, 'instituicao_executora') RETURNING id, sigla, descricao, active, criado_em, atualizado_em`,
    [request.body.id.trim(), request.body.sigla.trim() || null, request.body.descricao.trim(), request.body.active !== false]);
    return response.status(201).json(rows[0]);
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'Já existe uma instituição com este ID.' });
    throw erro;
  }
}));

app.put('/api/unidades/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarUnidadeUSP({ ...request.body, id: request.params.id });
  if (error) return response.status(400).json({ error });
  try {
    const { rows } = await pool.query(`UPDATE unidades_usp SET sigla = $1, descricao = $2, active = $3,
      atualizado_em = CURRENT_TIMESTAMP WHERE id = $4 AND categoria = 'instituicao_executora' RETURNING id, sigla, descricao, active, criado_em, atualizado_em`,
    [request.body.sigla.trim() || null, request.body.descricao.trim(), request.body.active !== false, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: 'Unidade não encontrada.' });
    return response.json(rows[0]);
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'Já existe uma instituição com este ID.' });
    throw erro;
  }
}));

app.delete('/api/unidades/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rowCount } = await pool.query("UPDATE unidades_usp SET active = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1 AND categoria = 'instituicao_executora'", [request.params.id]);
  if (!rowCount) return response.status(404).json({ error: 'Unidade não encontrada.' });
  return response.status(204).end();
}));

// CRUD dos kits e seus itens. Formulários e documentos já possuem CRUD próprio;
// estas rotas expõem a relação normalizada para manutenção administrativa.
app.get('/api/kits', exigirAdmin, asyncRoute(async (request, response) => {
  const formularioId = typeof request.query.formulario_id === 'string' ? request.query.formulario_id : '';
  const valores = formularioId ? [formularioId] : [];
  const { rows } = await pool.query(`SELECT * FROM kits_documentais ${formularioId ? 'WHERE formulario_id = $1' : ''}
    ORDER BY formulario_id, ordem, id`, valores);
  return response.json(rows);
}));

app.get('/api/kits/:id', exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rows } = await pool.query('SELECT * FROM kits_documentais WHERE id = $1', [request.params.id]);
  if (!rows[0]) return response.status(404).json({ error: 'Kit não encontrado.' });
  return response.json(rows[0]);
}));

app.post('/api/kits', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarKitDocumental(request.body);
  if (error) return response.status(400).json({ error });
  const formulario = await pool.query("SELECT 1 FROM cadastros_formularios WHERE id = $1 AND tipo_cadastro = 'formulario'", [request.body.formulario_id]);
  if (!formulario.rowCount) return response.status(400).json({ error: 'formulario_id não corresponde a um formulário cadastrado.' });
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const id = request.body.id || randomUUID();
    let codigo;
    {
      await client.query('SELECT pg_advisory_xact_lock($1)', [731904]);
      const { rows: sequencia } = await client.query(`SELECT COALESCE(MAX(substring(codigo FROM 4)::INTEGER), 0) + 1 AS proximo
        FROM kits_documentais WHERE codigo ~ '^KIT[0-9]+$'`);
      codigo = `KIT${String(sequencia[0].proximo).padStart(3, '0')}`;
    }
    const { rows } = await client.query(`INSERT INTO kits_documentais
      (id, codigo, formulario_id, nome, descricao, campo_condicional, operador_condicional, valor_condicional, ordem, ativo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [id, codigo, request.body.formulario_id, request.body.nome.trim(), request.body.descricao || '',
      request.body.campo_condicional || null, request.body.operador_condicional || null,
      request.body.valor_condicional ?? null, Number(request.body.ordem || 0), request.body.ativo !== false]);
    await client.query('COMMIT');
    return response.status(201).json(rows[0]);
  } catch (erro) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (erro?.code === '23505') return response.status(409).json({ error: 'ID de kit já cadastrado.' });
    throw erro;
  } finally {
    client?.release();
  }
}));

app.put('/api/kits/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id) || (request.body?.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const error = validarKitDocumental({ ...request.body, id: request.params.id });
  if (error) return response.status(400).json({ error });
  const formulario = await pool.query("SELECT 1 FROM cadastros_formularios WHERE id = $1 AND tipo_cadastro = 'formulario'", [request.body.formulario_id]);
  if (!formulario.rowCount) return response.status(400).json({ error: 'formulario_id não corresponde a um formulário cadastrado.' });
  const { rows } = await pool.query(`UPDATE kits_documentais SET formulario_id = $1, nome = $2, descricao = $3,
    campo_condicional = $4, operador_condicional = $5, valor_condicional = $6, ordem = $7, ativo = $8,
    atualizado_em = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *`,
  [request.body.formulario_id, request.body.nome.trim(), request.body.descricao || '',
    request.body.campo_condicional || null, request.body.operador_condicional || null,
    request.body.valor_condicional ?? null, Number(request.body.ordem || 0), request.body.ativo !== false, request.params.id]);
  if (!rows[0]) return response.status(404).json({ error: 'Kit não encontrado.' });
  return response.json(rows[0]);
}));

app.delete('/api/kits/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rowCount } = await pool.query('UPDATE kits_documentais SET ativo = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [request.params.id]);
  if (!rowCount) return response.status(404).json({ error: 'Kit não encontrado.' });
  return response.status(204).end();
}));

app.get('/api/kits/:id/itens', exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const kit = await pool.query('SELECT 1 FROM kits_documentais WHERE id = $1', [request.params.id]);
  if (!kit.rowCount) return response.status(404).json({ error: 'Kit não encontrado.' });
  const { rows } = await pool.query('SELECT * FROM itens_kit_documental WHERE kit_id = $1 ORDER BY ordem, id', [request.params.id]);
  return response.json(rows);
}));

app.post('/api/kits/:id/itens', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID de kit inválido.' });
  const error = validarItemKitDocumental(request.body);
  if (error) return response.status(400).json({ error });
  const kit = await pool.query('SELECT 1 FROM kits_documentais WHERE id = $1', [request.params.id]);
  if (!kit.rowCount) return response.status(404).json({ error: 'Kit não encontrado.' });
  const id = request.body.id || randomUUID();
  try {
    const { rows } = await pool.query(`INSERT INTO itens_kit_documental
      (id, kit_id, cadastro_documento_id, identificador, titulo, descricao, tipo, obrigatorio,
       permite_anexo, permite_modelo, url_template, observacao_condicional, acao_email,
       campo_condicional, operador_condicional, valor_condicional, ordem, ativo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18) RETURNING *`,
    [id, request.params.id, request.body.cadastro_documento_id || null, request.body.identificador.trim(),
      request.body.titulo.trim(), request.body.descricao || '', request.body.tipo, request.body.obrigatorio !== false,
      request.body.permite_anexo ?? request.body.tipo === 'upload',
      request.body.permite_modelo ?? (request.body.tipo === 'upload' && Boolean(request.body.url_template)),
      request.body.url_template || '', request.body.observacao_condicional || null,
      request.body.acao_email ? JSON.stringify(request.body.acao_email) : null,
      request.body.campo_condicional || null, request.body.operador_condicional || null,
      request.body.valor_condicional ?? null, Number(request.body.ordem || 0), request.body.ativo !== false]);
    return response.status(201).json(rows[0]);
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'ID ou identificador já cadastrado neste kit.' });
    if (erro?.code === '23503') return response.status(400).json({ error: 'cadastro_documento_id não corresponde a um documento cadastrado.' });
    throw erro;
  }
}));

app.put('/api/itens-kit/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id) || (request.body?.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const error = validarItemKitDocumental({ ...request.body, id: request.params.id });
  if (error) return response.status(400).json({ error });
  const itemAtual = await pool.query('SELECT kit_id FROM itens_kit_documental WHERE id = $1', [request.params.id]);
  if (!itemAtual.rowCount) return response.status(404).json({ error: 'Item de kit não encontrado.' });
  const kitId = request.body.kit_id || itemAtual.rows[0].kit_id;
  const kitDestino = await pool.query('SELECT 1 FROM kits_documentais WHERE id = $1', [kitId]);
  if (!kitDestino.rowCount) return response.status(400).json({ error: 'kit_id não corresponde a um kit cadastrado.' });
  try {
    const { rows } = await pool.query(`UPDATE itens_kit_documental SET
      kit_id = $1, cadastro_documento_id = $2, identificador = $3, titulo = $4, descricao = $5, tipo = $6,
      obrigatorio = $7, permite_anexo = $8, permite_modelo = $9, url_template = $10,
      observacao_condicional = $11, acao_email = $12::jsonb, campo_condicional = $13,
      operador_condicional = $14, valor_condicional = $15, ordem = $16, ativo = $17,
      atualizado_em = CURRENT_TIMESTAMP WHERE id = $18 RETURNING *`,
    [kitId, request.body.cadastro_documento_id || null, request.body.identificador.trim(), request.body.titulo.trim(),
      request.body.descricao || '', request.body.tipo, request.body.obrigatorio !== false,
      request.body.permite_anexo ?? request.body.tipo === 'upload',
      request.body.permite_modelo ?? (request.body.tipo === 'upload' && Boolean(request.body.url_template)),
      request.body.url_template || '', request.body.observacao_condicional || null,
      request.body.acao_email ? JSON.stringify(request.body.acao_email) : null,
      request.body.campo_condicional || null, request.body.operador_condicional || null,
      request.body.valor_condicional ?? null, Number(request.body.ordem || 0), request.body.ativo !== false,
      request.params.id]);
    return response.json(rows[0]);
  } catch (erro) {
    if (erro?.code === '23505') return response.status(409).json({ error: 'Identificador já cadastrado neste kit.' });
    if (erro?.code === '23503') return response.status(400).json({ error: 'cadastro_documento_id não corresponde a um documento cadastrado.' });
    throw erro;
  }
}));

app.delete('/api/itens-kit/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID inválido.' });
  const { rowCount } = await pool.query('UPDATE itens_kit_documental SET ativo = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [request.params.id]);
  if (!rowCount) return response.status(404).json({ error: 'Item de kit não encontrado.' });
  return response.status(204).end();
}));

app.get('/api/processos', exigirSessao, asyncRoute(async (request, response) => {
  const filtros = [];
  const valores = [];
  const categoriaSolicitada = request.query.categoria === 'projeto' || request.query.categoria === 'apoio'
    ? request.query.categoria : null;
  const categoriaEscopo = escopoDoUsuario(request.usuarioAutenticado);
  if (categoriaSolicitada && !usuarioPodeAcessarCategoria(request.usuarioAutenticado, categoriaSolicitada)) {
    return response.status(403).json({ error: 'Seu perfil nÃ£o possui acesso a esta Ã¡rea.' });
  }
  if (categoriaSolicitada || categoriaEscopo) {
    valores.push(categoriaSolicitada || categoriaEscopo);
    filtros.push(`p.categoria = $${valores.length}`);
  }
  if (typeof request.query.status === 'string' && request.query.status.trim()) {
    valores.push(request.query.status.trim());
    filtros.push(`p.status = $${valores.length}`);
  }
  // Listagens por mÃ³dulo representam solicitaÃ§Ãµes principais; subprocessos do kit
  // continuam acessÃ­veis dentro do protocolo pai, mas nÃ£o aparecem como linhas prÃ³prias.
  if (categoriaSolicitada && request.query.incluir_filhos !== '1') filtros.push('p.processo_pai_id IS NULL');
  filtros.push('p.ativo = TRUE');
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const { rows } = await pool.query(`
    SELECT p.id, p.protocolo, p.categoria, p.formulario_id, p.formulario_nome, p.formulario_rota, p.processo_pai_id,
      p.titulo, p.solicitante_nome, p.solicitante_email, p.status,
      p.criado_em, p.atualizado_em,
      COUNT(d.id) FILTER (WHERE d.obrigatorio)::int AS documentos_total,
      COUNT(d.id) FILTER (WHERE d.obrigatorio AND d.status IN ('enviado', 'validado', 'concluido'))::int AS documentos_anexados,
      COALESCE(
        json_agg(
          json_build_object(
            'id', d.id,
            'nome', d.nome,
            'obrigatorio', d.obrigatorio,
            'status', d.status,
            'preenchido', d.preenchido,
            'emitido', d.emitido,
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
    || !/^(?:[A-Z]{3}-[A-Z]{3}-\d{3}|[a-z0-9-]{1,120})$/.test(body.formularioId)
    || typeof body.formularioNome !== 'string' || !body.formularioNome.trim() || body.formularioNome.length > 255
    || typeof body.formularioRota !== 'string'
    || (body.processoPaiId !== undefined && body.processoPaiId !== null && !uuidValido(body.processoPaiId))
    || body.formularioRota.length > 255
    || !body.formularioRota.startsWith(body.categoria === 'projeto' ? '/projetos/form-' : '/programas-de-apoio/apoio-')
    || !/^\/[a-z0-9/-]+$/.test(body.formularioRota)
    || typeof body.chaveCriacao !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.chaveCriacao)
    || typeof body.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.token)) {
    return response.status(400).json({ error: 'Categoria e formulÃ¡rio sÃ£o obrigatÃ³rios.' });
  }
  const usuario = await buscarSessao(request);
  if (usuario && !usuarioPodeAcessarCategoria(usuario, body.categoria)) {
    return response.status(403).json({ error: 'Seu perfil nÃ£o pode iniciar processos nesta Ã¡rea.' });
  }
  const processoId = randomUUID();
  const processoPaiId = body.processoPaiId || null;
  const token = body.token;
  const protocolo = `${body.categoria === 'apoio' ? 'APO' : 'PRJ'}-${new Date().getFullYear()}/${processoId.slice(0, 8).toUpperCase()}`;
  const { rows } = await pool.query(`
    INSERT INTO processos (id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, processo_pai_id, acesso_hash, chave_criacao)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (chave_criacao) DO NOTHING
    RETURNING id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, status, dados_json, versao, criado_em, atualizado_em
  `, [processoId, protocolo, body.categoria, body.formularioId, body.formularioNome.trim(), body.formularioRota, processoPaiId, hashToken(token), body.chaveCriacao]);
  if (rows[0]) return response.status(201).json({ ...rows[0], token });
  const { rows: repetidos } = await pool.query(`
    SELECT id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, processo_pai_id, status,
      dados_json, versao, criado_em, atualizado_em, acesso_hash FROM processos WHERE chave_criacao = $1
  `, [body.chaveCriacao]);
  const existente = repetidos[0];
  if (!existente || existente.acesso_hash !== hashToken(token) || existente.formulario_rota !== body.formularioRota) {
    return response.status(409).json({ error: 'Tentativa de criaÃ§Ã£o jÃ¡ utilizada.' });
  }
  const { acesso_hash: _hash, ...processo } = existente;
  return response.json({ ...processo, token });
}));

const uuidValido = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const autorizarProcesso = async (request, response, next) => {
  if (!uuidValido(request.params.id)) return response.status(400).json({ error: 'UUID invÃ¡lido.' });
  const token = request.get('x-processo-token') || '';
  const { rows } = await pool.query('SELECT acesso_hash, categoria, ativo FROM processos WHERE id = $1', [request.params.id]);
  if (!rows[0]) return response.status(404).json({ error: 'Processo nÃ£o encontrado.' });
  if (!rows[0].ativo) return response.status(410).json({ error: 'Processo inativado.' });
  const esperado = rows[0].acesso_hash;
  const recebido = /^[A-Za-z0-9_-]{43}$/.test(token) ? hashToken(token) : '';
  const autorizado = Boolean(esperado && recebido && esperado.length === recebido.length
    && timingSafeEqual(Buffer.from(esperado), Buffer.from(recebido)));
  if (!autorizado) {
    const usuario = await buscarSessao(request);
    if (!usuario || !usuarioPodeAcessarCategoria(usuario, rows[0].categoria)) {
      return response.status(403).json({ error: 'Acesso ao processo nÃ£o autorizado.' });
    }
  }
  return next();
};

const auditarAcaoProcesso = (request, response, next) => {
  const processoId = request.params.id;
  const acao = `${request.method.toLowerCase()}_${request.path.split('/').filter(Boolean).join('_') || 'rascunho'}`.replace(/[^a-z0-9_-]/gi, '_').slice(0, 120);
  response.once('finish', () => {
    void pool.query('INSERT INTO processo_eventos(processo_id, acao, resultado, detalhe) VALUES ($1,$2,$3,$4)',
      [processoId, acao, response.statusCode < 400 ? 'sucesso' : 'falha', `HTTP ${response.statusCode}`])
      .catch(() => console.error('Falha ao registrar evento do processo.'));
  });
  next();
};
app.use('/api/processos/:id', (request, response, next) => {
  if (request.method === 'GET' || request.path === '/eventos') return next();
  return asyncRoute(autorizarProcesso)(request, response, () => auditarAcaoProcesso(request, response, next));
});

app.get('/api/processos/:id/eventos', asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { rows } = await pool.query('SELECT id, acao, resultado, detalhe, criado_em FROM processo_eventos WHERE processo_id = $1 ORDER BY id DESC LIMIT 100', [request.params.id]);
  response.json(rows);
}));

app.post('/api/processos/:id/eventos', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { acao, resultado, detalhe = '' } = request.body || {};
  if (typeof acao !== 'string' || !/^[a-z0-9_:-]{1,120}$/i.test(acao)
    || !['inicio', 'sucesso', 'falha'].includes(resultado) || typeof detalhe !== 'string' || detalhe.length > 500) {
    return response.status(400).json({ error: 'Evento inválido.' });
  }
  const { rows } = await pool.query('INSERT INTO processo_eventos(processo_id, acao, resultado, detalhe) VALUES ($1,$2,$3,$4) RETURNING id, acao, resultado, detalhe, criado_em', [request.params.id, acao, resultado, detalhe]);
  response.status(201).json(rows[0]);
}));

app.get('/api/processos/:id', asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { rows } = await pool.query(`
    SELECT id, protocolo, categoria, formulario_id, formulario_nome, formulario_rota, processo_pai_id,
      titulo, solicitante_nome, solicitante_email, status, ativo, dados_json, versao, criado_em, atualizado_em, enviado_em
    FROM processos WHERE id = $1
  `, [request.params.id]);
  const { rows: documentos } = await pool.query(`
    SELECT nome AS id, arquivo_nome, status, preenchido, emitido, enviado_em FROM processo_documentos WHERE processo_id = $1
  `, [request.params.id]);
  return response.json({ ...rows[0], documentos });
}));

app.post('/api/processos/inativar', validarOrigem, exigirSessao, asyncRoute(async (request, response) => {
  const ids = request.body?.ids;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some((id) => !uuidValido(id))) {
    return response.status(400).json({ error: 'SeleÃ§Ã£o de processos invÃ¡lida.' });
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
    return response.status(400).json({ error: 'Dados ou versÃ£o do rascunho invÃ¡lidos.' });
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
  if (!rows[0]) return response.status(409).json({ error: 'Rascunho alterado em outra aba ou jÃ¡ enviado. Reabra o processo antes de continuar.' });
  return response.json(rows[0]);
}));

app.post('/api/processos/:id/enviar', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const { versao } = request.body || {};
  if (!Number.isInteger(versao) || versao < 0) return response.status(400).json({ error: 'VersÃ£o invÃ¡lida.' });
  const { rows: pendencias } = await pool.query(`
    SELECT d.nome AS id, COALESCE((
      SELECT i.titulo FROM itens_kit_documental i
      JOIN kits_documentais k ON k.id = i.kit_id
      WHERE k.formulario_id = p.formulario_id AND i.identificador = d.nome
      ORDER BY k.ativo DESC, i.ativo DESC, i.ordem LIMIT 1
    ), CASE WHEN d.nome LIKE 'formulario-%' THEN 'Formul\u00e1rio principal' ELSE d.nome END) AS titulo
    FROM processo_documentos d JOIN processos p ON p.id = d.processo_id
    WHERE d.processo_id = $1 AND d.obrigatorio = TRUE AND d.status NOT IN ('enviado', 'validado')
    ORDER BY d.nome
  `, [request.params.id]);
  if (pendencias.length > 0) return response.status(409).json({
    error: `Conclua os documentos obrigat\u00f3rios do Kit de Documenta\u00e7\u00e3o antes de enviar. Pendentes: ${pendencias.map((item) => item.titulo).join('; ')}.`,
    pendencias,
  });
  const { rows } = await pool.query(`
    UPDATE processos SET status = 'enviado', enviado_em = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP,
      versao = versao + 1
    WHERE id = $1 AND versao = $2 AND status IN ('rascunho', 'em_preenchimento')
      AND NOT EXISTS (SELECT 1 FROM processo_documentos d WHERE d.processo_id = processos.id
        AND d.obrigatorio = TRUE AND d.status NOT IN ('enviado', 'validado'))
    RETURNING id, protocolo, status, versao, enviado_em
  `, [request.params.id, versao]);
  if (!rows[0]) return response.status(409).json({ error: 'Processo jÃ¡ enviado ou alterado em outra aba.' });
  return response.json(rows[0]);
}));

const validarCodigoDocumento = (codigo) => typeof codigo === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(codigo);
app.put('/api/processos/:id/documentos', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  const documentos = request.body?.documentos;
  let motivoInvalidez = '';
  if (!Array.isArray(documentos)) motivoInvalidez = 'O campo documentos deve ser uma lista.';
  else if (documentos.length > 100) motivoInvalidez = 'A lista excede o limite de 100 documentos.';
  else {
    const ids = new Set();
    for (const [indice, item] of documentos.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        motivoInvalidez = `O item ${indice + 1} deve ser um objeto.`;
        break;
      }
      if (!validarCodigoDocumento(item.id)) {
        motivoInvalidez = `O identificador do item ${indice + 1} é inválido.`;
        break;
      }
      if (ids.has(item.id)) {
        motivoInvalidez = `O identificador "${item.id}" está duplicado.`;
        break;
      }
      ids.add(item.id);
      if (typeof item.obrigatorio !== 'boolean' || typeof item.concluido !== 'boolean'
        || (item.preenchido !== undefined && typeof item.preenchido !== 'boolean')
        || (item.emitido !== undefined && typeof item.emitido !== 'boolean')) {
        motivoInvalidez = `O item "${item.id}" contém estados inválidos.`;
        break;
      }
    }
  }
  if (motivoInvalidez) return response.status(400).json({ error: `Lista de documentos inválida: ${motivoInvalidez}` });
  // Compatibilidade com clientes que ainda enviam apenas `concluido`.
  // Os estados mais novos prevalecem quando vierem no payload.
  const documentosNormalizados = documentos.map((item) => ({
    ...item,
    preenchido: item.preenchido ?? item.concluido,
    emitido: item.emitido ?? item.concluido,
  }));
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const { rows: processos } = await cliente.query('SELECT status FROM processos WHERE id = $1 FOR UPDATE', [request.params.id]);
    if (!['rascunho', 'em_preenchimento'].includes(processos[0]?.status)) {
      await cliente.query('ROLLBACK');
      return response.status(409).json({ error: 'O processo jÃ¡ foi enviado.' });
    }
    for (const item of documentosNormalizados) await cliente.query(`
      INSERT INTO processo_documentos (processo_id, nome, obrigatorio, status, preenchido, emitido) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (processo_id, nome) DO UPDATE SET obrigatorio = EXCLUDED.obrigatorio,
        status = CASE WHEN processo_documentos.arquivo_url IS NOT NULL THEN processo_documentos.status ELSE EXCLUDED.status END,
        preenchido = CASE WHEN processo_documentos.arquivo_url IS NOT NULL THEN TRUE ELSE EXCLUDED.preenchido END,
        emitido = CASE WHEN processo_documentos.arquivo_url IS NOT NULL THEN TRUE ELSE EXCLUDED.emitido END
    `, [request.params.id, item.id, item.obrigatorio, item.concluido ? 'validado' : 'pendente', item.preenchido, item.emitido]);
    await cliente.query('UPDATE processo_documentos SET obrigatorio = FALSE WHERE processo_id = $1 AND NOT (nome = ANY($2::text[]))',
      [request.params.id, documentosNormalizados.map((item) => item.id)]);
    const { rows } = await cliente.query('SELECT nome AS id, arquivo_nome, status, preenchido, emitido, enviado_em FROM processo_documentos WHERE processo_id = $1', [request.params.id]);
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
    return response.status(400).json({ error: 'Documento invÃ¡lido.' });
  }
  const tipo = request.get('x-arquivo-tipo') || '';
  const extensoes = { 'application/pdf': '.pdf', 'image/png': '.png', 'image/jpeg': '.jpg' };
  const extensao = extensoes[tipo];
  const assinaturaValida = tipo === 'application/pdf' ? request.body.subarray(0, 5).toString() === '%PDF-'
    : tipo === 'image/png' ? request.body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : tipo === 'image/jpeg' ? request.body.subarray(0, 3).equals(Buffer.from([255, 216, 255])) : false;
  if (!extensao || !assinaturaValida) return response.status(400).json({ error: 'Envie um PDF, PNG ou JPEG vÃ¡lido.' });
  const { rows: estados } = await pool.query('SELECT status FROM processos WHERE id = $1', [request.params.id]);
  if (!['rascunho', 'em_preenchimento'].includes(estados[0]?.status)) return response.status(409).json({ error: 'O processo jÃ¡ foi enviado.' });
  let nomeOriginal = '';
  try { nomeOriginal = decodeURIComponent(request.get('x-arquivo-nome') || '').replace(/[\\/\r\n]/g, '').slice(0, 255); }
  catch { return response.status(400).json({ error: 'Nome do arquivo invÃ¡lido.' }); }
  if (!nomeOriginal) return response.status(400).json({ error: 'Nome do arquivo invÃ¡lido.' });
  const destino = `${randomUUID()}${extensao}`;
  const { rows: anteriores } = await pool.query('SELECT arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  await mkdir(path.join(pastaAnexos, request.params.id), { recursive: true });
  await writeFile(path.join(pastaAnexos, request.params.id, destino), request.body, { flag: 'wx' });
  try {
    const { rows } = await pool.query(`
      INSERT INTO processo_documentos (processo_id, nome, status, arquivo_nome, arquivo_url, enviado_em, preenchido, emitido)
      VALUES ($1, $2, 'enviado', $3, $4, CURRENT_TIMESTAMP, TRUE, TRUE)
      ON CONFLICT (processo_id, nome) DO UPDATE SET status = 'enviado', arquivo_nome = EXCLUDED.arquivo_nome,
        arquivo_url = EXCLUDED.arquivo_url, enviado_em = CURRENT_TIMESTAMP, preenchido = TRUE, emitido = TRUE
      RETURNING nome AS id, arquivo_nome, status, preenchido, emitido, enviado_em
    `, [request.params.id, request.params.codigo, nomeOriginal, destino]);
    if (anteriores[0]?.arquivo_url) await unlink(path.join(pastaAnexos, request.params.id, anteriores[0].arquivo_url)).catch(() => undefined);
    return response.status(201).json(rows[0]);
  } catch (erro) {
    await unlink(path.join(pastaAnexos, request.params.id, destino)).catch(() => undefined);
    throw erro;
  }
}));

app.get('/api/processos/:id/documentos/:codigo', asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  if (!validarCodigoDocumento(request.params.codigo)) return response.status(400).json({ error: 'Documento invÃ¡lido.' });
  const { rows } = await pool.query('SELECT arquivo_nome, arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  if (!rows[0]?.arquivo_url) return response.status(404).json({ error: 'Documento nÃ£o encontrado.' });
  let bytes;
  try { bytes = await readFile(path.join(pastaAnexos, request.params.id, rows[0].arquivo_url)); }
  catch (erro) {
    if (erro?.code === 'ENOENT') return response.status(404).json({ error: 'Arquivo nÃ£o encontrado no armazenamento.' });
    throw erro;
  }
  response.setHeader('Content-Type', rows[0].arquivo_url.endsWith('.pdf') ? 'application/pdf' : rows[0].arquivo_url.endsWith('.png') ? 'image/png' : 'image/jpeg');
  response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(rows[0].arquivo_nome)}`);
  response.setHeader('Cache-Control', 'private, no-store');
  return response.send(bytes);
}));

app.delete('/api/processos/:id/documentos/:codigo', validarOrigem, asyncRoute(autorizarProcesso), asyncRoute(async (request, response) => {
  if (!validarCodigoDocumento(request.params.codigo)) return response.status(400).json({ error: 'Documento invÃ¡lido.' });
  const { rows: estados } = await pool.query('SELECT status FROM processos WHERE id = $1', [request.params.id]);
  if (!['rascunho', 'em_preenchimento'].includes(estados[0]?.status)) return response.status(409).json({ error: 'O processo jÃ¡ foi enviado.' });
  const { rows } = await pool.query('SELECT arquivo_url FROM processo_documentos WHERE processo_id = $1 AND nome = $2', [request.params.id, request.params.codigo]);
  await pool.query(`UPDATE processo_documentos SET arquivo_nome = NULL, arquivo_url = NULL, enviado_em = NULL, status = 'pendente', preenchido = FALSE, emitido = FALSE
    WHERE processo_id = $1 AND nome = $2`, [request.params.id, request.params.codigo]);
  if (rows[0]?.arquivo_url) await unlink(path.join(pastaAnexos, request.params.id, rows[0].arquivo_url)).catch(() => undefined);
  return response.status(204).end();
}));

app.get('/api/documentos', asyncRoute(async (request, response) => {
  const usuario = await buscarSessao(request);
  const escopo = escopoDoUsuario(usuario);
  const area = escopo === 'projeto' ? 'Projetos' : escopo === 'prog_apoio' ? 'Programa de Apoio' : null;
  const valores = area ? [area] : [];
  const { rows } = await pool.query(`SELECT c.*, d.descricao, d.template_url
    FROM cadastros_formularios c JOIN cadastro_documentos d ON d.id = c.id
    WHERE c.tipo_cadastro = 'documento' AND c.active = TRUE AND c.habilitado = TRUE
    ${area ? 'AND c.tipo = $1' : ''} ORDER BY c.nome`, valores);
  return response.json(rows.map((row) => ({ id: row.id, nome: row.nome, descricao: row.descricao || '',
    template_url: normalizarCaminhoTemplate(row.template_url), active: Boolean(row.active), area: row.tipo })));
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
  if (!nome || !/\.(docx|pdf)$/i.test(nome) || nome.startsWith('~$')) return response.status(400).json({ error: 'Envie um arquivo DOCX ou PDF vÃ¡lido.' });
  if (!Buffer.isBuffer(request.body) || request.body.length === 0) return response.status(400).json({ error: 'O arquivo enviado estÃ¡ vazio.' });
  await writeFile(path.join(root, 'template', nome), request.body, { flag: 'wx' }).catch((erro) => {
    if (erro?.code === 'EEXIST') throw Object.assign(new Error('JÃ¡ existe um modelo com este nome.'), { status: 409 });
    throw erro;
  });
  return response.status(201).json({ nome, caminho: `/templates/${encodeURIComponent(nome)}`, tipo: path.extname(nome).slice(1).toLowerCase() });
}));

app.post('/api/documentos', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarDocumento(request.body);
  if (error) return response.status(400).json({ error });
  const id = request.body.id || randomUUID();
  const registro = await pool.query('SELECT tipo_cadastro FROM cadastros_formularios WHERE id = $1', [id]);
  if (registro.rowCount && registro.rows[0].tipo_cadastro !== 'documento') return response.status(409).json({ error: 'O ID pertence a outro tipo de cadastro.' });
  const existente = await buscarDocumentoPrincipal(id);
  if (existente) return response.status(409).json({ error: 'Documento jÃ¡ cadastrado; use PUT para editar.' });
  const mesmoNome = (await buscarDocumentosPrincipais()).find((documento) =>
    documento.active && chaveComparacaoDocumento(documento.nome) === chaveComparacaoDocumento(request.body.nome));
  if (mesmoNome) return response.status(409).json({ error: 'JÃ¡ existe um documento com este nome. Edite o cadastro existente.' });
  const row = await salvarDocumentoPrincipal(id, request.body, existente);
  return response.status(201).json({ id: row.id, nome: row.nome, descricao: row.descricao || '', template_url: row.template_url || '', active: Boolean(row.active) });
}));

app.put('/api/documentos/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validarDocumento(request.body);
  if (error) return response.status(400).json({ error });
  if (!validarId(request.params.id) || (request.body.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID invÃ¡lido.' });
  const existente = await buscarDocumentoPrincipal(request.params.id);
  if (!existente) return response.status(404).json({ error: 'Documento nÃ£o encontrado no catÃ¡logo principal.' });
  const chaveNome = chaveComparacaoDocumento(request.body.nome);
  const mesmoNome = (await buscarDocumentosPrincipais()).find((documento) =>
    documento.active && documento.id !== existente.id && chaveComparacaoDocumento(documento.nome) === chaveNome);
  if (mesmoNome) return response.status(409).json({ error: 'JÃ¡ existe outro documento com este nome.' });
  const row = await salvarDocumentoPrincipal(existente.id, request.body, existente);
  return response.json({ id: row.id, nome: row.nome, descricao: row.descricao || '', template_url: row.template_url || '', active: Boolean(row.active) });
}));

app.delete('/api/documentos/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID invÃ¡lido.' });
  const existente = await buscarDocumentoPrincipal(request.params.id);
  if (!existente) return response.status(404).json({ error: 'Documento nÃ£o encontrado no catÃ¡logo principal.' });
  await pool.query('UPDATE cadastros_formularios SET active = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [existente.id]);
  return response.status(204).send();
}));

app.get('/api/formularios', asyncRoute(async (request, response) => {
  const usuario = await buscarSessao(request);
  const escopo = escopoDoUsuario(usuario);
  const area = escopo === 'projeto' ? 'Projetos' : escopo === 'prog_apoio' ? 'Programa de Apoio' : null;
  const areas = area ? [area] : ['Projetos', 'Programa de Apoio'];
  const resultados = await Promise.all(areas.map(async (areaAtual) => {
    if (fonteDaArea(areaAtual) === 'file') return carregarFormulariosArquivo(root, areaAtual);
    const { rows } = await pool.query('SELECT * FROM cadastros_formularios WHERE tipo = $1 ORDER BY nseq ASC, nome ASC', [areaAtual]);
    return Promise.all(rows.map((row) => serializarComKit(row)));
  }));
  return response.json(resultados.flat());
}));

app.post('/api/formularios', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  if (fonteDaArea(request.body.area) === 'file') return response.status(409).json(erroFonteSomenteLeitura(request.body.area));
  const id = request.body.id || randomUUID();
  const documentos = request.body.itensKitDocumental || [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      INSERT INTO cadastros_formularios
        (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, habilitado, nseq)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
      RETURNING *
    `, [id, request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []), request.body.habilitado !== false, Number(request.body.nSeq || 0)]);
    if (request.body.tipo === 'documento') {
      const documento = documentos[0] || {};
      await client.query(`INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active)
        VALUES ($1,$2,$3,$4,TRUE)`, [id, request.body.nome.trim(), documento.info || '', documento.url_template || '']);
    } else {
      await salvarKitPrincipal(client, id, request.body.nome.trim(), documentos);
    }
    await client.query('COMMIT');
    return response.status(201).json(await serializarComKit(rows[0]));
  } catch (erro) {
    await client.query('ROLLBACK');
    if (erro?.code === '23505') return response.status(409).json({ error: 'Este ID jÃ¡ existe; use PUT para atualizar o cadastro.' });
    throw erro;
  } finally {
    client.release();
  }
}));

app.put('/api/formularios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  const areaExistente = await pool.query('SELECT tipo FROM cadastros_formularios WHERE id = $1', [request.params.id]);
  const areaAtualizacao = request.body?.area || areaExistente.rows[0]?.tipo;
  if (areaAtualizacao && fonteDaArea(areaAtualizacao) === 'file') return response.status(409).json(erroFonteSomenteLeitura(areaAtualizacao));
  const chavesAtualizacaoParcial = Object.keys(request.body || {});
  if (chavesAtualizacaoParcial.length > 0 && chavesAtualizacaoParcial.every((chave) => chave === 'active' || chave === 'habilitado' || chave === 'nSeq')) {
    const { rows } = await pool.query(`
      UPDATE cadastros_formularios SET
        active = COALESCE($1, active), habilitado = COALESCE($2, habilitado), nseq = COALESCE($3, nseq), atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `, [typeof request.body.active === 'boolean' ? request.body.active : null, typeof request.body.habilitado === 'boolean' ? request.body.habilitado : null, Number.isFinite(Number(request.body.nSeq)) ? Number(request.body.nSeq) : null, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: 'Formulário não encontrado.' });
    return response.json(await serializarComKit(rows[0]));
  }
  const error = validar(request.body);
  if (error) return response.status(400).json({ error });
  if (!validarId(request.params.id) || (request.body.id && request.body.id !== request.params.id)) return response.status(400).json({ error: 'ID invÃ¡lido.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`UPDATE cadastros_formularios SET
      nome = $1, tipo = $2, tipo_cadastro = $3, linha_apoio_id = $4, status = $5, normas = $6,
      periodos_submissao = $7::jsonb, active = $8, habilitado = $9, nseq = $10,
      atualizado_em = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *`,
    [request.body.nome.trim(), request.body.area, request.body.tipo, request.body.linhaApoioId || '',
      request.body.status, request.body.normas || '', JSON.stringify(request.body.periodosSubmissao || []),
      request.body.active !== false, request.body.habilitado !== false, Number(request.body.nSeq || 0), request.params.id]);
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'Formulário não encontrado.' });
    }
    if (request.body.tipo === 'documento') {
      const documento = request.body.itensKitDocumental?.[0] || {};
      await client.query(`INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome,
        descricao = EXCLUDED.descricao, template_url = EXCLUDED.template_url, active = EXCLUDED.active,
        atualizado_em = CURRENT_TIMESTAMP`, [request.params.id, request.body.nome.trim(), documento.info || '',
        documento.url_template || '', request.body.active !== false]);
    } else {
      await salvarKitPrincipal(client, request.params.id, request.body.nome.trim(), request.body.itensKitDocumental || []);
    }
    await client.query('COMMIT');
    return response.json(await serializarComKit(rows[0]));
  } catch (erroAtualizacao) {
    await client.query('ROLLBACK');
    throw erroAtualizacao;
  } finally {
    client.release();
  }
}));

app.delete('/api/formularios/:id', validarOrigem, exigirAdmin, asyncRoute(async (request, response) => {
  if (!validarId(request.params.id)) return response.status(400).json({ error: 'ID invÃ¡lido.' });
  const existente = await pool.query('SELECT tipo FROM cadastros_formularios WHERE id = $1', [request.params.id]);
  if (existente.rows[0] && fonteDaArea(existente.rows[0].tipo) === 'file') return response.status(409).json(erroFonteSomenteLeitura(existente.rows[0].tipo));
  const { rowCount } = await pool.query('UPDATE cadastros_formularios SET active = FALSE, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1', [request.params.id]);
  if (!rowCount) return response.status(404).json({ error: 'Formulário não encontrado.' });
  return response.status(204).send();
}));

app.use('/api', (_request, response) => response.status(404).json({ error: 'Rota da API nÃ£o encontrada.' }));
app.use(express.static(path.join(root, 'dist')));
app.get('*', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));
app.use((erro, _request, response, _next) => {
  const status = Number.isInteger(erro?.status) && erro.status >= 400 && erro.status < 500 ? erro.status : 500;
  if (status === 500) console.error('Falha interna na API:', erro?.code || 'erro desconhecido');
  const mensagem = status === 413 ? 'RequisiÃ§Ã£o grande demais.' : status === 400 ? 'JSON invÃ¡lido.' : 'Erro interno do servidor.';
  return response.status(status).json({ error: mensagem });
});

const port = Number(process.env.API_PORT || 3333);
const servidor = app.listen(port, () => console.log(`FealqFlow API disponÃ­vel na porta ${port} (PostgreSQL).`));
const encerrar = () => servidor.close(async () => {
  await pool.end();
  process.exit(0);
});
process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
