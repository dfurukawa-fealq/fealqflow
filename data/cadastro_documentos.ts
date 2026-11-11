/**
 * Esquema desejado para a tabela de documentos de cadastro.
 * A migração 008 ainda cria a tabela física `documentos_cadastro`.
 * A tabela foi informada como vazia; o rename físico fica para migração futura.
 */
export const CADASTRO_DOCUMENTOS_TABLE = 'cadastro_documentos' as const;
export const CADASTRO_DOCUMENTOS_CURRENT_TABLE = 'documentos_cadastro' as const;

/** Campos persistidos atualmente definidos em `documentos_cadastro`. */
export interface CadastroDocumentoRow {
  id: string;
  nome: string;
  descricao: string;
  template_url: string;
  active: boolean;
  criado_em: string;
  atualizado_em: string;
}

export const CADASTRO_DOCUMENTOS_COLUMNS = [
  'id',
  'nome',
  'descricao',
  'template_url',
  'active',
  'criado_em',
  'atualizado_em',
] as const satisfies readonly (keyof CadastroDocumentoRow)[];
