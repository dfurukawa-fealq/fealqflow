import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAVE_PROCESSOS_LOCAIS, ProcessoLocal } from '../../contexts/ProcessoContext';
import { safeGetItem, safeJsonParse } from '../../utils/safeStorage';
import { useUser } from '../../contexts/UserContext';
import { ConfirmacaoModal } from '../ConfirmacaoModal';

interface Rascunho { id: string; rota: string; protocolo: string; nome: string; atualizado: string; }

export const MeusRascunhos = ({ categoria }: { categoria: 'projeto' | 'apoio' }) => {
  const [rascunhos, setRascunhos] = useState<Rascunho[]>([]);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [confirmarInativacao, setConfirmarInativacao] = useState(false);
  const [inativando, setInativando] = useState(false);
  const { usuario } = useUser();
  const podeGerenciar = Boolean(usuario);
  useEffect(() => {
    let ativo = true;
    const locais = safeJsonParse<ProcessoLocal[]>(safeGetItem(CHAVE_PROCESSOS_LOCAIS), [])
      .filter((item) => item.categoria === categoria && /^[0-9a-f-]{36}$/i.test(item.id)
        && !item.processoPaiId
        && item.rota.startsWith(categoria === 'projeto' ? '/projetos/form-' : '/programas-de-apoio/apoio-'));
    void Promise.allSettled(locais.map(async (item): Promise<Rascunho | null> => {
      const token = safeGetItem(`@Fealq:processo:${item.id}`);
      if (!token) throw new Error('Token local indisponível.');
      const resposta = await fetch(`/api/processos/${item.id}`, { credentials: 'same-origin', headers: { 'x-processo-token': token } });
      if (!resposta.ok) throw new Error('Rascunho indisponível.');
      const processo = await resposta.json() as { status: string; ativo: boolean; protocolo: string; formulario_nome: string; atualizado_em: string; formulario_rota: string; processo_pai_id?: string | null };
      if (processo.processo_pai_id) return null;
      if (!processo.ativo || !['rascunho', 'em_preenchimento'].includes(processo.status) || processo.formulario_rota !== item.rota) return null;
      return { id: item.id, rota: item.rota, protocolo: processo.protocolo, nome: processo.formulario_nome, atualizado: new Date(processo.atualizado_em).toLocaleDateString('pt-BR') };
    })).then((resultados) => {
      if (!ativo) return;
      setRascunhos(resultados.flatMap((resultado) => resultado.status === 'fulfilled' && resultado.value ? [resultado.value] : []));
      if (resultados.some((resultado) => resultado.status === 'rejected')) setErro('Alguns rascunhos não puderam ser consultados. Verifique a conexão e o acesso neste navegador.');
    });
    return () => { ativo = false; };
  }, [categoria]);

  const alternarSelecao = (id: string) => {
    setSelecionados((atuais) => atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]);
  };

  const todosSelecionados = rascunhos.length > 0 && rascunhos.every((item) => selecionados.includes(item.id));
  const alternarTodos = () => {
    setSelecionados(todosSelecionados ? [] : rascunhos.map((item) => item.id));
  };

  const inativarSelecionados = async () => {
    setInativando(true);
    setErro('');
    try {
      const resposta = await fetch('/api/processos/inativar', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selecionados }),
      });
      const resultado = await resposta.json().catch(() => ({})) as { error?: string; inativados?: string[] };
      if (!resposta.ok) throw new Error(resultado.error || 'Não foi possível inativar os processos.');
      const inativados = new Set(resultado.inativados || selecionados);
      setRascunhos((atuais) => atuais.filter((item) => !inativados.has(item.id)));
      setSelecionados([]);
      setConfirmarInativacao(false);
    } catch (falha: unknown) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível inativar os processos.');
    } finally {
      setInativando(false);
    }
  };

  if (!rascunhos.length && !erro) return null;
  return <section className="mb-lg rounded border border-outline-variant bg-surface-container-lowest p-md">
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
      <div className="flex justify-center">
        {podeGerenciar && <input type="checkbox" checked={todosSelecionados} onChange={alternarTodos} aria-label={todosSelecionados ? 'Desmarcar todos os processos' : 'Selecionar todos os processos'} title={todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos'} />}
      </div>
      <button type="button" className="flex items-center gap-2 text-left text-base font-bold text-primary" onClick={() => setAberto((valor) => !valor)} aria-expanded={aberto}>
        <span className="material-symbols-outlined text-lg">{aberto ? 'expand_less' : 'expand_more'}</span>
        <span>Processos iniciados ({rascunhos.length})</span>
      </button>
      {podeGerenciar ? <button type="button" disabled={selecionados.length === 0} onClick={() => setConfirmarInativacao(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error text-error hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-40" title="Inativar processos selecionados" aria-label="Inativar processos selecionados">
        <span className="material-symbols-outlined text-lg">delete</span>
      </button> : <span />}
    </div>
    {erro && <p role="alert" className="mb-sm text-sm text-error">{erro}</p>}
    {aberto && <ul className="flex flex-col gap-xs">
      {rascunhos.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant py-sm text-sm">
        {podeGerenciar && <input type="checkbox" checked={selecionados.includes(item.id)} onChange={() => alternarSelecao(item.id)} aria-label={`Selecionar ${item.nome}`} />}
        <span>{item.nome} · {item.protocolo} · {item.atualizado}</span>
        <Link className="font-bold text-primary underline" to={`${item.rota}?processo=${item.id}`}>Retomar</Link>
      </li>)}
    </ul>}
    {confirmarInativacao && <ConfirmacaoModal
      titulo="Inativar processos?"
      mensagem={`Os ${selecionados.length} processos selecionados deixarão de aparecer para o usuário. Os dados não serão apagados.`}
      icone="delete"
      textoConfirmar="Inativar"
      carregando={inativando}
      onCancelar={() => setConfirmarInativacao(false)}
      onConfirmar={() => void inativarSelecionados()}
    />}
  </section>;
};
