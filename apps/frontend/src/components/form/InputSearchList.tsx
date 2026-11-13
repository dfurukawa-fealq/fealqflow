import { useEffect, useMemo, useRef, useState } from 'react';
import { useEnvio } from './EnvioContext';

interface InputSearchListProps {
  label: string;
  valor: string;
  opcoes: readonly (string | { value: string; label: string })[];
  onChange: (valor: string) => void;
  obrigatorio?: boolean;
  placeholder?: string;
  span?: number;
  hint?: string;
  somenteOpcoes?: boolean;
}

export const InputSearchList = ({ label, valor, opcoes, onChange, obrigatorio = false, placeholder = 'Digite para buscar', span = 12, hint, somenteOpcoes = false }: InputSearchListProps) => {
  const id = `lista-${label.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const { executarAcao } = useEnvio();
  const [erroSalvamento, setErroSalvamento] = useState('');
  const [consulta, setConsulta] = useState(valor);
  const [aberta, setAberta] = useState(false);
  const [erroSelecao, setErroSelecao] = useState(false);
  const valorSelecionado = opcoes.some((opcao) => (typeof opcao === 'string' ? opcao : opcao.value) === valor);
  const consultaSelecionada = valorSelecionado && consulta === valor;
  const selecaoInvalida = somenteOpcoes && (consulta ? !consultaSelecionada : obrigatorio && !valorSelecionado);
  useEffect(() => {
    setConsulta(valor);
    setErroSelecao(false);
  }, [valor]);
  useEffect(() => {
    inputRef.current?.setCustomValidity(selecaoInvalida ? 'Selecione uma opção da lista.' : '');
  }, [selecaoInvalida]);
  const filtradas = useMemo(() => opcoes.filter((opcao) => {
    const { value, label } = typeof opcao === 'string' ? { value: opcao, label: opcao } : opcao;
    const busca = (consultaSelecionada ? '' : consulta).toLocaleLowerCase('pt-BR');
    return value.toLocaleLowerCase('pt-BR').includes(busca) || label.toLocaleLowerCase('pt-BR').includes(busca);
  }), [opcoes, consulta, consultaSelecionada]);
  const largura = span === 6 ? 'col-span-12 md:col-span-6' : span === 4 ? 'col-span-12 md:col-span-4' : 'col-span-12';
  return <div className={largura}>
    <label htmlFor={id} className="mb-xs block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
      {label}{obrigatorio && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      <input ref={inputRef} id={id} type="search" autoComplete="off" name={`busca-${id}`} value={consulta} onFocus={() => setAberta(true)} onBlur={() => window.setTimeout(() => { setAberta(false); if (somenteOpcoes && selecaoInvalida) setErroSelecao(true); }, 150)} onChange={(evento) => {
        const texto = evento.target.value;
        setConsulta(texto);
        setErroSelecao(false);
        if (!somenteOpcoes || !texto) onChange(texto);
        if (somenteOpcoes) evento.target.setCustomValidity(texto && (texto !== valor || !valorSelecionado) ? 'Selecione uma opção da lista.' : '');
        setAberta(true);
      }} placeholder={placeholder} required={obrigatorio} aria-invalid={erroSelecao || undefined} className="w-full rounded border border-outline-variant bg-surface-container-lowest p-sm pr-9 text-[13px] text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
      <span className="material-symbols-outlined pointer-events-none absolute right-sm top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">arrow_drop_down</span>
      {aberta && filtradas.length > 0 && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border border-outline-variant bg-surface-container-lowest shadow-lg">
        {filtradas.map((opcao) => {
          const { value, label: texto } = typeof opcao === 'string' ? { value: opcao, label: opcao } : opcao;
          return <button key={value} type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={() => { onChange(value); setConsulta(value); setErroSelecao(false); inputRef.current?.setCustomValidity(''); setAberta(false); void executarAcao('selecionar_opcao', () => {}, { antes: false, depois: true }).catch((erro: unknown) => setErroSalvamento(erro instanceof Error ? erro.message : 'Falha ao salvar.')); }} className="block w-full px-sm py-sm text-left text-[13px] text-on-surface hover:bg-primary/10">{texto}</button>;
        })}
      </div>}
    </div>
    {erroSalvamento && <span role="alert" className="text-error text-xs">{erroSalvamento}</span>}
    {hint && <span className="mt-xs block text-[10px] text-on-surface-variant">{hint}</span>}
    {erroSelecao && <span role="alert" className="mt-xs block text-[11px] text-error">Selecione um tipo de evento da lista.</span>}
  </div>;
};

