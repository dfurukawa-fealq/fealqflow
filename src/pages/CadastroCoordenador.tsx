import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online Preenchido',
    descricao: 'Preenchimento digital gerado pelo sistema.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'rg-cpf',
    label: 'Cópia RG/CPF (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
  {
    id: 'vinculo',
    label: 'Comprovante de Vínculo (PDF)',
    tipo: 'upload',
    obrigatorio: true,
  },
];

const TRAVA = (
  <div className="mb-lg flex items-start gap-sm p-sm rounded border border-error-container bg-error-container/40 text-[12px] text-on-error-container">
    <span className="material-symbols-outlined text-[18px]">lock</span>
    <span>
      <strong>Trava de Envio Ativa:</strong> preencha todos os campos
      obrigatórios e anexe os documentos para liberar o cadastro.
    </span>
  </div>
);

export const CadastroCoordenador = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Coordenador']}
    titulo="Cadastro de Coordenador"
    codigo="CONV-FR-07-CADT"
    alerta={TRAVA}
    acaoPrincipal="Salvar e Cadastrar Coordenador"
    acaoIcone="save"
    sidebar={<KitDocumental documentos={DOCUMENTOS} />}
  >
    <FormSection numero={1} icone="badge" titulo="Dados Pessoais">
      <Field label="Nome Completo" placeholder="Nome conforme documento" />
      <Field label="CPF" span={6} tipo="cpf" placeholder="000.000.000-00" />
      <Field label="RG" span={6} placeholder="00.000.000-0" />
      <Field label="Data de Nascimento" span={6} tipo="date" />
      <Field
        label="Sexo"
        span={6}
        tipo="select"
        placeholder="Selecione..."
        opcoes={['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']}
      />
      <Field label="Nacionalidade" span={6} valor="Brasileira" />
    </FormSection>

    <FormSection numero={2} icone="school" titulo="Dados Institucionais">
      <Field
        label="Unidade USP"
        span={6}
        tipo="select"
        placeholder="Selecione a Unidade..."
        opcoes={['ESALQ', 'CENA', 'FZEA']}
      />
      <Field
        label="Departamento"
        span={6}
        placeholder="Sigla do Departamento"
      />
      <Field label="Cargo" span={6} placeholder="Professor Titular, etc." />
      <Field
        label="E-mail Institucional"
        span={6}
        tipo="email"
        placeholder="usuario@usp.br"
      />
      <Field
        label="Telefone (Ramal)"
        span={6}
        tipo="tel"
        placeholder="(19) 3429-0000"
      />
    </FormSection>

    <FormSection numero={3} icone="location_on" titulo="Endereço Comercial">
      <Field label="CEP" span={3} placeholder="00000-000" />
      <Field label="Logradouro" span={6} placeholder="Avenida Pádua Dias" />
      <Field label="Número" span={3} placeholder="11" />
      <Field label="Bairro" span={4} placeholder="Agronomia" />
      <Field label="Cidade" span={5} placeholder="Piracicaba" />
      <Field
        label="Estado (UF)"
        span={3}
        tipo="select"
        placeholder="UF"
        opcoes={['SP']}
      />
    </FormSection>

    <FormSection numero={4} icone="account_balance" titulo="Dados Bancários">
      <Field
        label="Banco"
        tipo="select"
        placeholder="Selecione o Banco..."
        opcoes={['001 - Banco do Brasil']}
      />
      <Field label="Agência" span={6} placeholder="0000-X" />
      <Field label="Conta Corrente" span={6} placeholder="00000-X" />
      <div className="col-span-12">
        <div className="bg-primary-fixed/20 border border-primary-fixed p-sm rounded flex gap-sm items-start">
          <span className="material-symbols-outlined text-primary text-[16px]">
            info
          </span>
          <p className="text-[12px] text-on-surface-variant">
            A conta bancária informada deve obrigatoriamente estar vinculada ao
            CPF do coordenador (conta de mesma titularidade).
          </p>
        </div>
      </div>
    </FormSection>
  </FormPageLayout>
);

