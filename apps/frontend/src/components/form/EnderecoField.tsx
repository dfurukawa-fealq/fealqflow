import { useState } from 'react';
import { buscarEnderecoPorCep } from '../../utils/cep';
import { formatCEP } from '../../utils/formatters';
import { useProcessoState } from '../../contexts/ProcessoContext';
import { Field, LABEL } from './Field';

export interface EnderecoFieldProps {
  titulo?: string;
  descricao?: string;
  prefixo?: string;
  obrigatorio?: boolean;
}

/** Endereço reutilizável com preenchimento dos dados pelo serviço ViaCEP. */
export const EnderecoField = ({
  titulo = 'Local e Endereço Completo de Realização',
  descricao = 'Preencha o CEP para autocompletar o logradouro',
  prefixo = 'endereco',
  obrigatorio = false,
}: EnderecoFieldProps) => {
  const chave = (nome: string) => prefixo ? `${prefixo}${nome}` : nome.toLocaleLowerCase('pt-BR');
  const [cep, setCep] = useProcessoState(chave('Cep'), '');
  const [logradouro, setLogradouro] = useProcessoState(chave('Logradouro'), '');
  const [numero, setNumero] = useProcessoState(chave('Numero'), '');
  const [complemento, setComplemento] = useProcessoState(chave('Complemento'), '');
  const [bairro, setBairro] = useProcessoState(chave('Bairro'), '');
  const [cidade, setCidade] = useProcessoState(chave('Cidade'), '');
  const [uf, setUf] = useProcessoState(chave('Uf'), '');
  const [buscando, setBuscando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const buscarCep = async () => {
    const valor = cep.replace(/\D/g, '');
    if (valor.length !== 8) {
      setMensagem('Informe um CEP válido com 8 dígitos.');
      return;
    }
    setBuscando(true);
    setMensagem('');
    try {
      const resultado = await buscarEnderecoPorCep(valor);
      if (!resultado.sucesso) {
        setMensagem(resultado.erro ?? 'Não foi possível consultar o CEP.');
        return;
      }
      setLogradouro(resultado.logradouro);
      setBairro(resultado.bairro);
      setCidade(resultado.cidade);
      setUf(resultado.uf);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low/60 p-md">
      <div className="mb-sm flex items-center justify-between gap-sm border-b border-outline-variant/60 pb-xs">
        <h3 className="flex items-center gap-xs text-[13px] font-bold text-on-surface">
          <span className="material-symbols-outlined text-[19px] text-primary">location_on</span>
          {titulo}
        </h3>
        <span className="text-right text-[11px] text-on-surface-variant">{descricao}</span>
      </div>

      <div className="grid grid-cols-12 gap-sm">
        <div className="col-span-12 min-w-0 md:col-span-4">
          <label className={LABEL} htmlFor={`${prefixo}-cep`}>CEP{obrigatorio && <span className="ml-0.5 text-red-500">*</span>}</label>
          <div className="relative flex">
            <input
              id={`${prefixo}-cep`}
              value={cep}
              onChange={(event) => { setCep(formatCEP(event.target.value)); setMensagem(''); }}
              onBlur={() => void buscarCep()}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void buscarCep(); } }}
              placeholder="13418-900"
              inputMode="numeric"
              required={obrigatorio}
              className="h-[36px] w-full rounded border border-outline-variant bg-surface-container-lowest px-sm pr-24 text-[13px] text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
            <button type="button" onClick={() => void buscarCep()} disabled={buscando} className="absolute right-1 top-1 bottom-1 flex items-center gap-1 rounded bg-primary px-3 text-[11px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70">
              <span className="material-symbols-outlined text-[16px]">{buscando ? 'progress_activity' : 'search'}</span>
              {buscando ? 'Buscando' : 'Buscar'}
            </button>
          </div>
        </div>
        <Field label="Logradouro" span={8} valor={logradouro} onChange={setLogradouro} placeholder="Avenida Pádua Dias" obrigatorio={obrigatorio} />
        <Field label="Número" span={2} valor={numero} onChange={setNumero} placeholder="11" obrigatorio={obrigatorio} />
        <Field label="Complemento" span={6} valor={complemento} onChange={setComplemento} placeholder="Edifício Central, Sala 2" />
        <Field label="Bairro" span={4} valor={bairro} onChange={setBairro} placeholder="Agronomia" obrigatorio={obrigatorio} />
        <Field label="Cidade" span={5} valor={cidade} onChange={setCidade} placeholder="Piracicaba" obrigatorio={obrigatorio} />
        <Field label="UF" span={3} valor={uf} onChange={setUf} placeholder="SP" obrigatorio={obrigatorio} />
        {mensagem && <p className="col-span-12 text-[11px] text-error" role="alert">{mensagem}</p>}
      </div>
    </div>
  );
};
