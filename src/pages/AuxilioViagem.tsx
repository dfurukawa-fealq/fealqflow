import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('auxilio-viagem');

export const AuxilioViagem = () => (
  <FormPageLayout
    breadcrumb={['Programa de Apoios', programa.titulo]}
    titulo="Solicitação de Auxílio Viagem"
    codigo={programa.codigo}
    badge="Rascunho"
    acaoPrincipal="Enviar Solicitação"
    sidebar={<KitDocumental documentos={programa.documentos} />}
  >
    <NormasPrograma programa={programa} />

    <FormSection numero={1} icone="person" titulo="Dados do Solicitante">
      <Field label="Nome Completo" valor="João Silva Carvalho" />
      <Field label="CPF" span={6} tipo="cpf" valor="12345678900" />
      <Field
        label="E-mail Institucional"
        span={6}
        tipo="email"
        valor="joao.silva@instituicao.edu.br"
      />
      <Field
        label="Vínculo"
        span={6}
        tipo="select"
        placeholder="Selecione..."
        opcoes={['Graduação', 'Mestrado', 'Doutorado']}
        padrao="Mestrado"
      />
      <Field label="Departamento" span={6} valor="Ciências Exatas" />
      <Field label="Orientador" placeholder="Nome do Professor Orientador" />
    </FormSection>

    <FormSection numero={2} icone="flight_takeoff" titulo="Dados da Viagem">
      <Field
        label="País de Destino"
        span={6}
        tipo="select"
        opcoes={['Brasil', 'Portugal', 'Estados Unidos', 'Outro...']}
      />
      <Field label="Cidade/Estado" span={6} placeholder="Ex: São Paulo, SP" />
      <Field label="Mês/Ano da Viagem" span={6} tipo="month" valor="072026" />
      <Field
        label="Finalidade"
        span={6}
        tipo="select"
        opcoes={['Pesquisa de Campo', 'Reunião Científica', 'Estágio']}
      />
      <Field
        label="Tipo de Auxílio"
        span={6}
        tipo="select"
        opcoes={[
          'Passagem Aérea/Terrestre',
          'Hospedagem & Diárias',
          'Misto (Passagem + Hospedagem)',
        ]}
      />
      <Field
        label="Valor Solicitado"
        span={6}
        tipo="currency"
        valor="222222"
        hint="Teto MÁX: R$ 3.000 (Nacional) / R$ 6.000 (Intl.)"
      />
    </FormSection>
  </FormPageLayout>
);


