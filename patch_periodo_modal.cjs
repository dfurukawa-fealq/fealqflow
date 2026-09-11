const fs = require('fs');

let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

if (!code.includes('isAberto') || !code.includes('Periodo de Submissão Encerrado')) {
  // Add imports if needed, we have useMemo already probably. Let's make sure.
  if (!code.includes('import { formatDate')) {
    // Add a simple formatter function at the top
    code = code.replace("import { FormSection } from './FormSection';", 
      "import { FormSection } from './FormSection';\n\nconst formatarData = (dataStr: string) => {\n  if (!dataStr) return '';\n  const partes = dataStr.split('-');\n  if (partes.length !== 3) return dataStr;\n  return `${partes[2]}/${partes[1]}/${partes[0]}`;\n};\n");
  }

  // Inside FormPageLayout component:
  const isAbertoLogic = `
  const isAberto = useMemo(() => {
    if (!programa.periodosSubmissao || programa.periodosSubmissao.length === 0) return true;
    const hoje = new Date().toISOString().split('T')[0];
    return programa.periodosSubmissao.some(p => hoje >= p.inicio && hoje <= p.fim);
  }, [programa]);
`;
  
  // Inject the hook just after useState
  code = code.replace("const [pendencias, setPendencias] = useState<number | null>(null);", 
    "const [pendencias, setPendencias] = useState<number | null>(null);\n" + isAbertoLogic);

  // Inject the Modal HTML right after <EnvioContext.Provider ...> 
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
                  {programa.periodosSubmissao?.map((p, i) => (
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
  
  code = code.replace("<EnvioContext.Provider value={contextValue}>", 
    "<EnvioContext.Provider value={contextValue}>\n" + modalHtml);

  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log('Patched FormPageLayout.tsx');
}
