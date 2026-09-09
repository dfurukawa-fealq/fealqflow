import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'consulta-cnpj',
    label: 'Consulta CNPJ Online',
    descricao: 'Verificação automática realizada pelo sistema.',
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
    id: 'contrato-social',
    label: 'Contrato Social (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export const CadastroPatrocinador = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Patrocinador']}
    titulo="Cadastro de Patrocinador"
    codigo="CONV-FR-04-CADT"
    acaoPrincipal="Salvar e Enviar Cadastro"
    acaoIcone="save"
    sidebar={<KitDocumental documentos={DOCUMENTOS} />}
  >
    <FormSection numero={1} icone="domain" titulo="Dados da Pessoa Jurídica">
      <Field label="CNPJ" span={6} placeholder="00.000.000/0000-00" />
      <Field
        label="Razão Social"
        span={6}
        placeholder="Nome completo da empresa"
      />
      <Field label="Nome Fantasia" span={6} placeholder="Nome fantasia" />
      <Field label="Inscrição Estadual" span={3} placeholder="Opcional" />
      <Field label="Inscrição Municipal" span={3} placeholder="Opcional" />
      <Field
        label="Site"
        tipo="url"
        placeholder="https://www.exemplo.com.br"
      />
    </FormSection>

    <FormSection
      numero={2}
      icone="contact_mail"
      titulo="Contato do Patrocinador"
    >
      <Field label="Nome Completo" span={6} placeholder="Nome do contato" />
      <Field label="Cargo" span={6} placeholder="Ex: Diretor" />
      <Field label="CPF" span={6} placeholder="000.000.000-00" />
      <Field
        label="E-mail"
        span={6}
        tipo="email"
        placeholder="email@empresa.com.br"
      />
      <Field
        label="Telefone Fixo"
        span={6}
        tipo="tel"
        placeholder="(00) 0000-0000"
      />
      <Field
        label="WhatsApp"
        span={6}
        tipo="tel"
        placeholder="(00) 00000-0000"
      />
    </FormSection>

    <FormSection numero={3} icone="location_on" titulo="Endereço de Cobrança">
      <Field label="CEP" span={3} placeholder="00000-000" />
      <Field label="Logradouro" span={7} placeholder="Rua, Avenida, etc." />
      <Field label="Número" span={2} placeholder="Nº" />
      <Field label="Bairro" span={4} placeholder="Bairro" />
      <Field label="Cidade" span={5} placeholder="Cidade" />
      <Field label="Estado" span={3} placeholder="UF" />
    </FormSection>

    <FormSection
      numero={4}
      icone="receipt_long"
      titulo="Faturamento"
      acao={
        <label className="flex items-center gap-xs cursor-pointer shrink-0">
          <input
            defaultChecked
            className="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4"
            type="checkbox"
          />
          <span className="text-[12px] text-on-surface-variant">
            Mesmo de cobrança
          </span>
        </label>
      }
    >
      <Field label="CEP" span={3} placeholder="00000-000" disabled />
      <Field
        label="Logradouro"
        span={7}
        placeholder="Rua, Avenida, etc."
        disabled
      />
      <Field label="Número" span={2} placeholder="Nº" disabled />
      <Field label="Bairro" span={4} placeholder="Bairro" disabled />
      <Field label="Cidade" span={5} placeholder="Cidade" disabled />
      <Field label="UF" span={3} placeholder="UF" disabled />
    </FormSection>

    <FormSection numero={5} icone="link" titulo="Vínculo e Documentação">
      <Field
        label="Projeto / Evento Vinculado"
        tipo="select"
        placeholder="Selecione um projeto ativo..."
        opcoes={[
          'Simpósio de Tecnologia Agrícola 2024',
          'Programa de Inovação Sustentável',
        ]}
      />
      <Field
        label="Valor da Cota (R$)"
        span={6}
        prefixo="R$"
        placeholder="0,00"
      />
      <Field label="Assinatura Digital" span={6}>
        <div className="h-[36px] flex items-center gap-sm px-sm border border-outline-variant rounded bg-surface-container-low text-on-surface-variant text-[13px]">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            draw
          </span>
          Via DocuSign
        </div>
      </Field>
    </FormSection>
  </FormPageLayout>
);

