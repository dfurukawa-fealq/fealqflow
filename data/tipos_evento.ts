/**
 * Valores de domínio copiados de apps/frontend/src/data/listas.ts.
 * A definição de colunas e chave da tabela `tipos_evento` ainda não foi fornecida.
 */
export const TIPOS_EVENTO_TABLE = 'tipos_evento' as const;

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
