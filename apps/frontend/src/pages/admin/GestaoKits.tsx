import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GestaoLayout } from './GestaoLayout';

interface Kit { id: string; codigo: string; formulario_id: string; nome: string; ativo: boolean; }
interface Formulario { id: string; nome: string; }
interface ItemResumo { id: string; titulo: string; identificador: string; ordem: number; ativo: boolean; }
const porPagina = 10;

export const GestaoKits = () => {
  const navigate = useNavigate();
  const [kits, setKits] = useState<Kit[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [itens, setItens] = useState<ItemResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [erro, setErro] = useState('');
  const expandiuInicialmente = useRef(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [rk, rf] = await Promise.all([
        fetch('/api/kits', { credentials: 'same-origin' }),
        fetch('/api/formularios', { credentials: 'same-origin' }),
      ]);
      const [dk, df] = await Promise.all([rk.json().catch(() => ({})), rf.json().catch(() => ({}))]) as [Kit[] | {error?: string}, Formulario[] | {error?: string}];
      if (!rk.ok || !Array.isArray(dk)) throw new Error((dk as {error?: string}).error || 'Não foi possível carregar os kits.');
      if (!rf.ok || !Array.isArray(df)) throw new Error((df as {error?: string}).error || 'Não foi possível carregar os formulários.');
      setKits(dk); setFormularios(df); setErro('');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os cadastros.');
    } finally { setCarregando(false); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return kits.filter((kit) => !termo || `${kit.codigo} ${kit.nome} ${kit.formulario_id}`.toLocaleLowerCase('pt-BR').includes(termo));
  }, [kits, busca]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const kitsPagina = filtrados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);
  const nomeFormulario = (id: string) => formularios.find((formulario) => formulario.id === id)?.nome || id;

  const alternarItens = useCallback(async (kit: Kit) => {
    if (expandido === kit.id) { setExpandido(null); setItens([]); return; }
    setExpandido(kit.id); setItens([]); setCarregandoItens(true); setErro('');
    try {
      const resposta = await fetch(`/api/kits/${encodeURIComponent(kit.id)}/itens`, { credentials: 'same-origin' });
      const dados = await resposta.json().catch(() => ({})) as ItemResumo[] | {error?: string};
      if (!resposta.ok || !Array.isArray(dados)) throw new Error((dados as {error?: string}).error || 'Não foi possível carregar os itens.');
      setItens(dados);
    } catch (falha) { setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os itens.'); }
    finally { setCarregandoItens(false); }
  }, [expandido]);

  useEffect(() => {
    if (!carregando && kits.length > 0 && !expandiuInicialmente.current) {
      expandiuInicialmente.current = true;
      void alternarItens(kits[0]);
    }
  }, [alternarItens, carregando, kits]);

  return <GestaoLayout title="Kits Documentais" description="Consulte kits e seus itens. Abra um kit para criar ou editar seus dados." mostrarSincronizacao={false}>
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="order-3 w-full md:order-2 md:mx-4 md:w-auto md:flex-1 md:max-w-2xl">
          <label htmlFor="buscar-kit" className="mb-1 block text-center text-sm font-semibold text-on-surface">Buscar kit</label>
          <input id="buscar-kit" type="search" autoComplete="off" value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1); setExpandido(null); setItens([]); }} placeholder="Código, nome do kit ou formulário" className="h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" style={{ width: '100%', display: 'block', boxSizing: 'border-box' }} />
        </div>
        <button type="button" onClick={() => navigate('/kit/novo')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"><span className="material-symbols-outlined text-[18px]">add</span>Novo kit</button>
      </div>

      {erro && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
      <div className="mt-5 overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-variant"><tr><th className="p-3">ID</th><th className="p-3">Kit</th><th className="p-3">Formulário</th><th className="p-3">Ativo</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
            {kitsPagina.map((kit) => <Fragment key={kit.id}>
              <tr className={!kit.ativo ? 'text-on-surface-variant' : ''}>
                <td className="p-3 font-mono text-xs">{kit.codigo}</td><td className="p-3 font-medium">{kit.nome}</td><td className="p-3">{nomeFormulario(kit.formulario_id)}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${kit.ativo ? 'bg-green-100 text-green-800' : 'bg-surface-variant text-on-surface-variant'}`}>{kit.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td className="p-3 text-right whitespace-nowrap"><button type="button" onClick={() => void alternarItens(kit)} className="rounded-lg px-3 py-1.5 font-medium text-primary hover:bg-primary/5">{expandido === kit.id ? 'Fechar itens' : 'Itens'}</button><button type="button" onClick={() => navigate(`/kit/${encodeURIComponent(kit.codigo)}`)} className="ml-1 rounded-lg px-3 py-1.5 font-semibold text-primary hover:bg-primary/5">Abrir</button></td>
              </tr>
              {expandido === kit.id && <tr><td colSpan={5} className="bg-surface-container-low p-3">
                <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-surface-variant"><tr><th className="p-2.5">Item</th><th className="w-24 p-2.5">Ordem</th><th className="w-28 p-2.5">Status</th></tr></thead><tbody className="divide-y divide-outline-variant">
                  {carregandoItens && <tr><td colSpan={3} className="p-4 text-center text-on-surface-variant">Carregando itens…</td></tr>}
                  {!carregandoItens && itens.map((item) => <tr key={item.id}><td className="p-2.5">{item.titulo}<span className="block text-xs text-on-surface-variant">{item.identificador}</span></td><td className="p-2.5">{item.ordem}</td><td className="p-2.5">{item.ativo ? 'Ativo' : 'Inativo'}</td></tr>)}
                  {!carregandoItens && itens.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-on-surface-variant">Este kit ainda não tem itens.</td></tr>}
                </tbody></table></div>
              </td></tr>}
            </Fragment>)}
            {!carregando && kitsPagina.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Nenhum kit encontrado.</td></tr>}
            {carregando && <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Carregando kits…</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-on-surface-variant"><span>Exibindo {filtrados.length ? (paginaAtual - 1) * porPagina + 1 : 0}–{Math.min(paginaAtual * porPagina, filtrados.length)} de {filtrados.length}</span><div className="flex items-center gap-2"><button type="button" disabled={paginaAtual <= 1} onClick={() => {setPagina((p) => Math.max(1, p - 1));setExpandido(null);}} className="rounded-lg border border-outline-variant px-3 py-1.5 disabled:opacity-40">Anterior</button><span>Página {paginaAtual} de {totalPaginas}</span><button type="button" disabled={paginaAtual >= totalPaginas} onClick={() => {setPagina((p) => Math.min(totalPaginas, p + 1));setExpandido(null);}} className="rounded-lg border border-outline-variant px-3 py-1.5 disabled:opacity-40">Próxima</button></div></div>
    </section>
  </GestaoLayout>;
};
