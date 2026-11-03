import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export interface FormularioVinculado {
  formCodigo: string;
  formNome: string;
  urlDestino: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  preenchidoEm?: string;
  dadosVinculados?: Record<string, any>;
}

export interface SessaoRastreabilidade {
  sessionId: string;
  protocolId: string;
  formOrigem: string;
  tituloProjeto?: string;
  responsavelNome?: string;
  responsavelEmail?: string;
  status: 'em_preenchimento' | 'submetido' | 'em_analise';
  formulariosVinculados: Record<string, FormularioVinculado>;
}

interface RastreabilidadeContextData {
  sessionId: string;
  protocolId: string;
  isVinculado: boolean;
  protocoloOrigem: string | null;
  formOrigem: string | null;
  sessaoAtual: SessaoRastreabilidade;
  formulariosVinculados: Record<string, FormularioVinculado>;
  gerarUrlVinculada: (path: string, formCodigo: string, formNome: string) => string;
  registrarAberturaFormulario: (formCodigo: string, formNome: string, urlDestino: string) => void;
  marcarFormularioConcluido: (formCodigo: string, dados?: Record<string, any>) => void;
  statusFormulario: (formCodigo: string) => 'pendente' | 'em_andamento' | 'concluido';
  atualizarDadosSessao: (dados: Partial<SessaoRastreabilidade>) => void;
  gerarNovoProtocolo: (origem?: string) => string;
}

const RastreabilidadeContext = createContext<RastreabilidadeContextData>({} as RastreabilidadeContextData);

const STORAGE_PREFIX = '@Fealq:rastreabilidade:';

export const RastreabilidadeProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Lê parâmetros vindos da URL caso um formulário filho tenha sido aberto a partir de um pai
  const paramProtocolo = searchParams.get('protocolo');
  const paramSessao = searchParams.get('sessao');
  const paramOrigem = searchParams.get('origem');

  const [protocolId, setProtocolId] = useState<string>(() => {
    if (paramProtocolo) return paramProtocolo;
    const salvo = localStorage.getItem(`${STORAGE_PREFIX}active_protocol`);
    if (salvo) return salvo;
    const ano = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const novo = `FEALQ-${ano}-${rand}`;
    localStorage.setItem(`${STORAGE_PREFIX}active_protocol`, novo);
    return novo;
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    if (paramSessao) return paramSessao;
    const salvo = localStorage.getItem(`${STORAGE_PREFIX}active_session`);
    if (salvo) return salvo;
    const novo = 'sess_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem(`${STORAGE_PREFIX}active_session`, novo);
    return novo;
  });

  const [sessao, setSessao] = useState<SessaoRastreabilidade>(() => {
    const key = `${STORAGE_PREFIX}sessao_${protocolId}`;
    const salvo = localStorage.getItem(key);
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch {
        // fallback
      }
    }
    return {
      sessionId,
      protocolId,
      formOrigem: paramOrigem || 'AberturaCursoEvento',
      status: 'em_preenchimento',
      formulariosVinculados: {
        'CONV-PL-01': {
          formCodigo: 'CONV-PL-01',
          formNome: 'Plano de Aplicação de Recursos',
          urlDestino: `/projetos/form-plano-recursos?protocolo=${protocolId}`,
          status: 'pendente',
        },
      },
    };
  });

  // Sincroniza parâmetros de URL quando a rota muda
  useEffect(() => {
    if (paramProtocolo && paramProtocolo !== protocolId) {
      setProtocolId(paramProtocolo);
      localStorage.setItem(`${STORAGE_PREFIX}active_protocol`, paramProtocolo);
    }
    if (paramSessao && paramSessao !== sessionId) {
      setSessionId(paramSessao);
      localStorage.setItem(`${STORAGE_PREFIX}active_session`, paramSessao);
    }
  }, [paramProtocolo, paramSessao, protocolId, sessionId]);

  // Persiste sessão no localStorage e tenta sincronizar com a API se disponível
  useEffect(() => {
    const key = `${STORAGE_PREFIX}sessao_${protocolId}`;
    localStorage.setItem(key, JSON.stringify(sessao));

    // Tentativa não-bloqueante de envio para backend Flask/SQLite
    if (typeof fetch !== 'undefined') {
      fetch('/api/sessions/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: protocolId,
          form_origem: sessao.formOrigem,
          titulo: sessao.tituloProjeto,
          responsavel_nome: sessao.responsavelNome,
          responsavel_email: sessao.responsavelEmail,
        }),
      }).catch(() => {
        // Backend offline ou dev mode sem API ativa: opera em modo client-side local resiliente
      });
    }
  }, [sessao, protocolId, sessionId]);

  const gerarNovoProtocolo = (origem: string = 'AberturaCursoEvento') => {
    const ano = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const novoProtocolo = `FEALQ-${ano}-${rand}`;
    const novaSessaoId = 'sess_' + Math.random().toString(36).substring(2, 12);
    setProtocolId(novoProtocolo);
    setSessionId(novaSessaoId);
    localStorage.setItem(`${STORAGE_PREFIX}active_protocol`, novoProtocolo);
    localStorage.setItem(`${STORAGE_PREFIX}active_session`, novaSessaoId);

    const novaSessao: SessaoRastreabilidade = {
      sessionId: novaSessaoId,
      protocolId: novoProtocolo,
      formOrigem: origem,
      status: 'em_preenchimento',
      formulariosVinculados: {
        'CONV-PL-01': {
          formCodigo: 'CONV-PL-01',
          formNome: 'Plano de Aplicação de Recursos',
          urlDestino: `/projetos/form-plano-recursos?protocolo=${novoProtocolo}`,
          status: 'pendente',
        },
      },
    };
    setSessao(novaSessao);
    return novoProtocolo;
  };

  const gerarUrlVinculada = (path: string, formCodigo: string, formNome: string) => {
    const separator = path.includes('?') ? '&' : '?';
    const url = `${path}${separator}protocolo=${encodeURIComponent(protocolId)}&sessao=${encodeURIComponent(sessionId)}&origem=${encodeURIComponent(sessao.formOrigem)}&form_codigo=${encodeURIComponent(formCodigo)}`;
    return url;
  };

  const registrarAberturaFormulario = (formCodigo: string, formNome: string, urlDestino: string) => {
    setSessao((prev) => {
      const atual = prev.formulariosVinculados[formCodigo];
      const novoStatus = atual?.status === 'concluido' ? 'concluido' : 'em_andamento';
      return {
        ...prev,
        formulariosVinculados: {
          ...prev.formulariosVinculados,
          [formCodigo]: {
            formCodigo,
            formNome,
            urlDestino,
            status: novoStatus,
            preenchidoEm: atual?.preenchidoEm,
            dadosVinculados: atual?.dadosVinculados,
          },
        },
      };
    });

    // Envia evento de rastreabilidade para backend se disponível
    if (typeof fetch !== 'undefined') {
      fetch('/api/sessions/track-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: protocolId,
          form_codigo: formCodigo,
          form_nome: formNome,
          url_origem: location.pathname,
          url_destino: urlDestino,
          status: 'em_andamento',
        }),
      }).catch(() => {});
    }
  };

  const marcarFormularioConcluido = (formCodigo: string, dados?: Record<string, any>) => {
    const agora = new Date().toISOString();
    setSessao((prev) => {
      const atual: FormularioVinculado = prev.formulariosVinculados[formCodigo] || {
        formCodigo,
        formNome: formCodigo,
        urlDestino: '',
        status: 'pendente',
        dadosVinculados: {},
      };
      return {
        ...prev,
        formulariosVinculados: {
          ...prev.formulariosVinculados,
          [formCodigo]: {
            ...atual,
            status: 'concluido',
            preenchidoEm: agora,
            dadosVinculados: { ...(atual.dadosVinculados || {}), ...(dados || {}) },
          },
        },
      };
    });

    if (typeof fetch !== 'undefined') {
      fetch('/api/sessions/track-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: protocolId,
          form_codigo: formCodigo,
          status: 'concluido',
          dados_vinculados: dados || {},
        }),
      }).catch(() => {});
    }
  };

  const statusFormulario = (formCodigo: string): 'pendente' | 'em_andamento' | 'concluido' => {
    return sessao.formulariosVinculados[formCodigo]?.status || 'pendente';
  };

  const atualizarDadosSessao = (dados: Partial<SessaoRastreabilidade>) => {
    setSessao((prev) => ({ ...prev, ...dados }));
  };

  const isVinculado = Boolean(paramProtocolo);

  return (
    <RastreabilidadeContext.Provider
      value={{
        sessionId,
        protocolId,
        isVinculado,
        protocoloOrigem: paramProtocolo,
        formOrigem: paramOrigem,
        sessaoAtual: sessao,
        formulariosVinculados: sessao.formulariosVinculados,
        gerarUrlVinculada,
        registrarAberturaFormulario,
        marcarFormularioConcluido,
        statusFormulario,
        atualizarDadosSessao,
        gerarNovoProtocolo,
      }}
    >
      {children}
    </RastreabilidadeContext.Provider>
  );
};

export const useRastreabilidade = () => useContext(RastreabilidadeContext);
