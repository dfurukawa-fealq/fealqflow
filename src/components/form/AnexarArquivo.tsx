import { ChangeEvent, useRef, useMemo } from 'react';

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
  'text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0';

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
        <div className="flex items-center shrink-0">
          <button type="button" onClick={remover} className="text-error hover:bg-error-container/20 flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0" title="Remover anexo">
            <span className="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center">delete</span>
          </button>
        </div>
      ) : (
        <label htmlFor={id} className={ACAO} title="Anexar arquivo">
          <span className="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center">attach_file</span>
        </label>
      )}
    </>
  );
};

/** Linha com o arquivo escolhido, exibida abaixo do rótulo do documento. */
export const ArquivoSelecionado = ({ arquivo }: { arquivo: File }) => {
  const fileUrl = useMemo(() => URL.createObjectURL(arquivo), [arquivo]);
  const extension = arquivo.name.split('.').pop()?.toLowerCase() || 'arquivo';

  return (
    <p className="flex items-center gap-xs mt-xs pl-[26px] text-[11px] text-on-surface-variant min-w-0">
      <span className="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center shrink-0 text-primary-container">
        description
      </span>
      <span className="truncate">
        Anexado:{' '}
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-primary-container font-semibold hover:underline"
          title={`Visualizar ${arquivo.name}`}
        >
          Tipo: {extension} - Tam: {formatarTamanho(arquivo.size)}
        </a>
      </span>
    </p>
  );
};
