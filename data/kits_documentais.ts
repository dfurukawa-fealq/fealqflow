/**
 * Esquema proposto para kits documentais vinculados a formulários.
 * Um formulário pode não ter kits ou possuir vários; cada kit pertence a um formulário.
 */
export const KITS_DOCUMENTAIS_TABLE = 'kits_documentais' as const;
export const KITS_DOCUMENTAIS_FORMULARIO_FK = {
  column: 'formulario_id',
  referencesTable: 'cadastros_formularios',
  referencesColumn: 'id',
  onDelete: 'CASCADE',
} as const;

export type OperadorCondicaoKit = 'equals';

/** Registro persistido em `kits_documentais`. */
export interface KitDocumentalRow {
  id: string;
  formulario_id: string;
  nome: string;
  descricao: string;
  /** Nome da resposta do formulário usada para selecionar este kit; null para kit sem condição. */
  campo_condicional: string | null;
  /** Operador de comparação da condição; null quando o kit não depende de resposta. */
  operador_condicional: OperadorCondicaoKit | null;
  /** Valor esperado da resposta, armazenado como texto para suportar campos string/boolean. */
  valor_condicional: string | null;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export const KITS_DOCUMENTAIS_COLUMNS = [
  'id',
  'formulario_id',
  'nome',
  'descricao',
  'campo_condicional',
  'operador_condicional',
  'valor_condicional',
  'ordem',
  'ativo',
  'criado_em',
  'atualizado_em',
] as const satisfies readonly (keyof KitDocumentalRow)[];

/**
 * Regra: campo_condicional, operador_condicional e valor_condicional devem ser
 * preenchidos juntos ou ficar todos nulos. Um formulário pode existir sem kits.
 */
