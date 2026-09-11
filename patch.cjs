const fs = require('fs');
let code = fs.readFileSync('src/data/programasApoio.ts', 'utf8');

code = code.replace(
  "export type TipoDocumento = 'gerado' | 'upload' | 'externo';",
  "export type TipoDocumento = 'gerado' | 'upload' | 'externo' | 'aceite';"
);

const DOC_REGULAMENTO_CODE = `
const DOC_REGULAMENTO: DocumentoExigido = {
  id: 'regulamento',
  label: 'Aceite do Regulamento de Apoios (REG-C-003)',
  descricao: 'Leitura e concordância obrigatória com as normas vigentes do programa.',
  tipo: 'aceite',
  obrigatorio: true,
};
`;

code = code.replace(
  /const DOC_FORMULARIO: DocumentoExigido = \{[\s\S]*?\};\n/,
  match => match + "\n" + DOC_REGULAMENTO_CODE
);

code = code.replace(/documentos: \[\n\s+DOC_FORMULARIO,/g, "documentos: [\n      DOC_FORMULARIO,\n      DOC_REGULAMENTO,");

fs.writeFileSync('src/data/programasApoio.ts', code);
