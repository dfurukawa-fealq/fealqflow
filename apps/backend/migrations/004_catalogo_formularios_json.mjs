import fs from 'node:fs';
import path from 'node:path';

const lerJson = (root, nome, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));
  } catch {
    return fallback;
  }
};

export function executar(db, root) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  const jaAplicada = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('004_catalogo_formularios_json');
  if (jaAplicada) return;

  const formularios = lerJson(root, 'cadastros_formularios.json', []);

  const inserir = db.prepare(`INSERT OR IGNORE INTO cadastros_formularios
    (id, nome, tipo, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const item of formularios) {
    inserir.run(
      item.id,
      item.nome,
      item.tipo,
      item.linha_apoio_id || '',
      item.status || 'Fechado',
      item.normas || '',
      JSON.stringify(item.periodos_submissao || []),
      JSON.stringify(item.documentos_solicitados || []),
    );
  }
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('004_catalogo_formularios_json');
}
