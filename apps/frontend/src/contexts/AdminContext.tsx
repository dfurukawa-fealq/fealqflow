import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LinhaApoio, FormularioApoio, DocumentoCadastro, Orcamento, MovimentacaoOrcamentaria } from '../types/admin';
import { PROGRAMAS_APOIO } from '../data/programasApoio';
import { safeGetItem, safeSetItem, safeJsonParse } from '../utils/safeStorage';

interface AdminContextData {
  linhasApoio: LinhaApoio[];
  formularios: FormularioApoio[];
  formulariosCarregando: boolean;
  erroCarregarFormularios: string;
  recarregarFormularios: () => Promise<void>;
  documentos: DocumentoCadastro[];
  orcamentos: Orcamento[];
  movimentacoes: MovimentacaoOrcamentaria[];
  addLinhaApoio: (linha: Omit<LinhaApoio, 'id'>) => void;
  updateLinhaApoio: (id: string, linha: Partial<LinhaApoio>) => void;
  deleteLinhaApoio: (id: string) => void;
  addFormulario: (form: Omit<FormularioApoio, 'id'> & { id?: string }) => Promise<void>;
  updateFormulario: (id: string, form: Partial<FormularioApoio>) => Promise<void>;
  persistirFormulario: (id: string, form: Partial<FormularioApoio>) => Promise<void>;
  deleteFormulario: (id: string) => Promise<void>;
  addDocumento: (documento: Omit<DocumentoCadastro, 'id'> & { id?: string }) => Promise<void>;
  updateDocumento: (id: string, documento: Partial<DocumentoCadastro>) => Promise<void>;
  deleteDocumento: (id: string) => Promise<void>;
  addOrcamento: (orcamento: Omit<Orcamento, 'id'>) => void;
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void;
  deleteOrcamento: (id: string) => void;
  addMovimentacao: (mov: Omit<MovimentacaoOrcamentaria, 'id'>) => void;
  getSaldoOrcamento: (orcamentoId: string) => number;
  resetToDefaults: () => Promise<void>;
}

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [linhasApoio, setLinhasApoio] = useState<LinhaApoio[]>(() => {
    const saved = safeGetItem('@Fealq:linhasApoio');
    if (saved) return safeJsonParse(saved, []);
    
    // Extract unique linhas from PROGRAMAS_APOIO
    const linhasMap = new Map();
    PROGRAMAS_APOIO.forEach((p, idx) => {
      if (!linhasMap.has(p.linha)) {
        linhasMap.set(p.linha, { id: `linha-${idx}`, nome: p.linha });
      }
    });
    return Array.from(linhasMap.values());
  });

  const [formularios, setFormularios] = useState<FormularioApoio[]>([]);
  const [formulariosCarregando, setFormulariosCarregando] = useState(true);
  const [erroCarregarFormularios, setErroCarregarFormularios] = useState('');

  const documentos: DocumentoCadastro[] = formularios
    .filter((formulario) => formulario.tipo === 'documento')
    .map((formulario) => ({
      id: formulario.id,
      nome: formulario.nome,
      descricao: formulario.itensKitDocumental[0]?.info || '',
      template_url: formulario.itensKitDocumental[0]?.url_template || '',
      active: formulario.active !== false,
      area: formulario.area,
    }));

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoOrcamentaria[]>(() => {
    const saved = safeGetItem('@Fealq:movimentacoes_v2');
    const defaultMovimentacoes: MovimentacaoOrcamentaria[] = [
      { id: 'mock1', data: '2026-08-01', tipo: 'Aporte', valor: 50000, orcamentoDestinoId: 'orc-0', justificativa: 'SuplementaÃ§Ã£o' },
      { id: 'mock2', data: '2026-08-05', tipo: 'Reducao', valor: 2500, orcamentoOrigemId: 'orc-1', justificativa: 'Ajuste contÃ¡bil' },
      { id: 'mock3', data: '2026-08-10', tipo: 'Transferencia', valor: 15000, orcamentoOrigemId: 'orc-0', orcamentoDestinoId: 'orc-2', justificativa: 'Remanejamento' },
      { id: 'mock4', data: '2026-08-12', tipo: 'Reducao', valor: 3000, orcamentoOrigemId: 'orc-3', justificativa: 'Estorno de sobra' },
      { id: 'mock5', data: '2026-08-15', tipo: 'Transferencia', valor: 5000, orcamentoOrigemId: 'orc-1', orcamentoDestinoId: 'orc-4', justificativa: 'ReforÃ§o de rubrica' },
      { id: 'mock6', data: '2026-08-18', tipo: 'Reducao', valor: 1800, orcamentoOrigemId: 'orc-5', justificativa: 'Contingenciamento' },
      { id: 'mock7', data: '2026-08-20', tipo: 'Transferencia', valor: 12000, orcamentoOrigemId: 'orc-2', orcamentoDestinoId: 'orc-6', justificativa: 'PriorizaÃ§Ã£o de projetos' },
      { id: 'mock8', data: '2026-08-25', tipo: 'Reducao', valor: 4500, orcamentoOrigemId: 'orc-6', justificativa: 'Fechamento de mÃªs' },
      { id: 'mock9', data: '2026-08-28', tipo: 'Transferencia', valor: 8000, orcamentoOrigemId: 'orc-7', orcamentoDestinoId: 'orc-1', justificativa: 'Repasse' },
      { id: 'mock10', data: '2026-09-02', tipo: 'Reducao', valor: 6200, orcamentoOrigemId: 'orc-0', justificativa: 'Corte da retoria' },
    ];
    return safeJsonParse(saved, defaultMovimentacoes);
  });

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    const saved = safeGetItem('@Fealq:orcamentos_v2');
    const defaultOrcamentos: Orcamento[] = PROGRAMAS_APOIO.map((p, idx) => ({
      id: `orc-${idx}`,
      formularioId: p.id,
      ano: 2026,
      valorGlobal: 100000 + (Math.random() * 200000),
      tetoPorPedido: 2000 + (Math.random() * 8000),
    }));
    return safeJsonParse(saved, defaultOrcamentos);
  });

  const recarregarFormularios = async () => {
    setFormulariosCarregando(true);
    setErroCarregarFormularios('');
    try {
      const response = await fetch('/api/formularios');
      if (!response.ok) {
        const resposta = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(resposta.error || `Falha ao carregar formul\u00e1rios do banco (${response.status}).`);
      }
      const registros = await response.json() as FormularioApoio[];
      setFormularios(registros);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'N\u00e3o foi poss\u00edvel carregar os formul\u00e1rios do banco.';
      setErroCarregarFormularios(mensagem);
      throw erro;
    } finally {
      setFormulariosCarregando(false);
    }
  };

  useEffect(() => {
    void recarregarFormularios().catch(() => undefined);
  }, []);

  useEffect(() => {
    safeSetItem('@Fealq:linhasApoio', JSON.stringify(linhasApoio));
  }, [linhasApoio]);



  useEffect(() => {
    safeSetItem('@Fealq:orcamentos_v2', JSON.stringify(orcamentos));
  }, [orcamentos]);

  useEffect(() => {
    safeSetItem('@Fealq:movimentacoes_v2', JSON.stringify(movimentacoes));
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
  const addFormulario = async (form: Omit<FormularioApoio, 'id'> & { id?: string }) => {
    const novo = { ...form, id: form.id || Math.random().toString(36).substring(7) };
    const response = await fetch('/api/formularios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo),
    });
    if (!response.ok) {
      const resposta = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(resposta.error || `Falha ao criar cadastro no banco (${response.status}).`);
    }
    const salvo = await response.json() as FormularioApoio;
    setFormularios((atuais) => [...atuais.filter((item) => item.id !== salvo.id), salvo]);
  };

  const persistirFormulario = async (id: string, updates: Partial<FormularioApoio>) => {
    const atual = formularios.find((formulario) => formulario.id === id);
    if (!atual) throw new Error('Cadastro n?o encontrado no banco. Recarregue a lista e tente novamente.');
    const atualizacaoParcial = Object.keys(updates).every((chave) => ['active', 'habilitado', 'nSeq'].includes(chave));
    const response = await fetch(`/api/formularios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(atualizacaoParcial ? updates : { ...atual, ...updates }),
    });
    if (!response.ok) {
      const resposta = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(resposta.error || `Falha ao atualizar cadastro no banco (${response.status}).`);
    }
    const salvo = await response.json() as FormularioApoio;
    setFormularios((atuais) => atuais.map((formulario) => formulario.id === id ? salvo : formulario));
  };

  const updateFormulario = async (id: string, updates: Partial<FormularioApoio>) => {
    await persistirFormulario(id, updates);
  };

  const deleteFormulario = async (id: string) => {
    const response = await fetch(`/api/formularios/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) {
      const resposta = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(resposta.error || `Falha ao arquivar cadastro no banco (${response.status}).`);
    }
    setFormularios((atuais) => atuais.map((formulario) => formulario.id === id ? { ...formulario, active: false } : formulario));
    setOrcamentos((atuais) => atuais.map((orcamento) => orcamento.formularioId === id ? { ...orcamento, active: false } : orcamento));
  };

  const addDocumento = async (documento: Omit<DocumentoCadastro, 'id'> & { id?: string }) => {
    const id = documento.id || Math.random().toString(36).substring(7);
    const novoFormulario: FormularioApoio = {
      id, nome: documento.nome, area: 'Projetos', tipo: 'documento', linhaApoioId: '',
      status: 'Fechado', periodosSubmissao: [], normas: '',
      itensKitDocumental: [{ id, nome: documento.nome, info: documento.descricao, url_template: documento.template_url }],
      active: documento.active !== false,
    };
    const response = await fetch('/api/formularios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoFormulario) });
    if (!response.ok) {
      const resposta = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(resposta.error || `Falha ao salvar documento no banco de dados (${response.status}).`);
    }
    const salvo = await response.json() as FormularioApoio;
    setFormularios((prev) => prev.some((item) => item.id === salvo.id) ? prev.map((item) => item.id === salvo.id ? salvo : item) : [...prev, salvo]);
  };
  const updateDocumento = async (id: string, updates: Partial<DocumentoCadastro>) => {
    const documentoAtual = documentos.find((documento) => documento.id === id);
    const formularioAtual = formularios.find((formulario) => formulario.id === id && formulario.tipo === 'documento');
    if (!documentoAtual || !formularioAtual) throw new Error('Documento não encontrado no cadastro atual. Atualize a lista e tente novamente.');
    const nome = updates.nome || documentoAtual.nome;
    const atualizado: FormularioApoio = {
      ...formularioAtual, nome,
      itensKitDocumental: [{ id, nome, info: updates.descricao ?? documentoAtual.descricao, url_template: updates.template_url ?? documentoAtual.template_url }],
    };
    const response = await fetch(`/api/formularios/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(atualizado) });
    if (!response.ok) {
      const resposta = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(resposta.error || `Falha ao atualizar documento no banco de dados (${response.status}).`);
    }
    const salvo = await response.json() as FormularioApoio;
    setFormularios((prev) => prev.map((formulario) => formulario.id === id ? salvo : formulario));
  };
  const deleteDocumento = async (id: string) => {
    const response = await fetch(`/api/formularios/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Falha ao arquivar documento no banco de dados (${response.status}).`);
    setFormularios((prev) => prev.map((formulario) => formulario.id === id ? { ...formulario, active: false } : formulario));
  };
  // OrÃ§amentos
  const addOrcamento = (orcamento: Omit<Orcamento, 'id'>) => {
    setOrcamentos((prev) => [...prev, { ...orcamento, id: Math.random().toString(36).substring(7) }]);
  };
  const updateOrcamento = (id: string, updates: Partial<Orcamento>) => {
    setOrcamentos((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };
  const deleteOrcamento = (id: string) => {
    setOrcamentos((prev) => prev.map((o) => o.id === id ? { ...o, active: false } : o));
  };

  // MovimentaÃ§Ãµes
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

  const resetToDefaults = async () => {
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
        area: 'Programa de Apoio' as const,
        tipo: 'formulario' as const,
        linhaApoioId: linhasMap.get(p.linha)?.id || '',
        status: 'Aberto',
        periodosSubmissao: [],
        normas: p.normas || '',
        itensKitDocumental: p.documentos.map((doc) => ({
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
        justificativa: 'SuplementaÃ§Ã£o de verba via Reitoria'
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

    const respostas = await Promise.all(defaultForms.map((formulario) => {
      const existe = formularios.some((atual) => atual.id === formulario.id);
      return fetch(existe ? `/api/formularios/${encodeURIComponent(formulario.id)}` : '/api/formularios', {
        method: existe ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });
    }));
    const respostaComErro = respostas.find((resposta) => !resposta.ok);
    if (respostaComErro) {
      const detalhe = await respostaComErro.json().catch(() => ({})) as { error?: string };
      throw new Error(detalhe.error || `Falha ao sincronizar base oficial com o banco (${respostaComErro.status}).`);
    }
    await recarregarFormularios();
    setLinhasApoio(defaultLinhas);
    setOrcamentos(defaultOrcamentos);
    setMovimentacoes(defaultMovs as any);
  };

  return (
    <AdminContext.Provider
      value={{
        linhasApoio,
        formularios,
        formulariosCarregando,
        erroCarregarFormularios,
        recarregarFormularios,
        documentos,
        orcamentos,
        movimentacoes,
        addLinhaApoio,
        updateLinhaApoio,
        deleteLinhaApoio,
        addFormulario,
        updateFormulario,
        persistirFormulario,
        deleteFormulario,
        addDocumento,
        updateDocumento,
        deleteDocumento,
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
