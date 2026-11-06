import { useProcessoState } from '../../contexts/ProcessoContext';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormActionButton } from '../../components/form/FormActionButton';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { StatusCard } from '../../components/form/StatusCard';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { useProcesso } from '../../contexts/ProcessoContext';
import { buscarEnderecoPorCep } from '../../utils/cep';
import { formatCEP, formatCPF } from '../../utils/formatters';

interface Delegado {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  nivelAcesso: 'Nivel 1 - Ordenador' | 'Nivel 2 - Criador';
}

interface MembroEquipe {
  id: string;
  nome: string;
  departamento: string;
  telefone: string;
  email: string;
}

interface LoteInscricao {
  id: string;
  descricao: string;
  valor: number;
  vagas: number;
  dataInicio: string;
  dataFim: string;
}

export const AberturaCursoEvento: React.FC = () => {
  const processoAtual = useProcesso();
  const { protocolId, gerarUrlVinculada, statusFormulario, registrarAberturaFormulario, marcarFormularioConcluido } = useRastreabilidade();
  const statusPlanoRecursos = statusFormulario('CONV-PL-01');
  const urlPlanoRecursos = gerarUrlVinculada('/projetos/form-plano-recursos', 'CONV-PL-01', 'Plano de Aplicação de Recursos');

  // --- SEÇÃO 1: INFORMAÇÕES SOBRE O PROJETO / CONVÊNIO USP ---
  const [possuiConvenio, setPossuiConvenio] = useProcessoState<'sim' | 'nao'>('possuiConvenio', 'nao');
  const [numConvenioUSP, setNumConvenioUSP] = useProcessoState('numConvenioUSP', '');
  const [numProtocoloUSP, setNumProtocoloUSP] = useProcessoState('numProtocoloUSP', '');

  // --- SEÇÃO 2: DADOS DO PROJETO ---
  const [titulo, setTitulo] = useProcessoState('titulo', '');
  const [edicao, setEdicao] = useProcessoState('edicao', '');
  const [tipoEvento, setTipoEvento] = useProcessoState('tipoEvento', 'Simpósio');
  const [publicoAlvo, setPublicoAlvo] = useProcessoState('publicoAlvo', '');
  const [cargaHoraria, setCargaHoraria] = useProcessoState('cargaHoraria', '');
  const [numeroVagas, setNumeroVagas] = useProcessoState('numeroVagas', '');
  const [dataInicio, setDataInicio] = useProcessoState('dataInicio', '');
  const [dataFim, setDataFim] = useProcessoState('dataFim', '');
  const [horarioRealizacao, setHorarioRealizacao] = useProcessoState('horarioRealizacao', '');
  const [formato, setFormato] = useProcessoState<'Presencial' | 'Online (Síncrono)' | 'Online (Assíncrono)' | 'Híbrido'>('formato', 'Presencial');
  
  // Endereço / CEP (para Presencial e Híbrido)
  const [cep, setCep] = useProcessoState('cep', '');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [logradouro, setLogradouro] = useProcessoState('logradouro', '');
  const [numeroEndereco, setNumeroEndereco] = useProcessoState('numeroEndereco', '');
  const [complemento, setComplemento] = useProcessoState('complemento', '');
  const [bairro, setBairro] = useProcessoState('bairro', '');
  const [cidade, setCidade] = useProcessoState('cidade', '');
  const [uf, setUf] = useProcessoState('uf', '');
  const [localAuditorio, setLocalAuditorio] = useProcessoState('localAuditorio', '');

  // Plataforma Doity / FEALQ (para Online e Híbrido)
  const [utilizaDoity, setUtilizaDoity] = useProcessoState<'sim' | 'nao'>('utilizaDoity', 'sim');

  // Objeto do Projeto
  const [objetoProjeto, setObjetoProjeto] = useProcessoState('objetoProjeto', '');

  // --- SEÇÃO 3: EQUIPE DO PROJETO ---
  const [coordNome, setCoordNome] = useProcessoState('coordNome', '');
  const [coordCpf, setCoordCpf] = useProcessoState('coordCpf', '');
  const [coordRg, setCoordRg] = useProcessoState('coordRg', '');
  const [coordEmail, setCoordEmail] = useProcessoState('coordEmail', '');
  const [coordDepto, setCoordDepto] = useProcessoState('coordDepto', '');
  const [coordTelefone, setCoordTelefone] = useProcessoState('coordTelefone', '');

  // Delegados de Gestão (Conveniar / USP)
  const [delegados, setDelegados] = useProcessoState<Delegado[]>('delegados', [
    { id: 'inicial', nome: '', cpf: '', telefone: '', email: '', nivelAcesso: 'Nivel 2 - Criador' },
  ]);

  // Equipe Técnica / Comissão de Apoio
  const [equipeTecnica, setEquipeTecnica] = useProcessoState<MembroEquipe[]>('equipeTecnica', [
    { id: 'inicial', nome: '', departamento: '', telefone: '', email: '' },
  ]);

  // --- SEÇÃO 4: INSTITUIÇÕES ENVOLVIDAS (IN COMPANY & PATROCÍNIO) ---
  const [inCompany, setInCompany] = useProcessoState<'sim' | 'nao'>('inCompany', 'nao');
  const [inCompanyValor, setInCompanyValor] = useProcessoState('inCompanyValor', '');
  const [inCompanyEmpresa, setInCompanyEmpresa] = useProcessoState('inCompanyEmpresa', '');
  const [inCompanyContato, setInCompanyContato] = useProcessoState('inCompanyContato', '');
  const [inCompanyEmail, setInCompanyEmail] = useProcessoState('inCompanyEmail', '');
  const [inCompanyOrigem, setInCompanyOrigem] = useProcessoState('inCompanyOrigem', 'Recurso Privado');
  const [linkParceiroCopiado, setLinkParceiroCopiado] = useState(false);
  const [emailParceiroEnviado, setEmailParceiroEnviado] = useState(false);

  const [patrocinio, setPatrocinio] = useProcessoState<'sim' | 'nao'>('patrocinio', 'nao');
  const [linkPatrocinadorCopiado, setLinkPatrocinadorCopiado] = useState(false);

  // --- SEÇÃO 5: EXECUÇÃO DO PROJETO (VALORES & INSCRIÇÕES) ---
  const [tipoInscricao, setTipoInscricao] = useProcessoState<'gratuito' | 'pago'>('tipoInscricao', 'pago');
  const [vagasGratuitas, setVagasGratuitas] = useProcessoState('vagasGratuitas', '');
  const [lotes, setLotes] = useProcessoState<LoteInscricao[]>('lotes', [
    { id: 'inicial', descricao: '', valor: 0, vagas: 0, dataInicio: '', dataFim: '' },
  ]);
  const [investimentoTexto, setInvestimentoTexto] = useProcessoState('investimentoTexto', '');
  const [informacoesAdicionais, setInformacoesAdicionais] = useProcessoState('informacoesAdicionais', '');

  // --- SEÇÃO 6: CIÊNCIA E CONCORDÂNCIA DO DEPARTAMENTO (USP) ---
  const [deptoNome, setDeptoNome] = useProcessoState('deptoNome', '');
  const [aprovacaoDepto, setAprovacaoDepto] = useProcessoState<'conselho' | 'ad_referendum'>('aprovacaoDepto', 'conselho');
  const [dataAprovacaoConselho, setDataAprovacaoConselho] = useProcessoState('dataAprovacaoConselho', '');
  const [isencaoTaxaDepto, setIsencaoTaxaDepto] = useProcessoState<'sim' | 'nao'>('isencaoTaxaDepto', 'nao');

  // --- ACEITES E LGPD ---
  const [modalLGPDOpen, setModalLGPDOpen] = useState(false);
  const [modalAceiteLGPD, setModalAceiteLGPD] = useState(false);
  const [modalPDFOpen, setModalPDFOpen] = useState(false);
  const [submetidoSucesso, setSubmetidoSucesso] = useState(false);
  const [avisoValidacao, setAvisoValidacao] = useState('');

  // Busca de CEP resiliente com timeout e tratamento de falhas
  const handleBuscarCep = async () => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const resultado = await buscarEnderecoPorCep(limpo);
      if (resultado.sucesso) {
        setLogradouro(resultado.logradouro);
        setBairro(resultado.bairro);
        setCidade(resultado.cidade);
        setUf(resultado.uf);
      }
    } finally {
      setBuscandoCep(false);
    }
  };

  // Funções de manipulação de delegados
  const adicionarDelegado = () => {
    setDelegados(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        nivelAcesso: 'Nivel 2 - Criador',
      },
    ]);
  };

  const removerDelegado = (id: string) => {
    setDelegados(prev => prev.filter(d => d.id !== id));
  };

  const atualizarDelegado = (id: string, campo: keyof Delegado, valor: string) => {
    setDelegados(prev =>
      prev.map(d => (d.id === id ? { ...d, [campo]: valor } : d))
    );
  };

  // Funções de manipulação de equipe técnica
  const adicionarMembroEquipe = () => {
    setEquipeTecnica(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        nome: '',
        departamento: '',
        telefone: '',
        email: '',
      },
    ]);
  };

  const removerMembroEquipe = (id: string) => {
    setEquipeTecnica(prev => prev.filter(m => m.id !== id));
  };

  const atualizarMembroEquipe = (id: string, campo: keyof MembroEquipe, valor: string) => {
    setEquipeTecnica(prev =>
      prev.map(m => (m.id === id ? { ...m, [campo]: valor } : m))
    );
  };

  // Funções de manipulação de lotes
  const adicionarLote = () => {
    setLotes(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        descricao: `${prev.length + 1}º Lote`,
        valor: 0,
        vagas: 0,
        dataInicio: '',
        dataFim: '',
      },
    ]);
  };

  const removerLote = (id: string) => {
    setLotes(prev => prev.filter(l => l.id !== id));
  };

  const atualizarLote = (id: string, campo: keyof LoteInscricao, valor: any) => {
    setLotes(prev =>
      prev.map(l => (l.id === id ? { ...l, [campo]: valor } : l))
    );
  };

  // Totais de lotes
  const totalVagasLotes = lotes.reduce((acc, curr) => acc + (Number(curr.vagas) || 0), 0);
  const totalArrecadacaoPrevista = lotes.reduce(
    (acc, curr) => acc + (Number(curr.valor) || 0) * (Number(curr.vagas) || 0),
    0
  );

  // Link copiado feedback com rastreabilidade
  const copiarLinkParceiro = () => {
    const url = `${window.location.origin}${gerarUrlVinculada(
      '/projetos/form-parceiro',
      'CONV-PARC-01',
      'Cadastro de Parceiro'
    )}&projeto=${encodeURIComponent(titulo || 'evento')}&coord=${encodeURIComponent(coordNome || '')}`;
    navigator.clipboard.writeText(url);
    setLinkParceiroCopiado(true);
    setTimeout(() => setLinkParceiroCopiado(false), 3000);
  };

  const copiarLinkPatrocinador = () => {
    const url = `${window.location.origin}${gerarUrlVinculada(
      '/projetos/form-patrocinador',
      'CONV-PATROC-01',
      'Cadastro de Patrocinador'
    )}&projeto=${encodeURIComponent(titulo || 'evento')}`;
    navigator.clipboard.writeText(url);
    setLinkPatrocinadorCopiado(true);
    setTimeout(() => setLinkPatrocinadorCopiado(false), 3000);
  };

  const enviarEmailParceiro = () => {
    setEmailParceiroEnviado(true);
    setTimeout(() => setEmailParceiroEnviado(false), 4000);
  };

  // Certificações e status vinculados ao protocolo
  const statusLGPD = statusFormulario('CERT-LGPD-01');
  const statusOrientacoes = statusFormulario('CERT-ORIENT-01');
  const statusDepto = statusFormulario('CERT-DEPTO-01');

  const urlLGPD = gerarUrlVinculada(
    `/projetos/termo-lgpd?coordenador=${encodeURIComponent(coordNome || '')}&cpf=${encodeURIComponent(coordCpf || '')}&rg=${encodeURIComponent(coordRg || '')}&email=${encodeURIComponent(coordEmail || '')}&departamento=${encodeURIComponent(coordDepto || deptoNome || '')}&projeto=${encodeURIComponent(titulo || '')}`,
    'CERT-LGPD-01',
    'Termo de LGPD e Confidencialidade'
  );

  const urlOrientacoes = gerarUrlVinculada(
    `/projetos/orientacoes-coordenador?coordenador=${encodeURIComponent(coordNome || '')}&cpf=${encodeURIComponent(coordCpf || '')}`,
    'CERT-ORIENT-01',
    'Orientações ao Coordenador FEALQ'
  );

  const urlDepto = gerarUrlVinculada(
    `/projetos/ciencia-departamento?depto=${encodeURIComponent(deptoNome || coordDepto || '')}&coordenador=${encodeURIComponent(coordNome || '')}&cpf=${encodeURIComponent(coordCpf || '')}`,
    'CERT-DEPTO-01',
    'Ciência e Concordância do Departamento'
  );

  // A conclusão deve vir exclusivamente dos documentos certificados no Kit Documental.
  // Os campos/aceites locais são apenas dados auxiliares do formulário de evento.
  const isLGPDValido = statusLGPD === 'concluido';
  const isOrientacoesValido = statusOrientacoes === 'concluido';
  const isDeptoValido = statusDepto === 'concluido';
  const isPlanoValido = statusPlanoRecursos === 'concluido';
  const equipePreenchida = equipeTecnica.some((membro) => membro.nome.trim().length > 0);

  // --- CONFIGURAÇÃO DO KIT DE DOCUMENTAÇÃO (DIRETRIZ FEALQ/USP) ---
  // Quando "SEM CONVÊNIO USP":
  //   a. Termo de LGPD {formulário com autopreenchimento e FLAG para aceite OBRIGATÓRIO}
  //   b. Cadastro do coordenador {formulário não obrigatório}
  //   c. Cadastro de equipe envolvida {formulário não obrigatório}
  //   d. Programação do curso/evento {anexo não obrigatório}
  //   e. Plano de aplicação de recursos {formulário não obrigatório}
  //
  // Quando "COM CONVÊNIO USP":
  //   a. Termo de LGPD {formulário com autopreenchimento e FLAG para aceite OBRIGATÓRIO}
  //   b. Cadastro do coordenador {formulário não obrigatório}
  //   c. Cadastro de equipe envolvida {formulário não obrigatório}
  //   d. Programação do curso/evento {anexo não obrigatório}
  //   e. Convênio USP assinado {anexo não obrigatório}
  //   f. Caracterização acadêmica {anexo não obrigatório}
  //   g. Caracterização financeira {anexo não obrigatório}

  const documentosBase: DocumentoExigido[] = [
    {
      id: 'termo-lgpd',
      label: 'Termo de LGPD e Confidencialidade (FR 01 - PRO)',
      descricao: isLGPDValido
        ? 'Termo assinado e certificado eletronicamente.'
        : 'Autopreenchido com dados da coordenação e evento. Aceite e leitura obrigatórios.',
      tipo: 'gerado',
      obrigatorio: true,
      condicao: 'Obrigatório',
      url_template: urlLGPD,
      status: isLGPDValido ? 'concluido' : (statusLGPD || 'pendente'),
      onAbrirLink: () =>
        registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlLGPD),
      linkTexto: isLGPDValido ? 'Revisar' : 'Ler e Assinar',
      acaoEmail: {
        email: coordEmail || 'coordenador@usp.br',
        label: 'Enviar Termo por E-mail',
      },
    },
    {
      id: 'cadastro-coordenador',
      label: 'Cadastro de Coordenador (Sem Certidões)',
      descricao: 'Caso não possua cadastro prévio na FEALQ.',
      tipo: 'gerado',
      obrigatorio: false,
      condicao: 'Condicional',
      url_template: `/projetos/form-coordenador?protocolo=${protocolId}`,
      linkTexto: 'Preencher',
    },
    {
      id: 'cadastro-equipe',
      label: 'Cadastro de Equipe Envolvida / Apoio',
      descricao: 'Docentes, alunos, pesquisadores e comissão técnica.',
      tipo: 'gerado',
      obrigatorio: false,
      condicao: 'Condicional',
      url_template: '#equipe-tecnica',
      status: equipePreenchida ? 'concluido' : undefined,
      onAbrirLink: () =>
        document.getElementById('equipe-tecnica')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      linkTexto: equipePreenchida ? 'Revisar' : 'Preencher',
    },
    {
      id: 'programacao-evento',
      label: 'Programação do Curso/Evento (PDF)',
      descricao: 'Cronograma, ementa, datas e palestrantes.',
      tipo: 'upload',
      obrigatorio: false,
      condicao: 'Anexo Opcional',
    },
  ];

  const documentosDinamicos: DocumentoExigido[] =
    possuiConvenio === 'sim'
      ? [
          {
            id: 'convenio-usp-assinado',
            label: 'Convênio USP Assinado (PDF)',
            descricao: 'Cópia digitalizada do termo de convênio firmado com a USP.',
            tipo: 'upload',
            obrigatorio: false,
            condicao: 'Anexo Opcional',
          },
          {
            id: 'caracterizacao-academica',
            label: 'Caracterização Acadêmica (USP)',
            descricao: 'Formulário acadêmico de extensão universitária.',
            tipo: 'upload',
            obrigatorio: false,
            condicao: 'Anexo Opcional',
          },
          {
            id: 'caracterizacao-financeira',
            label: 'Caracterização Financeira (USP)',
            descricao: 'Planilha/demonstrativo de custos aprovado na instância acadêmica.',
            tipo: 'upload',
            obrigatorio: false,
            condicao: 'Anexo Opcional',
          },
        ]
      : [
          {
            id: 'plano-aplicacao-recursos',
            label: 'Plano de Aplicação de Recursos (CONV-PL-01)',
            descricao: isPlanoValido
              ? 'Orçamento preenchido e vinculado com sucesso ao protocolo.'
              : 'Estruturação orçamentária de receitas e despesas do evento.',
            tipo: 'gerado',
            obrigatorio: false,
            condicao: 'Opcional',
            url_template: urlPlanoRecursos,
            status: isPlanoValido ? 'concluido' : undefined,
            onAbrirLink: () =>
              registrarAberturaFormulario('CONV-PL-01', 'Plano de Aplicação de Recursos', urlPlanoRecursos),
            linkTexto: isPlanoValido ? 'Revisar' : 'Preencher',
          },
        ];

  const documentosKit: DocumentoExigido[] = [
    ...documentosBase,
    ...documentosDinamicos,
    ...(inCompany === 'sim'
      ? [
          {
            id: 'cadastro-parceiro-link',
            label: 'Cadastro de Parceiro (Link Direto ao Financiador)',
            descricao: 'Formulário preenchido diretamente pela empresa parceira.',
            tipo: 'gerado' as const,
            obrigatorio: false,
            condicao: 'Condicional',
            url_template: `/projetos/form-parceiro?protocolo=${protocolId}`,
          },
        ]
      : []),
    ...(patrocinio === 'sim'
      ? [
          {
            id: 'carta-patrocinio',
            label: 'Carta Patrocínio (Modelo FEALQ)',
            descricao: 'Termo formal de aceite de cotas de apoio financeiro.',
            tipo: 'upload' as const,
            obrigatorio: false,
            condicao: 'Condicional',
          },
          {
            id: 'cotas-patrocinio',
            label: 'Cadastro de Cotas de Patrocínio',
            descricao: 'Definição de cotas Ouro, Prata, Bronze e benefícios.',
            tipo: 'gerado' as const,
            obrigatorio: false,
            condicao: 'Condicional',
            url_template: `/projetos/form-cotas?protocolo=${protocolId}`,
          },
          {
            id: 'cadastro-patrocinador-link',
            label: 'Cadastro de Patrocinador (Link ao Patrocinador)',
            descricao: 'Enviado por link ao patrocinador para dados cadastrais.',
            tipo: 'gerado' as const,
            obrigatorio: false,
            condicao: 'Condicional',
            url_template: `/projetos/form-patrocinador?protocolo=${protocolId}`,
          },
        ]
      : []),
  ];

  // Cálculo de progresso de preenchimento
  let preenchidos = 0;
  let totalPontos = 5;
  if (titulo.trim()) preenchidos++;
  if (coordNome.trim() && coordCpf.trim()) preenchidos++;
  if (publicoAlvo.trim()) preenchidos++;
  if (objetoProjeto.trim()) preenchidos++;
  if (isLGPDValido) preenchidos++;

  const percentualConclusao = Math.min(100, Math.round((preenchidos / totalPontos) * 100));
  const podeSubmeter =
    titulo.trim() !== '' &&
    coordNome.trim() !== '' &&
    coordCpf.trim() !== '' &&
    isLGPDValido;

  const handleSubmit = () => {
    if (!podeSubmeter) {
      if (!isLGPDValido) {
        setAvisoValidacao('A confirmação de leitura e aceite formal do Termo de LGPD e Confidencialidade (FLAG OBRIGATÓRIA) é indispensável para submeter o protocolo.');
        return;
      }
      setAvisoValidacao('Por favor, preencha todos os campos obrigatórios do projeto (Título, Coordenador e CPF).');
      return;
    }
    setAvisoValidacao('');
    setSubmetidoSucesso(true);
  };

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Projetos', 'Protocolo de Abertura de Curso/Evento']}
      titulo="Protocolo de Abertura de Curso/Evento"
      codigo="CONV-FR-01-PRO"
      badge="Novo"
      acaoPrincipal="Submeter Protocolo de Evento"
      podeEnviar={podeSubmeter}
      aoSubmeter={handleSubmit}
      botoesAcoes={<FormActionButton texto="Gerar PDF de Assinatura" icone="picture_as_pdf" type="button" onClick={() => setModalPDFOpen(true)} title="Gerar PDF para assinatura do Coordenador e Chefe de Depto" />}
      sidebar={
        <div className="flex flex-col gap-lg">
          {/* Box de Rastreabilidade e Protocolo da Sessão */}
          <div className="bg-surface-container-low border border-primary/20 rounded-lg p-sm flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">share_location</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block leading-tight">Processo</span>
                <span className="text-[13px] font-bold text-primary font-mono leading-tight">{processoAtual?.processo.protocolo ?? protocolId}</span>
              </div>
            </div>
            <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold px-xs py-[2px] rounded uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">sync</span>
              Rastreado
            </span>
          </div>

          <StatusCard
            percentual={percentualConclusao}
            nota={
              podeSubmeter
                ? 'Campos essenciais e Termo de LGPD preenchidos com sucesso. Pronto para submissão do protocolo!'
                : !isLGPDValido
                  ? 'Confirme a leitura e o aceite do Termo de LGPD e Confidencialidade no Kit de Documentação (FLAG OBRIGATÓRIA).'
                  : 'Preencha o título do evento e os dados do coordenador para liberar a submissão.'
            }
          />

          {/* Kit de Documentação */}
          <KitDocumental
            documentos={documentosKit}
            titulo="Kit de Documentação"
            acaoNoCard
          />

          {/* Banner de Aviso de Tramitação */}
          <div className="p-md bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[12px] leading-relaxed">
            <div className="flex items-center gap-xs font-semibold mb-xs text-amber-950">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Informação Importante
            </div>
            Assim que completamente preenchido, clique em submeter. Toda a documentação será conferida pelo gestor responsável pelo seu projeto na FEALQ. Em caso de necessidade de correção, retornaremos com o link desse preenchimento para ajustes no e-mail informado do coordenador.
          </div>
        </div>
      }
    >
      {/* MENSAGEM DE AVISO DE VALIDAÇÃO */}
      {avisoValidacao && (
        <div className="mb-lg p-md bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-center justify-between animate-fadeIn text-[13px]">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <span>{avisoValidacao}</span>
          </div>
          <button
            type="button"
            onClick={() => setAvisoValidacao('')}
            className="text-amber-800 hover:text-amber-950 font-medium text-[12px]"
          >
            Fechar
          </button>
        </div>
      )}

      {/* MENSAGEM DE SUCESSO DE SUBMISSÃO */}
      {submetidoSucesso && (
        <div className="mb-lg p-lg bg-green-50 border-2 border-green-500 rounded-xl text-green-900 flex items-start gap-md animate-fadeIn">
          <span className="material-symbols-outlined text-[32px] text-green-600 mt-1">
            task_alt
          </span>
          <div>
            <h3 className="font-bold text-[18px] text-green-950">
              Protocolo de Abertura Submetido com Sucesso!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O protocolo de abertura do curso/evento <strong>{titulo || 'Sem Título'}</strong> foi registrado. O gestor FEALQ iniciará a análise documental e enviará as confirmações para o e-mail: <strong>{coordEmail || 'coordenador informado'}</strong>.
            </p>
            <div className="mt-md flex flex-wrap gap-sm">
              <button
                type="button"
                onClick={() => setModalPDFOpen(true)}
                className="px-md py-xs bg-green-700 text-white rounded text-[13px] font-medium hover:bg-green-800 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Imprimir Protocolo com Folhas de Assinatura
              </button>
              <button
                type="button"
                onClick={() => setSubmetidoSucesso(false)}
                className="px-md py-xs bg-white border border-green-300 text-green-800 rounded text-[13px] font-medium hover:bg-green-100"
              >
                Voltar à Edição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. INFORMAÇÕES SOBRE O PROJETO (CONVÊNIO USP) */}
      <FormSection
        numero={1}
        icone="description"
        titulo="Informações sobre o Projeto & Convênio USP"
      >
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <span className="text-[13px] font-bold text-on-surface block">
              Possui Convênio Cadastrado na USP?
            </span>
            <span className="text-[12px] text-on-surface-variant">
              Essa definição adapta automaticamente os anexos exigidos no Kit Documental.
            </span>
          </div>

          {/* SIM = COM CONVÊNIO USP | NÃO = SEM CONVÊNIO USP */}
          <div className="flex items-center gap-lg">
            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-semibold text-on-surface">
              <input
                type="radio"
                name="possuiConvenio"
                value="sim"
                checked={possuiConvenio === 'sim'}
                onChange={() => setPossuiConvenio('sim')}
                className="w-4 h-4 text-primary accent-primary"
              />
              SIM
            </label>

            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-semibold text-on-surface">
              <input
                type="radio"
                name="possuiConvenio"
                value="nao"
                checked={possuiConvenio === 'nao'}
                onChange={() => setPossuiConvenio('nao')}
                className="w-4 h-4 text-primary accent-primary"
              />
              NÃO
            </label>
          </div>
        </div>

        {possuiConvenio === 'sim' && (
          <>
            <Field
              label="Nº do Convênio USP"
              span={6}
              placeholder="Ex: 2024/00123-USP"
              valor={numConvenioUSP}
              onChange={setNumConvenioUSP}
              hint="Preencher apenas se houver convênio cadastrado na USP."
            />
            <Field
              label="Nº do Protocolo USP"
              span={6}
              placeholder="Ex: 23.1.00000.11.2"
              valor={numProtocoloUSP}
              onChange={setNumProtocoloUSP}
              hint="Preencher apenas se houver convênio cadastrado na USP."
            />
          </>
        )}
      </FormSection>

      {/* 2. DADOS DO PROJETO & DETALHAMENTO TÉCNICO */}
      <FormSection
        numero={2}
        icone="event"
        titulo="Dados do Projeto & Detalhamento Técnico"
      >
        <Field
          label="Título do Curso/Evento"
          span={9}
          placeholder="Ex: Simpósio de Tecnologia Agrícola e Sustentabilidade"
          obrigatorio
          valor={titulo}
          onChange={setTitulo}
        />
        <Field
          label="Edição"
          span={3}
          placeholder="Ex: 5ª Edição"
          valor={edicao}
          onChange={setEdicao}
        />

        {/* Tipo de Evento (Dropdown espelhando SAP / Flávia) */}
        <Field
          label="Tipo de Evento"
          span={4}
          tipo="select"
          opcoes={[
            'Simpósio',
            'Reunião',
            'Workshop',
            'Treinamento',
            'Curso MBA',
            'Especialização',
            'Curso Difusão',
            'Outro',
          ]}
          valor={tipoEvento}
          onChange={setTipoEvento}
          hint="Espelha a classificação de eventos do SAP/FEALQ"
        />

        <Field
          label="Público-Alvo"
          span={5}
          placeholder="Estudantes, Pesquisadores, Profissionais do Setor"
          obrigatorio
          valor={publicoAlvo}
          onChange={setPublicoAlvo}
        />

        <Field
          label="Carga Horária (h)"
          span={3}
          tipo="number"
          placeholder="Ex: 40"
          obrigatorio
          valor={cargaHoraria}
          onChange={setCargaHoraria}
        />

        {/* Datas e Horário */}
        <Field
          label="Data de Início"
          span={3}
          tipo="date"
          valor={dataInicio}
          onChange={setDataInicio}
          obrigatorio
        />
        <Field
          label="Data de Término"
          span={3}
          tipo="date"
          valor={dataFim}
          onChange={setDataFim}
          obrigatorio
        />
        <Field
          label="Horário / Turno"
          span={3}
          placeholder="Ex: 08:00 às 18:00 (Integral)"
          valor={horarioRealizacao}
          onChange={setHorarioRealizacao}
        />
        <Field
          label="Número Estimado de Vagas"
          span={3}
          tipo="number"
          placeholder="Ex: 100"
          valor={numeroVagas}
          onChange={setNumeroVagas}
          hint="Substitui a estimativa genérica de pessoas"
        />

        {/* Formato de Realização */}
        <div className="col-span-12">
          <Field
            label="Formato de Realização"
            span={12}
            tipo="select"
            opcoes={[
              'Presencial',
              'Online (Síncrono)',
              'Online (Assíncrono)',
              'Híbrido',
            ]}
            valor={formato}
            onChange={(val) => setFormato(val as any)}
          />
        </div>

        {/* Campos Condicionais para Presencial ou Híbrido: Endereço Completo com busca por CEP */}
        {(formato === 'Presencial' || formato === 'Híbrido') && (
          <div className="col-span-12 bg-surface-container-low/60 border border-outline-variant p-md rounded-lg grid grid-cols-12 gap-sm overflow-hidden">
            <div className="col-span-12 flex items-center justify-between pb-xs border-b border-outline-variant/60">
              <span className="text-[13px] font-bold text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
                Local e Endereço Completo de Realização
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Preencha o CEP para autocompletar o logradouro
              </span>
            </div>

            <Field
              label="Local / Auditório / Campus"
              span={8}
              placeholder="Ex: Auditório da Engenharia, Campus USP Piracicaba"
              valor={localAuditorio}
              onChange={setLocalAuditorio}
            />

            <div className="col-span-12 md:col-span-4 flex flex-col justify-end">
              <label className="block mb-xs text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                CEP (com busca automática)
              </label>
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="13418-900"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleBuscarCep}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBuscarCep())}
                  className="w-full h-[36px] pl-sm pr-24 border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleBuscarCep}
                  disabled={buscandoCep}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-white text-[11px] font-semibold rounded hover:bg-primary-dark transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {buscandoCep ? 'sync' : 'search'}
                  </span>
                  {buscandoCep ? 'Buscando' : 'Buscar'}
                </button>
              </div>
            </div>

            <Field
              label="Logradouro"
              span={6}
              placeholder="Avenida Pádua Dias"
              valor={logradouro}
              onChange={setLogradouro}
            />
            <Field
              label="Número"
              span={2}
              placeholder="11"
              valor={numeroEndereco}
              onChange={setNumeroEndereco}
            />
            <Field
              label="Complemento"
              span={4}
              placeholder="Edifício Central, Sala 2"
              valor={complemento}
              onChange={setComplemento}
            />
            <Field
              label="Bairro"
              span={4}
              placeholder="Agronomia"
              valor={bairro}
              onChange={setBairro}
            />
            <Field
              label="Cidade"
              span={5}
              placeholder="Piracicaba"
              valor={cidade}
              onChange={setCidade}
            />
            <Field
              label="UF"
              span={3}
              placeholder="SP"
              valor={uf}
              onChange={setUf}
            />
          </div>
        )}

        {/* Pergunta Condicional para Online (Síncrono/Assíncrono) ou Híbrido: Doity / FEALQ */}
        {(formato === 'Online (Síncrono)' ||
          formato === 'Online (Assíncrono)' ||
          formato === 'Híbrido') && (
          <div className="col-span-12 bg-blue-50/70 border border-blue-200 p-md rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div>
              <span className="text-[13px] font-bold text-blue-950 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px] text-blue-700">hub</span>
                Utiliza a plataforma da Doity / FEALQ para transmissão e inscrições?
              </span>
              <span className="text-[12px] text-blue-800">
                A FEALQ possui integração direta com a plataforma Doity para emissão de certificados e checkout seguro.
              </span>
            </div>

            <div className="flex items-center gap-lg">
              <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-blue-950">
                <input
                  type="radio"
                  name="utilizaDoity"
                  value="sim"
                  checked={utilizaDoity === 'sim'}
                  onChange={() => setUtilizaDoity('sim')}
                  className="w-4 h-4 text-primary accent-primary"
                />
                Sim, utilizará Doity/FEALQ
              </label>

              <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-blue-950">
                <input
                  type="radio"
                  name="utilizaDoity"
                  value="nao"
                  checked={utilizaDoity === 'nao'}
                  onChange={() => setUtilizaDoity('nao')}
                  className="w-4 h-4 text-primary accent-primary"
                />
                Não (Outra plataforma)
              </label>
            </div>
          </div>
        )}

        {/* Objeto do Projeto / Ementa Resumida */}
        <div className="col-span-12">
          <div className="flex items-center justify-between mb-xs">
            <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
              Objeto do Projeto / Ementa Resumida <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-on-surface-variant">
              Descreva detalhadamente o escopo acadêmico/técnico
            </span>
          </div>
          <textarea
            rows={4}
            value={objetoProjeto}
            onChange={(e) => setObjetoProjeto(e.target.value)}
            placeholder="Descreva o propósito acadêmico, científico ou extensionista do curso/evento, metodologias aplicadas e resultados esperados..."
            className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
          />
        </div>
      </FormSection>

      {/* 3. EQUIPE DO PROJETO */}
      <FormSection
        numero={3}
        icone="group"
        titulo="Equipe do Projeto & Delegados de Gestão"
      >
        {/* Coordenador Responsável */}
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60">
          <div className="flex items-center justify-between mb-xs">
            <h4 className="font-bold text-[14px] text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">person</span>
              Coordenador Responsável
            </h4>
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Acesso Nível 1 Automático
            </span>
          </div>

          <div className="p-xs px-sm mb-sm bg-amber-50/80 border border-amber-200 rounded text-amber-900 text-[12px]">
            *Caso não tenha cadastro como coordenador na FEALQ, preencher <strong>CADASTRO DE COORDENADOR</strong> no kit de documentação (somente dados cadastrais simplificados).
          </div>

          <div className="grid grid-cols-12 gap-sm">
            <Field
              label="Nome Completo do Coordenador"
              span={6}
              placeholder="Ex: Prof. Dr. João Silva"
              obrigatorio
              valor={coordNome}
              onChange={setCoordNome}
            />
            <Field
              label="CPF"
              span={3}
              placeholder="000.000.000-00"
              obrigatorio
              valor={coordCpf}
              onChange={setCoordCpf}
            />
            <Field
              label="RG / Órgão Emissor"
              span={3}
              placeholder="00.000.000-0 SSP/SP"
              valor={coordRg}
              onChange={setCoordRg}
            />
            <Field
              label="Telefone p/ Contato"
              span={3}
              tipo="tel"
              placeholder="(19) 3429-0000"
              valor={coordTelefone}
              onChange={setCoordTelefone}
            />
            <Field
              label="E-mail Institucional"
              span={6}
              tipo="email"
              placeholder="coordenador@usp.br"
              obrigatorio
              valor={coordEmail}
              onChange={setCoordEmail}
              hint="Preferencialmente e-mail institucional @usp.br"
            />
            <Field
              label="Departamento / Instituição"
              span={6}
              placeholder="Ex: Engenharia de Biossistemas - FZEA/USP"
              valor={coordDepto}
              onChange={setCoordDepto}
            />
          </div>
        </div>

        {/* Delegados de Gestão (Sistema Conveniar / USP) */}
        <div className="col-span-12 mt-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-xs mb-xs">
            <div>
              <h4 className="font-bold text-[13px] text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">manage_accounts</span>
                Delegados de Gestão (Sistema Conveniar / USP)
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                Pessoas com permissão para criar ou movimentar pedidos financeiros no projeto
              </p>
            </div>
            <button
              type="button"
              onClick={adicionarDelegado}
              className="px-sm py-1 bg-surface-container border border-outline text-on-surface text-[12px] font-medium rounded hover:bg-surface-container-high flex items-center gap-1 self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Adicionar Delegado
            </button>
          </div>

          {/* Guia Didático dos Níveis de Acesso */}
          <div className="p-sm bg-neutral-50 border border-neutral-200 rounded-lg mb-sm text-[11px] text-neutral-700 grid grid-cols-1 md:grid-cols-2 gap-sm">
            <div className="p-xs bg-white rounded border border-neutral-200">
              <strong className="text-primary font-bold block mb-0.5">
                Nível 1 – Ordenador de Despesa:
              </strong>
              Coordenador ou responsável indicado por ele. Possui visão total do projeto (financeiro, compras, relatórios), e tem autorização formal para <strong>criar e enviar</strong> pedidos financeiros para a Fundação.
            </div>
            <div className="p-xs bg-white rounded border border-neutral-200">
              <strong className="text-secondary-dark font-bold block mb-0.5">
                Nível 2 – Criador:
              </strong>
              Possui competência apenas para <strong>criar pedidos</strong> em rascunho. O envio final à Fundação obrigatoriamente depende da análise e validação de um delegado Nível 1.
            </div>
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-lg">
            <table className="min-w-[700px] w-full text-[12px] text-left">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="p-xs px-sm">Nome</th>
                  <th className="p-xs px-sm">CPF</th>
                  <th className="p-xs px-sm">Telefone</th>
                  <th className="p-xs px-sm">E-mail</th>
                  <th className="p-xs px-sm">Nível de Acesso</th>
                  <th className="p-xs px-sm text-center w-12">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {delegados.map((del) => (
                  <tr key={del.id} className="hover:bg-surface-container-lowest">
                    <td className="p-xs px-sm">
                      <input
                        type="text"
                        value={del.nome}
                        onChange={(e) => atualizarDelegado(del.id, 'nome', e.target.value)}
                        placeholder="Nome completo"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm w-36">
                      <input
                        type="text"
                        value={del.cpf}
                        onChange={(e) => atualizarDelegado(del.id, 'cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm w-36">
                      <input
                        type="text"
                        value={del.telefone}
                        onChange={(e) => atualizarDelegado(del.id, 'telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm">
                      <input
                        type="email"
                        value={del.email}
                        onChange={(e) => atualizarDelegado(del.id, 'email', e.target.value)}
                        placeholder="email@usp.br"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm w-48">
                      <select
                        value={del.nivelAcesso}
                        onChange={(e) => atualizarDelegado(del.id, 'nivelAcesso', e.target.value as any)}
                        className={`w-full p-1 border rounded text-[11px] font-semibold ${
                          del.nivelAcesso.includes('Nivel 1')
                            ? 'bg-green-50 text-green-800 border-green-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        <option value="Nivel 1 - Ordenador">Nível 1 - Ordenador</option>
                        <option value="Nivel 2 - Criador">Nível 2 - Criador</option>
                      </select>
                    </td>
                    <td className="p-xs px-sm text-center">
                      <button
                        type="button"
                        onClick={() => removerDelegado(del.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover delegado"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipe Técnica / Comissão de Apoio */}
        <div id="equipe-tecnica" className="col-span-12 mt-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-xs mb-xs">
            <div>
              <h4 className="font-bold text-[13px] text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">diversity_3</span>
                Equipe Técnica e Comissão de Apoio
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                Pesquisadores, pós-doutorandos, alunos, monitores e apoio administrativo vinculados
              </p>
            </div>
            <button
              type="button"
              onClick={adicionarMembroEquipe}
              className="px-sm py-1 bg-surface-container border border-outline text-on-surface text-[12px] font-medium rounded hover:bg-surface-container-high flex items-center gap-1 self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Adicionar Membro
            </button>
          </div>

          <div className="p-xs px-sm mb-sm bg-neutral-100 rounded text-neutral-700 text-[11px]">
            *Caso algum membro não tenha cadastro na FEALQ, solicitar preenchimento do <strong>Cadastro de equipe técnica/comissão de apoio</strong> no kit de documentação.
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-lg">
            <table className="min-w-[640px] w-full text-[12px] text-left">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="p-xs px-sm">Nome</th>
                  <th className="p-xs px-sm">Departamento / Vínculo</th>
                  <th className="p-xs px-sm">Telefone</th>
                  <th className="p-xs px-sm">E-mail</th>
                  <th className="p-xs px-sm text-center w-12">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {equipeTecnica.map((membro) => (
                  <tr key={membro.id} className="hover:bg-surface-container-lowest">
                    <td className="p-xs px-sm">
                      <input
                        type="text"
                        value={membro.nome}
                        onChange={(e) => atualizarMembroEquipe(membro.id, 'nome', e.target.value)}
                        placeholder="Nome completo"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm">
                      <input
                        type="text"
                        value={membro.departamento}
                        onChange={(e) => atualizarMembroEquipe(membro.id, 'departamento', e.target.value)}
                        placeholder="Ex: Doutorando, Engenharia Agronômica"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm w-36">
                      <input
                        type="text"
                        value={membro.telefone}
                        onChange={(e) => atualizarMembroEquipe(membro.id, 'telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm">
                      <input
                        type="email"
                        value={membro.email}
                        onChange={(e) => atualizarMembroEquipe(membro.id, 'email', e.target.value)}
                        placeholder="email@usp.br"
                        className="w-full p-1 border border-outline-variant rounded text-[12px]"
                      />
                    </td>
                    <td className="p-xs px-sm text-center">
                      <button
                        type="button"
                        onClick={() => removerMembroEquipe(membro.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover membro"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormSection>

      {/* 4. INSTITUIÇÕES ENVOLVIDAS (IN COMPANY & PATROCÍNIO) */}
      <FormSection
        numero={4}
        icone="handshake"
        titulo="Instituições Envolvidas (Parcerias & Patrocínio)"
      >
        {/* Pergunta 1: In Company */}
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <span className="text-[13px] font-bold text-on-surface block">
              Será um evento/curso In Company (Fechado para empresa/instituição)?
            </span>
            <span className="text-[12px] text-on-surface-variant">
              Cursos exclusivos para funcionários de uma entidade ou empresa financiadora parceira.
            </span>
          </div>

          <div className="flex items-center gap-lg">
            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="inCompany"
                value="sim"
                checked={inCompany === 'sim'}
                onChange={() => setInCompany('sim')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Sim, é In Company
            </label>

            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="inCompany"
                value="nao"
                checked={inCompany === 'nao'}
                onChange={() => setInCompany('nao')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Não
            </label>
          </div>
        </div>

        {inCompany === 'sim' && (
          <div className="col-span-12 bg-surface-container-lowest border-2 border-primary/30 p-md rounded-lg grid grid-cols-12 gap-sm">
            <div className="col-span-12">
              <h5 className="font-bold text-[13px] text-primary flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">business</span>
                Dados Preliminares da Empresa Parceira
              </h5>
            </div>

            <Field
              label="Nome da Empresa / Instituição Parceira"
              span={6}
              placeholder="Razão Social ou Nome Fantasia"
              valor={inCompanyEmpresa}
              onChange={setInCompanyEmpresa}
            />
            <Field
              label="Ponto de Contato (Nome/Área)"
              span={6}
              placeholder="Ex: João Silva - RH / Treinamento"
              valor={inCompanyContato}
              onChange={setInCompanyContato}
            />
            <Field
              label="E-mail de Contato da Empresa"
              span={4}
              tipo="email"
              placeholder="contato@empresa.com.br"
              valor={inCompanyEmail}
              onChange={setInCompanyEmail}
            />
            <Field
              label="Valor Total Previsto (R$)"
              span={4}
              prefixo="R$"
              placeholder="0,00"
              valor={inCompanyValor}
              onChange={setInCompanyValor}
            />
            <Field
              label="Origem dos Recursos"
              span={4}
              tipo="select"
              opcoes={['Recurso Privado Nacional', 'Recurso Privado Internacional', 'Entidade Pública / Fomento', 'Misto']}
              valor={inCompanyOrigem}
              onChange={setInCompanyOrigem}
            />

            {/* Recurso de link direto para a empresa parceira sem sobrecarregar o coordenador */}
            <div className="col-span-12 mt-xs p-md bg-emerald-50 border border-emerald-300 rounded-lg">
              <div className="flex items-start justify-between gap-md">
                <div>
                  <h6 className="font-bold text-[13px] text-emerald-950 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700">forward_to_inbox</span>
                    Desoneração da Coordenação: Envio de Link para a Empresa Parceira
                  </h6>
                  <p className="text-[12px] text-emerald-900 mt-1 leading-relaxed">
                    Você não precisa coletar certidões ou preencher os dados fiscais da empresa financiadora. A empresa preenche através do link dedicado de parceiro, e o sistema FEALQ vincula automaticamente os dados ao seu projeto!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-xs shrink-0">
                  <button
                    type="button"
                    onClick={copiarLinkParceiro}
                    className="px-sm py-1.5 bg-emerald-700 text-white text-[12px] font-medium rounded hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {linkParceiroCopiado ? 'check' : 'content_copy'}
                    </span>
                    {linkParceiroCopiado ? 'Link Copiado!' : 'Copiar Link do Parceiro'}
                  </button>
                  {inCompanyEmail && (
                    <button
                      type="button"
                      onClick={enviarEmailParceiro}
                      className="px-sm py-1.5 bg-white border border-emerald-400 text-emerald-800 text-[12px] font-medium rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      {emailParceiroEnviado ? 'E-mail Enviado!' : 'Enviar ao E-mail'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pergunta 2: Captação de Patrocínio */}
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-md mt-xs">
          <div>
            <span className="text-[13px] font-bold text-on-surface block">
              Será feita captação de patrocínio para o evento?
            </span>
            <span className="text-[12px] text-on-surface-variant">
              Captação de cotas financeiras com empresas para custeio do evento acadêmico.
            </span>
          </div>

          <div className="flex items-center gap-lg">
            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="patrocinio"
                value="sim"
                checked={patrocinio === 'sim'}
                onChange={() => setPatrocinio('sim')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Sim, haverá patrocínio
            </label>

            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="patrocinio"
                value="nao"
                checked={patrocinio === 'nao'}
                onChange={() => setPatrocinio('nao')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Não
            </label>
          </div>
        </div>

        {patrocinio === 'sim' && (
          <div className="col-span-12 bg-surface-container-lowest border border-outline-variant p-md rounded-lg space-y-sm">
            <div className="p-sm bg-blue-50 border border-blue-200 rounded text-blue-900 text-[12px]">
              <strong className="block font-semibold mb-1 text-blue-950">Orientações de Patrocínio FEALQ:</strong>
              Para projetos com captação de patrocínio, você pode disponibilizar cotas pré-definidas (ex: Diamante, Ouro, Prata) e gerar um link direto para cada empresa patrocinadora preencher seus dados, sem responsabilidade do coordenador de coletar contratos e certidões manualmente.
            </div>

            <div className="flex flex-wrap items-center gap-sm pt-xs">
              <Link
                to="/projetos/form-patrocinador-cotas"
                target="_blank"
                className="px-md py-1.5 bg-primary/10 border border-primary text-primary-dark font-medium rounded text-[12px] hover:bg-primary/20 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">loyalty</span>
                Cadastrar Cotas de Patrocínio
              </Link>

              <button
                type="button"
                onClick={copiarLinkPatrocinador}
                className="px-md py-1.5 bg-surface-container border border-outline text-on-surface font-medium rounded text-[12px] hover:bg-surface-container-high flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {linkPatrocinadorCopiado ? 'check' : 'link'}
                </span>
                {linkPatrocinadorCopiado ? 'Link Copiado!' : 'Copiar Link Público para Patrocinadores'}
              </button>

              <Link
                to="/projetos/form-patrocinador"
                target="_blank"
                className="px-md py-1.5 bg-surface-container border border-outline text-on-surface font-medium rounded text-[12px] hover:bg-surface-container-high flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Acessar Formulário de Patrocinador
              </Link>
            </div>
          </div>
        )}
      </FormSection>

      {/* 5. EXECUÇÃO DO PROJETO (VALORES & INSCRIÇÕES) */}
      <FormSection
        numero={5}
        icone="payments"
        titulo="Execução do Projeto (Valores & Inscrições)"
      >
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <span className="text-[13px] font-bold text-on-surface block">
              O evento/curso será pago ou gratuito?
            </span>
            <span className="text-[12px] text-on-surface-variant">
              Eventos gratuitos requerem apenas especificação do número de vagas.
            </span>
          </div>

          <div className="flex items-center gap-lg">
            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="tipoInscricao"
                value="pago"
                checked={tipoInscricao === 'pago'}
                onChange={() => setTipoInscricao('pago')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Pago (Com cobrança de inscrição)
            </label>

            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="tipoInscricao"
                value="gratuito"
                checked={tipoInscricao === 'gratuito'}
                onChange={() => setTipoInscricao('gratuito')}
                className="w-4 h-4 text-primary accent-primary"
              />
              Gratuito (Sem cobrança)
            </label>
          </div>
        </div>

        {tipoInscricao === 'gratuito' ? (
          <div className="col-span-12">
            <Field
              label="Número Total de Vagas Gratuitas"
              span={4}
              tipo="number"
              placeholder="Ex: 80"
              obrigatorio
              valor={vagasGratuitas}
              onChange={setVagasGratuitas}
              hint="Capacidade máxima de participantes para o evento gratuito"
            />
          </div>
        ) : (
          <div className="col-span-12 space-y-md">
            {/* Tabela de Lotes Dinâmicos com abertura de linhas */}
            <div>
              <div className="flex items-center justify-between mb-xs">
                <div>
                  <h4 className="font-bold text-[13px] text-on-surface flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-primary">sell</span>
                    Tabela de Lotes de Inscrição
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Configure os lotes, valores por categoria e períodos de vigência
                  </p>
                </div>
                <button
                  type="button"
                  onClick={adicionarLote}
                  className="px-sm py-1 bg-surface-container border border-outline text-on-surface text-[12px] font-medium rounded hover:bg-surface-container-high flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Adicionar Linha de Lote
                </button>
              </div>

              <div className="overflow-x-auto border border-outline-variant rounded-lg">
                <table className="min-w-[760px] w-full text-[12px] text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                    <tr>
                      <th className="p-xs px-sm">Descrição do Lote</th>
                      <th className="p-xs px-sm w-36">Valor Inscrição (R$)</th>
                      <th className="p-xs px-sm w-28">Nº Vagas</th>
                      <th className="p-xs px-sm w-36">Início Vigência</th>
                      <th className="p-xs px-sm w-36">Fim Vigência</th>
                      <th className="p-xs px-sm text-center w-12">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {lotes.map((lote) => (
                      <tr key={lote.id} className="hover:bg-surface-container-lowest">
                        <td className="p-xs px-sm">
                          <input
                            type="text"
                            value={lote.descricao}
                            onChange={(e) => atualizarLote(lote.id, 'descricao', e.target.value)}
                            placeholder="Ex: 1º Lote - Estudantes"
                            className="w-full p-1 border border-outline-variant rounded text-[12px]"
                          />
                        </td>
                        <td className="p-xs px-sm">
                          <div className="flex items-center">
                            <span className="text-[11px] text-on-surface-variant mr-1">R$</span>
                            <input
                              type="number"
                              value={lote.valor || ''}
                              onChange={(e) => atualizarLote(lote.id, 'valor', parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="w-full p-1 border border-outline-variant rounded text-[12px]"
                            />
                          </div>
                        </td>
                        <td className="p-xs px-sm">
                          <input
                            type="number"
                            value={lote.vagas || ''}
                            onChange={(e) => atualizarLote(lote.id, 'vagas', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full p-1 border border-outline-variant rounded text-[12px]"
                          />
                        </td>
                        <td className="p-xs px-sm">
                          <input
                            type="date"
                            value={lote.dataInicio}
                            onChange={(e) => atualizarLote(lote.id, 'dataInicio', e.target.value)}
                            className="w-full p-1 border border-outline-variant rounded text-[11px]"
                          />
                        </td>
                        <td className="p-xs px-sm">
                          <input
                            type="date"
                            value={lote.dataFim}
                            onChange={(e) => atualizarLote(lote.id, 'dataFim', e.target.value)}
                            className="w-full p-1 border border-outline-variant rounded text-[11px]"
                          />
                        </td>
                        <td className="p-xs px-sm text-center">
                          <button
                            type="button"
                            onClick={() => removerLote(lote.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remover lote"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-container-low font-bold text-[12px] border-t border-outline-variant">
                    <tr>
                      <td className="p-xs px-sm">Total Estimado</td>
                      <td className="p-xs px-sm text-primary">
                        Arrecadação Máxima: R$ {totalArrecadacaoPrevista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-xs px-sm text-on-surface">
                        {totalVagasLotes} vagas
                      </td>
                      <td colSpan={3} className="p-xs px-sm text-on-surface-variant text-[11px] font-normal">
                        Previsão total estimada nos lotes
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Investimento do Curso e Evento */}
            <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/60">
              <label className="text-[13px] font-bold text-on-surface block mb-1">
                Investimento do Curso e Evento
              </label>
              <p className="text-[11px] text-on-surface-variant mb-2 leading-relaxed">
                Preencher com valores e condições do seu evento, como: taxa de inscrição, mensalidade, opções de parcelamentos, descontos, lotes, cupons de desconto, etc, em reais (R$):
                <br />
                <em className="text-neutral-500">*Para curso fechado/in company e projetos exclusivos para captação de patrocínio não é necessário o preenchimento.</em>
              </p>
              <textarea
                rows={3}
                value={investimentoTexto}
                onChange={(e) => setInvestimentoTexto(e.target.value)}
                placeholder="Informe aqui as regras de parcelamento, descontos para grupos, cupons para associados, etc..."
                className="w-full p-sm text-[13px] border border-outline rounded bg-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="col-span-12">
          <label className="text-[13px] font-bold text-on-surface block mb-1">
            Informações Adicionais (Opcional)
          </label>
          <textarea
            rows={2}
            value={informacoesAdicionais}
            onChange={(e) => setInformacoesAdicionais(e.target.value)}
            placeholder="Insira observações relevantes para a análise institucional da FEALQ..."
            className="w-full p-sm text-[13px] border border-outline rounded bg-surface focus:outline-none focus:border-primary"
          />
        </div>
      </FormSection>

      {/* 6. CIÊNCIA E CONCORDÂNCIA DO DEPARTAMENTO (USP) */}
      <FormSection
        numero={6}
        icone="account_balance"
        titulo="Ciência e Concordância do Departamento (USP)"
      >
        <div className="col-span-12 p-sm bg-neutral-100 rounded text-neutral-800 text-[11px] font-medium">
          INCLUÍDO EM TODOS OS PROJETOS DE CURSOS E EVENTOS COM DOCENTES USP
        </div>

        <Field
          label="Inserir respectivo Departamento / Unidade"
          span={12}
          placeholder="Ex: Departamento de Engenharia de Alimentos - FZEA/USP"
          obrigatorio
          valor={deptoNome}
          onChange={setDeptoNome}
        />

        <div className="col-span-12 space-y-sm bg-surface-container-low p-md rounded-lg border border-outline-variant/60">
          <span className="text-[13px] font-bold text-on-surface block">
            Modalidade de Aprovação do Departamento:
          </span>

          <label className="flex items-start gap-sm cursor-pointer p-xs rounded hover:bg-surface-container transition-colors">
            <input
              type="radio"
              name="aprovacaoDepto"
              value="conselho"
              checked={aprovacaoDepto === 'conselho'}
              onChange={() => setAprovacaoDepto('conselho')}
              className="w-4 h-4 mt-0.5 text-primary accent-primary shrink-0"
            />
            <span className="text-[12px] text-on-surface leading-relaxed">
              Este Projeto, inclusive a participação do Coordenador e/ou Docentes deste Departamento, foi <strong>aprovado pelo Conselho do Departamento</strong>. Ao Departamento compete a verificação das normas legais vigentes na USP e no Brasil, relacionadas com o objeto deste evento.
            </span>
          </label>

          {aprovacaoDepto === 'conselho' && (
            <div className="ml-6 pl-sm border-l-2 border-primary/40 my-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-xs sm:gap-md">
                <label className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap">
                  Data da Reunião do Conselho:
                </label>
                <input
                  type="date"
                  value={dataAprovacaoConselho}
                  onChange={(e) => setDataAprovacaoConselho(e.target.value)}
                  className="w-full sm:w-[220px] h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <label className="flex items-start gap-sm cursor-pointer p-xs rounded hover:bg-surface-container transition-colors">
            <input
              type="radio"
              name="aprovacaoDepto"
              value="ad_referendum"
              checked={aprovacaoDepto === 'ad_referendum'}
              onChange={() => setAprovacaoDepto('ad_referendum')}
              className="w-4 h-4 mt-0.5 text-primary accent-primary shrink-0"
            />
            <span className="text-[12px] text-on-surface leading-relaxed">
              Aprovo este Evento, inclusive a participação do Coordenador e demais Docentes deste Departamento, <strong>"ad referendum"</strong> do Conselho de Departamento, para início de sua tramitação.
            </span>
          </label>
        </div>

        {/* Isenção de Taxa do Departamento */}
        <div className="col-span-12 bg-surface-container-low p-md rounded-lg border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <span className="text-[13px] font-bold text-on-surface">
            O Departamento referido isenta da taxa que lhe cabe em prol do evento?
          </span>

          <div className="flex items-center gap-lg shrink-0">
            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="isencaoTaxaDepto"
                value="sim"
                checked={isencaoTaxaDepto === 'sim'}
                onChange={() => setIsencaoTaxaDepto('sim')}
                className="w-4 h-4 text-primary accent-primary"
              />
              SIM
            </label>

            <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-on-surface">
              <input
                type="radio"
                name="isencaoTaxaDepto"
                value="nao"
                checked={isencaoTaxaDepto === 'nao'}
                onChange={() => setIsencaoTaxaDepto('nao')}
                className="w-4 h-4 text-primary accent-primary"
              />
              NÃO
            </label>
          </div>
        </div>
      </FormSection>

      {/* 7. TERMOS, LGPD E DECLARAÇÕES FINAIS */}
      <FormSection
        numero={7}
        icone="verified_user"
        titulo="Termos de LGPD, Confidencialidade & Orientações"
      >
        <div className="col-span-12 space-y-md">
          {/* Card de Aceite do Termo de LGPD */}
          <div className="p-md rounded-lg border border-primary/30 bg-primary/5 flex flex-col gap-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
              <div className="flex items-center gap-xs text-primary font-bold text-[14px]">
                <span className="material-symbols-outlined text-[20px]">security</span>
                Termo de LGPD e Confidencialidade de Dados (FR 01 - PRO)
              </div>
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  onClick={() => {
                    setModalAceiteLGPD(isLGPDValido);
                    setModalLGPDOpen(true);
                  }}
                  className="text-[12px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                  {isLGPDValido ? 'Revisar no Modal' : 'Ler e Assinar no Modal'}
                </button>
                <Link
                  to={urlLGPD}
                  onClick={() => registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlLGPD)}
                  className="text-[12px] text-primary hover:underline font-medium flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  Página Exclusiva
                </Link>
              </div>
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              O presente termo regulamenta o sigilo e a adequada proteção e tratamento de dados pessoais de alunos, palestrantes, comissão e parceiros do curso/evento <strong>{titulo || '[Título do Evento]'}</strong>, sob coordenação de <strong>{coordNome || '[Nome do Coordenador]'}</strong>, nos estritos termos da Lei nº 13.709/2018 (LGPD).
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm pt-xs border-t border-primary/20">
              <label className="flex items-center gap-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLGPDValido}
                  onChange={(e) => {
                    if (e.target.checked && !isLGPDValido) {
                      setModalAceiteLGPD(false);
                      setModalLGPDOpen(true);
                    }
                  }}
                  className="w-5 h-5 rounded text-primary accent-primary cursor-pointer"
                />
                <span className="text-[13px] font-bold text-on-surface">
                  Declaro ter lido e aceito integralmente o Termo de LGPD e Confidencialidade (FLAG OBRIGATÓRIA) *
                </span>
              </label>

              {isLGPDValido ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-800 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Certificado Eletronicamente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-[14px]">pending</span>
                  Assinatura Pendente
                </span>
              )}
            </div>
          </div>

          {/* Card de Aceite das Orientações ao Coordenador */}
          <div className="p-md rounded-lg border border-outline-variant bg-surface-container-low flex flex-col gap-sm">
            <div className="flex items-center gap-xs text-on-surface font-bold text-[14px]">
              <span className="material-symbols-outlined text-[20px] text-secondary">menu_book</span>
              Orientações ao Coordenador FEALQ
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Orientações sobre prazos para prestação de contas, regras de ressarcimento, contratação de fornecedores e relatórios técnicos exigidos pela Fundação e pela Universidade de São Paulo.
            </p>

            <label className="flex items-center gap-sm cursor-pointer pt-xs border-t border-outline-variant/60">
              <input
                type="checkbox"
                checked={isOrientacoesValido}
                readOnly
                disabled
                className="w-5 h-5 rounded text-primary accent-primary"
              />
              <span className="text-[13px] font-bold text-on-surface">
                Declaro estar ciente e de acordo com as Orientações ao Coordenador da FEALQ *
              </span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* MODAL: TERMO DE LGPD AUTOPREENCHIDO */}
      {modalLGPDOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-md animate-fadeIn">
          <div className="bg-surface rounded-xl max-w-2xl w-full p-lg shadow-xl border border-outline flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant mb-md">
              <div className="flex items-center gap-xs text-primary font-bold text-[16px]">
                <span className="material-symbols-outlined">security</span>
                Termo de LGPD e Confidencialidade - Autopreenchimento
              </div>
              <button
                type="button"
                onClick={() => setModalLGPDOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto pr-xs space-y-sm text-[13px] text-on-surface leading-relaxed">
              <div className="p-sm bg-surface-container-low rounded-lg border border-outline-variant/60 mb-sm text-[12px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary">Dados Autopreenchidos do Protocolo</span>
                  <span className="text-[10px] bg-primary/10 text-primary font-mono px-2 py-0.5 rounded font-bold">
                    Protocolo: {protocolId}
                  </span>
                </div>
                <p><strong>Evento/Curso:</strong> {titulo || 'Nome do Curso/Evento Não Informado'}</p>
                <p><strong>Edição / Tipo:</strong> {edicao || 'Edição Padrão'} ({tipoEvento})</p>
                <p><strong>Coordenador Responsável:</strong> {coordNome || 'Nome Não Informado'} - CPF: {coordCpf || 'Não informado'}</p>
                <p><strong>Departamento/Instituição:</strong> {coordDepto || deptoNome || 'Não informado'}</p>
                <p><strong>E-mail Institucional:</strong> {coordEmail || 'Não informado'}</p>
              </div>

              <h5 className="font-bold text-[14px] text-primary">Cláusula 1ª - Do Objeto e Compromisso</h5>
              <p>
                Pelo presente instrumento, a Coordenação do Projeto compromete-se a tratar com o mais absoluto sigilo e confidencialidade quaisquer dados pessoais e dados pessoais sensíveis coletados de discentes, palestrantes, colaboradores ou parceiros durante a execução deste curso/evento.
              </p>

              <h5 className="font-bold text-[14px] text-primary">Cláusula 2ª - Do Tratamento e Finalidade</h5>
              <p>
                Os dados serão tratados única e exclusivamente para fins de inscrição, emissão de certificados, controle de frequência e prestação de contas institucional perante a FEALQ e a Universidade de São Paulo, sendo vedado o compartilhamento com terceiros não autorizados ou uso comercial não expressamente consentido pelo titular.
              </p>

              <h5 className="font-bold text-[14px] text-primary">Cláusula 3ª - Das Medidas de Segurança</h5>
              <p>
                Serão empregadas medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração ou comunicação.
              </p>

              <h5 className="font-bold text-[14px] text-primary">Cláusula 4ª - Notificação de Incidentes</h5>
              <p>
                Qualquer evento de segurança envolvendo dados de titulares vinculados ao projeto será prontamente reportado ao DPO e à Diretoria da FEALQ para adoção imediata das medidas cabíveis.
              </p>

              <h5 className="font-bold text-[14px] text-primary">Cláusula 5ª - Eliminação Segura dos Dados</h5>
              <p>
                Após a prestação de contas e expiração dos prazos regulatórios, os dados deverão ser eliminados com padrões seguros de descarte digital.
              </p>
            </div>

            <div className="pt-md mt-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-md">
              <label className="flex items-start gap-2 cursor-pointer text-[12px] font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={isLGPDValido || modalAceiteLGPD}
                  disabled={isLGPDValido}
                  onChange={(e) => setModalAceiteLGPD(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-primary accent-primary"
                />
                <span>
                  Declaro sob as penas da lei que li e concordo com os termos de LGPD (FLAG OBRIGATÓRIO) *
                </span>
              </label>

              <div className="flex items-center gap-xs">
                {!isLGPDValido ? (
                  <button
                    type="button"
                    disabled={!modalAceiteLGPD}
                    onClick={() => {
                      marcarFormularioConcluido('CERT-LGPD-01', {
                        termo: 'FR 01 – PRO - Rev. 05',
                        nomeCoordenador: coordNome,
                        cpf: coordCpf,
                        rg: coordRg,
                        departamento: coordDepto || deptoNome,
                        tituloProjeto: titulo,
                        email: coordEmail,
                        codigoCertificacao: `FEALQ-LGPD-${protocolId}`,
                        assinadoEm: new Date().toISOString(),
                        status: 'concluido',
                      });
                      setModalLGPDOpen(false);
                    }}
                    className={`px-md py-2 text-[12px] font-semibold rounded transition-colors flex items-center gap-1 ${
                      modalAceiteLGPD
                        ? 'bg-primary text-white hover:bg-primary-dark shadow-sm cursor-pointer'
                        : 'bg-surface-variant text-on-surface-variant opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Assinar Eletronicamente
                  </button>
                ) : (
                  <span className="text-[12px] font-semibold text-green-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Termo Já Certificado
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setModalLGPDOpen(false)}
                  className="px-md py-2 border border-outline text-on-surface text-[12px] font-medium rounded hover:bg-surface-container-low"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERAR PDF COM CAMPOS PARA ASSINATURA */}
      {modalPDFOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-md animate-fadeIn">
          <div className="bg-surface rounded-xl max-w-4xl w-full p-lg shadow-2xl border border-outline flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant mb-md print:hidden">
              <div className="flex items-center gap-xs text-primary font-bold text-[16px]">
                <span className="material-symbols-outlined">print</span>
                Visualização do Protocolo para Impressão & Assinaturas
              </div>
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-md py-1.5 bg-primary text-white text-[13px] font-medium rounded hover:bg-primary-dark flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Imprimir / Salvar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setModalPDFOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-md space-y-md text-on-surface text-[12px] bg-white border border-outline-variant rounded print:border-none print:p-0">
              {/* Cabeçalho do Documento Oficial */}
              <div className="border-b-2 border-primary pb-sm flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-primary">FEALQ - Fundação de Estudos Agrários Luiz de Queiroz</h2>
                  <h3 className="text-[13px] font-semibold text-neutral-800">
                    Protocolo de Abertura de Curso/Evento (CONV-FR-01-PRO)
                  </h3>
                </div>
                <div className="text-right text-[11px] text-neutral-600">
                  <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="font-semibold text-primary">Status: Em Validação</p>
                </div>
              </div>

              {/* Bloco 1: Dados do Evento */}
              <div className="grid grid-cols-2 gap-sm p-sm bg-neutral-50 rounded border border-neutral-200">
                <div>
                  <p><strong>Título:</strong> {titulo || 'Não informado'}</p>
                  <p><strong>Edição / Tipo:</strong> {edicao || '1ª Edição'} - {tipoEvento}</p>
                  <p><strong>Carga Horária:</strong> {cargaHoraria || 0} horas</p>
                  <p><strong>Número de Vagas:</strong> {tipoInscricao === 'gratuito' ? vagasGratuitas : totalVagasLotes}</p>
                </div>
                <div>
                  <p><strong>Período:</strong> {dataInicio || 'A definir'} a {dataFim || 'A definir'}</p>
                  <p><strong>Horário:</strong> {horarioRealizacao || 'Horário comercial'}</p>
                  <p><strong>Formato:</strong> {formato} {formato.includes('Online') ? `(Doity: ${utilizaDoity.toUpperCase()})` : ''}</p>
                  <p><strong>Convênio USP:</strong> {possuiConvenio === 'sim' ? `${numConvenioUSP || 'Sim'} / Prot: ${numProtocoloUSP || '-'}` : 'Não possui convênio'}</p>
                </div>
              </div>

              {/* Bloco 2: Coordenação e Delegados */}
              <div>
                <h4 className="font-bold text-[13px] text-primary mb-1">1. Coordenação & Delegados</h4>
                <p><strong>Coordenador Responsável:</strong> {coordNome} | <strong>CPF:</strong> {coordCpf} | <strong>E-mail:</strong> {coordEmail}</p>
                <p><strong>Departamento:</strong> {coordDepto}</p>
                <div className="mt-xs">
                  <span className="font-semibold text-[11px]">Delegados de Acesso (Conveniar):</span>
                  <ul className="list-disc pl-5 mt-0.5 text-[11px]">
                    {delegados.map((d) => (
                      <li key={d.id}>
                        {d.nome} ({d.cpf}) - {d.nivelAcesso} - {d.email}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bloco 3: Resumo Financeiro */}
              <div>
                <h4 className="font-bold text-[13px] text-primary mb-1">2. Regime Financeiro & Inscrições</h4>
                <p><strong>Tipo:</strong> {tipoInscricao.toUpperCase()} {inCompany === 'sim' ? `| IN COMPANY (${inCompanyEmpresa})` : ''} {patrocinio === 'sim' ? '| COM CAPTAÇÃO DE PATROCÍNIO' : ''}</p>
                {tipoInscricao === 'pago' && (
                  <p><strong>Potencial de Arrecadação:</strong> R$ {totalArrecadacaoPrevista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {totalVagasLotes} vagas totais.</p>
                )}
              </div>

              {/* Bloco 4: Termos e LGPD */}
              <div className="p-sm bg-neutral-50 rounded border border-neutral-200 text-[11px]">
                <p><strong>Aceite de LGPD:</strong> {isLGPDValido ? 'CONCORDÂNCIA REGISTRADA DIGITALMENTE' : 'PENDENTE NO KIT DOCUMENTAL'}</p>
                <p><strong>Orientações FEALQ:</strong> {isOrientacoesValido ? 'CONCORDÂNCIA REGISTRADA DIGITALMENTE' : 'PENDENTE NO KIT DOCUMENTAL'}</p>
                <p><strong>Isenção de Taxa Depto:</strong> {isencaoTaxaDepto.toUpperCase()}</p>
              </div>

              {/* Bloco 5: Folha de Assinaturas */}
              <div className="pt-lg mt-md grid grid-cols-2 gap-xl border-t border-neutral-300">
                <div className="text-center pt-md border-t border-neutral-400">
                  <p className="font-bold">{coordNome || 'Coordenador do Projeto'}</p>
                  <p className="text-[11px] text-neutral-600">Coordenador Responsável (USP / FEALQ)</p>
                </div>

                <div className="text-center pt-md border-t border-neutral-400">
                  <p className="font-bold">Chefe de Departamento / Diretor</p>
                  <p className="text-[11px] text-neutral-600">{deptoNome || 'Departamento de Origem'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormPageLayout>
  );
};
