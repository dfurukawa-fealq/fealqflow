import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

type Area = 'projeto' | 'apoio';

export const RequireArea = ({ area, children }: { area: Area; children: ReactNode }) => {
  const { usuario, carregando, podeAcessar } = useUser();
  const location = useLocation();

  if (carregando) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600" role="status">Verificando escopo de acesso...</div>;
  if (!podeAcessar(area)) {
    const destino = usuario?.perfil === 'prog_apoio' ? '/programas-de-apoio' : '/projetos';
    return <Navigate to={destino} replace state={{ from: location }} />;
  }
  return children;
};
