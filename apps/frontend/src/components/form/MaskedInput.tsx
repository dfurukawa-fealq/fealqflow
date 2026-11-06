import { InputHTMLAttributes } from 'react';
import { formatCPF, formatRG, formatTelefone } from '../../utils/formatters';

export type MascaraInput = 'cpf' | 'telefone' | 'rg';

const formatadores: Record<MascaraInput, (valor: string) => string> = {
  cpf: formatCPF,
  telefone: formatTelefone,
  rg: formatRG,
};

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mascara: MascaraInput;
  value?: string;
  onChange?: (valor: string) => void;
}

export const MaskedInput = ({ mascara, value = '', onChange, className = '', ...props }: MaskedInputProps) => {
  const formatar = formatadores[mascara];
  return (
    <input
      {...props}
      type="text"
      value={formatar(value)}
      onChange={(evento) => onChange?.(formatar(evento.target.value))}
      inputMode="numeric"
      className={className}
    />
  );
};

export const CpfInput = (props: Omit<MaskedInputProps, 'mascara'>) => <MaskedInput {...props} mascara="cpf" />;
export const TelefoneInput = (props: Omit<MaskedInputProps, 'mascara'>) => <MaskedInput {...props} mascara="telefone" />;
export const RgInput = (props: Omit<MaskedInputProps, 'mascara'>) => <MaskedInput {...props} mascara="rg" />;
