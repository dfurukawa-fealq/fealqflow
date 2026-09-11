import { useLayout } from '../../contexts/LayoutContext';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { EnvioContext } from './EnvioContext';
import { PROGRAMAS_APOIO } from '../../data/programasApoio';

const formatarData = (dataStr: string) => {
  if (!dataStr) return '';
  const partes = dataStr.split('-');
  if (partes.length !== 3) return dataStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};


export interface FormPageLayoutProps {
  /** Trilha completa, incluindo a página atual: ['Área do Coordenador', 'Auxílio Viagem'] */
  breadcrumb: string[];
  titulo: string;
  /** Código oficial do formulário, ex. 'CONV-FR-03-CADT'. */
  codigo?: string;
  /** Selo ao lado do título, ex. 'Novo' ou 'Rascunho'. */
  badge?: string;
  /** Faixa de aviso exibida acima do conteúdo. */
  alerta?: ReactNode;
  /** Texto do botão principal, ex. 'Enviar Solicitação'. */
  acaoPrincipal: string;
  acaoIcone?: string;
  mostrarRascunho?: boolean;
  botoesAcoes?: ReactNode;
  footerCenter?: ReactNode;
  /** Permite forçar a liberação ou bloqueio do envio (ignora contagem de pendências do Kit Documental) */
  podeEnviar?: boolean;
  /** Coluna direita (4/12). Sem ela o conteúdo ocupa as 12 colunas. */
  sidebar?: ReactNode;
  children: ReactNode;
}

export const FormPageLayout = ({
  breadcrumb,
  titulo,
  codigo,
  badge,
  alerta,
  acaoPrincipal,
  acaoIcone = 'send',
  mostrarRascunho = true,
  botoesAcoes,
  footerCenter,
  sidebar,
  podeEnviar,
  children,
}: FormPageLayoutProps) => {
  const navigate = useNavigate();
  const { showSidebar } = useLayout();
  
  // Modais de Aviso de Trava e Confirmação de Cancelamento e Sucesso
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estado de Rascunho
  const storageKey = `fealqflow_draft_${codigo || titulo.replace(/\s+/g, '_')}`;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ultimoRascunhoSalvo, setUltimoRascunhoSalvo] = useState<string | null>(null);

  // Carrega timestamp de rascunho anterior se houver
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.savedAt) {
          setUltimoRascunhoSalvo(parsed.savedAt);
        }
      }
    } catch (err) {
      console.error('Erro ao ler rascunho do localStorage', err);
    }
  }, [storageKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const salvarRascunho = useCallback(() => {
    try {
      const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const draftData = {
        savedAt: timeStr,
        codigo,
        titulo,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setUltimoRascunhoSalvo(timeStr);
      showToast(`Rascunho salvo no navegador às ${timeStr}!`);
    } catch (e) {
      console.error('Erro ao salvar rascunho no localStorage:', e);
    }
  }, [storageKey, codigo, titulo]);

  const notificarAnexoArquivo = useCallback((_nomeArquivo: string) => {
    salvarRascunho();
  }, [salvarRascunho]);

  const limparRascunho = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setUltimoRascunhoSalvo(null);
    } catch (e) {
      console.error('Erro ao remover rascunho do localStorage:', e);
    }
  }, [storageKey]);

  // null = a página não tem Kit Documental; o envio segue bloqueado se podeEnviar não for informado.
  const [pendencias, setPendencias] = useState<number | null>(null);

  const programa = useMemo(() => PROGRAMAS_APOIO.find(p => p.codigo === codigo), [codigo]);

  const isAberto = useMemo(() => {
    if (!programa) return true;
    if (!programa.periodosSubmissao || programa.periodosSubmissao.length === 0) return true;
    const hoje = new Date().toISOString().split('T')[0];
    return programa.periodosSubmissao.some(p => hoje >= p.inicio && hoje <= p.fim);
  }, [programa]);

  const [formValido, setFormValido] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const checkValidity = useCallback(() => {
    if (formRef.current) {
      setFormValido(formRef.current.checkValidity());
    }
  }, []);

  useEffect(() => {
    checkValidity();
  }, [checkValidity]);

  const registrarPendencias = useCallback(
    (quantidade: number) => setPendencias(quantidade),
    [],
  );

  const envio = useMemo(() => ({
    registrarPendencias,
    formValido,
    salvarRascunho,
    limparRascunho,
    notificarAnexoArquivo,
    ultimoRascunhoSalvo,
  }), [registrarPendencias, formValido, salvarRascunho, limparRascunho, notificarAnexoArquivo, ultimoRascunhoSalvo]);

  const liberado = podeEnviar !== undefined ? podeEnviar : pendencias === 0;

  const handleCancelar = () => {
    const hasDraft = Boolean(localStorage.getItem(storageKey));
    if (hasDraft) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  const handleSubmeter = (e: React.MouseEvent) => {
    if (!liberado) {
      e.preventDefault();
      setShowWarningModal(true);
    } else {
      limparRascunho();
      setShowSuccessModal(true);
    }
  };

  return (
    <EnvioContext.Provider value={envio}>

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

      <div className="flex-1 flex flex-col min-h-screen bg-background print:bg-white print:text-black relative">
        <div className="print:hidden">
          <TopBar title={showSidebar ? "" : "FealqFlow - Portal de Formulários"} />
        </div>

        {/* Feedback Toast de Rascunho */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-secondary text-on-secondary px-md py-sm rounded shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
            <span className="material-symbols-outlined text-[18px]">bookmark_added</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-md md:px-xl pt-md md:pt-lg pb-[120px] print:pb-0 print:px-0">
          <div className="print:hidden">
            {alerta}
          </div>

          <div className="mb-lg border-b border-outline-variant pb-sm">
            <div>
              <div className="hidden md:flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">
                <span className="material-symbols-outlined text-[14px]">
                  home
                </span>
                {breadcrumb.map((item, i) => (
                  <span key={item} className="flex items-center gap-xs">
                    {i > 0 && (
                      <span className="material-symbols-outlined text-[14px]">
                        chevron_right
                      </span>
                    )}
                    <span
                      className={
                        i === breadcrumb.length - 1
                          ? 'text-primary font-bold'
                          : undefined
                      }
                    >
                      {item}
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-sm">
                <h1 className="text-[20px] text-on-surface font-bold flex items-center flex-wrap gap-sm">
                  {titulo}
                  {codigo && (
                    <span className="text-on-surface-variant text-[12px] font-normal">
                      ({codigo})
                    </span>
                  )}
                  {badge && (
                    <span className="px-xs py-[2px] bg-surface-container-high border border-outline-variant rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                      {badge}
                    </span>
                  )}
                </h1>

                {ultimoRascunhoSalvo && (
                  <div className="flex items-center gap-xs text-[11px] text-secondary font-medium bg-secondary-container/40 px-xs py-1 rounded">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    <span>Rascunho salvo às {ultimoRascunhoSalvo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start print:block">
            <form
              ref={formRef}
              onChange={checkValidity}
              onInput={checkValidity}
              onSubmit={(e) => e.preventDefault()}
              className={`flex flex-col gap-lg print:col-span-12 print:block ${
                sidebar ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {children}
            </form>
            {sidebar && (
              <div className="lg:col-span-4 flex flex-col gap-lg print:hidden">{sidebar}</div>
            )}
          </div>
        </main>

        {/* Rodapé Fixo */}
        <footer className={`fixed bottom-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest print:hidden ${showSidebar ? 'left-sidebar-width' : 'left-0'}`}>
          <div className="w-full max-w-[1200px] mx-auto px-md md:px-xl py-sm md:py-md flex justify-between items-center gap-sm md:gap-md">
            {/* Lado Esquerdo: Cancelar */}
            <div className="flex items-center">
              <button
                onClick={handleCancelar}
                className="px-sm md:px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>

            {/* Centro: Slot customizável (se houver) e Aviso Desktop */}
            <div className="flex-1 flex justify-center items-center gap-md px-1 md:px-md">
              {footerCenter}
              {!liberado && (
                <button
                  onClick={() => setShowWarningModal(true)}
                  className="flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-2 md:px-3 h-[28px] md:h-[28px] w-[28px] md:w-auto rounded-md shadow-xs animate-pulse hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  title="Ver Pendências"
                >
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span className="hidden md:inline whitespace-nowrap">
                    <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Clique para ver pendências.
                  </span>
                </button>
              )}
            </div>

            {/* Lado Direito: Ações (Salvar e Submeter) */}
            <div className="flex items-center gap-sm">
              {botoesAcoes}
              
              {mostrarRascunho && (
                <button
                  onClick={salvarRascunho}
                  className="px-sm md:px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span className="hidden sm:inline">Salvar Rascunho</span>
                  <span className="sm:hidden">Salvar</span>
                </button>
              )}

              <button
                onClick={handleSubmeter}
                title={
                  liberado
                    ? undefined
                    : pendencias === null
                      ? 'Preencha os campos obrigatórios para liberar o envio.'
                      : `Faltam ${pendencias} documento(s) obrigatório(s) no Kit de Documentos.`
                }
                className={`px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors whitespace-nowrap ${
                  liberado
                    ? 'bg-secondary text-on-secondary hover:opacity-90 cursor-pointer'
                    : 'bg-surface-container-highest text-[#F17C58] cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">{acaoPrincipal}</span>
                <span className="sm:hidden">{!liberado ? 'Bloqueado' : 'Enviar'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {!liberado ? 'warning' : acaoIcone}
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal 1: Aviso de Trava de Envio */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-xl p-lg w-[90vw] sm:w-[440px] max-w-[440px] shadow-2xl flex flex-col gap-lg border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-[#F17C58] font-bold text-[18px]">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              Trava de Envio Ativa
            </div>
            
            <div className="flex flex-col gap-md text-[14px] text-on-surface-variant">
              <p>
                O sistema bloqueia submissões incompletas para evitar inconformidades.
              </p>
              
              <div className="bg-[#F17C58]/10 p-md rounded-lg border border-[#F17C58]/20 flex flex-col gap-sm text-[13px]">
                <span className="font-bold text-[#F17C58] uppercase tracking-wide text-[11px]">Pendências identificadas:</span>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-on-surface">
                  {pendencias !== null && pendencias > 0 && (
                    <li>Faltam <strong>{pendencias}</strong> documento(s) obrigatório(s) no Kit de Documentos.</li>
                  )}
                  {!formValido && (
                    <li>Existem campos obrigatórios do formulário ainda não preenchidos.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-sm">
              <button
                onClick={() => setShowWarningModal(false)}
                className="bg-[#F17C58] text-white px-lg h-[40px] rounded text-[14px] font-bold hover:bg-[#d96644] transition-colors shadow-sm cursor-pointer"
              >
                Voltar e Preencher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmação de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg p-lg w-[90vw] sm:w-[440px] max-w-[440px] shadow-xl flex flex-col gap-4 border border-outline-variant">
            <div className="flex items-center gap-3 text-error font-bold text-lg border-b border-outline-variant pb-xs">
              <span className="material-symbols-outlined text-2xl">help</span>
              Confirmar Cancelamento
            </div>
            
            <p className="text-sm font-semibold text-on-surface">
              Se sair agora irá perder tudo e deverá recomeçar! Tudo bem?
            </p>

            <p className="text-xs text-on-surface-variant">
              Você possui alterações e/ou rascunho gravado localmente nesta máquina.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-xs mt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-2 rounded border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-low"
              >
                Permanecer
              </button>
              
              <button
                onClick={() => {
                  salvarRascunho();
                  setShowCancelModal(false);
                  navigate(-1);
                }}
                className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-highest"
              >
                Salvar e Sair
              </button>

              <button
                onClick={() => {
                  limparRascunho();
                  setShowCancelModal(false);
                  navigate(-1);
                }}
                className="px-3 py-2 rounded bg-error text-on-error text-xs font-bold hover:opacity-90"
              >
                Sair sem Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal 3: Sucesso ao Enviar */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-xl p-lg w-[90vw] sm:w-[440px] max-w-[440px] shadow-2xl flex flex-col gap-lg border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-md text-center">
              <div className="w-[64px] h-[64px] rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-secondary">
                  check_circle
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-on-surface">
                Solicitação enviada com sucesso!
              </h2>
              <p className="text-[14px] text-on-surface-variant">
                Seu formulário e kit documental foram recebidos pelo sistema e estão em processamento.
              </p>
            </div>
            
            <div className="flex justify-center pt-xs">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/programas');
                }}
                className="bg-secondary text-on-secondary px-xl h-[40px] rounded text-[14px] font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer w-full sm:w-auto"
              >
                Voltar para Programas
              </button>
            </div>
          </div>
        </div>
      )}
    </EnvioContext.Provider>
  );
};
