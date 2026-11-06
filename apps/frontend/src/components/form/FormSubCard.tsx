import { ReactNode } from 'react';

interface FormSubCardProps {
  /** Nome do ícone Material Symbols Outlined exibido à esquerda */
  icone?: string;
  /** Título principal do sub-bloco */
  titulo: string;
  /** Texto explicativo à direita ou subtítulo */
  subtitulo?: string;
  /** Selo ou badge visual no canto superior direito */
  badge?: ReactNode;
  /** Mensagem de aviso em caixa âmbar/amarela logo abaixo do cabeçalho */
  aviso?: ReactNode;
  /** Número de colunas no grid de 12 colunas da FormSection (padrão: 12) */
  span?: number;
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo interno distribuído nas 12 colunas do próprio subcard */
  children: ReactNode;
}

/**
 * Subcard padronizado para agrupamento de campos dentro de uma FormSection,
 * idêntico ao modelo visual dos formulários de Projetos da FEALQ.
 */
export const FormSubCard = ({
  icone,
  titulo,
  subtitulo,
  badge,
  aviso,
  span = 12,
  className = '',
  children,
}: FormSubCardProps) => {
  const colSpanMap: Record<number, string> = {
    3: 'col-span-12 md:col-span-3',
    4: 'col-span-12 md:col-span-4',
    6: 'col-span-12 md:col-span-6',
    8: 'col-span-12 md:col-span-8',
    9: 'col-span-12 md:col-span-9',
    12: 'col-span-12',
  };

  const spanClass = colSpanMap[span] || 'col-span-12';

  return (
    <div
      className={`${spanClass} min-w-0 overflow-x-auto bg-surface-container-low/60 border border-outline-variant p-md rounded-lg grid grid-cols-12 gap-sm ${className}`}
    >
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-xs pb-xs border-b border-outline-variant/60">
        <span className="flex min-w-0 items-center gap-xs text-[13px] font-bold text-on-surface">
          {icone && (
            <span className="material-symbols-outlined text-[18px] text-primary">
              {icone}
            </span>
          )}
          {titulo}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-xs">
          {badge}
          {subtitulo && (
            <span className="text-[11px] text-on-surface-variant">{subtitulo}</span>
          )}
        </div>
      </div>

      {aviso && (
        <div className="col-span-12 p-xs px-sm bg-amber-50/80 border border-amber-200 rounded text-amber-900 text-[12px] leading-relaxed">
          {aviso}
        </div>
      )}

      {children}
    </div>
  );
};
