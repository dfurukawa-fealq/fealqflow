import fs from 'node:fs';
import path from 'node:path';

const lerJson = (root, nome, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'data', nome), 'utf8'));
  } catch {
    return fallback;
  }
};

const slug = (valor) => valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function executar(db, root) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  const jaAplicada = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('004_catalogo_formularios_json');
  if (jaAplicada) return;

  const catalogo = lerJson(root, 'mapeamento_formularios.json', []);
  const calendario = lerJson(root, 'mapeamento_calendario_de_submissao.json', []);
  const projetos = lerJson(root, 'formularios_projetos.json', []);
  const porNome = new Map(calendario.map((item) => [item.formulario, item]));
  const formularios = [
    ...catalogo.map((item, index) => ({ ...item, id: `apoio-${slug(item.formulario)}-${index}`, tipo: 'Programa de Apoio' })),
    ...projetos.map((item) => ({ ...item, tipo: 'Projetos' })),
  ];

  const inserir = db.prepare(`INSERT OR IGNORE INTO cadastros_formularios
    (id, nome, tipo, linha_apoio_id, status, normas, periodos_submissao, documentos_solicitados)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const item of formularios) {
    const agenda = porNome.get(item.formulario);
    const documentos = (item.documentos_solicitados || []).map((nome, index) => ({
      id: `${slug(item.formulario)}-doc-${index + 1}`,
      nome,
      info: '',
      url_template: '',
    }));
    inserir.run(
      item.id,
      item.formulario,
      item.tipo,
      `linha-${slug(item.linha_de_incentivo || 'sem-linha')}`,
      item.status_de_abertura || agenda?.status_de_abertura || 'Fechado',
      item.normas || '',
      JSON.stringify(item.periodos_de_submissao || agenda?.periodos_de_submissao || []),
      JSON.stringify(documentos),
    );
  }
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('004_catalogo_formularios_json');
}
