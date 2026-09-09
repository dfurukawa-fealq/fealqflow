import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
// import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

export const Dashboard = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const navigate = useNavigate();

  const pendingRequests = [
    {
      id: 'PRJ-2026/042',
      formName: 'Portal do Coordenador',
      user: 'Dr. Carlos Eduardo Silva',
      kit: '2/3 Anexados',
      link: '/form-coordenador',
      docs: [
        'Plano de Trabalho (Validado)',
        'RG/CPF (Validado)',
        'FALTANDO: Termo de Anuência Institucional',
      ],
    },
    {
      id: 'APO-2026/118',
      formName: 'Auxílio Viagem',
      user: 'Ana Paula Souza',
      kit: '4/6 Anexados',
      link: '/apoio-viagem',
      docs: [
        'Formulário Principal (Validado)',
        'Carta Aceite (Validado)',
        'Cópia Passaporte (Validado)',
        'Comprovante Matrícula (Validado)',
        'FALTANDO: Plano de Atividades',
        'FALTANDO: 2 Orçamentos de Passagem',
      ],
    },
    {
      id: 'APO-BOL-G-2026/119',
      formName: 'Bolsa Acadêmica - Graduação',
      user: 'Diego Furukawa',
      kit: '5/7 Anexados',
      link: '/apoio-bolsa-grad',
      docs: [
        'Formulário de Solicitação de Apoio (Validado)',
        'Justificativa da necessidade do recurso (Validado)',
        'Declaração de que não recebe bolsa (Validado)',
        'Currículo Lattes do orientador (PDF) (Validado)',
        'Histórico escolar atualizado da graduação (Validado)',
        'FALTANDO: Carta de recomendação ao aluno',
        'FALTANDO: Formulário de Avaliação Social',        
      ],
    },

    {
      id: 'APO-BOL-2026/119',
      formName: 'Bolsa Pós-Graduação',
      user: 'Dr. Rodrigo Teixeira',
      kit: '5/8 Anexados',
      link: '/apoio-bolsa-grad',
      docs: [
        'Formulário de Solicitação de Apoio (Validado)',
        'Justificativa da necessidade do recurso (Validado)',
        'Declaração de que não recebe bolsa (Validado)',
        'Currículo Lattes do aluno (PDF) (Validado)',
        'Currículo Lattes do orientador (PDF) (Validado)',
        'FALTANDO: Histórico escolar atualizado da graduação',
        'FALTANDO: Carta de recomendação ao aluno',
        'FALTANDO: Formulário de Avaliação Social',        
      ],
    },     

    {
      id: 'APO-FR-02-EVEN-2026/119',
      formName: 'Apoio para Apresentação em Evento',
      user: 'Dr. Marcelo Calefe',
      kit: '5/8 Anexados',
      link: '/apoio-bolsa-grad',
      docs: [
        'Formulário de Solicitação de Apoio (Validado)',
        'Programação do evento (Validado)',
        'Projeto que originou o trabalho submetido (Validado)',
        'Currículo Lattes do aluno (PDF) (Validado)',
        'Currículo Lattes do orientador (PDF) (Validado)',
        'FALTANDO: Resumo do trabalho enviado ao evento',
        'FALTANDO: Aceite do trabalho',
        'FALTANDO: 2 orçamentos de fornecedores distinto',        
      ],
    },
    
    {
      id: 'APO-FR-01-INFRA-2026/119',
      formName: 'Apoio a Infraestrutura',
      user: 'Dr. Lucas Tabai',
      kit: '5/7 Anexados',
      link: '/apoio-bolsa-grad',
      docs: [
        'Formulário de Solicitação de Apoio (Validado)',
        'Carta com descrição e justificativa do pedido (Validado)',
        'Carta de anuência da chefia de departamento (Validado)',
        'Projeto a ser executado (Validado)',
        'Orçamento simplificado (Validado)',
        'FALTANDO: Comprovante da condição do solicitante',
        'FALTANDO: Outros documentos que visem instruir o pedido',          
      ],
    }, 
    
    {
      id: 'APO-FR-04-PUBL-2026/119',
      formName: 'Auxílio para Publicação de Artigo Científico',
      user: 'Prof. Josemar Mariano',
      kit: '9/10 Anexados',
      link: '/apoio-bolsa-grad',
      docs: [
        'Formulário de Solicitação de Apoio (Validado)',
        'Ofício à Diretoria da Fealq (Validado)',
        'Currículo Lattes do aluno (PDF) (Validado)',
        'Currículo Lattes do orientador (PDF) (Validado)',
        'Cópia do artigo aprovado para publicação (Validado)',
        'Aceite da revista (Validado)',
        'Invoice (Validado)',
        'Fator de Impacto e Citescore do periódico (Validado)',
        'Comprovante de matrícula (Validado)',
        'FALTANDO: Comprovante de credenciamento ao programa de pós-graduação',
      ],
    },    
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* <TopBar title="Dashboard" /> */}
      {/* <div className="bg-[#F17C58] px-xl py-2 flex items-center gap-md text-white text-sm">
        <span className="material-symbols-outlined">warning</span>
        <span>
          <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios
          incompletos. Regularize as pendências abaixo.
        </span>
      </div> */}
      <main className="flex-1 p-xl overflow-auto flex flex-col gap-xl">
        <section>
          <h3 className="font-bold text-primary mb-md">
            Status das Minhas Solicitações (No Último Mês)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-md flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Iniciadas / Rascunho
                </p>
                <p className="text-2xl font-bold text-[#20B293]">8</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#20B293]/10 flex items-center justify-center text-[#20B293]">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded p-md flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Pendentes
                </p>
                <p className="text-2xl font-bold text-[#F17C58]">7</p>
              </div>
              <div className="w-10 h-10 rounded bg-[#F17C58]/10 flex items-center justify-center text-[#F17C58]">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded p-md flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Finalizadas
                </p>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>            
          </div>
        </section>

        <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-sm font-semibold text-primary">
              Solicitações Pendentes de Documentação
            </h3>
            <span className="text-[10px] font-bold bg-[#F17C58]/10 text-[#F17C58] px-2 py-1 rounded">
              AÇÃO NECESSÁRIA
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-[40px_110px_1fr_1fr_110px_280px] gap-4 px-md py-2 border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase items-center">
              <div></div>
              <div>ID</div>
              <div>Formulário</div>
              <div>Solicitante</div>
              <div>Status Kit</div>
              <div className="text-right">Ação</div>
            </div>
            {pendingRequests.map((req, idx) => (
              <div key={idx} className="border-b border-outline-variant last:border-0">
                <div
                  className="grid grid-cols-[40px_110px_1fr_1fr_110px_280px] gap-4 px-md items-center min-h-[48px] cursor-pointer hover:bg-surface-container-low transition-colors"
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
                  <div className="font-mono text-xs">{req.id}</div>
                  <div className="text-sm font-medium text-on-surface-variant">{req.formName}</div>
                  <div className="text-sm font-medium">{req.user}</div>
                  <div className="text-xs font-semibold text-[#F17C58]">
                    {req.kit}
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      className="h-7 w-7 border border-[#20B293] text-[#20B293] bg-[#20B293]/10 flex items-center justify-center rounded hover:bg-[#20B293]/20 transition-colors"
                      onClick={(e) => { e.stopPropagation(); window.open('https://wa.me/', '_blank'); }}
                      title="Contato via WhatsApp"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                    </button>
                    <button 
                      className="h-7 w-7 border border-outline-variant text-on-surface-variant flex items-center justify-center rounded hover:bg-surface-variant transition-colors"
                      onClick={(e) => { e.stopPropagation(); window.location.href = 'mailto:'; }}
                      title="Contato via E-mail"
                    >
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(req.link); }}
                      className="h-7 px-3 bg-primary text-white text-[10px] font-bold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      COMPLETAR KIT
                    </button>
                  </div>
                </div>
                {expandedRow === idx && (
                  <div className="bg-surface p-md border-t border-outline-variant border-l-4 border-l-[#F17C58] grid grid-cols-1 gap-2 pl-[88px]">
                    <ul className="text-xs space-y-2">
                      {req.docs.map((doc, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'material-symbols-outlined text-[16px]',
                              doc.includes('FALTANDO')
                                ? 'text-[#F17C58]'
                                : 'text-[#20B293]'
                            )}
                          >
                            {doc.includes('FALTANDO') ? 'error' : 'check_circle'}
                          </span>
                          <span className={clsx(doc.includes('FALTANDO') ? 'font-medium' : 'text-on-surface-variant')}>
                            {doc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
