import kitsDocumentaisJson from '../../../../data/kits_documentais.json';
import itensKitDocumentalJson from '../../../../data/itens_kit_documental.json';

/** Metadados dos Programas de Apoio e adaptação dos kits documentais em JSON. */

export type TipoDocumento = 'gerado' | 'upload' | 'externo' | 'aceite';

export interface DocumentoExigido {
  id: string;
  /** Rótulo curto exibido na UI. */
  label: string;
  /** Detalhe do edital: assinaturas exigidas, limite de páginas, etc. */
  descricao?: string;
  tipo: TipoDocumento;
  /** false = NÃO OBRIGATÓRIO ou opcional; nesse caso preencha `condicao`. */
  obrigatorio: boolean;
  permiteAnexo?: boolean;
  permiteModelo?: boolean;
  condicao?: string;
  acaoEmail?: { email: string; label: string };
  url_template?: string;
  /** Identificador do documento oficial vinculado ao catálogo administrativo. */
  documentoId?: string;
  /** Estado de preenchimento para formulários vinculados com rastreabilidade */
  status?: 'concluido' | 'pendente' | 'em_andamento';
  onAbrirLink?: () => void | Promise<void>;
  linkTexto?: string;
}

export interface PeriodoSubmissao {
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
}

export interface ProgramaApoio {
  id: string;
  /** Identificador correspondente em `cadastros_formularios.json`. */
  formularioId: string;
  path: string;
  titulo: string;
  linha: string;
  /** Material Symbol exibido na listagem. */
  icone: string;
  /**
   * Código do formulário. `APO-BOL`/`APO-BOL-G` já existiam nas telas;
   * os demais são propostos e devem ser conferidos com a Fealq.
   */
  codigo: string;
  /** Teto do edital, já formatado para exibição. */
  teto: string;
  normas: string;
  documentos: DocumentoExigido[];
  periodosSubmissao?: PeriodoSubmissao[];
}

type ProgramaApoioBase = Omit<ProgramaApoio, 'documentos'>;

interface KitDocumentalJson {
  id: string;
  formulario_id: string;
  ativo: boolean;
}

interface ItemKitDocumentalJson {
  id: string;
  kit_id: string;
  identificador: string;
  titulo: string;
  descricao: string;
  tipo: TipoDocumento;
  obrigatorio: boolean;
  permite_anexo?: boolean;
  permite_modelo?: boolean;
  url_template?: string;
  observacao_condicional?: string;
  acao_email?: { email: string; label: string };
  ordem: number;
  ativo: boolean;
}

const kitsDocumentais = kitsDocumentaisJson as KitDocumentalJson[];
const itensKitDocumental = itensKitDocumentalJson as ItemKitDocumentalJson[];

const montarKitProgramaApoio = (formularioId: string): DocumentoExigido[] => {
  const kitsEncontrados = kitsDocumentais.filter((kit) => kit.formulario_id === formularioId && kit.ativo);
  if (kitsEncontrados.length !== 1) {
    throw new Error(`Kit documental inválido para o formulário ${formularioId}.`);
  }
  const [kit] = kitsEncontrados;

  const identificadores = new Set<string>();
  return itensKitDocumental
    .filter((item) => item.kit_id === kit.id && item.ativo)
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => {
      if (identificadores.has(item.identificador)) {
        throw new Error(`O identificador "${item.identificador}" está duplicado no kit ${kit.id}.`);
      }
      identificadores.add(item.identificador);
      return {
        id: item.identificador,
        label: item.titulo,
        descricao: item.descricao || undefined,
        tipo: item.tipo,
        obrigatorio: item.obrigatorio,
        permiteAnexo: item.permite_anexo,
        permiteModelo: item.permite_modelo,
        condicao: item.observacao_condicional,
        acaoEmail: item.acao_email,
        url_template: item.url_template,
      };
    });
};

const PROGRAMAS_APOIO_BASE: ProgramaApoioBase[] = [
  {
    id: 'bolsa-pos',
    formularioId: 'apoio-formula-rio-de-solicitaa-a-o-de-apoio-ensino-bolsa-acada-mica-pa-s-graduaa-a-o-4',
    path: '/programas-de-apoio/apoio-bolsa-pos',
    titulo: 'Bolsa Acadêmica - Pós-graduação',
    linha: 'Formação & Pesquisa',
    icone: 'school',
    codigo: 'APO-BOL',
    teto: 'Tabela de Bolsas',
    normas:
      'Destinado a alunos de pós-graduação que precisam de apoio para iniciar ou finalizar o programa, sendo concedida por até três meses no início ou final dos cursos, respeitando os prazos regimentais do Programa de Pós-graduação. Requer encaminhamento realizado pela Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade parceira à qual o candidato está vinculado. É vedada prorrogação para esta modalidade. Não é permitida a acumulação de bolsas semelhantes e o auxílio deverá seguir os critérios e valores previstos na tabela de Bolsas de Incentivo do Regulamento de Bolsas da Fealq.',
  },
  {
    id: 'bolsa-graduacao',
    formularioId: 'apoio-formula-rio-de-solicitaa-a-o-de-apoio-ensino-bolsa-acada-mica-graduaa-a-o-8',
    path: '/programas-de-apoio/apoio-bolsa-grad',
    titulo: 'Bolsa Acadêmica - Graduação',
    linha: 'Formação & Pesquisa',
    icone: 'menu_book',
    codigo: 'APO-BOL-G',
    teto: 'Tabela de Bolsas',
    normas:
      'Destinada a alunos de graduação com vulnerabilidade socioeconômica mediante encaminhamento realizado pela Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade. Poderá ser concedida por até 12 meses.',
  },
  {
    id: 'infraestrutura',
    formularioId: 'apoio-edital-infraestrutura-e-melhorias-2026-1',
    path: '/programas-de-apoio/apoio-infra',
    titulo: 'Apoio Infraestrutura e Melhorias',
    linha: 'Desenvolvimento Físico',
    icone: 'foundation',
    codigo: 'APO-FR-01-INFRA',
    teto: '20.000,00',
    normas:
      'Destinado a suprir a necessidade de modernização da estrutura física, incluindo equipamentos, reforma, assessoria, prestação de serviços ou outro item similar com impacto para a comunidade acadêmica. Podem apresentar projetos as unidades da USP parceiras da Fealq, representados por coordenadores de disciplina, presidentes de comissões acadêmicas, chefes de departamentos e diretores de unidade, desde que os projetos visem o uso coletivo. A Diretoria destinará o montante de até R$ 250.000,00, com cada pedido limitado ao valor de até R$ 20.000,00, visando atender o maior número de beneficiários. Os recursos aprovados deverão ser utilizados até 30/09/2026, sem prorrogação de prazo.',
  },
  {
    id: 'apresentacao-evento',
    formularioId: 'apoio-formula-rio-solicitaa-a-o-de-apoio-pesquisa-apresentaa-a-o-trabalho-evento-7',
    path: '/programas-de-apoio/apoio-evento-trabalho',
    titulo: 'Apresentação de Trabalho em Evento',
    linha: 'Disseminação Científica',
    icone: 'campaign',
    codigo: 'APO-FR-02-EVEN',
    teto: '3.000,00 (nac.) / 6.000,00 (int.)',
    normas:
      'Destinado a alunos de graduação, pós-graduação, pesquisadores e docentes das unidades parceiras para cobrir a inscrição em evento, passagem aérea ou ônibus e/ou hospedagem e demais despesas relacionadas ao evento, que não sejam vedadas nas Normas da Fundação. O benefício exige a apresentação de comprovante do aceite do trabalho em evento técnico-científico, com limite ao teto de R$ 3.000,00 para eventos nacionais e até R$ 6.000,00 para eventos no exterior. O aluno que pleitear auxílio nesta modalidade não poderá pleitear simultaneamente na modalidade Auxílio Viagem.',
  },
  {
    id: 'auxilio-viagem',
    formularioId: 'apoio-formula-rio-solicitaa-a-o-de-apoio-pesquisa-auxa-lio-viagem-0',
    path: '/programas-de-apoio/apoio-viagem',
    titulo: 'Auxílio Viagem',
    linha: 'Mobilidade Acadêmica',
    icone: 'flight_takeoff',
    codigo: 'APO-FR-03-VIAG',
    teto: '3.000,00 (nac.) / 6.000,00 (int.)',
    normas:
      'Destinado a alunos de graduação e pós-graduação das unidades parceiras para cobrir custos de passagem aérea e/ou ônibus, hospedagem e outras despesas que não sejam vedadas, para a participação em estágios supervisionados, reuniões técnicas ou viagem para atendimento de necessidades de projetos de pesquisa. Limitado ao teto de até R$ 3.000,00 para viagens nacionais e R$ 6.000,00 internacionais. Esta modalidade não contempla apoio para participação em Congresso e similares. Em caso de aprovação, o beneficiário deverá comprovar após a viagem uma contrapartida à Fealq, a exemplo de vídeos ou publicação na rede social em menção ao apoio concedido.',
  },
  {
    id: 'auxilio-publicacao',
    formularioId: 'apoio-formula-rio-solicitaa-a-o-de-apoio-a-auxa-lio-publicaa-a-es-de-artigos-5',
    path: '/programas-de-apoio/apoio-publicacao',
    titulo: 'Auxílio para publicação de artigo',
    linha: 'Publicação & Edição',
    icone: 'article',
    codigo: 'APO-FR-04-PUBL',
    teto: 'Taxa de publicação',
    normas:
      'Destinado ao autor responsável pelo artigo, desde que esteja vinculado à linha de pesquisa da unidade parceira onde foi conduzida a pesquisa, para pagamento das taxas de publicação de artigos científicos em revistas com fator de impacto. O apoio é mediante a apresentação do artigo submetido e do comprovante de aceite da revista científica. Se o pedido for feito por aluno de pós-graduação, necessariamente deve ser o primeiro autor. Se o pedido for feito por docente, que deve ser autor correspondente, terá prioridade o artigo que também tiver participação discente. Publicações em periódicos que possuem acordos transformativos assinados com a USP/CAPES isentam os pesquisadores do pagamento da taxa e não serão avaliados.',
  },
  {
    id: 'interesse-comunidade',
    formularioId: 'apoio-formula-rio-de-solicitaa-a-o-de-apoio-interesse-da-comunidade-3',
    path: '/programas-de-apoio/apoio-comunidade',
    titulo: 'Apoio de Interesse da Comunidade',
    linha: 'Ação Social',
    icone: 'group',
    codigo: 'APO-FR-05-COMU',
    teto: '5.000,00',
    normas:
      'Destinado a incentivar e viabilizar ações que promovam impacto social e fortalecimento comunitário. O foco está no apoio a iniciativas abertas à sociedade, sem vínculo com a Universidade, que valorizem a cultura, o esporte, a educação, a cidadania e que proporcionem claro impacto positivo aos beneficiários. Limitado ao teto de até R$ 5.000,00 por apoio. As propostas devem estar alinhadas com no mínimo um dos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU. Exige comprovação do crédito do patrocínio à Fundação, como contrapartida, a exemplo de publicação de vídeos ou fotos, com menção do apoio da Fealq publicado em rede social.',
  },
  {
    id: 'material-eventos',
    formularioId: 'apoio-formula-rio-de-solicitaa-a-o-de-apoio-cultura-e-extensa-o-material-eventos-6',
    path: '/programas-de-apoio/apoio-material-evento',
    titulo: 'Apoio Material para Eventos',
    linha: 'Organização de Eventos',
    icone: 'event',
    codigo: 'APO-FR-06-MATE',
    teto: '3.000,00',
    normas:
      'Destinado aos eventos administrados pela Fundação, para auxílio exclusivo na contratação de coffee-break e aquisição de brindes, além de fornecimento de material de apoio Fealq (canetas, blocos e pastas). Limitado ao teto de R$ 3.000,00 por apoio. O evento deve ser promovido por unidades da USP parceiras da Fealq e a gestão administrativo-financeira deve ser realizada pela Fundação. Exige-se comprovação do crédito do patrocínio à Fundação na publicidade do evento como contrapartida, a exemplo da inserção da logomarca horizontal no material do evento, vídeos ou fotos com menção do apoio da Fealq, publicado em rede social.',
  },
  {
    id: 'cultura-extensao',
    formularioId: 'apoio-formula-rio-de-solicitaa-a-o-de-apoio-cultura-e-extensa-o-universita-ria-2',
    path: '/programas-de-apoio/apoio-cultura',
    titulo: 'Cultura e Extensão Universitária',
    linha: 'Extensão',
    icone: 'public',
    codigo: 'APO-FR-07-CULT',
    teto: '3.000,00',
    normas:
      'Destinado a apoiar atividades culturais, tais como exposições, apresentações artísticas, oficinas educativas, grupos musicais, iniciativas de bem-estar, campanhas de conscientização, integração social e outras iniciativas que valorizem a Cultura, Extensão, Inclusão e Pertencimento das unidades parceiras da Fealq. Limitado ao teto de até R$ 3.000,00 por apoio. As propostas devem estar alinhadas com no mínimo um dos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU. É exigida comprovação do crédito do patrocínio à Fundação, como contrapartida, a exemplo da inserção da logomarca horizontal da Fealq no material da iniciativa, vídeos ou fotos com menção do apoio da Fealq, publicado em rede social.',
  },
];

export const PROGRAMAS_APOIO: ProgramaApoio[] = PROGRAMAS_APOIO_BASE.map((programa) => ({
  ...programa,
  documentos: montarKitProgramaApoio(programa.formularioId),
}));

export const getPrograma = (id: string): ProgramaApoio => {
  const programa = PROGRAMAS_APOIO.find((p) => p.id === id);
  if (!programa) {
    throw new Error(`Programa de apoio não encontrado: ${id}`);
  }
  return programa;
};



