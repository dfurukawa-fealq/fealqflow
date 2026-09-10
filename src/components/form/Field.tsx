import { ReactNode, useState, useEffect } from 'react';
import { CpfInput } from './CpfInput';
import { DateInput } from './DateInput';
import { NumericInput } from './NumericInput';
import { CurrencyInput } from './CurrencyInput';

export type TipoCampo =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'month'
  | 'select'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'cpf'
  | 'masked-date'
  | 'numeric'
  | 'currency';

interface FieldProps {
  label: string;
  /** Largura em colunas de 12 (full em telas pequenas). Padrão 12. */
  span?: number;
  tipo?: TipoCampo;
  placeholder?: string;
  /** Opções de `select` e `radio`. */
  opcoes?: string[];
  /** Opção marcada por padrão em `radio`/`select`. */
  padrao?: string;
  /** Valor inicial de inputs de texto (telas de demonstração). */
  valor?: string;
  /** Prefixo colado à esquerda do campo, ex. '+55' ou 'R$'. */
  prefixo?: string;
  /** Texto auxiliar abaixo do campo. */
  hint?: string;
  disabled?: boolean;
  /** Adiciona atributo required (HTML5) no campo. Default: true. */
  obrigatorio?: boolean;
  /** Substitui o controle por um conteúdo próprio, mantendo label e grade. */
  children?: ReactNode;
}

// Tailwind precisa das classes literais no código-fonte.
const SPAN: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const CONTROLE =
  'w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors disabled:opacity-50';

export const LABEL =
  'block mb-xs text-on-surface-variant text-[11px] font-bold uppercase tracking-wide';

/** Input embutido em célula de tabela: borda só no hover/foco. */
export const CELULA_TABELA =
  'w-full h-[28px] px-sm border border-transparent hover:border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded bg-transparent text-[13px] outline-none';

/**
 * Label + controle no padrão do Cadastro de Financiadora. Concentra as
 * classes de borda/foco que antes eram copiadas em cada input.
 */
export const Field = ({
  label,
  span = 12,
  tipo = 'text',
  placeholder,
  opcoes = [],
  padrao,
  valor = '',
  prefixo,
  hint,
  disabled,
  obrigatorio = true,
  children,
}: FieldProps) => {
  const id = `${label}-${tipo}`.replace(/\s+/g, '-').toLowerCase();
  const [val, setVal] = useState<string>(valor);

  useEffect(() => {
    setVal(valor);
  }, [valor]);

  return (
    <div className={`col-span-12 ${SPAN[span] ?? SPAN[12]}`}>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>

      {children ??
        (tipo === 'cpf' ? (
          <CpfInput
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            value={val}
            onChange={setVal}
            className={CONTROLE}
          />
        ) : tipo === 'date' || tipo === 'month' || tipo === 'masked-date' ? (
          <DateInput
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            value={val}
            onChange={setVal}
            mode={tipo === 'date' ? 'full-date' : 'month-year'}
            className={CONTROLE}
          />
        ) : tipo === 'numeric' ? (
          <NumericInput
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            value={val}
            onChange={setVal}
            className={CONTROLE}
          />
        ) : tipo === 'currency' ? (
          <CurrencyInput
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            value={val}
            onChange={setVal}
            currencySymbol={prefixo || 'R$'}
            className={CONTROLE}
          />
        ) : tipo === 'textarea' ? (
          <textarea
            id={id}
            disabled={disabled}
            required={obrigatorio}
            placeholder={placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={`${CONTROLE} h-auto min-h-[80px] p-sm resize-y`}
          />
        ) : tipo === 'select' ? (
          <select
            id={id}
            disabled={disabled}
            required={obrigatorio}
            value={val || padrao || ''}
            onChange={(e) => setVal(e.target.value)}
            className={CONTROLE}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {opcoes.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : tipo === 'radio' ? (
          <div className="flex items-center flex-wrap gap-md h-[36px]">
            {opcoes.map((o) => (
              <label
                key={o}
                className="flex items-center gap-xs text-[13px] text-on-surface cursor-pointer"
              >
                <input
                  type="radio"
                  name={id}
                  value={o}
                  required={obrigatorio}
                  defaultChecked={o === padrao}
                  disabled={disabled}
                  className="text-primary-container focus:ring-primary-container border-outline-variant"
                />
                {o}
              </label>
            ))}
          </div>
        ) : tipo === 'checkbox' ? (
          <div className="flex items-center gap-xs h-[36px]">
            <input
              id={id}
              type="checkbox"
              required={obrigatorio}
              disabled={disabled}
              className="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
            />
            <span className="text-[13px] text-on-surface-variant">
              {placeholder}
            </span>
          </div>
        ) : prefixo ? (
          <div className="flex">
            <span className="inline-flex items-center px-sm h-[36px] rounded-l border border-r-0 border-outline-variant bg-surface-container-low text-on-surface-variant text-[12px]">
              {prefixo}
            </span>
            <input
              id={id}
              type={tipo}
              disabled={disabled}
              required={obrigatorio}
              placeholder={placeholder}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className={`${CONTROLE} rounded-l-none`}
            />
          </div>
        ) : (
          <input
            id={id}
            type={tipo}
            disabled={disabled}
            required={obrigatorio}
            placeholder={placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={CONTROLE}
          />
        ))}

      {hint && (
        <span className="block mt-xs text-[10px] text-on-surface-variant">
          {hint}
        </span>
      )}
    </div>
  );
};

