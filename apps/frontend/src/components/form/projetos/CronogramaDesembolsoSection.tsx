import { useEffect, useMemo } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { gerarIdLocal } from '../../../utils/id';
import { converterReaisParaCentavos, CurrencyInput, formatarCentavosComoMoeda } from '../CurrencyInput';
import { FormSection } from '../FormSection';

interface ParcelaDesembolso {
  id: string;
  data: string;
  financeiraCentavos: number;
  economicaCentavos: number;
  valorCentavos: number;
  /** Campos legados mantidos somente durante a migração de rascunhos. */
  financeira?: string;
  economica?: string;
  valor?: string;
}

const parcelaVazia = (): ParcelaDesembolso => ({
  id: gerarIdLocal(),
  data: '',
  financeiraCentavos: 0,
  economicaCentavos: 0,
  valorCentavos: 0,
});

const normalizarParcela = (parcela: ParcelaDesembolso): ParcelaDesembolso => {
  const { financeira, economica, valor, ...campos } = parcela;
  return {
    ...campos,
    financeiraCentavos: Number.isInteger(parcela.financeiraCentavos) && parcela.financeiraCentavos >= 0
      ? parcela.financeiraCentavos : converterReaisParaCentavos(financeira),
    economicaCentavos: Number.isInteger(parcela.economicaCentavos) && parcela.economicaCentavos >= 0
      ? parcela.economicaCentavos : converterReaisParaCentavos(economica),
    valorCentavos: Number.isInteger(parcela.valorCentavos) && parcela.valorCentavos >= 0
      ? parcela.valorCentavos : converterReaisParaCentavos(valor),
  };
};

type CampoTextoParcela = 'data';
type CampoMonetarioParcela = 'financeiraCentavos' | 'economicaCentavos' | 'valorCentavos';

export const CronogramaDesembolsoSection = () => {
  const [valorTotalSalvo, setValorTotalSalvo] = useProcessoState<number | string>('valorTotalProjetoCentavos', 0, ['valorTotalProjeto']);
  const valorTotalCentavos = typeof valorTotalSalvo === 'number' && Number.isInteger(valorTotalSalvo)
    ? Math.max(0, valorTotalSalvo)
    : converterReaisParaCentavos(valorTotalSalvo);
  const [parcelas, setParcelas] = useProcessoState<ParcelaDesembolso[]>('parcelasDesembolso', [parcelaVazia()]);
  const parcelasNormalizadas = useMemo(() => parcelas.map(normalizarParcela), [parcelas]);
  const alocadoCentavos = useMemo(() => parcelasNormalizadas.reduce((soma, parcela) => soma + parcela.valorCentavos, 0), [parcelasNormalizadas]);
  const saldoCentavos = valorTotalCentavos - alocadoCentavos;

  useEffect(() => {
    if (typeof valorTotalSalvo !== 'number' || valorTotalSalvo !== valorTotalCentavos) setValorTotalSalvo(valorTotalCentavos);
  }, [setValorTotalSalvo, valorTotalCentavos, valorTotalSalvo]);

  useEffect(() => {
    if (JSON.stringify(parcelas) !== JSON.stringify(parcelasNormalizadas)) setParcelas(parcelasNormalizadas);
  }, [parcelas, parcelasNormalizadas, setParcelas]);

  const atualizarTexto = (id: string, campo: CampoTextoParcela, valor: string) => {
    setParcelas((atuais) => atuais.map((item) => item.id === id ? { ...normalizarParcela(item), [campo]: valor } : normalizarParcela(item)));
  };

  const atualizarValor = (id: string, campo: CampoMonetarioParcela, valorCentavos: number) => {
    setParcelas((atuais) => atuais.map((item) => item.id === id ? { ...normalizarParcela(item), [campo]: valorCentavos } : normalizarParcela(item)));
  };

  const salvar = (parcela: ParcelaDesembolso) => {
    const normalizada = normalizarParcela(parcela);
    if (!normalizada.data && !normalizada.financeiraCentavos && !normalizada.economicaCentavos && !normalizada.valorCentavos) return;
    setParcelas((atuais) => [...atuais.map(normalizarParcela), parcelaVazia()]);
  };

  const remover = (id: string) => {
    const restantes = parcelasNormalizadas.filter((parcela) => parcela.id !== id);
    setParcelas(restantes.length ? restantes : [parcelaVazia()]);
  };

  return <FormSection numero={7} icone="payments" titulo="Cronograma de Desembolso">
    <div className="col-span-12 space-y-md">
      <div className="grid grid-cols-12 items-end gap-sm">
        <CurrencyInput label="Valor Total do Projeto (R$)" valorCentavos={valorTotalCentavos} onChangeCentavos={setValorTotalSalvo} className="col-span-12 md:col-span-4" />
        <div className={`col-span-12 rounded border p-sm text-[12px] md:col-span-8 ${saldoCentavos === 0 ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant bg-surface-container-low'}`}>
          <span className="font-semibold">Saldo a desembolsar: </span>{formatarCentavosComoMoeda(saldoCentavos)}
          {valorTotalCentavos > 0 && <span className="ml-sm text-on-surface-variant">({((alocadoCentavos / valorTotalCentavos) * 100).toFixed(2)}% alocado)</span>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="min-w-[900px] w-full text-[12px]">
          <thead className="bg-surface-container-low text-on-surface-variant font-semibold"><tr><th className="p-sm text-left">Seq.</th><th className="p-sm text-left">Data</th><th className="p-sm text-left">Financeira</th><th className="p-sm text-left">Econômica</th><th className="p-sm text-left">Valor</th><th className="p-sm text-left">%</th><th className="p-sm text-center">Ação</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/60">{parcelasNormalizadas.map((parcela, indice) => <tr key={parcela.id}>
            <td className="p-sm">{indice + 1}</td>
            <td className="p-sm"><input type="date" value={parcela.data} onChange={(evento) => atualizarTexto(parcela.id, 'data', evento.target.value)} className="h-9 w-full rounded border border-outline-variant px-2" /></td>
            <td className="p-sm"><CurrencyInput ariaLabel={`Valor financeiro da parcela ${indice + 1}`} valorCentavos={parcela.financeiraCentavos} onChangeCentavos={(valor) => atualizarValor(parcela.id, 'financeiraCentavos', valor)} /></td>
            <td className="p-sm"><CurrencyInput ariaLabel={`Valor econômico da parcela ${indice + 1}`} valorCentavos={parcela.economicaCentavos} onChangeCentavos={(valor) => atualizarValor(parcela.id, 'economicaCentavos', valor)} /></td>
            <td className="p-sm"><CurrencyInput ariaLabel={`Valor da parcela ${indice + 1}`} valorCentavos={parcela.valorCentavos} onChangeCentavos={(valor) => atualizarValor(parcela.id, 'valorCentavos', valor)} /></td>
            <td className="p-sm whitespace-nowrap">{valorTotalCentavos > 0 ? `${((parcela.valorCentavos / valorTotalCentavos) * 100).toFixed(2)}%` : '0,00%'}</td>
            <td className="p-sm text-center">{indice === parcelasNormalizadas.length - 1
              ? <button type="button" onClick={() => salvar(parcela)} disabled={!parcela.valorCentavos} className="text-primary disabled:opacity-35" title="Salvar parcela e adicionar outra" aria-label="Salvar parcela e adicionar outra"><span className="material-symbols-outlined">save</span></button>
              : <button type="button" onClick={() => remover(parcela.id)} className="text-error" title="Remover parcela" aria-label="Remover parcela"><span className="material-symbols-outlined">delete</span></button>}
            </td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </FormSection>;
};
