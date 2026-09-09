import React, { InputHTMLAttributes, useRef } from 'react';

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  /** Se deve aceitar formato MM/AAAA (padrão 6 dígitos) ou DD/MM/AAAA (8 dígitos) */
  mode?: 'month-year' | 'full-date';
}

export const formatDateString = (value: string, mode: 'month-year' | 'full-date' = 'month-year'): string => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  
  if (mode === 'month-year') {
    const digits = digitsOnly.slice(0, 6);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    const digits = digitsOnly.slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
};

export const DateInput: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  className = '',
  placeholder,
  mode = 'month-year',
  disabled,
  ...props
}) => {
  const nativePickerRef = useRef<HTMLInputElement>(null);
  const defaultPlaceholder = mode === 'month-year' ? 'MM/AAAA' : 'DD/MM/AAAA';
  const formattedValue = formatDateString(value, mode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateString(e.target.value, mode);
    if (onChange) {
      onChange(formatted);
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickerVal = e.target.value; // ex: '2026-07' ou '2026-07-15'
    if (!pickerVal) return;

    if (mode === 'month-year') {
      const [year, month] = pickerVal.split('-');
      if (year && month) {
        const formatted = `${month}/${year}`;
        if (onChange) onChange(formatted);
      }
    } else {
      const [year, month, day] = pickerVal.split('-');
      if (year && month && day) {
        const formatted = `${day}/${month}/${year}`;
        if (onChange) onChange(formatted);
      }
    }
  };

  const triggerPicker = () => {
    if (nativePickerRef.current && !disabled) {
      if (typeof nativePickerRef.current.showPicker === 'function') {
        nativePickerRef.current.showPicker();
      } else {
        nativePickerRef.current.click();
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        {...props}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        maxLength={mode === 'month-year' ? 7 : 10}
        value={formattedValue}
        onChange={handleChange}
        placeholder={placeholder || defaultPlaceholder}
        className={`${className} pr-9`}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={triggerPicker}
        title="Abrir seletor de data"
        className="absolute right-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 p-1 flex items-center justify-center rounded"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
      </button>

      {/* Input de data nativo invisível apenas para engatilhar o seletor visual */}
      <input
        ref={nativePickerRef}
        type={mode === 'month-year' ? 'month' : 'date'}
        tabIndex={-1}
        disabled={disabled}
        onChange={handleNativePickerChange}
        className="sr-only absolute opacity-0 w-0 h-0 pointer-events-none"
      />
    </div>
  );
};
