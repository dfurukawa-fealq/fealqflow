import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('cultura-extensao');

export function CulturaExtensao() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Projetos de Cultura e Extensão"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="palette" titulo="Sobre a Iniciativa Cultural">
        <Field
          label="Nome do Projeto/Grupo Cultural"
          placeholder="Ex: Coral Luiz de Queiroz"
        />
        <Field
          label="Área de Atuação"
          span={6}
          tipo="select"
          placeholder="Selecione a área"
          opcoes={[
            'Música',
            'Teatro/Artes Cênicas',
            'Artes Visuais',
            'Literatura',
            'Outros',
          ]}
        />
        <Field
          label="Vinculação CCEx"
          span={6}
          tipo="select"
          placeholder="O projeto é vinculado à CCEx?"
          opcoes={[
            'Sim, formalmente vinculado',
            'Não, iniciativa independente',
            'Em processo de vinculação',
          ]}
        />
        <Field
          label="Breve Descrição das Atividades"
          tipo="textarea"
          placeholder="Descreva o que o grupo/projeto realiza..."
        />
      </FormSection>

      <FormSection numero={2} icone="group" titulo="Necessidade de Apoio">
        <Field
          label="Para que os recursos serão destinados?"
          tipo="textarea"
          placeholder="Ex: Compra de instrumentos, figurinos, transporte para apresentação..."
        />
        <Field
          label="Valor Solicitado (R$)"
          span={6}
          prefixo="R$"
          placeholder="0,00"
          hint="Teto MÁX: R$ 3.000,00 por apoio"
        />
      </FormSection>
    </FormPageLayout>
  );
}


