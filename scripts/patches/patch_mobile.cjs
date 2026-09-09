const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

// 1. Add useState for showMobileWarning
code = code.replace(
  "const { showSidebar } = useLayout();",
  "const { showSidebar } = useLayout();\n  const [showMobileWarning, setShowMobileWarning] = useState(false);"
);

// 2. Reduce horizontal padding on main
code = code.replace(
  '<main className="flex-1 w-full max-w-[1200px] mx-auto px-xl py-lg pb-[80px] print:pb-0 print:px-0">',
  '<main className="flex-1 w-full max-w-[1200px] mx-auto px-md md:px-xl py-md md:py-lg pb-[80px] print:pb-0 print:px-0">'
);

// 3. Reduce footer padding
code = code.replace(
  '<div className="w-full max-w-[1200px] mx-auto px-xl py-md flex justify-between items-center gap-md">',
  '<div className="w-full max-w-[1200px] mx-auto px-md md:px-xl py-sm md:py-md flex justify-between items-center gap-sm md:gap-md">'
);

// 4. Hide inline warning on mobile
const oldWarning = `<div className="flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap mx-auto animate-pulse">`;
const newWarning = `<div className="hidden lg:flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap mx-auto animate-pulse">`;
code = code.replace(oldWarning, newWarning);

// 5. Update the button
const oldButtonStr = `            <button
              disabled={!liberado}
              title={
                liberado
                  ? undefined
                  : pendencias === null
                    ? 'Preencha os campos obrigatórios para liberar o envio.'
                    : \`Faltam \${pendencias} documento(s) obrigatório(s) no Kit de Documentos.\`
              }
              className={\`px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors \${
                liberado
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              }\`}
            >
              {acaoPrincipal}
              <span className="material-symbols-outlined text-[18px]">
                {acaoIcone}
              </span>
            </button>`;

const newButtonStr = `            <button
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
              className={\`px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors \${
                liberado
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-container-highest text-[#F17C58] cursor-not-allowed'
              }\`}
            >
              <span className="hidden sm:inline">{acaoPrincipal}</span>
              <span className="sm:hidden">{!liberado ? 'Bloqueado' : 'Submeter'}</span>
              <span className="material-symbols-outlined text-[18px]">
                {!liberado ? 'warning' : acaoIcone}
              </span>
            </button>`;

code = code.replace(oldButtonStr, newButtonStr);

// 6. Add modal at the end before </EnvioContext.Provider>
const modalStr = `      {showMobileWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 lg:hidden">
          <div className="bg-surface rounded-lg p-lg w-full max-w-sm shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#F17C58] font-bold text-lg">
              <span className="material-symbols-outlined text-2xl">warning</span>
              Trava de Envio Ativa
            </div>
            <p className="text-sm text-on-surface-variant">
              O sistema bloqueia envios incompletos. Regularize as pendências (como documentos obrigatórios ou campos não preenchidos) para poder submeter o pedido.
            </p>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setShowMobileWarning(false)}
                className="bg-secondary text-white px-4 py-2 rounded text-sm font-bold"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}`;

code = code.replace("</EnvioContext.Provider>", modalStr + "\n    </EnvioContext.Provider>");

fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
console.log('Mobile optimizations applied');
