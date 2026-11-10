import { useProcessoState } from '../../../contexts/ProcessoContext';
import { Field } from '../Field';

interface Financiadora { id: string; nome: string; contato: string; email: string; valor: string; origem: string; }
const vazia = (): Financiadora => ({ id: `financiadora-${Date.now()}-${Math.random()}`, nome: '', contato: '', email: '', valor: '', origem: 'Recurso Privado Nacional' });
const origens = ['Recurso Privado Nacional', 'Recurso Privado Internacional', 'Entidade Pública / Fomento', 'Misto'];

export const InstituicoesFinanciadorasSection = () => {
  const [registros, setRegistros] = useProcessoState<Financiadora[]>('instituicoesFinanciadoras', [vazia()]);
  const atualizar = (id: string, campo: keyof Omit<Financiadora, 'id'>, valor: string) => setRegistros(registros.map((item) => item.id === id ? { ...item, [campo]: valor } : item));
  const salvar = (item: Financiadora) => { if (item.nome.trim()) setRegistros([...registros, vazia()]); };
  const remover = (id: string) => { const restantes = registros.filter((item) => item.id !== id); setRegistros(restantes.length ? restantes : [vazia()]); };
  return <div className="col-span-12 space-y-sm rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-md">
    <h4 className="flex items-center gap-xs text-[13px] font-bold text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">business</span>Instituições Envolvidas (Financiadoras)</h4>
    {registros.map((item, indice) => <div key={item.id} className="grid grid-cols-12 items-end gap-sm rounded border border-outline-variant/60 p-sm">
      <Field label="Nome da Empresa / Instituição Parceira" span={6} placeholder="Razão Social ou Nome Fantasia" valor={item.nome} onChange={(valor) => atualizar(item.id, 'nome', valor)} />
      <Field label="Ponto de Contato (Nome/Área)" span={6} placeholder="Ex.: João Silva - RH / Treinamento" valor={item.contato} onChange={(valor) => atualizar(item.id, 'contato', valor)} />
      <Field label="E-mail de Contato da Empresa" span={4} tipo="email" placeholder="contato@empresa.com.br" valor={item.email} onChange={(valor) => atualizar(item.id, 'email', valor)} />
      <Field label="Valor Total Previsto (R$)" span={4} prefixo="R$" placeholder="0,00" valor={item.valor} onChange={(valor) => atualizar(item.id, 'valor', valor)} />
      <Field label="Origem dos Recursos" span={3} tipo="select" opcoes={origens} valor={item.origem} onChange={(valor) => atualizar(item.id, 'origem', valor)} />
      <div className="col-span-1 flex justify-center pb-xs">{indice === registros.length - 1 ? <button type="button" onClick={() => salvar(item)} disabled={!item.nome.trim()} className="text-primary disabled:opacity-35" title="Salvar instituição e adicionar outra" aria-label="Salvar instituição e adicionar outra"><span className="material-symbols-outlined">save</span></button> : <button type="button" onClick={() => remover(item.id)} className="text-error" title="Remover instituição" aria-label="Remover instituição"><span className="material-symbols-outlined">delete</span></button>}</div>
    </div>)}
  </div>;
};
