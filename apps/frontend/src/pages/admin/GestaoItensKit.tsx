import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { GestaoLayout } from './GestaoLayout';

type TipoItem = 'gerado' | 'upload' | 'externo' | 'aceite';
interface Kit { id: string; formulario_id: string; nome: string; ativo: boolean; }
interface Documento { id: string; nome: string; }
interface ItemKit { id: string; kit_id: string; cadastro_documento_id: string | null; identificador: string; titulo: string; descricao: string; tipo: TipoItem; obrigatorio: boolean; permite_anexo: boolean; permite_modelo: boolean; url_template: string; observacao_condicional: string | null; campo_condicional: string | null; operador_condicional: string | null; valor_condicional: string | null; ordem: number; ativo: boolean; }
interface GestaoItensKitProps { kitIdFixo?: string; embutido?: boolean; }

const campo = 'mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-normal text-on-surface';

export const GestaoItensKit = ({ kitIdFixo, embutido = false }: GestaoItensKitProps) => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [kitId, setKitId] = useState(kitIdFixo || '');
  const [itens, setItens] = useState<ItemKit[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<ItemKit | null>(null);
  const [identificador, setIdentificador] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoItem>('upload');
  const [documentoId, setDocumentoId] = useState('');
  const [obrigatorio, setObrigatorio] = useState(true);
  const [permiteAnexo, setPermiteAnexo] = useState(true);
  const [permiteModelo, setPermiteModelo] = useState(false);
  const [urlTemplate, setUrlTemplate] = useState('');
  const [campoCondicional, setCampoCondicional] = useState('');
  const [valorCondicional, setValorCondicional] = useState('');
  const [observacaoCondicional, setObservacaoCondicional] = useState('');
  const [ordem, setOrdem] = useState('1');
  const [ativo, setAtivo] = useState(true);
  const [erro, setErro] = useState('');

  const kitSelecionado = useMemo(() => kits.find((kit) => kit.id === kitId), [kits, kitId]);

  const carregarCadastros = useCallback(async () => {
    setCarregando(true);
    const [respostaKits, respostaDocumentos] = await Promise.all([
      fetch('/api/kits', { credentials: 'same-origin' }),
      fetch('/api/documentos', { credentials: 'same-origin' }),
    ]);
    const dadosKits = await respostaKits.json().catch(() => ({})) as Kit[] | { error?: string };
    const dadosDocumentos = await respostaDocumentos.json().catch(() => ({})) as Documento[] | { error?: string };
    if (!respostaKits.ok) throw new Error(!Array.isArray(dadosKits) ? dadosKits.error || 'Falha ao carregar kits.' : 'Falha ao carregar kits.');
    if (!respostaDocumentos.ok) throw new Error(!Array.isArray(dadosDocumentos) ? dadosDocumentos.error || 'Falha ao carregar documentos.' : 'Falha ao carregar documentos.');
    const listaKits = dadosKits as Kit[];
    setKits(listaKits);
    setDocumentos(dadosDocumentos as Documento[]);
    setKitId(kitIdFixo || (listaKits.some((kit) => kit.id === kitId) ? kitId : listaKits.find((kit) => kit.ativo)?.id || ''));
    setCarregando(false);
  }, [kitIdFixo, kitId]);

  useEffect(() => { if (kitIdFixo) setKitId(kitIdFixo); }, [kitIdFixo]);

  const carregarItens = useCallback(async (id = kitId) => {
    if (!id) { setItens([]); return; }
    const resposta = await fetch(`/api/kits/${encodeURIComponent(id)}/itens`, { credentials: 'same-origin' });
    const resultado = await resposta.json().catch(() => ({})) as ItemKit[] | { error?: string };
    if (!resposta.ok) throw new Error(!Array.isArray(resultado) ? resultado.error || 'Falha ao carregar itens do kit.' : 'Falha ao carregar itens do kit.');
    setItens(resultado as ItemKit[]);
  }, [kitId]);

  useEffect(() => { void carregarCadastros().catch((falha: unknown) => { setErro(falha instanceof Error ? falha.message : 'Falha ao carregar cadastros.'); setCarregando(false); }); }, [carregarCadastros]);
  useEffect(() => { void carregarItens().catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Falha ao carregar itens do kit.')); }, [carregarItens]);

  const limpar = () => { setAberto(false); setEditando(null); setIdentificador(''); setTitulo(''); setDescricao(''); setTipo('upload'); setDocumentoId(''); setObrigatorio(true); setPermiteAnexo(true); setPermiteModelo(false); setUrlTemplate(''); setCampoCondicional(''); setValorCondicional(''); setObservacaoCondicional(''); setOrdem(String(itens.length + 1)); setAtivo(true); setErro(''); };
  const editar = (item: ItemKit) => { setEditando(item); setIdentificador(item.identificador); setTitulo(item.titulo); setDescricao(item.descricao); setTipo(item.tipo); setDocumentoId(item.cadastro_documento_id || ''); setObrigatorio(item.obrigatorio); setPermiteAnexo(item.permite_anexo); setPermiteModelo(item.permite_modelo); setUrlTemplate(item.url_template); setCampoCondicional(item.campo_condicional || ''); setValorCondicional(item.valor_condicional || ''); setObservacaoCondicional(item.observacao_condicional || ''); setOrdem(String(item.ordem)); setAtivo(item.ativo); setAberto(true); setErro(''); };

  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!kitId) { setErro('Selecione um kit antes de cadastrar itens.'); return; }
    setErro('');
    const corpo = {
      ...(editando ? { id: editando.id } : {}), kit_id: kitId, cadastro_documento_id: documentoId || null,
      identificador: identificador.trim(), titulo: titulo.trim(), descricao: descricao.trim(), tipo,
      obrigatorio, permite_anexo: permiteAnexo, permite_modelo: permiteModelo,
      url_template: urlTemplate.trim(),
      observacao_condicional: observacaoCondicional.trim() || null,
      campo_condicional: campoCondicional.trim() || null,
      operador_condicional: campoCondicional.trim() ? 'equals' : null,
      valor_condicional: campoCondicional.trim() ? valorCondicional.trim() : null,
      ordem: Number(ordem), ativo,
    };
    const resposta = await fetch(editando ? `/api/itens-kit/${encodeURIComponent(editando.id)}` : `/api/kits/${encodeURIComponent(kitId)}/itens`, {
      method: editando ? 'PUT' : 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo),
    });
    const resultado = await resposta.json().catch(() => ({})) as { error?: string };
    if (!resposta.ok) { setErro(resultado.error || 'Não foi possível salvar o item.'); return; }
    await carregarItens(kitId);
    limpar();
  };

  const desativar = async (item: ItemKit) => {
    if (!window.confirm(`Desativar o item “${item.titulo}”?`)) return;
    const resposta = await fetch(`/api/itens-kit/${encodeURIComponent(item.id)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!resposta.ok) { const resultado = await resposta.json().catch(() => ({})) as { error?: string }; setErro(resultado.error || 'Não foi possível desativar o item.'); return; }
    await carregarItens();
  };

  const conteudo = <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[260px] flex-1"><h2 className="mb-2 text-xl font-bold text-on-surface">Itens do kit</h2>{!kitIdFixo && <label className="text-sm font-semibold text-on-surface">Kit<select value={kitId} onChange={(evento) => { setKitId(evento.target.value); setErro(''); }} className={campo}><option value="">Selecione um kit</option>{kits.map((kit) => <option key={kit.id} value={kit.id}>{kit.nome}{!kit.ativo ? ' (inativo)' : ''}</option>)}</select></label>}</div>
        <button type="button" disabled={!kitId} onClick={() => { limpar(); setOrdem(String(itens.length + 1)); setAberto(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">add</span>Novo item</button>
      </div>
      {kitSelecionado && <p className="mt-2 text-xs text-on-surface-variant">Formulário: {kitSelecionado.formulario_id} · Kit: {kitSelecionado.id}</p>}
      {erro && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erro}</p>}
      {aberto && <form autoComplete="off" onSubmit={(evento) => void salvar(evento)} className="mt-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-on-surface">{editando ? 'Editar item' : 'Novo item'}</h3><button type="button" onClick={limpar} className="p-1 text-on-surface-variant" aria-label="Fechar"><span className="material-symbols-outlined">close</span></button></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold text-on-surface">Identificador<input required maxLength={120} value={identificador} onChange={(evento) => setIdentificador(evento.target.value)} className={campo} placeholder="programacao-evento" /></label>
          <label className="text-sm font-semibold text-on-surface">Título<input required maxLength={240} value={titulo} onChange={(evento) => setTitulo(evento.target.value)} className={campo} /></label>
          <label className="text-sm font-semibold text-on-surface">Tipo<select value={tipo} onChange={(evento) => { const novoTipo = evento.target.value as TipoItem; setTipo(novoTipo); setPermiteAnexo(novoTipo === 'upload'); if (novoTipo !== 'upload') setPermiteModelo(false); }} className={campo}><option value="gerado">Formulário gerado</option><option value="upload">Anexo enviado</option><option value="externo">Documento externo</option><option value="aceite">Aceite</option></select></label>
          <label className="text-sm font-semibold text-on-surface">Documento do catálogo (opcional)<select value={documentoId} onChange={(evento) => setDocumentoId(evento.target.value)} className={campo}><option value="">Sem vínculo direto</option>{documentos.map((documento) => <option key={documento.id} value={documento.id}>{documento.nome}</option>)}</select></label>
          <label className="text-sm font-semibold text-on-surface">Ordem<input required type="number" min="0" step="1" value={ordem} onChange={(evento) => setOrdem(evento.target.value)} className={campo} /></label>
          <label className="text-sm font-semibold text-on-surface">URL do modelo<input maxLength={2048} value={urlTemplate} onChange={(evento) => { setUrlTemplate(evento.target.value); if (evento.target.value) setPermiteModelo(true); }} className={campo} placeholder="https://…" /></label>
          <label className="text-sm font-semibold text-on-surface md:col-span-2 lg:col-span-3">Descrição<textarea rows={2} maxLength={500000} value={descricao} onChange={(evento) => setDescricao(evento.target.value)} className={campo} /></label>
          <label className="text-sm font-semibold text-on-surface">Campo condicional (opcional)<input maxLength={160} value={campoCondicional} onChange={(evento) => setCampoCondicional(evento.target.value)} className={campo} placeholder="possuiConvenio" /></label>
          <label className="text-sm font-semibold text-on-surface">Valor esperado<input required={Boolean(campoCondicional.trim())} maxLength={160} value={valorCondicional} onChange={(evento) => setValorCondicional(evento.target.value)} className={campo} disabled={!campoCondicional} placeholder="sim" /></label>
          <label className="text-sm font-semibold text-on-surface">Observação da condição<input maxLength={2000} value={observacaoCondicional} onChange={(evento) => setObservacaoCondicional(evento.target.value)} className={campo} /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface"><input type="checkbox" checked={obrigatorio} onChange={(evento) => setObrigatorio(evento.target.checked)} className="h-4 w-4 rounded" />Obrigatório</label>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface"><input type="checkbox" checked={permiteAnexo} onChange={(evento) => setPermiteAnexo(evento.target.checked)} className="h-4 w-4 rounded" />Permite anexo</label>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface"><input type="checkbox" checked={permiteModelo} onChange={(evento) => setPermiteModelo(evento.target.checked)} className="h-4 w-4 rounded" />Permite baixar modelo</label>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface"><input type="checkbox" checked={ativo} onChange={(evento) => setAtivo(evento.target.checked)} className="h-4 w-4 rounded" />Ativo</label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={limpar} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">{editando ? 'Salvar alterações' : 'Criar item'}</button></div>
      </form>}
      <div className="mt-5 overflow-x-auto rounded-xl border border-outline-variant"><table className="w-full text-left text-sm"><thead className="bg-surface-variant"><tr><th className="p-3">Item</th><th className="p-3">Tipo</th><th className="p-3">Obrigatório</th><th className="p-3">Ordem</th><th className="p-3">Status</th><th className="p-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-outline-variant bg-surface-container-lowest">{itens.map((item) => <tr key={item.id} className={!item.ativo ? 'opacity-60' : ''}><td className="p-3 font-medium">{item.titulo}<span className="block text-xs text-on-surface-variant">{item.identificador}</span></td><td className="p-3">{item.tipo}</td><td className="p-3">{item.obrigatorio ? 'Sim' : 'Não'}</td><td className="p-3">{item.ordem}</td><td className="p-3">{item.ativo ? 'Ativo' : 'Inativo'}</td><td className="p-3 text-right"><button type="button" onClick={() => editar(item)} className="p-2 text-primary" title="Editar"><span className="material-symbols-outlined">edit</span></button>{item.ativo && <button type="button" onClick={() => void desativar(item)} className="p-2 text-error" title="Desativar"><span className="material-symbols-outlined">block</span></button>}</td></tr>)}{!carregando && kitId && itens.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Este kit ainda não tem itens.</td></tr>}{!kitId && !carregando && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Cadastre ou selecione um kit para gerenciar seus itens.</td></tr>}{carregando && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Carregando cadastros…</td></tr>}</tbody></table></div>
    </section>
  return embutido ? conteudo : <GestaoLayout title="Itens de Kit" description="Configure os documentos, formulários, anexos e regras de cada kit documental." mostrarSincronizacao={false}>{conteudo}</GestaoLayout>;
};
