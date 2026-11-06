import type { DocumentoExigido, PeriodoSubmissao } from './programasApoio';

export type OrigemFormulario = 'arquivo' | 'database';
export type AreaFormulario = 'Projetos' | 'Programa de Apoio';

export interface DefinicaoFormulario {
  id: string;
  slug: string;
  titulo: string;
  area: AreaFormulario;
  origem: OrigemFormulario;
  versao: number;
  componente: string;
  habilitado: boolean;
  icone: string;
  requisito: string;
  linha?: string;
  normas?: string;
  documentos: DocumentoExigido[];
  periodosSubmissao?: PeriodoSubmissao[];
}
