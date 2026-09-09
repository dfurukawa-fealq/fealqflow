import React, { useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { Orcamento, TipoMovimentacao } from '../../../types/admin';

export const CrudOrcamentos = () => {
  const { linhasApoio, formularios, orcamentos, addOrcamento, updateOrcamento, deleteOrcamento, addMovimentacao, getSaldoOrcamento } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formularioId, setFormularioId] = useState('');
  const [ano, setAno] = useState<number | ''>(new Date().getFullYear());
  const [valorGlobal, setValorGlobal] = useState<number | ''>('');
  const [tetoPorPedido, setTetoPorPedido] = useState<number | ''>('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [expandedLinhas, setExpandedLinhas] = useState<Record<string, boolean>>({});

  const toggleLinha = (linhaId: string) => {
    setExpandedLinhas(prev => ({ ...prev, [linhaId]: !prev[linhaId] }));
  };

  const orcamentosByLinha: Record<string, typeof orcamentos> = {};
  linhasApoio.forEach(linha => {
    orcamentosByLinha[linha.id] = [];
  });
  
  orcamentos.forEach(orcamento => {
    const form = formularios.find(f => f.id === orcamento.formularioId);
    if (form) {
      if (!orcamentosByLinha[form.linhaApoioId]) {
        orcamentosByLinha[form.linhaApoioId] = [];
      }
      orcamentosByLinha[form.linhaApoioId].push(orcamento);
    }
  });

  const getTotaisLinha = (linhaId: string) => {
    const list = orcamentosByLinha[linhaId] || [];
    let valorInicial = 0;
    let saldoAtual = 0;
    list.forEach(o => {
      valorInicial += o.valorGlobal;
      saldoAtual += getSaldoOrcamento(o.id);
    });
    return { valorInicial, saldoAtual, count: list.length };
  };



  const [movimentacaoAction, setMovimentacaoAction] = useState<TipoMovimentacao | null>(null);
  const [movimentacaoOrcamento, setMovimentacaoOrcamento] = useState<Orcamento | null>(null);
  const [movValor, setMovValor] = useState('');
  const [movDestinoId, setMovDestinoId] = useState('');
  const [movJustificativa, setMovJustificativa] = useState('');

  const openMovimentacao = (action: TipoMovimentacao, orcamento: Orcamento) => {
    setMovimentacaoAction(action);
    setMovimentacaoOrcamento(orcamento);
    setMovValor('');
    setMovDestinoId('');
    setMovJustificativa('');
  };

  const closeMovimentacao = () => {
    setMovimentacaoAction(null);
    setMovimentacaoOrcamento(null);
  };

  const handleSaveMovimentacao = () => {
    if (!movimentacaoOrcamento || !movimentacaoAction) return;
    const val = parseFloat(movValor.replace(/[^0-9,.]/g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert("Informe um valor válido.");
      return;
    }
    if (movimentacaoAction === 'Transferencia' && (!movDestinoId || movDestinoId === movimentacaoOrcamento.id)) {
      alert("Selecione um orçamento de destino válido e diferente do de origem.");
      return;
    }
    if (movimentacaoAction === 'Transferencia' || movimentacaoAction === 'Reducao') {
      const saldoDisponivel = getSaldoOrcamento(movimentacaoOrcamento.id);
      if (saldoDisponivel < val) {
        alert("Saldo insuficiente no orçamento de origem.");
        return;
      }
    }
    if (!movJustificativa.trim()) {
      alert("A justificativa é obrigatória.");
      return;
    }

    addMovimentacao({
      data: new Date().toISOString().split('T')[0],
      tipo: movimentacaoAction,
      valor: val,
      orcamentoOrigemId: (movimentacaoAction === 'Transferencia' || movimentacaoAction === 'Reducao') ? movimentacaoOrcamento.id : undefined,
      orcamentoDestinoId: (movimentacaoAction === 'Transferencia' || movimentacaoAction === 'Aporte') ? (movimentacaoAction === 'Transferencia' ? movDestinoId : movimentacaoOrcamento.id) : undefined,
      justificativa: movJustificativa
    });
    
    closeMovimentacao();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingId(orcamento.id);
    setFormularioId(orcamento.formularioId);
    setAno(orcamento.ano);
    setValorGlobal(orcamento.valorGlobal);
    setTetoPorPedido(orcamento.tetoPorPedido);
    setIsFormVisible(true);
  };

  const handleSave = () => {
    if (!formularioId || !ano || valorGlobal === '' || tetoPorPedido === '') return;

    const data = {
      formularioId,
      ano: Number(ano),
      valorGlobal: Number(valorGlobal),
      tetoPorPedido: Number(tetoPorPedido),
    };

    if (editingId) {
      updateOrcamento(editingId, data);
      setEditingId(null);
    } else {
      addOrcamento(data);
    }
    resetForm();
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
    setIsFormVisible(false);
  };

  const handleNew = () => {
    setEditingId(null);
    resetForm();
    setIsFormVisible(true);
  };
  const resetForm = () => {
    setFormularioId('');
    setAno(new Date().getFullYear());
    setValorGlobal('');
    setTetoPorPedido('');
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-8">
      {movimentacaoAction && movimentacaoOrcamento ? (
      <div>
        <h2 className="text-xl font-bold mb-6 text-on-surface flex items-center gap-2">
          <span className={`material-symbols-outlined ${movimentacaoAction === 'Aporte' ? 'text-success' : movimentacaoAction === 'Reducao' ? 'text-warning' : 'text-secondary'}`}>
            {movimentacaoAction === 'Aporte' ? 'add_circle' : movimentacaoAction === 'Reducao' ? 'remove_circle' : 'swap_horiz'}
          </span>
          {movimentacaoAction === 'Aporte' ? 'Novo Aporte' : movimentacaoAction === 'Reducao' ? 'Nova Redução' : 'Nova Transferência'}
        </h2>
        
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-sm mb-6 flex flex-col gap-1">
          <div className="font-semibold text-on-surface">
            Orçamento Selecionado: {formularios.find(f => f.id === movimentacaoOrcamento.formularioId)?.nome} ({movimentacaoOrcamento.ano})
          </div>
          <div className="text-on-surface-variant">
            Saldo Atual: <strong className="text-primary">{formatCurrency(getSaldoOrcamento(movimentacaoOrcamento.id))}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-1">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary font-mono"
              placeholder="0.00"
              value={movValor}
              onChange={(e) => setMovValor(e.target.value)}
            />
          </div>
          
          {movimentacaoAction === 'Transferencia' && (
            <div className="md:col-span-3">
              <label className="block text-[13px] font-semibold text-on-surface mb-1 text-secondary">Orçamento de Destino</label>
              <select
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                value={movDestinoId}
                onChange={(e) => setMovDestinoId(e.target.value)}
              >
                <option value="">Selecione o destino...</option>
                {orcamentos.filter(o => o.id !== movimentacaoOrcamento.id && o.active !== false).map((o) => (
                  <option key={o.id} value={o.id}>
                    {formularios.find(f => f.id === o.formularioId)?.nome} ({o.ano}) - Saldo: {formatCurrency(getSaldoOrcamento(o.id))}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={`${movimentacaoAction === 'Transferencia' ? 'md:col-span-4' : 'md:col-span-3'}`}>
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Justificativa / Motivo *</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              placeholder="Justificativa da movimentação..."
              value={movJustificativa}
              onChange={(e) => setMovJustificativa(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeMovimentacao}
            className="px-6 py-2.5 bg-surface-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-variant/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveMovimentacao}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Confirmar
          </button>
        </div>
      </div>
      ) : isFormVisible ? (
      <div>
        <h2 className="text-xl font-bold mb-4 text-on-surface">
          {editingId ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Ano Referência</label>
            <input
              type="number"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Formulário (Auxílio)</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={formularioId}
              onChange={(e) => setFormularioId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {formularios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Valor Global Destinado (R$)</label>
            <input
              type="number"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={valorGlobal}
              onChange={(e) => setValorGlobal(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Teto Máximo por Pedido (R$)</label>
            <input
              type="number"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={tetoPorPedido}
              onChange={(e) => setTetoPorPedido(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-surface-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-variant/80 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {editingId ? 'Salvar Alterações' : 'Adicionar Orçamento'}
          </button>
        </div>
      </div>
      ) : (
      <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">Lista de Orçamentos</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Orçamento
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-on-surface-variant">
                        <tr>
              <th className="p-4 font-semibold">Ano</th>
              <th className="p-4 font-semibold">Formulário</th>
              <th className="p-4 font-semibold">Valor Global</th>
              <th className="p-4 font-semibold text-primary">Saldo Atual</th>
              <th className="p-4 font-semibold">Teto por Pedido</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
            {linhasApoio.map((linha) => {
              const { valorInicial, saldoAtual, count } = getTotaisLinha(linha.id);
              if (count === 0) return null;
              
              const isExpanded = expandedLinhas[linha.id];
              const list = orcamentosByLinha[linha.id] || [];

              return (
                <React.Fragment key={linha.id}>
                  <tr 
                    className="bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border-b-2 border-outline-variant"
                    onClick={() => toggleLinha(linha.id)}
                  >
                    <td className="p-4" colSpan={2}>
                      <div className="flex items-center gap-3 font-bold text-on-surface">
                        <span className="material-symbols-outlined text-primary">
                          {isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                        {linha.nome}
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs ml-2">
                          {count} {count === 1 ? 'formulário' : 'formulários'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-on-surface-variant">
                      {formatCurrency(valorInicial)}
                    </td>
                    <td className="p-4 font-bold text-primary">
                      {formatCurrency(saldoAtual)}
                    </td>
                    <td className="p-4 text-center text-on-surface-variant font-medium">
                      -
                    </td>
                    <td className="p-4"></td>
                  </tr>

                  {isExpanded && list.map((orcamento) => {
                    const form = formularios.find((f) => f.id === orcamento.formularioId);
                    return (
                      <tr key={orcamento.id} className={`hover:bg-surface-container/30 transition-colors ${orcamento.active === false ? 'opacity-60 bg-surface-container-low' : ''}`}>
                        <td className="p-4 font-bold text-on-surface pl-12">{orcamento.ano}</td>
                        <td className="p-4 text-on-surface font-medium pl-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">subdirectory_arrow_right</span>
                            {form?.nome || 'Formulário Excluído'}
                            {orcamento.active === false && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error uppercase">Inativo</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant font-medium">
                          {formatCurrency(orcamento.valorGlobal)}
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {formatCurrency(getSaldoOrcamento(orcamento.id))}
                        </td>
                        <td className="p-4 text-on-surface-variant font-medium">
                          {formatCurrency(orcamento.tetoPorPedido)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openMovimentacao('Aporte', orcamento)}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                              title="Aporte (Adicionar Saldo)"
                              disabled={orcamento.active === false}
                            >
                              <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            </button>
                            <button
                              onClick={() => openMovimentacao('Reducao', orcamento)}
                              className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                              title="Redução (Retirar Saldo)"
                              disabled={orcamento.active === false}
                            >
                              <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                            </button>
                            <button
                              onClick={() => openMovimentacao('Transferencia', orcamento)}
                              className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                              title="Transferência (Para outro orçamento)"
                              disabled={orcamento.active === false}
                            >
                              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                            </button>
                            <div className="w-px h-6 bg-outline-variant mx-1 self-center"></div>
                            <button
                              onClick={() => handleEdit(orcamento)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {orcamento.active === false ? (
                              <button
                                onClick={() => updateOrcamento(orcamento.id, { active: true })}
                                className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                                title="Restaurar"
                              >
                                <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteOrcamento(orcamento.id)}
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
                </React.Fragment>
              );
            })}
            {orcamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                  Nenhum orçamento cadastrado.
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