import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

interface EstadoLogin {
  from?: { pathname?: string };
}

export const AdminLogin = () => {
  const { usuario, carregando, login } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const estado = location.state as EstadoLogin | null;
  const destino = estado?.from?.pathname?.startsWith('/admin/') && estado.from.pathname !== '/admin/login'
    ? estado.from.pathname
    : usuario?.perfil === 'prog_apoio' ? '/programas-de-apoio' : usuario?.perfil === 'projeto' ? '/projetos' : '/admin/formularios';

  useEffect(() => {
    if (!carregando && usuario) navigate(destino, { replace: true });
  }, [carregando, destino, navigate, usuario]);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const autenticado = await login(username, password);
      const destinoPerfil = autenticado.perfil === 'prog_apoio' ? '/programas-de-apoio' : autenticado.perfil === 'projeto' ? '/projetos' : destino;
      navigate(destinoPerfil, { replace: true });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
      setPassword('');
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-2rem)] w-full min-w-0 items-center justify-center px-4 py-10">
      <section className="mx-auto w-full min-w-0 max-w-[28rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-3xl text-slate-800" aria-hidden="true">
            admin_panel_settings
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Acesso à área FEALQ</h1>
            <p className="mt-1 text-sm text-slate-600">Entre para acessar os processos do seu perfil.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={enviar}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="admin-username">Usuário</label>
            <input
              autoComplete="username"
              autoCapitalize="none"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              id="admin-username"
              maxLength={120}
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="admin-password">Senha</label>
            <input
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            disabled={enviando || carregando}
            type="submit"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
          O acesso administrativo é separado do preenchimento público dos formulários.
        </p>
        <Link className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:underline" to="/">
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
          Voltar ao portal
        </Link>
      </section>
    </main>
  );
};
