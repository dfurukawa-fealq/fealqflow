interface AutoPreencherButtonProps {
  onClick: () => void;
  mensagem?: string;
}

export const AutoPreencherButton = ({
  onClick,
  mensagem = 'Podemos reaproveitar os dados preenchidos no formulário principal para completar este formulário?',
}: AutoPreencherButtonProps) => (
  <div className="flex items-center gap-1.5">
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary hover:bg-primary/10">
      <span className="material-symbols-outlined text-[15px]" aria-hidden="true">auto_awesome</span>
      Auto preencher
    </button>
    <span className="material-symbols-outlined cursor-help text-[17px] text-on-surface-variant" title={mensagem} aria-label={mensagem}>info</span>
  </div>
);
