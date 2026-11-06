const fs = require('node:fs');
const file = 'apps/frontend/src/pages/projetos/ProjetoPesquisa.tsx';
let source = fs.readFileSync(file, 'utf8');
const marker = '      </FormSection>\n\n        <Field label=';
const index = source.indexOf(marker);
if (index < 0) throw new Error('Estrutura da seção de pesquisa não encontrada.');
source = `${source.slice(0, index)}      </FormSection>\n\n      <FormSection numero={2} icone="science" titulo="Dados do Projeto & Detalhamento Técnico">\n        <Field label=${source.slice(index + marker.length)}`;
fs.writeFileSync(file, source, 'utf8');
