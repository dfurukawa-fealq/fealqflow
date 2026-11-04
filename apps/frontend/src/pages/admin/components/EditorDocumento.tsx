import { useEffect, useLayoutEffect, useRef, useState, type ClipboardEvent } from 'react';
import { renderAsync } from 'docx-preview';

interface EditorDocumentoProps {
  titulo: string;
  modeloUrl: string;
  valor: string;
  aoAlterar: (valor: string) => void;
}

const tagsPermitidas = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H2', 'H3', 'BLOCKQUOTE']);
const tagsDeBloco = new Set(['P', 'H2', 'H3', 'BLOCKQUOTE', 'LI']);

export const limparHtmlDocumento = (html: string): string => {
  const documento = new DOMParser().parseFromString(html, 'text/html');

  const limparNo = (no: Node): Node[] => {
    if (no.nodeType === Node.TEXT_NODE) return [documento.createTextNode(no.textContent || '')];
    if (!(no instanceof HTMLElement)) return [];

    const tagOriginal = no.tagName;
    const tag = tagOriginal === 'B' ? 'STRONG' : tagOriginal === 'I' ? 'EM' : tagOriginal === 'DIV' ? 'P' : tagOriginal;
    const filhos = Array.from(no.childNodes).flatMap(limparNo);
    if (!tagsPermitidas.has(tag)) return filhos;

    const elemento = documento.createElement(tag.toLowerCase());
    if (tagsDeBloco.has(tag)) {
      const alinhamento = no.style.textAlign;
      if (['left', 'center', 'right', 'justify'].includes(alinhamento)) {
        elemento.setAttribute('style', `text-align: ${alinhamento}`);
      }
    }
    filhos.forEach((filho) => elemento.appendChild(filho));
    return [elemento];
  };

  const limpos = Array.from(documento.body.childNodes).flatMap(limparNo);
  const saida = documento.createElement('div');
  limpos.forEach((no) => saida.appendChild(no));
  return saida.innerHTML;
};

const normalizarNomeCampo = (campo: string): string => campo
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLocaleUpperCase('pt-BR')
  .replace(/[^A-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

export const normalizarMarcadoresDocumento = (html: string): string => html.replace(/\[([^\[\]]+)\]/g, (marcador, campo: string) => {
  if (!/[\p{L}]/u.test(campo)) return marcador;
  const nomeCampo = normalizarNomeCampo(campo);
  return nomeCampo ? `{${nomeCampo}}` : marcador;
});

const botoesFormatacao = [
  { comando: 'bold', icone: 'format_bold', titulo: 'Negrito' },
  { comando: 'italic', icone: 'format_italic', titulo: 'Itálico' },
  { comando: 'underline', icone: 'format_underlined', titulo: 'Sublinhado' },
  { comando: 'insertUnorderedList', icone: 'format_list_bulleted', titulo: 'Lista com marcadores' },
  { comando: 'insertOrderedList', icone: 'format_list_numbered', titulo: 'Lista numerada' },
  { comando: 'justifyLeft', icone: 'format_align_left', titulo: 'Alinhar à esquerda' },
  { comando: 'justifyCenter', icone: 'format_align_center', titulo: 'Centralizar' },
  { comando: 'justifyRight', icone: 'format_align_right', titulo: 'Alinhar à direita' },
];

const camposPadrao = ['{NOME}', '{CPF}', '{EMAIL}', '{DATA}', '{CIDADE}', '{DIA}', '{MES}', '{ANO}', '{NACIONALIDADE}', '{NOME_DO_EVENTO_OU_GRUPO_PROJETOS_SOB_SUA_COORDENACAO}'];

const valoresIniciaisPreview = (): Record<string, string> => {
  const hoje = new Date();
  return {
    NOME: 'Nome de Exemplo',
    CPF: '000.000.000-00',
    EMAIL: 'nome@exemplo.com.br',
    DATA: hoje.toLocaleDateString('pt-BR'),
    CIDADE: 'Piracicaba',
    DIA: String(hoje.getDate()),
    MES: hoje.toLocaleDateString('pt-BR', { month: 'long' }),
    ANO: String(hoje.getFullYear()),
    NACIONALIDADE: 'brasileira',
    NOME_DO_EVENTO_OU_GRUPO_PROJETOS_SOB_SUA_COORDENACAO: 'Evento ou grupo de projetos de exemplo',
  };
};

const gerarHtmlPreview = (html: string, valores: Record<string, string>): string => {
  const documento = new DOMParser().parseFromString(normalizarMarcadoresDocumento(limparHtmlDocumento(html)), 'text/html');
  const walker = documento.createTreeWalker(documento.body, NodeFilter.SHOW_TEXT);
  const nosTexto: Text[] = [];
  while (walker.nextNode()) nosTexto.push(walker.currentNode as Text);

  for (const noTexto of nosTexto) {
    noTexto.textContent = (noTexto.textContent || '').replace(/\{\s*([^{}]+?)\s*\}/g, (marcador, campoChaves: string) => {
      const nome = normalizarNomeCampo(campoChaves);
      return valores[nome] ?? marcador;
    });
  }

  return documento.body.innerHTML;
};

export const EditorDocumento = ({ titulo, modeloUrl, valor, aoAlterar }: EditorDocumentoProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewModeloRef = useRef<HTMLDivElement>(null);
  const selecaoRef = useRef<Range | null>(null);
  const [novoCampo, setNovoCampo] = useState('');
  const [previewAberta, setPreviewAberta] = useState(false);
  const [previewCarregado, setPreviewCarregado] = useState(false);
  const [previewCarregando, setPreviewCarregando] = useState(false);
  const [erroPreview, setErroPreview] = useState('');
  const [valoresPreview, setValoresPreview] = useState<Record<string, string>>(valoresIniciaisPreview);

  useEffect(() => {
    const container = previewModeloRef.current;
    if (!previewAberta || !container) return;

    let cancelado = false;
    setPreviewCarregado(false);
    setPreviewCarregando(true);
    setErroPreview('');
    container.replaceChildren();

    const renderizarModelo = async () => {
      try {
        const resposta = await fetch(modeloUrl);
        if (!resposta.ok) throw new Error(`O modelo DOCX não foi encontrado (${resposta.status}).`);
        const arquivo = await resposta.blob();
        await renderAsync(arquivo, container, container, {
          className: 'fealq-word-preview',
          inWrapper: true,
          renderHeaders: true,
          renderFooters: true,
          useBase64URL: true,
        });
        if (!cancelado) setPreviewCarregado(true);
      } catch (erro) {
        if (!cancelado) setErroPreview(erro instanceof Error ? erro.message : 'Não foi possível renderizar o modelo DOCX.');
      } finally {
        if (!cancelado) setPreviewCarregando(false);
      }
    };

    void renderizarModelo();
    return () => { cancelado = true; };
  }, [previewAberta, modeloUrl]);

  useEffect(() => {
    const container = previewModeloRef.current;
    const corpo = container?.querySelector<HTMLElement>('section.fealq-word-preview article');
    if (!previewAberta || !previewCarregado || !container || !corpo) return;

    corpo.querySelector('.fealq-preview-conteudo')?.remove();
    Array.from(corpo.children).forEach((elemento) => {
      if (!elemento.textContent?.trim() && !elemento.querySelector('img, svg, table')) elemento.remove();
    });

    const conteudo = document.createElement('div');
    conteudo.className = 'fealq-preview-conteudo';
    conteudo.innerHTML = gerarHtmlPreview(valor, valoresPreview);
    conteudo.style.fontFamily = 'inherit';
    conteudo.style.fontSize = '11pt';
    conteudo.style.lineHeight = '1.25';
    conteudo.style.color = '#111827';
    conteudo.querySelectorAll<HTMLElement>('p').forEach((paragrafo) => {
      paragrafo.style.margin = '0 0 10pt';
      paragrafo.style.minHeight = '1em';
    });
    corpo.appendChild(conteudo);
  }, [previewAberta, previewCarregado, valor, valoresPreview]);

  const salvarSelecao = () => {
    const selecao = window.getSelection();
    if (selecao?.rangeCount && editorRef.current?.contains(selecao.anchorNode)) {
      selecaoRef.current = selecao.getRangeAt(0).cloneRange();
    }
  };

  const focarNaSelecao = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (selecaoRef.current && editor.contains(selecaoRef.current.commonAncestorContainer)) {
      const selecao = window.getSelection();
      selecao?.removeAllRanges();
      selecao?.addRange(selecaoRef.current);
    }
  };

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const htmlSeguro = normalizarMarcadoresDocumento(limparHtmlDocumento(valor));
    if (editor.innerHTML !== htmlSeguro) editor.innerHTML = htmlSeguro;
    if (valor !== htmlSeguro) aoAlterar(htmlSeguro);
  }, [valor]);

  const aplicarComando = (comando: string, valorComando?: string) => {
    focarNaSelecao();
    document.execCommand(comando, false, valorComando);
    if (editorRef.current) aoAlterar(normalizarMarcadoresDocumento(limparHtmlDocumento(editorRef.current.innerHTML)));
  };

  const inserirCampo = (campo: string) => {
    focarNaSelecao();
    document.execCommand('insertText', false, campo);
    if (editorRef.current) aoAlterar(normalizarMarcadoresDocumento(limparHtmlDocumento(editorRef.current.innerHTML)));
  };

  const adicionarCampoPersonalizado = () => {
    const nomeCampo = normalizarNomeCampo(novoCampo);
    if (!nomeCampo) return;
    inserirCampo(`{${nomeCampo}}`);
    setNovoCampo('');
  };

  const tratarColagem = (evento: ClipboardEvent<HTMLDivElement>) => {
    evento.preventDefault();
    const texto = evento.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, texto);
    if (editorRef.current) aoAlterar(normalizarMarcadoresDocumento(limparHtmlDocumento(editorRef.current.innerHTML)));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm" aria-label="Editor do documento oficial">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">description</span>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Conteúdo do documento</h3>
            <p className="text-xs text-on-surface-variant">Texto editável associado ao modelo institucional FEALQ</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setPreviewAberta(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary transition hover:bg-primary/90">
            <span className="material-symbols-outlined text-[17px]">visibility</span>
            Pré-visualizar
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            Modelo institucional
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low/60 p-3">
        <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formatação do texto">
          <label className="sr-only" htmlFor="estilo-paragrafo">Estilo do parágrafo</label>
          <select
            id="estilo-paragrafo"
            defaultValue="P"
            onMouseDown={salvarSelecao}
            onChange={(evento) => aplicarComando('formatBlock', evento.target.value)}
            className="mr-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-2 text-xs font-medium text-on-surface focus:outline-primary"
          >
            <option value="P">Parágrafo</option>
            <option value="H2">Título da seção</option>
            <option value="H3">Subtítulo</option>
            <option value="BLOCKQUOTE">Citação</option>
          </select>
          <span className="mx-1 hidden h-7 border-l border-outline-variant sm:block" />
          {botoesFormatacao.map((botao) => (
            <button
              key={botao.comando}
              type="button"
              title={botao.titulo}
              aria-label={botao.titulo}
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => aplicarComando(botao.comando)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-primary/10 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-[19px]">{botao.icone}</span>
            </button>
          ))}
          <span className="mx-1 hidden h-7 border-l border-outline-variant sm:block" />
          <button type="button" title="Desfazer" aria-label="Desfazer" onMouseDown={(evento) => evento.preventDefault()} onClick={() => aplicarComando('undo')} className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary">
            <span className="material-symbols-outlined text-[19px]">undo</span>
          </button>
          <button type="button" title="Refazer" aria-label="Refazer" onMouseDown={(evento) => evento.preventDefault()} onClick={() => aplicarComando('redo')} className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary">
            <span className="material-symbols-outlined text-[19px]">redo</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/70 pt-3">
          <span className="text-xs font-semibold text-on-surface-variant">Campos automáticos</span>
          {camposPadrao.map((campo) => (
            <button key={campo} type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={() => inserirCampo(campo)} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10">
              {campo}
            </button>
          ))}
          <button type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={() => inserirCampo('{CIDADE}, {DIA} de {MES} de {ANO}')} className="rounded-full border border-secondary/25 bg-secondary/5 px-2.5 py-1 text-xs font-semibold text-secondary transition hover:bg-secondary/10">
            Data por extenso
          </button>
          <div className="ml-0 flex w-full gap-2 sm:ml-auto sm:w-auto">
            <label className="sr-only" htmlFor="novo-campo-documento">Nome do campo personalizado</label>
            <input id="novo-campo-documento" value={novoCampo} onChange={(evento) => setNovoCampo(evento.target.value)} onKeyDown={(evento) => { if (evento.key === 'Enter') { evento.preventDefault(); adicionarCampoPersonalizado(); } }} placeholder="Novo campo, ex.: Cargo" className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/70 sm:w-40 sm:flex-none" />
            <button type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={adicionarCampoPersonalizado} className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Campo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-4 sm:p-7">
        <div className="mx-auto min-h-[480px] max-w-[760px] border border-outline-variant/70 bg-white px-8 py-10 shadow-[0_8px_30px_rgba(0,0,0,0.07)] sm:px-16 sm:py-14">
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-label="Texto do documento oficial"
            aria-multiline="true"
            spellCheck
            suppressContentEditableWarning
            onInput={(evento) => aoAlterar(normalizarMarcadoresDocumento(limparHtmlDocumento(evento.currentTarget.innerHTML)))}
            onMouseUp={salvarSelecao}
            onKeyUp={salvarSelecao}
            onBlur={salvarSelecao}
            onPaste={tratarColagem}
            className="min-h-[390px] text-[15px] leading-7 text-slate-800 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-6 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc"
          />
          {!valor.replace(/<[^>]*>/g, '').trim() && (
            <p className="pointer-events-none -mt-[390px] min-h-[390px] text-[15px] leading-7 text-slate-400">
              Comece a redigir o conteúdo e insira os marcadores entre chaves definidos para este documento.
            </p>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant px-4 py-2.5 text-xs text-on-surface-variant">
        <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">lock</span>Somente formatação segura será mantida no documento</span>
        <span>Marcadores entre chaves para dados variáveis do documento</span>
      </footer>

      {previewAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setPreviewAberta(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-preview-documento" className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
              <div>
                <h2 id="titulo-preview-documento" className="text-lg font-bold text-on-surface">Prévia do documento</h2>
                <p className="text-xs text-on-surface-variant">Modelo timbrado original com o conteúdo e os dados de exemplo aplicados.</p>
              </div>
              <button type="button" onClick={() => setPreviewAberta(false)} aria-label="Fechar prévia" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="border-b border-outline-variant bg-surface-container-low p-4 lg:border-b-0 lg:border-r">
                <h3 className="mb-1 text-sm font-bold text-on-surface">Dados de exemplo</h3>
                <p className="mb-4 text-xs text-on-surface-variant">Altere os valores para conferir a substituição dos campos.</p>
                <div className="flex flex-col gap-3">
                  {[
                    ['NOME', 'Nome'], ['CPF', 'CPF'], ['EMAIL', 'E-mail'], ['DATA', 'Data'],
                    ['CIDADE', 'Cidade'], ['DIA', 'Dia'], ['MES', 'Mês'], ['ANO', 'Ano'], ['NACIONALIDADE', 'Nacionalidade'],
                    ['NOME_DO_EVENTO_OU_GRUPO_PROJETOS_SOB_SUA_COORDENACAO', 'Nome do evento ou grupo de projetos sob sua coordenação'],
                  ].map(([campo, rotulo]) => (
                    <label key={campo} className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
                      {rotulo}
                      <input value={valoresPreview[campo]} onChange={(evento) => setValoresPreview((atual) => ({ ...atual, [campo]: evento.target.value }))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-primary" />
                    </label>
                  ))}
                </div>
              </aside>
              <div className="relative min-h-[500px] overflow-auto bg-slate-200 p-2 sm:p-5">
                {previewCarregando && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/85 text-sm font-medium text-slate-700"><span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>Renderizando {titulo || 'documento'}...</div>}
                {erroPreview && <div role="alert" className="m-4 rounded-xl border border-error/30 bg-white p-5 text-sm text-error">{erroPreview}<p className="mt-2 text-xs text-on-surface-variant">Verifique o endereço do modelo DOCX no cadastro do documento.</p></div>}
                <div ref={previewModeloRef} aria-label="Prévia do modelo DOCX timbrado" />
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
