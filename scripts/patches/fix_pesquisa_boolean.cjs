const fs = require('node:fs');
const file = 'apps/frontend/src/pages/projetos/ProjetoPesquisa.tsx';
const source = fs.readFileSync(file, 'utf8').replaceAll("possuiConvenio === 'sim'", 'possuiConvenio');
fs.writeFileSync(file, source, 'utf8');
