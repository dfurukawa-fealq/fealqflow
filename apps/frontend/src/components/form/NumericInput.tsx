import React, { InputHTMLAttributes } from 'react';

export interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const formatNumericCurrency = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';

  const numberValue = parseInt(digitsOnly, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

export const NumericInput: React.FC<NumericInputProps> = ({
  value = '',
  onChange,
  className = '',
  placeholder = '0,00',
  ...props
}) => {
  const formattedValue = formatNumericCurrency(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatNumericCurrency(rawValue);
    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={formattedValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};
