import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { EnvioContext } from './EnvioContext';

export interface FormPageLayoutProps {
  /** Trilha completa, incluindo a página atual: ['Área do Coordenador', 'Auxílio Viagem'] */
  breadcrumb: string[];
  titulo: string;
  /** Código oficial do formulário, ex. 'CONV-FR-03-CADT'. */
  codigo?: string;
  /** Selo ao lado do título, ex. 'Novo' ou 'Rascunho'. */
  badge?: string;
  /** Faixa de aviso exibida acima do conteúdo. */
  alerta?: ReactNode;
  /** Texto do botão principal, ex. 'Enviar Solicitação'. */
  acaoPrincipal: string;
  acaoIcone?: string;
  mostrarRascunho?: boolean;
  botoesAcoes?: ReactNode;
  footerCenter?: ReactNode;
  /** Permite forçar a liberação ou bloqueio do envio (ignora contagem de pendências do Kit Documental) */
  podeEnviar?: boolean;
  /** Coluna direita (4/12). Sem ela o conteúdo ocupa as 12 colunas. */
  sidebar?: ReactNode;
  children: ReactNode;
}

/**
 * Estrutura padrão de todas as páginas de formulário: barra superior,
 * bloco de título com breadcrumb e código, grade 8/4 e rodapé fixo
 * de ações. Modelo: Cadastro de Financiadora (/form-financiadora).
 */
export const FormPageLayout = ({
  breadcrumb,
  titulo,
  codigo,
  badge,
  alerta,
  acaoPrincipal,
  acaoIcone = 'send',
  mostrarRascunho = true,
  botoesAcoes,
  footerCenter,
  sidebar,
  podeEnviar,
  children,
}: FormPageLayoutProps) => {
  const navigate = useNavigate();

  // null = a página não tem Kit Documental; o envio segue bloqueado se podeEnviar não for informado.
  const [pendencias, setPendencias] = useState<number | null>(null);
  const registrarPendencias = useCallback(
    (quantidade: number) => setPendencias(quantidade),
    [],
  );
  const envio = useMemo(() => ({ registrarPendencias }), [registrarPendencias]);
  const liberado = podeEnviar !== undefined ? podeEnviar : pendencias === 0;

  return (
    <EnvioContext.Provider value={envio}>
      <div className="flex-1 flex flex-col min-h-screen bg-background print:bg-white print:text-black">
        <div className="print:hidden">
          <TopBar />
        </div>

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-xl py-lg pb-[80px] print:pb-0 print:px-0">
          <div className="print:hidden">
            {alerta}
          </div>

          <div className="mb-lg border-b border-outline-variant pb-sm">
            <div>
              <div className="flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">
                <span className="material-symbols-outlined text-[14px]">
                  home
                </span>
                {breadcrumb.map((item, i) => (
                  <span key={item} className="flex items-center gap-xs">
                    {i > 0 && (
                      <span className="material-symbols-outlined text-[14px]">
                        chevron_right
                      </span>
                    )}
                    <span
                      className={
                        i === breadcrumb.length - 1
                          ? 'text-primary font-bold'
                          : undefined
                      }
                    >
                      {item}
                    </span>
                  </span>
                ))}
              </div>
              <h1 className="text-[20px] text-on-surface font-bold flex items-center flex-wrap gap-sm">
                {titulo}
                {codigo && (
                  <span className="text-on-surface-variant text-[12px] font-normal">
                    ({codigo})
                  </span>
                )}
                {badge && (
                  <span className="px-xs py-[2px] bg-surface-container-high border border-outline-variant rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                    {badge}
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start print:block">
            <div
              className={`flex flex-col gap-lg print:col-span-12 print:block ${
                sidebar ? 'lg:col-span-8' : 'lg:col-span-12'
              }`}
            >
              {children}
            </div>
            {sidebar && (
              <div className="lg:col-span-4 flex flex-col gap-lg print:hidden">{sidebar}</div>
            )}
          </div>
        </main>

        <footer className="fixed bottom-0 left-sidebar-width right-0 bg-surface-container-lowest border-t border-outline-variant p-md px-xl flex justify-between items-center gap-md z-30 print:hidden">
          <div className="flex items-center gap-md flex-1">
            <button
              onClick={() => navigate(-1)}
              className="px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
            {footerCenter && (
              <div className="flex-1 px-md flex justify-end">
                {footerCenter}
              </div>
            )}
          </div>
          <div className="flex items-center gap-sm">
            {botoesAcoes}
            {mostrarRascunho && (
              <button className="px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors">
                Salvar Rascunho
              </button>
            )}
            <button
              disabled={!liberado}
              title={
                liberado
                  ? undefined
                  : pendencias === null
                    ? 'Preencha os campos obrigatórios para liberar o envio.'
                    : `Faltam ${pendencias} documento(s) obrigatório(s) no Kit de Documentos.`
              }
              className={`px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors ${
                liberado
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              }`}
            >
              {acaoPrincipal}
              <span className="material-symbols-outlined text-[18px]">
                {acaoIcone}
              </span>
            </button>
          </div>
        </footer>
      </div>
    </EnvioContext.Provider>
  );
};
