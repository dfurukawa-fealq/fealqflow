/**
 * Valores de domínio copiados de apps/frontend/src/data/listas.ts.
 * A definição de colunas e chave da tabela `unidades_usp` ainda não foi fornecida.
 */
export const UNIDADES_USP_TABLE = 'unidades_usp' as const;

export const UNIDADES_USP = [
  'ESALQ', 'CENA', 'FZEA', 'EACH', 'ECA', 'FAU', 'FCF', 'FD', 'FEA', 'FEARP',
  'FFLCH', 'FMVZ', 'FOB', 'FMRP', 'FSP', 'IAG', 'IB', 'ICB', 'ICMC', 'IEA',
  'IEE', 'IF', 'IGC', 'IME', 'IO', 'IP', 'IQ', 'IRI', 'IAC', 'Museu Paulista',
  'Museu de Zoologia', 'Outro',
] as const;

export type UnidadeUSP = typeof UNIDADES_USP[number];
