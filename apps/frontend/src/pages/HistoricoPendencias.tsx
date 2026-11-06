import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Footer } from '../components/Footer';


interface HistoricoItem {
  id: string;
  category: 'projeto' | 'apoio';
  formName: string;
  title: string;
  user: string;
  date: string;
  status: 'rascunho' | 'pendente' | 'analise' | 'aprovado' | 'enviado';
  kit: string;
  link: string;
}

export const HistoricoPendencias = () => {
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'projeto' | 'apoio'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'pendente' | 'analise' | 'aprovado' | 'enviado'>('todos');
  const [search, setSearch] = useState('');

  const [allItems, setAllItems] = useState<HistoricoItem[]>([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    fetch('/api/processos', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('API indisponível');
        return response.json() as Promise<Array<{ id: string; protocolo: string; categoria: 'projeto' | 'apoio'; formulario_nome: string; formulario_rota: string; titulo: string; solicitante_nome: string; status: string; atualizado_em: string; documentos_anexados: number; documentos_total: number }>>;
      })
      .then((processos) => {
        if (!ativo) return;
        setAllItems(processos.map((processo) => ({
          id: processo.protocolo,
          category: processo.categoria,
          formName: processo.formulario_nome,
          title: processo.titulo,
          user: processo.solicitante_nome,
          date: new Date(processo.atualizado_em).toLocaleDateString('pt-BR'),
          status: processo.status === 'analise' ? 'analise' : processo.status === 'aprovado' ? 'aprovado' : processo.status === 'enviado' ? 'enviado' : processo.status === 'rascunho' ? 'rascunho' : 'pendente',
          kit: `${processo.documentos_anexados}/${processo.documentos_total} Concluídos`,
          link: processo.formulario_rota ? `${processo.formulario_rota}?processo=${processo.id}` : processo.categoria === 'apoio' ? '/programas-de-apoio' : '/projetos',
        })));
      })
      .catch((falha: unknown) => { if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os processos.'); });
    return () => { ativo = false; };
  }, []);

  const filtered = allItems.filter((item) => {
    const matchesCat = categoryFilter === 'todos' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.formName.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: HistoricoItem['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F17C58]/10 text-[#F17C58] uppercase">
            Pendente
          </span>
        );
      case 'rascunho':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
            Rascunho
          </span>
        );
      case 'analise':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
            Em Análise
          </span>
        );
      case 'aprovado':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#20B293]/10 text-[#20B293] uppercase">
            Aprovado
          </span>
        );
      case 'enviado':
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-800">Enviado</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl overflow-auto flex flex-col gap-xl">
        {erro && <p role="alert" className="rounded border border-error bg-red-50 p-sm text-sm text-error">{erro}</p>}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Rastreabilidade Geral
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Visão Consolidada
              </span>
            </div>
            <h1 className="text-xl font-bold text-primary">
              Histórico & Pendências
            </h1>
            <p className="text-sm text-on-surface-variant">
              Central unificada para consulta e auditoria de todas as solicitações de Projetos e Programas de Apoio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/projetos/painel"
              className="px-3 py-2 border border-outline-variant text-xs font-bold rounded text-primary hover:bg-surface-variant transition-colors"
            >
              Painel de Projetos
            </Link>
            <Link
              to="/programas-de-apoio/painel"
              className="px-3 py-2 border border-outline-variant text-xs font-bold rounded text-primary hover:bg-surface-variant transition-colors"
            >
              Painel de Apoio
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-md flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center p-1 bg-surface-container-low rounded border border-outline-variant/60 text-xs font-bold">
            <button
              onClick={() => setCategoryFilter('todos')}
              className={clsx(
                'px-3 py-1.5 rounded transition-colors',
                categoryFilter === 'todos'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              Todos ({allItems.length})
            </button>
            <button
              onClick={() => setCategoryFilter('projeto')}
              className={clsx(
                'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
                categoryFilter === 'projeto'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              <span className="material-symbols-outlined text-[14px]">folder</span>
              Projetos ({allItems.filter((i) => i.category === 'projeto').length})
            </button>
            <button
              onClick={() => setCategoryFilter('apoio')}
              className={clsx(
                'px-3 py-1.5 rounded transition-colors flex items-center gap-1.5',
                categoryFilter === 'apoio'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              <span className="material-symbols-outlined text-[14px]">handshake</span>
              Programas de Apoio ({allItems.filter((i) => i.category === 'apoio').length})
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setStatusFilter('todos')}
              className={clsx(
                'px-2.5 py-1 rounded font-semibold border transition-colors whitespace-nowrap',
                statusFilter === 'todos'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              Todos Status
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={clsx(
                'px-2.5 py-1 rounded font-semibold border transition-colors whitespace-nowrap',
                statusFilter === 'pendente'
                  ? 'border-[#F17C58] bg-[#F17C58]/10 text-[#F17C58]'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('rascunho')}
              className={clsx(
                'px-2.5 py-1 rounded font-semibold border transition-colors whitespace-nowrap',
                statusFilter === 'rascunho'
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              Rascunhos
            </button>
            <button
              onClick={() => setStatusFilter('aprovado')}
              className={clsx(
                'px-2.5 py-1 rounded font-semibold border transition-colors whitespace-nowrap',
                statusFilter === 'aprovado'
                  ? 'border-[#20B293] bg-[#20B293]/10 text-[#20B293]'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              Aprovados
            </button>
            <button type="button" onClick={() => setStatusFilter('enviado')}
              className={clsx('rounded border px-2.5 py-1 font-semibold whitespace-nowrap', statusFilter === 'enviado' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-outline-variant text-on-surface-variant')}>
              Enviados
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Consolidated Table */}
        <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden shadow-sm">
          <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant flex justify-between items-center text-xs text-on-surface-variant">
            <span className="font-semibold text-primary">
              Exibindo {filtered.length} de {allItems.length} registros
            </span>
            <span>Ordenado por data mais recente</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="grid grid-cols-[100px_130px_1.5fr_1fr_100px_90px_110px_120px] gap-3 px-md py-2.5 border-b border-outline-variant bg-surface-container-low text-[11px] font-bold text-on-surface-variant uppercase items-center">
              <div>Tipo</div>
              <div>ID Protocolo</div>
              <div>Formulário & Escopo</div>
              <div>Solicitante</div>
              <div>Data</div>
              <div>Status</div>
              <div>Kit Docs</div>
              <div className="text-right">Ação</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-on-surface-variant">
                Nenhum registro encontrado com os critérios de busca informados.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[100px_130px_1.5fr_1fr_100px_90px_110px_120px] gap-3 px-md py-3 border-b border-outline-variant last:border-0 items-center hover:bg-surface-container-low transition-colors"
                >
                  {/* Category Pill */}
                  <div>
                    {item.category === 'projeto' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                        <span className="material-symbols-outlined text-[12px]">folder</span>
                        Projeto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
                        <span className="material-symbols-outlined text-[12px]">handshake</span>
                        Apoio
                      </span>
                    )}
                  </div>

                  {/* ID */}
                  <div className="font-mono text-xs font-semibold text-primary">
                    {item.id}
                  </div>

                  {/* Form & Scope */}
                  <div>
                    <Link
                      to={item.link}
                      className="text-xs font-bold text-primary hover:underline block leading-tight"
                    >
                      {item.formName}
                    </Link>
                    <span className="text-[11px] text-on-surface-variant line-clamp-1">
                      {item.title}
                    </span>
                  </div>

                  {/* Solicitante */}
                  <div className="text-xs text-on-surface font-medium truncate">
                    {item.user}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-on-surface-variant font-mono">
                    {item.date}
                  </div>

                  {/* Status */}
                  <div>{getStatusBadge(item.status)}</div>

                  {/* Kit Docs */}
                  <div className="text-xs font-semibold text-on-surface-variant">
                    {item.kit}
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <Link
                      to={item.link}
                      className="inline-flex items-center justify-center px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      ACESSAR
                    </Link>
                  </div>
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
