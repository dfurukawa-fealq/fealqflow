import React, { InputHTMLAttributes } from 'react';

export interface CpfInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const formatCPF = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
  if (!digitsOnly) return '';
  if (digitsOnly.length <= 3) return digitsOnly;
  if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
  if (digitsOnly.length <= 9) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
  return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9)}`;
};

export const CpfInput: React.FC<CpfInputProps> = ({
  value = '',
  onChange,
  className = '',
  placeholder = '000.000.000-00',
  ...props
}) => {
  const formattedValue = formatCPF(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCPF(rawValue);
    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      maxLength={14}
      value={formattedValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};
