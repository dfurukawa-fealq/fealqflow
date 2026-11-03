import { useNavigate } from 'react-router-dom';
// import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

export const ProjetosPage = () => {
  const navigate = useNavigate();
  const forms = [
    {
      id: 'COORD',
      label: 'Cadastro De Coordenador',
      icon: 'person_add',
      req: 'Documentos Pessoais',
      path: '/form-coordenador',
    },
    {
      id: 'CURSO',
      label: 'Protocolo de Abertura de Curso/Evento',
      icon: 'school',
      req: 'Projeto Pedagógico',
      path: '/form-curso',
    },
    {
      id: 'PUB',
      label: 'Protocolo de Abertura de Publicação',
      icon: 'auto_stories',
      req: 'Opcional',
      path: '/form-publicacao',
    },
    {
      id: 'PESQ',
      label: 'Protocolo de Abertura de Projeto de Pesquisa',
      icon: 'science',
      req: 'Escopo Científico',
      path: '/form-pesquisa',
    },
    {
      id: 'PESQ2',
      label: 'Protocolo de Abertura de Projeto de Pesquisa v2',
      icon: 'biotech',
      req: 'Escopo Científico',
      path: '/form-pesquisa-v2',
    },
    {
      id: 'TRAB',
      label: 'Plano de Trabalho',
      icon: 'work',
      req: 'Cronograma Físico',
      path: '/form-trabalho',
    },
    {
      id: 'PATROC',
      label: 'Cadastro de Patrocinador',
      icon: 'handshake',
      req: 'CNPJ / Contrato Social',
      path: '/form-patrocinador',
    },
    {
      id: 'PARC',
      label: 'Cadastro de Parceiro – Evento/Curso fechado',
      icon: 'groups',
      req: 'Termo de Anuência',
      path: '/form-parceiro',
    },
    {
      id: 'COTA',
      label: 'Cotas de Patrocínio',
      icon: 'monetization_on',
      req: 'Opcional',
      path: '/form-cotas',
    },
    {
      id: 'FINAN',
      label: 'Cadastro de Financiadora',
      icon: 'account_balance',
      req: 'Estatuto / Ata Diretoria',
      path: '/form-financiadora',
    },
    {
      id: 'PLANO_RECURSOS',
      label: 'Plano de Aplicação de Recursos',
      icon: 'request_quote',
      req: 'Opcional',
      path: '/form-plano-recursos',
    },
    {
      id: 'EPE',
      label: 'Protocolo de Abertura de Programa de EPE',
      icon: 'hub',
      req: 'Projeto Integrado',
      path: '/form-programa-epe',
    },
    {
      id: 'MULTI',
      label: 'Protocolo de Abertura de Central Multiusuário',
      icon: 'devices',
      req: 'Regimento Interno',
      path: '/form-central',
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* <TopBar title="Área do Coordenador - Formulários" /> */}
      <main className="flex-1 p-xl">
        <div className="mb-lg">
          <h2 className="text-xl font-bold text-primary">
            Formulários de Projetos
          </h2>
          <p className="text-sm text-on-surface-variant">
            Selecione o formulário desejado para iniciar um novo processo.
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[56px_1fr_200px_200px] items-center px-md py-sm bg-surface-container border-b border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            <div className="text-center">Ícone</div>
            <div>Nome do Formulário</div>
            <div>Requisito de Anexo</div>
            <div className="text-right pr-sm">Ações</div>
          </div>
          {/* Body */}
          <div className="flex flex-col">
            {forms.map((form) => (
              <div
                key={form.id}
                className="grid grid-cols-[56px_1fr_200px_200px] items-center px-md min-h-[56px] border-b border-outline-variant hover:bg-surface-container-low transition-colors group last:border-0"
              >
                <div className="flex justify-center text-on-surface-variant group-hover:text-primary">
                  <span className="material-symbols-outlined text-lg">
                    {form.icon}
                  </span>
                </div>
                <div className="text-sm font-medium truncate pr-sm">
                  {form.label}
                </div>
                <div className="text-xs text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">
                    attach_file
                  </span>
                  {form.req}
                </div>
                <div className="flex items-center justify-end pr-xs">
                  <button
                    onClick={() => navigate(form.path)}
                    className="h-7 px-3 bg-secondary text-on-secondary text-xs rounded font-bold hover:opacity-90"
                  >
                    Preencher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
