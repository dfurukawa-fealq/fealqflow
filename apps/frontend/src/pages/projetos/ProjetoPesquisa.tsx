import { useProcesso, useProcessoState } from '../../contexts/ProcessoContext';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import kitsDocumentais from '../../../../../data/kits_documentais.json';
import itensKitDocumental from '../../../../../data/itens_kit_documental.json';
import { ConvenioUSPSection } from '../../components/form/projetos/ConvenioUSPSection';
import { EquipeTecnicaEditor, MembroEquipeProjeto } from '../../components/form/projetos/EquipeTecnicaEditor';
import { EquipeProjetoSection } from '../../components/form/projetos/EquipeProjetoSection';
import { PropriedadeIntelectualSection } from '../../components/form/projetos/PropriedadeIntelectualSection';
import { CertRegimeTrabalhoSection } from '../../components/form/projetos/CertRegimeTrabalhoSection';
import { TermosLGPDSection } from '../../components/form/projetos/TermosLGPDSection';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { CronogramaExecucaoSection } from '../../components/form/projetos/CronogramaExecucaoSection';
import { CoordenadorResponsavelSection } from '../../components/form/projetos/CoordenadorResponsavelSection';
import { DelegadosEditor, DelegadoEditorItem } from '../../components/form/projetos/DelegadosEditor';
import { CienciaConcordanciaSection } from '../../components/form/projetos/CienciaConcordanciaSection';
import { OrientacoesProjetoSection } from '../../components/form/projetos/OrientacoesProjetoSection';
import { TermoAnuenciaProjetoSection } from '../../components/form/projetos/TermoAnuenciaProjetoSection';
import { CronogramaDesembolsoSection } from '../../components/form/projetos/CronogramaDesembolsoSection';
import { InstituicoesFinanciadorasSection } from '../../components/form/projetos/InstituicoesFinanciadorasSection';

export const ProjetoPesquisa = () => {
  const location = useLocation();
  const processo = useProcesso();
  const { gerarUrlVinculada, registrarAberturaFormulario, statusFormulario } = useRastreabilidade();
  const rotaRetorno = encodeURIComponent(location.pathname);
  const lerCampo = (...nomes: string[]) => {
    const campos = processo?.dados.campos || {};
    const chave = Object.keys(campos).find((item) => nomes.some((nome) => item === nome || item.startsWith(`campo:${nome}:`)));
    const valor = chave ? campos[chave] : '';
    return typeof valor === 'string' ? valor.trim() : '';
  };
  const dadosParaSubformularios = new URLSearchParams({
    coordenador: lerCampo('Nome Completo do Coordenador'),
    cpf: lerCampo('CPF'),
    rg: lerCampo('RG / Órgão Emissor'),
    departamento: lerCampo('Departamento / Instituição', 'Departamento / Unidade USP'),
    email: lerCampo('E-mail Institucional'),
    projeto: lerCampo('Título do Projeto', 'Título do Projeto / Curso / Evento'),
  }).toString();
  const urlTermoLGPD = gerarUrlVinculada(`/projetos/termo-lgpd?retorno=pesquisa&rota_retorno=${rotaRetorno}&${dadosParaSubformularios}`, 'CERT-LGPD-01', 'Termo de LGPD e Confidencialidade');
  const urlOrientacoes = gerarUrlVinculada(`/projetos/orientacoes-coordenador?retorno=pesquisa&rota_retorno=${rotaRetorno}&${dadosParaSubformularios}`, 'CERT-ORIENT-01', 'Orientações ao Coordenador FEALQ');
  const urlPlanoRecursos = gerarUrlVinculada(`/projetos/form-plano-recursos?retorno=pesquisa&rota_retorno=${rotaRetorno}`, 'CONV-PL-01', 'Plano de AplicaÃ§Ã£o de Recursos');
  const statusLGPD = statusFormulario('CERT-LGPD-01');
  const statusOrientacoes = statusFormulario('CERT-ORIENT-01');
  const statusPlanoRecursos = statusFormulario('CONV-PL-01');
  const statusCadastroCoordenador = statusFormulario('CONV-FR-07-CADT');
  const urlCadastroCoordenador = gerarUrlVinculada(`/projetos/form-coordenador?rota_retorno=${rotaRetorno}`, 'CONV-FR-07-CADT', 'Cadastro de Coordenador');
  const [possuiConvenio, setPossuiConvenio] = useProcessoState('possuiConvenio', false);
  const [numeroConvenio, setNumeroConvenio] = useProcessoState('numeroConvenio', '');
  const [numeroProcesso, setNumeroProcesso] = useProcessoState('numeroProcesso', '');
  const [equipe, setEquipe] = useProcessoState<MembroEquipeProjeto[]>('equipe', []);
  const [delegados, setDelegados] = useProcessoState<DelegadoEditorItem[]>('delegados', []);
  const [envolvePropriedade, setEnvolvePropriedade] = useProcessoState('envolvePropriedade', true);
  const [percentualUSP, setPercentualUSP] = useProcessoState('percentualUSP', '50');
  const [percentualParceiro, setPercentualParceiro] = useProcessoState('percentualParceiro', '50');
  const [regimeTrabalho, setRegimeTrabalho] = useProcessoState<'RTP' | 'RTC' | 'RDIDP'>('regimeTrabalho', 'RTP');
  const [numeroCert, setNumeroCert] = useProcessoState('numeroCert', '');
  const [validadeCert, setValidadeCert] = useProcessoState('validadeCert', '');
  const [sigiloAceito, setSigiloAceito] = useProcessoState('aceiteTermoSigilo', false);
  const [anuenciaAceita] = useProcessoState('aceiteTermoAnuenciaProjeto', false);
  const kitSelecionado = kitsDocumentais.find((kit) => kit.formulario_id === 'projeto-pesquisa'
    && kit.ativo
    && kit.campo_condicional === 'possuiConvenio'
    && kit.operador_condicional === 'equals'
    && kit.valor_condicional === String(possuiConvenio));
  const documentos = useMemo<DocumentoExigido[]>(() => {
    if (!kitSelecionado) return [];
    return itensKitDocumental
      .filter((item) => item.kit_id === kitSelecionado.id && item.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => ({
        id: item.identificador,
        label: item.titulo,
        descricao: item.descricao,
        tipo: item.tipo,
        obrigatorio: item.obrigatorio,
        url_template: 'url_template' in item ? item.url_template : undefined,
      }));
  }, [kitSelecionado]);

  const documentosKit = useMemo<DocumentoExigido[]>(() => documentos.map((documento) => {
    if (documento.id === 'plano-aplicacao-recursos') {
      return {
        ...documento,
        status: undefined,
        onAbrirLink: async () => {
          await processo?.save_state();
          registrarAberturaFormulario('CONV-PL-01', 'Plano de Aplicação de Recursos', urlPlanoRecursos);
        },
        linkTexto: statusPlanoRecursos === 'concluido' ? 'Revisar' : 'Preencher',
      };
    }
    if (documento.id === 'cadastro-coordenador') {
      return {
        ...documento,
        condicao: 'NÃO OBRIGATÓRIO',
        url_template: urlCadastroCoordenador,
        status: statusCadastroCoordenador === 'concluido' ? 'concluido' : undefined,
        onAbrirLink: async () => {
          await processo?.save_state();
          registrarAberturaFormulario('CONV-FR-07-CADT', documento.label, urlCadastroCoordenador);
        },
        linkTexto: statusCadastroCoordenador === 'concluido' ? 'Revisar' : 'Preencher',
      };
    }
    if (documento.id === 'termo-sigilo-projeto') {
      return { ...documento, status: sigiloAceito ? 'concluido' : 'pendente' };
    }
    if (documento.id === 'termo-anuencia-projeto') {
      return { ...documento, status: anuenciaAceita ? 'concluido' : 'pendente' };
    }
    return documento;
  }), [anuenciaAceita, documentos, processo, registrarAberturaFormulario, sigiloAceito, statusCadastroCoordenador, statusPlanoRecursos, urlCadastroCoordenador, urlPlanoRecursos]);

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Projetos', 'Processo de Pesquisa']}
      titulo="Processo de Abertura de Projeto de Pesquisa"
      codigo="CONV-FR-03-PRO"
      acaoPrincipal="Submeter Projeto para FEALQ"
      sidebar={<KitDocumental acaoNoCard documentos={documentosKit} />}
    >
      <OrientacoesProjetoSection />
      <ConvenioUSPSection possuiConvenio={possuiConvenio} aoAlterar={setPossuiConvenio} numeroConvenio={numeroConvenio} numeroProtocolo={numeroProcesso} aoAlterarNumeroConvenio={setNumeroConvenio} aoAlterarNumeroProtocolo={setNumeroProcesso} />
      {possuiConvenio && (
        <CertRegimeTrabalhoSection regime={regimeTrabalho} numeroCert={numeroCert} validadeCert={validadeCert} aoAlterarRegime={setRegimeTrabalho} aoAlterarNumeroCert={setNumeroCert} aoAlterarValidadeCert={setValidadeCert} />
      )}
      {possuiConvenio && (
        <PropriedadeIntelectualSection envolvePropriedade={envolvePropriedade} aoAlterarEnvolvimento={setEnvolvePropriedade} percentualUSP={percentualUSP} percentualParceiro={percentualParceiro} aoAlterarPercentualUSP={setPercentualUSP} aoAlterarPercentualParceiro={setPercentualParceiro} />
      )}

      <FormSection numero={2} icone="science" titulo="Dados do Projeto & Detalhamento Técnico">
        <Field label="Título do Projeto" span={8} placeholder="Informe o título completo do projeto" obrigatorio />
        <Field label="Prazo de Execução (meses)" span={4} tipo="number" placeholder="Ex.: 24" />
        <Field label="Objeto do Projeto" tipo="textarea" placeholder="Descreva o objetivo principal da pesquisa" obrigatorio />
        <Field label="Objetivo Geral" tipo="textarea" placeholder="Descreva o problema, a metodologia e as etapas da pesquisa" obrigatorio />
        <Field label="Justificativa" tipo="textarea" placeholder="Descreva a justificativa da pesquisa" obrigatorio />
        <Field label="Resultados Esperados" tipo="textarea" placeholder="Descreva os resultados esperados" />
      </FormSection>

      <CoordenadorResponsavelSection numero={4} />
      <DelegadosEditor delegados={delegados} aoAlterar={setDelegados} />
      <EquipeTecnicaEditor numero={4} membros={equipe} aoAlterar={setEquipe} />
      <CronogramaExecucaoSection />

      <FormSection numero={6} icone="account_balance" titulo="Instituições Envolvidas (Financiadoras)">
        <InstituicoesFinanciadorasSection />
      </FormSection>

      <CronogramaDesembolsoSection />

      <CienciaConcordanciaSection numero={8} />
      <TermoAnuenciaProjetoSection />
      <TermosLGPDSection aceito={statusFormulario('CERT-LGPD-01') === 'concluido'} urlTermo={urlTermoLGPD} aoAbrirTermo={() => registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlTermoLGPD)} sigiloAceito={sigiloAceito} aoAceitarSigilo={() => setSigiloAceito(true)} />
    </FormPageLayout>
  );
};
