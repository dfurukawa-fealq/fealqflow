import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('bolsa-graduacao');

export function BolsaGraduacao() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Bolsa Graduação (Iniciação)"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="menu_book" titulo="Dados do Bolsista de IC">
        <Field
          label="Nome Completo do Aluno"
          placeholder="Ex: Maria Oliveira"
        />
        <Field label="CPF" span={6} tipo="cpf" />
        <Field
          label="Curso"
          span={6}
          placeholder="Ex: Engenharia Agronômica"
        />
        <Field
          label="Período/Semestre Atual"
          span={6}
          placeholder="Ex: 5º Semestre"
        />
        <Field
          label="Número USP / Matrícula"
          span={6}
          tipo="numeric"
          placeholder="Apenas números"
        />
      </FormSection>

      <FormSection numero={2} icone="schedule" titulo="Plano de Trabalho">
        <Field
          label="Título do Plano de Trabalho"
          placeholder="Título da pesquisa do aluno"
        />
        <Field
          label="Projeto Guarda-Chuva (Se houver)"
          placeholder="Projeto do professor orientador"
        />
        <Field label="Início da Bolsa" span={6} tipo="month" />
        <Field label="Fim Previsto" span={6} tipo="month" />
      </FormSection>
    </FormPageLayout>
  );
}


