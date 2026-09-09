const fs = require('fs');
let agents = fs.readFileSync('AGENTS.md', 'utf8');

const wpSection = `
## 🌍 Build & Integração com WordPress

A aplicação é um Single Page Application (SPA) renderizado no lado do cliente.
Para integrar o FealqFlow a um ecossistema existente como o WordPress, as regras de **Build** devem ser rigorosamente seguidas.

### Processo de Build (\`npm run build\`)
O comando de build compila toda a aplicação React + Tailwind e gera artefatos estáticos prontos para produção.
1. O Vite está configurado com \`base: './'\`. Isso significa que todos os caminhos gerados para imagens, CSS e JS serão **relativos**. Essa regra não deve ser removida, pois é o que permite que a aplicação rode em subdiretórios do WordPress (ex: \`fealq.com.br/portal-formularios/\`).
2. Ao rodar \`npm run build\`, a pasta \`/dist/\` será criada contendo:
   - \`index.html\`: Ponto de entrada (esqueleto).
   - \`/assets/*.js\`: Todo o código React, lógicas e componentes minificados.
   - \`/assets/*.css\`: Todo o estilo Tailwind purgado e minificado.

### Como embarcar no WordPress
Existem duas formas principais de integrar o conteúdo da pasta \`/dist/\` no WordPress:
1. **Via iFrame (Mais simples e isolado)**: 
   - Fazer upload da pasta \`dist/\` via FTP para dentro do seu servidor (ex: \`wp-content/uploads/fealqflow/\`).
   - Na página do WordPress, usar um bloco HTML com \`<iframe src="/wp-content/uploads/fealqflow/index.html" width="100%" height="1000px"></iframe>\`.
2. **Via Custom Page Template (Avançado)**:
   - Copiar a div \`<div id="root"></div>\` para o corpo de uma página do WordPress.
   - Fazer o "enqueue" (carregamento) do arquivo \`.js\` e \`.css\` gerados na pasta \`assets/\` dentro do \`functions.php\` ou em um plugin de injeção de Headers/Footers. O próprio script do React vai assumir o controle da div \`#root\` e renderizar o sistema inteiro ali dentro, herdando inclusive parte do Header/Footer natural do site Wordpress.
`;

if (!agents.includes("Integração com WordPress")) {
  agents += wpSection;
  fs.writeFileSync('AGENTS.md', agents);
  console.log('AGENTS.md updated with WordPress integration docs.');
} else {
  console.log('AGENTS.md already contains WordPress instructions.');
}
