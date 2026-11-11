import { useEffect, useMemo, useState } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { gerarIdLocal } from '../../../utils/id';
import { converterReaisParaCentavos, CurrencyInput } from '../CurrencyInput';
import { Field } from '../Field';

interface Financiadora {
  id: string;
  nome: string;
  contato: string;
  email: string;
  valorCentavos: number;
  /** Campo mantido somente para migrar rascunhos anteriores ao CurrencyInput. */
  valor?: string;
  origem: string;
}

const vazia = (): Financiadora => ({
  id: '',
  nome: '',
  contato: '',
  email: '',
  valorCentavos: 0,
  origem: 'Recurso Privado Nacional',
});

const origens = ['Recurso Privado Nacional', 'Recurso Privado Internacional', 'Entidade Pública / Fomento', 'Misto'];
const CONTROLE = 'h-9 w-full min-w-0 rounded border border-outline-variant bg-surface-container-lowest px-3 text-[13px] text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container';
const ROTULO = 'mb-1 block text-[10px] font-bold uppercase tracking-wide text-on-surface-variant';
const camposUppercase = new Set<keyof Financiadora>(['nome', 'contato']);
const normalizarTexto = (campo: keyof Financiadora, valor: string) => camposUppercase.has(campo) ? valor.toLocaleUpperCase('pt-BR') : valor;
const normalizarFinanciadora = (item: Financiadora): Financiadora => {
  const { valor: valorLegado, ...campos } = item;
  return {
    ...campos,
    nome: normalizarTexto('nome', item.nome),
    contato: normalizarTexto('contato', item.contato),
    valorCentavos: Number.isInteger(item.valorCentavos) && item.valorCentavos >= 0
      ? item.valorCentavos
      : converterReaisParaCentavos(valorLegado),
  };
};

export const InstituicoesFinanciadorasSection = () => {
  const [registros, setRegistros] = useProcessoState<Financiadora[]>('instituicoesFinanciadoras', []);
  const [novo, setNovo] = useProcessoState<Financiadora>('instituicaoFinanciadoraNova', () => {
    const legado = registros.find((item) => !item.nome.trim());
    return legado ? normalizarFinanciadora(legado) : vazia();
  });
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const registrosSalvos = useMemo(() => registros.filter((item) => item.nome.trim()), [registros]);

  useEffect(() => {
    const normalizados = registrosSalvos.map(normalizarFinanciadora);
    if (JSON.stringify(registros) !== JSON.stringify(normalizados)) setRegistros(normalizados);
  }, [registros, registrosSalvos, setRegistros]);

  const atualizarNovo = (campo: 'nome' | 'contato' | 'email' | 'origem', valor: string) => {
    setNovo((atual) => ({ ...atual, [campo]: normalizarTexto(campo, valor) }));
  };

  const atualizar = (id: string, campo: 'nome' | 'contato' | 'email' | 'origem', valor: string) => {
    setRegistros((atuais) => atuais.map((item) => item.id === id ? { ...item, [campo]: normalizarTexto(campo, valor) } : item));
  };

  const adicionar = () => {
    if (!novo.nome.trim()) return;
    setRegistros((atuais) => [...atuais.filter((item) => item.nome.trim()), normalizarFinanciadora({
      ...novo,
      id: gerarIdLocal(),
    })]);
    setNovo(vazia());
  };

  const remover = (id: string) => {
    setRegistros((atuais) => atuais.filter((item) => item.id !== id));
    setExpandidos((atuais) => {
      const proximos = new Set(atuais);
      proximos.delete(id);
      return proximos;
    });
  };

  const alternarDetalhes = (id: string) => setExpandidos((atuais) => {
    const proximos = new Set(atuais);
    if (proximos.has(id)) proximos.delete(id);
    else proximos.add(id);
    return proximos;
  });

  return <div className="col-span-12 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3 sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-primary">business</span>
          Instituições Envolvidas (Financiadoras)
        </h4>
        <p className="mt-0.5 text-[11px] text-on-surface-variant">Cadastre a instituição e acompanhe os registros na lista abaixo.</p>
      </div>
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
        {registrosSalvos.length} {registrosSalvos.length === 1 ? 'instituição' : 'instituições'}
      </span>
    </div>

    <div className="grid grid-cols-12 items-end gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-low p-3">
      <Field label="Nome da Empresa / Instituição Parceira" span={6} placeholder="Razão Social ou Nome Fantasia" valor={novo.nome} onChange={(valor) => atualizarNovo('nome', valor)} />
      <Field label="Ponto de Contato (Nome/Área)" span={6} placeholder="Ex.: João Silva - RH / Treinamento" valor={novo.contato} onChange={(valor) => atualizarNovo('contato', valor)} />
      <Field label="E-mail de Contato da Empresa" span={4} tipo="email" placeholder="contato@empresa.com.br" valor={novo.email} onChange={(valor) => atualizarNovo('email', valor)} />
      <CurrencyInput id="nova-financiadora-valor" label="Valor Total Previsto (R$)" valorCentavos={novo.valorCentavos ?? converterReaisParaCentavos(novo.valor)} onChangeCentavos={(valorCentavos) => setNovo((atual) => ({ ...atual, valorCentavos, valor: undefined }))} className="col-span-12 md:col-span-4" />
      <Field label="Origem dos Recursos" span={3} tipo="select" opcoes={origens} valor={novo.origem} onChange={(valor) => atualizarNovo('origem', valor)} />
      <div className="col-span-12 flex justify-end md:col-span-1">
        <button type="button" onClick={adicionar} disabled={!novo.nome.trim()} className="inline-flex h-9 w-9 items-center justify-center rounded text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-35" title="Salvar instituição" aria-label="Salvar instituição"><span className="material-symbols-outlined text-[22px]">save</span></button>
      </div>
    </div>

    <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant">
      <div className="grid grid-cols-[minmax(180px,1fr)_150px_96px] gap-2 bg-surface-container-low px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        <span>Instituição</span><span>Valor</span><span className="text-center">Ação</span>
      </div>

      {registrosSalvos.length === 0 ? <p className="px-3 py-5 text-center text-xs italic text-on-surface-variant">Nenhuma instituição cadastrada.</p> : registrosSalvos.map((item) => {
        const expandido = expandidos.has(item.id);
        return <div key={item.id} className="border-t border-outline-variant/60 first:border-t-0">
          <div className="grid grid-cols-[minmax(180px,1fr)_150px_96px] items-center gap-2 bg-surface-container-lowest px-3 py-2">
            <input value={item.nome} onChange={(evento) => atualizar(item.id, 'nome', evento.target.value)} className={`${CONTROLE} uppercase`} aria-label="Instituição" />
            <CurrencyInput ariaLabel={`Valor previsto de ${item.nome}`} valorCentavos={item.valorCentavos ?? converterReaisParaCentavos(item.valor)} onChangeCentavos={(valorCentavos) => setRegistros((atuais) => atuais.map((registro) => registro.id === item.id ? { ...registro, valorCentavos, valor: undefined } : registro))} />
            <div className="flex items-center justify-center gap-1">
              <button type="button" onClick={() => alternarDetalhes(item.id)} aria-expanded={expandido} className="inline-flex h-8 w-8 items-center justify-center rounded text-primary hover:bg-primary/10" title={expandido ? 'Recolher detalhes' : 'Expandir detalhes'} aria-label={`${expandido ? 'Recolher' : 'Expandir'} detalhes de ${item.nome}`}><span className={`material-symbols-outlined text-[21px] transition-transform ${expandido ? 'rotate-180' : ''}`}>expand_more</span></button>
              <button type="button" onClick={() => remover(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded text-error hover:bg-error/10" title="Remover instituição" aria-label={`Remover ${item.nome}`}><span className="material-symbols-outlined text-[20px]">delete</span></button>
            </div>
          </div>

          {expandido && <div className="grid grid-cols-1 gap-3 border-t border-outline-variant/50 bg-surface-container-low p-3 md:grid-cols-3">
            <label className="min-w-0"><span className={ROTULO}>Ponto de Contato (Nome/Área)</span><input value={item.contato} onChange={(evento) => atualizar(item.id, 'contato', evento.target.value)} className={`${CONTROLE} uppercase`} placeholder="Ex.: João Silva - RH / Treinamento" /></label>
            <label className="min-w-0"><span className={ROTULO}>E-mail de Contato</span><input type="email" value={item.email} onChange={(evento) => atualizar(item.id, 'email', evento.target.value)} className={CONTROLE} placeholder="contato@empresa.com.br" /></label>
            <label className="min-w-0"><span className={ROTULO}>Origem dos Recursos</span><select value={item.origem} onChange={(evento) => atualizar(item.id, 'origem', evento.target.value)} className={CONTROLE}>{origens.map((origem) => <option key={origem} value={origem}>{origem}</option>)}</select></label>
          </div>}
        </div>;
      })}
    </div>
  </div>;
};
