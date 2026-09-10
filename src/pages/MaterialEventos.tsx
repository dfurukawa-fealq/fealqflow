import { getPrograma } from '../data/programasApoio';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { NormasPrograma } from '../components/NormasPrograma';

const programa = getPrograma('material-eventos');

const MATERIAIS = [
  'Pastas Personalizadas',
  'Blocos de Anotação',
  'Crachás e Cordões',
  'Canetas',
  'Banners/Faixas',
  'Outros',
];

export function MaterialEventos() {
  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Material para Eventos"
      codigo={programa.codigo}
      acaoPrincipal="Submeter Pedido"
      sidebar={<KitDocumental documentos={programa.documentos} />}
    >
      <NormasPrograma programa={programa} />

      <FormSection numero={1} icone="event" titulo="Dados do Evento Organizado">
        <Field
          label="Nome do Evento"
          placeholder="Ex: Semana de Estudos Agronômicos"
        />
        <Field
          label="Público Estimado"
          span={6}
          tipo="numeric"
          placeholder="Nº de participantes"
        />
        <Field label="Data do Evento" span={6} tipo="date" />
      </FormSection>

      <FormSection numero={2} icone="inventory_2" titulo="Especificação de Materiais">
        <Field label="Tipos de Materiais Necessários">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
            {MATERIAIS.map((m) => (
              <label
                key={m}
                className="flex items-center gap-sm text-[13px] text-on-surface cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                />
                {m}
              </label>
            ))}
          </div>
        </Field>
        <Field
          label="Detalhes Adicionais (Quantidades específicas)"
          tipo="textarea"
          placeholder="Ex: 200 pastas, 200 blocos, 1 banner 2x1m"
        />
      </FormSection>
    </FormPageLayout>
  );
}


