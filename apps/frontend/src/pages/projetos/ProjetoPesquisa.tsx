import { useMemo, useState } from 'react';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';

export const ProjetoPesquisa = () => {
  const [possuiConvenio, setPossuiConvenio] = useState<'sim' | 'nao'>('nao');
  const documentos = useMemo<DocumentoExigido[]>(() => [
    { id: 'processo-pesquisa', label: 'Processo de Abertura de Projeto de Pesquisa', descricao: 'Gerado pelo sistema.', tipo: 'gerado', obrigatorio: true },
    { id: 'termo-sigilo', label: 'Termo de Sigilo e Confidencialidade', descricao: 'Autopreenchido e aceite obrigatório.', tipo: 'aceite', obrigatorio: true },
    { id: 'termo-anuencia', label: 'Termo de Anuência para Execução do Projeto', descricao: 'Autopreenchido e aceite obrigatório.', tipo: 'aceite', obrigatorio: true },
    { id: 'cadastro-coordenador', label: 'Cadastro do Coordenador', descricao: 'Necessário caso não exista cadastro na FEALQ.', tipo: 'externo', obrigatorio: false },
    { id: 'equipe-envolvida', label: 'Cadastro de Equipe Envolvida', descricao: 'Pesquisadores, alunos e apoio administrativo.', tipo: 'externo', obrigatorio: false },
    { id: 'cadastro-parceiro', label: 'Cadastro de Parceiro / Financiador', descricao: 'Pode ser preenchido por link externo.', tipo: 'externo', obrigatorio: false },
    ...(possuiConvenio === 'sim'
      ? [{ id: 'planilha-recursos-usp', label: 'Planilha de Aplicação de Recursos USP', descricao: 'Anexo obrigatório para projeto com convênio USP.', tipo: 'upload' as const, obrigatorio: true }]
      : [{ id: 'plano-aplicacao-recursos', label: 'Plano de Aplicação de Recursos', descricao: 'Preenchimento obrigatório para projeto sem convênio USP.', tipo: 'gerado' as const, obrigatorio: true }]),
    { id: 'informacoes-complementares', label: 'Informações Complementares', descricao: 'Anexo opcional.', tipo: 'upload', obrigatorio: false },
  ], [possuiConvenio]);

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Projetos', 'Processo de Pesquisa']}
      titulo="Protocolo de Abertura de Projeto de Pesquisa"
      codigo="CONV-FR-03-PRO"
      acaoPrincipal="Submeter Projeto para FEALQ"
      sidebar={<KitDocumental acaoNoCard documentos={documentos} />}
    >
      <FormSection numero={1} icone="description" titulo="Informações sobre o Projeto & Convênio USP">
        <Field label="Possui Convênio Cadastrado na USP?" tipo="select" opcoes={['Sim', 'Não']} padrao="Não" onChange={(valor: string) => setPossuiConvenio(valor === 'Sim' ? 'sim' : 'nao')} hint="Essa definição adapta automaticamente os anexos exigidos no Kit Documental." />
        {possuiConvenio === 'sim' && <>
          <Field label="Nº do Convênio USP" span={6} placeholder="Informe o número do convênio" />
          <Field label="Nº do Processo USP" span={6} placeholder="Informe o processo relacionado" />
        </>}
        <Field label="Nº da CERT" span={6} placeholder="Informe quando aplicável" />
        <Field label="Propriedade Intelectual" span={6} placeholder="Informe quando aplicável" />
      </FormSection>

      <FormSection numero={2} icone="science" titulo="Dados do Projeto & Detalhamento Técnico">
        <Field label="Título do Projeto" span={8} placeholder="Informe o título completo do projeto" obrigatorio />
        <Field label="Prazo de Execução (meses)" span={4} tipo="number" placeholder="Ex.: 24" />
        <Field label="Objetivo do Projeto" tipo="textarea" placeholder="Descreva o objetivo principal da pesquisa" obrigatorio />
        <Field label="Detalhamento Técnico / Metodologia" tipo="textarea" placeholder="Descreva o problema, a metodologia e as etapas da pesquisa" obrigatorio />
        <Field label="Resultados Esperados" tipo="textarea" placeholder="Descreva os resultados esperados" />
        <Field label="Cronograma de Execução" tipo="textarea" placeholder="Informe as principais etapas e respectivos períodos" />
      </FormSection>

      <FormSection numero={3} icone="supervisor_account" titulo="Equipe do Projeto & Delegados de Gestão">
        <Field label="Nome Completo do Coordenador" span={8} placeholder="Nome completo" obrigatorio />
        <Field label="CPF" span={4} placeholder="000.000.000-00" />
        <Field label="RG / Órgão Emissor" span={4} placeholder="RG e órgão" />
        <Field label="Telefone para Contato" span={4} tipo="tel" placeholder="(00) 00000-0000" />
        <Field label="E-mail Institucional" span={4} tipo="email" placeholder="coordenador@usp.br" obrigatorio />
        <Field label="Departamento / Instituição" span={8} placeholder="Departamento e unidade USP" />
        <Field label="Nível de Acesso no Conveniar" span={4} tipo="select" opcoes={['Nível 1 - Ordenador de despesa', 'Nível 2 - Criador de pedidos']} padrao="Nível 1 - Ordenador de despesa" />
        <Field label="Equipe Técnica / Pesquisadores / Alunos" tipo="textarea" placeholder="Informe nome, função, instituição, e-mail e telefone dos participantes" />
        <Field label="Delegados de Gestão" tipo="textarea" placeholder="Informe os responsáveis autorizados e o nível de acesso de cada um" />
      </FormSection>

      <FormSection numero={4} icone="account_balance" titulo="Instituições Envolvidas (Parcerias & Financiamento)">
        <Field label="Nome da Instituição / Empresa Parceira" span={6} placeholder="Nome da instituição" />
        <Field label="Ponto de Contato (Nome / Área)" span={6} placeholder="Responsável pelo contato" />
        <Field label="E-mail de Contato" span={6} tipo="email" placeholder="contato@instituicao.br" />
        <Field label="Papel no Projeto" span={6} placeholder="Parceira, financiadora, executora..." />
        <Field label="Valor Total Previsto (R$)" span={6} prefixo="R$" placeholder="0,00" />
        <Field label="Origem dos Recursos" span={6} tipo="select" opcoes={['Privado Nacional', 'Privado Internacional', 'Público', 'USP']} placeholder="Selecione..." />
        <Field label="Instituições ou Parceiros Adicionais" tipo="textarea" placeholder="Informe outros envolvidos. Pode haver mais de uma instituição." />
        <Field label="Preenchimento pelo Financiador" tipo="checkbox" placeholder="Enviar link para o financiador preencher seus dados" />
      </FormSection>

      <FormSection numero={5} icone="payments" titulo="Execução do Projeto (Recursos & Desembolso)">
        <Field label="Plano de Aplicação / Desembolso" tipo="textarea" placeholder={possuiConvenio === 'sim' ? 'Consulte a Planilha de Aplicação de Recursos USP anexada.' : 'Descreva a aplicação dos recursos e o desembolso previsto.'} obrigatorio />
        <Field label="Informações Adicionais" tipo="textarea" placeholder="Inclua informações complementares sobre a execução" />
        <div className="col-span-12 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-on-surface-variant">
          {possuiConvenio === 'sim' ? 'Com convênio USP: a Planilha de Aplicação de Recursos USP é obrigatória.' : 'Sem convênio USP: o Plano de Aplicação de Recursos é obrigatório.'}
        </div>
      </FormSection>

      <FormSection numero={6} icone="fact_check" titulo="Ciência e Concordância do Departamento (USP)">
        <Field label="Departamento / Unidade" span={6} placeholder="Informe o departamento ou unidade" />
        <Field label="Situação da Aprovação" span={6} tipo="select" opcoes={['Pendente', 'Aprovada', 'Dispensada']} padrao="Pendente" />
        <Field label="Observações da Chefia" tipo="textarea" placeholder="Registre informações complementares da aprovação" />
        <Field label="Ciência da Chefia de Departamento" tipo="checkbox" placeholder="Declaro ciência e concordância com a execução do projeto" />
      </FormSection>

      <FormSection numero={7} icone="verified_user" titulo="Termos de LGPD, Sigilo, Anuência & Orientações">
        <Field label="Termo de Sigilo e Confidencialidade" span={6} tipo="checkbox" placeholder="Li e aceito o termo" obrigatorio />
        <Field label="Termo de Anuência para Execução" span={6} tipo="checkbox" placeholder="Li e aceito o termo" obrigatorio />
        <Field label="Orientações ao Coordenador" tipo="checkbox" placeholder="Li as orientações e estou ciente das regras do processo" obrigatorio />
        <Field label="Aceite LGPD" tipo="checkbox" placeholder="Li e aceito as condições de tratamento de dados pessoais" obrigatorio />
      </FormSection>
    </FormPageLayout>
  );
};
