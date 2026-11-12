import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Footer } from './Footer';
import { DocumentoDoProcesso, formatarDocumentosDoProcesso } from '../utils/processoDocumentos';
import { ConfirmacaoModal } from './ConfirmacaoModal';

type CategoriaPainel = 'projeto' | 'apoio';
type StatusSolicitacao = 'pendente' | 'rascunho' | 'finalizada';

interface ProcessoPainelApi {
  id: string;
  protocolo: string;
  formulario_nome: string;
  formulario_rota: string;
  titulo: string;
  solicitante_nome: string;
  status: string;
  criado_em: string;
  documentos_anexados: number;
  documentos_total: number;
  documentos: DocumentoDoProcesso[];
}

interface SolicitacaoPainel {
  processoId: string;
  id: string;
  formName: string;
  subtitulo: string;
  solicitante: string;
  solicitadoEm: string;
  kit: string;
  status: StatusSolicitacao;
  link: string;
  docs: string[];
}

interface PainelSolicitacoesProps {
  categoria: CategoriaPainel;
}

const dataHora = (valor: string) => {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data);
};

export const PainelSolicitacoes = ({ categoria }: PainelSolicitacoesProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusSolicitacao>('todos');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPainel[]>([]);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [confirmarInativacao, setConfirmarInativacao] = useState(false);
  const [inativando, setInativando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const projetos = categoria === 'projeto';

  useEffect(() => {
    let ativo = true;
    fetch(`/api/processos?categoria=${categoria}`, { credentials: 'same-origin' })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível carregar as solicitações.');
        return resposta.json() as Promise<ProcessoPainelApi[]>;
      })
      .then((processos) => {
        if (!ativo) return;
        setSolicitacoes(processos.map((processo) => {
          const status: StatusSolicitacao = ['finalizada', 'enviado', 'aprovado'].includes(processo.status)
            ? 'finalizada'
            : processo.status === 'rascunho' ? 'rascunho' : 'pendente';
          const destino = processo.formulario_rota ? `${processo.formulario_rota}?processo=${processo.id}` : projetos ? '/projetos' : '/programas-de-apoio';
          const url = new URL(destino, window.location.origin);
          if (status === 'finalizada') url.searchParams.set('modo', 'consulta');
          return {
            processoId: processo.id,
            id: processo.protocolo,
            formName: processo.formulario_nome,
            subtitulo: projetos ? processo.titulo : '',
            solicitante: processo.solicitante_nome,
            solicitadoEm: dataHora(processo.criado_em),
            kit: `${processo.documentos_anexados}/${processo.documentos_total} Concluídos`,
            status,
            link: `${url.pathname}${url.search}`,
            docs: formatarDocumentosDoProcesso(processo.documentos),
          };
        }));
      })
      .catch((falha: unknown) => {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar as solicitações.');
      });
    return () => { ativo = false; };
  }, [categoria, projetos]);

  const filtradas = useMemo(() => solicitacoes.filter((item) => {
    const correspondeStatus = statusFilter === 'todos' || item.status === statusFilter;
    const consulta = search.toLocaleLowerCase('pt-BR');
    const correspondeBusca = [item.id, item.formName, item.subtitulo, item.solicitante]
      .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(consulta));
    return correspondeStatus && correspondeBusca;
  }), [search, solicitacoes, statusFilter]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
  const inicio = filtradas.length ? (pagina - 1) * itensPorPagina : 0;
  const itensPagina = filtradas.slice(inicio, inicio + itensPorPagina);
  const todosFiltradosSelecionados = filtradas.length > 0 && filtradas.every((item) => selecionados.includes(item.processoId));
  const alternarTodosFiltrados = () => setSelecionados((atuais) => todosFiltradosSelecionados
    ? atuais.filter((id) => !filtradas.some((item) => item.processoId === id))
    : [...new Set([...atuais, ...filtradas.map((item) => item.processoId)])]);
  const inativarSolicitacoes = async () => {
    setInativando(true);
    setErro('');
    try {
      const idsInativados = new Set<string>();
      for (let indice = 0; indice < selecionados.length; indice += 100) {
        const lote = selecionados.slice(indice, indice + 100);
        const resposta = await fetch('/api/processos/inativar', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: lote }),
        });
        const resultado = await resposta.json().catch(() => ({})) as { error?: string; inativados?: string[] };
        if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível inativar as solicitações selecionadas.');
        (resultado.inativados || lote).forEach((id) => idsInativados.add(id));
      }
      setSolicitacoes((atuais) => atuais.filter((item) => !idsInativados.has(item.processoId)));
      setSelecionados((atuais) => atuais.filter((id) => !idsInativados.has(id)));
      setConfirmarInativacao(false);
    } catch (falha: unknown) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível inativar as solicitações selecionadas.');
    } finally {
      setInativando(false);
    }
  };
  const copiarUrl = async (item: SolicitacaoPainel) => {
    const url = new URL(item.link, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setMensagem(`URL de ${item.id} copiada.`);
    } catch {
      setMensagem('Não foi possível copiar a URL. Verifique a permissão de acesso à área de transferência.');
    }
    window.setTimeout(() => setMensagem(''), 3000);
  };

  useEffect(() => { setPagina(1); }, [search, statusFilter, itensPorPagina]);
  useEffect(() => { setPagina((atual) => Math.min(atual, totalPaginas)); }, [totalPaginas]);

  const contagem = (status: StatusSolicitacao) => solicitacoes.filter((item) => item.status === status).length;
  const rascunhos = contagem('rascunho');
  const pendentes = contagem('pendente');
  const finalizadas = contagem('finalizada');
  const tituloPainel = projetos ? 'Painel de Solicitações - Projetos' : 'Painel de Solicitações - Programas de Apoio';

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-xl overflow-auto p-xl">
        {erro && <p role="alert" className="rounded border border-error bg-red-50 p-sm text-sm text-error">{erro}</p>}
        <header>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              {projetos ? 'Módulo Projetos & Convênios' : 'Módulo Programas de Apoio'}
            </span>
            <span className="text-xs font-medium text-on-surface-variant">Área do Coordenador</span>
          </div>
          <h1 className="text-xl font-bold text-primary">{tituloPainel}</h1>
          <p className="text-sm text-on-surface-variant">
            {projetos
              ? 'Acompanhamento detalhado de protocolos de Cursos, Eventos, Pesquisas e Centrais Multiusuário.'
              : 'Acompanhamento detalhado de solicitações de bolsas, auxílios, infraestrutura e programas FEALQ.'}
          </p>
        </header>

        <section className="grid grid-cols-1 gap-md md:grid-cols-3" aria-label="Resumo das solicitações">
          {([
            { status: 'rascunho' as const, titulo: 'Iniciadas / Rascunho', detalhe: 'Em preenchimento ou rascunho', valor: rascunhos, cor: 'text-primary', icone: 'edit_document' },
            { status: 'pendente' as const, titulo: 'Pendentes de Documentação', detalhe: 'Aguardando anexos ou validações', valor: pendentes, cor: 'text-[#F17C58]', icone: 'pending_actions' },
            { status: 'finalizada' as const, titulo: 'Finalizadas / Submetidas', detalhe: 'Enviadas ou aprovadas pela FEALQ', valor: finalizadas, cor: 'text-[#20B293]', icone: 'check_circle' },
          ]).map((cartao) => (
            <button
              key={cartao.status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === cartao.status ? 'todos' : cartao.status)}
              aria-pressed={statusFilter === cartao.status}
              className={clsx(
                'flex cursor-pointer items-center justify-between rounded border bg-surface-container-lowest p-md text-left transition-all hover:shadow-sm',
                statusFilter === cartao.status ? 'border-primary ring-1 ring-primary' : 'border-outline-variant',
              )}
            >
              <span>
                <span className="block text-[10px] font-bold uppercase text-on-surface-variant">{cartao.titulo}</span>
                <span className={clsx('block text-2xl font-bold', cartao.cor)}>{cartao.valor}</span>
                <span className="mt-0.5 block text-[11px] text-on-surface-variant">{cartao.detalhe}</span>
              </span>
              <span className={clsx('flex h-10 w-10 items-center justify-center rounded bg-current/10', cartao.cor)}>
                <span className="material-symbols-outlined">{cartao.icone}</span>
              </span>
            </button>
          ))}
        </section>

        <section className="flex flex-1 flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="grid grid-cols-1 items-center gap-3 border-b border-outline-variant bg-surface-container-low px-md py-sm sm:grid-cols-[1fr_minmax(360px,1.5fr)_1fr]">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <span className="material-symbols-outlined text-base">folder_special</span>
                {projetos ? 'Solicitações de Projetos' : 'Solicitações de Apoio'}
              </h2>
              <span className="rounded bg-[#F17C58]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#F17C58]">
                {pendentes} com Ação Necessária
              </span>
            </div>
            <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:col-start-2">
              <div className="relative w-full min-w-0">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/70">search</span>
                <input
                  type="text"
                  aria-label="Buscar solicitações"
                  placeholder={projetos ? 'Buscar projeto, ID ou coordenador...' : 'Buscar formulário, ID ou solicitante...'}
                  value={search}
                  onChange={(evento) => setSearch(evento.target.value)}
                  className="block h-10 w-full min-w-0 rounded border border-outline-variant bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {statusFilter !== 'todos' && (
                <button type="button" onClick={() => setStatusFilter('todos')} className="whitespace-nowrap text-xs font-medium text-primary underline">
                  Limpar filtro
                </button>
              )}
            </div>
          </div>

          {mensagem && <p role="status" className="border-b border-outline-variant px-md py-1 text-center text-xs text-secondary">{mensagem}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant px-md py-2 text-xs">
            <label className="flex items-center gap-2 font-medium text-on-surface-variant">
              <input type="checkbox" checked={todosFiltradosSelecionados} onChange={alternarTodosFiltrados} aria-label="Selecionar todas as solicitações filtradas" />
              Selecionar todos os filtrados
            </label>
            <div className="flex items-center gap-3">
              <span>{selecionados.length} selecionado(s)</span>
              <button type="button" disabled={!selecionados.length || inativando} onClick={() => setConfirmarInativacao(true)} className="inline-flex items-center gap-1 rounded border border-error px-2 py-1 font-semibold text-error hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-40" title="Inativar solicitações selecionadas">
                <span className="material-symbols-outlined text-sm">delete</span>Excluir / Cancelar
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid min-w-[1220px] grid-cols-[36px_36px_135px_minmax(220px,1.4fr)_minmax(150px,1fr)_130px_140px_160px] items-center gap-3 border-b border-outline-variant bg-surface-container-low px-md py-2 text-xs font-semibold uppercase text-on-surface-variant">
              <span /><span />
              <span>ID</span>
              <span>Formulário / Solicitação</span>
              <span>{projetos ? 'Coordenador' : 'Solicitante'}</span>
              <span>Solicitado em</span>
              <span>Status Kit</span>
              <span className="text-right">Ação</span>
            </div>

            {filtradas.length === 0 ? (
              <div className="p-8 text-center text-sm text-on-surface-variant">Nenhuma solicitação encontrada com os filtros selecionados.</div>
            ) : itensPagina.map((item) => (
              <div key={item.id} className="min-w-[1220px] border-b border-outline-variant last:border-0">
                <div
                  className="grid min-h-[54px] cursor-pointer grid-cols-[36px_36px_135px_minmax(220px,1.4fr)_minmax(150px,1fr)_130px_140px_160px] items-center gap-3 px-md hover:bg-surface-container-low"
                  onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                >
                  <span className={clsx('material-symbols-outlined text-center text-on-surface-variant transition-transform', expandedRow === item.id && 'rotate-180')}>expand_more</span>
                  <input type="checkbox" checked={selecionados.includes(item.processoId)} aria-label={`Selecionar ${item.id}`} onClick={(evento) => evento.stopPropagation()} onChange={() => setSelecionados((atuais) => atuais.includes(item.processoId) ? atuais.filter((id) => id !== item.processoId) : [...atuais, item.processoId])} />
                  <span className="font-mono text-xs font-semibold text-primary">{item.id}</span>
                  <span className="min-w-0 text-sm">
                    <Link to={item.link} onClick={(evento) => evento.stopPropagation()} className="block font-medium leading-tight text-primary hover:underline">{item.formName}</Link>
                    {item.subtitulo && <span className="line-clamp-1 text-xs text-on-surface-variant">{item.subtitulo}</span>}
                  </span>
                  <span className="truncate text-xs font-medium text-on-surface">{item.solicitante || '—'}</span>
                  <time className="text-xs text-on-surface-variant">{item.solicitadoEm}</time>
                  <span className={clsx(
                    'w-fit rounded px-2 py-0.5 text-xs font-bold',
                    item.status === 'pendente' ? 'bg-[#F17C58]/10 text-[#F17C58]' : item.status === 'rascunho' ? 'bg-amber-100 text-amber-800' : 'bg-[#20B293]/10 text-[#20B293]',
                  )}>{item.kit}</span>
                  <span className="flex items-center justify-end gap-2">
                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(evento) => evento.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#20B293] bg-[#20B293]/10 text-[#20B293] hover:bg-[#20B293]/20"
                      title="Contato via WhatsApp"
                      aria-label={`Contato via WhatsApp: ${item.solicitante || item.id}`}
                    ><span className="material-symbols-outlined text-[14px]">chat</span></a>
                    <a
                      href="mailto:"
                      onClick={(evento) => evento.stopPropagation()}
                      className="flex h-7 w-7 items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                      title="Contato via E-mail"
                      aria-label={`Contato via E-mail: ${item.solicitante || item.id}`}
                    ><span className="material-symbols-outlined text-[14px]">mail</span></a>
                    <button type="button" onClick={(evento) => { evento.stopPropagation(); void copiarUrl(item); }} className="flex h-7 w-7 items-center justify-center rounded border border-outline-variant text-primary hover:bg-primary/10" title="Copiar URL" aria-label={`Copiar URL de ${item.id}`}><span className="material-symbols-outlined text-[14px]">content_copy</span></button>
                    <Link
                      to={item.link}
                      onClick={(evento) => evento.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded border border-primary text-primary hover:bg-primary hover:text-white"
                      title={item.status === 'finalizada' ? 'Ver Protocolo' : 'Completar Kit'}
                      aria-label={item.status === 'finalizada' ? 'Ver Protocolo' : 'Completar Kit documental'}
                    ><span className="material-symbols-outlined text-[18px]">{item.status === 'finalizada' ? 'visibility' : 'folder_open'}</span></Link>
                  </span>
                </div>
                {expandedRow === item.id && (
                  <div className="grid grid-cols-1 gap-2 border-l-4 border-t border-l-[#F17C58] border-outline-variant bg-surface p-md pl-[88px]">
                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Checklist do Kit Documental ({item.formName})</h3>
                    <ul className="space-y-1.5 text-xs">
                      {item.docs.map((doc, indice) => {
                        const faltando = doc.includes('FALTANDO');
                        return <li key={`${item.id}-${indice}`} className="flex items-center gap-2">
                          <span className={clsx('material-symbols-outlined text-[16px]', faltando ? 'text-[#F17C58]' : 'text-[#20B293]')}>{faltando ? 'error' : 'check_circle'}</span>
                          <span className={faltando ? 'font-semibold text-[#F17C58]' : 'text-on-surface-variant'}>{doc}</span>
                        </li>;
                      })}
                    </ul>
                    <div className="mt-2 flex items-center justify-between border-t border-outline-variant/60 pt-2 text-xs text-on-surface-variant">
                      <span>Rastreabilidade: solicitação registrada no sistema FEALQ Flow</span>
                      <Link to={item.link} className="flex items-center gap-1 font-bold text-primary hover:underline">
                        {item.status === 'finalizada' ? 'Ver protocolo' : 'Abrir formulário'}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant bg-surface px-md py-3 text-xs text-on-surface-variant">
            <span>Total: <strong className="text-on-surface">{filtradas.length}</strong> item(ns) - Exibindo {filtradas.length ? inicio + 1 : 0} a {Math.min(inicio + itensPagina.length, filtradas.length)}</span>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="itens-por-pagina">Itens por pagina</label>
              <select id="itens-por-pagina" value={itensPorPagina} onChange={(evento) => setItensPorPagina(Number(evento.target.value))} className="rounded border border-outline-variant bg-surface px-2 py-1.5">
                {[10, 25, 50].map((quantidade) => <option key={quantidade} value={quantidade}>{quantidade}</option>)}
              </select>
              <button type="button" disabled={pagina <= 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))} className="rounded border border-outline-variant px-3 py-1.5 disabled:opacity-40" aria-label="Pagina anterior">Anterior</button>
              <span>Pagina {pagina} de {totalPaginas}</span>
              <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))} className="rounded border border-outline-variant px-3 py-1.5 disabled:opacity-40" aria-label="Proxima pagina">Proxima</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {confirmarInativacao && <ConfirmacaoModal
        titulo="Excluir / cancelar solicitações?"
        mensagem={`As ${selecionados.length} solicitações selecionadas serão inativadas e deixarão de aparecer no painel. Os dados serão preservados para rastreabilidade.`}
        icone="delete"
        textoConfirmar="Confirmar"
        carregando={inativando}
        onCancelar={() => setConfirmarInativacao(false)}
        onConfirmar={() => void inativarSolicitacoes()}
      />}
    </div>
  );
};
