import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Footer } from '../../components/Footer';

interface ProjetoRequest {
  id: string;
  formName: string;
  user: string;
  projectTitle: string;
  kit: string;
  status: 'pendente' | 'rascunho' | 'finalizada';
  link: string;
  docs: string[];
}

export const PainelSolicitacoesProjetos = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'rascunho' | 'finalizada'>('todos');

  const pendingRequests: ProjetoRequest[] = [
    {
      id: 'PRJ-2026/042',
      formName: 'Protocolo de Abertura de Curso/Evento',
      projectTitle: 'Simpósio de Tecnologia Agrícola e Sustentabilidade 2026',
      user: 'Dr. Carlos Eduardo Silva',
      kit: '5/7 Anexados',
      status: 'pendente',
      link: '/projetos/form-curso',
      docs: [
        'Termo de LGPD e Confidencialidade (FR 01 - PRO) (Validado)',
        'Orientações ao Coordenador FEALQ (15 Regras) (Validado)',
        'Cadastro do Coordenador (Validado)',
        'Programação do Curso/Evento (PDF) (Validado)',
        'Cadastro de Equipe Envolvida (Validado)',
        'FALTANDO: Plano de Aplicação de Recursos (CONV-PL-01)',
        'FALTANDO: Convênio USP Assinado',
      ],
    },
    {
      id: 'PRJ-2026/058',
      formName: 'Protocolo de Abertura de Projeto de Pesquisa',
      projectTitle: 'Estudo de Eficácia e Resíduos de Bioinsumos na Cultura da Soja',
      user: 'Dra. Helena Martins',
      kit: '4/6 Anexados',
      status: 'pendente',
      link: '/projetos/form-pesquisa',
      docs: [
        'Termo de LGPD e Confidencialidade (Validado)',
        'Escopo Científico e Metodologia (Validado)',
        'Ciência e Concordância do Departamento (USP) (Validado)',
        'Currículo Lattes do Coordenador (Validado)',
        'FALTANDO: Minuta de Convênio USP',
        'FALTANDO: Cronograma de Desembolso Financeiro',
      ],
    },
    {
      id: 'PRJ-2026/071',
      formName: 'Protocolo de Abertura de Central Multiusuário',
      projectTitle: 'Laboratório Multiusuário de Espectrometria de Massas Aplicada',
      user: 'Dr. Roberto Albuquerque',
      kit: '3/5 Anexados',
      status: 'pendente',
      link: '/projetos/form-central',
      docs: [
        'Termo de Adesão e Regimento Interno (Validado)',
        'Relação de Equipamentos e Inventário (Validado)',
        'Ciência e Concordância do Departamento (USP) (Validado)',
        'FALTANDO: Tabela de Tarifas e Custos Operacionais',
        'FALTANDO: Parecer de Aprovação do Conselho Gestor',
      ],
    },
    {
      id: 'PRJ-2026/089',
      formName: 'Protocolo de Abertura de Publicação',
      projectTitle: 'Manual Técnico: Manejo Integrado de Nematoides em Solos Tropicais',
      user: 'Dr. Fernando Guedes',
      kit: '2/4 Anexados',
      status: 'pendente',
      link: '/projetos/form-publicacao',
      docs: [
        'Dados da Obra e Autoria Técnica (Validado)',
        'Orçamento Gráfico Preliminar (Validado)',
        'FALTANDO: Parecer do Comitê Editorial',
        'FALTANDO: Termo de Cessão de Direitos Autorais',
      ],
    },
    {
      id: 'PRJ-2026/094',
      formName: 'Protocolo de Abertura de Programa de EPE',
      projectTitle: 'Programa de Ensino, Pesquisa e Extensão em Cafeicultura Regenerativa',
      user: 'Dra. Camila Nogueira',
      kit: '3/6 Anexados',
      status: 'rascunho',
      link: '/projetos/form-programa-epe',
      docs: [
        'Proposta de Criação do Programa (Validado)',
        'Plano de Trabalho e Metas Trienais (Validado)',
        'Termo de Compromisso da Coordenação (Validado)',
        'FALTANDO: Parecer Departamental',
        'FALTANDO: Termos de Parceria com Patrocinadores',
        'FALTANDO: Previsão Orçamentária Trienal',
      ],
    },
    {
      id: 'PRJ-2026/031',
      formName: 'Plano de Trabalho',
      projectTitle: 'Adequação de Infraestrutura e Logística em Ensaios de Campo',
      user: 'Dr. Carlos Eduardo Silva',
      kit: '3/3 Anexados',
      status: 'finalizada',
      link: '/projetos/form-trabalho',
      docs: [
        'Cronograma Físico-Financeiro (Validado)',
        'Quadro de Metas e Entregas (Validado)',
        'Parecer de Conformidade FEALQ (Validado)',
      ],
    },
  ];

  const filtered = pendingRequests.filter((item) => {
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.formName.toLowerCase().includes(search.toLowerCase()) ||
      item.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const countRascunho = pendingRequests.filter((p) => p.status === 'rascunho').length + 4; // realistic mock volume
  const countPendente = pendingRequests.filter((p) => p.status === 'pendente').length;
  const countFinalizada = pendingRequests.filter((p) => p.status === 'finalizada').length + 8;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl overflow-auto flex flex-col gap-xl">
        {/* Header with Title and Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Módulo Projetos & Convênios
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Área do Coordenador
              </span>
            </div>
            <h1 className="text-xl font-bold text-primary">
              Painel de Solicitações - Projetos
            </h1>
            <p className="text-sm text-on-surface-variant">
              Acompanhamento detalhado de protocolos de Cursos, Eventos, Pesquisas e Centrais Multiusuário.
            </p>
          </div>

          <Link
            to="/projetos"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:opacity-95 transition-opacity self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            NOVO FORMULÁRIO DE PROJETO
          </Link>
        </div>

        {/* Counter Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div
              onClick={() => setStatusFilter(statusFilter === 'rascunho' ? 'todos' : 'rascunho')}
              className={clsx(
                'bg-surface-container-lowest border rounded p-md flex items-center justify-between cursor-pointer transition-all hover:shadow-sm',
                statusFilter === 'rascunho' ? 'border-[#20B293] ring-1 ring-[#20B293]' : 'border-outline-variant'
              )}
            >
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Iniciadas / Rascunho
                </p>
                <p className="text-2xl font-bold text-[#20B293]">{countRascunho}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Em preenchimento ou rascunho</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#20B293]/10 flex items-center justify-center text-[#20B293]">
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
                  Pendentes de Documentação
                </p>
                <p className="text-2xl font-bold text-[#F17C58]">{countPendente}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Aguardando anexos ou validações</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#F17C58]/10 flex items-center justify-center text-[#F17C58]">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'finalizada' ? 'todos' : 'finalizada')}
              className={clsx(
                'bg-surface-container-lowest border rounded p-md flex items-center justify-between cursor-pointer transition-all hover:shadow-sm',
                statusFilter === 'finalizada' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'
              )}
            >
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Finalizadas / Submetidas
                </p>
                <p className="text-2xl font-bold text-primary">{countFinalizada}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Enviadas ou aprovadas pela FEALQ</p>
              </div>
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
          </div>
        </section>

        {/* Requests Table with Filters */}
        <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden shadow-sm">
          <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">folder_special</span>
                Solicitações de Projetos
              </h3>
              <span className="text-[10px] font-bold bg-[#F17C58]/10 text-[#F17C58] px-2 py-0.5 rounded uppercase">
                {countPendente} com Ação Necessária
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search box */}
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar projeto, ID ou coordenador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded focus:outline-none focus:border-primary"
                />
              </div>

              {/* Status filter clear */}
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
            <div className="grid grid-cols-[40px_110px_1.5fr_1fr_110px_280px] gap-4 px-md py-2 border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase items-center">
              <div></div>
              <div>ID</div>
              <div>Formulário / Projeto</div>
              <div>Coordenador</div>
              <div>Status Kit</div>
              <div className="text-right">Ação</div>
            </div>

            {/* Table Rows */}
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-on-surface-variant">
                Nenhuma solicitação de projeto encontrada com os filtros selecionados.
              </div>
            ) : (
              filtered.map((req, idx) => (
                <div key={req.id} className="border-b border-outline-variant last:border-0">
                  <div
                    className="grid grid-cols-[40px_110px_1.5fr_1fr_110px_280px] gap-4 px-md items-center min-h-[54px] cursor-pointer hover:bg-surface-container-low transition-colors"
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

                    <div className="text-sm">
                      <Link
                        to={req.link}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-primary hover:underline block leading-tight"
                      >
                        {req.formName}
                      </Link>
                      <span className="text-xs text-on-surface-variant line-clamp-1">
                        {req.projectTitle}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-on-surface">{req.user}</div>

                    <div>
                      <span
                        className={clsx(
                          'text-xs font-bold px-2 py-0.5 rounded',
                          req.status === 'pendente'
                            ? 'bg-[#F17C58]/10 text-[#F17C58]'
                            : req.status === 'rascunho'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#20B293]/10 text-[#20B293]'
                        )}
                      >
                        {req.kit}
                      </span>
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
                        {req.status === 'finalizada' ? 'VER PROTOCOLO' : 'COMPLETAR KIT'}
                      </Link>
                    </div>
                  </div>

                  {/* Expandable Document Checklist */}
                  {expandedRow === idx && (
                    <div className="bg-surface p-md border-t border-outline-variant border-l-4 border-l-[#F17C58] grid grid-cols-1 gap-2 pl-[88px]">
                      <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">
                        Checklist do Kit Documental ({req.formName})
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
                          Rastreabilidade: Protocolo registrado no sistema FEALQ Flow
                        </span>
                        <Link
                          to={req.link}
                          className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          Ir para o formulário
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
