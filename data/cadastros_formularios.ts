/** Esquema normalizado conforme migrations/014_normalizar_kits_documentais.mjs. */
export const CADASTROS_FORMULARIOS_TABLE = 'cadastros_formularios' as const;

export type AreaFormulario = 'Projetos' | 'Programa de Apoio';
export type TipoCadastroFormulario = 'formulario' | 'documento';
export type StatusFormulario = 'Aberto' | 'Fechado';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Representação dos campos persistidos em `cadastros_formularios`. */
export interface CadastroFormularioRow {
  id: string;
  nome: string;
  tipo: AreaFormulario;
  tipo_cadastro: TipoCadastroFormulario;
  linha_apoio_id: string;
  status: StatusFormulario;
  normas: string;
  periodos_submissao: JsonValue[];
  active: boolean;
  habilitado: boolean;
  nseq: number;
  criado_em: string;
  atualizado_em: string;
  dados_legados: { [key: string]: JsonValue };
}

export const CADASTROS_FORMULARIOS_COLUMNS = [
  'id',
  'nome',
  'tipo',
  'tipo_cadastro',
  'linha_apoio_id',
  'status',
  'normas',
  'periodos_submissao',
  'active',
  'habilitado',
  'nseq',
  'criado_em',
  'atualizado_em',
  'dados_legados',
] as const satisfies readonly (keyof CadastroFormularioRow)[];
