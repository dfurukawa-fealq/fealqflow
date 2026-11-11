import { useEffect, useState } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { gerarIdLocal } from '../../../utils/id';
import { FormSection } from '../FormSection';
import { CELULA_TABELA } from '../Field';

interface Etapa {
  id: string;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
}

interface PrazoExecucao {
  auto: boolean;
  value: number;
}

type PrazoExecucaoLegado = PrazoExecucao | string | number;

const etapaVazia = (): Etapa => ({ id: '', titulo: '', descricao: '', inicio: '', fim: '' });

const normalizarPrazo = (prazo: PrazoExecucaoLegado): PrazoExecucao => {
  if (typeof prazo === 'object' && prazo !== null && typeof prazo.auto === 'boolean') {
    return { auto: prazo.auto, value: Math.max(0, Number(prazo.value) || 0) };
  }
  if (prazo === '') return { auto: true, value: 0 };
  return { auto: false, value: Math.max(0, Number(prazo) || 0) };
};

const calcularPrazoEmMeses = (etapas: Etapa[]): number => {
  const periodos = etapas
    .filter((etapa) => etapa.inicio && etapa.fim && etapa.fim >= etapa.inicio)
    .map((etapa) => ({ inicio: etapa.inicio.slice(0, 7), fim: etapa.fim.slice(0, 7) }));
  if (periodos.length === 0) return 0;

  const inicio = periodos.map((periodo) => periodo.inicio).sort()[0];
  const fim = periodos.map((periodo) => periodo.fim).sort().at(-1);
  if (!inicio || !fim) return 0;

  const [anoInicio, mesInicio] = inicio.split('-').map(Number);
  const [anoFim, mesFim] = fim.split('-').map(Number);
  return Math.max(1, (anoFim - anoInicio) * 12 + mesFim - mesInicio + 1);
};

export const CronogramaExecucaoSection = () => {
  const [prazoSalvo, setPrazoSalvo] = useProcessoState<PrazoExecucaoLegado>(
    'prazoExecucaoMeses',
    { auto: true, value: 0 },
  );
  const prazo = normalizarPrazo(prazoSalvo);
  const [etapas, setEtapas] = useProcessoState<Etapa[]>('etapasCronograma', []);
  const [novaEtapa, setNovaEtapa] = useProcessoState<Etapa>('etapaCronogramaNova', etapaVazia);
  const [alteradas, setAlteradas] = useState<Set<string>>(new Set());
  const colunas = 'grid-cols-[36px_minmax(150px,1.1fr)_minmax(230px,1.8fr)_132px_132px_52px]';

  useEffect(() => {
    if (typeof prazoSalvo !== 'object' || prazoSalvo === null) setPrazoSalvo(normalizarPrazo(prazoSalvo));
  }, [prazoSalvo, setPrazoSalvo]);

  useEffect(() => {
    const etapa = etapas[0];
    if (etapas.length === 1 && etapa?.id === 'inicial'
      && !etapa.titulo && !etapa.descricao && !etapa.inicio && !etapa.fim) setEtapas([]);
  }, [etapas, setEtapas]);

  const atualizarPrazoAutomatico = (proximasEtapas: Etapa[]) => {
    if (prazo.auto) setPrazoSalvo({ auto: true, value: calcularPrazoEmMeses(proximasEtapas) });
  };

  const atualizar = (id: string, campo: keyof Etapa, valor: string) => {
    setEtapas((atuais) => atuais.map((etapa) => etapa.id === id ? { ...etapa, [campo]: valor } : etapa));
    setAlteradas((atuais) => new Set(atuais).add(id));
  };

  const adicionar = () => {
    if (!novaEtapa.titulo.trim()) return;
    const etapa = { ...novaEtapa, id: gerarIdLocal() };
    const proximas = [...etapas, etapa];
    setEtapas(proximas);
    atualizarPrazoAutomatico(proximas);
    setNovaEtapa(etapaVazia());
  };

  const salvarAlteracao = (id: string) => {
    atualizarPrazoAutomatico(etapas);
    setAlteradas((atuais) => {
      const proximo = new Set(atuais);
      proximo.delete(id);
      return proximo;
    });
  };

  const remover = (id: string) => {
    const proximas = etapas.filter((etapa) => etapa.id !== id);
    setEtapas(proximas);
    atualizarPrazoAutomatico(proximas);
    setAlteradas((atuais) => {
      const proximo = new Set(atuais);
      proximo.delete(id);
      return proximo;
    });
  };

  const alternarCalculoAutomatico = (auto: boolean) => {
    setPrazoSalvo({ auto, value: auto ? calcularPrazoEmMeses(etapas) : prazo.value });
  };

  const alterarPrazoManualmente = (valor: string) => {
    setPrazoSalvo({ auto: false, value: Math.max(0, Math.trunc(Number(valor) || 0)) });
  };

  const campoEtapa = (etapa: Etapa, campo: keyof Omit<Etapa, 'id'>, nova: boolean) => {
    const alterar = (valor: string) => nova
      ? setNovaEtapa((atual) => ({ ...atual, [campo]: valor }))
      : atualizar(etapa.id, campo, valor);

    if (campo === 'descricao') return <textarea
      className={`${CELULA_TABELA} h-auto min-h-[54px] resize-y py-xs`}
      rows={2}
      value={etapa[campo]}
      onChange={(evento) => alterar(evento.target.value)}
      placeholder="Atividades e entregáveis"
    />;

    return <input
      className={CELULA_TABELA}
      type={campo === 'inicio' || campo === 'fim' ? 'date' : 'text'}
      value={etapa[campo]}
      onChange={(evento) => alterar(evento.target.value)}
      placeholder={campo === 'titulo' ? 'Título da etapa' : undefined}
    />;
  };

  return <FormSection numero={5} icone="calendar_month" titulo="Cronograma de Execução e Etapas">
    <div className="col-span-12 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Fases do Projeto</h3>
          <p className="text-xs text-on-surface-variant">Cadastre cada fase e seu período. O prazo considera a primeira data de início e a última data de término.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <span className="material-symbols-outlined text-[16px]">date_range</span>
          {etapas.length} {etapas.length === 1 ? 'etapa salva' : 'etapas salvas'}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <div className={`grid min-w-[900px] ${colunas} gap-2 bg-surface-container-low px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant`}>
          <span className="text-center">Nº</span><span>Título da Etapa</span><span>Descrição das Atividades / Entregáveis</span><span>Início</span><span>Término</span><span className="text-center">Ação</span>
        </div>
        <div className={`grid min-w-[900px] ${colunas} items-center gap-2 border-b border-outline-variant bg-primary/[0.03] p-2`}>
          <span className="flex h-6 w-6 items-center justify-center justify-self-center rounded-full bg-primary/10 text-xs font-bold text-primary">+</span>
          {campoEtapa(novaEtapa, 'titulo', true)}
          {campoEtapa(novaEtapa, 'descricao', true)}
          {campoEtapa(novaEtapa, 'inicio', true)}
          {campoEtapa(novaEtapa, 'fim', true)}
          <button type="button" onClick={adicionar} disabled={!novaEtapa.titulo.trim()} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-primary hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-35" title="Salvar nova etapa" aria-label="Salvar nova etapa"><span className="material-symbols-outlined text-[22px]">save</span></button>
        </div>
        {etapas.map((etapa, indice) => <div key={etapa.id} className={`grid min-w-[900px] ${colunas} items-center gap-2 border-b border-outline-variant/60 p-2 last:border-0 ${alteradas.has(etapa.id) ? 'bg-primary/5' : 'bg-surface-container-lowest'}`}>
          <span className="text-center text-xs font-semibold text-on-surface-variant">{indice + 1}</span>
          {campoEtapa(etapa, 'titulo', false)}
          {campoEtapa(etapa, 'descricao', false)}
          {campoEtapa(etapa, 'inicio', false)}
          {campoEtapa(etapa, 'fim', false)}
          {alteradas.has(etapa.id)
            ? <button type="button" onClick={() => salvarAlteracao(etapa.id)} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-primary hover:text-primary/70" title="Salvar alterações" aria-label={`Salvar alterações da etapa ${indice + 1}`}><span className="material-symbols-outlined text-[22px]">save</span></button>
            : <button type="button" onClick={() => remover(etapa.id)} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-error hover:text-error/70" title="Remover etapa" aria-label={`Remover etapa ${indice + 1}`}><span className="material-symbols-outlined text-[22px]">delete</span></button>}
        </div>)}
      </div>
    </div>

    <div className="col-span-12 rounded-xl border border-outline-variant bg-surface-container-low p-3 sm:p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-on-surface">Duração Total Prevista</h3>
        <p className="text-xs text-on-surface-variant">Defina manualmente ou mantenha o cálculo baseado nas etapas salvas.</p>
      </div>

      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(160px,220px)_minmax(220px,1fr)]">
        <label className="block min-w-0">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Prazo Total em Meses</span>
          <input
            type="number"
            min={0}
            step={1}
            value={prazo.value}
            onChange={(evento) => alterarPrazoManualmente(evento.target.value)}
            className="h-9 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-[13px] text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </label>

        <div className="min-w-0">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Modo de Cálculo</span>
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 text-[13px] font-semibold text-on-surface">
            <input type="checkbox" checked={prazo.auto} onChange={(evento) => alternarCalculoAutomatico(evento.target.checked)} className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary" />
            Cálculo automático pelas etapas
          </label>
        </div>
      </div>

      <p className="mt-3 flex min-h-9 items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-primary">info</span>
        <span>
          {prazo.value > 0
            ? `Duração prevista: ${prazo.value} ${prazo.value === 1 ? 'mês' : 'meses'}. ${prazo.auto ? 'O valor será atualizado ao salvar ou remover etapas.' : 'O valor foi definido manualmente.'}`
            : prazo.auto ? 'Informe as datas das etapas e salve-as para calcular automaticamente a duração prevista.' : 'Informe manualmente o prazo total de execução.'}
        </span>
      </p>
    </div>
  </FormSection>;
};
