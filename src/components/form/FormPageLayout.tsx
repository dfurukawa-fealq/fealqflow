import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { EnvioContext } from './EnvioContext';

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
  /** Callback acionado ao clicar no botão de ação principal */
  aoSubmeter?: () => void;
  children: ReactNode;
}

/**
 * Estrutura padrão de todas as páginas de formulário: barra superior,
 * bloco de título com breadcrumb e código, grade 8/4 e rodapé fixo
 * de ações. Modelo: Cadastro de Financiadora (/form-financiadora).
 */
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
  aoSubmeter,
  children,
}: FormPageLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);

  // null = a página não tem Kit Documental; o envio segue bloqueado se podeEnviar não for informado.
  const [pendencias, setPendencias] = useState<number | null>(null);
  const registrarPendencias = useCallback(
    (quantidade: number) => setPendencias(quantidade),
    [],
  );
  const envio = useMemo(() => ({ registrarPendencias }), [registrarPendencias]);
  const liberado = podeEnviar !== undefined ? podeEnviar : pendencias === 0;

  useEffect(() => {
    if (!sidebarMobileAberta) return;
    const fecharComEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarMobileAberta(false);
    };
    document.addEventListener('keydown', fecharComEsc);
    return () => document.removeEventListener('keydown', fecharComEsc);
  }, [sidebarMobileAberta]);

  return (
    <EnvioContext.Provider value={envio}>
      <div className="flex-1 flex flex-col min-h-screen bg-background print:bg-white print:text-black">
        <div className="print:hidden">
          <TopBar />
        </div>

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-sm sm:px-md lg:px-xl py-md lg:py-lg pb-[190px] lg:pb-[80px] print:pb-0 print:px-0">
          <div className="print:hidden">
            {alerta}
          </div>

          <div className="mb-lg border-b border-outline-variant pb-sm">
            <div>
              <div className="flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">
                <Link to="/" className="flex items-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[14px]">
                    home
                  </span>
                </Link>
                {breadcrumb.map((item, i) => {
                  const isLast = i === breadcrumb.length - 1;
                  let targetUrl: string | null = null;
                  if (!isLast) {
                    const lower = item.toLowerCase();
                    if (lower.includes('coordenador') || lower.includes('projeto')) {
                      targetUrl = '/projetos';
                    } else if (lower.includes('apoio') || lower.includes('programa')) {
                      targetUrl = '/programas-de-apoio';
                    }
                  }

                  return (
                    <span key={item} className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        chevron_right
                      </span>
                      {targetUrl ? (
                        <Link to={targetUrl} className="hover:text-primary hover:underline transition-colors">
                          {item}
                        </Link>
                      ) : (
                        <span className={isLast ? 'text-primary font-bold' : undefined}>
                          {item}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
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
            </div>
          </div>

          {sidebar && (
            <button
              type="button"
              onClick={() => setSidebarMobileAberta((aberta) => !aberta)}
              className={`lg:hidden w-full mb-md min-h-[44px] px-md py-sm rounded-lg border flex items-center justify-between font-semibold text-[13px] ${pendencias === 0 ? 'border-secondary/50 bg-secondary-fixed/30 text-secondary' : 'border-amber-300 bg-amber-50 text-amber-900'}`}
              aria-expanded={sidebarMobileAberta}
            >
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                  Kit Documental e pendências
                </span>
                <span className="text-[10px] uppercase tracking-wide">
                  {pendencias === 0 ? 'Completo' : 'Pendente'}
                </span>
              </span>
              <span className="material-symbols-outlined">
                {sidebarMobileAberta ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start lg:min-h-0 print:block">
            <div
              className={`flex flex-col gap-lg lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 print:col-span-12 print:block ${
                sidebar ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {children}
            </div>
            {sidebar && (
              <>
                {sidebarMobileAberta && (
                  <button
                    type="button"
                    aria-label="Fechar Kit Documental"
                    onClick={() => setSidebarMobileAberta(false)}
                    className="lg:hidden fixed inset-0 bg-black/35 z-40 print:hidden"
                  />
                )}
                <div className={`${sidebarMobileAberta ? 'flex fixed bottom-0 left-0 right-0 z-50 w-screen max-w-[100vw] max-h-[78vh] overflow-hidden rounded-t-2xl border-t-2 border-primary/30 bg-surface-container-lowest p-sm sm:p-md shadow-2xl' : 'hidden'} lg:flex lg:static lg:z-auto lg:w-auto lg:max-w-none lg:max-h-[calc(100vh-220px)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:col-span-4 flex-col gap-lg lg:overflow-y-auto lg:overscroll-contain lg:pr-2 print:hidden`}>
                  <div className="lg:hidden flex justify-center -mt-xs mb-xs">
                    <span className="block w-12 h-1.5 rounded-full bg-outline-variant" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col gap-lg">{sidebar}</div>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 lg:left-sidebar-width right-0 bg-surface-container-lowest border-t border-outline-variant p-sm sm:p-md px-sm sm:px-xl flex flex-col gap-sm z-30 overflow-x-hidden print:hidden">
          {sidebar && (
            <button
              type="button"
              onClick={() => setSidebarMobileAberta((aberta) => !aberta)}
              className={`lg:hidden w-full min-h-[36px] px-sm rounded border flex items-center justify-center gap-xs text-[11px] font-bold ${pendencias === 0 ? 'border-secondary/50 bg-secondary-fixed/30 text-secondary' : 'border-amber-300 bg-amber-50 text-amber-900'}`}
              aria-expanded={sidebarMobileAberta}
              title={pendencias === 0 ? 'Kit completo' : 'Abrir Kit Documental'}
            >
              <span className="material-symbols-outlined text-[17px]">{pendencias === 0 ? 'task_alt' : 'attach_file'}</span>
              <span>{pendencias === 0 ? 'Kit completo' : 'Kit pendente'}</span>
              <span className="material-symbols-outlined text-[16px]">{sidebarMobileAberta ? 'expand_more' : 'expand_less'}</span>
            </button>
          )}

          <div className="grid grid-cols-4 gap-xs items-center min-w-0 w-full">
          <div className="flex items-center gap-md min-w-0 overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-0 h-[36px] rounded border border-transparent text-on-surface text-[10px] sm:text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"
              title="Cancelar"
            >
              <span className="material-symbols-outlined text-[17px] sm:hidden">close</span>
              <span className="hidden sm:inline">Cancelar</span>
            </button>
            {footerCenter && (
              <div className="flex-1 px-md flex justify-end">
                {footerCenter}
              </div>
            )}
          </div>
          <div className="col-span-3 min-w-0 overflow-hidden grid grid-cols-3 items-stretch gap-xs [&>button]:min-w-0 [&>button]:w-full [&>div]:min-w-0 [&>div]:max-w-full [&>div]:overflow-hidden [&>div]:w-full [&_button]:min-w-0 [&_button]:max-w-full [&_button]:w-full [&_button]:overflow-hidden">
            {botoesAcoes}
            {mostrarRascunho && (
              <button className="px-0 sm:px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors" title="Salvar Rascunho">
                <span className="material-symbols-outlined text-[17px] sm:hidden">save</span>
                <span className="hidden sm:inline">Salvar Rascunho</span>
              </button>
            )}
            <button
              type="button"
              disabled={!liberado}
              onClick={aoSubmeter}
              title={
                liberado
                  ? undefined
                  : pendencias === null
                    ? 'Preencha os campos obrigatórios para liberar o envio.'
                    : `Faltam ${pendencias} documento(s) obrigatório(s) no Kit de Documentos.`
              }
              className={`px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors ${
                liberado
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">{acaoPrincipal}</span>
              <span className="material-symbols-outlined text-[18px]">
                {acaoIcone}
              </span>
            </button>
          </div>
          </div>
        </footer>
      </div>
    </EnvioContext.Provider>
  );
};
