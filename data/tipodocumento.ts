/**
 * Referência de domínio derivada de TipoDocumento em
 * apps/frontend/src/data/programasApoio.ts. Colunas/chaves da tabela física
 * `tipodocumento` ainda não foram confirmadas.
 */
export const TIPODOCUMENTO_TABLE = 'tipodocumento' as const;

export const TIPOS_DOCUMENTO = ['gerado', 'upload', 'externo', 'aceite'] as const;

export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];
