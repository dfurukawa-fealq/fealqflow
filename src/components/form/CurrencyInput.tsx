import React from 'react';
import { NumericInput, NumericInputProps } from './NumericInput';

export interface CurrencyInputProps extends NumericInputProps {
  currencySymbol?: string;
  prefixClassName?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencySymbol = 'R$',
  prefixClassName = 'inline-flex items-center px-sm h-[36px] rounded-l border border-r-0 border-outline-variant bg-surface-container-low text-on-surface-variant text-[12px] font-bold',
  className = '',
  ...props
}) => {
  return (
    <div className="flex w-full">
      <span className={prefixClassName}>
        {currencySymbol}
      </span>
      <NumericInput
        {...props}
        className={`${className} rounded-l-none`}
      />
    </div>
  );
};
