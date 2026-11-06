import { PROGRAMAS_APOIO } from './programasApoio';
import { PROJETOS } from './projetos';
import type { DefinicaoFormulario } from './tiposFormularios';

const programasComoDefinicoes: DefinicaoFormulario[] = PROGRAMAS_APOIO.map((programa) => ({
  id: programa.id,
  slug: programa.path.split('/').filter(Boolean).pop() || programa.id,
  titulo: programa.titulo,
  area: 'Programa de Apoio',
  origem: 'arquivo',
  versao: 1,
  componente: programa.id,
  habilitado: true,
  icone: programa.icone,
  requisito: `${programa.documentos.filter((documento) => documento.obrigatorio).length} documento(s) obrigatório(s)`,
  linha: programa.linha,
  normas: programa.normas,
  documentos: programa.documentos,
  periodosSubmissao: programa.periodosSubmissao,
}));

export const CATALOGO_FORMULARIOS: DefinicaoFormulario[] = [...PROJETOS, ...programasComoDefinicoes];
export const buscarFormularioPorSlug = (slug: string): DefinicaoFormulario | undefined => CATALOGO_FORMULARIOS.find((formulario) => formulario.slug === slug);
