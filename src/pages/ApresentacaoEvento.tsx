import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('apresentacao-evento');

export function ApresentacaoEvento() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Apoio para Apresentação em Evento"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="public" titulo="Dados do Evento">
        <Field
          label="Nome do Evento/Congresso"
          placeholder="Ex: Simpósio Brasileiro de Agropecuária"
        />
        <Field
          label="Local do Evento (Cidade/País)"
          span={6}
          placeholder="Ex: São Paulo, SP - Brasil"
        />
        <Field
          label="Website do Evento"
          span={6}
          tipo="url"
          placeholder="https://"
        />
        <Field label="Data de Início" span={6} tipo="date" />
        <Field label="Data de Término" span={6} tipo="date" />
      </FormSection>

      <FormSection numero={2} icone="mic" titulo="Trabalho a ser Apresentado">
        <Field
          label="Título do Trabalho Aceito"
          placeholder="Título exato conforme submissão"
        />
        <Field
          label="Formato de Apresentação"
          span={6}
          tipo="select"
          placeholder="Selecione o formato"
          opcoes={[
            'Comunicação Oral',
            'Pôster / Banner',
            'Mesa Redonda',
            'Palestra Convidada',
          ]}
        />
        <Field
          label="Valor Solicitado"
          span={6}
          tipo="currency"
          hint="Teto MÁX: R$ 3.000 (Nacional) / R$ 6.000 (Exterior)"
        />
      </FormSection>
    </FormPageLayout>
  );
}


