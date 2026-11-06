import { FormEvent, useEffect, useState } from 'react';
import { GestaoLayout } from './GestaoLayout';

type Perfil = 'admin' | 'projeto' | 'prog_apoio';
interface UsuarioAdmin { id: string; username: string; role: 'admin' | 'user'; perfil: Perfil; tenant: 'global' | 'projeto' | 'prog_apoio'; is_active: boolean; last_login_at: string | null; }

const CampoSenha = ({ label, value, onChange, required = true }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) => {
  const [visivel, setVisivel] = useState(false);
  return <label className="text-sm font-semibold text-on-surface">{label}<span className="relative mt-1 block"><input required={required} minLength={12} type={visivel ? 'text' : 'password'} value={value} onChange={(evento) => onChange(evento.target.value)} className="w-full rounded-lg border border-outline-variant px-3 py-2 pr-10 font-normal" /><button type="button" onClick={() => setVisivel((estado) => !estado)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant hover:bg-surface-variant" title={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}><span className="material-symbols-outlined text-[20px]">{visivel ? 'visibility_off' : 'visibility'}</span></button></span></label>;
};

export const GestaoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [senhaUsuario, setSenhaUsuario] = useState<UsuarioAdmin | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('projeto');
  const [erro, setErro] = useState('');

  const carregar = async () => {
    const resposta = await fetch('/api/usuarios', { credentials: 'same-origin' });
    if (!resposta.ok) throw new Error('Não foi possível carregar os usuários.');
    setUsuarios(await resposta.json() as UsuarioAdmin[]);
  };
  useEffect(() => { void carregar().catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Falha ao carregar usuários.')); }, []);

  const limparFormulario = () => { setEditando(null); setFormAberto(false); setUsername(''); setPassword(''); setConfirmarPassword(''); setPerfil('projeto'); };
  const editar = (usuario: UsuarioAdmin) => { setEditando(usuario); setFormAberto(true); setUsername(usuario.username); setPerfil(usuario.perfil); setPassword(''); setConfirmarPassword(''); setErro(''); };
  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); setErro('');
    if (!editando && password !== confirmarPassword) { setErro('A confirmação de senha não corresponde.'); return; }
    const resposta = await fetch(editando ? `/api/usuarios/${editando.id}` : '/api/usuarios', { method: editando ? 'PUT' : 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: editando ? '' : password, confirmPassword: editando ? '' : confirmarPassword, role: perfil === 'admin' ? 'admin' : 'user', perfil, is_active: editando?.is_active ?? true }) });
    const resultado = await resposta.json().catch(() => ({})) as { error?: string };
    if (!resposta.ok) { setErro(resultado.error || 'Não foi possível salvar o usuário.'); return; }
    limparFormulario(); await carregar();
  };
  const alterarSenha = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); setErro('');
    if (!senhaUsuario || password !== confirmarPassword) { setErro('A confirmação de senha não corresponde.'); return; }
    const resposta = await fetch(`/api/usuarios/${senhaUsuario.id}/senha`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, confirmPassword: confirmarPassword }) });
    const resultado = await resposta.json().catch(() => ({})) as { error?: string };
    if (!resposta.ok) { setErro(resultado.error || 'Não foi possível alterar a senha.'); return; }
    setSenhaUsuario(null); setPassword(''); setConfirmarPassword('');
  };

  return <GestaoLayout title="Gestão de Usuários" description="Crie, edite e atualize os acessos ao FealqFlow.">
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-on-surface">Usuários</h2><button type="button" onClick={() => { limparFormulario(); setFormAberto(true); setErro(''); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"><span className="material-symbols-outlined text-[18px]">add</span>Novo usuário</button></div>
      {erro && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
      {formAberto && <form onSubmit={(evento) => void salvar(evento)} className="mt-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-on-surface">{editando ? 'Editar usuário' : 'Novo usuário'}</h3><button type="button" onClick={limparFormulario} className="p-1 text-on-surface-variant" title="Fechar"><span className="material-symbols-outlined">close</span></button></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-semibold text-on-surface">Usuário<input required value={username} onChange={(evento) => setUsername(evento.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal" /></label>{!editando && <CampoSenha label="Senha" value={password} onChange={setPassword} />}{!editando && <CampoSenha label="Confirmar senha" value={confirmarPassword} onChange={setConfirmarPassword} />}<label className="text-sm font-semibold text-on-surface">Perfil<select value={perfil} onChange={(evento) => setPerfil(evento.target.value as Perfil)} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal"><option value="projeto">Projetos</option><option value="prog_apoio">Programas de Apoio</option><option value="admin">Administrador</option></select></label></div><div className="mt-4 flex justify-end gap-2"><button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary" type="submit">{editando ? 'Atualizar' : 'Criar'}</button><button type="button" onClick={limparFormulario} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button></div></form>}
      {senhaUsuario && <form onSubmit={(evento) => void alterarSenha(evento)} className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-on-surface">Alterar senha: {senhaUsuario.username}</h3><button type="button" onClick={() => { setSenhaUsuario(null); setPassword(''); setConfirmarPassword(''); }} className="p-1 text-on-surface-variant" title="Fechar"><span className="material-symbols-outlined">close</span></button></div><div className="grid gap-4 md:grid-cols-2"><CampoSenha label="Nova senha" value={password} onChange={setPassword} /><CampoSenha label="Confirmar nova senha" value={confirmarPassword} onChange={setConfirmarPassword} /></div><div className="mt-4 flex justify-end"><button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary" type="submit">Salvar nova senha</button></div></form>}
      <div className="mt-6 overflow-x-auto rounded-xl border border-outline-variant"><table className="w-full text-left text-sm"><thead className="bg-surface-variant"><tr><th className="p-4">Usuário</th><th className="p-4">Perfil / tenant</th><th className="p-4">Status</th><th className="p-4">Último acesso</th><th className="p-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-outline-variant bg-surface-container-lowest">{usuarios.map((usuario) => <tr key={usuario.id}><td className="p-4 font-medium">{usuario.username}</td><td className="p-4">{usuario.perfil === 'admin' ? 'Administrador (global)' : usuario.perfil === 'projeto' ? 'Projetos' : 'Programas de Apoio'}<span className="block text-xs text-on-surface-variant">tenant: {usuario.tenant}</span></td><td className="p-4">{usuario.is_active ? 'Ativo' : 'Inativo'}</td><td className="p-4">{usuario.last_login_at ? new Date(usuario.last_login_at).toLocaleString('pt-BR') : 'Nunca acessou'}</td><td className="p-4 text-right"><button type="button" onClick={() => editar(usuario)} className="p-2 text-primary" title="Editar usuário"><span className="material-symbols-outlined">edit</span></button><button type="button" onClick={() => { setSenhaUsuario(usuario); setPassword(''); setConfirmarPassword(''); setErro(''); }} className="p-2 text-primary" title="Alterar senha"><span className="material-symbols-outlined">key</span></button></td></tr>)}</tbody></table></div>
    </section>
  </GestaoLayout>;
};
