import { ButtonHTMLAttributes } from 'react';

interface FormActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  texto: string;
  icone: string;
  destaque?: boolean;
}

export const FormActionButton = ({ texto, icone, destaque = false, className = '', ...props }: FormActionButtonProps) => (
  <button
    {...props}
    aria-label={props['aria-label'] ?? texto}
    title={props.title ?? texto}
    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center gap-xs rounded border text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:h-[36px] xl:w-auto xl:max-w-[260px] xl:px-md ${
      destaque
        ? 'border-transparent bg-secondary text-on-secondary hover:opacity-90'
        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
    } ${className}`}
  >
    <span className="material-symbols-outlined shrink-0 text-[20px] lg:text-[18px]" aria-hidden="true">{icone}</span>
    <span className="hidden truncate xl:inline">{texto}</span>
  </button>
);
