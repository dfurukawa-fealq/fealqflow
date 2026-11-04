import React, { InputHTMLAttributes } from 'react';
import { formatCPF } from '../../utils/formatters';

export { formatCPF };

export interface CpfInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

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
