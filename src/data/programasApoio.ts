/**
 * Fonte única de verdade dos Programas de Apoio FEALQ.
 *
 * Derivado de `docs/mapeamento_formularios.json` (transcrição dos editais),
 * com os prefixos de item (`a)`, `4.1.`), o `;` final e os marcadores
 * `[cite: N]` removidos. Ao atualizar um edital, atualize este arquivo.
 */

export type TipoDocumento = 'gerado' | 'upload' | 'externo';

export interface DocumentoExigido {
  id: string;
  /** Rótulo curto exibido na UI. */
  label: string;
  /** Detalhe do edital: assinaturas exigidas, limite de páginas, etc. */
  descricao?: string;
  tipo: TipoDocumento;
  /** false = condicional ou opcional; nesse caso preencha `condicao`. */
  obrigatorio: boolean;
  condicao?: string;
  url_template?: string;
  acaoEmail?: {
    email: string;
    label: string;
  };
  metadados?: string[];
}

export interface ProgramaApoio {
  id: string;
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
}

const DOC_FORMULARIO: DocumentoExigido = {
  id: 'formulario',
  label: 'Formulário de Solicitação de Apoio',
  descricao: 'Preenchimento digital gerado pelo sistema.',
  tipo: 'gerado',
  obrigatorio: true,
};

export const PROGRAMAS_APOIO: ProgramaApoio[] = [
  {
    id: 'bolsa-pos',
    path: '/apoio-bolsa-pos',
    titulo: 'Bolsa Acadêmica - Pós-graduação',
    linha: 'Ensino',
    icone: 'school',
    codigo: 'APO-BOL',
    teto: 'Tabela de Bolsas',
    normas:
      'Destinado a alunos de pós-graduação que precisam de apoio para iniciar ou finalizar o programa, sendo concedida por até três meses no início ou final dos cursos, respeitando os prazos regimentais do Programa de Pós-graduação. Requer encaminhamento realizado pela Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade parceira à qual o candidato está vinculado. É vedada prorrogação para esta modalidade. Não é permitida a acumulação de bolsas semelhantes e o auxílio deverá seguir os critérios e valores previstos na tabela de Bolsas de Incentivo do Regulamento de Bolsas da Fealq.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'justificativa',
        label: 'Justificativa da necessidade do recurso',
        descricao:
          'Assinada pelo aluno, orientador ou coordenador do programa. Limitada a uma página.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        metadados: [
          'PDF (Máx. 5MB)',
          'Limitada a 1 página',
          'Assinatura Gov.br ou Física',
        ],
      },
      {
        id: 'declaracao-sem-bolsa',
        label: 'Declaração de que não recebe bolsa',
        descricao: 'Declaração do aluno, assinada em conjunto com o orientador.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'cronograma',
        label: 'Cronograma de atividades da pesquisa',
        descricao: 'Com o período e as fases da pesquisa.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-aluno',
        label: 'Currículo Lattes do aluno (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'historico',
        label: 'Histórico escolar e declaração de matrícula',
        descricao:
          'Histórico escolar completo da graduação do aluno e declaração de matrícula da pós-graduação atualizada.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'carta-recomendacao',
        label: 'Carta de recomendação',
        descricao:
          'Preferivelmente que não seja o orientador. Limitada a uma página.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'avaliacao-social',
        label: 'Formulário de Avaliação Social',
        descricao:
          'Solicite à Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade. Após entrevista com o candidato, a DVATCOM encaminha o formulário diretamente à Fealq.',
        tipo: 'externo',
        obrigatorio: true,
        acaoEmail: {
          email: 'social.lq@usp.br',
          label: 'e-mail da DVATCOM: social.lq@usp.br'
        }
      },
    ],
  },
  {
    id: 'bolsa-graduacao',
    path: '/apoio-bolsa-grad',
    titulo: 'Bolsa Acadêmica - Graduação',
    linha: 'Ensino',
    icone: 'menu_book',
    codigo: 'APO-BOL-G',
    teto: 'Tabela de Bolsas',
    normas:
      'Destinada a alunos de graduação com vulnerabilidade socioeconômica mediante encaminhamento realizado pela Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade. Poderá ser concedida por até 12 meses.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'justificativa',
        label: 'Justificativa da necessidade do recurso',
        descricao:
          'Assinada pelo aluno e orientador. Limitada a uma página.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'declaracao-sem-bolsa',
        label: 'Declaração de que não recebe bolsa',
        descricao: 'Declaração do aluno, assinada em conjunto com o orientador.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'historico',
        label: 'Histórico escolar atualizado da graduação',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'carta-recomendacao',
        label: 'Carta de recomendação ao aluno',
        descricao: 'Limitada a uma página.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'avaliacao-social',
        label: 'Formulário de Avaliação Social',
        descricao:
          'Solicite à Divisão de Atendimento à Comunidade (DVATCOM) ou seção correspondente da unidade. Após entrevista com o candidato, a DVATCOM encaminha o formulário diretamente à Fealq.',
        tipo: 'externo',
        obrigatorio: true,
        acaoEmail: {
          email: 'social.lq@usp.br',
          label: 'e-mail da DVATCOM: social.lq@usp.br'
        }
      },
    ],
  },
  {
    id: 'infraestrutura',
    path: '/apoio-infra',
    titulo: 'Apoio Infraestrutura e Melhorias',
    linha: 'Ensino',
    icone: 'foundation',
    codigo: 'APO-FR-01-INFRA',
    teto: '20.000,00',
    normas:
      'Destinado a suprir a necessidade de modernização da estrutura física, incluindo equipamentos, reforma, assessoria, prestação de serviços ou outro item similar com impacto para a comunidade acadêmica. Podem apresentar projetos as unidades da USP parceiras da Fealq, representados por coordenadores de disciplina, presidentes de comissões acadêmicas, chefes de departamentos e diretores de unidade, desde que os projetos visem o uso coletivo. A Diretoria destinará o montante de até R$ 250.000,00, com cada pedido limitado ao valor de até R$ 20.000,00, visando atender o maior número de beneficiários. Os recursos aprovados deverão ser utilizados até 30/09/2026, sem prorrogação de prazo.',
    documentos: [
      {
        id: 'carta-justificativa',
        label: 'Carta com descrição e justificativa do pedido',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'carta-anuencia',
        label: 'Carta de anuência da chefia de departamento',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'Caso a solicitação não seja da própria chefia.',
      },
      {
        id: 'projeto',
        label: 'Projeto a ser executado',
        descricao:
          'De acordo com as regras institucionais. Limitado a 10 páginas.',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'Se aplicável.',
      },
      {
        id: 'orcamento',
        label: 'Orçamento simplificado',
        descricao: 'Com a descrição dos itens contidos na solicitação.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'comprovante-condicao',
        label: 'Comprovante da condição do solicitante',
        descricao:
          'Documento que comprove que o docente é responsável por uma disciplina ou que preside a referida comissão.',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao:
          'Para pedidos de coordenadores de disciplinas e presidentes de comissões acadêmicas.',
      },
      {
        id: 'outros',
        label: 'Outros documentos que visem instruir o pedido',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'Opcional.',
      },
    ],
  },
  {
    id: 'apresentacao-evento',
    path: '/apoio-evento-trabalho',
    titulo: 'Apresentação de Trabalho em Evento',
    linha: 'Pesquisa e Inovação',
    icone: 'campaign',
    codigo: 'APO-FR-02-EVEN',
    teto: '3.000,00 (nac.) / 6.000,00 (int.)',
    normas:
      'Destinado a alunos de graduação, pós-graduação, pesquisadores e docentes das unidades parceiras para cobrir a inscrição em evento, passagem aérea ou ônibus e/ou hospedagem e demais despesas relacionadas ao evento, que não sejam vedadas nas Normas da Fundação. O benefício exige a apresentação de comprovante do aceite do trabalho em evento técnico-científico, com limite ao teto de R$ 3.000,00 para eventos nacionais e até R$ 6.000,00 para eventos no exterior. O aluno que pleitear auxílio nesta modalidade não poderá pleitear simultaneamente na modalidade Auxílio Viagem.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'programacao',
        label: 'Programação do evento',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'projeto-origem',
        label: 'Projeto que originou o trabalho submetido',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-aluno',
        label: 'Currículo Lattes do aluno (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'resumo',
        label: 'Resumo do trabalho enviado ao evento',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'aceite',
        label: 'Aceite do trabalho',
        descricao: 'Documento obrigatório para a concessão do apoio.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'orcamentos',
        label: '2 orçamentos de fornecedores distintos',
        descricao:
          'Para cada tipo de apoio solicitado, exceto inscrição. Podem ser obtidos de estabelecimentos e/ou plataformas online.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
    ],
  },
  {
    id: 'auxilio-viagem',
    path: '/apoio-viagem',
    titulo: 'Auxílio Viagem',
    linha: 'Pesquisa e Inovação',
    icone: 'flight_takeoff',
    codigo: 'APO-FR-03-VIAG',
    teto: '3.000,00 (nac.) / 6.000,00 (int.)',
    normas:
      'Destinado a alunos de graduação e pós-graduação das unidades parceiras para cobrir custos de passagem aérea e/ou ônibus, hospedagem e outras despesas que não sejam vedadas, para a participação em estágios supervisionados, reuniões técnicas ou viagem para atendimento de necessidades de projetos de pesquisa. Limitado ao teto de até R$ 3.000,00 para viagens nacionais e R$ 6.000,00 internacionais. Esta modalidade não contempla apoio para participação em Congresso e similares. Em caso de aprovação, o beneficiário deverá comprovar após a viagem uma contrapartida à Fealq, a exemplo de vídeos ou publicação na rede social em menção ao apoio concedido.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'carta-justificativa',
        label: 'Carta com apresentação e justificativa da viagem',
        descricao: 'Assinada pelo orientador e aluno. Limitada a uma página.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-aluno',
        label: 'Currículo Lattes do aluno (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'historico',
        label: 'Histórico escolar da graduação ou pós-graduação',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'plano-atividades',
        label: 'Plano de atividades que serão desenvolvidas na viagem',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'orcamentos',
        label: '2 orçamentos de fornecedores distintos',
        descricao:
          'Para cada tipo de apoio solicitado. Podem ser obtidos de estabelecimentos físicos e/ou de plataformas online.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
    ],
  },
  {
    id: 'auxilio-publicacao',
    path: '/apoio-publicacao',
    titulo: 'Auxílio para publicação de artigo',
    linha: 'Pesquisa e Inovação',
    icone: 'article',
    codigo: 'APO-FR-04-PUBL',
    teto: 'Taxa de publicação',
    normas:
      'Destinado ao autor responsável pelo artigo, desde que esteja vinculado à linha de pesquisa da unidade parceira onde foi conduzida a pesquisa, para pagamento das taxas de publicação de artigos científicos em revistas com fator de impacto. O apoio é mediante a apresentação do artigo submetido e do comprovante de aceite da revista científica. Se o pedido for feito por aluno de pós-graduação, necessariamente deve ser o primeiro autor. Se o pedido for feito por docente, que deve ser autor correspondente, terá prioridade o artigo que também tiver participação discente. Publicações em periódicos que possuem acordos transformativos assinados com a USP/CAPES isentam os pesquisadores do pagamento da taxa e não serão avaliados.',
    documentos: [
      { ...DOC_FORMULARIO, label: 'Formulário de Apoio' },
      {
        id: 'oficio',
        label: 'Ofício à Diretoria da Fealq',
        descricao:
          'Indicando nome completo do solicitante, telefone, e-mail, instituição vinculada, tipo de vínculo, nome do docente orientador, departamento, título do artigo, nome do periódico, valor da taxa de publicação e outras fontes de recursos. Limitado a duas páginas.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-aluno',
        label: 'Currículo Lattes do aluno (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'artigo',
        label: 'Cópia do artigo aprovado para publicação',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'aceite',
        label: 'Aceite da revista',
        descricao: 'Documento obrigatório para a concessão do apoio.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'invoice',
        label: 'Invoice',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'metricas',
        label: 'Fator de Impacto e Citescore do periódico',
        descricao:
          'Fator de Impacto (Impact Factor) e Número Médio de Citações (Citescore) do periódico científico no qual o artigo será publicado.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'matricula',
        label: 'Comprovante de matrícula',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'No caso de estudantes.',
      },
      {
        id: 'credenciamento',
        label: 'Comprovante de credenciamento ao programa de pós-graduação',
        descricao: 'Comprovante vigente.',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'No caso de docentes.',
      },
    ],
  },
  {
    id: 'interesse-comunidade',
    path: '/apoio-comunidade',
    titulo: 'Apoio de Interesse da Comunidade',
    linha: 'Interesse da Comunidade',
    icone: 'group',
    codigo: 'APO-FR-05-COMU',
    teto: '5.000,00',
    normas:
      'Destinado a incentivar e viabilizar ações que promovam impacto social e fortalecimento comunitário. O foco está no apoio a iniciativas abertas à sociedade, sem vínculo com a Universidade, que valorizem a cultura, o esporte, a educação, a cidadania e que proporcionem claro impacto positivo aos beneficiários. Limitado ao teto de até R$ 5.000,00 por apoio. As propostas devem estar alinhadas com no mínimo um dos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU. Exige comprovação do crédito do patrocínio à Fundação, como contrapartida, a exemplo de publicação de vídeos ou fotos, com menção do apoio da Fealq publicado em rede social.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'carta-apoio',
        label: 'Carta de apoio institucional em papel timbrado',
        tipo: 'upload',

        obrigatorio: false,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
        condicao: 'Se aplicável.',
      },
      {
        id: 'orcamentos',
        label: '2 orçamentos de fornecedores distintos',
        descricao:
          'Podem ser obtidos de estabelecimentos físicos e/ou de plataformas online.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
    ],
  },
  {
    id: 'material-eventos',
    path: '/apoio-material-evento',
    titulo: 'Apoio Material para Eventos',
    linha: 'Cultura e Extensão Universitária',
    icone: 'event',
    codigo: 'APO-FR-06-MATE',
    teto: '3.000,00',
    normas:
      'Destinado aos eventos administrados pela Fundação, para auxílio exclusivo na contratação de coffee-break e aquisição de brindes, além de fornecimento de material de apoio Fealq (canetas, blocos e pastas). Limitado ao teto de R$ 3.000,00 por apoio. O evento deve ser promovido por unidades da USP parceiras da Fealq e a gestão administrativo-financeira deve ser realizada pela Fundação. Exige-se comprovação do crédito do patrocínio à Fundação na publicidade do evento como contrapartida, a exemplo da inserção da logomarca horizontal no material do evento, vídeos ou fotos com menção do apoio da Fealq, publicado em rede social.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'carta-evento',
        label: 'Carta com a apresentação do evento',
        descricao: 'Limitada a duas páginas.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'programacao',
        label: 'Programação do evento',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'lattes-orientador',
        label: 'Currículo Lattes do orientador (PDF)',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'orcamentos',
        label: '2 orçamentos de fornecedores distintos',
        descricao:
          'Para cada tipo de apoio solicitado. Podem ser obtidos de estabelecimentos físicos e/ou de plataformas online.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
    ],
  },
  {
    id: 'cultura-extensao',
    path: '/apoio-cultura',
    titulo: 'Cultura e Extensão Universitária',
    linha: 'Cultura e Extensão Universitária',
    icone: 'public',
    codigo: 'APO-FR-07-CULT',
    teto: '3.000,00',
    normas:
      'Destinado a apoiar atividades culturais, tais como exposições, apresentações artísticas, oficinas educativas, grupos musicais, iniciativas de bem-estar, campanhas de conscientização, integração social e outras iniciativas que valorizem a Cultura, Extensão, Inclusão e Pertencimento das unidades parceiras da Fealq. Limitado ao teto de até R$ 3.000,00 por apoio. As propostas devem estar alinhadas com no mínimo um dos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU. É exigida comprovação do crédito do patrocínio à Fundação, como contrapartida, a exemplo da inserção da logomarca horizontal da Fealq no material da iniciativa, vídeos ou fotos com menção do apoio da Fealq, publicado em rede social.',
    documentos: [
      DOC_FORMULARIO,
      {
        id: 'carta-apoio',
        label: 'Carta de apoio institucional assinada em papel timbrado',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
      {
        id: 'orcamentos',
        label: '2 orçamentos de fornecedores distintos',
        descricao:
          'Para cada tipo de apoio solicitado. Podem ser obtidos de estabelecimentos físicos e/ou de plataformas online.',
        tipo: 'upload',

        obrigatorio: true,

        url_template: 'https://fealq.org.br/wp-content/uploads/2024/02/Template-50_anos_Timbrado.docx',
      },
    ],
  },
];

export const getPrograma = (id: string): ProgramaApoio => {
  const programa = PROGRAMAS_APOIO.find((p) => p.id === id);
  if (!programa) {
    throw new Error(`Programa de apoio não encontrado: ${id}`);
  }
  return programa;
};



