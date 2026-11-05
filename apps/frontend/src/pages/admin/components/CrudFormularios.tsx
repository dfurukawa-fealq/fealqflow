import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { FormularioApoio, PeriodoSubmissao, DocumentoSolicitadoAdmin } from '../../../types/admin';
import { PatternFormat } from 'react-number-format';
import { EditorDocumento, limparHtmlDocumento, normalizarMarcadoresDocumento } from './EditorDocumento';

interface CrudFormulariosProps {
  modo?: 'todos' | 'formularios' | 'documentos';
}

export const CrudFormularios = ({ modo = 'todos' }: CrudFormulariosProps) => {
  const templateInstitucional = '/templates/Template_Timbrado.docx';
  const { linhasApoio, formularios, formulariosCarregando, erroCarregarFormularios, recarregarFormularios, documentos, addFormulario, updateFormulario, persistirFormulario, deleteFormulario, addDocumento } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState('');
  const [erroLista, setErroLista] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [documentoPreview, setDocumentoPreview] = useState<FormularioApoio | null>(null);

  const [nome, setNome] = useState('');
  const [area, setArea] = useState<'Projetos' | 'Programa de Apoio'>('Programa de Apoio');
  const [tipo, setTipo] = useState<'Formulário' | 'Documento'>('Formulário');
  const [descricaoDocumento, setDescricaoDocumento] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [documentoSelecionadoId, setDocumentoSelecionadoId] = useState('');
  const [linhaApoioId, setLinhaApoioId] = useState('');
  const [status, setStatus] = useState<'Aberto' | 'Fechado'>('Fechado');
  const [normas, setNormas] = useState('');
  const [documentosSolicitados, setDocumentosSolicitados] = useState<DocumentoSolicitadoAdmin[]>([]);
  const [periodosSubmissao, setPeriodosSubmissao] = useState<PeriodoSubmissao[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroArea, setFiltroArea] = useState<'Todos' | 'Projetos' | 'Programa de Apoio'>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Formulário' | 'Documento'>(modo === 'formularios' ? 'Formulário' : modo === 'documentos' ? 'Documento' : 'Todos');
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    if (modo === 'documentos') setTipo('Documento');
    if (modo === 'formularios') setTipo('Formulário');
  }, [modo]);

  const [editingDocs, setEditingDocs] = useState<Record<string, boolean>>({});
  const [editingPeriodos, setEditingPeriodos] = useState<Record<string, boolean>>({});
  const formulariosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return formularios.filter((form) => {
      const correspondeArea = filtroArea === 'Todos' || form.area === filtroArea;
      const correspondeTipo = filtroTipo === 'Todos' || form.tipo === filtroTipo;
      const linha = linhasApoio.find((item) => item.id === form.linhaApoioId)?.nome || '';
      const correspondePesquisa = !termo || [form.nome, form.area, form.tipo, form.status, linha, form.normas]
        .join(' ')
        .toLowerCase()
        .includes(termo);
      return correspondeArea && correspondeTipo && correspondePesquisa;
    });
  }, [formularios, linhasApoio, pesquisa, filtroArea, filtroTipo]);

  const totalPaginas = Math.max(1, Math.ceil(formulariosFiltrados.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const formulariosPagina = formulariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  const handleEdit = (form: FormularioApoio) => {
    setEditingId(form.id);
    setNome(form.nome);
    setArea(form.area);
    setTipo(form.tipo);
    setLinhaApoioId(form.linhaApoioId);
    setStatus(form.status);
    setNormas(form.normas || '');
    setDescricaoDocumento(form.tipo === 'Documento' ? form.documentosSolicitados[0]?.info || '' : '');
    setTemplateUrl(form.tipo === 'Documento' ? form.documentosSolicitados[0]?.url_template || '' : '');
    
    setDocumentosSolicitados(form.documentosSolicitados || []);
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
    if (!linhaApoioId && tipo === 'Formulário') {
      setErroSalvar('Selecione uma linha de apoio antes de salvar o formulário.');
      return;
    }

    setSalvando(true);
    try {
      if (tipo === 'Documento') {
        const documento = { id: editingId || undefined, nome: nome.trim(), descricao: descricaoDocumento, template_url: templateUrl, active: true };
        if (editingId) {
          await persistirFormulario(editingId, {
            nome: nome.trim(),
            area,
            tipo: 'Documento',
            linhaApoioId: '',
            status,
            normas,
            periodosSubmissao: [],
            documentosSolicitados: [{ id: editingId, nome: nome.trim(), info: descricaoDocumento, url_template: templateUrl }],
          });
        } else {
          await addDocumento(documento);
        }
        resetForm();
        return;
      }

      const docsFormatados = documentosSolicitados.filter(d => d.nome.trim() !== '');
      const data = {
        nome,
        area,
        tipo: 'Formulário' as const,
        linhaApoioId,
        status,
        normas,
        documentosSolicitados: docsFormatados,
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
    setArea('Programa de Apoio');
    setTipo('Formulário');
    setLinhaApoioId('');
    setStatus('Aberto');
    setPeriodosSubmissao([]);
    setNormas('');
    setDocumentosSolicitados([]);
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

  const handleRestaurar = async (id: string) => {
    setErroLista('');
    try {
      await updateFormulario(id, { active: true });
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao restaurar no banco de dados.');
    }
  };

  const handleAlternarHabilitado = async (form: FormularioApoio) => {
    setErroLista('');
    try {
      await updateFormulario(form.id, { active: form.active === false });
    } catch (erro) {
      setErroLista(erro instanceof Error ? erro.message : 'Falha ao alterar o status do formulário.');
    }
  };

  const obterConteudoPreview = (form: FormularioApoio) => {
    const conteudo = form.documentosSolicitados[0]?.info || '<p>Este documento ainda não possui conteúdo cadastrado.</p>';
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
    setArea('Programa de Apoio');
    setTipo('Formulário');
    setLinhaApoioId('');
    setStatus('Fechado');
    setNormas('');
    setDocumentosSolicitados([]);
    setPeriodosSubmissao([]);
    setDescricaoDocumento('');
    setTemplateUrl(templateInstitucional);
    setEditingDocs({});
    setEditingPeriodos({});
  };

  const handleAddDocumento = () => {
    const id = Math.random().toString(36).substring(7);
    setDocumentosSolicitados([...documentosSolicitados, { id, nome: '', info: '', url_template: '' }]);
    setEditingDocs({ ...editingDocs, [id]: true });
  };

  const handleVincularDocumento = () => {
    const documento = documentos.find((item) => item.id === documentoSelecionadoId && item.active !== false);
    if (!documento || documentosSolicitados.some((item) => item.id === documento.id)) return;
    setDocumentosSolicitados([...documentosSolicitados, {
      id: documento.id,
      nome: documento.nome,
      info: documento.descricao,
      url_template: documento.template_url,
    }]);
    setDocumentoSelecionadoId('');
  };

  const handleUpdateDocumento = (id: string, field: keyof DocumentoSolicitadoAdmin, value: string) => {
    setDocumentosSolicitados(documentosSolicitados.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleRemoveDocumento = (id: string) => {
    setDocumentosSolicitados(documentosSolicitados.filter((d) => d.id !== id));
    const newEditing = { ...editingDocs };
    delete newEditing[id];
    setEditingDocs(newEditing);
  };

  const toggleEditDoc = (id: string, isEditing: boolean) => {
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

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-8">
      {documentoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setDocumentoPreview(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-preview-lista" className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <header className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <div><h2 id="titulo-preview-lista" className="text-lg font-bold text-on-surface">{documentoPreview.nome}</h2><p className="text-xs text-on-surface-variant">Pré-visualização do documento</p></div>
              <button type="button" onClick={() => setDocumentoPreview(null)} aria-label="Fechar pré-visualização" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="overflow-auto bg-slate-200 p-4 sm:p-8"><article className="mx-auto min-h-[600px] max-w-3xl bg-white p-8 shadow-lg sm:p-14" dangerouslySetInnerHTML={{ __html: obterConteudoPreview(documentoPreview) }} /></div>
            <footer className="flex justify-end gap-2 border-t border-outline-variant px-5 py-3">
              {documentoPreview.documentosSolicitados[0]?.url_template && <a href={documentoPreview.documentosSolicitados[0].url_template} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low"><span className="material-symbols-outlined text-[17px]">download</span>Modelo DOCX</a>}
              <button type="button" onClick={() => setDocumentoPreview(null)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">Fechar</button>
            </footer>
          </section>
        </div>
      )}
      {isFormVisible ? (
      <div>
        <h2 className="text-xl font-bold mb-4 text-on-surface">
          {editingId ? 'Editar Formulário' : 'Novo Formulário'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Nome do Formulário</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
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
                const novoTipo = e.target.value as 'Formulário' | 'Documento';
                setTipo(novoTipo);
                if (novoTipo === 'Documento' && !templateUrl) setTemplateUrl(templateInstitucional);
              }}
            >
              <option value="Formulário">Formulário</option>
              <option value="Documento">Documento</option>
            </select>
          </div>
          {tipo === 'Formulário' && <div>
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
          {tipo === 'Formulário' && <div>
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

        {tipo === 'Documento' ? <div className="grid grid-cols-1 gap-4 mb-4">
          <EditorDocumento titulo={nome} modeloUrl={templateUrl || templateInstitucional} valor={descricaoDocumento} aoAlterar={setDescricaoDocumento} />
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Modelo DOCX do documento</label>
            <input type="url" className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary" value={templateUrl} onChange={(e) => setTemplateUrl(e.target.value)} placeholder="https://..." />
          </div>
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

        {tipo === 'Formulário' && <>
        {/* Documentos Solicitados */}
        <div className="mb-6 p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-on-surface text-[14px]">Documentos Solicitados</h3>
            <button
              onClick={handleAddDocumento}
              className="text-primary text-[12px] font-bold uppercase hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Adicionar Documento
            </button>
          </div>
          {tipo === 'Formulário' && documentos.some((documento) => documento.active !== false) && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select className="flex-1 p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface" value={documentoSelecionadoId} onChange={(event) => setDocumentoSelecionadoId(event.target.value)}>
                <option value="">Selecionar documento cadastrado...</option>
                {documentos.filter((documento) => documento.active !== false).map((documento) => <option key={documento.id} value={documento.id}>{documento.nome}</option>)}
              </select>
              <button type="button" onClick={handleVincularDocumento} className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">Vincular documento</button>
            </div>
          )}
          {documentosSolicitados.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">Nenhum documento exigido.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {documentosSolicitados.map((doc, idx) => (
                <div key={doc.id} className="p-4 bg-surface rounded-xl border border-outline-variant">
                  {editingDocs[doc.id] ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">Documento {idx + 1} (Editando)</span>
                        <div className="flex gap-2">
                          <button
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">URL do Template (Opcional)</label>
                          <input
                            type="text"
                            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                            placeholder="https://exemplo.com/modelo.docx"
                            value={doc.url_template || ''}
                            onChange={(e) => handleUpdateDocumento(doc.id, 'url_template', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-bold text-on-surface text-[14px]">
                          {idx + 1}. {doc.nome || 'Documento sem nome'}
                        </span>
                        {(doc.info || doc.url_template) && (
                          <div className="flex flex-col text-xs text-on-surface-variant mt-1">
                            {doc.info && <span><span className="font-semibold">Info:</span> {doc.info}</span>}
                            {doc.url_template && <span><span className="font-semibold">Template:</span> {doc.url_template}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleEditDoc(doc.id, true)}
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
            {salvando ? 'Salvando no banco...' : editingId ? 'Salvar Tudo (Formulário e Subitens)' : 'Adicionar Formulário'}
          </button>
        </div>
      </div>
      ) : (
      <>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <h2 className="text-xl font-bold text-on-surface">Lista de Formulários</h2>
        <label className="relative flex-1 min-w-0 lg:max-w-2xl lg:mx-auto">
          <span className="sr-only">Pesquisar formulários</span>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="search"
            value={pesquisa}
            onChange={(event) => { setPesquisa(event.target.value); setPagina(1); }}
            placeholder="Pesquisar formulário, tipo, linha ou status..."
            className="w-full min-w-0 pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-primary"
          />
        </label>
        {modo !== 'documentos' && <select aria-label="Filtrar por área" value={filtroArea} onChange={(event) => { setFiltroArea(event.target.value as typeof filtroArea); setPagina(1); }} className="px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm lg:w-44">
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
          Novo Formulário
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
              <th className="p-4 font-semibold">Formulário</th>
              <th className="p-4 font-semibold">Área</th>
              <th className="p-4 font-semibold">Tipo</th>
              <th className="p-4 font-semibold">Linha de Apoio</th>
              <th className="p-4 font-semibold">Status</th>
              {modo === 'formularios' && <th className="p-4 font-semibold">Habilitado</th>}
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
            {formulariosPagina.map((form) => {
              const linha = linhasApoio.find((l) => l.id === form.linhaApoioId);
              const resumo = form.tipo === 'Documento'
                ? form.documentosSolicitados[0]?.info?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Documento oficial.'
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
                  <td className="p-4 text-on-surface-variant">{form.tipo}</td>
                  <td className="p-4 text-on-surface-variant">{linha?.nome || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${
                      form.status === 'Aberto' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {form.status}
                    </span>
                  </td>
                  {modo === 'formularios' && <td className="p-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.active !== false}
                      aria-label={`${form.active !== false ? 'Desabilitar' : 'Habilitar'} ${form.nome}`}
                      onClick={() => void handleAlternarHabilitado(form)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${form.active !== false ? 'bg-secondary' : 'bg-surface-variant'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.active !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
                          onClick={() => void handleArquivar(form.id)}
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
                <td colSpan={modo === 'formularios' ? 7 : 6} className="p-8 text-center text-on-surface-variant">
                  Nenhum formulário cadastrado.
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
