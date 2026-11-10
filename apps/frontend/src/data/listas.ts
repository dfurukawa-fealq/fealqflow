/** Listas compartilhadas pelos formulários do FealqFlow. */
export const TIPOS_EVENTO = [
  'Conferencia',
  'Congresso',
  'Curso',
  'Debate',
  'Encontro',
  'Estagio',
  'Exposicao',
  'Feira',
  'Forum',
  'Jornada',
  'Mesa',
  'Oficina',
  'Palestra',
  'Participacao',
  'Programa',
  'Reuniao',
  'Semanal',
] as const;

export type TipoEvento = typeof TIPOS_EVENTO[number];

export const UNIDADES_USP = [
  'ESALQ', 'CENA', 'FZEA', 'EACH', 'ECA', 'FAU', 'FCF', 'FD', 'FEA', 'FEARP',
  'FFLCH', 'FMVZ', 'FOB', 'FMRP', 'FSP', 'IAG', 'IB', 'ICB', 'ICMC', 'IEA',
  'IEE', 'IF', 'IGC', 'IME', 'IO', 'IP', 'IQ', 'IRI', 'IAC', 'Museu Paulista',
  'Museu de Zoologia', 'Outro',
] as const;

export type UnidadeUSP = typeof UNIDADES_USP[number];
