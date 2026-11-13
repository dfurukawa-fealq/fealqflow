/** Listas compartilhadas pelos formulários do FealqFlow. */
import tiposEvento from '../../../../data/tipos_evento.json';

export const TIPOS_EVENTO: readonly string[] = tiposEvento;

export type TipoEvento = typeof TIPOS_EVENTO[number];

import unidadesUsp from '../../../../data/unidades_usp.json';

export const INSTITUICOES_EXECUTORAS = unidadesUsp.filter((item) => item.categoria === 'instituicao_executora' && item.active);
export const UNIDADES_USP = INSTITUICOES_EXECUTORAS.map((unidade) => ({
  ...unidade,
  // Quando o CSV não traz sigla entre parênteses, usar o ID estável como valor técnico.
  sigla: unidade.sigla || unidade.id,
}));
export const UNIDADES_USP_SIGLAS = UNIDADES_USP.map((unidade) => unidade.sigla);
export const UNIDADES_USP_OPCOES = UNIDADES_USP.map((unidade) => ({
  value: unidade.sigla,
  label: unidade.sigla === unidade.id ? unidade.descricao : `${unidade.sigla} - ${unidade.descricao}`,
}));

export type UnidadeUSP = typeof UNIDADES_USP[number]['sigla'];
