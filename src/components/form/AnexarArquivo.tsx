import { ChangeEvent, useRef } from 'react';

/** Formatos aceitos na janela de seleção do sistema. */
export const FORMATOS_ACEITOS = '.pdf,.png,.jpg,.jpeg';

interface AnexarArquivoProps {
  /** Usado no htmlFor/id — precisa ser único na página. */
  id: string;
  arquivo: File | null;
  onSelecionar: (arquivo: File | null) => void;
}

const formatarTamanho = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};

const ACAO =
  'text-primary-container text-[11px] font-bold uppercase hover:underline cursor-pointer shrink-0';

/**
 * Seleção de arquivo simulada: abre o seletor real do sistema, mas o
 * `File` fica apenas na memória da aba — nada é enviado nem gravado.
 * Componente controlado: quem chama guarda o arquivo escolhido.
 */
export const AnexarArquivo = ({
  id,
  arquivo,
  onSelecionar,
}: AnexarArquivoProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const aoEscolher = (e: ChangeEvent<HTMLInputElement>) => {
    onSelecionar(e.target.files?.[0] ?? null);
  };

  const remover = () => {
    // Zera o input para que reescolher o MESMO arquivo dispare o onChange.
    if (inputRef.current) inputRef.current.value = '';
    onSelecionar(null);
  };

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={FORMATOS_ACEITOS}
        onChange={aoEscolher}
        className="sr-only"
      />

      {arquivo ? (
        <div className="flex items-center gap-sm shrink-0">
          <label htmlFor={id} className={ACAO}>
            Substituir
          </label>
          <button type="button" onClick={remover} className={ACAO}>
            Remover
          </button>
        </div>
      ) : (
        <label htmlFor={id} className={ACAO}>
          Anexar
        </label>
      )}
    </>
  );
};

/** Linha com o arquivo escolhido, exibida abaixo do rótulo do documento. */
export const ArquivoSelecionado = ({ arquivo }: { arquivo: File }) => (
  <p className="flex items-center gap-xs mt-xs pl-[26px] text-[11px] text-on-surface-variant min-w-0">
    <span className="material-symbols-outlined text-[14px] shrink-0">
      description
    </span>
    <span className="truncate" title={arquivo.name}>
      {arquivo.name}
    </span>
    <span className="shrink-0">· {formatarTamanho(arquivo.size)}</span>
  </p>
);
