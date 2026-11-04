import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  // Active checks
  const isProjetosPainelActive =
    path === '/projetos/painel' || path === '/projetos/solicitacoes';
  const isProjetosFormsActive =
    (path === '/projetos' || path.startsWith('/projetos/form-') || path.startsWith('/projetos/termo-') || path.startsWith('/projetos/orientacoes') || path.startsWith('/projetos/ciencia')) &&
    !isProjetosPainelActive;

  const isApoioPainelActive =
    path === '/programas-de-apoio/painel' ||
    path === '/programas-de-apoio/solicitacoes' ||
    path === '/';
  const isApoioFormsActive =
    (path === '/programas-de-apoio' || path.startsWith('/programas-de-apoio/apoio-') || path === '/programas') &&
    !isApoioPainelActive;

  const isHistoricoActive = path === '/historico';

  return (
    <nav className="bg-primary text-secondary-fixed w-sidebar-width h-screen fixed left-0 top-0 flex flex-col z-50 select-none">
      {/* Brand Header */}
      <div className="p-xl flex items-center space-x-md border-b border-white/10 mb-2">
        <div className="w-10 h-10 rounded-full bg-surface/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-secondary-fixed">
            person
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-lg text-secondary-fixed truncate">
            FealqFlow
          </div>
          <div className="text-xs text-surface-variant/70 truncate">
            Coordenador
          </div>
        </div>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 flex flex-col overflow-y-auto py-2">
        {/* SECTION 1: PROJETOS */}
        <div className="mb-4">
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Projetos
          </div>

          <Link
            to="/projetos/painel"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              isProjetosPainelActive
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined text-lg',
                isProjetosPainelActive ? 'fill-icon' : ''
              )}
            >
              dashboard
            </span>
            <span>Painel de Solicitações</span>
          </Link>

          <Link
            to="/projetos"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              isProjetosFormsActive
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined text-lg',
                isProjetosFormsActive ? 'fill-icon' : ''
              )}
            >
              description
            </span>
            <span>Formulários</span>
          </Link>
        </div>

        {/* SECTION 2: PROGRAMAS DE APOIO */}
        <div className="mb-4">
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Programas de Apoio
          </div>

          <Link
            to="/programas-de-apoio/painel"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              isApoioPainelActive
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined text-lg',
                isApoioPainelActive ? 'fill-icon' : ''
              )}
            >
              assignment_turned_in
            </span>
            <span>Painel de Solicitações</span>
          </Link>

          <Link
            to="/programas-de-apoio"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              isApoioFormsActive
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined text-lg',
                isApoioFormsActive ? 'fill-icon' : ''
              )}
            >
              handshake
            </span>
            <span>Formulários</span>
          </Link>
        </div>

        <div className="mb-4">
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Cadastros
          </div>
          <Link
            to="/admin/formularios"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              path === '/admin/formularios'
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span className="material-symbols-outlined text-lg">app_registration</span>
            <span>Formulários</span>
          </Link>
        </div>

        {/* SECTION 4: HISTÓRICO & PENDÊNCIAS */}
        <div className="mb-2">
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Histórico & Pendências
          </div>

          <Link
            to="/historico"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              isHistoricoActive
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined text-lg',
                isHistoricoActive ? 'fill-icon' : ''
              )}
            >
              history
            </span>
            <span>Histórico & Pendências</span>
          </Link>
        </div>
      </div>

      {/* Footer Support Link */}
      <div className="mt-auto pb-xl border-t border-white/10 pt-2">
        <a
          className="flex items-center space-x-3 px-xl py-2.5 text-surface-variant/70 hover:text-white hover:bg-white/5 transition-colors text-sm"
          href="#"
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Ajuda & Suporte</span>
        </a>
      </div>
    </nav>
  );
};
