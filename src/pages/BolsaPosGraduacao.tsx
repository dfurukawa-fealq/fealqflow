import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('bolsa-pos');

export function BolsaPosGraduacao() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Bolsa Pós-Graduação"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="school" titulo="Dados do Bolsista">
        <Field label="Nome Completo do Aluno" placeholder="Ex: João da Silva" />
        <Field label="CPF" span={6} placeholder="000.000.000-00" />
        <Field
          label="Nível"
          span={6}
          tipo="select"
          placeholder="Selecione o nível"
          opcoes={['Mestrado', 'Doutorado', 'Pós-Doutorado']}
        />
        <Field
          label="Programa de Pós-Graduação (PPG)"
          placeholder="Nome do PPG"
        />
      </FormSection>

      <FormSection numero={2} icone="schedule" titulo="Detalhes da Bolsa">
        <Field
          label="Projeto Vinculado"
          placeholder="Projeto de pesquisa associado"
        />
        <Field label="Início da Bolsa" span={6} tipo="month" />
        <Field label="Fim Previsto" span={6} tipo="month" />
        <Field label="Valor Mensal Previsto (R$)" prefixo="R$" placeholder="0,00" />
      </FormSection>
    </FormPageLayout>
  );
}


