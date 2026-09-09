const fs = require('fs');

let config = fs.readFileSync('vite.config.ts', 'utf8');

if (!config.includes("base: './'")) {
  config = config.replace(
    'return {',
    "return {\n    base: './', // Necessário para exportação relativa (WordPress/Diretórios)"
  );
  fs.writeFileSync('vite.config.ts', config);
  console.log('vite.config.ts updated with base: "./"');
} else {
  console.log('vite.config.ts already has base defined.');
}
