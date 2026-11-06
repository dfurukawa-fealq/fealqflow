import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export const RequireSessao = ({ children }: { children: ReactNode }) => {
  const { usuario, carregando } = useUser();
  const location = useLocation();
  if (carregando) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600" role="status">Verificando autenticação...</div>;
  if (!usuario) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return children;
};
