/**
 * Modelo de domínio derivado de DocumentoExigido em
 * apps/frontend/src/data/programasApoio.ts. Não é um esquema confirmado de
 * persistência: colunas, chaves e relações da tabela física seguem pendentes.
 */
export const DOCUMENTOEXIGIDO_TABLE = 'documentoexigido' as const;

export type StatusDocumentoExigido = 'concluido' | 'pendente' | 'em_andamento';

export interface AcaoEmailDocumento {
  email: string;
  label: string;
}

/** Campos de domínio/UI atuais; não presumir que todos sejam colunas do banco. */
export interface DocumentoExigido {
  id: string;
  label: string;
  descricao?: string;
  tipo: 'gerado' | 'upload' | 'externo' | 'aceite';
  obrigatorio: boolean;
  condicao?: string;
  acaoEmail?: AcaoEmailDocumento;
  url_template?: string;
  documentoId?: string;
  status?: StatusDocumentoExigido;
  onAbrirLink?: () => void | Promise<void>;
  linkTexto?: string;
}

/**
 * Propriedades possivelmente persistíveis a validar: id, label, descricao,
 * tipo, obrigatorio, condicao, url_template e documentoId.
 * Propriedades de interface/comportamento: acaoEmail, status, onAbrirLink,
 * linkTexto. A confirmação depende do esquema de origem.
 */
