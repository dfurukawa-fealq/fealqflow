const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const modalHtml = `
      {/* Modal Bloqueio de Período */}
      {!isAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-surface rounded-xl p-lg w-[90vw] sm:w-[440px] max-w-[440px] shadow-2xl flex flex-col gap-lg border border-outline-variant animate-in zoom-in-95 duration-200 text-center">
            <div className="flex flex-col items-center gap-2 text-error font-bold text-[20px]">
              <span className="material-symbols-outlined text-[48px]">event_busy</span>
              Período de Submissão Encerrado
            </div>
            
            <div className="text-[14px] text-on-surface-variant flex flex-col gap-4">
              <p>
                Este formulário encontra-se <strong>fora do período de submissão</strong>.
              </p>
              
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 text-left">
                <span className="font-bold text-primary-container text-[12px] uppercase tracking-wide block mb-2">
                  Períodos Válidos:
                </span>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-[13px] text-on-surface font-medium">
                  {programa?.periodosSubmissao?.map((p: any, i: number) => (
                    <li key={i}>{formatarData(p.inicio)} a {formatarData(p.fim)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center pt-sm">
              <button
                onClick={() => navigate('/programas')}
                className="bg-primary text-on-primary px-xl h-[40px] rounded text-[14px] font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer w-full"
              >
                OK, Voltar para Programas
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Modal Bloqueio de Período')) {
  code = code.replace("<EnvioContext.Provider value={envio}>", "<EnvioContext.Provider value={envio}>\n" + modalHtml);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log('Fixed FormPageLayout.tsx');
}
