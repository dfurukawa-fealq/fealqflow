import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('interesse-comunidade');

export function InteresseComunidade() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Projetos de Interesse da Comunidade"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="volunteer_activism" titulo="Visão Geral da Ação">
        <Field
          label="Nome do Projeto/Ação"
          placeholder="Ex: Horta Comunitária Educativa"
        />
        <Field
          label="Objetivo Principal"
          tipo="textarea"
          placeholder="Qual o impacto esperado na comunidade?"
        />
        <Field
          label="Público-Alvo Estimado"
          span={6}
          tipo="numeric"
          placeholder="Nº de pessoas beneficiadas"
        />
        <Field
          label="Valor do Apoio Solicitado"
          span={6}
          tipo="currency"
          hint="Teto MÁX: R$ 5.000,00 por apoio"
        />
      </FormSection>

      <FormSection numero={2} icone="location_on" titulo="Local de Atuação">
        <Field label="Bairro / Comunidade" placeholder="Ex: Bairro São Mário" />
        <Field
          label="Parceiros Locais (Associações, ONGs, etc)"
          placeholder="Liste as entidades parceiras na comunidade"
        />
      </FormSection>
    </FormPageLayout>
  );
}


