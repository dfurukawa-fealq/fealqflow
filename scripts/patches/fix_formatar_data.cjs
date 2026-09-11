const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const formatarDataFn = `
const formatarData = (dataStr: string) => {
  if (!dataStr) return '';
  const partes = dataStr.split('-');
  if (partes.length !== 3) return dataStr;
  return \`\${partes[2]}/\${partes[1]}/\${partes[0]}\`;
};
`;

if (!code.includes('const formatarData')) {
  code = code.replace("import { PROGRAMAS_APOIO } from '../../data/programasApoio';", "import { PROGRAMAS_APOIO } from '../../data/programasApoio';\n" + formatarDataFn);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log('Added formatarData function');
}
