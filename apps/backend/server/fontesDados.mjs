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
  const catalogo = await lerJson(root, 'cadastros_formularios.json');
  return catalogo.map(validarRegistroFormulario).filter((item) => item.tipo === area).map((item) => ({
    id: item.id,
    nome: item.nome,
    area: item.tipo,
    tipo: item.tipo_cadastro,
    linhaApoioId: item.linha_apoio_id,
    status: item.status,
    normas: item.normas,
    periodosSubmissao: item.periodos_submissao || [],
    documentosSolicitados: item.documentos_solicitados || [],
    active: item.active !== false,
    habilitado: item.habilitado === true,
    nSeq: item.nseq || 0,
  }));
}

export const fonteDaArea = (area) => area === 'Projetos' ? fontesDados.projetos : fontesDados.programas;

export const erroFonteSomenteLeitura = (area) => ({
  error: `A fonte de ${area} esta configurada como "file" e e somente leitura pela API. Configure DATA_${area === 'Projetos' ? 'PROJETOS' : 'PROGRAMAS'}=database para editar pelo painel.`,
});
