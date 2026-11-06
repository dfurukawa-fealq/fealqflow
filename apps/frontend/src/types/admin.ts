export interface LinhaApoio {
  id: string;
  nome: string;
  active?: boolean;
}

export interface PeriodoSubmissao {
  id: string;
  dataInicio: string; // formato AAAA-MM-DD
  horaInicio: string; // formato HH:mm
  dataFim: string; // formato AAAA-MM-DD
  horaFim: string; // formato HH:mm
  status: 'Aberto' | 'Fechado';
}

export interface DocumentoSolicitadoAdmin {
  id: string;
  nome: string;
  tipo?: 'Documento' | 'FormulÃ¡rio' | 'Formulário';
  documentoId?: string;
  referenciaTipo?: 'url' | 'documento';
  obrigatorio?: boolean;
  info?: string;
  url_template?: string;
}

export interface DocumentoCadastro {
  id: string;
  nome: string;
  descricao: string;
  template_url: string;
  active?: boolean;
  nSeq?: number;
  area?: 'Projetos' | 'Programa de Apoio';
}

export interface FormularioApoio {
  id: string;
  nome: string;
  area: 'Projetos' | 'Programa de Apoio';
  tipo: 'Formulário' | 'FormulÃ¡rio' | 'Documento';
  linhaApoioId: string;
  status: 'Aberto' | 'Fechado';
  periodosSubmissao: PeriodoSubmissao[];
  normas: string;
  documentosSolicitados: DocumentoSolicitadoAdmin[];
  documentoIds?: string[];
  active?: boolean;
  habilitado?: boolean;
  nSeq?: number;
}

export interface Orcamento {
  id: string;
  formularioId: string;
  ano: number;
  valorGlobal: number;
  tetoPorPedido: number;
  active?: boolean;
}

export type TipoMovimentacao = 'Aporte' | 'Reducao' | 'Transferencia';

export interface MovimentacaoOrcamentaria {
  id: string;
  data: string; // ISO format or DD/MM/AAAA
  tipo: TipoMovimentacao;
  valor: number;
  orcamentoOrigemId?: string; // used for Reducao and Transferencia
  orcamentoDestinoId?: string; // used for Aporte and Transferencia
  justificativa: string;
  active?: boolean;
}
