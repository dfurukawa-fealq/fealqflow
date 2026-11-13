import { useEffect, useMemo } from 'react';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import { EnderecoField } from '../../components/form/EnderecoField';
import { ContatoField } from '../../components/form/ContatoField';
import { useProcessoState } from '../../contexts/ProcessoContext';
import kitsDocumentais from '../../../../../data/kits_documentais.json';
import itensKitDocumental from '../../../../../data/itens_kit_documental.json';

const TIPOS_FINANCIADORA = [
  'PJ - Pessoa Jurídica',
  'PF - Pessoa Física',
  'PE - Pessoa Estrangeira',
];

export const CadastroFinanciadora = () => {
  const [tipoFinanciadora, setTipoFinanciadora] = useProcessoState('tipoFinanciadora', '');
  useEffect(() => {
    const tiposLegados: Record<string, string> = {
      'Pessoa Jurídica': 'PJ - Pessoa Jurídica',
      'Pessoa Física': 'PF - Pessoa Física',
      'Pessoa Estrangeira': 'PE - Pessoa Estrangeira',
    };
    const valorMigrado = tiposLegados[tipoFinanciadora];
    if (valorMigrado) setTipoFinanciadora(valorMigrado);
  }, [setTipoFinanciadora, tipoFinanciadora]);
  const kitSelecionado = kitsDocumentais.find((kit) => kit.formulario_id === 'PRJ-FIN-001'
    && kit.ativo
    && 'campo_condicional' in kit
    && kit.campo_condicional === 'tipoFinanciadora'
    && kit.operador_condicional === 'equals'
    && kit.valor_condicional === tipoFinanciadora);
  const documentos = useMemo<DocumentoExigido[]>(() => {
    if (!kitSelecionado) return [];
    return itensKitDocumental
      .filter((item) => item.kit_id === kitSelecionado.id && item.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => ({
        id: item.identificador,
        label: item.titulo,
        descricao: item.descricao,
        tipo: item.tipo as DocumentoExigido['tipo'],
        obrigatorio: item.obrigatorio,
        permiteAnexo: 'permite_anexo' in item ? item.permite_anexo : undefined,
        permiteModelo: 'permite_modelo' in item ? item.permite_modelo : undefined,
        url_template: 'url_template' in item ? item.url_template : undefined,
      }));
  }, [kitSelecionado]);

  return (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Financiadora']}
    titulo="Cadastro de Financiadora"
    codigo="PRJ-FIN-001"
    acaoPrincipal="Salvar Financiadora"
    acaoIcone="save"
    sidebar={
      <KitDocumental
        acaoNoCard
        documentos={documentos}
        titulo={kitSelecionado?.nome ?? 'Kit de Cadastro da Financiadora'}
        destaque={!tipoFinanciadora ? (
          <div className="rounded border border-primary/30 bg-primary/5 p-sm text-[11px] text-on-surface-variant">
            Selecione o tipo de financiadora para visualizar os documentos necessários.
          </div>
        ) : undefined}
        nota="Os anexos selecionados auxiliam a FEALQ na conferência e conclusão do cadastro."
      />
    }
  >
    <FormSection numero={1} icone="domain" titulo="Dados do Financiador">
      <Field
        label="Tipo"
        tipo="select"
        placeholder="Selecione o tipo..."
        opcoes={TIPOS_FINANCIADORA}
        valor={tipoFinanciadora}
        onChange={setTipoFinanciadora}
        obrigatorio
      />

      {tipoFinanciadora === 'PJ - Pessoa Jurídica' && (
        <>
          <Field label="Razão Social" span={7} placeholder="Nome completo da empresa" obrigatorio />
          <Field label="CNPJ" span={5} placeholder="00.000.000/0000-00" obrigatorio />
        </>
      )}

      {tipoFinanciadora === 'PF - Pessoa Física' && (
        <>
          <Field label="Nome Completo" span={7} placeholder="Nome conforme documento" obrigatorio />
          <Field label="CPF" span={5} mascara="cpf" placeholder="000.000.000-00" obrigatorio />
        </>
      )}

      {tipoFinanciadora === 'PE - Pessoa Estrangeira' && (
        <>
          <Field label="Nome / Razão Social" span={6} placeholder="Nome completo no país de origem" obrigatorio />
          <Field label="País" span={3} placeholder="País de origem" obrigatorio />
          <Field label="NIF" span={3} placeholder="Identificação fiscal" obrigatorio />
        </>
      )}
    </FormSection>

    <FormSection numero={2} icone="contact_mail" titulo="Contato Principal, Fatura e Cobrança">
      <ContatoField
        titulo="Contato Principal"
        descricao="Responsável principal pelo relacionamento com a entidade"
        prefixo="financiadoraContatoPrincipal"
        aliases={{
          Nome: ['campo:Nome do Contato'],
          Email: ['campo:E-mail'],
          Telefone: ['campo:WhatsApp / Telefone'],
        }}
      />
      <ContatoField
        titulo="Contato para Fatura"
        descricao="Responsável pelo recebimento e conferência de faturas"
        prefixo="financiadoraContatoFaturamento"
      />
      <ContatoField
        titulo="Contato para Cobrança"
        descricao="Responsável pelas tratativas e correspondências de cobrança"
        prefixo="financiadoraContatoCobranca"
      />
    </FormSection>

    <FormSection numero={3} icone="location_on" titulo="Endereço Principal, Fatura e Cobrança">
      <EnderecoField
        titulo="Endereço Principal"
        descricao="Endereço principal da Entidade"
        prefixo="entidadeEnderecoPrincipal"
        aliases={{
          Cep: ['campo:CEP'],
          Logradouro: ['campo:Logradouro'],
          Numero: ['campo:Número'],
          Bairro: ['campo:Bairro'],
          Cidade: ['campo:Cidade'],
          Uf: ['campo:Estado (UF)'],
        }}
      />
      {/* <EnderecoField
        titulo="Endereço para Fatura"
        descricao="Endereço utilizado na emissão de faturas"
        prefixo="entidadeEnderecoFatura"
      />
      <EnderecoField
        titulo="Endereço para Cobrança"
        descricao="Endereço utilizado para correspondências de cobrança"
        prefixo="entidadeEnderecoCobranca"
      /> */}
    </FormSection>

    <FormSection numero={4} icone="rule" titulo="Regras Financeiras">
      <Field
        label="Pedido de Compra Requerido?"
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
};

