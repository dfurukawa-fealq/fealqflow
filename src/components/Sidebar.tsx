import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Início', icon: 'home' },
    { path: '/projetos', label: 'Projetos', icon: 'folder' },
    { path: '/programas', label: 'Programas de Apoio', icon: 'handshake' },
    { path: '/historico', label: 'Histórico & Pendências', icon: 'history' },
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
      <div className="flex-1 flex flex-col mt-md">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'flex items-center space-x-md px-xl py-md transition-colors hover:bg-white/5',
              location.pathname === item.path
                ? 'border-l-2 border-secondary-fixed bg-white/10 text-white font-bold'
                : 'text-surface-variant/70'
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
        ))}
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
