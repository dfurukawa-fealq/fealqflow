const fs = require('fs');

let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

if (!code.includes('import { PROGRAMAS_APOIO }')) {
  code = code.replace("import { EnvioContext } from './EnvioContext';", 
    "import { EnvioContext } from './EnvioContext';\nimport { PROGRAMAS_APOIO } from '../../data/programasApoio';");
}

code = code.replace(
  "const isAberto = useMemo(() => {",
`const programa = useMemo(() => PROGRAMAS_APOIO.find(p => p.codigo === codigo), [codigo]);

  const isAberto = useMemo(() => {
    if (!programa) return true;`
);

code = code.replace(
  "{programa.periodosSubmissao?.map((p, i) => (",
  "{programa?.periodosSubmissao?.map((p: any, i: number) => ("
);

fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
