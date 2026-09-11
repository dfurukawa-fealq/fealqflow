const fs = require('fs');
let code = fs.readFileSync('src/data/programasApoio.ts', 'utf8');

// replace all those messed up lines with just the form doc
const badStart = "const DOC_FORMULARIO: DocumentoExigido = {";
const badEnd = "};\nconst DOC_REGULAMENTO: DocumentoExigido = {";
const startIdx = code.indexOf(badStart);
const endIdx = code.indexOf(badEnd) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + 
`const DOC_FORMULARIO: DocumentoExigido = {
  id: 'formulario',
  label: 'Formulário de Solicitação de Apoio',
  descricao: 'Preenchimento digital gerado pelo sistema.',
  tipo: 'gerado',
  obrigatorio: true,
};

const DOC_REGULAMENTO: DocumentoExigido = {
  id: 'regulamento',
  label: 'Aceite do Regulamento de Apoios (REG-C-003)',
  descricao: 'Leitura e concordância obrigatória com as normas vigentes do programa.',
  tipo: 'aceite',
  obrigatorio: true,
};
` + code.substring(code.indexOf("export const PROGRAMAS_APOIO: ProgramaApoio[] = ["));

  fs.writeFileSync('src/data/programasApoio.ts', code);
}
