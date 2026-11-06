/**
 * Formatadores padronizados para dados brasileiros do FealqFlow.
 */

/** Formata CPF no padrão 000.000.000-00 */
export const formatCPF = (value: string | null | undefined): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
  if (!digitsOnly) return '';
  if (digitsOnly.length <= 3) return digitsOnly;
  if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
  if (digitsOnly.length <= 9) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
  return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9)}`;
};

/** Formata RG no padrão 00.000.000-0 (com suporte a órgão emissor) */
export const formatRG = (value: string | null | undefined): string => {
  if (!value) return '';
  const partes = value.trim().split(/\s+/, 2);
  const numeros = (partes[0] || '').replace(/\D/g, '').slice(0, 9);
  let rgFormatado = numeros;
  if (numeros.length > 2 && numeros.length <= 5) {
    rgFormatado = `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  } else if (numeros.length > 5 && numeros.length <= 8) {
    rgFormatado = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
  } else if (numeros.length > 8) {
    rgFormatado = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}-${numeros.slice(8)}`;
  }
  const orgaoEmissor = partes[1] ? ` ${partes[1].toUpperCase()}` : '';
  return `${rgFormatado}${orgaoEmissor}`.trim();
};

/** Formata telefone brasileiro fixo ou celular. */
export const formatTelefone = (value: string | null | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const tamanhoLocal = digits.length >= 11 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 2 + tamanhoLocal)}-${digits.slice(2 + tamanhoLocal)}`;
};

/** Formata CEP no padrão 00000-000 */
export const formatCEP = (value: string | null | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

/** Formata Moeda em BRL */
export const formatMoedaBRL = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
