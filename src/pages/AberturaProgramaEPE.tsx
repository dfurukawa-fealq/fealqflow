import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online',
    descricao: 'Preenchimento digital gerado pelo sistema.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'projeto-epe',
    label: 'Projeto EPE Detalhado',
    descricao: 'Documento contendo justificativa, metodologia e metas.',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'aprovacao-departamento',
    label: 'Aprovação do Departamento',
    descricao: 'Ata ou ofício de aprovação na unidade.',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export function AberturaProgramaEPE() {
  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Abertura de Programa EPE']}
      titulo="Abertura de Programa EPE"
      codigo="CONV-FR-04-PRO"
      acaoPrincipal="Submeter Programa"
      sidebar={<KitDocumental documentos={DOCUMENTOS} />}
    >
      <FormSection numero={1} icone="domain" titulo="Dados Institucionais">
        <Field
          label="Nome do Programa de EPE"
          placeholder="Nome completo do programa"
        />
        <Field
          label="Unidade/Departamento Envolvido"
          span={6}
          placeholder="Ex: ESALQ/USP"
        />
        <Field label="Público-Alvo" span={6} placeholder="A quem se destina" />
        <Field
          label="Objetivo Geral do Programa"
          tipo="textarea"
          placeholder="Descreva sucintamente o objetivo do programa"
        />
      </FormSection>

      <FormSection numero={2} icone="group" titulo="Equipe Principal">
        <Field
          label="Coordenador Geral"
          span={6}
          placeholder="Nome do coordenador"
        />
        <Field
          label="Vice-Coordenador (Opcional)"
          span={6}
          placeholder="Nome do vice-coordenador"
        />
      </FormSection>
    </FormPageLayout>
  );
}

