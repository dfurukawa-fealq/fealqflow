/** Esquema proposto para os documentos pertencentes a cada kit documental. */
export const ITENS_KIT_DOCUMENTAL_TABLE = 'itens_kit_documental' as const;
export const ITENS_KIT_DOCUMENTAL_KIT_FK = {
  column: 'kit_id',
  referencesTable: 'kits_documentais',
  referencesColumn: 'id',
  onDelete: 'CASCADE',
} as const;
export const ITENS_KIT_DOCUMENTAL_DOCUMENTO_FK = {
  column: 'cadastro_documento_id',
  referencesTable: 'cadastro_documentos',
  referencesColumn: 'id',
  nullable: true,
  onDelete: 'SET NULL',
} as const;

export type TipoItemKitDocumental = 'gerado' | 'upload' | 'externo' | 'aceite';
export type OperadorCondicaoItemKit = 'equals';

export interface AcaoEmailItemKit {
  email: string;
  label: string;
}

/** Registro persistido em `itens_kit_documental`. */
export interface ItemKitDocumentalRow {
  id: string;
  kit_id: string;
  /** Referência opcional ao catálogo; pode ser nula para item criado diretamente no kit. */
  cadastro_documento_id?: string | null;
  identificador: string;
  titulo: string;
  descricao: string;
  tipo: TipoItemKitDocumental;
  obrigatorio: boolean;
  url_template?: string;
  /** Orientação textual para itens opcionais ou aplicáveis somente em determinados casos. */
  observacao_condicional?: string;
  /** Ação de contato para documentos encaminhados diretamente por uma área externa. */
  acao_email?: AcaoEmailItemKit;
  campo_condicional?: string | null;
  operador_condicional?: OperadorCondicaoItemKit | null;
  valor_condicional?: string | null;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export const ITENS_KIT_DOCUMENTAL_COLUMNS = [
  'id',
  'kit_id',
  'cadastro_documento_id',
  'identificador',
  'titulo',
  'descricao',
  'tipo',
  'obrigatorio',
  'url_template',
  'observacao_condicional',
  'acao_email',
  'campo_condicional',
  'operador_condicional',
  'valor_condicional',
  'ordem',
  'ativo',
  'criado_em',
  'atualizado_em',
] as const satisfies readonly (keyof ItemKitDocumentalRow)[];
