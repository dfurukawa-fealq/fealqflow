import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useUser } from '../contexts/UserContext';

export const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { usuario, logout, isAdmin, podeAcessar } = useUser();
  const navigate = useNavigate();
  const podeProjetos = podeAcessar('projeto');
  const podeApoio = podeAcessar('apoio');

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
        <div className={clsx('mb-4', !podeProjetos && 'hidden')}>
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Projetos
          </div>

          <Link
            to="/projetos/painel"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              (!usuario || !podeProjetos) && 'hidden',
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
        <div className={clsx('mb-4', !podeApoio && 'hidden')}>
          <div className="px-xl py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Programas de Apoio
          </div>

          <Link
            to="/programas-de-apoio/painel"
            className={clsx(
              'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
              (!usuario || !podeApoio) && 'hidden',
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

        <div className={clsx('mb-4', !isAdmin && 'hidden')}>
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
          <Link to="/admin/documentos" className={clsx(
            'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
            path === '/admin/documentos'
              ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
              : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
          )}>
            <span className="material-symbols-outlined text-lg">description</span>
            <span>Documentos</span>
          </Link>
          <Link to="/admin/usuarios" className={clsx(
            'flex items-center space-x-3 px-xl py-2.5 transition-colors text-sm',
            path === '/admin/usuarios'
              ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
              : 'text-surface-variant/80 hover:bg-white/5 hover:text-white'
          )}>
            <span className="material-symbols-outlined text-lg">group</span>
            <span>Usuários</span>
          </Link>
        </div>

        {/* SECTION 4: HISTÓRICO & PENDÊNCIAS */}
        <div className={clsx('mb-2', !usuario && 'hidden')}>
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
        {usuario && <div className="px-xl py-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-lg text-secondary-fixed">account_circle</span>
            <span className="truncate">{usuario.username}</span>
          </div>
          <button type="button" onClick={() => void logout().then(() => navigate('/admin/login', { replace: true }))} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-surface-variant/70 transition-colors hover:bg-white/5 hover:text-white">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sair</span>
          </button>
        </div>}
        <Link
          className={clsx('flex items-center space-x-3 px-xl py-2.5 text-surface-variant/70 hover:text-white hover:bg-white/5 transition-colors text-sm', usuario && 'hidden')}
          to="/admin/login"
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Área FEALQ</span>
        </Link>
      </div>
    </nav>
  );
};
