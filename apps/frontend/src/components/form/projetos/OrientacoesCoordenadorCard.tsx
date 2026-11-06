import { FormSection } from '../FormSection';

interface OrientacoesCoordenadorCardProps {
  aceito: boolean;
  aoAlterarAceite: (valor: boolean) => void;
}

export const OrientacoesCoordenadorCard = ({ aceito, aoAlterarAceite }: OrientacoesCoordenadorCardProps) => (
  <FormSection numero={8} icone="menu_book" titulo="Orientações ao Coordenador FEALQ">
  <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low p-sm">
    <div className="flex items-center gap-xs border-b border-outline-variant pb-xs">
      <span className="material-symbols-outlined text-base text-primary">menu_book</span>
      <strong className="text-[12px] text-on-surface">Orientações ao Coordenador FEALQ</strong>
    </div>
    <p className="py-sm text-[10px] leading-relaxed text-on-surface-variant">
      Orientações sobre prazos para prestação de contas, regras de ressarcimento, contratação de fornecedores e relatórios técnicos exigidos pela Fundação e pela Universidade de São Paulo.
    </p>
    <label className="flex cursor-pointer items-center gap-xs border-t border-outline-variant pt-sm text-[11px] font-semibold text-on-surface">
      <input type="checkbox" checked={aceito} onChange={(evento) => aoAlterarAceite(evento.target.checked)} className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
      Declaro estar ciente e de acordo com as Orientações ao Coordenador da FEALQ *
    </label>
  </div>
  </FormSection>
);
