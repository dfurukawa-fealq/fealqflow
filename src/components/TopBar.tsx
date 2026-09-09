import { Link } from 'react-router-dom';

/**
 * Barra superior única do sistema, no padrão compacto de 36px do
 * Cadastro de Financiadora. É `sticky` para acompanhar o fluxo da coluna
 * de conteúdo (à direita da Sidebar de 240px) sem exigir offset das páginas.
 */
export const TopBar = ({ title = '' }: { title?: string }) => {
  return (
    <header className="bg-surface border-b border-outline-variant flex justify-between items-center gap-md h-[36px] px-xl sticky top-0 z-30">
      
      {/* 1. Lado Esquerdo */}
      <div className="flex items-center gap-md min-w-0 flex-1">
      </div>

      {/* 2. Centro (Título) */}
      {title && (
        <div className="flex items-center justify-center text-[13px] font-bold text-primary truncate">
          {title}
        </div>
      )}

      {/* 3. Lado Direito (Ações / Ações do Usuário) */}
      <div className="flex items-center justify-end gap-md flex-1">
        {/* Mantido flex-1 para garantir o alinhamento central correto do título */}
      </div>  
      {/* <div className="flex items-center gap-md min-w-0">
        {title && (
          <span className="text-[13px] font-bold text-primary truncate">
            {title}
          </span>
        )}
        <div className="hidden md:flex items-center gap-sm bg-surface-container-low px-sm rounded border border-outline-variant h-[28px]">
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            className="bg-transparent border-none outline-none text-[12px] text-on-surface w-48 placeholder:text-on-surface-variant p-0"
            placeholder="Buscar..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button className="hidden lg:flex items-center gap-xs px-md h-[28px] text-on-surface-variant hover:bg-surface-container-low rounded transition-colors text-[12px]">
          <span className="material-symbols-outlined text-[18px]">
            filter_list
          </span>
          Filtrar por Unidade...
        </button>
        <Link
          to="/projetos"
          className="bg-secondary text-on-secondary px-lg h-[28px] rounded text-[13px] hover:opacity-90 transition-opacity flex items-center gap-xs shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Solicitação
        </Link>
        <div className="flex gap-xs">
          <button className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>
      </div> */}
    </header>
  );
};
