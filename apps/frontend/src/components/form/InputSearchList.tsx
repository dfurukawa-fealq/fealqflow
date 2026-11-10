interface InputSearchListProps {
  label: string;
  valor: string;
  opcoes: readonly string[];
  onChange: (valor: string) => void;
  obrigatorio?: boolean;
  placeholder?: string;
}

export const InputSearchList = ({ label, valor, opcoes, onChange, obrigatorio = false, placeholder = 'Digite para buscar' }: InputSearchListProps) => {
  const id = `lista-${label.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;
  const [aberta, setAberta] = useState(false);
  const filtradas = useMemo(() => opcoes.filter((opcao) => opcao.toLocaleLowerCase('pt-BR').includes(valor.toLocaleLowerCase('pt-BR'))), [opcoes, valor]);
  return <div className="col-span-12">
    <label htmlFor={id} className="mb-xs block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
      {label}{obrigatorio && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      <input id={id} value={valor} onFocus={() => setAberta(true)} onBlur={() => window.setTimeout(() => setAberta(false), 150)} onChange={(evento) => { onChange(evento.target.value); setAberta(true); }} placeholder={placeholder} required={obrigatorio} className="w-full rounded border border-outline-variant bg-surface-container-lowest p-sm pr-9 text-[13px] text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
      <span className="material-symbols-outlined pointer-events-none absolute right-sm top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">arrow_drop_down</span>
      {aberta && filtradas.length > 0 && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border border-outline-variant bg-surface-container-lowest shadow-lg">
        {filtradas.map((opcao) => <button key={opcao} type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={() => { onChange(opcao); setAberta(false); }} className="block w-full px-sm py-sm text-left text-[13px] text-on-surface hover:bg-primary/10">{opcao}</button>)}
      </div>}
    </div>
  </div>;
};
import { useMemo, useState } from 'react';

