import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';

export const Sidebar = () => {
  const location = useLocation();

  const [isAdminOpen, setIsAdminOpen] = useState(location.pathname.startsWith('/admin'));
  const navItems = [
    { path: '/', label: 'Início', icon: 'home' },
    { path: '/programas', label: 'Programas de Apoio', icon: 'handshake' },
    { path: '/historico', label: 'Histórico & Pendências', icon: 'history' },
    { 
      path: '/admin', 
      label: 'Gestão de Programas', 
      icon: 'settings',
      subItems: [
        { path: '/admin/programas', label: 'Dashboard' },
        { path: '/admin/programas/linhas', label: 'Linhas de Apoio' },
        { path: '/admin/programas/formularios', label: 'Formulários (Auxílios)' },
        { path: '/admin/programas/orcamentos', label: 'Orçamentos' },
        { path: '/admin/programas/movimentacoes', label: 'Movimentações Orçamentárias' }
      ]
    },
  ];

  return (
    <nav className="bg-primary text-secondary-fixed w-sidebar-width h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-xl flex items-center space-x-md border-b border-white/10 mb-md">
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

      <div className="flex-1 flex flex-col mt-md overflow-y-auto">
        {navItems.map((item) => {
          if (item.subItems) {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <div key={item.path} className="flex flex-col">
                <button
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className={clsx(
                    'flex items-center space-x-md px-xl py-md transition-colors hover:bg-white/5 w-full text-left',
                    isActive
                      ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                      : 'text-surface-variant/70 border-l-2 border-transparent'
                  )}
                >
                  <span
                    className={clsx(
                      'material-symbols-outlined',
                      isActive ? 'fill-icon' : ''
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <span className="material-symbols-outlined text-sm">
                    {isAdminOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isAdminOpen && (
                  <div className="bg-primary/50 flex flex-col py-2">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={clsx(
                          'pl-[72px] pr-xl py-2 text-sm transition-colors hover:bg-white/5',
                          location.pathname === sub.path
                            ? 'text-white font-semibold'
                            : 'text-surface-variant/70'
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'flex items-center space-x-md px-xl py-md transition-colors hover:bg-white/5 border-l-2',
              location.pathname === item.path
                ? 'border-secondary-fixed bg-white/10 text-white font-bold'
                : 'border-transparent text-surface-variant/70'
            )}
          >
            <span
              className={clsx(
                'material-symbols-outlined',
                location.pathname === item.path ? 'fill-icon' : ''
              )}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        )})}
      </div>

      <div className="mt-auto pb-xl">
        <a
          className="flex items-center space-x-md px-xl py-md text-surface-variant/70 hover:text-white hover:bg-white/5 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">help</span>
          <span>Ajuda & Suporte</span>
        </a>
      </div>
    </nav>
  );
};
