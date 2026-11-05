import fs from 'node:fs';
import path from 'node:path';

export function executar(db, root) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  if (db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('006_completar_catalogo_projetos')) return;
  const dados = JSON.parse(fs.readFileSync(path.join(root, 'data', 'formularios_projetos.json'), 'utf8'));
  const inserir = db.prepare(`INSERT OR IGNORE INTO cadastros_formularios
    (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
    VALUES (?, ?, 'Projetos', ?, '', ?, ?, '[]', '[]')`);
  for (const item of dados) inserir.run(item.id, item.formulario, item.id.startsWith('documento-') ? 'Documento' : 'Formulário', item.status_de_abertura || 'Aberto', item.normas || '');
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('006_completar_catalogo_projetos');
}
