import { useEffect, useMemo, useState } from 'react';
import { DocumentoExigido } from '../data/programasApoio';
import {
  AnexarArquivo,
  ArquivoSelecionado,
} from './form/AnexarArquivo';
import { useEnvio } from './form/EnvioContext';

interface KitDocumentalProps {
  documentos: DocumentoExigido[];
  titulo?: string;
  /** Texto auxiliar no rodapé do card. */
  nota?: string;
}

/**
 * Kit de Documentos no padrão do Cadastro de Financiadora: uma linha por
 * documento, ícone de estado à esquerda e ação à direita.
 *
 * O anexo é simulado — o `File` escolhido fica só na memória da aba, nada
 * é enviado nem gravado. Contador, barra de progresso e liberação do botão
 * de envio derivam do que foi anexado, nunca de valores fixos.
 */
export const KitDocumental = ({
  documentos,
  titulo = 'Kit de Documentos',
  nota = 'Anexe os documentos obrigatórios para liberar o envio da solicitação.',
}: KitDocumentalProps) => {
  const [anexos, setAnexos] = useState<Record<string, File>>({});
  const { registrarPendencias, formValido, notificarAnexoArquivo } = useEnvio();

  const estaConcluido = (doc: DocumentoExigido) => {
    if (doc.tipo === 'gerado') return formValido;
    return Boolean(anexos[doc.id]);
  };

  const concluidos = documentos.filter(estaConcluido).length;
  const progresso =
    documentos.length > 0 ? (concluidos / documentos.length) * 100 : 0;

  // Documentos externos (encaminhados por terceiros) não travam o envio.
  const pendencias = useMemo(() => {
    let count = 0;
    documentos.forEach((d) => {
      if (d.obrigatorio) {
        if (d.tipo === 'gerado' && !formValido) count++;
        if (d.tipo !== 'gerado' && d.tipo !== 'externo' && !anexos[d.id]) count++;
      }
    });
    return count;
  }, [documentos, anexos, formValido]);

  useEffect(() => {
    registrarPendencias(pendencias);
  }, [pendencias, registrarPendencias]);

  const selecionar = (id: string, arquivo: File | null) => {
    setAnexos((prev) => {
      if (!arquivo) {
        const { [id]: _removido, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: arquivo };
    });
    notificarAnexoArquivo(arquivo ? arquivo.name : '');
  };

  return (
    <section className="bg-surface-container-low border border-outline-variant rounded shadow-sm p-lg">
      <div className="flex items-center justify-between gap-sm mb-md pb-xs border-b border-surface-variant">
        <div className="flex items-center gap-sm min-w-0">
          <span className="material-symbols-outlined text-primary-container">
            attach_file
          </span>
          <h2 className="text-[16px] font-semibold text-primary-container">
            {titulo}
          </h2>
        </div>
        <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-xs py-[2px] rounded uppercase whitespace-nowrap">
          {concluidos}/{documentos.length}
        </span>
      </div>

      <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mb-md">
        <div
          className="bg-secondary h-full transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="flex flex-col gap-sm">
        {documentos.map((doc) => (
          <ItemDocumento
            isConcluido={estaConcluido(doc)}
            key={doc.id}
            doc={doc}
            arquivo={anexos[doc.id] ?? null}
            onSelecionar={(a) => selecionar(doc.id, a)}
          />
        ))}
      </div>

      <p className="text-[10px] text-on-surface-variant mt-sm leading-tight">
        {nota} {documentos.length} documentos previstos.
      </p>
    </section>
  );
};

interface ItemDocumentoProps {
  doc: DocumentoExigido;
  arquivo: File | null;
  onSelecionar: (arquivo: File | null) => void;
  isConcluido?: boolean;
}

const ItemDocumento = ({ doc, arquivo, onSelecionar, isConcluido }: ItemDocumentoProps) => {
  const { formValido } = useEnvio();
  const gerado = doc.tipo === 'gerado';
  const concluido = isConcluido !== undefined ? isConcluido : (gerado ? formValido : Boolean(arquivo));
  const detalhe = [doc.descricao, doc.condicao].filter(Boolean).join(' ');

  return (
    <div
      className={`bg-surface-container-lowest border rounded transition-colors ${
        concluido
          ? 'border-outline-variant'
          : 'border-outline-variant border-dashed hover:border-primary-container'
      }`}
    >
      <div className="flex items-stretch min-h-[72px]">
        {/* Coluna 1: Status / Ícone */}
        <div className="w-[32px] shrink-0 flex flex-col items-center justify-center border-r border-outline-variant/30">
          <span
            className={`material-symbols-outlined text-[18px] ${
              concluido ? 'text-secondary' : 'text-outline'
            }`}
          >
            {concluido
              ? 'check_circle'
              : doc.tipo === 'externo'
                ? 'forward_to_inbox'
                : 'radio_button_unchecked'}
          </span>
        </div>

        {/* Coluna 2: Conteúdo Central */}
        <div className="flex-1 flex flex-col justify-center py-xs px-sm min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-[13px] ${
                concluido
                  ? 'text-on-surface font-medium'
                  : 'text-on-surface-variant'
              }`}
            >
              {doc.label}
            </span>
            {gerado && (
              <span className={`text-[10px] font-bold uppercase shrink-0 ${concluido ? 'text-secondary' : 'text-[#F17C58]'}`}>
                {concluido ? 'Concluído' : 'Pendente'}
              </span>
            )}
            {doc.tipo === 'externo' && (
              <span className="text-on-surface-variant text-[10px] font-bold uppercase shrink-0">
                Externo
              </span>
            )}
          </div>

          {arquivo && (
            <div className="-ml-[26px]">
               <ArquivoSelecionado arquivo={arquivo} />
            </div>
          )}

          {detalhe && (
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight pr-2">
              {detalhe}
            </p>
          )}

          {doc.acaoEmail && (
            <a
              href={`mailto:${doc.acaoEmail.email}`}
              className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary hover:text-primary-container transition-colors w-fit"
            >
              <span className="material-symbols-outlined text-[14px]">mail</span>
              {doc.acaoEmail.label}
            </a>
          )}

          {!doc.obrigatorio && (
             <span className="inline-block mt-1 w-fit text-[9px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded bg-surface-variant text-on-surface-variant">
              Condicional
            </span>
          )}
        </div>

        {/* Coluna 3: Ações (Modelo, Anexar/Remover) */}
        {!gerado && doc.tipo !== 'externo' && (
          <div className="w-[40px] shrink-0 flex flex-col items-center justify-between border-l border-outline-variant/30 py-1">
            <div className="flex flex-col items-center">
              <AnexarArquivo
                id={`anexo-${doc.id}`}
                arquivo={arquivo}
                onSelecionar={onSelecionar}
              />
            </div>
            {doc.url_template && (
              <a
                href={doc.url_template}
                target="_blank"
                rel="noreferrer"
                className="text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0"
                title="Baixar Modelo"
              >
                <span className="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center">file_download</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
