import { useMemo, useState } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { FormSection } from '../FormSection';

interface ParcelaDesembolso {
  id: string;
  data: string;
  financeira: string;
  economica: string;
  valor: string;
}

const parcelaVazia = (): ParcelaDesembolso => ({ id: `parcela-${Date.now()}-${Math.random()}`, data: '', financeira: '', economica: '', valor: '' });
const numero = (valor: string) => Number(valor) || 0;
const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const exibirMoeda = (valor: string) => valor === '' ? '' : numero(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const normalizarMoeda = (valor: string) => {
  const somenteNumeros = valor.replace(/\D/g, '');
  if (!somenteNumeros) return '';
  const convertido = Number(somenteNumeros) / 100;
  return Number.isFinite(convertido) ? String(convertido) : '';
};

export const CronogramaDesembolsoSection = () => {
  const [valorTotal, setValorTotal] = useProcessoState('valorTotalProjeto', '');
  const [parcelas, setParcelas] = useProcessoState<ParcelaDesembolso[]>('parcelasDesembolso', [parcelaVazia()]);
  const [valorTotalEmEdicao, setValorTotalEmEdicao] = useState<string | null>(null);
  const [camposEmEdicao, setCamposEmEdicao] = useState<Record<string, string>>({});
  const total = numero(valorTotal);
  const alocado = useMemo(() => parcelas.reduce((soma, parcela) => soma + numero(parcela.valor), 0), [parcelas]);
  const saldo = total - alocado;

  const atualizar = (id: string, campo: keyof Omit<ParcelaDesembolso, 'id'>, valor: string) => {
    setParcelas(parcelas.map((parcela) => parcela.id === id ? { ...parcela, [campo]: valor } : parcela));
  };
  const salvar = (parcela: ParcelaDesembolso) => {
    if (!parcela.data && !parcela.financeira && !parcela.economica && !parcela.valor) return;
    setParcelas([...parcelas, parcelaVazia()]);
  };
  const remover = (id: string) => setParcelas(parcelas.filter((parcela) => parcela.id !== id).length ? parcelas.filter((parcela) => parcela.id !== id) : [parcelaVazia()]);
  const valorEditavel = (id: string, campo: keyof Omit<ParcelaDesembolso, 'id'>, valor: string) => camposEmEdicao[`${id}-${campo}`] ?? exibirMoeda(valor);
  const iniciarEdicao = (id: string, campo: keyof Omit<ParcelaDesembolso, 'id'>, valor: string) => setCamposEmEdicao({ ...camposEmEdicao, [`${id}-${campo}`]: valor });
  const finalizarEdicao = (id: string, campo: keyof Omit<ParcelaDesembolso, 'id'>, valor: string) => {
    const copia = { ...camposEmEdicao };
    delete copia[`${id}-${campo}`];
    setCamposEmEdicao(copia);
    atualizar(id, campo, normalizarMoeda(valor));
  };

  return <FormSection numero={7} icone="payments" titulo="Cronograma de Desembolso">
    <div className="col-span-12 space-y-md">
      <div className="grid grid-cols-12 gap-sm items-end">
        <label className="col-span-12 md:col-span-4 text-[12px] font-bold text-on-surface">Valor Total do Projeto (R$)
          <input inputMode="numeric" value={valorTotalEmEdicao ?? exibirMoeda(valorTotal)} onFocus={() => setValorTotalEmEdicao(exibirMoeda(valorTotal))} onBlur={() => { setValorTotal(normalizarMoeda(valorTotalEmEdicao ?? valorTotal)); setValorTotalEmEdicao(null); }} onChange={(e) => { setValorTotalEmEdicao(e.target.value); setValorTotal(normalizarMoeda(e.target.value)); }} className="mt-xs w-full rounded border border-outline-variant p-sm text-[13px]" placeholder="0,00" aria-label="Valor Total do Projeto em reais" />
        </label>
        <div className={`col-span-12 md:col-span-8 rounded border p-sm text-[12px] ${Math.abs(saldo) < 0.01 ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant bg-surface-container-low'}`}>
          <span className="font-semibold">Saldo a desembolsar: </span>{moeda(saldo)}
          {total > 0 && <span className="ml-sm text-on-surface-variant">({((alocado / total) * 100).toFixed(2)}% alocado)</span>}
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="min-w-[820px] w-full text-[12px]">
          <thead className="bg-surface-container-low text-on-surface-variant font-semibold"><tr><th className="p-sm text-left">Seq.</th><th className="p-sm text-left">Data</th><th className="p-sm text-left">Financeira</th><th className="p-sm text-left">Econômica</th><th className="p-sm text-left">Valor</th><th className="p-sm text-left">%</th><th className="p-sm text-center">Ação</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/60">{parcelas.map((parcela, indice) => <tr key={parcela.id}>
            <td className="p-sm">{indice + 1}</td>
            <td className="p-sm"><input type="date" value={parcela.data} onChange={(e) => atualizar(parcela.id, 'data', e.target.value)} className="w-full rounded border border-outline-variant p-1.5" /></td>
            <td className="p-sm"><input inputMode="decimal" value={valorEditavel(parcela.id, 'financeira', parcela.financeira)} onFocus={(e) => iniciarEdicao(parcela.id, 'financeira', e.currentTarget.value)} onBlur={(e) => finalizarEdicao(parcela.id, 'financeira', e.currentTarget.value)} onChange={(e) => { iniciarEdicao(parcela.id, 'financeira', e.target.value); atualizar(parcela.id, 'financeira', normalizarMoeda(e.target.value)); }} className="w-full rounded border border-outline-variant p-1.5" placeholder="R$ 0,00" aria-label={`Valor financeiro da parcela ${indice + 1}`} /></td>
            <td className="p-sm"><input inputMode="decimal" value={valorEditavel(parcela.id, 'economica', parcela.economica)} onFocus={(e) => iniciarEdicao(parcela.id, 'economica', e.currentTarget.value)} onBlur={(e) => finalizarEdicao(parcela.id, 'economica', e.currentTarget.value)} onChange={(e) => { iniciarEdicao(parcela.id, 'economica', e.target.value); atualizar(parcela.id, 'economica', normalizarMoeda(e.target.value)); }} className="w-full rounded border border-outline-variant p-1.5" placeholder="R$ 0,00" aria-label={`Valor econômico da parcela ${indice + 1}`} /></td>
            <td className="p-sm"><input inputMode="decimal" value={valorEditavel(parcela.id, 'valor', parcela.valor)} onFocus={(e) => iniciarEdicao(parcela.id, 'valor', e.currentTarget.value)} onBlur={(e) => finalizarEdicao(parcela.id, 'valor', e.currentTarget.value)} onChange={(e) => { iniciarEdicao(parcela.id, 'valor', e.target.value); atualizar(parcela.id, 'valor', normalizarMoeda(e.target.value)); }} className="w-full rounded border border-outline-variant p-1.5" placeholder="R$ 0,00" aria-label={`Valor da parcela ${indice + 1}`} /></td>
            <td className="p-sm whitespace-nowrap">{total > 0 ? `${((numero(parcela.valor) / total) * 100).toFixed(2)}%` : '0,00%'}</td>
            <td className="p-sm text-center">{indice === parcelas.length - 1 ? <button type="button" onClick={() => salvar(parcela)} disabled={!parcela.valor} className="text-primary disabled:opacity-35" title="Salvar parcela e adicionar outra" aria-label="Salvar parcela e adicionar outra"><span className="material-symbols-outlined">save</span></button> : <button type="button" onClick={() => remover(parcela.id)} className="text-error" title="Remover parcela" aria-label="Remover parcela"><span className="material-symbols-outlined">delete</span></button>}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </FormSection>;
};
