import tiposEvento from './tipos_evento.json';

/** Catalogo oficial compartilhado com os formularios. */
export const TIPOS_EVENTO_TABLE = 'tipos_evento' as const;
export const TIPOS_EVENTO: readonly string[] = tiposEvento;
export type TipoEvento = typeof TIPOS_EVENTO[number];
