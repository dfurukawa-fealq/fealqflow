import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { useAdmin } from '../../contexts/AdminContext';
import { MeusRascunhos } from '../../components/form/MeusRascunhos';
import { PROJETOS } from '../../data/projetos';

export const ProjetosPage = () => {
  const rotas = [
    {
      id: 'COORD',
      label: 'Cadastro De Coordenador',
      icon: 'person_add',
      req: 'Documentos Pessoais',
      path: '/projetos/form-coordenador',
    },
    {
      id: 'CURSO',
      label: 'Protocolo de Abertura de Curso/Evento',
      icon: 'school',
      req: 'Projeto Pedagógico',
      path: '/projetos/form-curso',
    },
    {
      id: 'PUB',
      label: 'Protocolo de Abertura de Publicação',
      icon: 'auto_stories',
      req: 'Opcional',
      path: '/projetos/form-publicacao',
    },
    {
      id: 'PESQ',
      label: 'Protocolo de Abertura de Projeto de Pesquisa',
      icon: 'science',
      req: 'Escopo Científico',
      path: '/projetos/form-pesquisa',
    },
    {
      id: 'PESQ2',
      label: 'Protocolo de Abertura de Projeto de Pesquisa v2',
      icon: 'biotech',
      req: 'Escopo Científico',
      path: '/projetos/form-pesquisa-v2',
    },
    {
      id: 'TRAB',
      label: 'Plano de Trabalho',
      icon: 'work',
      req: 'Cronograma Físico',
      path: '/projetos/form-trabalho',
    },
    {
      id: 'PATROC',
      label: 'Cadastro de Patrocinador',
      icon: 'handshake',
      req: 'CNPJ / Contrato Social',
      path: '/projetos/form-patrocinador',
    },
    {
      id: 'PARC',
      label: 'Cadastro de Parceiro – Evento/Curso fechado',
      icon: 'groups',
      req: 'Termo de Anuência',
      path: '/projetos/form-parceiro',
    },
    {
      id: 'COTA',
      label: 'Cotas de Patrocínio',
      icon: 'monetization_on',
      req: 'Opcional',
      path: '/projetos/form-cotas',
    },
    {
      id: 'FINAN',
      label: 'Cadastro de Financiadora',
      icon: 'account_balance',
      req: 'Estatuto / Ata Diretoria',
      path: '/projetos/form-financiadora',
    },
    {
      id: 'PLANO_RECURSOS',
      label: 'Plano de Aplicação de Recursos',
      icon: 'request_quote',
      req: 'Opcional',
      path: '/projetos/form-plano-recursos',
    },
    {
      id: 'EPE',
      label: 'Protocolo de Abertura de Programa de EPE',
      icon: 'hub',
      req: 'Projeto Integrado',
      path: '/projetos/form-programa-epe',
    },
    {
      id: 'MULTI',
      label: 'Protocolo de Abertura de Central Multiusuário',
      icon: 'devices',
      req: 'Regimento Interno',
      path: '/projetos/form-central',
    },
    {
      id: 'CERT_ORIENT',
      label: 'Orientações ao Coordenador FEALQ (15 Regras)',
      icon: 'menu_book',
      req: 'Leitura Obrigatória',
      path: '/projetos/orientacoes-coordenador',
    },
    {
      id: 'CERT_LGPD',
      label: 'Termo de LGPD e Confidencialidade (FR 01 - PRO)',
      icon: 'shield',
      req: 'Aceite e Assinatura',
      path: '/projetos/termo-lgpd',
    },
    {
      id: 'CERT_DEPTO',
      label: 'Ciência e Concordância do Departamento (USP)',
      icon: 'account_balance',
      req: 'Aprovação Departamental',
      path: '/projetos/ciencia-departamento',
    },
  ];

  const { formularios } = useAdmin();
  const rotasDoCatalogo = PROJETOS.map((formulario) => ({
    id: formulario.id,
    label: formulario.titulo,
    icon: formulario.icone,
    req: formulario.requisito,
    path: `/projetos/${formulario.slug}`,
  }));
  const forms = formularios
    .filter((formulario) => formulario.area === 'Projetos' && formulario.tipo === 'Formulário' && formulario.active !== false && formulario.habilitado !== false)
    .map((formulario) => {
      const rota = rotasDoCatalogo.find((item) => item.id === formulario.id) || rotas.find((item) => item.id === formulario.id) ||
        (formulario.nome.includes('Coordenador') ? rotas.find((item) => item.id === 'COORD') : undefined) ||
        (formulario.nome.includes('Curso/Evento') ? rotas.find((item) => item.id === 'CURSO') : undefined) ||
        (formulario.nome.includes('Publica') ? rotas.find((item) => item.id === 'PUB') : undefined) ||
        (formulario.nome.includes('Pesquisa') ? rotas.find((item) => item.id === 'PESQ') : undefined) ||
        (formulario.nome.includes('Plano de Trabalho') ? rotas.find((item) => item.id === 'TRAB') : undefined);
      return {
        id: formulario.id,
        label: formulario.nome,
        icon: rota?.icon || 'description',
        req: rota?.req || 'Documentos e informações do projeto',
        path: rota?.path || '#',
      };
    });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl">
        <div className="mb-lg">
          <h2 className="text-xl font-bold text-primary">
            Formulários de Projetos
          </h2>
          <p className="text-sm text-on-surface-variant">
            Selecione o formulário desejado para iniciar um novo processo.
          </p>
        </div>
        <MeusRascunhos categoria="projeto" />
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
                  <Link
                    to={form.path}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {form.label}
                  </Link>
                </div>
                <div className="text-xs text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">
                    attach_file
                  </span>
                  {form.req}
                </div>
                <div className="flex items-center justify-end pr-xs">
                  <Link
                    to={form.path}
                    className="inline-flex items-center justify-center h-7 px-3 bg-secondary text-on-secondary text-xs rounded font-bold hover:opacity-90 transition-opacity"
                  >
                    Preencher
                  </Link>
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
