interface SubTituloProps {
  children: string;
  /** Reduz a opacidade e afasta do bloco anterior (seções desabilitadas). */
  opaco?: boolean;
}

/**
 * Rótulo de sub-bloco dentro de uma `FormSection` — ocupa a linha inteira
 * da grade de 12 colunas. Use para separar grupos de campos que na origem
 * eram cards distintos (ex.: "Sede" e "Cobrança").
 */
export const SubTitulo = ({ children, opaco }: SubTituloProps) => (
  <h3
    className={`col-span-12 text-[13px] font-medium text-on-surface ${
      opaco ? 'opacity-50 mt-sm' : ''
    }`}
  >
    {children}
  </h3>
);
