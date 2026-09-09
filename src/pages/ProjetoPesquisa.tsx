import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online',
    descricao: 'Este formulário, gerado pelo sistema.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'plano-trabalho',
    label: 'Plano de Trabalho (FR16-PRO)',
    descricao: 'PDF assinado.',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'proposta-tecnica',
    label: 'Proposta Técnica Consolidada',
    descricao: 'PDF.',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export const ProjetoPesquisa = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Projeto de Pesquisa']}
    titulo="Projeto de Pesquisa"
    codigo="CONV-FR-03-PRO"
    acaoPrincipal="Submeter Projeto para FEALQ"
    sidebar={<KitDocumental documentos={DOCUMENTOS} />}
  >
    <FormSection numero={1} icone="science" titulo="Dados do Projeto">
      <Field
        label="Título do Projeto"
        placeholder="Insira o título completo do projeto"
      />
      <Field
        label="Objeto"
        tipo="textarea"
        placeholder="Descreva o objeto resumidamente"
      />
      <Field
        label="Objetivo"
        tipo="textarea"
        placeholder="Qual o objetivo principal?"
      />
      <Field
        label="Justificativa"
        tipo="textarea"
        placeholder="Justifique a necessidade do projeto"
      />
      <Field
        label="Palavras-chave"
        span={8}
        placeholder="Ex: biotecnologia, genômica, sustentabilidade"
      />
      <Field
        label="Vigência (Meses)"
        span={4}
        tipo="number"
        placeholder="Ex: 24"
      />
    </FormSection>

    <FormSection numero={2} icone="supervisor_account" titulo="Coordenação">
      <Field
        label="Coordenador (Docente USP)"
        span={8}
        placeholder="Nome completo do coordenador"
      />
      <Field label="CPF" span={4} placeholder="000.000.000-00" />
      <Field label="E-mail" span={6} tipo="email" placeholder="email@usp.br" />
      <Field
        label="Telefone / Ramal"
        span={6}
        tipo="tel"
        placeholder="(00) 0000-0000"
      />
      <Field
        label="Departamento / Unidade"
        span={8}
        placeholder="Ex: Departamento de Genética - ESALQ"
      />
      <Field
        label="Regime"
        span={4}
        tipo="checkbox"
        placeholder="Regime CERT"
      />
    </FormSection>

    <FormSection
      numero={3}
      icone="handshake"
      titulo="Instituição Parceira (Financiadora)"
    >
      <Field
        label="Nome da Empresa / Instituição"
        span={6}
        placeholder="Razão social"
      />
      <Field
        label="Contato (Nome/Área)"
        span={6}
        placeholder="Ponto de contato na parceira"
      />
      <Field
        label="Valor Total Previsto (R$)"
        span={6}
        prefixo="R$"
        placeholder="0,00"
      />
      <Field
        label="Origem dos Recursos"
        span={6}
        tipo="select"
        placeholder="Selecione..."
        opcoes={['Privado Nacional', 'Privado Internacional', 'Público']}
      />
    </FormSection>

    <FormSection numero={4} icone="workspace_premium" titulo="Propriedade Intelectual">
      <Field
        label="% Titularidade USP"
        span={6}
        tipo="number"
        placeholder="0%"
      />
      <Field
        label="% Titularidade Parceira"
        span={6}
        tipo="number"
        placeholder="0%"
      />
    </FormSection>
  </FormPageLayout>
);

