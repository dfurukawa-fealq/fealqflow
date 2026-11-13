import { FormEvent, useCallback, useEffect, useState } from 'react';
import { GestaoLayout } from './GestaoLayout';

interface UnidadeUSP { id: string; sigla: string; descricao: string; active: boolean; }

const campo = 'mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-normal text-on-surface';

export const GestaoUnidades = () => {
  const [unidades, setUnidades] = useState<UnidadeUSP[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<UnidadeUSP | null>(null);
  const [id, setId] = useState('');
  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');
  const [active, setActive] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    const resposta = await fetch('/api/admin/unidades', { credentials: 'same-origin' });
    const resultado = await resposta.json().catch(() => ({})) as UnidadeUSP[] | { error?: string };
    if (!resposta.ok) throw new Error(!Array.isArray(resultado) ? resultado.error || 'Falha ao carregar unidades.' : 'Falha ao carregar unidades.');
    setUnidades(resultado as UnidadeUSP[]);
    setCarregando(false);
  }, []);

  useEffect(() => { void carregar().catch((falha: unknown) => { setErro(falha instanceof Error ? falha.message : 'Falha ao carregar unidades.'); setCarregando(false); }); }, [carregar]);

  const limpar = () => { setAberto(false); setEditando(null); setId(''); setSigla(''); setDescricao(''); setActive(true); setErro(''); };
  const editar = (unidade: UnidadeUSP) => { setEditando(unidade); setId(unidade.id); setSigla(unidade.sigla); setDescricao(unidade.descricao); setActive(unidade.active); setAberto(true); setErro(''); };

  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErro('');
    const resposta = await fetch(editando ? `/api/unidades/${encodeURIComponent(editando.id)}` : '/api/unidades', {
      method: editando ? 'PUT' : 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id.trim(), sigla: sigla.trim(), descricao: descricao.trim(), active }),
    });
    const resultado = await resposta.json().catch(() => ({})) as { error?: string };
    if (!resposta.ok) { setErro(resultado.error || 'Não foi possível salvar a unidade.'); return; }
    await carregar();
    limpar();
  };

  const desativar = async (unidade: UnidadeUSP) => {
    if (!window.confirm(`Desativar a unidade ${unidade.sigla}?`)) return;
    const resposta = await fetch(`/api/unidades/${encodeURIComponent(unidade.id)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!resposta.ok) { const resultado = await resposta.json().catch(() => ({})) as { error?: string }; setErro(resultado.error || 'Não foi possível desativar a unidade.'); return; }
    await carregar();
  };

  return <GestaoLayout title="Unidades USP" description="Gerencie as unidades disponíveis nos formulários. As alterações são salvas no banco de dados." mostrarSincronizacao={false}>
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-on-surface">Cadastro de unidades</h2><p className="mt-1 text-sm text-on-surface-variant">{unidades.length} registro(s), incluindo unidades inativas.</p></div>
        <button type="button" onClick={() => { limpar(); setAberto(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"><span className="material-symbols-outlined text-[18px]">add</span>Nova unidade</button>
      </div>
      {erro && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
      {aberto && <form autoComplete="off" onSubmit={(evento) => void salvar(evento)} className="mt-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-on-surface">{editando ? `Editar ${editando.sigla}` : 'Nova unidade'}</h3><button type="button" onClick={limpar} className="p-1 text-on-surface-variant" aria-label="Fechar"><span className="material-symbols-outlined">close</span></button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-on-surface">ID estável<input required disabled={Boolean(editando)} maxLength={120} value={id} onChange={(evento) => setId(evento.target.value)} className={campo} placeholder="Ex.: FZEA" /></label>
          <label className="text-sm font-semibold text-on-surface">Sigla<input required maxLength={40} value={sigla} onChange={(evento) => setSigla(evento.target.value)} className={campo} placeholder="Ex.: FZEA" /></label>
          <label className="text-sm font-semibold text-on-surface md:col-span-2">Descrição<input required maxLength={240} value={descricao} onChange={(evento) => setDescricao(evento.target.value)} className={campo} placeholder="Faculdade de Zootecnia e Engenharia de Alimentos" /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface"><input type="checkbox" checked={active} onChange={(evento) => setActive(evento.target.checked)} className="h-4 w-4 rounded" />Ativa</label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={limpar} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">{editando ? 'Salvar alterações' : 'Criar unidade'}</button></div>
      </form>}
      <div className="mt-5 overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-sm"><thead className="bg-surface-variant"><tr><th className="p-3">Sigla</th><th className="p-3">Descrição</th><th className="p-3">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">{unidades.map((unidade) => <tr key={unidade.id} className={!unidade.active ? 'opacity-60' : ''}><td className="p-3 font-semibold">{unidade.sigla}<span className="block text-xs font-normal text-on-surface-variant">ID: {unidade.id}</span></td><td className="p-3">{unidade.descricao}</td><td className="p-3">{unidade.active ? 'Ativa' : 'Inativa'}</td><td className="p-3 text-right"><button type="button" onClick={() => editar(unidade)} className="p-2 text-primary" title="Editar"><span className="material-symbols-outlined">edit</span></button>{unidade.active && <button type="button" onClick={() => void desativar(unidade)} className="p-2 text-error" title="Desativar"><span className="material-symbols-outlined">block</span></button>}</td></tr>)}
            {!carregando && unidades.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Nenhuma unidade cadastrada.</td></tr>}
            {carregando && <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Carregando unidades…</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </GestaoLayout>;
};
