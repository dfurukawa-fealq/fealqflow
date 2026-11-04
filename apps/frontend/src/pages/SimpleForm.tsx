import { FormLayout } from './FormLayout';

interface SimpleFormProps {
  title: string;
  code?: string;
}

export const SimpleForm = ({ title, code }: SimpleFormProps) => {
  const sidePanel = (
    <div className="bg-surface-container-low border border-outline-variant rounded p-md">
      <h3 className="font-bold text-sm text-primary mb-md border-b border-outline-variant pb-2">
        Kit Documental
      </h3>
      <div className="space-y-sm">
        <div className="flex items-center justify-between p-2 bg-[#20B293]/10 border border-[#20B293]/20 rounded">
          <span className="text-xs font-medium text-[#20B293]">
            Formulário Online
          </span>
          <span className="material-symbols-outlined text-sm text-[#20B293] fill-icon">
            check_circle
          </span>
        </div>
        <div className="flex items-center justify-between p-2 border border-dashed border-outline-variant rounded hover:border-primary cursor-pointer group">
          <span className="text-xs text-on-surface-variant group-hover:text-primary">
            Anexo Obrigatório (PDF)
          </span>
          <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary">
            upload
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <FormLayout title={title} code={code} sidePanel={sidePanel}>
      <div className="bg-white border border-outline-variant rounded p-lg space-y-xl shadow-sm">
        <section>
          <h4 className="text-sm font-bold text-primary mb-md border-b border-surface-variant pb-2">
            1. Dados Identificadores
          </h4>
          <div className="grid grid-cols-2 gap-md">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">
                NOME / TÍTULO
              </label>
              <input
                className="w-full h-9 border border-outline-variant rounded px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                type="text"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">
                UNIDADE
              </label>
              <select className="w-full h-9 border border-outline-variant rounded px-3 text-sm outline-none focus:ring-1 focus:ring-primary">
                <option>ESALQ</option>
                <option>CENA</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">
                DATA PREVISTA
              </label>
              <input
                className="w-full h-9 border border-outline-variant rounded px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                type="date"
              />
            </div>
          </div>
        </section>
        <section>
          <h4 className="text-sm font-bold text-primary mb-md border-b border-surface-variant pb-2">
            2. Justificativa
          </h4>
          <textarea
            className="w-full h-32 border border-outline-variant rounded p-3 text-sm resize-none outline-none focus:ring-1 focus:ring-primary"
            placeholder="Descreva brevemente..."
          ></textarea>
        </section>
      </div>
    </FormLayout>
  );
};
