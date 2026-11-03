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
    <>
      <div className="flex items-center gap-sm min-w-0">
        <span className="material-symbols-outlined text-primary-container">
          {icone}
        </span>
        <h2 className="text-[16px] font-semibold text-primary-container">
          {numero !== undefined ? `${numero}. ` : ''}
          {titulo}
        </h2>
      </div>
      <div className="flex items-center gap-sm shrink-0">
        {acao}
        {colapsavel && (
          <span
            className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${
              expandido ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        )}
      </div>
    </>
  );

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-lg">
      {colapsavel ? (
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          aria-expanded={expandido}
          className={`w-full flex items-center justify-between gap-sm text-left ${
            visivel ? 'mb-md pb-xs border-b border-surface-variant' : ''
          }`}
        >
          {cabecalho}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-sm mb-md pb-xs border-b border-surface-variant">
          {cabecalho}
        </div>
      )}

      {visivel && (
        <div className={livre ? '' : 'grid grid-cols-12 gap-md'}>{children}</div>
      )}
    </section>
  );
};
