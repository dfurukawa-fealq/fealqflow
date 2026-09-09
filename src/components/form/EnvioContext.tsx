import { createContext, useContext } from 'react';

interface EnvioContextValue {
  /**
   * Informa ao layout quantos documentos obrigatórios ainda faltam.
   */
  registrarPendencias: (quantidade: number) => void;
  
  /**
   * Indica se todos os campos obrigatórios do formulário HTML foram preenchidos
   */
  formValido: boolean;

  /**
   * Salva manualmente o rascunho no localStorage
   */
  salvarRascunho: () => void;

  /**
   * Limpa o rascunho do localStorage ao enviar o pedido
   */
  limparRascunho: () => void;

  /**
   * Notifica anexo de arquivo no Kit Documental para salvar rascunho automaticamente
   */
  notificarAnexoArquivo: (nomeArquivo: string) => void;

  /**
   * Data/Hora da última gravação de rascunho
   */
  ultimoRascunhoSalvo: string | null;
}

/** Sem provider (páginas fora do FormPageLayout), assume que o form está válido. */
export const EnvioContext = createContext<EnvioContextValue>({
  registrarPendencias: () => {},
  formValido: true,
  salvarRascunho: () => {},
  limparRascunho: () => {},
  notificarAnexoArquivo: () => {},
  ultimoRascunhoSalvo: null,
});

export const useEnvio = () => useContext(EnvioContext);
