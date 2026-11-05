const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const apoioPath = path.join(root, 'apps/frontend/src/pages/programas-de-apoio/PainelSolicitacoesApoio.tsx');
const historicoPath = path.join(root, 'apps/frontend/src/pages/HistoricoPendencias.tsx');
const outputPath = path.join(root, 'apps/frontend/src/data/processosFallback.ts');

function extract(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Não encontrado: ${marker}`);
  const arrayStart = source.indexOf('[', source.indexOf('=', start));
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') { quote = char; continue; }
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(arrayStart, i + 1);
    }
  }
  throw new Error(`Array incompleto: ${marker}`);
}

const apoio = cp.execFileSync('git', ['show', `HEAD:${path.relative(root, apoioPath).replaceAll('\\', '/')}`], { encoding: 'utf8' });
const historico = cp.execFileSync('git', ['show', `HEAD:${path.relative(root, historicoPath).replaceAll('\\', '/')}`], { encoding: 'utf8' });
const apoioArray = extract(apoio, 'const pendingRequests: ApoioRequest[] =');
const historicoArray = extract(historico, 'const allItems: HistoricoItem[] =');

const fallback = `export interface ProcessoFallbackDocumento {\n  nome: string;\n  status?: string;\n}\n\nexport interface ProcessoFallback {\n  id: string;\n  category?: 'projeto' | 'apoio';\n  formName: string;\n  title?: string;\n  user: string;\n  date?: string;\n  status: string;\n  kit: string;\n  link: string;\n  docs?: string[];\n}\n\nexport const processosApoioFallback = ${apoioArray} satisfies ProcessoFallback[];\n\nexport const processosHistoricoFallback = ${historicoArray} satisfies ProcessoFallback[];\n`;
fs.writeFileSync(outputPath, fallback, 'utf8');

const apoioImport = "import { processosApoioFallback } from '../../data/processosFallback';\n";
const historicoImport = "import { processosHistoricoFallback } from '../data/processosFallback';\n";
if (process.env.REWRITE_PROCESS_SOURCES === 'true') {
  fs.writeFileSync(apoioPath, apoio.replace("import { Footer } from '../../components/Footer';", "import { Footer } from '../../components/Footer';\n" + apoioImport).replace(apoio.slice(apoio.indexOf('  const pendingRequests: ApoioRequest[] ='), apoio.indexOf('  const filtered = pendingRequests.filter')) , '  const pendingRequests = processosApoioFallback;\n\n'), 'utf8');
  fs.writeFileSync(historicoPath, historico.replace("import { Footer } from '../components/Footer';", "import { Footer } from '../components/Footer';\n" + historicoImport).replace(historico.slice(historico.indexOf('  const allItems: HistoricoItem[] ='), historico.indexOf('  const filtered = allItems.filter')), '  const allItems = processosHistoricoFallback;\n\n'), 'utf8');
}
