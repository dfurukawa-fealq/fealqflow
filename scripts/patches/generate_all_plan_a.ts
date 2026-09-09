import fs from 'fs';
import path from 'path';
import { PROGRAMAS_APOIO, ProgramaApoio } from '../../src/data/programasApoio';

const generateHtml = (programa: ProgramaApoio) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${programa.titulo} - FEALQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
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
          }
        }
      }
    }
  </script>
</head>
<body class="bg-background text-on-surface min-h-screen flex flex-col font-sans">
  <header class="bg-surface border-b border-outline-variant h-[36px] flex justify-between items-center px-4 sticky top-0 z-30">
    <div class="flex-1"></div>
    <div class="flex-1 text-[13px] font-bold text-primary truncate text-center flex items-center justify-center">
      FealqFlow - Portal de Formulários
    </div>
    <div class="flex-1"></div>
  </header>

  <main class="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 pb-24">
    <div class="bg-[#004F71] text-white p-3 rounded mb-6 text-sm flex items-center gap-2">
      <span class="material-symbols-outlined">info</span>
      Este é um formulário <strong>PLANO A</strong> (HTML Puro), servido a partir da pasta public/src/. Ele roda independentemente do React e carrega instantaneamente.
    </div>

    <div class="mb-6 border-b border-outline-variant pb-4">
      <div class="flex items-center gap-1 text-on-surface-variant text-[12px] mb-2">
        <span class="material-symbols-outlined text-[14px]">home</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-primary font-bold">Programa de Apoios</span>
      </div>
      <h1 class="text-2xl font-bold flex items-center gap-2 text-on-surface">
        ${programa.titulo}
        <span class="text-on-surface-variant text-[12px] font-normal">(${programa.codigo})</span>
      </h1>
      <p class="mt-2 text-sm text-on-surface-variant max-w-4xl">${programa.normas}</p>
    </div>

    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
      <h2 class="text-lg font-bold text-primary flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
        <span class="material-symbols-outlined">description</span>
        1. Dados Gerais
      </h2>
      
      <form id="formulario_${programa.id.replace(/-/g, '_')}" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Nome Completo</label>
            <input type="text" required class="w-full h-10 px-3 border border-outline-variant rounded bg-background focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm" placeholder="Ex: João da Silva">
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant mb-1 uppercase">E-mail</label>
            <input type="email" required class="w-full h-10 px-3 border border-outline-variant rounded bg-background focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm" placeholder="exemplo@fealq.com.br">
          </div>
        </div>
        
        <!-- Documentos Dinâmicos baseados no mapeamento -->
        <h3 class="text-md font-bold text-primary mt-8 mb-4 border-b border-outline-variant pb-2">
          2. Kit Documental
        </h3>
        
        <div class="space-y-4">
          ${programa.documentos.map(doc => `
          <div class="p-3 border border-outline-variant rounded bg-surface">
            <label class="block text-sm font-bold text-on-surface mb-1">
              ${doc.label} ${doc.obrigatorio ? '<span class="text-red-500">*</span>' : ''}
            </label>
            ${doc.descricao ? `<p class="text-xs text-on-surface-variant mb-2">${doc.descricao}</p>` : ''}
            ${doc.tipo === 'upload' ? `
              <input type="file" ${doc.obrigatorio ? 'required' : ''} class="text-sm w-full">
            ` : `<p class="text-xs italic text-on-surface-variant">Documento gerado ou providenciado externamente.</p>`}
          </div>
          `).join('')}
        </div>
      </form>
    </div>
  </main>

  <footer class="fixed bottom-0 left-0 w-full z-30 border-t border-outline-variant bg-surface-container-lowest">
    <div class="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
      <button type="button" class="px-4 md:px-6 h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-slate-100 transition-colors">
        Cancelar
      </button>
      
      <button type="submit" form="formulario_${programa.id.replace(/-/g, '_')}" class="bg-[#00A3A1] text-white px-4 md:px-6 h-[36px] rounded text-[13px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
        <span class="hidden sm:inline">Submeter Pedido</span>
        <span class="sm:hidden">Enviar</span>
        <span class="material-symbols-outlined text-[18px]">send</span>
      </button>
    </div>
  </footer>

  <script>
    document.getElementById('formulario_${programa.id.replace(/-/g, '_')}').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const btn = document.querySelector('button[type="submit"]');
      const textSpan = btn.querySelector('.hidden');
      textSpan.innerText = 'Enviando...';
      btn.style.opacity = '0.7';
      
      setTimeout(() => {
        alert('✅ Sucesso! O formulário estático [${programa.codigo}] foi submetido nativamente.');
        textSpan.innerText = 'Submeter Pedido';
        btn.style.opacity = '1';
        this.reset();
      }, 1000);
    });
  </script>
</body>
</html>`;
}

if (!fs.existsSync('public/src')) {
  fs.mkdirSync('public/src', { recursive: true });
}

PROGRAMAS_APOIO.forEach(programa => {
  const fileName = `${programa.id}.html`;
  const filePath = path.join('public/src', fileName);
  fs.writeFileSync(filePath, generateHtml(programa));
  console.log(`Generated ${filePath}`);
});
console.log('All forms generated successfully.');
