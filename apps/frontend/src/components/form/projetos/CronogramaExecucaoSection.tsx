import { useEffect, useState } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { FormSection } from '../FormSection';
import { Field, CELULA_TABELA } from '../Field';
import { SubTitulo } from '../SubTitulo';

interface Etapa { id: string; titulo: string; descricao: string; inicio: string; fim: string; }
const etapaVazia = (id: string): Etapa => ({ id, titulo: '', descricao: '', inicio: '', fim: '' });

export const CronogramaExecucaoSection = () => {
  const [prazo, setPrazo] = useProcessoState('prazoExecucaoMeses', '');
  const [etapas, setEtapas] = useProcessoState<Etapa[]>('etapasCronograma', [etapaVazia('inicial')]);
  const [novaEtapa, setNovaEtapa] = useProcessoState<Etapa>('etapaCronogramaNova', etapaVazia('nova'));
  const [alteradas, setAlteradas] = useState<Set<string>>(new Set());
  const atualizar = (id: string, campo: keyof Etapa, valor: string) => {
    setEtapas((atuais) => atuais.map((etapa) => etapa.id === id ? { ...etapa, [campo]: valor } : etapa));
    setAlteradas((atuais) => new Set(atuais).add(id));
  };
  const salvarAlteracao = (id: string) => setAlteradas((atuais) => { const proximo = new Set(atuais); proximo.delete(id); return proximo; });
  const acaoEtapa = (id: string) => alteradas.has(id) ? salvarAlteracao(id) : remover(id);
  const adicionar = () => {
    if (!novaEtapa.titulo.trim()) return;
    setEtapas((atuais) => [...atuais, { ...novaEtapa, id: `etapa-${Date.now()}` }]);
    setNovaEtapa(etapaVazia('nova'));
  };
  const remover = (id: string) => setEtapas((atuais) => atuais.length > 1 ? atuais.filter((etapa) => etapa.id !== id) : atuais);
  useEffect(() => {
    if (prazo.trim() || etapas.length === 0) return;
    const datas = etapas.filter((etapa) => etapa.inicio && etapa.fim);
    if (datas.length === 0) return;
    const inicio = datas.map((etapa) => etapa.inicio.slice(0, 7)).sort()[0];
    const fim = datas.map((etapa) => etapa.fim.slice(0, 7)).sort().at(-1);
    if (!inicio || !fim) return;
    const [anoInicio, mesInicio] = inicio.split('-').map(Number);
    const [anoFim, mesFim] = fim.split('-').map(Number);
    const meses = Math.max(1, (anoFim - anoInicio) * 12 + mesFim - mesInicio + 1);
    setPrazo(String(meses));
  }, [etapas, prazo, setPrazo]);
  return <FormSection numero={5} icone="calendar_month" titulo="Cronograma de Execução e Etapas">
    <SubTitulo>Fases do Projeto</SubTitulo>
    <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">Cadastre as fases do plano de trabalho com descrição e período de vigência.</p>
    <div className="col-span-12 overflow-x-auto rounded-lg border border-outline-variant"><table className="min-w-[900px] w-full text-[12px] text-left"><thead className="bg-surface-container-low text-on-surface-variant font-semibold"><tr><th className="p-sm">Nº</th><th className="p-sm">Título da Etapa</th><th className="p-sm">Descrição das Atividades / Entregáveis</th><th className="p-sm">Início</th><th className="p-sm">Término</th><th className="p-sm">Ação</th></tr></thead><tbody><tr className="bg-surface-container-lowest"><td className="p-sm text-center text-on-surface-variant">+</td><td className="p-sm"><input className={CELULA_TABELA} value={novaEtapa.titulo} onChange={(e) => setNovaEtapa((atual) => ({ ...atual, titulo: e.target.value }))} placeholder="Título da etapa" /></td><td className="p-sm"><textarea className={`${CELULA_TABELA} h-auto resize-none py-xs`} rows={2} value={novaEtapa.descricao} onChange={(e) => setNovaEtapa((atual) => ({ ...atual, descricao: e.target.value }))} placeholder="Atividades e entregáveis" /></td><td className="p-sm"><input className={CELULA_TABELA} type="date" value={novaEtapa.inicio} onChange={(e) => setNovaEtapa((atual) => ({ ...atual, inicio: e.target.value }))} /></td><td className="p-sm"><input className={CELULA_TABELA} type="date" value={novaEtapa.fim} onChange={(e) => setNovaEtapa((atual) => ({ ...atual, fim: e.target.value }))} /></td><td className="p-sm text-center"><button type="button" onClick={adicionar} disabled={!novaEtapa.titulo.trim()} className="text-primary disabled:opacity-35" title="Salvar etapa e adicionar outra" aria-label="Salvar etapa e adicionar outra"><span className="material-symbols-outlined">save</span></button></td></tr>{etapas.map((etapa, indice) => <tr key={etapa.id} className="border-t border-outline-variant/50"><td className="p-sm text-center text-on-surface-variant">{indice + 1}</td><td className="p-sm"><input className={CELULA_TABELA} value={etapa.titulo} onChange={(e) => atualizar(etapa.id, 'titulo', e.target.value)} placeholder="Título da etapa" /></td><td className="p-sm"><textarea className={`${CELULA_TABELA} h-auto resize-none py-xs`} rows={2} value={etapa.descricao} onChange={(e) => atualizar(etapa.id, 'descricao', e.target.value)} placeholder="Atividades e entregáveis" /></td><td className="p-sm"><input className={CELULA_TABELA} type="date" value={etapa.inicio} onChange={(e) => atualizar(etapa.id, 'inicio', e.target.value)} /></td><td className="p-sm"><input className={CELULA_TABELA} type="date" value={etapa.fim} onChange={(e) => atualizar(etapa.id, 'fim', e.target.value)} /></td><td className="p-sm text-center"><button type="button" onClick={() => remover(etapa.id)} className="text-error" title="Remover etapa" aria-label={`Remover etapa ${indice + 1}`}><span className="material-symbols-outlined">delete</span></button></td></tr>)}</tbody></table></div>
    <SubTitulo>Duração Total Prevista</SubTitulo>
    <Field label="Prazo Total em Meses" span={3} tipo="number" valor={prazo} onChange={setPrazo} hint="Calculado pelas etapas quando deixado vazio." />
  </FormSection>;
};
