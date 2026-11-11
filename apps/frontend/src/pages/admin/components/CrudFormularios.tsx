import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { FormularioApoio, PeriodoSubmissao, ItemKitDocumentalAdmin } from '../../../types/admin';
import { PatternFormat } from 'react-number-format';
import { EditorDocumento, limparHtmlDocumento, normalizarMarcadoresDocumento } from './EditorDocumento';
import { ModeloDocxPreview } from './ModeloDocxPreview';

interface ModeloDocx {
  nome: string;
  tipo?: string;
  caminho: string;
}

type AcaoConfirmacao = 'clonar' | 'arquivar';
interface ConfirmacaoCadastro {
  acao: AcaoConfirmacao;
  item: FormularioApoio;
}

const normalizarCaminhoModelo = (caminho: string): string => caminho.trim().replace(/^\/?template\//i, '/templates/');
const limparReferenciasCitacao = (texto: string): string => texto.replace(/\s*\[cite:\s*\d+(?:\s*,\s*\d+)*\]/gi, '').trim();

interface CrudFormulariosProps {
  modo?: 'todos' | 'formularios' | 'documentos';
}

export const CrudFormularios = ({ modo = 'todos' }: CrudFormulariosProps) => {
  const { linhasApoio, formularios, formulariosCarregando, erroCarregarFormularios, recarregarFormularios, documentos, addFormulario, updateFormulario, persistirFormulario, deleteFormulario, addDocumento } = useAdmin();
  const [modelosDocx, setModelosDocx] = useState<ModeloDocx[]>([]);
  const [erroModelosDocx, setErroModelosDocx] = useState('');
  const [importandoModelo, setImportandoModelo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState('');
  const [erroLista, setErroLista] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [documentoPreview, setDocumentoPreview] = useState<FormularioApoio | null>(null);
  const [confirmacaoCadastro, setConfirmacaoCadastro] = useState<ConfirmacaoCadastro | null>(null);
  const [confirmandoCadastro, setConfirmandoCadastro] = useState(false);

  const [nome, setNome] = useState('');
  const [nSeq, setNSeq] = useState(0);
  const [area, setArea] = useState<'Projetos' | 'Programa de Apoio'>('Programa de Apoio');
  const [tipo, setTipo] = useState<'formulario' | 'documento'>('formulario');
  const [descricaoDocumento, setDescricaoDocumento] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [documentoSelecionadoId, setDocumentoSelecionadoId] = useState('');
  const [documentoSelecionadoBusca, setDocumentoSelecionadoBusca] = useState('');
  const [linhaApoioId, setLinhaApoioId] = useState('');
  const [status, setStatus] = useState<'Aberto' | 'Fechado'>('Fechado');
  const [normas, setNormas] = useState('');
  const [itensKitDocumental, setItensKitDocumental] = useState<ItemKitDocumentalAdmin[]>([]);
  const [periodosSubmissao, setPeriodosSubmissao] = useState<PeriodoSubmissao[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroArea, setFiltroArea] = useState<'Todos' | 'Projetos' | 'Programa de Apoio'>('Todos');
  const [filtroHabilitado, setFiltroHabilitado] = useState<'Todos' | 'Habilitados' | 'Desabilitados'>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'formulario' | 'documento'>(modo === 'formularios' ? 'formulario' : modo === 'documentos' ? 'documento' : 'Todos');
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  const importarModelo = async (arquivo: File) => {
    setImportandoModelo(true);
    setErroModelosDocx('');
    try {
      const resposta = await fetch('/api/modelos-documentos', {
        method: 'POST',
        headers: { 'Content-Type': arquivo.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(arquivo.name) },
        body: arquivo,
      });
      const resultado = await resposta.json() as { error?: string; nome?: string; caminho?: string; tipo?: string };
      if (!resposta.ok || !resultado.caminho || !resultado.nome) throw new Error(resultado.error || 'Não foi possível importar o arquivo.');
      const modelo = { nome: resultado.nome, caminho: resultado.caminho, tipo: resultado.tipo };
      setModelosDocx((atuais) => [...atuais.filter((item) => item.caminho !== modelo.caminho), modelo].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      setTemplateUrl(modelo.caminho);
    } catch (falha) {
      setErroModelosDocx(falha instanceof Error ? falha.message : 'Não foi possível importar o arquivo.');
    } finally {
      setImportandoModelo(false);
    }
  };

  useEffect(() => {
    if (modo === 'documentos') setTipo('documento');
    if (modo === 'formularios') setTipo('formulario');
  }, [modo]);

  useEffect(() => {
    const controlador = new AbortController();
    const carregarModelos = async () => {
      try {
        const resposta = await fetch('/api/modelos-docx', { signal: controlador.signal });
        if (!resposta.ok) throw new Error(`Falha ao listar os modelos DOCX (${resposta.status}).`);
        const modelos = await resposta.json() as ModeloDocx[];
        setModelosDocx(modelos);
        setErroModelosDocx('');
      } catch (falha) {
        if (!controlador.signal.aborted) setErroModelosDocx(falha instanceof Error ? falha.message : 'Não foi possível listar os modelos DOCX.');
      }
    };
    void carregarModelos();
    return () => controlador.abort();
  }, []);

  const [editingDocs, setEditingDocs] = useState<Record<string, boolean>>({});
  const [documentosAntesEdicao, setDocumentosAntesEdicao] = useState<Record<string, ItemKitDocumentalAdmin>>({});
  const [editingPeriodos, setEditingPeriodos] = useState<Record<string, boolean>>({});
  const formulariosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return [...formularios].sort((a, b) => (a.nSeq || 0) - (b.nSeq || 0) || a.nome.localeCompare(b.nome, 'pt-BR')).filter((form) => {
      const correspondeArea = filtroArea === 'Todos' || form.area === filtroArea;
      const correspondeTipo = filtroTipo === 'Todos' || form.tipo === filtroTipo;
      const correspondeHabilitado = filtroHabilitado === 'Todos' || (filtroHabilitado === 'Habilitados' ? form.habilitado !== false : form.habilitado === false);
      const linha = linhasApoio.find((item) => item.id === form.linhaApoioId)?.nome || '';
      const correspondePesquisa = !termo || [form.nome, form.area, form.tipo, form.status, linha, form.normas]
        .join(' ')
        .toLowerCase()
        .includes(termo);
      return correspondeArea && correspondeTipo && correspondeHabilitado && correspondePesquisa;
    });
  }, [formularios, linhasApoio, pesquisa, filtroArea, filtroTipo, filtroHabilitado]);

  const totalPaginas = Math.max(1, Math.ceil(formulariosFiltrados.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const formulariosPagina = formulariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  const handleEdit = (form: FormularioApoio) => {
    setEditingId(form.id);
    setNome(form.nome);
    setNSeq(form.nSeq || 0);
    setArea(form.area);
    setTipo(form.tipo);
    setLinhaApoioId(form.linhaApoioId);
    setStatus(form.status);
    setNormas(limparReferenciasCitacao(form.normas || ''));
    setDescricaoDocumento(form.tipo === 'documento' ? form.itensKitDocumental[0]?.info || '' : '');
    setTemplateUrl(form.tipo === 'documento' ? normalizarCaminhoModelo(form.itensKitDocumental[0]?.url_template || '') || modelosDocx[0]?.caminho || '' : '');
    
    setItensKitDocumental((form.itensKitDocumental || []).map((documento) => ({ ...documento, nome: limparReferenciasCitacao(documento.nome), info: limparReferenciasCitacao(documento.info || ''), tipo: documento.tipo || 'documento', referenciaTipo: documento.referenciaTipo || (documento.documentoId ? 'documento' : 'url'), obrigatorio: documento.obrigatorio !== false })));
    setPeriodosSubmissao(form.periodosSubmissao || []);
    setEditingDocs({});
    setEditingPeriodos({});
    setIsFormVisible(true);
  };

  const handleSave = async () => {
    setErroSalvar('');
    if (!nome.trim()) {
      setErroSalvar('Informe o nome do cadastro antes de salvar.');
      return;
    }
    if (!linhaApoioId && tipo === 'formulario') {
      setErroSalvar('Selecione uma linha de apoio antes de salvar o formulário.');
      return;
    }
    if (tipo === 'documento' && !modelosDocx.some((modelo) => modelo.caminho === templateUrl)) {
      setErroSalvar('Selecione um modelo DOCX ou PDF disponível na pasta de templates.');
      return;
    }

    setSalvando(true);
    try {
      if (tipo === 'documento') {
        const documento = { id: editingId || undefined, nome: nome.trim(), descricao: descricaoDocumento, template_url: templateUrl, active: true };
        if (editingId) {
          await persistirFormulario(editingId, {
            nome: nome.trim(),
            area,
            tipo: 'documento',
            linhaApoioId: '',
            status,
            normas,
            periodosSubmissao: [],
            itensKitDocumental: [{ id: editingId, nome: nome.trim(), info: descricaoDocumento, url_template: templateUrl }],
          });
        } else {
          await addDocumento(documento);
        }
        resetForm();
        return;
      }

      const docsFormatados = itensKitDocumental.filter(d => d.nome.trim() !== '');
      const data = {
        nome,
        nSeq,
        area,
        tipo: 'formulario' as const,
        linhaApoioId,
        status,
        normas,
        itensKitDocumental: docsFormatados,
        periodosSubmissao,
      };

      if (editingId) {
        await updateFormulario(editingId, data);
      } else {
        await addFormulario(data);
      }
      resetForm();
    } catch (erro) {
      setErroSalvar(erro instanceof Error ? erro.message : 'Não foi possível salvar no banco de dados.');
    } finally {
      setSalvando(false);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setNome('');
    setNSeq(0);
    setArea(modo === 'documentos' ? 'Projetos' : 'Programa de Apoio');
    setTipo(modo === 'documentos' ? 'documento' : 'formulario');
    setDescricaoDocumento('');
    setTemplateUrl(modelosDocx[0]?.caminho || '');
    setLinhaApoioId('');
    setStatus('Aberto');
    setPeriodosSubmissao([]);
    setNormas('');
    setItensKitDocumental([]);
    setIsFormVisible(true);
  };
  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const handleArquivar = async (id: string) => {
    setErroLista('');
    try {
      await deleteFormulario(id);
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao arquivar no banco de dados.');
    }
  };

  const solicitarConfirmacao = (acao: AcaoConfirmacao, item: FormularioApoio) => {
    setConfirmacaoCadastro({ acao, item });
  };

  const executarConfirmacao = async () => {
    if (!confirmacaoCadastro) return;
    setConfirmandoCadastro(true);
    try {
      if (confirmacaoCadastro.acao === 'clonar') await handleClonar(confirmacaoCadastro.item);
      else await handleArquivar(confirmacaoCadastro.item.id);
      setConfirmacaoCadastro(null);
    } finally {
      setConfirmandoCadastro(false);
    }
  };

  const handleRestaurar = async (id: string) => {
    setErroLista('');
    try {
      await updateFormulario(id, { active: true });
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao restaurar no banco de dados.');
    }
  };

  const handleClonar = async (form: FormularioApoio) => {
    setErroLista('');
    try {
      const sufixo = Math.random().toString(36).slice(2, 8);
      await addFormulario({
        nome: `${form.nome} (Cópia)`,
        nSeq: form.nSeq || 0,
        area: form.area,
        tipo: form.tipo,
        linhaApoioId: form.linhaApoioId,
        status: form.status,
        periodosSubmissao: form.periodosSubmissao.map((periodo) => ({ ...periodo, id: `clone-${sufixo}-${periodo.id}` })),
        normas: form.normas,
        itensKitDocumental: form.itensKitDocumental.map((documento, indice) => ({ ...documento, id: `clone-${sufixo}-item-${indice + 1}` })),
        active: true,
        habilitado: true,
      });
      await recarregarFormularios();
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao clonar o cadastro.');
    }
  };

  const handleAlternarHabilitado = async (form: FormularioApoio) => {
    setErroLista('');
    try {
      await updateFormulario(form.id, { habilitado: form.habilitado === false });
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao alterar o status do formulário.');
    }
  };

  const obterConteudoPreview = (form: FormularioApoio) => {
    const conteudo = form.itensKitDocumental[0]?.info || '<p>Este documento ainda não possui conteúdo cadastrado.</p>';
    const valores: Record<string, string> = {
      NOME: 'Nome do solicitante', CPF: '000.000.000-00', EMAIL: 'exemplo@fealq.com.br',
      DATA: '05/11/2026', CIDADE: 'Piracicaba', DIA: '05', MES: 'novembro', ANO: '2026',
    };
    return normalizarMarcadoresDocumento(limparHtmlDocumento(conteudo)).replace(/\{\s*([^{}]+?)\s*\}/g, (marcador, campo: string) => valores[campo.trim().toUpperCase()] || marcador);
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setErroSalvar('');
    setEditingId(null);
    setNome('');
    setNSeq(0);
    setArea('Programa de Apoio');
    setTipo('formulario');
    setLinhaApoioId('');
    setStatus('Fechado');
    setNormas('');
    setItensKitDocumental([]);
    setPeriodosSubmissao([]);
    setDescricaoDocumento('');
    setTemplateUrl('');
    setEditingDocs({});
    setEditingPeriodos({});
  };

  const handleAddDocumento = () => {
    const id = Math.random().toString(36).substring(7);
    setItensKitDocumental([{ id, nome: '', tipo: 'documento', obrigatorio: true, info: '', url_template: '' }, ...itensKitDocumental]);
    setEditingDocs({ ...Object.fromEntries(Object.keys(editingDocs).map((chave) => [chave, false])), [id]: true });
  };

  const handleVincularDocumentoLegado = () => {
    const [tipoSelecionado, idSelecionado] = documentoSelecionadoId.split(':');
    const documento = documentos.find((item) => tipoSelecionado === 'documento' && item.id === idSelecionado && item.active !== false);
    const formulario = formularios.find((item) => tipoSelecionado === 'formulario' && item.id === idSelecionado && item.active !== false && item.tipo === 'formulario');
    const itemSelecionado = documento || formulario;
    if (!itemSelecionado || itensKitDocumental.some((item) => item.id === itemSelecionado.id)) return;
    setItensKitDocumental([...itensKitDocumental, {
      id: itemSelecionado.id,
      nome: itemSelecionado.nome,
      tipo: formulario ? 'formulario' : 'documento',
      documentoId: documento?.id,
      referenciaTipo: documento ? 'documento' : 'url',
      obrigatorio: true,
      info: formulario ? formulario.normas : documento?.descricao,
      url_template: documento?.template_url,
    }]);
    setDocumentoSelecionadoId('');
  };

  const handleVincularItem = () => {
    const [tipoSelecionado, idSelecionado] = documentoSelecionadoId.split(':');
    const documento = documentos.find((item) => tipoSelecionado === 'documento' && item.id === idSelecionado && item.active !== false);
    const formulario = formularios.find((item) => tipoSelecionado === 'formulario' && item.id === idSelecionado && item.active !== false && item.tipo !== 'documento');
    const itemSelecionado = documento || formulario;
    if (!itemSelecionado || itensKitDocumental.some((item) => item.id === itemSelecionado.id)) return;
    setItensKitDocumental([...itensKitDocumental, { id: itemSelecionado.id, nome: itemSelecionado.nome, tipo: formulario ? 'formulario' : 'documento', documentoId: documento?.id, referenciaTipo: documento ? 'documento' : 'url', obrigatorio: true, info: formulario ? formulario.normas : documento?.descricao, url_template: documento?.template_url }]);
    setDocumentoSelecionadoId('');
    setDocumentoSelecionadoBusca('');
  };

  const handleUpdateDocumento = (id: string, field: keyof ItemKitDocumentalAdmin, value: string | boolean) => {
    setItensKitDocumental(itensKitDocumental.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleSelecionarDocumentoCatalogo = (id: string, nome: string) => {
    const documento = documentos.find((item) => item.nome === nome && item.active !== false && (!item.area || item.area === area));
    if (!documento) {
      handleUpdateDocumento(id, 'documentoId', '');
      return;
    }
    setItensKitDocumental(itensKitDocumental.map((item) => item.id === id ? {
      ...item,
      documentoId: documento.id,
      referenciaTipo: 'documento',
      nome: documento.nome,
      tipo: 'documento',
      info: documento.descricao,
      url_template: documento.template_url,
    } : item));
  };

  const handleAlterarTipoReferencia = (id: string, tipoReferencia: 'url' | 'documento') => {
    setItensKitDocumental(itensKitDocumental.map((item) => item.id === id ? {
      ...item,
      referenciaTipo: tipoReferencia,
      documentoId: tipoReferencia === 'documento' ? item.documentoId : undefined,
      url_template: tipoReferencia === 'documento' ? '' : item.url_template,
    } : item));
  };

  const handleRemoveDocumento = (id: string) => {
    setItensKitDocumental(itensKitDocumental.filter((d) => d.id !== id));
    const newEditing = { ...editingDocs };
    delete newEditing[id];
    setEditingDocs(newEditing);
  };

  const iniciarEdicaoDoc = (id: string) => {
    const documento = itensKitDocumental.find((item) => item.id === id);
    if (documento) setDocumentosAntesEdicao((atuais) => ({ ...atuais, [id]: { ...documento } }));
    setEditingDocs({ ...editingDocs, [id]: true });
  };

  const cancelarEdicaoDoc = (id: string) => {
    const original = documentosAntesEdicao[id];
    if (original) setItensKitDocumental((atuais) => atuais.map((item) => item.id === id ? original : item));
    setDocumentosAntesEdicao((atuais) => {
      const proximo = { ...atuais };
      delete proximo[id];
      return proximo;
    });
    setEditingDocs({ ...editingDocs, [id]: false });
  };

  const toggleEditDoc = (id: string, isEditing: boolean) => {
    if (!isEditing) setDocumentosAntesEdicao((atuais) => {
      const proximo = { ...atuais };
      delete proximo[id];
      return proximo;
    });
    setEditingDocs({ ...editingDocs, [id]: isEditing });
  };

  const handleAddPeriodo = () => {
    const id = Math.random().toString(36).substring(7);
    setPeriodosSubmissao([
      ...periodosSubmissao,
      { id, dataInicio: '', horaInicio: '00:00', dataFim: '', horaFim: '23:59', status: 'Fechado' },
    ]);
    setEditingPeriodos({ ...editingPeriodos, [id]: true });
  };

  const handleUpdatePeriodo = (id: string, field: keyof PeriodoSubmissao, value: string) => {
    setPeriodosSubmissao(
      periodosSubmissao.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePeriodo = (id: string) => {
    setPeriodosSubmissao(periodosSubmissao.filter((p) => p.id !== id));
    const newEditing = { ...editingPeriodos };
    delete newEditing[id];
    setEditingPeriodos(newEditing);
  };

  const toggleEditPeriodo = (id: string, isEditing: boolean) => {
    setEditingPeriodos({ ...editingPeriodos, [id]: isEditing });
  };

  const caminhoSalvoPreview = normalizarCaminhoModelo(documentoPreview?.itensKitDocumental[0]?.url_template || '');
  const caminhoSolicitadoPreview = caminhoSalvoPreview || modelosDocx[0]?.caminho || '';
  const modeloPreviewDisponivel = modelosDocx.some((modelo) => modelo.caminho === caminhoSolicitadoPreview);
  const caminhoModeloPreview = modeloPreviewDisponivel ? caminhoSolicitadoPreview : '';
  const itensKitDisponiveis = [
    ...documentos.filter((documento) => documento.active !== false && (!documento.area || documento.area === area)).map((documento) => ({ chave: `documento:${documento.id}`, rotulo: `${documento.nome} — Documento` })),
    ...formularios.filter((formulario) => formulario.active !== false && formulario.area === area && formulario.tipo !== 'documento' && formulario.id !== editingId).map((formulario) => ({ chave: `formulario:${formulario.id}`, rotulo: `${formulario.nome} — Formulário` })),
  ];

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-8">
      {documentoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setDocumentoPreview(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-preview-lista" className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <header className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <div><h2 id="titulo-preview-lista" className="text-lg font-bold text-on-surface">{documentoPreview.nome}</h2><p className="text-xs text-on-surface-variant">Pré-visualização com o modelo DOCX</p></div>
              <button type="button" onClick={() => setDocumentoPreview(null)} aria-label="Fechar pré-visualização" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined">close</span></button>
            </header>
            {!caminhoSalvoPreview && caminhoModeloPreview && <p className="border-b border-outline-variant bg-amber-50 px-5 py-2 text-xs text-amber-900">Modelo padrão aplicado nesta prévia. Edite e salve o documento para registrar o vínculo.</p>}
            {caminhoSalvoPreview && !modeloPreviewDisponivel && <p role="alert" className="border-b border-outline-variant bg-amber-50 px-5 py-2 text-xs text-amber-900">O modelo salvo ({caminhoSalvoPreview}) não foi encontrado na pasta de templates. Selecione um arquivo disponível na edição.</p>}
            <div className="min-h-0 flex-1 overflow-auto bg-slate-200 p-2 sm:p-4"><ModeloDocxPreview modeloUrl={caminhoModeloPreview} html={obterConteudoPreview(documentoPreview)} /></div>
            <footer className="flex justify-end gap-2 border-t border-outline-variant px-5 py-3">
              {modeloPreviewDisponivel && <a href={caminhoModeloPreview} download className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low"><span className="material-symbols-outlined text-[17px]">download</span>Modelo DOCX</a>}
              <button type="button" onClick={() => setDocumentoPreview(null)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">Fechar</button>
            </footer>
          </section>
        </div>
      )}
      {confirmacaoCadastro && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-auto bg-slate-950/60 p-4" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !confirmandoCadastro) setConfirmacaoCadastro(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao-cadastro" className="w-full max-w-[28rem] min-w-0 shrink-0 overflow-hidden rounded-2xl bg-surface p-5 shadow-2xl">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${confirmacaoCadastro.acao === 'arquivar' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                {confirmacaoCadastro.acao === 'arquivar' ? 'delete' : 'content_copy'}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="titulo-confirmacao-cadastro" className="text-lg font-bold text-on-surface">{confirmacaoCadastro.acao === 'arquivar' ? 'Excluir cadastro?' : 'Clonar cadastro?'}</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{confirmacaoCadastro.acao === 'arquivar' ? `O item “${confirmacaoCadastro.item.nome}” será arquivado e deixará de aparecer como ativo.` : `Será criada uma cópia de “${confirmacaoCadastro.item.nome}”, incluindo suas configurações e itens do kit.`}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button type="button" disabled={confirmandoCadastro} onClick={() => setConfirmacaoCadastro(null)} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-60">Cancelar</button>
              <button type="button" disabled={confirmandoCadastro} onClick={() => void executarConfirmacao()} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirmacaoCadastro.acao === 'arquivar' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}>{confirmandoCadastro ? 'Aguarde...' : confirmacaoCadastro.acao === 'arquivar' ? 'Excluir' : 'Clonar'}</button>
            </div>
          </div>
        </div>
      )}

      {isFormVisible ? (
      <div>
        <h2 className="text-xl font-bold mb-4 text-on-surface">
          {editingId ? `Editar ${tipo === 'documento' ? 'Documento' : 'Formulário'}` : `Novo ${tipo === 'documento' ? 'Documento' : 'Formulário'}`}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Nome do {tipo === 'documento' ? 'Documento' : 'Formulário'}</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Sequência (nSeq)</label>
            <input type="number" min="0" className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary" value={nSeq} onChange={(e) => setNSeq(Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Área</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={area}
              onChange={(e) => setArea(e.target.value as 'Projetos' | 'Programa de Apoio')}
            >
              <option value="Projetos">Projetos</option>
              <option value="Programa de Apoio">Programa de Apoio</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Tipo</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={tipo}
              onChange={(e) => {
                const novoTipo = e.target.value as 'formulario' | 'documento';
                setTipo(novoTipo);
                if (novoTipo === 'documento' && !templateUrl) setTemplateUrl(modelosDocx[0]?.caminho || '');
              }}
            >
              <option value="formulario">Formulário</option>
              <option value="documento">Documento</option>
            </select>
          </div>
          {tipo === 'formulario' && <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Linha de Apoio</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={linhaApoioId}
              onChange={(e) => setLinhaApoioId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {linhasApoio.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>}
          {tipo === 'formulario' && <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Status de Abertura</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Aberto' | 'Fechado')}
            >
              <option value="Aberto">Aberto</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>}
        </div>

        {tipo === 'documento' ? <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="modelo-docx-documento" className="block text-[13px] font-semibold text-on-surface mb-1">Modelo DOCX ou PDF do documento</label>
            <select id="modelo-docx-documento" className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary" value={templateUrl} onChange={(e) => setTemplateUrl(e.target.value)}>
              <option value="">Selecione um arquivo DOCX ou PDF...</option>
              {templateUrl && !modelosDocx.some((modelo) => modelo.caminho === templateUrl) && <option value={templateUrl}>Modelo anterior não encontrado: {templateUrl}</option>}
              {modelosDocx.map((modelo) => <option key={modelo.caminho} value={modelo.caminho}>{modelo.nome}</option>)}
            </select>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label htmlFor="importar-modelo-documento" className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10">
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                {importandoModelo ? 'Importando modelo...' : 'Importar modelo DOCX/PDF'}
              </label>
              <input id="importar-modelo-documento" type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" disabled={importandoModelo} onChange={(evento) => { const arquivo = evento.target.files?.[0]; evento.currentTarget.value = ''; if (arquivo) void importarModelo(arquivo); }} />
              <span className="text-xs text-on-surface-variant">O arquivo será salvo na pasta de templates.</span>
            </div>
            {templateUrl && <p className="mt-1 text-xs text-on-surface-variant">Caminho salvo no cadastro: <code className="break-all">{templateUrl}</code></p>}
            {erroModelosDocx && <p role="alert" className="mt-1 text-xs text-error">{erroModelosDocx}</p>}
            {!erroModelosDocx && modelosDocx.length === 0 && <p className="mt-1 text-xs text-on-surface-variant">Nenhum arquivo DOCX ou PDF encontrado na pasta de templates.</p>}
          </div>
          <EditorDocumento titulo={nome} modeloUrl={modelosDocx.some((modelo) => modelo.caminho === templateUrl) ? templateUrl : ''} valor={descricaoDocumento} aoAlterar={setDescricaoDocumento} />
        </div> : <div className="mb-4">
          <label className="block text-[13px] font-semibold text-on-surface mb-1">Normas / Regras</label>
          <textarea
            rows={4}
            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
            placeholder="Descreva as normas, diretrizes e limites para este formulário..."
            value={normas}
            onChange={(e) => setNormas(e.target.value)}
          />
        </div>}

        {tipo === 'formulario' && <>
        {/* Documentos Solicitados */}
        <div className="mb-6 p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-on-surface text-[14px]">Kit de Documentos e Formulários</h3>
            <button
              onClick={handleAddDocumento}
              className="text-primary text-[12px] font-bold uppercase hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Adicionar item
            </button>
          </div>
          {tipo === 'formulario' && documentos.some((documento) => documento.active !== false) && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input list="kit-itens-disponiveis" className="flex-1 p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface" value={documentoSelecionadoBusca} placeholder="Digite para pesquisar documento ou formulário..." onChange={(event) => { const valor = event.target.value; setDocumentoSelecionadoBusca(valor); setDocumentoSelecionadoId(itensKitDisponiveis.find((item) => item.rotulo === valor)?.chave || ''); }} />
              <datalist id="kit-itens-disponiveis">{itensKitDisponiveis.map((item) => <option key={item.chave} value={item.rotulo} />)}</datalist>
              <select className="hidden" value={documentoSelecionadoId} onChange={(event) => setDocumentoSelecionadoId(event.target.value)}>
                <option value="">Selecionar documento ou formulário...</option>
                <optgroup label="Documentos">
                  {documentos.filter((documento) => documento.active !== false).map((documento) => <option key={`documento:${documento.id}`} value={`documento:${documento.id}`}>{documento.nome}</option>)}
                </optgroup>
                <optgroup label="Formulários">
                  {formularios.filter((formulario) => formulario.active !== false && formulario.tipo === 'formulario' && formulario.id !== editingId).map((formulario) => <option key={`formulario:${formulario.id}`} value={`formulario:${formulario.id}`}>{formulario.nome}</option>)}
                </optgroup>
              </select>
              <button type="button" onClick={handleVincularItem} className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">Vincular item</button>
            </div>
          )}
          {itensKitDocumental.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">Nenhum documento exigido.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {itensKitDocumental.map((doc, idx) => (
                <div key={doc.id} className="p-4 bg-surface rounded-xl border border-outline-variant">
                  {editingDocs[doc.id] ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">{doc.tipo === 'formulario' ? 'Formulário' : 'Documento'} {idx + 1} (Editando)</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => cancelarEdicaoDoc(doc.id)}
                            className="px-3 py-1.5 rounded-lg bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 text-sm font-semibold transition-colors"
                          >
                            Cancelar Edição
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleEditDoc(doc.id, false)}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Salvar Subitem
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nome / Descrição do Documento *</label>
                        <input
                          type="text"
                          className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                          placeholder="Ex: Justificativa da necessidade do recurso..."
                          value={doc.nome}
                          onChange={(e) => handleUpdateDocumento(doc.id, 'nome', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Info / Instruções (Opcional)</label>
                        <input
                          type="text"
                          className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                          placeholder="Ex: Assinado pelo aluno e orientador..."
                          value={doc.info || ''}
                          onChange={(e) => handleUpdateDocumento(doc.id, 'info', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Tipo de referência</label>
                            <select value={doc.referenciaTipo || (doc.documentoId ? 'documento' : 'url')} onChange={(e) => handleAlterarTipoReferencia(doc.id, e.target.value as 'url' | 'documento')} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-on-surface focus:outline-primary">
                              <option value="url">URL manual</option>
                              <option value="documento">Documento cadastrado</option>
                            </select>
                        </div>
                        <div>
                          {(doc.referenciaTipo === 'documento' || doc.documentoId) ? (
                            <>
                              <input
                                list={`documentos-catalogo-${doc.id}`}
                                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                                placeholder="Digite para pesquisar um documento da área..."
                                value={documentos.find((item) => item.id === doc.documentoId)?.nome || ''}
                                onChange={(e) => handleSelecionarDocumentoCatalogo(doc.id, e.target.value)}
                              />
                              <datalist id={`documentos-catalogo-${doc.id}`}>
                                {documentos.filter((item) => item.active !== false && (!item.area || item.area === area)).map((item) => <option key={item.id} value={item.nome} />)}
                              </datalist>
                            </>
                          ) : (
                            <input
                              type="url"
                              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                              placeholder="https://exemplo.com/modelo.pdf"
                              value={doc.url_template || ''}
                              onChange={(e) => handleUpdateDocumento(doc.id, 'url_template', e.target.value)}
                            />
                          )}
                        </div>
                        <label className="flex items-center gap-2 pb-2 text-sm font-semibold text-on-surface"><input type="checkbox" checked={doc.obrigatorio !== false} onChange={(e) => handleUpdateDocumento(doc.id, 'obrigatorio', e.target.checked)} /> Obrigatório</label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-bold text-on-surface text-[14px]">
                          {idx + 1}. {doc.nome || 'Item sem nome'} <span className="ml-2 rounded bg-surface-variant px-2 py-0.5 text-[10px] uppercase">{doc.tipo === 'formulario' ? 'Formulário' : 'Documento'}</span>
                        </span>
                        <span className={`text-xs font-semibold ${doc.obrigatorio === false ? 'text-on-surface-variant' : 'text-primary'}`}>{doc.obrigatorio === false ? 'Opcional' : 'Obrigatório'}</span>
                        {(doc.info || doc.url_template) && (
                          <div className="flex flex-col text-xs text-on-surface-variant mt-1">
                            {doc.info && <span><span className="font-semibold">Info:</span> {doc.info}</span>}
                            {doc.url_template && <span><span className="font-semibold">Template:</span> {doc.url_template}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" role="switch" aria-checked={doc.obrigatorio !== false} onClick={() => handleUpdateDocumento(doc.id, 'obrigatorio', doc.obrigatorio === false)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${doc.obrigatorio !== false ? 'bg-secondary' : 'bg-surface-variant'}`} title={doc.obrigatorio !== false ? 'Tornar opcional' : 'Tornar obrigatório'}><span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${doc.obrigatorio !== false ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                        <button
                          onClick={() => iniciarEdicaoDoc(doc.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleRemoveDocumento(doc.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Períodos de Submissão */}
        <div className="mb-6 p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-on-surface text-[14px]">Calendário de Submissão</h3>
            <button
              onClick={handleAddPeriodo}
              className="text-primary text-[12px] font-bold uppercase hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Adicionar Período
            </button>
          </div>
          {periodosSubmissao.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">Nenhum período cadastrado (Fluxo contínuo ou Indisponível).</p>
          ) : (
            <div className="flex flex-col gap-4">
              {periodosSubmissao.map((p, idx) => (
                <div key={p.id} className="p-4 bg-surface rounded-xl border border-outline-variant">
                  {editingPeriodos[p.id] ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">Período {idx + 1} (Editando)</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleEditPeriodo(p.id, false)}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Salvar Subitem
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Status</label>
                          <select
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            value={p.status}
                            onChange={(e) => handleUpdatePeriodo(p.id, 'status', e.target.value)}
                          >
                            <option value="Aberto">Aberto</option>
                            <option value="Fechado">Fechado</option>
                          </select>
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Data Início</label>
                          <PatternFormat
                            format="##/##/####"
                            mask="_"
                            placeholder="DD/MM/AAAA"
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            value={p.dataInicio}
                            onValueChange={(values) => handleUpdatePeriodo(p.id, 'dataInicio', values.formattedValue)}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Hora Início</label>
                          <PatternFormat
                            format="##:##"
                            mask="_"
                            placeholder="HH:MM"
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            value={p.horaInicio}
                            onValueChange={(values) => handleUpdatePeriodo(p.id, 'horaInicio', values.formattedValue)}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Data Fim</label>
                          <PatternFormat
                            format="##/##/####"
                            mask="_"
                            placeholder="DD/MM/AAAA"
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            value={p.dataFim}
                            onValueChange={(values) => handleUpdatePeriodo(p.id, 'dataFim', values.formattedValue)}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Hora Fim</label>
                          <PatternFormat
                            format="##:##"
                            mask="_"
                            placeholder="HH:MM"
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            value={p.horaFim}
                            onValueChange={(values) => handleUpdatePeriodo(p.id, 'horaFim', values.formattedValue)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-on-surface text-[14px]">Período {idx + 1}</span>
                        <div className="flex gap-4 text-xs text-on-surface-variant mt-1">
                          <span><span className="font-semibold">Início:</span> {p.dataInicio || '--/--/----'} às {p.horaInicio || '--:--'}</span>
                          <span><span className="font-semibold">Fim:</span> {p.dataFim || '--/--/----'} às {p.horaFim || '--:--'}</span>
                          <span>
                            <span className="font-semibold">Status:</span> 
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'Aberto' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                              {p.status}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleEditPeriodo(p.id, true)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleRemovePeriodo(p.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        </>}
        {erroSalvar && <div role="alert" className="mb-3 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erroSalvar}</div>}
        <div className="flex justify-end gap-3">
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-surface-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-variant/80 transition-colors"
            >
              Cancelar Edição
            </button>
          )}
          <button
            type="button"
            disabled={salvando}
            onClick={() => void handleSave()}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            {salvando ? 'Salvando no banco...' : tipo === 'documento' ? editingId ? 'Salvar Documento' : 'Adicionar Documento' : editingId ? 'Salvar Tudo (Formulário e Subitens)' : 'Adicionar Formulário'}
          </button>
        </div>
      </div>
      ) : (
      <>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <h2 className="text-xl font-bold text-on-surface">Lista de {modo === 'documentos' ? 'Documentos' : 'Formulários'}</h2>
        <label className="relative flex-1 min-w-0 lg:max-w-2xl lg:mx-auto">
          <span className="sr-only">Pesquisar {modo === 'documentos' ? 'documentos' : 'formulários'}</span>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="search"
            value={pesquisa}
            onChange={(event) => { setPesquisa(event.target.value); setPagina(1); }}
            placeholder={modo === 'documentos' ? 'Pesquisar documento ou status...' : 'Pesquisar formulário, tipo, linha ou status...'}
            className="w-full min-w-0 pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-primary"
          />
        </label>
        {modo !== 'documentos' && <select aria-label="Filtrar por área" value={filtroArea} onChange={(event) => { setFiltroArea(event.target.value as typeof filtroArea); setPagina(1); }} className="px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm lg:w-44">
          <option value="Todos">Todas as áreas</option>
          <option value="Projetos">Projetos</option>
          <option value="Programa de Apoio">Programa de Apoio</option>
        </select>}
        {modo === 'formularios' && <select aria-label="Filtrar por habilitação" value={filtroHabilitado} onChange={(event) => { setFiltroHabilitado(event.target.value as typeof filtroHabilitado); setPagina(1); }} className="px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm lg:w-44">
          <option value="Todos">Todos os status</option>
          <option value="Habilitados">Habilitados</option>
          <option value="Desabilitados">Desabilitados</option>
        </select>}
        {modo === 'documentos' && <select aria-label="Filtrar por área" value={filtroArea} onChange={(event) => { setFiltroArea(event.target.value as typeof filtroArea); setPagina(1); }} className="px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm lg:w-44">
          <option value="Todos">Todas as áreas</option>
          <option value="Projetos">Projetos</option>
          <option value="Programa de Apoio">Programa de Apoio</option>
        </select>}
        <button
          onClick={handleNew}
          disabled={formulariosCarregando || Boolean(erroCarregarFormularios)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo {modo === 'documentos' ? 'Documento' : 'Formulário'}
        </button>
      </div>

      {erroCarregarFormularios && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        <span>Falha ao ler os formulários do banco: {erroCarregarFormularios}</span>
        <button type="button" onClick={() => void recarregarFormularios().catch(() => undefined)} className="rounded-md border border-error/40 px-3 py-1.5 font-semibold hover:bg-error/10">Tentar novamente</button>
      </div>}
      {erroLista && <div role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{erroLista}</div>}
      {formulariosCarregando && <p role="status" className="mt-4 text-sm text-on-surface-variant">Carregando formulários do banco...</p>}
      {/* Lista de Formulários */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-on-surface-variant">
            <tr>
              <th className="p-4 font-semibold">{modo === 'documentos' ? 'Documento' : 'Formulário'}</th>
              <th className="p-4 font-semibold">Área</th>
              <th className="p-4 font-semibold">Linha de Apoio</th>
              {modo !== 'documentos' && <th className="p-4 font-semibold">Status</th>}
              {modo === 'formularios' && <th className="p-4 font-semibold">Habilitado</th>}
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
            {formulariosPagina.map((form) => {
              const linha = linhasApoio.find((l) => l.id === form.linhaApoioId);
              const resumo = form.tipo === 'documento'
                ? form.itensKitDocumental[0]?.info?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Documento oficial.'
                : form.normas || 'Sem normas.';
              return (
                <tr key={form.id} className={`hover:bg-surface-container/30 transition-colors ${form.active === false ? 'opacity-60 bg-surface-container-low' : ''}`}>
                  <td className="p-4 text-on-surface font-medium max-w-[250px] truncate" title={form.nome}>
                    <div className="flex items-center gap-2">
                      {form.nome}
                      {form.active === false && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error uppercase">Inativo</span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant font-normal mt-0.5 truncate" title={resumo}>
                      {resumo}
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{form.area}</td>
                  <td className="p-4 text-on-surface-variant">{linha?.nome || 'N/A'}</td>
                  {modo !== 'documentos' && <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${
                      form.status === 'Aberto' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {form.status}
                    </span>
                  </td>}
                  {modo === 'formularios' && <td className="p-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.habilitado !== false}
                      aria-label={`${form.habilitado !== false ? 'Desabilitar' : 'Habilitar'} ${form.nome}`}
                      onClick={() => void handleAlternarHabilitado(form)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${form.habilitado !== false ? 'bg-secondary' : 'bg-surface-variant'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.habilitado !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>}
                  <td className="p-4 text-right align-top">
                    <div className="flex justify-end gap-2 h-full items-center">
                      {modo === 'documentos' && form.active !== false && <button
                        type="button"
                        onClick={() => setDocumentoPreview(form)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Pré-visualizar"
                        aria-label={`Pré-visualizar ${form.nome}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>}
                      {form.active !== false && <button
                        type="button"
                        onClick={() => solicitarConfirmacao('clonar', form)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Clonar"
                        aria-label={`Clonar ${form.nome}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>}
                      {form.active !== false && <button
                        onClick={() => handleEdit(form)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>}
                      {form.active === false ? (
                        <button
                          onClick={() => void handleRestaurar(form.id)}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                          title="Restaurar"
                        >
                          <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => solicitarConfirmacao('arquivar', form)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {formulariosPagina.length === 0 && (
              <tr>
                <td colSpan={modo === 'formularios' ? 6 : 4} className="p-8 text-center text-on-surface-variant">
                  Nenhum {modo === 'documentos' ? 'documento' : 'formulário'} cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 mt-4">
        <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
          <span>{formulariosFiltrados.length} {modo === 'documentos' ? 'documento(s)' : 'formulário(s)'} encontrado(s)</span>
          <span>Página {paginaAtual} de {totalPaginas}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={paginaAtual <= 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[17px]">chevron_left</span>Anterior
          </button>
          <button type="button" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low">
            Próxima<span className="material-symbols-outlined text-[17px]">chevron_right</span>
          </button>
        </div>
      </div>

      </>
      )}
    </div>
  );
};
