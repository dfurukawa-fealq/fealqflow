import fs from 'node:fs';
import path from 'node:path';

const lerJson = (root, nome) => JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));

export function executar(db, root) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  if (db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('005_vincular_calendario_formularios')) return;

  const catalogo = lerJson(root, 'cadastros_formularios.json');
  const atualizar = db.prepare(`UPDATE cadastros_formularios SET
    linha_apoio_id = ?, status = ?, periodos_submissao = ?, atualizado_em = CURRENT_TIMESTAMP
    WHERE tipo = 'Programa de Apoio' AND id LIKE ?`);

  catalogo.filter((registro) => registro.tipo === 'Programa de Apoio').forEach((item) => {
    atualizar.run(
      item.linha_apoio_id,
      item.status || 'Fechado',
      JSON.stringify(item.periodos_submissao || []),
      item.id,
    );
  });
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('005_vincular_calendario_formularios');
}
