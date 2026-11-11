import fs from 'node:fs/promises';
import path from 'node:path';

const fontesPermitidas = new Set(['file', 'database']);

const lerFonte = (nome, padrao = 'file') => {
  const valor = (process.env[nome] || padrao).trim().toLowerCase();
  if (!fontesPermitidas.has(valor)) throw new Error(`${nome} invalido: use "file" ou "database".`);
  return valor;
};

export const fontesDados = Object.freeze({
  projetos: lerFonte('DATA_PROJETOS'),
  programas: lerFonte('DATA_PROGRAMAS'),
});

const lerJson = async (root, arquivo) => JSON.parse(await fs.readFile(path.join(root, 'data', arquivo), 'utf8'));

const validarRegistroFormulario = (item) => {
  if (!item || typeof item !== 'object') throw new Error('Registro inválido em data/cadastros_formularios.json.');
  if (!['Projetos', 'Programa de Apoio'].includes(item.tipo)) {
    throw new Error(`Área inválida no formulário ${item.id || '(sem id)'}.`);
  }
  if (!['formulario', 'documento'].includes(item.tipo_cadastro)) {
    throw new Error(`tipo_cadastro inválido no formulário ${item.id || '(sem id)'}: ${item.tipo_cadastro}.`);
  }
  return item;
};

export async function carregarFormulariosArquivo(root, area) {
  const [catalogo, kits, itens, documentos] = await Promise.all([
    lerJson(root, 'cadastros_formularios.json'),
    lerJson(root, 'kits_documentais.json'),
    lerJson(root, 'itens_kit_documental.json'),
    lerJson(root, 'cadastro_documentos.json'),
  ]);
  return catalogo.map(validarRegistroFormulario).filter((item) => item.tipo === area).map((item) => ({
    id: item.id,
    nome: item.nome,
    area: item.tipo,
    tipo: item.tipo_cadastro,
    linhaApoioId: item.linha_apoio_id,
    status: item.status,
    normas: item.normas,
    periodosSubmissao: item.periodos_submissao || [],
    itensKitDocumental: item.tipo_cadastro === 'documento'
      ? documentos.filter((documento) => documento.id === item.id).map((documento) => ({
        id: documento.id, nome: documento.nome, tipo: 'documento', info: documento.descricao,
        url_template: documento.template_url, obrigatorio: true,
      }))
      : (() => {
        const kit = kits.filter((registro) => registro.formulario_id === item.id && registro.ativo !== false)
          .sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0))[0];
        if (!kit) return [];
        return itens.filter((registro) => registro.kit_id === kit.id && registro.ativo !== false)
          .sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0))
          .map((registro) => ({
            id: registro.identificador, nome: registro.titulo, tipo: registro.tipo === 'gerado' ? 'formulario' : 'documento',
            documentoId: registro.cadastro_documento_id || undefined, obrigatorio: registro.obrigatorio !== false,
            info: registro.descricao || '', url_template: registro.url_template || '',
          }));
      })(),
    active: item.active !== false,
    habilitado: item.habilitado === true,
    nSeq: item.nseq || 0,
  }));
}

export const fonteDaArea = (area) => area === 'Projetos' ? fontesDados.projetos : fontesDados.programas;

export const erroFonteSomenteLeitura = (area) => ({
  error: `A fonte de ${area} esta configurada como "file" e e somente leitura pela API. Configure DATA_${area === 'Projetos' ? 'PROJETOS' : 'PROGRAMAS'}=database para editar pelo painel.`,
});
