import { FormEvent, useEffect, useState } from 'react';
import { GestaoLayout } from './GestaoLayout';

interface UsuarioAdmin { id: string; username: string; role: 'admin' | 'user'; is_active: boolean; last_login_at: string | null; }

export const GestaoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [erro, setErro] = useState('');

  const carregar = async () => {
    const resposta = await fetch('/api/usuarios', { credentials: 'same-origin' });
    if (!resposta.ok) throw new Error('Não foi possível carregar os usuários.');
    setUsuarios(await resposta.json() as UsuarioAdmin[]);
  };

  useEffect(() => { void carregar().catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Falha ao carregar usuários.')); }, []);

  const limpar = () => { setEditando(null); setUsername(''); setPassword(''); setRole('user'); };
  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); setErro('');
    const resposta = await fetch(editando ? `/api/usuarios/${editando.id}` : '/api/usuarios', {
      method: editando ? 'PUT' : 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, is_active: editando?.is_active ?? true }),
    });
    const resultado = await resposta.json().catch(() => ({})) as { error?: string };
    if (!resposta.ok) { setErro(resultado.error || 'Não foi possível salvar o usuário.'); return; }
    limpar(); await carregar();
  };

  const editar = (usuario: UsuarioAdmin) => { setEditando(usuario); setUsername(usuario.username); setRole(usuario.role); setPassword(''); };

  return <GestaoLayout title="Gestão de Usuários" description="Crie, edite e atualize os acessos ao FealqFlow.">
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-on-surface">Usuários</h2><button type="button" onClick={limpar} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"><span className="material-symbols-outlined text-[18px]">add</span>Novo usuário</button></div>
      {erro && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
      {(editando || username === '') && <form onSubmit={(evento) => void salvar(evento)} className="mt-5 grid gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-4">
        <label className="text-sm font-semibold text-on-surface">Usuário<input required value={username} onChange={(evento) => setUsername(evento.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-on-surface">Senha {editando && <span className="font-normal text-on-surface-variant">(opcional)</span>}<input required={!editando} minLength={12} type="password" value={password} onChange={(evento) => setPassword(evento.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-on-surface">Perfil<select value={role} onChange={(evento) => setRole(evento.target.value as 'admin' | 'user')} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal"><option value="user">Usuário</option><option value="admin">Administrador</option></select></label>
        <div className="flex items-end gap-2"><button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary" type="submit">{editando ? 'Atualizar' : 'Criar'}</button>{editando && <button type="button" onClick={limpar} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button>}</div>
      </form>}
      <div className="mt-6 overflow-x-auto rounded-xl border border-outline-variant"><table className="w-full text-left text-sm"><thead className="bg-surface-variant"><tr><th className="p-4">Usuário</th><th className="p-4">Perfil</th><th className="p-4">Status</th><th className="p-4">Último acesso</th><th className="p-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-outline-variant bg-surface-container-lowest">{usuarios.map((usuario) => <tr key={usuario.id}><td className="p-4 font-medium">{usuario.username}</td><td className="p-4">{usuario.role === 'admin' ? 'Administrador' : 'Usuário'}</td><td className="p-4">{usuario.is_active ? 'Ativo' : 'Inativo'}</td><td className="p-4">{usuario.last_login_at ? new Date(usuario.last_login_at).toLocaleString('pt-BR') : 'Nunca acessou'}</td><td className="p-4 text-right"><button type="button" onClick={() => editar(usuario)} className="p-2 text-primary" title="Editar"><span className="material-symbols-outlined">edit</span></button></td></tr>)}</tbody></table></div>
    </section>
  </GestaoLayout>;
};
