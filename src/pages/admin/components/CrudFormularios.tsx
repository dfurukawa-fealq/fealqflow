import { useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { FormularioApoio, PeriodoSubmissao, DocumentoSolicitadoAdmin } from '../../../types/admin';
import { PatternFormat } from 'react-number-format';

export const CrudFormularios = () => {
  const { linhasApoio, formularios, addFormulario, updateFormulario, deleteFormulario } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [nome, setNome] = useState('');
  const [linhaApoioId, setLinhaApoioId] = useState('');
  const [status, setStatus] = useState<'Aberto' | 'Fechado'>('Fechado');
  const [normas, setNormas] = useState('');
  const [documentosSolicitados, setDocumentosSolicitados] = useState<DocumentoSolicitadoAdmin[]>([]);
  const [periodosSubmissao, setPeriodosSubmissao] = useState<PeriodoSubmissao[]>([]);

  const [editingDocs, setEditingDocs] = useState<Record<string, boolean>>({});
  const [editingPeriodos, setEditingPeriodos] = useState<Record<string, boolean>>({});

  const handleEdit = (form: FormularioApoio) => {
    setEditingId(form.id);
    setNome(form.nome);
    setLinhaApoioId(form.linhaApoioId);
    setStatus(form.status);
    setNormas(form.normas || '');
    
    setDocumentosSolicitados(form.documentosSolicitados || []);
    setPeriodosSubmissao(form.periodosSubmissao || []);
    setEditingDocs({});
    setEditingPeriodos({});
    setIsFormVisible(true);
  };

  const handleSave = () => {
    if (!nome.trim() || !linhaApoioId) return;

    const docsFormatados = documentosSolicitados.filter(d => d.nome.trim() !== '');

    const data = {
      nome,
      linhaApoioId,
      status,
      normas,
      documentosSolicitados: docsFormatados,
      periodosSubmissao,
    };

    if (editingId) {
      updateFormulario(editingId, data);
      setEditingId(null);
    } else {
      addFormulario(data);
    }
    resetForm();
  };

  const handleNew = () => {
    setEditingId(null);
    setNome('');
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

  const resetForm = () => {
    setNome('');
    setLinhaApoioId('');
    setStatus('Fechado');
    setNormas('');
    setDocumentosSolicitados([]);
    setPeriodosSubmissao([]);
    setEditingDocs({});
    setEditingPeriodos({});
  };

  const handleAddDocumento = () => {
    const id = Math.random().toString(36).substring(7);
    setDocumentosSolicitados([...documentosSolicitados, { id, nome: '', info: '', url_template: '' }]);
    setEditingDocs({ ...editingDocs, [id]: true });
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
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Status de Abertura</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Aberto' | 'Fechado')}
            >
              <option value="Aberto">Aberto</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-on-surface mb-1">Normas / Regras</label>
          <textarea
            rows={4}
            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
            placeholder="Descreva as normas, diretrizes e limites para este formulário..."
            value={normas}
            onChange={(e) => setNormas(e.target.value)}
          />
        </div>

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
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {editingId ? 'Salvar Tudo (Formulário e Subitens)' : 'Adicionar Formulário'}
          </button>
        </div>
      </div>
      ) : (
      <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">Lista de Formulários</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Formulário
        </button>
      </div>

      {/* Lista de Formulários */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-on-surface-variant">
            <tr>
              <th className="p-4 font-semibold">Formulário</th>
              <th className="p-4 font-semibold">Linha de Apoio</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
            {formularios.map((form) => {
              const linha = linhasApoio.find((l) => l.id === form.linhaApoioId);
              return (
                <tr key={form.id} className={`hover:bg-surface-container/30 transition-colors ${form.active === false ? 'opacity-60 bg-surface-container-low' : ''}`}>
                  <td className="p-4 text-on-surface font-medium max-w-[250px] truncate" title={form.nome}>
                    <div className="flex items-center gap-2">
                      {form.nome}
                      {form.active === false && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error uppercase">Inativo</span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant font-normal mt-0.5 truncate" title={form.normas}>
                      {form.normas || 'Sem normas.'}
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{linha?.nome || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${
                      form.status === 'Aberto' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {form.status}
                    </span>
                  </td>
                  <td className="p-4 text-right align-top">
                    <div className="flex justify-end gap-2 h-full items-center">
                      <button
                        onClick={() => handleEdit(form)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {form.active === false ? (
                        <button
                          onClick={() => updateFormulario(form.id, { active: true })}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                          title="Restaurar"
                        >
                          <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteFormulario(form.id)}
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
            {formularios.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                  Nenhum formulário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};
