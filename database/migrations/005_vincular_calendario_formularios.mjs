import fs from 'node:fs';
import path from 'node:path';

const lerJson = (root, nome) => JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));

export function executar(db, root) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  if (db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('005_vincular_calendario_formularios')) return;

  const calendario = lerJson(root, 'mapeamento_calendario_de_submissao.json');
  const catalogo = lerJson(root, 'mapeamento_formularios.json');
  const atualizar = db.prepare(`UPDATE cadastros_formularios SET
    linha_apoio_id = ?, status = ?, periodos_submissao = ?, atualizado_em = CURRENT_TIMESTAMP
    WHERE tipo = 'Programa de Apoio' AND id LIKE ?`);

  calendario.forEach((item, index) => {
    const catalogoItem = catalogo[index];
    if (!catalogoItem) return;
    const idPrefixo = `apoio-${catalogoItem.formulario.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${index}`;
    atualizar.run(
      `linha-${item.linha_de_incentivo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      item.status_de_abertura || 'Fechado',
      JSON.stringify(item.periodos_de_submissao || []),
      idPrefixo,
    );
  });
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('005_vincular_calendario_formularios');
}
