const fs = require('fs');

// 1. Criar o diretório public/src
if (!fs.existsSync('public/src')) {
  fs.mkdirSync('public/src', { recursive: true });
}

// 2. Criar um arquivo HTML de exemplo robusto
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulário Estático - FEALQ</title>
  
  <!-- Tailwind CSS via CDN para manter o layout idêntico ao React sem precisar compilar -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Ícones Material Symbols -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  
  <!-- Configuração das Cores Oficiais no Tailwind CDN -->
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

  <!-- Header (Idêntico ao TopBar do React) -->
  <header class="bg-surface border-b border-outline-variant h-[36px] flex justify-between items-center px-4 sticky top-0 z-30">
    <div class="flex-1"></div>
    <div class="flex-1 text-[13px] font-bold text-primary truncate text-center flex items-center justify-center">
      FealqFlow - Portal de Formulários
    </div>
    <div class="flex-1"></div>
  </header>

  <!-- Container Principal -->
  <main class="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 pb-24">
    
    <!-- Alerta de Modo -->
    <div class="bg-[#004F71] text-white p-3 rounded mb-6 text-sm flex items-center gap-2">
      <span class="material-symbols-outlined">info</span>
      Este é um formulário <strong>PLANO A</strong> (HTML Puro), servido a partir da pasta public/src/. Ele roda independentemente do React e carrega instantaneamente.
    </div>

    <!-- Cabeçalho do Formulário -->
    <div class="mb-6 border-b border-outline-variant pb-4">
      <div class="flex items-center gap-1 text-on-surface-variant text-[12px] mb-2">
        <span class="material-symbols-outlined text-[14px]">home</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-primary font-bold">Modelos HTML</span>
      </div>
      <h1 class="text-2xl font-bold flex items-center gap-2 text-on-surface">
        Formulário Padrão Estático
        <span class="text-on-surface-variant text-[12px] font-normal">(HTML-PLAN-A)</span>
      </h1>
    </div>

    <!-- Bloco de Formulário -->
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
      <h2 class="text-lg font-bold text-primary flex items-center gap-2 mb-6 border-b border-outline-variant pb-2">
        <span class="material-symbols-outlined">description</span>
        1. Dados Gerais
      </h2>
      
      <form id="meuFormulario" class="space-y-5">
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
        
        <div>
          <label class="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Justificativa</label>
          <textarea rows="4" class="w-full p-3 border border-outline-variant rounded bg-background focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm resize-none" placeholder="Digite aqui os detalhes..."></textarea>
        </div>
      </form>
    </div>
  </main>

  <!-- Rodapé (Fixo) -->
  <footer class="fixed bottom-0 left-0 w-full z-30 border-t border-outline-variant bg-surface-container-lowest">
    <div class="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
      <button type="button" class="px-4 md:px-6 h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-slate-100 transition-colors">
        Cancelar
      </button>
      
      <button type="submit" form="meuFormulario" class="bg-[#00A3A1] text-white px-4 md:px-6 h-[36px] rounded text-[13px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
        <span class="hidden sm:inline">Submeter Pedido</span>
        <span class="sm:hidden">Enviar</span>
        <span class="material-symbols-outlined text-[18px]">send</span>
      </button>
    </div>
  </footer>

  <!-- Lógica Javascript Nativa -->
  <script>
    document.getElementById('meuFormulario').addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o recarregamento da tela
      
      // Muda o texto do botão para dar feedback
      const btn = document.querySelector('button[type="submit"]');
      const textSpan = btn.querySelector('.hidden');
      textSpan.innerText = 'Enviando...';
      btn.style.opacity = '0.7';
      
      setTimeout(() => {
        alert('✅ Sucesso! O formulário HTML puro foi submetido nativamente.');
        textSpan.innerText = 'Submeter Pedido';
        btn.style.opacity = '1';
        this.reset();
      }, 1000);
    });
  </script>
</body>
</html>`;

fs.writeFileSync('public/src/exemplo-formulario.html', htmlContent);

// 3. Atualizar o AGENTS.md para documentar o "Plano A"
let agents = fs.readFileSync('AGENTS.md', 'utf8');

const planASection = `
## 📄 Plano A: HTML Puro Estático (Diretório \`public/src\`)

Por definição estratégica, a aplicação adota o modelo de **Plano A baseado em HTML Puro** para cenários que exigem máxima performance, zero dependência de JavaScript empacotado, ou injeção imaculada em iFrames no WordPress.

### Regras da Arquitetura Plano A:
1. **Localização**: Todos os arquivos HTML puros DEVEM ser criados e mantidos dentro do diretório \`public/src/\`.
2. **Processamento (Bypass do Build)**: Os arquivos inseridos na pasta \`public/\` **NÃO** passam pelo pipeline de compilação do Vite. Eles são copiados **exatamente como estão** para a pasta \`dist/src/\` no momento do build. 
3. **Estilização Autônoma**: Para garantir o visual idêntico ao React, estes arquivos utilizam o Tailwind CSS via CDN (\`<script src="https://cdn.tailwindcss.com"></script>\`) configurado com as cores originais da FEALQ na tag \`<head>\`.
4. **Interatividade Nativa**: Toda a lógica de estado, validação e alertas ocorre usando Vanilla JavaScript (JS nativo) em tags \`<script>\` ao final da página.
5. **Integração Extrema**: Ideal para quando o WordPress tiver conflitos com bibliotecas React. Um iFrame apontando para \`/wp-content/uploads/fealqflow/src/nome-do-form.html\` carregará o formulário em milissegundos sem overhead.
`;

if (!agents.includes("Plano A: HTML Puro Estático")) {
  agents += planASection;
  fs.writeFileSync('AGENTS.md', agents);
  console.log('AGENTS.md updated with Plan A documentation.');
} else {
  console.log('AGENTS.md already has Plan A documented.');
}
