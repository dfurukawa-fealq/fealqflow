export interface DadosProcesso {
  campos: Record<string, unknown>;
}

export interface DocumentoProcesso {
  id: string;
  arquivo_nome: string | null;
  status: string;
  preenchido: boolean;
  emitido: boolean;
}

export interface Processo {
  id: string;
  protocolo: string;
  categoria: 'projeto' | 'apoio';
  formulario_id: string;
  formulario_nome: string;
  formulario_rota: string;
  status: string;
  criado_em?: string;
  enviado_em?: string | null;
  dados_json: DadosProcesso;
  versao: number;
  documentos?: DocumentoProcesso[];
}

export interface ProcessoComToken extends Processo {
  token: string;
}

export interface ProcessoLocal {
  id: string;
  rota: string;
  categoria: 'projeto' | 'apoio';
  processoPaiId?: string;
}

export interface BackupProcesso {
  versao: number;
  dados: DadosProcesso;
}
