import { createContext, useContext } from 'react';

interface EnvioContextValue {
  /**
   * Informa ao layout quantos documentos obrigatórios ainda faltam.
   * Zero libera o botão de envio do rodapé.
   */
  registrarPendencias: (quantidade: number) => void;
  formulario?: { id: string; titulo: string; validado: boolean };
  registrarPersistenciaFormulario: (persistir: (validado: boolean) => Promise<void>) => void;
  confirmarFormulario: (validado: boolean) => Promise<void>;
}

/** Sem provider (páginas fora do FormPageLayout), vira um no-op. */
export const EnvioContext = createContext<EnvioContextValue>({
  registrarPendencias: () => {},
  registrarPersistenciaFormulario: () => {},
  confirmarFormulario: async () => {},
});

export const useEnvio = () => useContext(EnvioContext);
