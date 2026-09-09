import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { StatusCard } from '../components/form/StatusCard';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online',
    descricao: 'Preenchimento via plataforma.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'programacao',
    label: 'Programação (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'planilha-orcamentaria',
    label: 'Planilha Orçamentária',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export const AberturaCurso = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Protocolo de Abertura de Curso/Evento']}
    titulo="Protocolo de Abertura de Curso/Evento"
    codigo="CONV-FR-01-PRO"
    badge="Novo"
    acaoPrincipal="Submeter Protocolo de Evento"
    sidebar={
      <>
        <StatusCard
          percentual={30}
          nota="Complete todos os campos obrigatórios para liberar a submissão."
        />
        <KitDocumental documentos={DOCUMENTOS} titulo="Kit de Documentação" />
      </>
    }
  >
    <FormSection numero={1} icone="badge" titulo="Identificação">
      <Field
        label="Título do Curso/Evento"
        span={9}
        placeholder="Ex: Simpósio de Tecnologia Agrícola"
      />
      <Field label="Edição" span={3} placeholder="Ex: 5ª Edição" />
      <Field
        label="Formato"
        span={4}
        tipo="select"
        opcoes={[
          'Presencial',
          'Online (Síncrono)',
          'EAD (Assíncrono)',
          'Híbrido',
        ]}
      />
      <Field
        label="Local de Realização (Se aplicável)"
        span={8}
        placeholder="Auditório, Campus, etc."
      />
      <Field
        label="Público-Alvo"
        span={6}
        placeholder="Estudantes, Profissionais, etc."
      />
      <Field
        label="Estimativa (Pessoas)"
        span={3}
        tipo="number"
        placeholder="0"
      />
      <Field
        label="Carga Horária (h)"
        span={3}
        tipo="number"
        placeholder="0"
      />
    </FormSection>

    <FormSection numero={2} icone="supervisor_account" titulo="Coordenação">
      <Field label="Nome do Coordenador" span={6} />
      <Field label="Departamento/Instituição" span={6} />
      <Field label="Telefone p/ Contato" span={6} tipo="tel" />
      <Field label="E-mail Principal" span={6} tipo="email" />
    </FormSection>

    <FormSection numero={3} icone="play_circle" titulo="Execução">
      <Field
        label="Tipo de Inscrição"
        span={3}
        tipo="radio"
        opcoes={['Pago', 'Gratuito']}
        padrao="Pago"
      />
      <Field
        label="Valor Médio (R$)"
        span={3}
        prefixo="R$"
        placeholder="0,00"
      />
      <Field label="Nº de Vagas" span={3} tipo="number" placeholder="0" />
      <Field
        label="Usar Plataforma EAD Fealq?"
        span={3}
        tipo="radio"
        opcoes={['Sim', 'Não']}
        padrao="Não"
      />
    </FormSection>
  </FormPageLayout>
);

