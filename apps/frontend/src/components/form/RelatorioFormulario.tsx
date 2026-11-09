import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProcesso } from '../../contexts/ProcessoContext';

interface RelatorioFormularioProps {
  titulo: string;
}

const textoCampo = (valor: unknown) => {
  if (typeof valor === 'string') return valor.trim();
  if (typeof valor === 'number') return String(valor);
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  if (valor === null || valor === undefined) return '';
  return JSON.stringify(valor, null, 2);
};

const rotuloCampo = (chave: string) => {
  const semPrefixo = chave.replace(/^campo:/, '').replace(/:[\w-]+$/, '');
  return semPrefixo.replace(/([a-zà-ú])([A-Z])/g, '$1 $2').replaceAll('_', ' ').trim();
};

const escaparHtml = (valor: string) => valor
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const RelatorioFormulario = ({ titulo }: RelatorioFormularioProps) => {
  const processo = useProcesso();
  const [aberto, setAberto] = useState(false);
  const campos = processo?.dados.campos ?? {};
  const valores = useMemo(() => Object.entries(campos)
    .map(([chave, valor]) => ({ rotulo: rotuloCampo(chave), valor: textoCampo(valor) }))
    .filter((item) => item.valor !== '' && item.valor !== '[]' && item.valor !== '{}'), [campos]);
  const documentos = processo?.documentos ?? [];

  useEffect(() => {
    if (!aberto) return;
    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false);
    };
    document.addEventListener('keydown', fecharComEsc);
    return () => document.removeEventListener('keydown', fecharComEsc);
  }, [aberto]);

  const gerarPdf = () => {
    const janela = window.open('', '_blank');
    if (!janela) return;
    janela.opener = null;
    const linhasCampos = valores.map(({ rotulo, valor }) => `<tr><th>${escaparHtml(rotulo)}</th><td><pre>${escaparHtml(valor)}</pre></td></tr>`).join('');
    const linhasKit = documentos.map((documento) => `<tr><td>${escaparHtml(documento.id)}</td><td>${documento.preenchido ? 'SIM' : 'NÃO'}</td><td>${documento.emitido ? 'SIM' : 'NÃO'}</td><td>${escaparHtml(documento.arquivo_nome || '—')}</td></tr>`).join('');
    janela.document.open();
    janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório — ${escaparHtml(titulo)}</title><style>
      body{font:12px Arial,sans-serif;color:#102a38;margin:28px}h1{font-size:20px;margin:0 0 6px}h2{font-size:15px;margin:24px 0 8px;border-bottom:1px solid #b8c4cc;padding-bottom:5px}.meta{color:#52636d;margin-bottom:18px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #c8d1d7;padding:7px;text-align:left;vertical-align:top}th{width:30%;background:#f1f4f6}pre{font:12px Arial,sans-serif;white-space:pre-wrap;margin:0}footer{margin-top:24px;color:#52636d;font-size:10px}@media print{body{margin:14mm}}
    </style></head><body><h1>Relatório do formulário preenchido</h1><div class="meta"><strong>${escaparHtml(titulo)}</strong><br>Protocolo: ${escaparHtml(processo?.processo.protocolo || 'Não informado')}<br>Emitido em: ${escaparHtml(new Date().toLocaleString('pt-BR'))}</div><h2>Dados preenchidos</h2><table>${linhasCampos || '<tr><td>Nenhum campo preenchido.</td></tr>'}</table><h2>Kit documental</h2><table><thead><tr><th>Documento</th><th>Preenchido</th><th>Emitido</th><th>Arquivo</th></tr></thead><tbody>${linhasKit || '<tr><td colspan="4">Nenhum item registrado.</td></tr>'}</tbody></table><footer>Relatório informativo dos dados registrados no processo.</footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script></body></html>`);
    janela.document.close();
  };

  if (!processo) return null;
  const temConteudo = valores.length > 0 || documentos.some((documento) => documento.preenchido || documento.arquivo_nome);

  return <>
    <button type="button" disabled={!temConteudo} onClick={() => setAberto(true)} title={temConteudo ? 'Gerar relatório PDF do formulário' : 'Preencha o formulário para gerar o relatório'} aria-label="Gerar PDF" className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-xs rounded border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50 lg:h-[36px] xl:w-auto xl:px-md">
      <span className="material-symbols-outlined shrink-0 text-[20px] lg:text-[18px]" aria-hidden="true">picture_as_pdf</span>
      <span className="hidden truncate xl:inline">Gerar PDF</span>
    </button>
    {aberto && createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-md" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setAberto(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="titulo-relatorio-formulario" className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-outline bg-surface p-lg shadow-2xl">
          <header className="mb-md flex items-center justify-between gap-md border-b border-outline-variant pb-sm">
            <div>
              <h2 id="titulo-relatorio-formulario" className="text-base font-bold text-primary">Relatório do formulário preenchido</h2>
              <p className="text-xs text-on-surface-variant">{titulo} · {processo.processo.protocolo}</p>
            </div>
            <div className="flex items-center gap-sm">
              <button type="button" onClick={gerarPdf} className="inline-flex items-center gap-xs rounded bg-primary px-md py-sm text-sm font-semibold text-white hover:bg-primary-dark">
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>Gerar PDF
              </button>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar relatório" title="Fechar" className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
          </header>
          <div className="overflow-y-auto rounded border border-outline-variant bg-white p-md text-on-surface">
            <h3 className="mb-sm text-lg font-bold">{titulo}</h3>
            <p className="mb-md text-xs text-on-surface-variant">Protocolo: {processo.processo.protocolo} · Emitido em {new Date().toLocaleString('pt-BR')}</p>
            <h4 className="mb-xs border-b border-outline-variant pb-xs text-sm font-bold">Dados preenchidos</h4>
            {valores.length ? <dl className="grid grid-cols-1 gap-xs sm:grid-cols-2">{valores.map((item, indice) => <div key={`${item.rotulo}-${indice}`} className="min-w-0 rounded bg-surface-container-low p-sm"><dt className="text-[10px] font-bold uppercase text-on-surface-variant">{item.rotulo}</dt><dd className="mt-0.5 whitespace-pre-wrap break-words text-xs">{item.valor}</dd></div>)}</dl> : <p className="text-xs">Nenhum campo preenchido.</p>}
            <h4 className="mb-xs mt-lg border-b border-outline-variant pb-xs text-sm font-bold">Kit documental</h4>
            {documentos.length ? <ul className="space-y-xs">{documentos.map((documento) => <li key={documento.id} className="flex flex-wrap justify-between gap-x-md border-b border-outline-variant/60 py-xs text-xs"><span>{documento.id}{documento.arquivo_nome ? ` — ${documento.arquivo_nome}` : ''}</span><span>Preenchido: {documento.preenchido ? 'Sim' : 'Não'} · Emitido: {documento.emitido ? 'Sim' : 'Não'}</span></li>)}</ul> : <p className="text-xs">Nenhum item registrado.</p>}
            <p className="mt-lg border-t border-outline-variant pt-sm text-[10px] text-on-surface-variant">Relatório informativo dos dados registrados no processo.</p>
          </div>
        </section>
      </div>, document.body,
    )}
  </>;
};
