import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

interface ModeloDocxPreviewProps {
  modeloUrl: string;
  html: string;
}

export const ModeloDocxPreview = ({ modeloUrl, html }: ModeloDocxPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modeloUrl || /\.pdf(?:$|[?#])/i.test(modeloUrl)) return;

    const controlador = new AbortController();
    let ativo = true;
    setCarregado(false);
    setCarregando(true);
    setErro('');
    container.replaceChildren();

    const renderizar = async () => {
      try {
        const resposta = await fetch(modeloUrl, { signal: controlador.signal });
        if (!resposta.ok) throw new Error(`Modelo DOCX não encontrado (${resposta.status}).`);
        if (resposta.headers.get('content-type')?.includes('text/html')) throw new Error('O caminho informado não aponta para um arquivo DOCX.');
        const arquivo = await resposta.blob();
        if (!ativo) return;
        await renderAsync(arquivo, container, container, {
          className: 'fealq-word-preview',
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          renderHeaders: true,
          renderFooters: true,
          useBase64URL: true,
        });
        container.querySelectorAll<HTMLElement>('section.fealq-word-preview > header, section.fealq-word-preview > footer').forEach((area) => {
          area.style.position = 'relative';
          area.style.zIndex = '2';
          area.style.visibility = 'visible';
          area.style.opacity = '1';
        });
        container.querySelectorAll<HTMLImageElement>('section.fealq-word-preview header img, section.fealq-word-preview footer img').forEach((imagem) => {
          imagem.style.display = 'block';
          imagem.style.visibility = 'visible';
          imagem.style.opacity = '1';
          imagem.style.maxWidth = '100%';
        });
        if (ativo) setCarregado(true);
      } catch (falha) {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível renderizar o modelo DOCX.');
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void renderizar();
    return () => { ativo = false; controlador.abort(); };
  }, [modeloUrl]);

  useEffect(() => {
    const corpo = containerRef.current?.querySelector<HTMLElement>('section.fealq-word-preview article');
    if (!carregado || !corpo) return;

    corpo.querySelector('.fealq-preview-conteudo')?.remove();
    Array.from(corpo.children).forEach((elemento) => {
      if (!elemento.textContent?.trim() && !elemento.querySelector('img, svg, table')) elemento.remove();
    });

    const conteudo = document.createElement('div');
    conteudo.className = 'fealq-preview-conteudo';
    conteudo.innerHTML = html;
    conteudo.style.fontFamily = 'inherit';
    conteudo.style.fontSize = '11pt';
    conteudo.style.lineHeight = '1.25';
    conteudo.style.color = '#111827';
    conteudo.querySelectorAll<HTMLElement>('p').forEach((paragrafo) => {
      paragrafo.style.margin = '0 0 10pt';
      paragrafo.style.minHeight = '1em';
    });
    corpo.appendChild(conteudo);
  }, [carregado, html]);

  if (!modeloUrl) {
    return (
      <div className="mx-auto max-w-3xl bg-white p-8 shadow-lg sm:p-14">
        <p className="mb-4 text-sm text-on-surface-variant">Nenhum modelo DOCX selecionado.</p>
        <article dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  if (/\.pdf(?:$|[?#])/i.test(modeloUrl)) {
    return (
      <div className="relative min-h-[500px] overflow-auto bg-slate-200 p-2 sm:p-5">
        <iframe title="Prévia do documento PDF" src={modeloUrl} className="h-[70vh] min-h-[500px] w-full rounded-lg border border-slate-300 bg-white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] overflow-auto bg-slate-200 p-2 sm:p-5">
      {carregando && <div role="status" className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/85 text-sm font-medium text-slate-700"><span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>Renderizando modelo DOCX...</div>}
      {erro && <div role="alert" className="m-4 rounded-xl border border-error/30 bg-white p-5 text-sm text-error">{erro}<p className="mt-2 text-xs text-on-surface-variant">Selecione um arquivo DOCX disponível no cadastro do documento.</p></div>}
      <div ref={containerRef} aria-label="Prévia do documento com modelo DOCX" />
    </div>
  );
};
