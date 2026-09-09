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
      className={`p-sm bg-surface-container-lowest border rounded transition-colors ${
        concluido
          ? 'border-outline-variant'
          : 'border-outline-variant border-dashed hover:border-primary-container'
      }`}
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="flex items-start gap-sm min-w-0">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${
              concluido ? 'text-secondary' : 'text-outline'
            }`}
          >
            {concluido
              ? 'check_circle'
              : doc.tipo === 'externo'
                ? 'forward_to_inbox'
                : 'radio_button_unchecked'}
          </span>
          <span
            className={`text-[13px] ${
              concluido
                ? 'text-on-surface font-medium'
                : 'text-on-surface-variant'
            }`}
          >
            {doc.label}
          </span>
        </div>

        {gerado ? (
          <span className={`text-[11px] font-bold uppercase shrink-0 ${concluido ? 'text-secondary' : 'text-[#F17C58]'}`}>
            {concluido ? 'Concluído' : 'Pendente'}
          </span>
        ) : doc.tipo === 'externo' ? (
          <span className="text-on-surface-variant text-[11px] font-bold uppercase shrink-0">
            Externo
          </span>
        ) : (
          <div className="flex items-center gap-sm shrink-0">
            {doc.url_template && (
              <a
                href={doc.url_template}
                target="_blank"
                rel="noreferrer"
                className="text-primary-container text-[11px] font-bold uppercase hover:underline shrink-0"
              >
                Modelo
              </a>
            )}
            <AnexarArquivo
              id={`anexo-${doc.id}`}
              arquivo={arquivo}
              onSelecionar={onSelecionar}
            />
          </div>
        )}
      </div>

      {arquivo && <ArquivoSelecionado arquivo={arquivo} />}

      {detalhe && (
        <p className="text-[10px] text-on-surface-variant mt-xs leading-tight pl-[26px]">
          {detalhe}
        </p>
      )}

      {doc.acaoEmail && (
        <a
          href={`mailto:${doc.acaoEmail.email}`}
          className="inline-flex items-center gap-1 mt-xs ml-[26px] text-[11px] font-medium text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">mail</span>
          {doc.acaoEmail.label}
        </a>
      )}

      {!doc.obrigatorio && (
        <span className="inline-block mt-xs ml-[26px] text-[9px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded bg-surface-variant text-on-surface-variant">
          Condicional
        </span>
      )}
    </div>
  );
};
