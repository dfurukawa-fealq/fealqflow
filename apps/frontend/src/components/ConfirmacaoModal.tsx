import { createPortal } from 'react-dom';

interface ConfirmacaoModalProps {
  titulo: string;
  mensagem: string;
  icone?: string;
  textoConfirmar: string;
  textoCancelamento?: string;
  carregando?: boolean;
  variante?: 'perigo' | 'principal';
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmacaoModal = ({
  titulo,
  mensagem,
  icone = 'help',
  textoConfirmar,
  textoCancelamento = 'Cancelar',
  carregando = false,
  variante = 'perigo',
  onConfirmar,
  onCancelar,
}: ConfirmacaoModalProps) => createPortal(
  <div className="bg-slate-950/60 p-4" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !carregando) onCancelar(); }}>
    <section className="box-border flex min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl" style={{ width: 'min(100%, 32rem)', maxWidth: '32rem' }} role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao-modal">
      <div className="flex items-start gap-4 p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${variante === 'perigo' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">{icone}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="titulo-confirmacao-modal" className="text-lg font-bold text-primary">{titulo}</h2>
          <p className="mt-2 break-words text-sm leading-6 text-on-surface-variant">{mensagem}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant bg-surface-container-low p-4">
        <button type="button" disabled={carregando} onClick={onCancelar} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60">{textoCancelamento}</button>
        <button type="button" disabled={carregando} onClick={onConfirmar} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${variante === 'perigo' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}>{carregando ? 'Aguarde...' : textoConfirmar}</button>
      </div>
    </section>
  </div>,
  document.body,
);
