import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  /** Destaque ou ação integrada apresentada junto ao Kit Documental */
  destaque?: React.ReactNode;
  /** Torna documentos vinculados acionáveis pelo card inteiro. */
  acaoNoCard?: boolean;
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
  destaque,
  acaoNoCard = false,
}: KitDocumentalProps) => {
  const [anexos, setAnexos] = useState<Record<string, File>>({});
  const { registrarPendencias } = useEnvio();

  const estaConcluido = (doc: DocumentoExigido) => {
    if (doc.status !== undefined) {
      return doc.status === 'concluido';
    }
    return (doc.tipo === 'gerado' && !doc.url_template) || Boolean(anexos[doc.id]);
  };

  const concluidos = documentos.filter(estaConcluido).length;
  const progresso =
    documentos.length > 0 ? (concluidos / documentos.length) * 100 : 0;

  // Documentos externos (encaminhados por terceiros) não travam o envio.
  const pendencias = useMemo(
    () =>
      documentos.filter((d) => {
        if (!d.obrigatorio) return false;
        if (d.status !== undefined) {
          return d.status !== 'concluido';
        }
        if ((d.tipo === 'gerado' && !d.url_template) || d.tipo === 'externo') return false;
        return !anexos[d.id];
      }).length,
    [documentos, anexos],
  );

  useEffect(() => {
    registrarPendencias(pendencias);
  }, [pendencias, registrarPendencias]);

  const selecionar = (id: string, arquivo: File | null) =>
    setAnexos((prev) => {
      if (!arquivo) {
        const { [id]: _removido, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: arquivo };
    });

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

      {destaque && (
        <div className="mb-md">
          {destaque}
        </div>
      )}

      <div className="flex flex-col gap-sm">
        {documentos.map((doc) => (
          <ItemDocumento
            key={doc.id}
            doc={doc}
            arquivo={anexos[doc.id] ?? null}
            onSelecionar={(a) => selecionar(doc.id, a)}
            acaoNoCard={acaoNoCard}
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
  acaoNoCard: boolean;
}

const ItemDocumento = ({ doc, arquivo, onSelecionar, acaoNoCard }: ItemDocumentoProps) => {
  const navigate = useNavigate();
  const isCustomStatus = doc.status !== undefined;
  const isConcluidoStatus = doc.status === 'concluido';
  const isEmAndamento = doc.status === 'em_andamento';

  const gerado = doc.tipo === 'gerado';
  const concluido = isCustomStatus
    ? isConcluidoStatus
    : ((gerado && !doc.url_template) || Boolean(arquivo));
  const detalhe = [doc.descricao, doc.condicao].filter(Boolean).join(' ');
  const cardAcionavel = acaoNoCard && Boolean(doc.url_template);
  // Todo documento obrigatório pendente sinaliza ação necessária. Quando há
  // URL, o card também é navegável; uploads continuam usando o anexo interno.
  const cardComMotion = acaoNoCard && !concluido && (doc.obrigatorio || Boolean(doc.url_template));
  const abrirDocumento = () => {
    if (!doc.url_template) return;
    doc.onAbrirLink?.();
    navigate(doc.url_template);
  };

  return (
    <div
      onClick={cardAcionavel ? abrirDocumento : undefined}
      onKeyDown={(event) => {
        if (cardAcionavel && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          abrirDocumento();
        }
      }}
      role={cardAcionavel ? 'link' : undefined}
      tabIndex={cardAcionavel ? 0 : undefined}
      className={`min-w-0 break-words p-sm bg-surface-container-lowest border rounded transition-colors ${
        concluido
          ? 'border-secondary/60'
          : doc.url_template
            ? isEmAndamento
              ? 'border-amber-400/70 bg-amber-50/30 hover:border-amber-500'
              : 'border-blue-400/70 bg-blue-50/20 hover:border-blue-500'
            : 'border-outline-variant border-dashed hover:border-primary-container'
      } ${cardAcionavel ? `cursor-pointer hover:shadow-sm focus:outline-none focus:ring-2 ${concluido ? 'focus:ring-secondary/40' : isEmAndamento ? 'focus:ring-amber-500/40' : 'focus:ring-blue-500/40'}` : ''} ${cardComMotion ? 'relative overflow-hidden before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-[conic-gradient(from_0deg,transparent_0deg,currentColor_80deg,transparent_160deg)] before:opacity-80 before:animate-[spin_3s_linear_infinite] after:absolute after:inset-[2px] after:rounded-[inherit] after:bg-surface-container-lowest [&>*]:relative [&>*]:z-10' : ''}`}
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="flex items-start gap-sm min-w-0">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${
              concluido
                ? 'text-secondary'
                : isEmAndamento
                  ? 'text-amber-600'
                  : 'text-outline'
            }`}
          >
            {concluido
              ? 'check_circle'
              : isEmAndamento
                ? 'edit_note'
                : doc.tipo === 'externo'
                  ? 'mail_outline'
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

        {/* Formulário com URL/Template vinculado interativo */}
        {doc.url_template && doc.tipo !== 'upload' ? (
          <div className="flex items-center gap-xs shrink-0">
            {concluido ? (
              <>
                <span className="text-secondary text-[11px] font-bold uppercase" title="Concluído">
                  Concluído
                </span>
                {!acaoNoCard && <Link
                  to={doc.url_template}
                  onClick={doc.onAbrirLink}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-primary hover:text-primary-dark hover:bg-primary/5 rounded border border-primary/20 transition-colors"
                  title="Visualizar ou editar formulário vinculado"
                >
                  <span>{doc.linkTexto || 'Revisar'}</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </Link>}
              </>
            ) : (
              <>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isEmAndamento
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  <span className="material-symbols-outlined text-[8px]" title={isEmAndamento ? 'Revisar' : 'Preencher'}>
                    {isEmAndamento ? 'rate_review' : 'edit'}
                  </span>
                </span>
                {!acaoNoCard && <Link
                  to={doc.url_template}
                  onClick={doc.onAbrirLink}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded hover:bg-primary-dark transition-colors shadow-xs"
                  title="Abrir formulário vinculado para preenchimento"
                >
                  <span>{doc.linkTexto || 'Preencher'}</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </Link>}
              </>
            )}
          </div>
        ) : gerado ? (
          <span className="text-secondary text-[11px] font-bold uppercase shrink-0">
            Concluído
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
                download
                className="inline-flex items-center gap-1 text-primary-container text-[11px] font-bold uppercase hover:underline shrink-0"
                title="Baixar modelo do documento"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
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
          <span className="material-symbols-outlined text-[16px]">mail</span>
          {doc.acaoEmail.label}: {doc.acaoEmail.email}
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
