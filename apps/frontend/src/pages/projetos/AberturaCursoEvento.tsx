import { useProcessoState } from '../../contexts/ProcessoContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { StatusCard } from '../../components/form/StatusCard';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { useProcesso } from '../../contexts/ProcessoContext';
import { formatCPF } from '../../utils/formatters';
import { gerarIdLocal } from '../../utils/id';
import { EquipeTecnicaEditor } from '../../components/form/projetos/EquipeTecnicaEditor';
import { TermosLGPDSection } from '../../components/form/projetos/TermosLGPDSection';
import { converterReaisParaCentavos, CurrencyInput, formatarCentavosComoMoeda } from '../../components/form/CurrencyInput';
import { DelegadosEditor } from '../../components/form/projetos/DelegadosEditor';
import { CoordenadorResponsavelSection } from '../../components/form/projetos/CoordenadorResponsavelSection';
import { CienciaConcordanciaSection } from '../../components/form/projetos/CienciaConcordanciaSection';
import { InstituicoesFinanciadorasSection } from '../../components/form/projetos/InstituicoesFinanciadorasSection';
import { OrientacoesProjetoSection } from '../../components/form/projetos/OrientacoesProjetoSection';
import { TIPOS_EVENTO, UNIDADES_USP_SIGLAS } from '../../data/listas';
import { DadosProjetoCursoEventoSection } from '../../components/section/projetos/DadosProjetoCursoEventoSection';
import kitsDocumentais from '../../../../../data/kits_documentais.json';
import itensKitDocumental from '../../../../../data/itens_kit_documental.json';

interface MembroEquipe {
  id: string;
  nome: string;
  departamento: string;
  telefone: string;
  email: string;
}

interface Delegado {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  nivelAcesso: 'Nivel 1 - Ordenador' | 'Nivel 2 - Criador';
}

interface LoteInscricao {
  id: string;
  descricao: string;
  valorCentavos: number;
  /** Valor em reais usado somente para migrar rascunhos antigos. */
  valor?: number;
  vagas: number;
  dataInicio: string;
  dataFim: string;
}

const normalizarLote = (lote: LoteInscricao): LoteInscricao => {
  const { valor, ...campos } = lote;
  return {
    ...campos,
    valorCentavos: Number.isInteger(lote.valorCentavos) && lote.valorCentavos >= 0
      ? lote.valorCentavos
      : converterReaisParaCentavos(valor),
  };
};

const TIPO_EVENTO_LEGADO: Record<string, string> = { 'Simp\u00c3\u00b3sio': '', 'Simpósio': '' };
const FORMATO_LEGADO: Record<string, 'Online (Síncrono)' | 'Online (Assíncrono)' | 'Híbrido'> = {
  'Online (S\u00c3\u00adncrono)': 'Online (Síncrono)',
  'Online (Ass\u00c3\u00adncrono)': 'Online (Assíncrono)',
  'H\u00c3\u00adbrido': 'Híbrido',
};

export const AberturaCursoEvento: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const processoAtual = useProcesso();
  const { protocolId, gerarUrlVinculada, statusFormulario, registrarAberturaFormulario, marcarFormularioConcluido } = useRastreabilidade();
  const statusPlanoRecursos = statusFormulario('CONV-PL-01');
  const urlPlanoRecursos = gerarUrlVinculada('/projetos/form-plano-recursos', 'CONV-PL-01', 'Plano de Aplicação de Recursos');
  const statusCadastroCoordenador = statusFormulario('CONV-FR-07-CADT');
  const urlCadastroCoordenador = gerarUrlVinculada('/projetos/form-coordenador', 'CONV-FR-07-CADT', 'Cadastro de Coordenador');

  // --- SEÇÃO 1: INFORMAÇÕES SOBRE O PROJETO / CONVÊNIO USP ---
  const [possuiConvenio, setPossuiConvenio] = useProcessoState<'sim' | 'nao'>('possuiConvenio', 'nao');
  const [numConvenioUSP, setNumConvenioUSP] = useProcessoState('numConvenioUSP', '');
  const [numProtocoloUSP, setNumProtocoloUSP] = useProcessoState('numProtocoloUSP', '');

  // --- SEÇÃO 2: DADOS DO PROJETO ---
  const [titulo, setTitulo] = useProcessoState('titulo', '');
  const [edicao, setEdicao] = useProcessoState('edicao', '');
  const [tipoEvento, setTipoEvento] = useProcessoState('tipoEvento', '');
  const [publicoAlvo, setPublicoAlvo] = useProcessoState('publicoAlvo', '');
  const [cargaHoraria, setCargaHoraria] = useProcessoState('cargaHoraria', '');
  const [numeroVagas, setNumeroVagas] = useProcessoState('numeroVagas', '');
  const [dataInicio, setDataInicio] = useProcessoState('dataInicio', '');
  const [dataFim, setDataFim] = useProcessoState('dataFim', '');
  const [horarioRealizacao, setHorarioRealizacao] = useProcessoState('horarioRealizacao', '');
  const [formato, setFormato] = useProcessoState<'Presencial' | 'Online (Síncrono)' | 'Online (Assíncrono)' | 'Híbrido'>('formato', 'Presencial');

  useEffect(() => {
    const tipoEventoCorrigido = TIPO_EVENTO_LEGADO[tipoEvento];
    if (tipoEventoCorrigido !== undefined) setTipoEvento(tipoEventoCorrigido);
    else if (tipoEvento && !TIPOS_EVENTO.includes(tipoEvento as (typeof TIPOS_EVENTO)[number])) setTipoEvento('');
    const formatoCorrigido = FORMATO_LEGADO[formato];
    if (formatoCorrigido) setFormato(formatoCorrigido);
  }, [formato, setFormato, setTipoEvento, tipoEvento]);
  
  // Endereço / CEP (para Presencial e Híbrido)
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
  const [coordUnidade, setCoordUnidade] = useProcessoState('coordUnidade', '');
  const [coordTelefone, setCoordTelefone] = useProcessoState('coordTelefone', '');

  // Delegados de Gestão (Conveniar / USP)
  const [delegados, setDelegados] = useProcessoState<Delegado[]>('delegados', [
    { id: 'inicial', nome: '', cpf: '', telefone: '', email: '', nivelAcesso: 'Nivel 2 - Criador' },
  ]);

  // Equipe Técnica / Comissão de Apoio
  const [equipeTecnica, setEquipeTecnica] = useProcessoState<MembroEquipe[]>('equipeTecnica', []);

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
    { id: 'inicial', descricao: '', valorCentavos: 0, vagas: 0, dataInicio: '', dataFim: '' },
  ]);
  const [novoLote, setNovoLote] = useProcessoState<LoteInscricao>('loteNovo', { id: '', descricao: '', valorCentavos: 0, vagas: 0, dataInicio: '', dataFim: '' });
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
  const [submetidoSucesso, setSubmetidoSucesso] = useState(false);
  const [avisoValidacao, setAvisoValidacao] = useState('');
  const [sigiloAceito, setSigiloAceito] = useProcessoState('aceiteTermoSigilo', false);

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
  /* membro global */
  // Funções de manipulação de lotes
  const adicionarMembroEquipe = () => {
    const ultimo = equipeTecnica[equipeTecnica.length - 1];
    if (!ultimo?.nome.trim()) return;
    setEquipeTecnica((atuais) => [...atuais, { id: gerarIdLocal(), nome: '', departamento: '', telefone: '', email: '' }]);
  };
  const removerMembroEquipe = (id: string) => setEquipeTecnica((atuais) => atuais.filter((membro) => membro.id !== id));
  const atualizarMembroEquipe = (id: string, campo: keyof MembroEquipe, valor: string) => setEquipeTecnica((atuais) => atuais.map((membro) => membro.id === id ? { ...membro, [campo]: valor } : membro));

  const adicionarLote = () => {
    if (!novoLote.descricao.trim()) return;
    setLotes(prev => [...prev.map(normalizarLote), { ...normalizarLote(novoLote), id: gerarIdLocal() }]);
    setNovoLote({ id: '', descricao: '', valorCentavos: 0, vagas: 0, dataInicio: '', dataFim: '' });
  /*
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
    ]); */
  };

  const removerLote = (id: string) => {
    setLotes(prev => prev.filter(l => l.id !== id));
  };

  const atualizarLote = <Campo extends keyof LoteInscricao>(id: string, campo: Campo, valor: LoteInscricao[Campo]) => {
    setLotes(prev =>
      prev.map(l => (l.id === id ? { ...normalizarLote(l), [campo]: valor } : normalizarLote(l)))
    );
  };

  // Totais de lotes
  const lotesNormalizados = useMemo(() => lotes.map(normalizarLote), [lotes]);
  const novoLoteNormalizado = useMemo(() => normalizarLote(novoLote), [novoLote]);
  useEffect(() => {
    if (JSON.stringify(lotes) !== JSON.stringify(lotesNormalizados)) setLotes(lotesNormalizados);
  }, [lotes, lotesNormalizados, setLotes]);
  useEffect(() => {
    if (JSON.stringify(novoLote) !== JSON.stringify(novoLoteNormalizado)) setNovoLote(novoLoteNormalizado);
  }, [novoLote, novoLoteNormalizado, setNovoLote]);
  const totalVagasLotes = lotesNormalizados.reduce((acc, curr) => acc + (Number(curr.vagas) || 0), 0);
  const totalArrecadacaoPrevistaCentavos = lotesNormalizados.reduce(
    (acc, curr) => acc + curr.valorCentavos * (Number(curr.vagas) || 0),
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
    `/projetos/termo-lgpd?rota_retorno=${encodeURIComponent(location.pathname)}`,
    'CERT-LGPD-01',
    'Termo de LGPD e Confidencialidade',
    processoAtual?.processo.id
  );

  const abrirTermoLGPD = async () => {
    registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlLGPD);
    try {
      await processoAtual?.save_state();
      navigate(urlLGPD);
    } catch (falha) {
      setAvisoValidacao(falha instanceof Error
        ? `NÃ£o foi possÃ­vel salvar o rascunho antes de abrir o termo: ${falha.message}`
        : 'NÃ£o foi possÃ­vel salvar o rascunho antes de abrir o termo.');
    }
  };

  const urlOrientacoes = gerarUrlVinculada(
    `/projetos/orientacoes-coordenador?coordenador=${encodeURIComponent(coordNome || '')}&cpf=${encodeURIComponent(coordCpf || '')}`,
    'CERT-ORIENT-01',
    'Orientações ao Coordenador FEALQ'
  );

  const urlDepto = gerarUrlVinculada(
    `/projetos/ciencia-departamento?unidade=${encodeURIComponent(coordUnidade)}&depto=${encodeURIComponent(deptoNome || coordUnidade || coordDepto || '')}&coordenador=${encodeURIComponent(coordNome || '')}&cpf=${encodeURIComponent(coordCpf || '')}`,
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

  const kitSelecionado = kitsDocumentais.find((kit) => kit.formulario_id === 'PRJ-CEV-001'
    && kit.ativo
    && kit.campo_condicional === 'possuiConvenio'
    && kit.operador_condicional === 'equals'
    && kit.valor_condicional === possuiConvenio);

  const documentosKit = useMemo<DocumentoExigido[]>(() => {
    if (!kitSelecionado) return [];
    const respostasCondicionais: Record<string, string> = { inCompany, patrocinio };
    return itensKitDocumental
      .filter((item) => item.kit_id === kitSelecionado.id && item.ativo)
      .filter((item) => !('campo_condicional' in item) || !item.campo_condicional
        || (item.operador_condicional === 'equals'
          && respostasCondicionais[item.campo_condicional] === item.valor_condicional))
      .sort((a, b) => a.ordem - b.ordem)
      .map((item): DocumentoExigido => {
        const documento: DocumentoExigido = {
          id: item.identificador,
          label: item.titulo,
          descricao: item.descricao,
          tipo: item.tipo as DocumentoExigido['tipo'],
          obrigatorio: item.obrigatorio,
          permiteAnexo: 'permite_anexo' in item ? item.permite_anexo : undefined,
          permiteModelo: 'permite_modelo' in item ? item.permite_modelo : undefined,
          condicao: item.obrigatorio ? 'Obrigatório' : (item.tipo === 'upload' ? 'Anexo Opcional' : 'NÃO OBRIGATÓRIO'),
        };
        if (item.identificador === 'cadastro-coordenador') {
          return {
            ...documento,
            url_template: urlCadastroCoordenador,
            status: statusCadastroCoordenador === 'concluido' ? 'concluido' : undefined,
            onAbrirLink: () => registrarAberturaFormulario('CONV-FR-07-CADT', documento.label, urlCadastroCoordenador),
            linkTexto: statusCadastroCoordenador === 'concluido' ? 'Revisar' : 'Preencher',
          };
        }
        if (item.identificador === 'plano-aplicacao-recursos') {
          return {
            ...documento,
            descricao: isPlanoValido
              ? 'Orçamento preenchido e vinculado com sucesso ao protocolo.'
              : documento.descricao,
            url_template: urlPlanoRecursos,
            status: isPlanoValido ? 'concluido' : undefined,
            onAbrirLink: () => registrarAberturaFormulario('CONV-PL-01', documento.label, urlPlanoRecursos),
            linkTexto: isPlanoValido ? 'Revisar' : 'Preencher',
          };
        }
        if (item.identificador === 'cadastro-parceiro-link') {
          return { ...documento, url_template: `/projetos/form-parceiro?protocolo=${protocolId}` };
        }
        if (item.identificador === 'cotas-patrocinio') {
          return { ...documento, url_template: `/projetos/form-cotas?protocolo=${protocolId}` };
        }
        if (item.identificador === 'cadastro-patrocinador-link') {
          return { ...documento, url_template: `/projetos/form-patrocinador?protocolo=${protocolId}` };
        }
        return documento;
      });
  }, [inCompany, isPlanoValido, kitSelecionado, patrocinio, protocolId, registrarAberturaFormulario, statusCadastroCoordenador, urlCadastroCoordenador, urlPlanoRecursos]);

  // Cálculo de progresso de preenchimento
  let preenchidos = 0;
  let totalPontos = 6;
  if (titulo.trim()) preenchidos++;
  if (coordNome.trim() && coordCpf.trim()) preenchidos++;
  if (publicoAlvo.trim()) preenchidos++;
  if (objetoProjeto.trim()) preenchidos++;
  if (isLGPDValido) preenchidos++;
  if (sigiloAceito) preenchidos++;

  const percentualConclusao = Math.min(100, Math.round((preenchidos / totalPontos) * 100));
  const podeSubmeter =
    titulo.trim() !== '' &&
    coordNome.trim() !== '' &&
    coordCpf.trim() !== '' &&
    isLGPDValido &&
    sigiloAceito;

  const handleSubmit = () => {
    if (!podeSubmeter) {
      if (!isLGPDValido) {
        setAvisoValidacao('A confirmação de leitura e aceite formal do Termo de LGPD e Confidencialidade (FLAG OBRIGATÓRIA) é indispensável para submeter o protocolo.');
        return;
      }
      if (!sigiloAceito) {
        setAvisoValidacao('Confirme o aceite do Termo de Sigilo e Confidencialidade antes de submeter o protocolo.');
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
      codigo="PRJ-CEV-001"
      badge="Novo"
      acaoPrincipal="Submeter Protocolo de Evento"
      podeEnviar={podeSubmeter}
      aoSubmeter={handleSubmit}
      sidebar={
        <div className="flex flex-col gap-lg">
          {/* Identificação do processo */}
          <div className="bg-surface-container-low border border-primary/20 rounded-lg p-sm flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">share_location</span>
              <div className="flex min-w-0 items-baseline gap-xs">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-tight">Processo</span>
                <span className="truncate text-[13px] font-bold text-primary font-mono leading-tight">{processoAtual?.processo.protocolo ?? protocolId}</span>
              </div>
            </div>
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
      <OrientacoesProjetoSection />
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
              label="Nº do Processo USP"
              span={6}
              placeholder="Ex: 23.1.00000.11.2"
              valor={numProtocoloUSP}
              onChange={setNumProtocoloUSP}
              hint="Preencher apenas se houver convênio cadastrado na USP."
            />
          </>
        )}
      </FormSection>

      <DadosProjetoCursoEventoSection
        titulo={titulo} aoAlterarTitulo={setTitulo} edicao={edicao} aoAlterarEdicao={setEdicao}
        tipoEvento={tipoEvento} aoAlterarTipoEvento={setTipoEvento} publicoAlvo={publicoAlvo} aoAlterarPublicoAlvo={setPublicoAlvo}
        cargaHoraria={cargaHoraria} aoAlterarCargaHoraria={setCargaHoraria} dataInicio={dataInicio} aoAlterarDataInicio={setDataInicio}
        dataFim={dataFim} aoAlterarDataFim={setDataFim} horarioRealizacao={horarioRealizacao} aoAlterarHorario={setHorarioRealizacao}
        numeroVagas={numeroVagas} aoAlterarNumeroVagas={setNumeroVagas} formato={formato} aoAlterarFormato={setFormato}
        localAuditorio={localAuditorio} aoAlterarLocal={setLocalAuditorio} utilizaDoity={utilizaDoity} aoAlterarUtilizaDoity={setUtilizaDoity}
        objetoProjeto={objetoProjeto} aoAlterarObjetoProjeto={setObjetoProjeto}
      />

      {/* O bloco legado foi substituído pelos componentes compartilhados abaixo. */}
      {false && <FormSection
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
              ordem={1}
              valor={coordNome}
              onChange={setCoordNome}
            />
            <Field
              label="CPF"
              span={3}
              mascara="cpf"
              placeholder="000.000.000-00"
              obrigatorio
              ordem={2}
              valor={coordCpf}
              onChange={setCoordCpf}
            />
            {/* <Field
              label="RG / Órgão Emissor"
              span={3}
              mascara="rg"
              placeholder="00.000.000-0 SSP/SP"
              valor={coordRg}
              onChange={setCoordRg}
            /> */}
            <Field
              label="Telefone p/ Contato"
              span={3}
              tipo="tel"
              mascara="telefone"
              placeholder="(19) 3429-0000"
              ordem={3}
              valor={coordTelefone}
              onChange={setCoordTelefone}
            />
            <Field
              label="E-mail Institucional"
              span={6}
              tipo="email"
              placeholder="coordenador@usp.br"
              obrigatorio
              ordem={4}
              valor={coordEmail}
              onChange={setCoordEmail}
              hint="Preferencialmente e-mail institucional @usp.br"
            />
            <Field
              label="Unidade"
              span={6}
              tipo="select"
              opcoes={[...UNIDADES_USP_SIGLAS]}
              placeholder="Selecione a unidade"
              ordem={6}
              inicio={7}
              valor={coordUnidade}
              onChange={(valor) => { setCoordUnidade(valor); setDeptoNome(valor); }}
            />
            <Field
              label="Departamento / Instituição"
              span={6}
              placeholder="Ex: Engenharia de Biossistemas - FZEA/USP"
              ordem={5}
              inicio={1}
              valor={coordDepto}
              onChange={setCoordDepto}
            />
          </div>
        </div>

        {/* Delegados de Gestão (Sistema Conveniar / USP) */}
        {false && <div className="col-span-12 mt-sm">
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
        </div>}

        {/* Equipe Técnica / Comissão de Apoio */}
        <DelegadosEditor delegados={delegados} aoAlterar={setDelegados} />

        <div id="equipe-tecnica-legado" className="hidden">
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
              Salvar e adicionar membro
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
                {equipeTecnica.map((membro, indice) => (
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
                      {indice === equipeTecnica.length - 1 ? (
                        <button type="button" onClick={adicionarMembroEquipe} disabled={!membro.nome.trim()} className="inline-flex h-8 w-8 items-center justify-center text-primary hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-35" title="Salvar membro e adicionar outro" aria-label="Salvar membro e adicionar outro">
                          <span className="material-symbols-outlined text-[22px]">save</span>
                        </button>
                      ) : (
                        <button type="button" onClick={() => removerMembroEquipe(membro.id)} className="inline-flex h-8 w-8 items-center justify-center text-error hover:text-error/70" title="Remover membro" aria-label={`Remover ${membro.nome}`}>
                          <span className="material-symbols-outlined text-[22px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FormSection>}

      {/* 4. INSTITUIÇÕES ENVOLVIDAS (IN COMPANY & PATROCÍNIO) */}
      <CoordenadorResponsavelSection numero={3} />
      <DelegadosEditor delegados={delegados} aoAlterar={setDelegados} />
      <EquipeTecnicaEditor membros={equipeTecnica.map((membro) => ({ ...membro, vinculo: membro.departamento }))} aoAlterar={(membros) => setEquipeTecnica(membros.map((membro) => ({ ...membro, departamento: membro.vinculo })))} />

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

        {inCompany === 'sim' && <InstituicoesFinanciadorasSection />}
        {false && inCompany === 'sim' && (
          <div className="col-span-12 bg-surface-container-lowest border-2 border-primary/30 p-md rounded-lg grid grid-cols-12 gap-sm">
            <div className="col-span-12">
              <h5 className="font-bold text-[13px] text-primary flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">business</span>
                Instituições Envolvidas (Financiadoras)
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
            {/* <div className="col-span-12 mt-xs p-md bg-emerald-50 border border-emerald-300 rounded-lg">
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
            </div> */}
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
                    <tr className="bg-surface-container-lowest">
                      <td className="p-xs px-sm"><input type="text" value={novoLote.descricao} onChange={(e) => setNovoLote((atual) => ({ ...atual, descricao: e.target.value }))} placeholder="Ex: 1º Lote - Estudantes" className="w-full rounded border border-outline-variant p-1 text-[12px]" /></td>
                      <td className="p-xs px-sm"><CurrencyInput ariaLabel="Valor da inscrição do novo lote" valorCentavos={novoLoteNormalizado.valorCentavos} onChangeCentavos={(valorCentavos) => setNovoLote((atual) => ({ ...normalizarLote(atual), valorCentavos }))} /></td>
                      <td className="p-xs px-sm"><input type="number" value={novoLote.vagas || ''} onChange={(e) => setNovoLote((atual) => ({ ...atual, vagas: parseInt(e.target.value, 10) || 0 }))} placeholder="0" className="w-full rounded border border-outline-variant p-1 text-[12px]" /></td>
                      <td className="p-xs px-sm"><input type="date" value={novoLote.dataInicio} onChange={(e) => setNovoLote((atual) => ({ ...atual, dataInicio: e.target.value }))} className="w-full rounded border border-outline-variant p-1 text-[11px]" /></td>
                      <td className="p-xs px-sm"><input type="date" value={novoLote.dataFim} onChange={(e) => setNovoLote((atual) => ({ ...atual, dataFim: e.target.value }))} className="w-full rounded border border-outline-variant p-1 text-[11px]" /></td>
                      <td className="p-xs px-sm text-center"><button type="button" onClick={adicionarLote} disabled={!novoLote.descricao.trim()} className="inline-flex h-8 w-8 items-center justify-center text-primary disabled:cursor-not-allowed disabled:opacity-35" title="Salvar lote e adicionar outro" aria-label="Salvar lote e adicionar outro"><span className="material-symbols-outlined text-[22px]">save</span></button></td>
                    </tr>
                    {lotesNormalizados.map((lote) => (
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
                          <CurrencyInput ariaLabel={`Valor da inscrição do lote ${lote.descricao || lote.id}`} valorCentavos={lote.valorCentavos} onChangeCentavos={(valorCentavos) => atualizarLote(lote.id, 'valorCentavos', valorCentavos)} />
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
                        Arrecadação: {formatarCentavosComoMoeda(totalArrecadacaoPrevistaCentavos)}
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
      {false && <FormSection
        numero={6}
        icone="account_balance"
        titulo="Ciência e Concordância do Departamento (USP)"
      >
        <div className="col-span-12 p-sm bg-neutral-100 rounded text-neutral-800 text-[11px] font-medium">
          INCLUÍDO EM TODOS OS PROJETOS DE CURSOS E EVENTOS COM DOCENTES USP
        </div>

        <Field
          label="Departamento / Unidade"
          span={12}
          tipo="select"
          opcoes={[...UNIDADES_USP_SIGLAS]}
          placeholder="Selecione a unidade"
          obrigatorio
          valor={coordUnidade}
          onChange={(valor) => { setCoordUnidade(valor); setDeptoNome(valor); }}
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
      </FormSection>}
      <CienciaConcordanciaSection numero={6} />

      {/* 7. TERMOS, LGPD E DECLARAÇÕES FINAIS */}
      <TermosLGPDSection aceito={isLGPDValido} urlTermo={urlLGPD} aoAbrirTermo={() => { void abrirTermoLGPD(); }} sigiloAceito={sigiloAceito} aoAceitarSigilo={() => setSigiloAceito(true)} />
      <div className="hidden">
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
                <Link to={urlLGPD} onClick={() => { void processoAtual?.save_state(); registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlLGPD); }} className="text-[13px] font-bold text-primary underline hover:text-primary-dark">
                  Declaro ter lido e aceito integralmente o Termo de LGPD e Confidencialidade *
                </Link>
              </label>

            </div>
          </div>

          {/* Card de Aceite das Orientações ao Coordenador */}
          <div className="p-md rounded-lg border border-outline-variant bg-surface-container-low flex flex-col gap-sm">
            <div className="flex items-center gap-xs text-on-surface font-bold text-[14px]">
              <span className="material-symbols-outlined text-[20px] text-secondary">menu_book</span>
              <div className="ml-auto flex items-center gap-sm text-[12px] font-medium">
                <Link to={urlOrientacoes} onClick={() => { void processoAtual?.save_state(); registrarAberturaFormulario('CERT-ORIENT-01', 'Orientações ao Coordenador FEALQ', urlOrientacoes); }} className="flex items-center gap-0.5 text-primary hover:underline">
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  Página Exclusiva
                </Link>
              </div>
              Orientações ao Coordenador FEALQ
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Orientações sobre prazos para prestação de contas, regras de ressarcimento, contratação de fornecedores e relatórios técnicos exigidos pela Fundação e pela Universidade de São Paulo.
            </p>

            <label className="flex items-center gap-sm cursor-pointer pt-xs border-t border-outline-variant/60">
              <input
                type="checkbox"
                checked={isOrientacoesValido}
                onChange={() => {
                  if (!isOrientacoesValido) {
                    void processoAtual?.save_state();
                    registrarAberturaFormulario('CERT-ORIENT-01', 'Orientações ao Coordenador FEALQ', urlOrientacoes);
                  }
                }}
                className="w-5 h-5 rounded text-primary accent-primary cursor-pointer"
              />
              <Link to={urlOrientacoes} onClick={() => { void processoAtual?.save_state(); registrarAberturaFormulario('CERT-ORIENT-01', 'Orientações ao Coordenador FEALQ', urlOrientacoes); }} className="text-[13px] font-bold text-primary underline hover:text-primary-dark">
                Declaro estar ciente e de acordo com as Orientações ao Coordenador da FEALQ *
              </Link>
            </label>
          </div>
        </div>
      </FormSection>

      </div>

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

    </FormPageLayout>
  );
};
