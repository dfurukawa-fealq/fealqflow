import JSZip from 'jszip';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type ItemTextoPdf = { str?: string; hasEOL?: boolean };

const escaparHtml = (texto: string): string => texto
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const extrairDocx = async (arquivo: File): Promise<string> => {
  const zip = await JSZip.loadAsync(await arquivo.arrayBuffer());
  const documentoXml = await zip.file('word/document.xml')?.async('text');
  if (!documentoXml) throw new Error('O DOCX não contém um documento principal válido.');

  const xml = new DOMParser().parseFromString(documentoXml, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Não foi possível ler o conteúdo do DOCX.');
  const paragrafos = Array.from(xml.getElementsByTagName('w:p'));
  const html = paragrafos.map((paragrafo) => {
    const texto = Array.from(paragrafo.getElementsByTagName('w:t')).map((no) => no.textContent || '').join('');
    const possuiQuebraPagina = Array.from(paragrafo.getElementsByTagName('w:br')).some((no) => no.getAttribute('w:type') === 'page' || no.getAttribute('type') === 'page');
    const conteudo = escaparHtml(texto).trim();
    return possuiQuebraPagina ? `<div data-page-break="true"><br /></div>${conteudo ? `<p>${conteudo}</p>` : ''}` : `<p>${conteudo || '&nbsp;'}</p>`;
  }).join('');
  if (!html) throw new Error('O DOCX não possui texto editável no corpo principal.');
  return html;
};

const extrairPdf = async (arquivo: File): Promise<string> => {
  const documento = await getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise;
  const paginas: string[] = [];
  for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina += 1) {
    const pagina = await documento.getPage(numeroPagina);
    const conteudo = await pagina.getTextContent();
    const itens = conteudo.items as ItemTextoPdf[];
    const texto = itens.map((item) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
    if (texto) paginas.push(`<p>${escaparHtml(texto)}</p>`);
    if (numeroPagina < documento.numPages) paginas.push('<div data-page-break="true"><br /></div>');
  }
  if (!paginas.length) throw new Error('O PDF não possui texto selecionável. PDFs digitalizados precisam de OCR.');
  return paginas.join('');
};

export const importarConteudoDocumento = async (arquivo: File): Promise<string> => {
  if (/\.docx$/i.test(arquivo.name)) return extrairDocx(arquivo);
  if (/\.pdf$/i.test(arquivo.name)) return extrairPdf(arquivo);
  throw new Error('Selecione um arquivo DOCX ou PDF.');
};
