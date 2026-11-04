import { useState } from 'react';
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
  status: 'rascunho' | 'pendente' | 'analise' | 'aprovado';
  kit: string;
  link: string;
}

export const HistoricoPendencias = () => {
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'projeto' | 'apoio'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'pendente' | 'analise' | 'aprovado'>('todos');
  const [search, setSearch] = useState('');

  const allItems: HistoricoItem[] = [
    // Projetos
    {
      id: 'PRJ-2026/042',
      category: 'projeto',
      formName: 'Protocolo de Abertura de Curso/Evento',
      title: 'Simpósio de Tecnologia Agrícola e Sustentabilidade 2026',
      user: 'Dr. Carlos Eduardo Silva',
      date: '28/02/2026',
      status: 'pendente',
      kit: '5/7 Anexados',
      link: '/projetos/form-curso',
    },
    {
      id: 'PRJ-2026/058',
      category: 'projeto',
      formName: 'Protocolo de Abertura de Projeto de Pesquisa',
      title: 'Estudo de Eficácia de Bioinsumos na Soja',
      user: 'Dra. Helena Martins',
      date: '25/02/2026',
      status: 'pendente',
      kit: '4/6 Anexados',
      link: '/projetos/form-pesquisa',
    },
    {
      id: 'PRJ-2026/071',
      category: 'projeto',
      formName: 'Protocolo de Central Multiusuário',
      title: 'Laboratório Multiusuário de Espectrometria de Massas',
      user: 'Dr. Roberto Albuquerque',
      date: '20/02/2026',
      status: 'pendente',
      kit: '3/5 Anexados',
      link: '/projetos/form-central',
    },
    {
      id: 'PRJ-2026/089',
      category: 'projeto',
      formName: 'Protocolo de Abertura de Publicação',
      title: 'Manual Técnico: Manejo Integrado de Nematoides',
      user: 'Dr. Fernando Guedes',
      date: '18/02/2026',
      status: 'analise',
      kit: '4/4 Anexados',
      link: '/projetos/form-publicacao',
    },
    {
      id: 'PRJ-2026/094',
      category: 'projeto',
      formName: 'Protocolo de Programa de EPE',
      title: 'Programa em Cafeicultura Regenerativa',
      user: 'Dra. Camila Nogueira',
      date: '15/02/2026',
      status: 'rascunho',
      kit: '3/6 Anexados',
      link: '/projetos/form-programa-epe',
    },
    {
      id: 'PRJ-2026/031',
      category: 'projeto',
      formName: 'Plano de Trabalho',
      title: 'Adequação Logística em Ensaios Agrícolas',
      user: 'Dr. Carlos Eduardo Silva',
      date: '10/02/2026',
      status: 'aprovado',
      kit: '3/3 Anexados',
      link: '/projetos/form-trabalho',
    },
    // Programas de Apoio
    {
      id: 'APO-2026/118',
      category: 'apoio',
      formName: 'Auxílio Viagem',
      title: 'Participação em Congresso Internacional de Fitopatologia',
      user: 'Ana Paula Souza',
      date: '01/03/2026',
      status: 'pendente',
      kit: '4/6 Anexados',
      link: '/programas-de-apoio/apoio-viagem',
    },
    {
      id: 'APO-BOL-G-2026/119',
      category: 'apoio',
      formName: 'Bolsa Acadêmica - Graduação',
      title: 'Iniciação Científica em Solos Tropicais',
      user: 'Diego Furukawa',
      date: '27/02/2026',
      status: 'pendente',
      kit: '5/7 Anexados',
      link: '/programas-de-apoio/apoio-bolsa-grad',
    },
    {
      id: 'APO-BOL-2026/119',
      category: 'apoio',
      formName: 'Bolsa Pós-Graduação',
      title: 'Doutorado Sanduíche em Genômica Funcional',
      user: 'Dr. Rodrigo Teixeira',
      date: '26/02/2026',
      status: 'pendente',
      kit: '5/8 Anexados',
      link: '/programas-de-apoio/apoio-bolsa-pos',
    },
    {
      id: 'APO-FR-02-EVEN-2026/119',
      category: 'apoio',
      formName: 'Apoio para Apresentação em Evento',
      title: 'Apresentação Oral - Simpósio Latino-Americano',
      user: 'Dr. Marcelo Calefe',
      date: '22/02/2026',
      status: 'pendente',
      kit: '5/8 Anexados',
      link: '/programas-de-apoio/apoio-evento-trabalho',
    },
    {
      id: 'APO-FR-01-INFRA-2026/119',
      category: 'apoio',
      formName: 'Apoio a Infraestrutura',
      title: 'Manutenção Preventiva de Câmaras de Crescimento',
      user: 'Dr. Lucas Tabai',
      date: '19/02/2026',
      status: 'pendente',
      kit: '5/7 Anexados',
      link: '/programas-de-apoio/apoio-infra',
    },
    {
      id: 'APO-FR-04-PUBL-2026/119',
      category: 'apoio',
      formName: 'Auxílio para Publicação de Artigo',
      title: 'Artigo Periódico Q1 Nature Agriculture',
      user: 'Prof. Josemar Mariano',
      date: '14/02/2026',
      status: 'pendente',
      kit: '9/10 Anexados',
      link: '/programas-de-apoio/apoio-publicacao',
    },
    {
      id: 'APO-FR-05-CULT-2026/120',
      category: 'apoio',
      formName: 'Cultura e Extensão Universitária',
      title: 'Feira do Produtor Rural e Difusão de Práticas',
      user: 'Profa. Mariana Castro',
      date: '08/02/2026',
      status: 'rascunho',
      kit: '3/5 Anexados',
      link: '/programas-de-apoio/apoio-cultura',
    },
    {
      id: 'APO-FR-06-MAT-2026/115',
      category: 'apoio',
      formName: 'Material de Consumo para Eventos',
      title: 'Encontro de Engenharia Agronômica',
      user: 'Dr. Roberto Santos',
      date: '02/02/2026',
      status: 'aprovado',
      kit: '4/4 Anexados',
      link: '/programas-de-apoio/apoio-material-evento',
    },
  ];

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
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl overflow-auto flex flex-col gap-xl">
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
