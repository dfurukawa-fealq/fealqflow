import { ReactNode, useState } from 'react';

interface FormSectionProps {
  /** Número exibido antes do título ("1. Dados do Financiador"). Aceita 0. */
  numero?: number;
  /** Nome do Material Symbol exibido à esquerda do título. */
  icone: string;
  titulo: string;
  /** Ação opcional no canto direito do cabeçalho (selo, botão). */
  acao?: ReactNode;
  /** Conteúdo livre, fora da grade de 12 colunas (tabelas, listas). */
  livre?: boolean;
  /** Permite recolher a seção clicando no cabeçalho. */
  colapsavel?: boolean;
  /** Estado inicial quando `colapsavel`. Padrão: recolhida. */
  aberto?: boolean;
  children: ReactNode;
}

/**
 * Card de seção no padrão do Cadastro de Financiadora. O corpo é uma
 * grade de 12 colunas — os `Field` se posicionam com a prop `span`.
 * Use `livre` para conteúdo que não é campo (tabelas, checklists).
 */
export const FormSection = ({
  numero,
  icone,
  titulo,
  acao,
  livre = false,
  colapsavel = false,
  aberto = false,
  children,
}: FormSectionProps) => {
  const [expandido, setExpandido] = useState(aberto);
  const visivel = !colapsavel || expandido;

  const cabecalho = (
    <div className="flex w-full items-center justify-between gap-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-y-1 gap-x-6 flex-1 min-w-0 text-left">
        <div className="flex items-center gap-sm min-w-0">
          <span className="material-symbols-outlined text-primary-container shrink-0">
            {icone}
          </span>
          <h2 className="text-[16px] font-semibold text-primary-container leading-tight">
            {numero !== undefined ? `${numero}. ` : ''}
            {titulo}
          </h2>
        </div>
        {acao && (
          <div className="pl-[32px] sm:pl-0 shrink-0">
            {acao}
          </div>
        )}
      </div>
      
      {colapsavel && (
        <div className="shrink-0 ml-xs">
          <span
            className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${
              expandido ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      )}
    </div>
  );

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-lg">
      {colapsavel ? (
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          aria-expanded={expandido}
          className={`w-full flex text-left ${
            visivel ? 'mb-md pb-xs border-b border-surface-variant' : ''
          }`}
        >
          {cabecalho}
        </button>
      ) : (
        <div className={`w-full flex text-left ${
            visivel ? 'mb-md pb-xs border-b border-surface-variant' : ''
          }`}>
          {cabecalho}
        </div>
      )}

      {visivel && (
        <div className={livre ? '' : 'grid grid-cols-12 gap-md'}>{children}</div>
      )}
    </section>
  );
};
