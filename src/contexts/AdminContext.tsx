import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LinhaApoio, FormularioApoio, Orcamento, MovimentacaoOrcamentaria } from '../types/admin';
import { PROGRAMAS_APOIO } from '../data/programasApoio';

interface AdminContextData {
  linhasApoio: LinhaApoio[];
  formularios: FormularioApoio[];
  orcamentos: Orcamento[];
  movimentacoes: MovimentacaoOrcamentaria[];
  addLinhaApoio: (linha: Omit<LinhaApoio, 'id'>) => void;
  updateLinhaApoio: (id: string, linha: Partial<LinhaApoio>) => void;
  deleteLinhaApoio: (id: string) => void;
  addFormulario: (form: Omit<FormularioApoio, 'id'>) => void;
  updateFormulario: (id: string, form: Partial<FormularioApoio>) => void;
  deleteFormulario: (id: string) => void;
  addOrcamento: (orcamento: Omit<Orcamento, 'id'>) => void;
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void;
  deleteOrcamento: (id: string) => void;
  addMovimentacao: (mov: Omit<MovimentacaoOrcamentaria, 'id'>) => void;
  getSaldoOrcamento: (orcamentoId: string) => number;
  resetToDefaults: () => void;
}

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [linhasApoio, setLinhasApoio] = useState<LinhaApoio[]>(() => {
    const saved = localStorage.getItem('@Fealq:linhasApoio');
    if (saved) return JSON.parse(saved);
    
    // Extract unique linhas from PROGRAMAS_APOIO
    const linhasMap = new Map();
    PROGRAMAS_APOIO.forEach((p, idx) => {
      if (!linhasMap.has(p.linha)) {
        linhasMap.set(p.linha, { id: `linha-${idx}`, nome: p.linha });
      }
    });
    return Array.from(linhasMap.values());
  });

  const [formularios, setFormularios] = useState<FormularioApoio[]>(() => {
    const saved = localStorage.getItem('@Fealq:formularios');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate array of strings to objects if necessary, and migrate periodos
      return parsed.map((f: any) => ({
        ...f,
        periodosSubmissao: (f.periodosSubmissao || []).map((p: any) => ({
          ...p,
          horaInicio: p.horaInicio || '00:00',
          horaFim: p.horaFim || '23:59',
          status: p.status || 'Fechado'
        })),
        documentosSolicitados: (f.documentosSolicitados || []).map((d: any) => {
          if (typeof d === 'string') {
            return {
              id: Math.random().toString(36).substring(7),
              nome: d,
              info: '',
              url_template: ''
            };
          }
          return d;
        })
      }));
    }
    
    // Extract unique linhas from PROGRAMAS_APOIO to map back to IDs
    const linhasMap = new Map();
    PROGRAMAS_APOIO.forEach((p, idx) => {
      if (!linhasMap.has(p.linha)) {
        linhasMap.set(p.linha, `linha-${idx}`);
      }
    });

    return PROGRAMAS_APOIO.map((p) => {
      return {
        id: p.id,
        nome: p.titulo,
        linhaApoioId: linhasMap.get(p.linha) || '',
        status: 'Aberto',
        periodosSubmissao: [],
        normas: p.normas || '',
        documentosSolicitados: p.documentos.map((doc: any) => ({
          id: doc.id,
          nome: doc.label,
          info: doc.condicao || doc.descricao || '',
          url_template: doc.url_template || ''
        }))
      };
    });
  });

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoOrcamentaria[]>(() => {
    const saved = localStorage.getItem('@Fealq:movimentacoes_v2');
    if (saved) return JSON.parse(saved);
    
    // Generate some fake transactions to populate the dashboard charts (specially "Reducao" and "Transferencia" out)
    return [
      { id: 'mock1', data: '2026-08-01', tipo: 'Aporte', valor: 50000, orcamentoDestinoId: 'orc-0', justificativa: 'Suplementação' },
      { id: 'mock2', data: '2026-08-05', tipo: 'Reducao', valor: 2500, orcamentoOrigemId: 'orc-1', justificativa: 'Ajuste contábil' },
      { id: 'mock3', data: '2026-08-10', tipo: 'Transferencia', valor: 15000, orcamentoOrigemId: 'orc-0', orcamentoDestinoId: 'orc-2', justificativa: 'Remanejamento' },
      { id: 'mock4', data: '2026-08-12', tipo: 'Reducao', valor: 3000, orcamentoOrigemId: 'orc-3', justificativa: 'Estorno de sobra' },
      { id: 'mock5', data: '2026-08-15', tipo: 'Transferencia', valor: 5000, orcamentoOrigemId: 'orc-1', orcamentoDestinoId: 'orc-4', justificativa: 'Reforço de rubrica' },
      { id: 'mock6', data: '2026-08-18', tipo: 'Reducao', valor: 1800, orcamentoOrigemId: 'orc-5', justificativa: 'Contingenciamento' },
      { id: 'mock7', data: '2026-08-20', tipo: 'Transferencia', valor: 12000, orcamentoOrigemId: 'orc-2', orcamentoDestinoId: 'orc-6', justificativa: 'Priorização de projetos' },
      { id: 'mock8', data: '2026-08-25', tipo: 'Reducao', valor: 4500, orcamentoOrigemId: 'orc-6', justificativa: 'Fechamento de mês' },
      { id: 'mock9', data: '2026-08-28', tipo: 'Transferencia', valor: 8000, orcamentoOrigemId: 'orc-7', orcamentoDestinoId: 'orc-1', justificativa: 'Repasse' },
      { id: 'mock10', data: '2026-09-02', tipo: 'Reducao', valor: 6200, orcamentoOrigemId: 'orc-0', justificativa: 'Corte da retoria' },
    ];
  });

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    const saved = localStorage.getItem('@Fealq:orcamentos_v2');
    if (saved) return JSON.parse(saved);
    
    // Auto-generate budgets for ALL existing forms
    return PROGRAMAS_APOIO.map((p, idx) => ({
      id: `orc-${idx}`,
      formularioId: p.id,
      ano: 2026,
      valorGlobal: 100000 + (Math.random() * 200000), // Random between 100k and 300k
      tetoPorPedido: 2000 + (Math.random() * 8000), // Random between 2k and 10k
    }));
  });

  useEffect(() => {
    localStorage.setItem('@Fealq:linhasApoio', JSON.stringify(linhasApoio));
  }, [linhasApoio]);

  useEffect(() => {
    localStorage.setItem('@Fealq:formularios', JSON.stringify(formularios));
  }, [formularios]);

  useEffect(() => {
    localStorage.setItem('@Fealq:orcamentos_v2', JSON.stringify(orcamentos));
  }, [orcamentos]);

  useEffect(() => {
    localStorage.setItem('@Fealq:movimentacoes_v2', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  // Linhas Apoio
  const addLinhaApoio = (linha: Omit<LinhaApoio, 'id'>) => {
    setLinhasApoio((prev) => [...prev, { ...linha, id: Math.random().toString(36).substring(7) }]);
  };
  const updateLinhaApoio = (id: string, updates: Partial<LinhaApoio>) => {
    setLinhasApoio((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };
  const deleteLinhaApoio = (id: string) => {
    setLinhasApoio((prev) => prev.map((l) => l.id === id ? { ...l, active: false } : l));
  };

  // Formulários
  const addFormulario = (form: Omit<FormularioApoio, 'id'>) => {
    setFormularios((prev) => [...prev, { ...form, id: Math.random().toString(36).substring(7) }]);
  };
  const updateFormulario = (id: string, updates: Partial<FormularioApoio>) => {
    setFormularios((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };
  const deleteFormulario = (id: string) => {
    setFormularios((prev) => prev.map((f) => f.id === id ? { ...f, active: false } : f));
    // Cascade soft delete to budgets
    setOrcamentos((prev) => prev.map((o) => o.formularioId === id ? { ...o, active: false } : o));
  };

  // Orçamentos
  const addOrcamento = (orcamento: Omit<Orcamento, 'id'>) => {
    setOrcamentos((prev) => [...prev, { ...orcamento, id: Math.random().toString(36).substring(7) }]);
  };
  const updateOrcamento = (id: string, updates: Partial<Orcamento>) => {
    setOrcamentos((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };
  const deleteOrcamento = (id: string) => {
    setOrcamentos((prev) => prev.map((o) => o.id === id ? { ...o, active: false } : o));
  };

  // Movimentações
  const addMovimentacao = (mov: Omit<MovimentacaoOrcamentaria, 'id'>) => {
    setMovimentacoes((prev) => [...prev, { ...mov, id: Math.random().toString(36).substring(7) }]);
  };

  const getSaldoOrcamento = (orcamentoId: string) => {
    const orc = orcamentos.find((o) => o.id === orcamentoId);
    if (!orc) return 0;
    let saldo = orc.valorGlobal;
    movimentacoes.forEach((m) => {
      if (m.tipo === 'Aporte' && m.orcamentoDestinoId === orcamentoId) saldo += m.valor;
      if (m.tipo === 'Reducao' && m.orcamentoOrigemId === orcamentoId) saldo -= m.valor;
      if (m.tipo === 'Transferencia') {
        if (m.orcamentoOrigemId === orcamentoId) saldo -= m.valor;
        if (m.orcamentoDestinoId === orcamentoId) saldo += m.valor;
      }
    });
    return saldo;
  };

  const resetToDefaults = () => {
    // 1. Derive default Linhas
    const linhasMap = new Map();
    PROGRAMAS_APOIO.forEach((p, idx) => {
      if (!linhasMap.has(p.linha)) {
        linhasMap.set(p.linha, { id: `linha-${idx}`, nome: p.linha });
      }
    });
    const defaultLinhas = Array.from(linhasMap.values());

    // 2. Derive default Formularios
    const defaultForms = PROGRAMAS_APOIO.map((p) => {
      return {
        id: p.id,
        nome: p.titulo,
        linhaApoioId: linhasMap.get(p.linha)?.id || '',
        status: 'Aberto',
        periodosSubmissao: [],
        normas: p.normas || '',
        documentosSolicitados: p.documentos.map((doc: any) => ({
          id: doc.id,
          nome: doc.label,
          info: doc.condicao || doc.descricao || '',
          url_template: doc.url_template || ''
        }))
      };
    });

    // 3. Default Orcamentos
    const defaultOrcamentos = [
      {
        id: 'orc1',
        formularioId: 'bolsa-academica-pos',
        ano: 2026,
        valorGlobal: 100000,
        tetoPorPedido: 5000,
      },
      {
        id: 'orc2',
        formularioId: 'auxilio-viagem',
        ano: 2026,
        valorGlobal: 50000,
        tetoPorPedido: 3000,
      },
    ];

    // 4. Default Movimentacoes
    const defaultMovs = [
      {
        id: 'mock1',
        data: '2026-04-15',
        tipo: 'Aporte',
        valor: 20000,
        orcamentoDestinoId: 'orc1',
        justificativa: 'Suplementação de verba via Reitoria'
      },
      {
        id: 'mock2',
        data: '2026-05-10',
        tipo: 'Transferencia',
        valor: 5000,
        orcamentoOrigemId: 'orc1',
        orcamentoDestinoId: 'orc2',
        justificativa: 'Remanejamento aprovado em ata 04/2026'
      },
      {
        id: 'mock3',
        data: '2026-07-20',
        tipo: 'Reducao',
        valor: 1500,
        orcamentoOrigemId: 'orc2',
        justificativa: 'Corte contingencial de meio de ano'
      }
    ];

    setLinhasApoio(defaultLinhas);
    setFormularios(defaultForms as any);
    setOrcamentos(defaultOrcamentos);
    setMovimentacoes(defaultMovs as any);
    
    // Alerta de sucesso
    alert('Base sincronizada com sucesso!');
  };

  return (
    <AdminContext.Provider
      value={{
        linhasApoio,
        formularios,
        orcamentos,
        movimentacoes,
        addLinhaApoio,
        updateLinhaApoio,
        deleteLinhaApoio,
        addFormulario,
        updateFormulario,
        deleteFormulario,
        addOrcamento,
        updateOrcamento,
        deleteOrcamento,
        addMovimentacao,
        getSaldoOrcamento,
        resetToDefaults,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
