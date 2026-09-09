import fs from 'fs';
import path from 'path';
import { PROGRAMAS_APOIO } from '../../src/data/programasApoio';

const generateHtml = () => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Programa de Apoios FEALQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#004F71',
            secondary: '#00A3A1',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            'outline-variant': '#E2E8F0',
            'on-surface': '#0F172A',
            'on-surface-variant': '#475569',
            'surface-container-lowest': '#FFFFFF',
            'surface-container-low': '#F8FAFC',
            'surface-container': '#F1F5F9',
            'primary-container': '#004F71',
            'secondary-fixed': '#00A3A1',
            'on-secondary-fixed': '#FFFFFF',
            'on-secondary': '#FFFFFF',
          },
          spacing: {
            'xs': '4px',
            'sm': '8px',
            'md': '16px',
            'lg': '24px',
            'xl': '32px',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
  
  <main class="flex-1 w-full max-w-[1200px] mx-auto p-md md:p-xl">
    <div class="mb-lg flex flex-col md:flex-row md:justify-between md:items-end gap-sm">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-primary">
          Programa de Apoios FEALQ
        </h1>
        <p class="text-sm text-on-surface-variant mt-1">Ciclo 2024</p>
      </div>
      <div class="flex">
        <span class="bg-primary-container text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
          Apoio Institucional
        </span>
      </div>
    </div>

    <!-- ========================================= -->
    <!-- DESKTOP VIEW: Tabela com todas as colunas -->
    <!-- ========================================= -->
    <div class="hidden lg:block bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
      <!-- Header -->
      <div class="grid grid-cols-[56px_1fr_180px_110px_240px_160px] items-center px-md py-sm bg-surface-container border-b border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase">
        <div></div>
        <div>Edital/Formulário</div>
        <div>Linha de Apoio</div>
        <div class="text-center">Documentos</div>
        <div class="text-right">Teto (R$)</div>
        <div></div>
      </div>
      <!-- Body -->
      <div class="flex flex-col">
        ${PROGRAMAS_APOIO.map(item => `
          <div class="grid grid-cols-[56px_1fr_180px_110px_240px_160px] items-center px-md min-h-[56px] border-b border-outline-variant hover:bg-surface-container-low transition-colors group last:border-0 cursor-pointer" onclick="window.location.href='${item.id}.html'">
            <div class="text-primary-container text-center flex justify-center">
              <span class="material-symbols-outlined text-lg">${item.icone}</span>
            </div>
            <div class="text-sm font-medium truncate pr-sm text-on-surface">
              ${item.titulo}
            </div>
            <div class="text-xs text-on-surface-variant">
              ${item.linha}
            </div>
            <div class="text-xs text-on-surface-variant text-center">
              ${item.documentos.length} itens
            </div>
            <div class="text-xs font-mono text-right whitespace-nowrap text-on-surface">${item.teto}</div>
            <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded">
                Solicitar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ============================================== -->
    <!-- MOBILE/TABLET VIEW: Card List otimizado        -->
    <!-- ============================================== -->
    <div class="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-md">
      ${PROGRAMAS_APOIO.map(item => `
        <button onclick="window.location.href='${item.id}.html'" class="w-full flex items-center text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:border-secondary hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mr-md group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
            <span class="material-symbols-outlined text-2xl">${item.icone}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[14px] font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
              ${item.titulo}
            </h3>
            <p class="text-xs text-on-surface-variant truncate mt-0.5">
              ${item.linha}
            </p>
          </div>
          <div class="text-outline-variant group-hover:text-secondary transition-colors shrink-0 ml-sm">
            <span class="material-symbols-outlined text-xl">arrow_forward</span>
          </div>
        </button>
      `).join('')}
    </div>
  </main>
  
  <footer class="mt-auto border-t border-outline-variant py-md px-xl bg-surface-container-lowest text-center lg:text-left">
    <div class="max-w-[1200px] mx-auto text-[11px] font-bold text-primary">
      © 2026 FEALQ 50 Anos - Portal Fealq de Formulários
    </div>
  </footer>
</body>
</html>`;
};

if (!fs.existsSync('public/src')) {
  fs.mkdirSync('public/src', { recursive: true });
}

const filePath = path.join('public/src', 'programas.html');
fs.writeFileSync(filePath, generateHtml());
console.log(`Generated list at ${filePath}`);
