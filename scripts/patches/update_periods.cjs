const fs = require('fs');

let code = fs.readFileSync('src/data/programasApoio.ts', 'utf8');

// 1. Add interface
if (!code.includes('export interface PeriodoSubmissao')) {
  code = code.replace("export interface ProgramaApoio {", 
`export interface PeriodoSubmissao {
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
}

export interface ProgramaApoio {`);
  code = code.replace("documentos: DocumentoExigido[];", "documentos: DocumentoExigido[];\n  periodosSubmissao?: PeriodoSubmissao[];");
}

// Map of months to dates
const m = {
  mar: "{ inicio: '2026-03-01', fim: '2026-03-31' }",
  abr: "{ inicio: '2026-04-01', fim: '2026-04-30' }",
  mai: "{ inicio: '2026-05-01', fim: '2026-05-31' }",
  jul: "{ inicio: '2026-07-01', fim: '2026-07-31' }",
  ago: "{ inicio: '2026-08-01', fim: '2026-08-31' }",
  set: "{ inicio: '2026-09-01', fim: '2026-09-30' }",
  out: "{ inicio: '2026-10-01', fim: '2026-10-31' }"
};

const periodsMap = {
  'bolsa-pos': `periodosSubmissao: [${m.mar}, ${m.abr}, ${m.mai}, ${m.jul}, ${m.set}, ${m.out}],`,
  'bolsa-graduacao': `periodosSubmissao: [${m.mar}, ${m.ago}],`,
  'infraestrutura': `periodosSubmissao: [${m.abr}],`,
  'viagem': `periodosSubmissao: [${m.mar}, ${m.ago}, ${m.out}],`,
  'apresentacao': `periodosSubmissao: [${m.mar}, ${m.ago}, ${m.out}],`,
  'interesse-comunidade': `periodosSubmissao: [${m.mar}, ${m.set}],`,
  'material-eventos': `periodosSubmissao: [${m.mar}, ${m.ago}, ${m.out}],`,
  'cultura-extensao': `periodosSubmissao: [${m.abr}, ${m.ago}],`
};

// Insert into objects
for (const [id, periodCode] of Object.entries(periodsMap)) {
  const regex = new RegExp(`id:\\s*'${id}',([\\s\\S]*?)(?=documentos:)`, 'g');
  code = code.replace(regex, (match, p1) => {
    if (match.includes('periodosSubmissao')) return match; // already injected
    return `id: '${id}',${p1}  ${periodCode}\n  `;
  });
}

fs.writeFileSync('src/data/programasApoio.ts', code);
console.log('Updated programasApoio.ts with periods');
