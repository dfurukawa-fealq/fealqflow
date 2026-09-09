const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

// 1. Hide breadcrumb on mobile
code = code.replace(
  '<div className="flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">',
  '<div className="hidden md:flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">'
);

// 2. Make "Cancelar" smaller padding on mobile
code = code.replace(
  'className="px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"',
  'className="px-sm md:px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"'
);

// 3. Make "Salvar Rascunho" text dynamic
code = code.replace(
  '<button className="px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors">\n                Salvar Rascunho\n              </button>',
  `<button className="px-sm md:px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap">
                <span className="hidden sm:inline">Salvar Rascunho</span>
                <span className="sm:hidden">Salvar</span>
              </button>`
);

// 4. Update the submit button
const buttonRegex = /<button[\s\S]*?disabled=\{!liberado\}[\s\S]*?<\/button>/;

const newButton = `<button
              onClick={(e) => {
                if (!liberado) {
                  e.preventDefault();
                  setShowMobileWarning(true);
                }
              }}
              title={
                liberado
                  ? undefined
                  : pendencias === null
                    ? 'Preencha os campos obrigatórios para liberar o envio.'
                    : \`Faltam \${pendencias} documento(s) obrigatório(s) no Kit de Documentos.\`
              }
              className={\`px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors whitespace-nowrap \${
                liberado
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-container-highest text-[#F17C58] cursor-not-allowed'
              }\`}
            >
              <span className="hidden sm:inline">{acaoPrincipal}</span>
              <span className="sm:hidden">{!liberado ? 'Bloqueado' : 'Enviar'}</span>
              <span className="material-symbols-outlined text-[18px]">
                {!liberado ? 'warning' : acaoIcone}
              </span>
            </button>`;

code = code.replace(buttonRegex, newButton);

fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
console.log('Mobile buttons updated');
