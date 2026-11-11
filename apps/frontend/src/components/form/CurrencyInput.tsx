import { useId } from 'react';

export interface CurrencyInputProps {
  label?: string;
  ariaLabel?: string;
  valorCentavos: number;
  onChangeCentavos: (valorCentavos: number) => void;
  id?: string;
  moeda?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
  maxCentavos?: number;
  className?: string;
}

const formatador = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const converterReaisParaCentavos = (valor: string | number | null | undefined) => {
  if (typeof valor === 'number') return Number.isFinite(valor) ? Math.max(0, Math.round(valor * 100)) : 0;
  const limpo = String(valor ?? '').replace(/[^\d,.-]/g, '');
  const decimal = limpo.includes(',') ? limpo.replaceAll('.', '').replace(',', '.') : limpo;
  const numero = Number(decimal);
  return Number.isFinite(numero) ? Math.max(0, Math.round(numero * 100)) : 0;
};

export const formatarCentavosComoMoeda = (valorCentavos: number, moeda = 'BRL') =>
  ((Number.isFinite(valorCentavos) ? Math.trunc(valorCentavos) : 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: moeda });

const normalizarCentavos = (valor: number, maximo: number) => {
  if (!Number.isFinite(valor)) return 0;
  return Math.min(Math.max(0, Math.trunc(valor)), maximo);
};

/**
 * Campo monetário global no padrão bancário: cada dígito digitado representa
 * centavos. Ex.: 54100 => R$ 541,00. O valor canônico é sempre um inteiro.
 */
export const CurrencyInput = ({
  label,
  ariaLabel,
  valorCentavos,
  onChangeCentavos,
  id,
  moeda = 'R$',
  disabled = false,
  obrigatorio = false,
  maxCentavos = Number.MAX_SAFE_INTEGER,
  className = '',
}: CurrencyInputProps) => {
  const idGerado = useId();
  const inputId = id ?? idGerado;
  const valorSeguro = normalizarCentavos(valorCentavos, maxCentavos);

  const alterar = (texto: string) => {
    const digitos = texto.replace(/\D/g, '');
    const proximo = digitos ? Number(digitos.slice(-15)) : 0;
    onChangeCentavos(normalizarCentavos(proximo, maxCentavos));
  };

  return <div className={`min-w-0 ${className}`}>
    {label && <label htmlFor={inputId} className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
      {label}{obrigatorio && <span className="ml-0.5 text-red-500">*</span>}
    </label>}
    <div className="flex h-9 min-w-0 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest transition-colors focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container has-[:disabled]:opacity-50">
      <span className="flex shrink-0 items-center border-r border-outline-variant px-2 text-xs text-on-surface-variant">{moeda}</span>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        required={obrigatorio}
        value={formatador.format(valorSeguro / 100)}
        onChange={(evento) => alterar(evento.target.value)}
        onFocus={(evento) => evento.currentTarget.setSelectionRange(evento.currentTarget.value.length, evento.currentTarget.value.length)}
        aria-label={ariaLabel ?? label ?? 'Valor monetário'}
        className="min-w-0 flex-1 bg-transparent px-2 text-right text-[13px] tabular-nums text-on-surface outline-none"
      />
    </div>
  </div>;
};
