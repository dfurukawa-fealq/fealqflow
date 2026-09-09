import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { SubTitulo } from '../components/form/SubTitulo';
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
  { id: 'cnpj-nif', label: 'CNPJ/NIF PDF', tipo: 'upload', obrigatorio: true },
  {
    id: 'comprovante-bancario',
    label: 'Comprovante Bancário PDF',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export const CadastroFinanciadora = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Financiadora']}
    titulo="Cadastro de Financiadora"
    codigo="CONV-FR-03-CADT"
    acaoPrincipal="Salvar Financiadora"
    acaoIcone="save"
    sidebar={
      <KitDocumental
        documentos={DOCUMENTOS}
        nota="Anexe os documentos faltantes para liberar o salvamento do cadastro completo."
      />
    }
  >
    <FormSection numero={1} icone="domain" titulo="Dados do Financiador">
      <Field label="Razão Social" placeholder="Nome completo da empresa" />
      <Field label="CNPJ / NIF" span={6} placeholder="00.000.000/0000-00" />
      <Field label="Inscrição Estadual/Municipal" span={6} placeholder="Opcional" />
      <Field label="Website" tipo="url" placeholder="https://" />
    </FormSection>

    <FormSection numero={2} icone="contact_mail" titulo="Contato Principal">
      <Field label="Nome do Contato" placeholder="Nome da pessoa responsável" />
      <Field
        label="Setor / Departamento"
        span={6}
        placeholder="Ex: Financeiro, P&D"
      />
      <Field
        label="E-mail"
        span={6}
        tipo="email"
        placeholder="contato@empresa.com"
      />
      <Field
        label="WhatsApp / Telefone"
        span={6}
        tipo="tel"
        prefixo="+55"
        placeholder="(00) 00000-0000"
      />
    </FormSection>

    <FormSection numero={3} icone="location_on" titulo="Endereços">
      <SubTitulo>Sede</SubTitulo>
      <Field label="CEP" span={3} placeholder="00000-000" />
      <Field label="Logradouro" span={7} placeholder="Rua, Avenida..." />
      <Field label="Número" span={2} />

      <div className="col-span-12 flex items-center gap-xs">
        <input
          className="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
          id="mesmo-endereco"
          type="checkbox"
        />
        <label
          className="text-[13px] text-on-surface-variant cursor-pointer"
          htmlFor="mesmo-endereco"
        >
          Endereço de Cobrança é o mesmo da Sede
        </label>
      </div>

      <SubTitulo opaco>Cobrança</SubTitulo>
      <Field label="CEP" span={3} disabled />
      <Field label="Logradouro" span={9} disabled />
    </FormSection>

    <FormSection numero={4} icone="rule" titulo="Regras Financeiras">
      <Field
        label="Pedido Formal Requerido?"
        tipo="select"
        opcoes={[
          'Sim, obrigatório',
          'Não necessário',
          'Apenas para valores > R$ 10.000',
        ]}
      />
      <Field
        label="Regras de NF"
        tipo="textarea"
        placeholder="Descreva regras específicas para faturamento..."
      />
    </FormSection>
  </FormPageLayout>
);

