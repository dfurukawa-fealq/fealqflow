import React, { useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { TipoMovimentacao } from '../../../types/admin';

export const MovimentacoesOrcamentarias = () => {
  const { orcamentos, formularios, linhasApoio, movimentacoes, addMovimentacao, getSaldoOrcamento } = useAdmin();

  const [tipo, setTipo] = useState<TipoMovimentacao>('Transferencia');
  const [dataStr, setDataStr] = useState(new Date().toISOString().split('T')[0]);
  const [valor, setValor] = useState('');
  const [origemId, setOrigemId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [justificativa, setJustificativa] = useState('');
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


  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return dateString;
  };

  const handleCancel = () => {
    setTipo('Transferencia');
    setDataStr(new Date().toISOString().split('T')[0]);
    setValor('');
    setOrigemId('');
    setDestinoId('');
    setJustificativa('');
    setIsFormVisible(false);
  };

  const getOrcamentoNome = (orcamentoId: string) => {
    const o = orcamentos.find(o => o.id === orcamentoId);
    if (!o) return 'N/A';
    const form = formularios.find(f => f.id === o.formularioId);
    const linha = linhasApoio.find(l => l.id === form?.linhaApoioId);
    return `${form?.nome || 'N/A'} - ${linha?.nome || 'N/A'} (${o.ano})`;
  };

  const handleSave = () => {
    const val = parseFloat(valor.replace(/[^0-9,.]/g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (tipo === 'Transferencia' && (!origemId || !destinoId || origemId === destinoId)) {
      alert("Selecione orçamentos de origem e destino distintos.");
      return;
    }
    if (tipo === 'Aporte' && !destinoId) {
      alert("Selecione o orçamento de destino.");
      return;
    }
    if (tipo === 'Reducao' && !origemId) {
      alert("Selecione o orçamento de origem.");
      return;
    }

    if (tipo === 'Transferencia' || tipo === 'Reducao') {
      const saldoDisponivel = getSaldoOrcamento(origemId);
      if (saldoDisponivel < val) {
        alert("Saldo insuficiente no orçamento de origem.");
        return;
      }
    }

    if (!justificativa.trim()) {
      alert("A justificativa é obrigatória para o histórico de transparência.");
      return;
    }

    addMovimentacao({
      data: dataStr,
      tipo,
      valor: val,
      orcamentoOrigemId: (tipo === 'Transferencia' || tipo === 'Reducao') ? origemId : undefined,
      orcamentoDestinoId: (tipo === 'Transferencia' || tipo === 'Aporte') ? destinoId : undefined,
      justificativa
    });

    setValor('');
    setJustificativa('');
  };

  return (
    <div className="flex flex-col gap-8">
      {!isFormVisible ? (
      <>
      {/* 1. Visão Geral de Saldos */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          Saldos Orçamentários
        </h2>
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-variant text-on-surface-variant">
              <tr>
                <th className="p-4 font-semibold">Formulário / Linha</th>
                <th className="p-4 font-semibold text-right">Ano</th>
                <th className="p-4 font-semibold text-right">Valor Inicial</th>
                <th className="p-4 font-semibold text-right">Saldo Atual</th>
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
                      <td className="p-4 font-bold text-on-surface-variant text-right">
                        {formatCurrency(valorInicial)}
                      </td>
                      <td className="p-4 font-bold text-primary text-right">
                        {formatCurrency(saldoAtual)}
                      </td>
                    </tr>

                    {isExpanded && list.map((orcamento) => {
                      const form = formularios.find((f) => f.id === orcamento.formularioId);
                      return (
                        <tr key={orcamento.id} className={`hover:bg-surface-container/30 transition-colors ${orcamento.active === false ? 'opacity-60 bg-surface-container-low' : ''}`}>
                          <td className="p-4 text-on-surface font-medium pl-14">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">subdirectory_arrow_right</span>
                              {form?.nome || 'Formulário Excluído'}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-on-surface-variant text-right">{orcamento.ano}</td>
                          <td className="p-4 text-on-surface-variant text-right font-medium">
                            {formatCurrency(orcamento.valorGlobal)}
                          </td>
                          <td className="p-4 font-bold text-primary text-right">
                            {formatCurrency(getSaldoOrcamento(orcamento.id))}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {orcamentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    Nenhum orçamento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Histórico de Transparência */}

      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Histórico de Movimentações
        </h2>
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-variant text-on-surface-variant">
              <tr>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Tipo</th>
                <th className="p-4 font-semibold">Origem → Destino</th>
                <th className="p-4 font-semibold">Justificativa</th>
                <th className="p-4 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
              {[...movimentacoes].reverse().map((m) => (
                <tr key={m.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4 text-on-surface-variant whitespace-nowrap">{formatDate(m.data)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${
                      m.tipo === 'Transferencia' ? 'bg-secondary/10 text-secondary' :
                      m.tipo === 'Aporte' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant text-xs">
                    {(m.tipo === 'Transferencia' || m.tipo === 'Reducao') && (
                      <div className="text-error mb-1">
                        <span className="font-semibold">SAÍDA:</span> {getOrcamentoNome(m.orcamentoOrigemId!)}
                      </div>
                    )}
                    {(m.tipo === 'Transferencia' || m.tipo === 'Aporte') && (
                      <div className="text-primary">
                        <span className="font-semibold">ENTRADA:</span> {getOrcamentoNome(m.orcamentoDestinoId!)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-on-surface italic max-w-[200px] truncate" title={m.justificativa}>
                    "{m.justificativa}"
                  </td>
                  <td className="p-4 font-mono font-semibold text-right">
                    {formatCurrency(m.valor)}
                  </td>
                </tr>
              ))}
              {movimentacoes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    Nenhuma movimentação registrada no histórico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      </>
      ) : (
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
        {/* 2. Nova Movimentação */}
        
      <div>
        <h2 className="text-xl font-bold mb-4 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">swap_horiz</span>
          Nova Movimentação Orçamentária
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Tipo de Movimentação</label>
            <select
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimentacao)}
            >
              <option value="Transferencia">Transferência (Entre Contas)</option>
              <option value="Aporte">Aporte (Adição de Recursos)</option>
              <option value="Reducao">Redução (Retirada de Recursos)</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Data</label>
            <input
              type="date"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-on-surface mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary font-mono text-lg"
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {(tipo === 'Transferencia' || tipo === 'Reducao') && (
            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-1 text-error">Origem dos Recursos (De onde sai)</label>
              <select
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                value={origemId}
                onChange={(e) => setOrigemId(e.target.value)}
              >
                <option value="">Selecione o orçamento de origem...</option>
                {orcamentos.map((o) => (
                  <option key={o.id} value={o.id}>
                    {getOrcamentoNome(o.id)} - Saldo: {formatCurrency(getSaldoOrcamento(o.id))}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(tipo === 'Transferencia' || tipo === 'Aporte') && (
            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-1 text-primary">Destino dos Recursos (Para onde vai)</label>
              <select
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
              >
                <option value="">Selecione o orçamento de destino...</option>
                {orcamentos.map((o) => (
                  <option key={o.id} value={o.id}>
                    {getOrcamentoNome(o.id)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-on-surface mb-1">Justificativa / Motivo da Movimentação *</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-primary"
            placeholder="Ex: Remanejamento de verba aprovado em ata 05/2026..."
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
          />
        </div>

        
      </div>

      
        
        <div className="flex justify-end gap-3 -mt-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-surface-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-variant/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Registrar Movimentação
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
