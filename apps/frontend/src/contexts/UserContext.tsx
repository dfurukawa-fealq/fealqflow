import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface UsuarioAutenticado {
  id: string;
  username: string;
  role: 'admin' | 'user';
  perfil: 'admin' | 'projeto' | 'prog_apoio';
  tenant: 'global' | 'projeto' | 'prog_apoio';
}

interface UserContextData {
  usuario: UsuarioAutenticado | null;
  carregando: boolean;
  login: (username: string, password: string) => Promise<UsuarioAutenticado>;
  logout: () => Promise<void>;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>;
  isAdmin: boolean;
  podeAcessar: (area: 'projeto' | 'apoio') => boolean;
}

const UserContext = createContext<UserContextData | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarSessao = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Não foi possível consultar a sessão.');
      const resultado = await response.json() as { user: UsuarioAutenticado | null };
      setUsuario(resultado.user);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const resultado = await response.json().catch(() => ({})) as { user?: UsuarioAutenticado; error?: string };
    if (!response.ok || !resultado.user) throw new Error(resultado.error || 'Não foi possível entrar.');
    setUsuario(resultado.user);
    return resultado.user;
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Não foi possível encerrar a sessão.');
    setUsuario(null);
  }, []);

  const alterarSenha = useCallback(async (senhaAtual: string, novaSenha: string) => {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    const resultado = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(resultado.error || 'Não foi possível alterar a senha.');
  }, []);

  const isAdmin = usuario?.perfil === 'admin' || usuario?.role === 'admin' || usuario?.tenant === 'global';
  const podeAcessar = useCallback((area: 'projeto' | 'apoio') => {
    if (!usuario) return true;
    if (isAdmin) return true;
    return usuario.tenant === area || usuario.perfil === (area === 'projeto' ? 'projeto' : 'prog_apoio');
  }, [isAdmin, usuario]);
  const value = useMemo(() => ({ usuario, carregando, login, logout, alterarSenha, isAdmin, podeAcessar }), [usuario, carregando, login, logout, alterarSenha, isAdmin, podeAcessar]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser deve ser usado dentro de UserProvider.');
  return context;
};
