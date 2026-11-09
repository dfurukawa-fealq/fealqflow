import { Link } from 'react-router-dom';
import { FormSection } from '../FormSection';

interface OrientacoesCoordenadorCardProps { aceito: boolean; urlOrientacoes: string; aoAbrirOrientacoes: () => void; }

export const OrientacoesCoordenadorCard = ({ aceito, urlOrientacoes, aoAbrirOrientacoes }: OrientacoesCoordenadorCardProps) => (
  <FormSection numero={8} icone="menu_book" titulo="Orientações ao Coordenador FEALQ">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low p-sm">
      <div className="flex items-center gap-xs border-b border-outline-variant pb-xs">
        <span className="material-symbols-outlined text-base text-primary">menu_book</span>
        <strong className="text-[12px] text-on-surface">Orientações ao Coordenador FEALQ</strong>
      </div>
      <p className="py-sm text-[10px] leading-relaxed text-on-surface-variant">Orientações sobre prazos para prestação de contas, regras de ressarcimento, contratação de fornecedores e relatórios técnicos exigidos pela Fundação e pela Universidade de São Paulo.</p>
      <label className="flex cursor-pointer items-start gap-xs border-t border-outline-variant pt-sm text-[11px] font-semibold text-on-surface">
        <input type="checkbox" checked={aceito} readOnly onClick={aoAbrirOrientacoes} className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
        <Link to={urlOrientacoes} target="_blank" rel="noopener noreferrer" onClick={aoAbrirOrientacoes} className="text-primary underline underline-offset-2 hover:text-primary-container">Declaro estar ciente e de acordo com as Orientações ao Coordenador da FEALQ *</Link>
      </label>
    </div>
  </FormSection>
);
