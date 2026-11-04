const normalizarNome = (nome) => nome
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase('pt-BR');

const parseJson = (valor, fallback) => {
  try { return JSON.parse(valor); } catch { return fallback; }
};

export function executar(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  if (db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('007_unificar_documentos_cadastro')) return;

  const documentos = db.prepare('SELECT * FROM documentos_cadastro ORDER BY atualizado_em, criado_em, id').all();
  const formularios = db.prepare('SELECT * FROM cadastros_formularios').all();
  const atualizar = db.prepare(`UPDATE cadastros_formularios SET
    nome = ?, tipo_cadastro = 'Documento', linha_apoio_id = '',
    documentos_solicitados = ?, active = ?, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?`);
  const inserir = db.prepare(`INSERT INTO cadastros_formularios
    (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas,
     periodos_submissao, documentos_solicitados, active)
    VALUES (?, ?, 'Projetos', 'Documento', '', 'Fechado', '', '[]', ?, ?)`);

  db.exec('BEGIN');
  try {
    for (const documento of documentos) {
      const existentePorId = formularios.find((formulario) => formulario.id === documento.id);
      const existente = existentePorId || formularios.find((formulario) =>
        formulario.tipo_cadastro === 'Documento'
        && normalizarNome(formulario.nome) === normalizarNome(documento.nome));
      const id = existente?.id || documento.id;
      const conteudoAtual = existente?.tipo_cadastro === 'Documento'
        ? parseJson(existente.documentos_solicitados, [])
        : [];
      const documentoAtual = conteudoAtual[0] || {};
      const conteudo = JSON.stringify([{
        id,
        nome: existente?.nome || documento.nome,
        info: documentoAtual.info || documento.descricao || '',
        url_template: documentoAtual.url_template || documento.template_url || '',
      }]);

      if (existente) {
        const ativos = Boolean(existente.active) || Boolean(documento.active);
        atualizar.run(existente.nome || documento.nome, conteudo, ativos ? 1 : 0, id);
        existente.tipo_cadastro = 'Documento';
        existente.documentos_solicitados = conteudo;
        existente.active = ativos ? 1 : 0;
      } else {
        inserir.run(id, documento.nome, conteudo, documento.active === 0 ? 0 : 1);
        formularios.push({ id, nome: documento.nome, tipo_cadastro: 'Documento', documentos_solicitados: conteudo });
      }
    }

    db.prepare('UPDATE documentos_cadastro SET active = 0, atualizado_em = CURRENT_TIMESTAMP WHERE active <> 0').run();
    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('007_unificar_documentos_cadastro');
    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}
