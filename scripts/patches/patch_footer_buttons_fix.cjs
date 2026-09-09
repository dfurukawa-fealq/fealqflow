const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const regex = /<footer className=\{`fixed bottom-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest print:hidden \$\{showSidebar \? 'left-sidebar-width' : 'left-0'\}`\}>[\s\S]*?<\/footer>/;

const fixedFooter = `<footer className={\`fixed bottom-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest print:hidden \${showSidebar ? 'left-sidebar-width' : 'left-0'}\`}>
          <div className="w-full max-w-[1200px] mx-auto px-md md:px-xl py-sm md:py-md flex justify-between items-center gap-sm md:gap-md">
            {/* Lado Esquerdo: Cancelar */}
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="px-sm md:px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>

            {/* Centro: Slot customizável (se houver) e Aviso Desktop */}
            <div className="flex-1 flex justify-center items-center gap-md px-md">
              {footerCenter}
              {!liberado && (
                <div className="hidden lg:flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap animate-pulse">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>
                    <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Regularize as pendências abaixo.
                  </span>
                </div>
              )}
            </div>

            {/* Lado Direito: Ações (Salvar e Submeter) */}
            <div className="flex items-center gap-sm">
              {botoesAcoes}
              
              {mostrarRascunho && (
                <button className="px-sm md:px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap">
                  <span className="hidden sm:inline">Salvar Rascunho</span>
                  <span className="sm:hidden">Salvar</span>
                </button>
              )}

              <button
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
              </button>
            </div>
          </div>
        </footer>`;

if (regex.test(code)) {
  code = code.replace(regex, fixedFooter);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log("Footer fixed!");
} else {
  console.log("Regex didn't match.");
}
