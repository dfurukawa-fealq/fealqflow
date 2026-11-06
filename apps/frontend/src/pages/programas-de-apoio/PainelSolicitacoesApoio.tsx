import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Footer } from '../../components/Footer';
import { DocumentoDoProcesso, formatarDocumentosDoProcesso } from '../../utils/processoDocumentos';


interface ApoioRequest {
  id: string;
  formName: string;
  user: string;
  kit: string;
  status: 'pendente' | 'rascunho' | 'finalizada';
  link: string;
  docs: string[];
}

export const PainelSolicitacoesApoio = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'rascunho' | 'finalizada'>('todos');

  const [pendingRequests, setPendingRequests] = useState<ApoioRequest[]>([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    fetch('/api/processos?categoria=apoio', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('API indisponível');
        return response.json() as Promise<Array<{ id: string; protocolo: string; formulario_nome: string; formulario_rota: string; solicitante_nome: string; status: string; documentos_anexados: number; documentos_total: number; documentos: DocumentoDoProcesso[] }>>;
      })
      .then((processos) => {
        if (!ativo) return;
        setPendingRequests(processos.map((processo) => ({
          id: processo.protocolo,
          formName: processo.formulario_nome,
          user: processo.solicitante_nome,
          kit: `${processo.documentos_anexados}/${processo.documentos_total} Concluídos`,
          status: ['finalizada', 'enviado', 'aprovado'].includes(processo.status) ? 'finalizada' : processo.status === 'rascunho' ? 'rascunho' : 'pendente',
          link: processo.formulario_rota ? `${processo.formulario_rota}?processo=${processo.id}` : '/programas-de-apoio',
          docs: formatarDocumentosDoProcesso(processo.documentos),
        })));
      })
      .catch((falha: unknown) => { if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar as solicitações.'); });
    return () => { ativo = false; };
  }, []);

  const filtered = pendingRequests.filter((item) => {
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.formName.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl overflow-auto flex flex-col gap-xl">
        {erro && <p role="alert" className="rounded border border-error bg-red-50 p-sm text-sm text-error">{erro}</p>}
        {/* Header with Title and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Módulo Programas de Apoio
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Ciclo FEALQ 2026
              </span>
            </div>
            <h1 className="text-xl font-bold text-primary">
              Painel de Solicitações - Programas de Apoio
            </h1>
            <p className="text-sm text-on-surface-variant">
              Acompanhamento e regularização de pedidos de bolsas, auxílios viagem, publicações e infraestrutura.
            </p>
          </div>

          <Link
            to="/programas-de-apoio"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:opacity-95 transition-opacity self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">handshake</span>
            NOVA SOLICITAÇÃO DE APOIO
          </Link>
        </div>

        {/* Counter Cards */}
        <section>
          <h3 className="font-bold text-primary mb-md text-sm">
            Status das Solicitações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div
              onClick={() => setStatusFilter(statusFilter === 'rascunho' ? 'todos' : 'rascunho')}
              className={clsx(
                'bg-surface-container-lowest border rounded p-md flex items-center justify-between cursor-pointer transition-all hover:shadow-sm',
                statusFilter === 'rascunho' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'
              )}
            >
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Iniciadas / Rascunho
                </p>
                <p className="text-2xl font-bold text-primary">{pendingRequests.filter((item) => item.status === 'rascunho').length}</p>
              </div>
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'pendente' ? 'todos' : 'pendente')}
              className={clsx(
                'bg-surface-container-lowest border rounded p-md flex items-center justify-between cursor-pointer transition-all hover:shadow-sm',
                statusFilter === 'pendente' ? 'border-[#F17C58] ring-1 ring-[#F17C58]' : 'border-outline-variant'
              )}
            >
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Pendentes
                </p>
                <p className="text-2xl font-bold text-[#F17C58]">{pendingRequests.filter((item) => item.status === 'pendente').length}</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#F17C58]/10 flex items-center justify-center text-[#F17C58]">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'finalizada' ? 'todos' : 'finalizada')}
              className={clsx(
                'bg-surface-container-lowest border rounded p-md flex items-center justify-between cursor-pointer transition-all hover:shadow-sm',
                statusFilter === 'finalizada' ? 'border-[#20B293] ring-1 ring-[#20B293]' : 'border-outline-variant'
              )}
            >
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Enviadas / Finalizadas
                </p>
                <p className="text-2xl font-bold text-[#20B293]">{pendingRequests.filter((item) => item.status === 'finalizada').length}</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#20B293]/10 flex items-center justify-center text-[#20B293]">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
          </div>
        </section>

        {/* Requests Table */}
        <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden shadow-sm">
          <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-primary">
                Solicitações Pendentes de Documentação
              </h3>
              <span className="text-[10px] font-bold bg-[#F17C58]/10 text-[#F17C58] px-2 py-0.5 rounded">
                AÇÃO NECESSÁRIA
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar formulário, ID ou solicitante..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded focus:outline-none focus:border-primary"
                />
              </div>

              {statusFilter !== 'todos' && (
                <button
                  onClick={() => setStatusFilter('todos')}
                  className="text-xs text-primary underline font-medium hover:opacity-80 whitespace-nowrap"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_130px_1fr_1fr_110px_280px] gap-4 px-md py-2 border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase items-center">
              <div></div>
              <div>ID</div>
              <div>Formulário</div>
              <div>Solicitante</div>
              <div>Status Kit</div>
              <div className="text-right">Ação</div>
            </div>

            {/* Table Body */}
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-on-surface-variant">
                Nenhuma solicitação de apoio encontrada com os filtros selecionados.
              </div>
            ) : (
              filtered.map((req, idx) => (
                <div key={req.id} className="border-b border-outline-variant last:border-0">
                  <div
                    className="grid grid-cols-[40px_130px_1fr_1fr_110px_280px] gap-4 px-md items-center min-h-[48px] cursor-pointer hover:bg-surface-container-low transition-colors"
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className={clsx(
                          'material-symbols-outlined transition-transform text-on-surface-variant',
                          expandedRow === idx ? 'rotate-180' : ''
                        )}
                      >
                        expand_more
                      </span>
                    </div>

                    <div className="font-mono text-xs font-semibold text-primary">{req.id}</div>

                    <div className="text-sm font-medium text-on-surface-variant">
                      <Link
                        to={req.link}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary transition-colors hover:underline text-primary"
                      >
                        {req.formName}
                      </Link>
                    </div>

                    <div className="text-sm font-medium">{req.user}</div>

                    <div className="text-xs font-semibold text-[#F17C58]">
                      {req.kit}
                    </div>

                    <div className="flex justify-end items-center gap-2">
                      <button
                        className="h-7 w-7 border border-[#20B293] text-[#20B293] bg-[#20B293]/10 flex items-center justify-center rounded hover:bg-[#20B293]/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('https://wa.me/', '_blank');
                        }}
                        title="Contato via WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                      </button>
                      <button
                        className="h-7 w-7 border border-outline-variant text-on-surface-variant flex items-center justify-center rounded hover:bg-surface-variant transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = 'mailto:';
                        }}
                        title="Contato via E-mail"
                      >
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                      </button>
                      <Link
                        to={req.link}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center h-7 px-3 bg-primary text-white text-[10px] font-bold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        {req.status === 'finalizada' ? 'VER SOLICITAÇÃO' : 'COMPLETAR KIT'}
                      </Link>
                    </div>
                  </div>

                  {/* Expandable Document Checklist */}
                  {expandedRow === idx && (
                    <div className="bg-surface p-md border-t border-outline-variant border-l-4 border-l-[#F17C58] grid grid-cols-1 gap-2 pl-[88px]">
                      <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">
                        Documentos Exigidos pelo Edital
                      </div>
                      <ul className="text-xs space-y-1.5">
                        {req.docs.map((doc, dIdx) => {
                          const isMissing = doc.includes('FALTANDO');
                          return (
                            <li key={dIdx} className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  'material-symbols-outlined text-[16px]',
                                  isMissing ? 'text-[#F17C58]' : 'text-[#20B293]'
                                )}
                              >
                                {isMissing ? 'error' : 'check_circle'}
                              </span>
                              <span
                                className={clsx(
                                  isMissing ? 'font-semibold text-[#F17C58]' : 'text-on-surface-variant'
                                )}
                              >
                                {doc}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
                        <span>
                          Canal direto de envio de anexos pelo portal FEALQ Flow
                        </span>
                        <Link
                          to={req.link}
                          className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          Abrir formulário deste apoio
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
