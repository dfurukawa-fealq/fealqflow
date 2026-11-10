import { useProcesso, useProcessoState } from '../../contexts/ProcessoContext';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import { ConvenioUSPSection } from '../../components/form/projetos/ConvenioUSPSection';
import { EquipeTecnicaEditor, MembroEquipeProjeto } from '../../components/form/projetos/EquipeTecnicaEditor';
import { EquipeProjetoSection } from '../../components/form/projetos/EquipeProjetoSection';
import { PropriedadeIntelectualSection } from '../../components/form/projetos/PropriedadeIntelectualSection';
import { CertRegimeTrabalhoSection } from '../../components/form/projetos/CertRegimeTrabalhoSection';
import { TermosLGPDSection } from '../../components/form/projetos/TermosLGPDSection';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { useAdmin } from '../../contexts/AdminContext';
import { CronogramaExecucaoSection } from '../../components/form/projetos/CronogramaExecucaoSection';
import { CoordenadorResponsavelSection } from '../../components/form/projetos/CoordenadorResponsavelSection';
import { DelegadosEditor, DelegadoEditorItem } from '../../components/form/projetos/DelegadosEditor';
import { CienciaConcordanciaSection } from '../../components/form/projetos/CienciaConcordanciaSection';
import { OrientacoesProjetoSection } from '../../components/form/projetos/OrientacoesProjetoSection';
import { TermoAnuenciaProjetoSection } from '../../components/form/projetos/TermoAnuenciaProjetoSection';
import { CronogramaDesembolsoSection } from '../../components/form/projetos/CronogramaDesembolsoSection';

export const ProjetoPesquisa = () => {
  const location = useLocation();
  const processo = useProcesso();
  const { gerarUrlVinculada, registrarAberturaFormulario, statusFormulario } = useRastreabilidade();
  const { formularios } = useAdmin();
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
  const documentos = useMemo<DocumentoExigido[]>(() => [
    { id: 'processo-pesquisa', label: 'Processo de Abertura de Projeto de Pesquisa', descricao: 'Gerado pelo sistema.', tipo: 'gerado', obrigatorio: true },
    // { id: 'termo-sigilo', label: 'Termo de Sigilo e Confidencialidade', descricao: 'Autopreenchido e aceite obrigatório.', tipo: 'aceite', obrigatorio: true },
    // { id: 'termo-anuencia', label: 'Termo de Anuência para Execução do Projeto', descricao: 'Autopreenchido e aceite obrigatório.', tipo: 'aceite', obrigatorio: true },
    // { id: 'cadastro-coordenador', label: 'Cadastro do Coordenador', descricao: 'Necessário caso não exista cadastro na FEALQ.', tipo: 'externo', obrigatorio: false },
    // { id: 'equipe-envolvida', label: 'Cadastro de Equipe Envolvida', descricao: 'Pesquisadores, alunos e apoio administrativo.', tipo: 'externo', obrigatorio: false },
    // { id: 'cadastro-parceiro', label: 'Cadastro de Parceiro / Financiador', descricao: 'Pode ser preenchido por link externo.', tipo: 'externo', obrigatorio: false },
      ...(possuiConvenio
      ? [{ id: 'planilha-recursos-usp', label: 'Planilha de Aplicação de Recursos USP', descricao: 'Anexo obrigatório para projeto com convênio USP.', tipo: 'upload' as const, obrigatorio: true }]
      : [{ id: 'plano-aplicacao-recursos', label: 'Plano de Aplicação dos Recursos', descricao: 'Anexe o plano de aplicação dos recursos do projeto.', tipo: 'upload' as const, obrigatorio: true, url_template: 'https://docs.google.com/document/d/16Bofe2pVGsMDUi73H-dbRMphl2U12VEQrD5PvaSZGwc/export?format=pdf' }]),
    // { id: 'informacoes-complementares', label: 'Informações Complementares', descricao: 'Anexo opcional.', tipo: 'upload', obrigatorio: false },
  ], [possuiConvenio]);

  const documentosKit = useMemo<DocumentoExigido[]>(() => {
    const buscarDocumento = (nome: string) => formularios.find((formulario) => formulario.tipo === 'Documento'
      && formulario.area === 'Projetos'
      && formulario.active !== false
      && formulario.habilitado !== false
      && formulario.nome.trim().toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'));
    const cadastroLGPD = buscarDocumento('Termo de LGPD e Confidencialidade (FR 01 - PRO)');
    const cadastroSigilo = buscarDocumento('Termo de Sigilo e Confidencialidade');
    const cadastroOrientacoes = buscarDocumento('Orientações ao Coordenador FEALQ (15 Regras)');
    // `info` guarda o conteúdo principal do documento, não o resumo exibido no Kit.
    const detalhes = (_cadastro: typeof cadastroLGPD, fallback: string) => fallback;

    const documentosBase = documentos.map((documento) => {
      if (documento.id === 'termo-sigilo') {
        return {
          ...documento,
          label: cadastroSigilo?.nome || documento.label,
          descricao: detalhes(cadastroSigilo, documento.descricao || ''),
          url_template: cadastroSigilo?.documentosSolicitados[0]?.url_template,
        };
      }
      if (documento.id === 'plano-aplicacao-recursos') {
        return {
          ...documento,
          url_template: documento.url_template,
          status: undefined,
          onAbrirLink: async () => {
            await processo?.save_state();
            registrarAberturaFormulario('CONV-PL-01', 'Plano de AplicaÃ§Ã£o de Recursos', urlPlanoRecursos);
          },
          linkTexto: statusPlanoRecursos === 'concluido' ? 'Revisar' : 'Preencher',
        };
      }
      return documento;
    });

    return [
      ...documentosBase,
      {
        id: 'cadastro-coordenador',
        label: 'Cadastro de Coordenador (Sem Certidões)',
        descricao: 'Caso não possua cadastro prévio na FEALQ.',
        tipo: 'gerado',
        obrigatorio: false,
        condicao: 'NÃO OBRIGATÓRIO',
        url_template: urlCadastroCoordenador,
        status: statusCadastroCoordenador === 'concluido' ? 'concluido' : undefined,
        onAbrirLink: async () => {
          await processo?.save_state();
          registrarAberturaFormulario('CONV-FR-07-CADT', 'Cadastro de Coordenador', urlCadastroCoordenador);
        },
        linkTexto: statusCadastroCoordenador === 'concluido' ? 'Revisar' : 'Preencher',
      },
      {
        id: 'termo-lgpd',
        label: cadastroLGPD?.nome || 'Termo de LGPD e Confidencialidade',
        // descricao: detalhes(cadastroLGPD, 'Autopreenchido e aceite obrigatório.'),
        descricao: ('Autopreenchido e aceite obrigatório.'),
        tipo: 'gerado',
        obrigatorio: true,
        url_template: urlTermoLGPD,
        status: statusLGPD,
        onAbrirLink: async () => {
          await processo?.save_state();
          registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlTermoLGPD);
        },
        linkTexto: statusLGPD === 'concluido' ? 'Revisar' : 'Ler e Assinar',
      },
      {
        id: 'orientacoes-coordenador',
        label: cadastroOrientacoes?.nome || 'Orientações ao Coordenador FEALQ (15 Regras)',
        // descricao: detalhes(cadastroOrientacoes, 'Leitura e ciência obrigatórias.'),
        descricao: ('Leitura e ciência obrigatórias.'),
        tipo: 'gerado',
        obrigatorio: true,
        url_template: urlOrientacoes,
        status: statusOrientacoes,
        onAbrirLink: async () => {
          await processo?.save_state();
          registrarAberturaFormulario('CERT-ORIENT-01', 'Orientações ao Coordenador FEALQ', urlOrientacoes);
        },
        linkTexto: statusOrientacoes === 'concluido' ? 'Revisar' : 'Ler',
      },
      {
        id: 'termo-sigilo-projeto',
        label: 'Termo de Sigilo e Confidencialidade',
        descricao: 'Aceite específico do compromisso de sigilo do projeto.',
        tipo: 'gerado',
        obrigatorio: true,
        status: sigiloAceito ? 'concluido' : 'pendente',
      },
      {
        id: 'termo-anuencia-projeto',
        label: 'Termo de Anuência para Execução do Projeto',
        descricao: 'Aceite específico para projetos de pesquisa.',
        tipo: 'gerado',
        obrigatorio: true,
        status: anuenciaAceita ? 'concluido' : 'pendente',
      },
    ].filter((documento) => !['termo-lgpd', 'orientacoes-coordenador'].includes(documento.id)) as DocumentoExigido[];
  }, [anuenciaAceita, documentos, formularios, processo, registrarAberturaFormulario, sigiloAceito, statusCadastroCoordenador, statusLGPD, statusOrientacoes, statusPlanoRecursos, urlCadastroCoordenador, urlOrientacoes, urlPlanoRecursos, urlTermoLGPD]);

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
        <Field label="Justificativa" tipo="textarea" placeholder="Descreva o problema, a metodologia e as etapas da pesquisa" obrigatorio />
        <Field label="Resultados Esperados" tipo="textarea" placeholder="Descreva os resultados esperados" />
      </FormSection>

      <CoordenadorResponsavelSection numero={4} />
      <DelegadosEditor delegados={delegados} aoAlterar={setDelegados} />
      <EquipeTecnicaEditor numero={4} membros={equipe} aoAlterar={setEquipe} />
      <CronogramaExecucaoSection />

      <FormSection numero={6} icone="account_balance" titulo="Instituições Envolvidas (Financiadoras)">
        <Field label="Nome da Instituição / Empresa Parceira" span={6} placeholder="Nome da instituição" />
        <Field label="Ponto de Contato (Nome / Área)" span={6} placeholder="Responsável pelo contato" />
        <Field label="E-mail de Contato" span={6} tipo="email" placeholder="contato@instituicao.br" />
        <Field label="Papel no Projeto" span={6} placeholder="Parceira, financiadora, executora..." />
        <Field label="Valor Total Previsto (R$)" span={6} prefixo="R$" placeholder="0,00" />
        <Field label="Origem dos Recursos" span={6} tipo="select" opcoes={['Privado Nacional', 'Privado Internacional', 'Público', 'USP']} placeholder="Selecione..." />
        <Field label="Instituições ou Parceiros Adicionais" tipo="textarea" placeholder="Informe outros envolvidos. Pode haver mais de uma instituição." />
        <Field label="Preenchimento pelo Financiador" tipo="checkbox" placeholder="Enviar link para o financiador preencher seus dados" />
      </FormSection>

      <CronogramaDesembolsoSection />

      <CienciaConcordanciaSection numero={8} />
      <TermoAnuenciaProjetoSection />
      <TermosLGPDSection aceito={statusFormulario('CERT-LGPD-01') === 'concluido'} urlTermo={urlTermoLGPD} aoAbrirTermo={() => registrarAberturaFormulario('CERT-LGPD-01', 'Termo de LGPD e Confidencialidade', urlTermoLGPD)} sigiloAceito={sigiloAceito} aoAceitarSigilo={() => setSigiloAceito(true)} />
    </FormPageLayout>
  );
};
