import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'formulario-online',
    label: 'Formulário Online',
    descricao: 'Preenchimento digital gerado pelo sistema.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'termo-responsabilidade',
    label: 'Termo de Responsabilidade',
    descricao: 'Termo assinado concordando com as regras do laboratório.',
    tipo: 'upload',
    obrigatorio: true,
  },
];

export function CentralMultiusuario() {
  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Central Multiusuário']}
      titulo="Central Multiusuário"
      codigo="MULTI-01"
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={DOCUMENTOS} />}
    >
      <FormSection
        numero={1}
        icone="science"
        titulo="Identificação do Projeto/Solicitação"
      >
        <Field
          label="Título do Projeto Vinculado"
          placeholder="Ex: Pesquisa de Novos Materiais"
        />
        <Field
          label="Nº do Projeto (Se houver)"
          span={6}
          placeholder="Ex: PROJ-2024-001"
        />
        <Field
          label="Laboratório/Centro Solicitado"
          span={6}
          tipo="select"
          placeholder="Selecione o local"
          opcoes={[
            'Laboratório de Análises Químicas',
            'Centro de Microscopia Eletrônica',
            'Laboratório de Biologia Molecular',
          ]}
        />
      </FormSection>

      <FormSection numero={2} icone="handyman" titulo="Equipamentos e Insumos">
        <Field
          label="Equipamentos Necessários"
          tipo="textarea"
          placeholder="Liste os equipamentos que serão utilizados"
        />
        <Field label="Data Inicial de Uso" span={6} tipo="date" />
        <Field label="Data Final de Uso" span={6} tipo="date" />
      </FormSection>
    </FormPageLayout>
  );
}

