import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('infraestrutura');

export function ApoioInfraestrutura() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Apoio a Infraestrutura"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="domain" titulo="Local da Melhoria">
        <Field
          label="Departamento / Unidade"
          placeholder="Ex: Departamento de Genética"
        />
        <Field
          label="Descrição do Local Específico"
          placeholder="Ex: Laboratório 04, Prédio Principal"
        />
      </FormSection>

      <FormSection numero={2} icone="handyman" titulo="Detalhes do Pedido">
        <Field
          label="Tipo de Apoio"
          tipo="select"
          placeholder="Selecione o tipo"
          opcoes={[
            'Reforma Estrutural',
            'Compra de Equipamento de Grande Porte',
            'Manutenção Especializada',
          ]}
        />
        <Field
          label="Justificativa da Necessidade"
          tipo="textarea"
          placeholder="Explique por que esta infraestrutura é necessária e quem será beneficiado..."
        />
        <Field
          label="Valor Estimado"
          span={6}
          tipo="currency"
          hint="Teto MÁX: R$ 20.000,00 por pedido"
        />
      </FormSection>
    </FormPageLayout>
  );
}


