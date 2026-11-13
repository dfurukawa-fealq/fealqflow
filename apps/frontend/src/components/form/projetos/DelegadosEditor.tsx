import { useState } from 'react';
import { formatCPF } from '../../../utils/formatters';
import { gerarIdLocal } from '../../../utils/id';

export type NivelAcessoDelegado = 'Nivel 1 - Ordenador' | 'Nivel 2 - Criador';
export interface DelegadoEditorItem { id: string; nome: string; cpf: string; telefone: string; email: string; nivelAcesso: NivelAcessoDelegado; }
interface Props { delegados: DelegadoEditorItem[]; aoAlterar: (delegados: DelegadoEditorItem[]) => void; numero?: number; }

const formatarTelefone = (valor: string) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos ? `(${digitos}` : '';
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};
const vazio = (): DelegadoEditorItem => ({ id: '', nome: '', cpf: '', telefone: '', email: '', nivelAcesso: 'Nivel 2 - Criador' });

export const DelegadosEditor = ({ delegados, aoAlterar, numero }: Props) => {
  const [novo, setNovo] = useState<DelegadoEditorItem>(vazio);
  const atualizarNovo = (campo: keyof DelegadoEditorItem, valor: string) => setNovo((atual) => ({ ...atual, [campo]: valor }));
  const adicionar = () => { if (!novo.nome.trim()) return; aoAlterar([...delegados, { ...novo, id: gerarIdLocal() }]); setNovo(vazio()); };
  const atualizar = (id: string, campo: keyof DelegadoEditorItem, valor: string) => aoAlterar(delegados.map((item) => item.id === id ? { ...item, [campo]: valor } : item));
  const remover = (id: string) => aoAlterar(delegados.filter((item) => item.id !== id));
  const input = (item: DelegadoEditorItem, campo: keyof DelegadoEditorItem, novoItem = false) => {
    const valor = item[campo];
    const formatado = campo === 'cpf' ? formatCPF(String(valor)) : campo === 'telefone' ? formatarTelefone(String(valor)) : String(valor);
    return <input type={campo === 'email' ? 'email' : 'text'} inputMode={campo === 'telefone' || campo === 'cpf' ? 'numeric' : undefined} value={formatado} onChange={(evento) => (novoItem ? atualizarNovo(campo, evento.target.value) : atualizar(item.id, campo, evento.target.value))} placeholder={campo === 'nome' ? 'Nome completo' : campo === 'cpf' ? '000.000.000-00' : campo === 'telefone' ? '(00) 00000-0000' : 'email@usp.br'} className="min-w-0 w-full rounded border border-outline-variant px-2 py-1.5 text-xs" />;
  };
  const colunas = 'grid-cols-[minmax(120px,1.2fr)_minmax(130px,1fr)_minmax(120px,1fr)_minmax(130px,1.2fr)_minmax(145px,1.2fr)_40px]';
  return <div className="col-span-12 mt-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
    <div className="mb-3"><h3 className="flex items-center gap-xs text-sm font-bold text-on-surface"><span className="material-symbols-outlined text-[18px] text-secondary">manage_accounts</span>{numero !== undefined && `${numero}. `}Delegados de Gestão (Sistema Conveniar / USP)</h3><p className="text-xs text-on-surface-variant">Pessoas com permissão para criar ou movimentar pedidos financeiros no projeto</p></div>
    <div className="mb-sm grid grid-cols-1 gap-sm rounded-lg border border-outline-variant bg-surface-container-low p-sm text-[11px] text-on-surface-variant md:grid-cols-2"><div><strong className="block text-primary">Nível 1 – Ordenador de Despesa:</strong>Coordenador ou responsável indicado por ele. Possui visão total do projeto e autorização formal para criar e enviar pedidos.</div><div><strong className="block text-secondary-dark">Nível 2 – Criador:</strong>Cria pedidos em rascunho. O envio final depende da análise de um delegado Nível 1.</div></div>
    <div className="overflow-x-auto rounded-lg border border-outline-variant"><div className={`grid min-w-[760px] ${colunas} gap-2 bg-surface-container-low px-2 py-1.5 text-xs font-bold text-on-surface-variant`}><span>Nome</span><span>CPF</span><span>Telefone</span><span>E-mail</span><span>Nível de Acesso</span><span className="text-center">Ação</span></div><div className={`grid min-w-[760px] ${colunas} items-center gap-2 border-b border-outline-variant p-2`}>{(['nome', 'cpf', 'telefone', 'email'] as const).map((campo) => <span key={campo}>{input(novo, campo, true)}</span>)}<select value={novo.nivelAcesso} onChange={(evento) => atualizarNovo('nivelAcesso', evento.target.value)} className="w-full rounded border border-outline-variant px-2 py-1.5 text-xs"><option value="Nivel 1 - Ordenador">Nível 1 - Ordenador</option><option value="Nivel 2 - Criador">Nível 2 - Criador</option></select><button type="button" onClick={adicionar} disabled={!novo.nome.trim()} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-primary disabled:opacity-35" title="Adicionar delegado"><span className="material-symbols-outlined">save</span></button></div>{delegados.map((item) => <div key={item.id} className={`grid min-w-[760px] ${colunas} items-center gap-2 border-b border-outline-variant/60 p-2 last:border-0`}>{(['nome', 'cpf', 'telefone', 'email'] as const).map((campo) => <span key={campo}>{input(item, campo)}</span>)}<select value={item.nivelAcesso} onChange={(evento) => atualizar(item.id, 'nivelAcesso', evento.target.value)} className="w-full rounded border border-outline-variant px-2 py-1.5 text-xs"><option value="Nivel 1 - Ordenador">Nível 1 - Ordenador</option><option value="Nivel 2 - Criador">Nível 2 - Criador</option></select><button type="button" onClick={() => remover(item.id)} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-error" title="Remover delegado" aria-label={`Remover ${item.nome}`}><span className="material-symbols-outlined">delete</span></button></div>)}</div>
  </div>;
};
