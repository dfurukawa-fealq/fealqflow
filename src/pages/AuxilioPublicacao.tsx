import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('auxilio-publicacao');

export const AuxilioPublicacao = () => (
  <FormPageLayout
    breadcrumb={['Programa de Apoios', programa.titulo]}
    titulo="Auxílio para Publicação de Artigo Científico"
    codigo={programa.codigo}
    badge="Rascunho"
    acaoPrincipal="Enviar Solicitação"
    sidebar={<KitDocumental documentos={programa.documentos} />}
  >
    <NormasPrograma programa={programa} />

    <FormSection numero={1} icone="person" titulo="Dados do Solicitante">
      <Field label="Nome Completo" span={8} valor="João Silva Santos" />
      <Field label="CPF" span={4} tipo="cpf" valor="12345678900" />
      <Field
        label="Instituição"
        span={6}
        tipo="select"
        opcoes={['ESALQ/USP', 'FZEA/USP', 'CENA/USP']}
      />
      <Field
        label="Departamento"
        span={6}
        placeholder="Ex: Departamento de Economia"
      />
      <Field
        label="Vínculo"
        span={6}
        tipo="select"
        opcoes={['Docente', 'Pós-Doutorando', 'Doutorando', 'Mestrando']}
      />
      <Field
        label="Orientador (se aplicável)"
        span={6}
        placeholder="Nome do Professor Orientador"
      />
      <Field
        label="Participação no Artigo"
        tipo="radio"
        opcoes={['1º Autor', 'Autor Correspondente', 'Co-autor']}
        padrao="1º Autor"
      />
    </FormSection>

    <FormSection numero={2} icone="article" titulo="Dados da Publicação">
      <Field
        label="Título do Artigo"
        placeholder="Insira o título completo do artigo aceito"
      />
      <Field label="Revista / Periódico" span={8} placeholder="Nome da Revista" />
      <Field label="Impact Factor" span={2} tipo="numeric" placeholder="0.000" />
      <Field label="CiteScore" span={2} tipo="numeric" placeholder="0.00" />
      <Field
        label="Moeda"
        span={4}
        tipo="select"
        opcoes={['BRL (R$)', 'USD ($)', 'EUR (€)', 'GBP (£)']}
        padrao="BRL (R$)"
      />
      <Field label="Valor da Taxa (APC)" span={4} tipo="currency" valor="222222" />
      <Field
        label="Outras Fontes de Custeio?"
        span={4}
        tipo="select"
        opcoes={[
          'Não',
          'Sim, FAPESP',
          'Sim, CAPES',
          'Sim, CNPq',
          'Sim, Outras',
        ]}
      />
    </FormSection>
  </FormPageLayout>
);


