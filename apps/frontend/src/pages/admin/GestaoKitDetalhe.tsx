import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GestaoItensKit } from './GestaoItensKit';
import { GestaoLayout } from './GestaoLayout';

interface Kit { id: string; codigo: string; formulario_id: string; nome: string; descricao: string; campo_condicional: string | null; operador_condicional: string | null; valor_condicional: string | null; ordem: number; ativo: boolean; }
interface Formulario { id: string; nome: string; tipo: string; }
const campo = 'mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface';

export const GestaoKitDetalhe = () => {
  const { id: codigoRota = '' } = useParams();
  const navigate = useNavigate();
  const novoKit = codigoRota.toLowerCase() === 'novo';
  const [kit, setKit] = useState<Kit | null>(null);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [codigoPrevisto, setCodigoPrevisto] = useState('KIT001');
  const [formularioId, setFormularioId] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true); setErro('');
    try {
      const [rk, rf] = await Promise.all([fetch('/api/kits', {credentials:'same-origin'}), fetch('/api/formularios', {credentials:'same-origin'})]);
      const [dk, df] = await Promise.all([rk.json().catch(() => ({})), rf.json().catch(() => ({}))]) as [Kit[] | {error?:string}, Formulario[] | {error?:string}];
      if (!rk.ok || !Array.isArray(dk)) throw new Error((dk as {error?:string}).error || 'Falha ao carregar kits.');
      if (!rf.ok || !Array.isArray(df)) throw new Error((df as {error?:string}).error || 'Falha ao carregar formulários.');
      setFormularios(df.filter((formulario) => formulario.tipo === 'formulario'));
      const maior = dk.reduce((atual, registro) => Math.max(atual, Number(/^KIT(\d+)$/i.exec(registro.codigo)?.[1] || 0)), 0);
      setCodigoPrevisto(`KIT${String(maior + 1).padStart(3, '0')}`);
      if (novoKit) { setKit(null); setFormularioId((atual) => atual || df.find((f) => f.tipo === 'formulario')?.id || ''); return; }
      const encontrado = dk.find((registro) => registro.codigo.toLowerCase() === codigoRota.toLowerCase() || registro.id === codigoRota);
      if (!encontrado) throw new Error(`Kit ${codigoRota} não encontrado.`);
      setKit(encontrado); setFormularioId(encontrado.formulario_id); setNome(encontrado.nome); setDescricao(encontrado.descricao || ''); setAtivo(encontrado.ativo);
    } catch (falha) { setErro(falha instanceof Error ? falha.message : 'Falha ao carregar o kit.'); }
    finally { setCarregando(false); }
  }, [codigoRota, novoKit]);
  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); setErro(''); setSalvando(true);
    const dados = { ...(kit ? {id:kit.id} : {}), formulario_id:formularioId, nome:nome.trim(), descricao:descricao.trim(), campo_condicional:kit?.campo_condicional || null, operador_condicional:kit?.operador_condicional || null, valor_condicional:kit?.valor_condicional || null, ordem:kit?.ordem || 1, ativo };
    try {
      const resposta = await fetch(kit ? `/api/kits/${encodeURIComponent(kit.id)}` : '/api/kits', {method:kit?'PUT':'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(dados)});
      const resultado = await resposta.json().catch(() => ({})) as Kit | {error?:string};
      if (!resposta.ok) throw new Error((resultado as {error?:string}).error || 'Não foi possível salvar o kit.');
      const kitSalvo = resultado as Kit;
      if (!kit) { navigate(`/kit/${encodeURIComponent(kitSalvo.codigo)}`, {replace:true}); return; }
      setKit(kitSalvo); setNome(kitSalvo.nome); setDescricao(kitSalvo.descricao || ''); setAtivo(kitSalvo.ativo);
    } catch (falha) { setErro(falha instanceof Error ? falha.message : 'Falha ao salvar o kit.'); }
    finally { setSalvando(false); }
  };

  const titulo = novoKit ? 'Novo kit' : kit?.nome || 'Kit';
  return <GestaoLayout title={titulo} description="Cadastre os dados do kit e mantenha seus itens organizados." mostrarSincronizacao={false}>
    <div className="mb-4"><Link to="/admin/kits" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><span className="material-symbols-outlined text-lg">arrow_back</span>Voltar à lista de kits</Link></div>
    {erro && <p role="alert" className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
    {carregando ? <section className="rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center text-on-surface-variant">Carregando kit…</section> : <>
      <form autoComplete="off" onSubmit={(evento) => void salvar(evento)} className="rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
        <div className="mb-4"><h2 className="text-lg font-bold">Dados do kit</h2><p className="text-sm text-on-surface-variant">O código é atribuído automaticamente e não altera os vínculos existentes.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">ID<input readOnly value={kit?.codigo || codigoPrevisto} className={`${campo} bg-surface-variant font-mono`} /></label>
          <label className="text-sm font-semibold">Nome do kit<input required maxLength={200} value={nome} onChange={(evento) => setNome(evento.target.value)} className={campo} placeholder="Nome do kit" /></label>
          <label className="text-sm font-semibold md:col-span-2">Formulário<select required value={formularioId} onChange={(evento) => setFormularioId(evento.target.value)} className={campo}><option value="">Selecione um formulário</option>{formularios.map((formulario) => <option key={formulario.id} value={formulario.id}>{formulario.nome}</option>)}</select></label>
          <label className="text-sm font-semibold md:col-span-2">Descrição<textarea rows={3} maxLength={2000} value={descricao} onChange={(evento) => setDescricao(evento.target.value)} className={campo} /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={ativo} onChange={(evento) => setAtivo(evento.target.checked)} />Ativo</label>
        </div>
        <div className="mt-5 flex justify-end"><button disabled={salvando} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-50">{salvando ? 'Salvando…' : kit ? 'Salvar alterações' : 'Criar kit'}</button></div>
      </form>
      {kit && <div className="mt-5"><GestaoItensKit key={kit.id} kitIdFixo={kit.id} embutido /></div>}
    </>}
  </GestaoLayout>;
};
