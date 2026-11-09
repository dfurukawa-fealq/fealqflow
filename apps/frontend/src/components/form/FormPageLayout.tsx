import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { EnvioContext } from './EnvioContext';
import { FormActionButton } from './FormActionButton';
import { useProcesso } from '../../contexts/ProcessoContext';
import { armazenamentoPersistenteDisponivel } from '../../utils/safeStorage';

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
  const processo = useProcesso();
  const somenteLeitura = processo?.somenteLeitura ?? false;
  const mainRef = useRef<HTMLElement>(null);
  const ocupadoRef = useRef(false);
  const [executando, setExecutando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [toast, setToast] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const mostrarToast = useCallback((tipo: 'sucesso' | 'erro', mensagem: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast({ tipo, mensagem });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
  }, []);

  // null = a página não tem Kit Documental; o envio segue bloqueado se podeEnviar não for informado.
  const [pendencias, setPendencias] = useState<number | null>(null);
  const registrarPendencias = useCallback(
    (quantidade: number) => setPendencias(quantidade),
    [],
  );
  const envio = useMemo(() => ({ registrarPendencias }), [registrarPendencias]);
  const liberado = (podeEnviar ?? true) && (pendencias === null || pendencias === 0)
    && Boolean(processo || aoSubmeter) && !executando && !somenteLeitura;

  useEffect(() => {
    // Os campos do formulário são controlados pelo React/ProcessoContext.
    // Não sincronizar novamente pelo DOM evita duas fontes de verdade, perda de foco e cursor instável.
    return;
    /*
    const raiz = mainRef.current;
    if (!raiz || !processo) return;
    const controles = () => [...raiz.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')]
      .filter((elemento) => !['file', 'hidden', 'button', 'submit'].includes(elemento.type));
    const chave = (elemento: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      const indice = controles().indexOf(elemento);
      return indice < 0 ? '' : `dom:${indice}:${elemento.name || elemento.id || elemento.tagName}`;
    };
    for (const elemento of controles()) {
      const salvo = processo.dados.campos[chave(elemento)];
      if (typeof salvo === 'string') elemento.value = salvo;
      else if (typeof salvo === 'boolean' && elemento instanceof HTMLInputElement) elemento.checked = salvo;
    }
    const capturar = (evento: Event) => {
      const elemento = evento.target;
      if (!(elemento instanceof HTMLInputElement || elemento instanceof HTMLSelectElement || elemento instanceof HTMLTextAreaElement)) return;
      if (['file', 'hidden', 'button', 'submit'].includes(elemento.type)) return;
      const nome = chave(elemento);
      if (nome) processo.atualizarCampo(nome, elemento instanceof HTMLInputElement && ['checkbox', 'radio'].includes(elemento.type) ? elemento.checked : elemento.value);
    };
    raiz.addEventListener('input', capturar, true);
    raiz.addEventListener('change', capturar, true);
    return () => { raiz.removeEventListener('input', capturar, true); raiz.removeEventListener('change', capturar, true); };
  // O provider monta o formulário após carregar o processo; a hidratação ocorre uma vez por UUID.
  }, [processo?.processo.id]);
    */
  }, []);

  const executar = async (acao: () => Promise<void>) => {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setExecutando(true);
    setErroAcao('');
    try { await acao(); }
    catch (falha) { setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível concluir a operação.'); }
    finally { ocupadoRef.current = false; setExecutando(false); }
  };

  const salvarRascunho = () => {
    if (!processo) return;
    void executar(async () => {
      try {
        await processo.salvar();
        mostrarToast('sucesso', 'Rascunho salvo com sucesso!');
      } catch (falha) {
        mostrarToast('erro', falha instanceof Error ? falha.message : 'Não foi possível salvar o rascunho.');
        throw falha;
      }
    });
  };

  const validarCampos = () => {
    const campos = mainRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:required, select:required, textarea:required');
    const pendentes: string[] = [];
    let primeiroPendente: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;
    for (const campo of campos || []) {
      if (!campo.checkValidity()) {
        primeiroPendente ??= campo;
        const rotulo = campo.labels?.[0]?.textContent?.replace('*', '').trim()
          || campo.getAttribute('aria-label')
          || campo.name
          || 'Campo obrigatório';
        if (!pendentes.includes(rotulo)) pendentes.push(rotulo);
      }
    }
    if (primeiroPendente) {
      primeiroPendente.reportValidity();
      primeiroPendente.focus();
      const resumo = pendentes.length > 3
        ? `${pendentes.slice(0, 3).join(', ')} e mais ${pendentes.length - 3}.`
        : `${pendentes.join(', ')}.`;
      setErroAcao(`Preencha os campos obrigatórios: ${resumo}`);
      mostrarToast('erro', 'Há campos obrigatórios pendentes.');
      return false;
    }
    setErroAcao('');
    return true;
  };

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
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-background print:bg-white print:text-black">
        <div className="print:hidden">
          <TopBar />
        </div>

        <main ref={mainRef} className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-sm py-md pb-[190px] sm:px-md lg:px-xl lg:py-lg lg:pb-[80px] print:px-0 print:pb-0">
          <div className="print:hidden">
            {alerta}
          </div>
          {(erroAcao || processo?.erro) && <p role="alert" className="mb-md rounded border border-error bg-red-50 p-sm text-sm text-error">{erroAcao || processo?.erro}</p>}
          {processo && <p className="mb-md text-xs text-on-surface-variant">Processo {processo.processo.protocolo} · {processo.salvando ? 'Salvando rascunho...' : armazenamentoPersistenteDisponivel ? 'Rascunho disponível para retomada neste navegador' : 'O navegador bloqueia o armazenamento local; a retomada após fechá-lo pode não funcionar.'}</p>}
          {somenteLeitura && <p role="status" className="mb-md rounded border border-primary/30 bg-primary/5 p-sm text-sm text-primary">Protocolo enviado — visualização somente leitura.</p>}

          <div className="mb-lg border-b border-outline-variant pb-sm">
            <div>
              <div className="mb-xs flex min-w-0 items-center gap-xs overflow-x-auto whitespace-nowrap text-[12px] text-on-surface-variant print:hidden">
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
              <span className="flex min-w-0 items-center gap-xs">
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

          <div className="grid min-w-0 grid-cols-1 items-start gap-lg lg:min-h-0 lg:grid-cols-12 print:block">
            <div
              className={`flex min-w-0 flex-col gap-lg lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 print:col-span-12 print:block ${
                sidebar ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {somenteLeitura ? <fieldset disabled className="contents">{children}</fieldset> : children}
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

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-28 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-sm rounded-lg border px-md py-sm text-sm font-semibold shadow-lg sm:bottom-20 ${toast.tipo === 'sucesso' ? 'border-secondary/40 bg-secondary text-white' : 'border-error/40 bg-error text-white'}`}
          >
            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">{toast.tipo === 'sucesso' ? 'check_circle' : 'error'}</span>
            <span>{toast.mensagem}</span>
          </div>
        )}

        <footer className="fixed inset-x-0 bottom-0 z-30 flex min-w-0 flex-col gap-xs border-t border-outline-variant bg-surface-container-lowest px-sm py-xs sm:px-md lg:left-sidebar-width lg:px-xl print:hidden">
          {sidebar && (
            <button
              type="button"
              onClick={() => setSidebarMobileAberta((aberta) => !aberta)}
              className={`lg:hidden w-full min-h-11 px-sm rounded border flex items-center justify-center gap-xs text-[11px] font-bold ${pendencias === 0 ? 'border-secondary/50 bg-secondary-fixed/30 text-secondary' : 'border-amber-300 bg-amber-50 text-amber-900'}`}
              aria-expanded={sidebarMobileAberta}
              title={pendencias === 0 ? 'Kit completo' : 'Abrir Kit Documental'}
            >
              <span className="material-symbols-outlined text-[17px]">{pendencias === 0 ? 'task_alt' : 'attach_file'}</span>
              <span>{pendencias === 0 ? 'Kit completo' : 'Kit pendente'}</span>
              <span className="material-symbols-outlined text-[16px]">{sidebarMobileAberta ? 'expand_more' : 'expand_less'}</span>
            </button>
          )}

          {footerCenter && <div className="flex min-w-0 justify-center lg:hidden">{footerCenter}</div>}
          <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-xs lg:flex-nowrap">
            <div className="flex min-w-0 shrink-0 items-center gap-xs">
              <FormActionButton
                texto={somenteLeitura ? 'Voltar à Lista' : 'Cancelar'}
                icone={somenteLeitura ? 'arrow_back' : 'close'}
                type="button"
                disabled={executando}
                onClick={() => void executar(async () => {
                  if (somenteLeitura && processo) {
                    navigate(processo.processo.categoria === 'projeto' ? '/projetos/painel' : '/programas-de-apoio/painel');
                    return;
                  }
                  if (processo) await processo.salvar();
                  navigate(-1);
                })}
                className="border-outline-variant text-on-surface shadow-sm"
              />
              {footerCenter && <div className="hidden min-w-0 lg:flex">{footerCenter}</div>}
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-xs lg:flex-1">
              {botoesAcoes}
              {processo && !somenteLeitura && <FormActionButton texto="Reiniciar" icone="restart_alt" type="button" disabled={executando} onClick={() => {
                if (window.confirm('Iniciar uma nova tentativa? O processo atual será preservado.')) void executar(async () => { await processo.salvar(); await processo.novaTentativa(); });
              }} />}
              {mostrarRascunho && !somenteLeitura && <FormActionButton texto="Salvar Rascunho" icone="save" type="button" disabled={!processo || executando} onClick={salvarRascunho} />}
              {somenteLeitura && <span className="px-sm py-xs text-xs font-semibold text-on-surface-variant">Somente leitura</span>}
              {!somenteLeitura && <FormActionButton
                texto={acaoPrincipal}
                icone={acaoIcone}
                destaque={liberado}
                type="button"
                disabled={!liberado}
                onClick={() => { if (validarCampos()) void executar(async () => { if (processo) await processo.enviar(); aoSubmeter?.(); }); }}
                title={liberado ? acaoPrincipal : pendencias === null ? 'Preencha os campos obrigatórios para liberar o envio.' : `Faltam ${pendencias} documento(s) obrigatório(s) no Kit de Documentos.`}
                className={!liberado ? 'border-transparent bg-surface-variant text-on-surface-variant cursor-not-allowed' : ''}
              />}
            </div>
          </div>
        </footer>
      </div>
    </EnvioContext.Provider>
  );
};
