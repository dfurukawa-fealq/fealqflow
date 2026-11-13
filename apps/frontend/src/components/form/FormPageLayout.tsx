import { isValidElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { EnvioContext } from './EnvioContext';
import { FormActionButton } from './FormActionButton';
import { useProcesso, useProcessoNovo } from '../../contexts/ProcessoContext';
import { armazenamentoPersistenteDisponivel } from '../../utils/safeStorage';
import { RelatorioFormulario } from './RelatorioFormulario';
import { useUser } from '../../contexts/UserContext';
import { KitDocumental } from '../KitDocumental';
import { useAcoesFormulario } from './useAcoesFormulario';

const CAMPO_FORMULARIO_VALIDADO = '__fealq_formulario_validado__';

const contemKitDocumental = (conteudo: ReactNode): boolean => {
  if (Array.isArray(conteudo)) return conteudo.some(contemKitDocumental);
  if (!isValidElement<{ children?: ReactNode }>(conteudo)) return false;
  return conteudo.type === KitDocumental || contemKitDocumental(conteudo.props.children);
};

export interface FormPageLayoutProps {
  /** Trilha completa, incluindo a página atual: ['Área do Coordenador', 'Auxílio Viagem'] */
  breadcrumb: string[];
  titulo: string;
  /** Código oficial do formulário, ex. 'PRJ-FIN-001'. */
  codigo?: string;
  /** Selo ao lado do título, ex. 'Novo' ou 'Rascunho'. */
  badge?: string;
  /** Faixa de aviso exibida acima do conteúdo. */
  alerta?: ReactNode;
  /** Texto do botão principal, ex. 'Enviar Solicitação'. */
  acaoPrincipal: string;
  acaoIcone?: string;
  mostrarRascunho?: boolean;
  /** Libera ações customizadas de subformulários vinculados a um processo pai, sem criar outro processo. */
  permitirEnvioSemProcesso?: boolean;
  botoesAcoes?: ReactNode;
  footerCenter?: ReactNode;
  /** Regra adicional de envio; documentos obrigatorios pendentes sempre bloqueiam. */
  podeEnviar?: boolean;
  /** Valida regras de negócio que não cabem no atributo HTML `required`. */
  validarFormularioAdicional?: () => boolean;
  /** Coluna direita (4/12). Sem ela o conteúdo ocupa as 12 colunas. */
  sidebar?: ReactNode;
  /** Optional mobile-only step sequence. */
  etapasMobile?: Array<{ titulo: string; conteudo: ReactNode }>;
  /** Callback acionado ao clicar no botão de ação principal */
  aoSubmeter?: () => void;
  aoCancelar?: () => void;
  subformularioVinculado?: boolean;
  children?: ReactNode;
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
  permitirEnvioSemProcesso = false,
  botoesAcoes,
  footerCenter,
  sidebar,
  etapasMobile,
  podeEnviar,
  validarFormularioAdicional,
  aoCancelar,
  subformularioVinculado = false,
  aoSubmeter,
  children,
}: FormPageLayoutProps) => {
  const navigate = useNavigate();
  const processo = useProcesso();
  const processoNovo = useProcessoNovo();
  const { usuario } = useUser();
  const acoes = useAcoesFormulario();
  const sidebarConteudo = sidebar
    ? contemKitDocumental(sidebar) ? sidebar : <>{sidebar}<KitDocumental documentos={[]} titulo={`Kit de ${titulo}`} /></>
    : <KitDocumental documentos={[]} titulo={`Kit de ${titulo}`} />;
  const sidebarVisivel = sidebarConteudo;
  const somenteLeitura = processo?.somenteLeitura ?? false;
  const mainRef = useRef<HTMLElement>(null);
  const ocupadoRef = useRef(false);
  const [executando, setExecutando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [layoutMobile, setLayoutMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);
  const [etapaMobile, setEtapaMobile] = useState(0);
  const etapaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [toast, setToast] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const persistirValidacaoRef = useRef<((validado: boolean) => Promise<void>) | null>(null);
  const [formularioValidado, setFormularioValidado] = useState(
    () => (processo?.dados.campos[CAMPO_FORMULARIO_VALIDADO] ?? processoNovo?.dados.campos[CAMPO_FORMULARIO_VALIDADO]) === true,
  );
  const identidadeProcesso = processo?.processo.id ?? (processoNovo ? 'novo' : '');

  useEffect(() => {
    const flagSalva = processo?.dados.campos[CAMPO_FORMULARIO_VALIDADO] ?? processoNovo?.dados.campos[CAMPO_FORMULARIO_VALIDADO];
    setFormularioValidado(flagSalva === true);
  }, [identidadeProcesso]);

  const atualizarValidadeFormulario = useCallback((validado: boolean) => {
    setFormularioValidado(validado);
    (processo?.atualizarCampo ?? processoNovo?.atualizarCampo)?.(CAMPO_FORMULARIO_VALIDADO, validado);
  }, [processo?.atualizarCampo, processoNovo?.atualizarCampo]);

  const prepararValidadeFormulario = useCallback((validado: boolean) => {
    (processo?.atualizarCampo ?? processoNovo?.atualizarCampo)?.(CAMPO_FORMULARIO_VALIDADO, validado);
  }, [processo?.atualizarCampo, processoNovo?.atualizarCampo]);

  const confirmarFormulario = useCallback(async (validado: boolean) => {
    atualizarValidadeFormulario(validado);
    try {
      await persistirValidacaoRef.current?.(validado);
    } catch (falha) {
      if (validado) atualizarValidadeFormulario(false);
      throw falha;
    }
  }, [atualizarValidadeFormulario]);

  const registrarPersistenciaFormulario = useCallback((persistir: (validado: boolean) => Promise<void>) => {
    persistirValidacaoRef.current = persistir;
  }, []);

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

  useEffect(() => {
    const raiz = mainRef.current;
    if (!raiz) return;

    const desativarAutopreenchimento = (raizCampos: ParentNode) => {
      raizCampos.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((campo) => {
        campo.autocomplete = 'off';
      });
      raizCampos.querySelectorAll<HTMLFormElement>('form').forEach((formulario) => {
        formulario.autocomplete = 'off';
      });
    };

    desativarAutopreenchimento(raiz);
    const observador = new MutationObserver((alteracoes) => {
      alteracoes.forEach((alteracao) => alteracao.addedNodes.forEach((no) => {
        if (!(no instanceof HTMLElement)) return;
        if (no instanceof HTMLInputElement || no instanceof HTMLSelectElement || no instanceof HTMLTextAreaElement) no.autocomplete = 'off';
        if (no instanceof HTMLFormElement) no.autocomplete = 'off';
        desativarAutopreenchimento(no);
      }));
    });
    observador.observe(raiz, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, []);

  // null = a página não tem Kit Documental; o envio segue bloqueado se podeEnviar não for informado.
  const [pendencias, setPendencias] = useState<number | null>(null);
  const [documentosPendentes, setDocumentosPendentes] = useState<Array<{ id: string; label: string }>>([]);
  const registrarPendencias = useCallback((quantidade: number, itens: Array<{ id: string; label: string }> = []) => {
    setPendencias(quantidade);
    setDocumentosPendentes((atuais) => JSON.stringify(atuais) === JSON.stringify(itens) ? atuais : itens);
  }, []);
  const envio = useMemo(() => ({
    executarAcao: acoes.executarAcao,
    registrarPendencias,
    formulario: { id: codigo || titulo, titulo, validado: formularioValidado },
    registrarPersistenciaFormulario,
    confirmarFormulario,
  }), [acoes.executarAcao, codigo, titulo, formularioValidado, registrarPendencias, registrarPersistenciaFormulario, confirmarFormulario]);
  const liberado = podeEnviar !== false && pendencias === 0
    && Boolean(processo || (aoSubmeter && (!processoNovo || permitirEnvioSemProcesso))) && !executando && !somenteLeitura;

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

  const executar = async (acao: () => Promise<void>, nome = 'acao_formulario') => {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setExecutando(true);
    setErroAcao('');
    try { await acoes.executarAcao(nome, acao, { atualizarRota: false }); }
    catch (falha) { setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível concluir a operação.'); }
    finally { ocupadoRef.current = false; setExecutando(false); }
  };

  const salvarRascunho = () => {
    const salvar = processo?.salvar ?? processoNovo?.salvar;
    if (!salvar) return;
    void executar(async () => {
      try {
        const valido = validarCampos(mainRef.current, false);
        prepararValidadeFormulario(valido);
        await salvar();
        // A criação de um processo novo navega para a rota recém-criada e desmonta
        // este layout. O sinal de validação já foi incluído no rascunho acima.
        if (processoNovo) return;
        await confirmarFormulario(valido);
        mostrarToast('sucesso', valido
          ? 'Rascunho salvo. O formulário está completo.'
          : 'Rascunho salvo. O item do formulário continua pendente até o preenchimento dos campos obrigatórios.');
      } catch (falha) {
        mostrarToast('erro', falha instanceof Error ? falha.message : 'Não foi possível salvar o rascunho.');
        throw falha;
      }
    }, 'salvar_rascunho');
  };

  const validarCampos = (escopo: ParentNode | null = mainRef.current, apresentarErro = true) => {
    const campos = escopo?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:required, select:required, textarea:required');
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
      if (apresentarErro) {
        primeiroPendente.reportValidity();
        primeiroPendente.focus();
      }
      const resumo = pendentes.length > 3
        ? `${pendentes.slice(0, 3).join(', ')} e mais ${pendentes.length - 3}.`
        : `${pendentes.join(', ')}.`;
      setErroAcao(`Preencha os campos obrigatórios: ${resumo}`);
      if (apresentarErro) mostrarToast('erro', 'Há campos obrigatórios pendentes.');
      return false;
    }
    if (validarFormularioAdicional && !validarFormularioAdicional()) {
      setErroAcao('Este formulário ainda tem requisitos obrigatórios pendentes. Confira as seções e tente novamente.');
      if (apresentarErro) mostrarToast('erro', 'Há requisitos obrigatórios pendentes.');
      return false;
    }
    setErroAcao('');
    return true;
  };

  const validarFormulario = () => {
    if (layoutMobile && etapasMobile?.length) {
      for (let indice = 0; indice < etapasMobile.length; indice += 1) {
        const campos = etapaRefs.current[indice]?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:required, select:required, textarea:required');
        const invalido = Array.from(campos || []).find((campo) => !campo.checkValidity());
        if (!invalido) continue;
        setEtapaMobile(indice);
        const rotulo = invalido.labels?.[0]?.textContent?.replace('*', '').trim() || invalido.getAttribute('aria-label') || 'Campo obrigat\u00f3rio';
        setErroAcao(`Preencha os campos obrigatÃ³rios: ${rotulo}.`);
        mostrarToast('erro', 'HÃ¡ campos obrigatÃ³rios pendentes.');
        window.requestAnimationFrame(() => {
          invalido.reportValidity();
          invalido.focus();
        });
        return false;
      }
    }
    return validarCampos();
  };

  const invalidarFormularioAoEditar = () => {
    if (!formularioValidado) return;
    void confirmarFormulario(false).catch((falha: unknown) => {
      setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível atualizar o status do Kit Documental.');
    });
  };

  const salvarDecisao = (evento: React.ChangeEvent<HTMLElement>) => {
    invalidarFormularioAoEditar();
    const campo = evento.target;
    if (campo instanceof HTMLSelectElement || (campo instanceof HTMLInputElement && ['checkbox', 'radio'].includes(campo.type))) {
      window.setTimeout(() => { void acoes.executarAcao('alterar_flag', () => {}, { antes: false, depois: true }).catch((erro: unknown) => setErroAcao(erro instanceof Error ? erro.message : 'Falha ao salvar decisao.')); }, 0);
    }
  };
  const salvarAntesDoLink = (evento: React.MouseEvent<HTMLElement>) => {
    const link = (evento.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link || link.hasAttribute('data-salvamento-gerenciado') || evento.button !== 0 || somenteLeitura) return;
    const destino = new URL(link.href, window.location.origin);
    if (!['http:', 'https:', 'mailto:'].includes(destino.protocol)) return;
    evento.preventDefault();
    window.setTimeout(() => { void executar(async () => {
      const processoId = processo?.processo.id || processoNovo?.processoId || new URLSearchParams(window.location.search).get('processo');
      if (processoId && destino.origin === window.location.origin && /\/form-/.test(destino.pathname) && !destino.searchParams.has('processo')) {
        destino.searchParams.set('processo_pai', processoId);
        if (!destino.searchParams.has('rota_retorno')) destino.searchParams.set('rota_retorno', window.location.pathname);
      }
      if (link.hasAttribute('download') || link.target === '_blank' || destino.protocol === 'mailto:') {
        const temporario = document.createElement('a');
        temporario.href = destino.href;
        temporario.target = link.target;
        temporario.rel = 'noopener noreferrer';
        if (link.hasAttribute('download')) temporario.download = link.download;
        temporario.click();
      } else if (destino.origin === window.location.origin) navigate(`${destino.pathname}${destino.search}${destino.hash}`);
      else window.location.assign(destino.href);
    }, link.hasAttribute('download') ? 'baixar_modelo' : 'abrir_url'); }, 0);
  };

  const renderizarConteudo = () => {
    if (!etapasMobile?.length) return children;
    return (
      <>
        <div className="mb-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-md lg:hidden" aria-live="polite">
          <div className="mb-xs flex items-center justify-between gap-sm text-xs font-semibold text-on-surface-variant">
            <span>Etapa {etapaMobile + 1} de {etapasMobile.length}</span>
            <span>{Math.round(((etapaMobile + 1) / etapasMobile.length) * 100)}%</span>
          </div>
          <div className="mb-sm h-1.5 overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${((etapaMobile + 1) / etapasMobile.length) * 100}%` }} />
          </div>
          <p className="text-sm font-semibold text-primary">{etapasMobile[etapaMobile]?.titulo}</p>
        </div>
        {etapasMobile.map((etapa, indice) => (
          <div
            key={etapa.titulo}
            ref={(elemento) => { etapaRefs.current[indice] = elemento; }}
            className={`flex min-w-0 flex-col gap-lg ${layoutMobile && indice !== etapaMobile ? 'hidden lg:flex' : ''}`}
          >
            {etapa.conteudo}
          </div>
        ))}
        <div className="flex items-center justify-between gap-sm pt-sm lg:hidden">
          <button type="button" onClick={() => setEtapaMobile((atual) => Math.max(0, atual - 1))} disabled={etapaMobile === 0} className="min-h-11 rounded border border-outline-variant px-md text-sm font-semibold text-on-surface disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
          <span className="text-xs text-on-surface-variant">{etapaMobile + 1} / {etapasMobile.length}</span>
          {etapaMobile < etapasMobile.length - 1 ? (
            <button type="button" onClick={() => {
              if (validarCampos(etapaRefs.current[etapaMobile])) {
                setEtapaMobile((atual) => Math.min(etapasMobile.length - 1, atual + 1));
                setErroAcao('');
              }
            }} className="min-h-11 rounded bg-primary px-md text-sm font-semibold text-white">{'Pr\u00f3xima'}</button>
          ) : <span className="min-w-[88px] text-right text-xs font-semibold text-secondary">{'\u00daltima etapa'}</span>}
        </div>
      </>
    );
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const atualizarLayout = () => setLayoutMobile(media.matches);
    atualizarLayout();
    media.addEventListener('change', atualizarLayout);
    return () => media.removeEventListener('change', atualizarLayout);
  }, []);

  useEffect(() => {
    if (layoutMobile && etapaRefs.current.length) mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [etapaMobile, layoutMobile]);

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
      <div onClickCapture={salvarAntesDoLink} className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background print:h-auto print:overflow-visible print:bg-white print:text-black">
        {usuario && <div className="print:hidden"><TopBar /></div>}

        <main ref={mainRef} onChangeCapture={salvarDecisao} className="mx-auto flex min-h-0 w-full min-w-0 max-w-[1200px] flex-1 flex-col overflow-y-auto px-sm py-md sm:px-md lg:overflow-hidden lg:px-xl lg:pt-lg print:min-h-0 print:overflow-visible print:px-0 print:py-0">
          <div className="print:hidden">
            {alerta}
            {processoNovo?.processoPai && <p className="mb-sm text-xs text-primary" data-processo-principal={processoNovo.processoPai.id}>Processo principal: <strong>{processoNovo.processoPai.protocolo}</strong></p>}
          </div>
          {(erroAcao || processo?.erro || processoNovo?.erro) && <p role="alert" className="mb-md rounded border border-error bg-red-50 p-sm text-sm text-error">{erroAcao || processo?.erro || processoNovo?.erro}</p>}
          {processoNovo && !permitirEnvioSemProcesso && <p className="mb-md rounded border border-primary/25 bg-primary/5 p-sm text-xs text-primary">Este formulário ainda não criou um processo. Você pode selecionar os anexos agora; clique em <strong>Salvar Rascunho</strong> para gerar o protocolo, enviar os arquivos selecionados e habilitar o envio.</p>}
          {processo && <p className="mb-md text-xs text-on-surface-variant">Processo {processo.processo.protocolo} · {processo.salvando ? 'Salvando rascunho...' : armazenamentoPersistenteDisponivel ? 'Rascunho disponível para retomada neste navegador' : 'O navegador bloqueia o armazenamento local; a retomada após fechá-lo pode não funcionar.'}</p>}
          {somenteLeitura && <p role="status" className="mb-md rounded border border-primary/30 bg-primary/5 p-sm text-sm text-primary">Protocolo enviado — visualização somente leitura.</p>}

          <div className="mb-lg border-b border-outline-variant pb-sm">
            <div>
              {usuario && <div className="mb-xs flex min-w-0 items-center gap-xs overflow-x-auto whitespace-nowrap text-[12px] text-on-surface-variant print:hidden">
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
              </div>}
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

          {sidebarVisivel && !etapasMobile?.length && (
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

          <div className="grid min-w-0 grid-cols-1 items-start gap-lg lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:items-stretch print:block">
            <div
              className={`flex min-w-0 flex-col gap-lg print:col-span-12 print:block ${
                sidebarVisivel
                  ? 'lg:col-span-8 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2'
                  : 'lg:col-span-12 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain'
              }`}
            >
              {somenteLeitura ? <fieldset disabled className="contents">{renderizarConteudo()}</fieldset> : renderizarConteudo()}
            </div>
            {sidebarVisivel && (
              <>
                {sidebarMobileAberta && (
                  <button
                    type="button"
                    aria-label="Fechar Kit Documental"
                    onClick={() => setSidebarMobileAberta(false)}
                    className="lg:hidden fixed inset-0 bg-black/35 z-40 print:hidden"
                  />
                )}
                <div className={`${sidebarMobileAberta ? 'flex fixed bottom-0 left-0 right-0 z-50 w-screen max-w-[100vw] max-h-[78vh] overflow-hidden rounded-t-2xl border-t-2 border-primary/30 bg-surface-container-lowest p-sm sm:p-md shadow-2xl' : 'hidden'} lg:flex lg:static lg:z-auto lg:w-auto lg:max-w-none lg:max-h-none lg:min-h-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:col-span-4 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 flex-col gap-lg print:hidden`}>
                  <div className="lg:hidden flex justify-center -mt-xs mb-xs">
                    <span className="block w-12 h-1.5 rounded-full bg-outline-variant" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-lg">{sidebarConteudo}
                    <details className="rounded border border-outline-variant bg-surface-container-lowest p-sm text-xs">
                      <summary className="cursor-pointer font-semibold">Histórico do processo ({acoes.eventos.length})</summary>
                      <button type="button" className="my-sm text-primary underline" onClick={() => void acoes.atualizarHistorico()}>Atualizar histórico</button>
                      {acoes.erroHistorico && <p role="alert" className="text-error">{acoes.erroHistorico}</p>}
                      <ol className="max-h-72 space-y-sm overflow-y-auto">{acoes.eventos.map((evento) => <li key={evento.id} className="border-b border-outline-variant pb-xs"><time>{new Date(evento.criado_em).toLocaleString('pt-BR')}</time><br /><strong>{evento.acao}</strong> - {evento.resultado}{evento.detalhe && <p>{evento.detalhe}</p>}</li>)}</ol>
                      {!acoes.eventos.length && <p>As ações serão registradas ao salvar este processo.</p>}
                    </details>
                  </div>
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

        <footer className="flex min-w-0 shrink-0 flex-col gap-xs border-t border-outline-variant bg-surface-container-lowest px-sm py-xs sm:px-md lg:px-xl print:hidden">
          {sidebarVisivel && (
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

          {Boolean(pendencias && pendencias > 0) && <div role="status" className="flex flex-wrap items-center justify-between gap-xs rounded border border-amber-300 bg-amber-50 p-sm text-xs text-amber-950">
            <p>Documentos obrigatórios pendentes no kit: {documentosPendentes.map((item) => item.label).join('; ')}.</p>
            <button type="button" className="shrink-0 font-semibold underline" onClick={() => {
              setSidebarMobileAberta(true);
              window.requestAnimationFrame(() => mainRef.current?.querySelector('[data-kit-documental]')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
            }}>Ver documentos pendentes</button>
          </div>}
          {footerCenter && <div className="flex min-w-0 justify-center lg:hidden">{footerCenter}</div>}
          <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-xs lg:flex-nowrap">
            <div className="flex min-w-0 shrink-0 items-center gap-xs">
              <FormActionButton
                texto={somenteLeitura ? 'Voltar à Lista' : 'Cancelar'}
                icone={somenteLeitura ? 'arrow_back' : 'close'}
                type="button"
                disabled={executando}
                onClick={() => void executar(async () => {
                  if (aoCancelar) {
                    aoCancelar();
                    return;
                  }
                  if (somenteLeitura && processo) {
                    navigate(processo.processo.categoria === 'projeto' ? '/projetos/painel' : '/programas-de-apoio/painel');
                    return;
                  }
                  if (processo) await processo.salvar();
                  navigate(-1);
                }, 'cancelar')}
                className="border-outline-variant text-on-surface shadow-sm"
              />
              {footerCenter && <div className="hidden min-w-0 lg:flex">{footerCenter}</div>}
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-xs lg:flex-1">
              <RelatorioFormulario titulo={titulo} />
              {botoesAcoes}
              {processo && !somenteLeitura && <FormActionButton texto="Reiniciar" icone="restart_alt" type="button" disabled={executando} onClick={() => {
                if (window.confirm('Iniciar uma nova tentativa? O processo atual será preservado.')) void executar(async () => { await processo.salvar(); await processo.novaTentativa(); }, 'reiniciar');
              }} />}
              {mostrarRascunho && !somenteLeitura && <FormActionButton texto="Salvar Rascunho" icone="save" destaque={Boolean(processoNovo)} type="button" disabled={(!processo && !processoNovo) || executando || processoNovo?.salvando} onClick={salvarRascunho} />}
              {somenteLeitura && <span className="px-sm py-xs text-xs font-semibold text-on-surface-variant">Somente leitura</span>}
              {!somenteLeitura && <FormActionButton
                texto={acaoPrincipal}
                icone={acaoIcone}
                destaque={liberado}
                type="button"
                disabled={!liberado}
                onClick={() => {
                  if (!validarFormulario()) { void confirmarFormulario(false); return; }
                  void executar(async () => {
                    prepararValidadeFormulario(true);
                    if (processo && !subformularioVinculado && !permitirEnvioSemProcesso) {
                      await processo.salvar();
                      await confirmarFormulario(true);
                      await processo.enviar();
                    } else {
                      await confirmarFormulario(true);
                    }
                    if ((subformularioVinculado || permitirEnvioSemProcesso) && processoNovo) await processoNovo.salvarSemNavegar();
                    aoSubmeter?.();
                  }, 'concluir_formulario');
                }}
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
