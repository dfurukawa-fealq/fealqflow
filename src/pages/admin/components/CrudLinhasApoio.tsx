import { useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { LinhaApoio } from '../../../types/admin';

export const CrudLinhasApoio = () => {
  const { linhasApoio, addLinhaApoio, updateLinhaApoio, deleteLinhaApoio } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleEdit = (linha: LinhaApoio) => {
    setEditingId(linha.id);
    setNome(linha.nome);
    setIsFormVisible(true);
  };

  const handleSave = () => {
    if (!nome.trim()) return;
    if (editingId) {
      updateLinhaApoio(editingId, { nome });
      setEditingId(null);
    } else {
      addLinhaApoio({ nome });
    }
    setNome('');
    setIsFormVisible(false);
  };

  const handleNew = () => {
    setEditingId(null);
    setNome('');
    setIsFormVisible(true);
  };
  const handleCancel = () => {
    setEditingId(null);
    setNome('');
    setIsFormVisible(false);
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
      {!isFormVisible ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Linhas de Apoio</h2>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova Linha
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-on-surface-variant">
            <tr>
              <th className="p-4 font-semibold w-full">Nome</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
            {linhasApoio.map((linha) => (
              <tr key={linha.id} className={`hover:bg-surface-container/30 transition-colors ${linha.active === false ? 'opacity-60 bg-surface-container-low' : ''}`}>
                <td className="p-4 text-on-surface flex items-center gap-2">
                  {linha.nome}
                  {linha.active === false && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-error/10 text-error">Inativo</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(linha)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    {linha.active === false ? (
                      <button
                        onClick={() => updateLinhaApoio(linha.id, { active: true })}
                        className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                        title="Restaurar"
                      >
                        <span className="material-symbols-outlined text-[20px]">restore_from_trash</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteLinhaApoio(linha.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {linhasApoio.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-on-surface-variant">
                  Nenhuma linha de apoio cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      ) : (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface">
            {editingId ? 'Editar Linha de Apoio' : 'Nova Linha de Apoio'}
          </h2>
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
              Nome da Linha
            </label>
            <input
              type="text"
              placeholder="Ex: Ensino, Pesquisa..."
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-surface-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-variant/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
