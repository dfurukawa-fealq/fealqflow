import { useProcessoState } from '../../../contexts/ProcessoContext';
import { UNIDADES_USP } from '../../../data/listas';
import { FormSection } from '../FormSection';
import { Field } from '../Field';
import { InputSearchList } from '../InputSearchList';

export const CienciaConcordanciaSection = ({ numero = 6 }: { numero?: number }) => {
  const [unidade, setUnidade] = useProcessoState('coordUnidade', '');
  const [aprovacao, setAprovacao] = useProcessoState<'conselho' | 'ad_referendum'>('aprovacaoDepto', 'conselho');
  const [data, setData] = useProcessoState('dataAprovacaoConselho', '');
  const [isenta, setIsenta] = useProcessoState<'sim' | 'nao'>('isencaoTaxaDepto', 'nao');
  return <FormSection numero={numero} icone="account_balance" titulo="Ciência e Concordância do Departamento (USP)">
    <div className="col-span-12 rounded bg-neutral-100 p-sm text-[11px] font-medium text-neutral-800">Incluído em projetos com participação de docentes USP.</div>
    <InputSearchList label="Departamento / Unidade" opcoes={UNIDADES_USP} placeholder="Digite ou selecione uma unidade" obrigatorio valor={unidade} onChange={setUnidade} />
    <div className="col-span-12 space-y-sm rounded-lg border border-outline-variant/60 bg-surface-container-low p-md"><span className="block text-[13px] font-bold text-on-surface">Modalidade de Aprovação do Departamento:</span><label className="flex items-start gap-sm text-[12px] text-on-surface"><input type="radio" name="aprovacaoDepto" checked={aprovacao === 'conselho'} onChange={() => setAprovacao('conselho')} className="mt-0.5" />Aprovado pelo Conselho do Departamento.</label>{aprovacao === 'conselho' && <Field label="Data da Reunião do Conselho" tipo="date" span={4} valor={data} onChange={setData} />}<label className="flex items-start gap-sm text-[12px] text-on-surface"><input type="radio" name="aprovacaoDepto" checked={aprovacao === 'ad_referendum'} onChange={() => setAprovacao('ad_referendum')} className="mt-0.5" />Aprovado ad referendum do Conselho do Departamento.</label></div>
    <div className="col-span-12 flex flex-col justify-between gap-sm rounded-lg border border-outline-variant/60 bg-surface-container-low p-md sm:flex-row sm:items-center"><span className="text-[13px] font-bold text-on-surface">O Departamento isenta a taxa que lhe cabe?</span><div className="flex gap-lg"><label className="flex items-center gap-xs text-[13px]"><input type="radio" name="isencaoTaxaDepto" checked={isenta === 'sim'} onChange={() => setIsenta('sim')} />SIM</label><label className="flex items-center gap-xs text-[13px]"><input type="radio" name="isencaoTaxaDepto" checked={isenta === 'nao'} onChange={() => setIsenta('nao')} />NÃO</label></div></div>
  </FormSection>;
};
