import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online Preenchido',
    descricao: 'Preenchimento via plataforma.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'sumario',
    label: 'Sumário / Amostra (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'orcamento-grafico',
    label: 'Orçamento Gráfico (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export const AberturaPublicacao = () => (
  <FormPageLayout
    breadcrumb={[
      'Área do Coordenador',
      'Protocolo de Abertura de Publicação / Livro',
    ]}
    titulo="Protocolo de Abertura de Publicação / Livro"
    codigo="CONV-FR-02-PRO"
    acaoPrincipal="Enviar Solicitação de Publicação"
    sidebar={<KitDocumental documentos={DOCUMENTOS} titulo="Kit de Anexos" />}
  >
    <FormSection numero={1} icone="book" titulo="Dados da Obra">
      <Field label="Título da Obra" />
      <Field label="Subtítulo" />
      <Field label="Autores (Separados por vírgula)" />
      <Field label="Editora" span={6} />
      <Field label="ISBN" span={6} />
    </FormSection>

    <FormSection numero={2} icone="supervisor_account" titulo="Coordenação">
      <Field label="Coordenador Responsável" span={6} />
      <Field label="CPF" span={6} placeholder="000.000.000-00" />
      <Field label="Departamento / Instituto" span={6} />
      <Field label="Telefone" span={6} tipo="tel" />
      <Field label="E-mail Institucional" tipo="email" />
    </FormSection>

    <FormSection numero={3} icone="tune" titulo="Especificações">
      <Field label="Tiragem" span={3} tipo="number" />
      <Field label="Formato (cm)" span={3} placeholder="ex: 16x23" />
      <Field
        label="Custo Impressão (R$)"
        span={3}
        prefixo="R$"
        placeholder="0,00"
      />
      <Field
        label="Origem Rec."
        span={3}
        tipo="select"
        placeholder="Selecione..."
        opcoes={['Fealq', 'FAPESP', 'Outros']}
      />
    </FormSection>
  </FormPageLayout>
);

