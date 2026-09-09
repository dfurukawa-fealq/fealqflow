import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'cadastro-online',
    label: 'Cadastro Online',
    descricao: 'Preenchimento digital gerado pelo sistema.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'cartao-cnpj',
    label: 'Cartão CNPJ (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'estatuto',
    label: 'Estatuto Social (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'procuracao',
    label: 'Procuração (PDF)',
    tipo: 'upload',
    obrigatorio: false,
    condicao: 'Quando o signatário não for o representante legal.',
  },
];

export const CadastroParceiro = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Parceiro']}
    titulo="Cadastro de Parceiro"
    codigo="FR-05-DIR"
    acaoPrincipal="Enviar Cadastro de Parceiro Fechado"
    sidebar={<KitDocumental documentos={DOCUMENTOS} />}
  >
    <FormSection numero={1} icone="domain" titulo="Contratante">
      <Field label="Razão Social" span={6} />
      <Field label="Fantasia" span={6} />
      <Field label="CNPJ" span={6} placeholder="00.000.000/0000-00" />
      <Field label="Inscrição Estadual/Municipal" span={6} />
      <Field label="E-mail Financeiro" span={6} tipo="email" />
      <Field label="Telefone" span={6} tipo="tel" prefixo="+55" />
    </FormSection>

    <FormSection
      numero={2}
      icone="contact_mail"
      titulo="Responsável Técnico / Contato"
    >
      <Field label="Nome Completo" />
      <Field label="CPF" span={6} placeholder="000.000.000-00" />
      <Field label="Cargo" span={6} />
      <Field label="WhatsApp" span={6} tipo="tel" prefixo="+55" />
      <Field label="E-mail Corporativo" span={6} tipo="email" />
    </FormSection>

    <FormSection numero={3} icone="handshake" titulo="Vínculo do Contrato">
      <Field label="Nome do Evento/Curso" />
      <Field label="Coordenador Responsável" span={6} />
      <Field
        label="Valor do Contrato (R$)"
        span={6}
        prefixo="R$"
        placeholder="0,00"
      />
      <Field label="Quantidade de Turmas / Participantes" />
    </FormSection>
  </FormPageLayout>
);

