/** Esquema da tabela normalizada de documentos de cadastro (migração 014). */
export const CADASTRO_DOCUMENTOS_TABLE = 'cadastro_documentos' as const;
/** Campos persistidos em `cadastro_documentos`. */
export interface CadastroDocumentoRow {
  id: string;
  nome: string;
  descricao: string;
  template_url: string;
  active: boolean;
  criado_em: string | null;
  atualizado_em: string | null;
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
