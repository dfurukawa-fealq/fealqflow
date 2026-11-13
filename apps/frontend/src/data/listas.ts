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

import unidadesUsp from '../../../../data/unidades_usp.json';

export const UNIDADES_USP = unidadesUsp.filter((unidade) => unidade.active);
export const UNIDADES_USP_SIGLAS = UNIDADES_USP.map((unidade) => unidade.sigla);
export const UNIDADES_USP_OPCOES = UNIDADES_USP.map((unidade) => ({ value: unidade.sigla, label: `${unidade.sigla} - ${unidade.descricao}` }));

export type UnidadeUSP = typeof UNIDADES_USP[number]['sigla'];
