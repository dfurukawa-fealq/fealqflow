import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { safeGetItem, safeSetItem, safeJsonParse } from '../utils/safeStorage';
import { sanitizeProtocolId } from '../utils/security';
import { capturarProcessoPai } from '../utils/processoPai';

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
const criarSessaoPadrao = (protocolo: string, sessao: string, origem: string): SessaoRastreabilidade => ({
  sessionId: sessao,
  protocolId: protocolo,
  formOrigem: origem,
  status: 'em_preenchimento',
  formulariosVinculados: {
    'CONV-PL-01': {
      formCodigo: 'CONV-PL-01', formNome: 'Plano de Aplicação de Recursos',
      urlDestino: `/projetos/form-plano-recursos?protocolo=${protocolo}`, status: 'pendente',
    },
  },
});

export const RastreabilidadeProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();

  // Lê parâmetros vindos da URL caso um formulário filho tenha sido aberto a partir de um pai
  const processoUrl = capturarProcessoPai(searchParams, true);
  const rawParamProtocolo = searchParams.get('protocolo')
    || (processoUrl && /^[0-9a-f-]{36}$/i.test(processoUrl) ? `FEALQ-${processoUrl.replaceAll('-', '').slice(0, 20)}` : null);
  const paramProtocolo = rawParamProtocolo ? sanitizeProtocolId(rawParamProtocolo) : null;
  const paramSessao = searchParams.get('sessao') || (processoUrl ? `sess_${processoUrl.replaceAll('-', '')}` : null);
  const paramOrigem = searchParams.get('origem');

  const [protocolId, setProtocolId] = useState<string>(() => {
    if (paramProtocolo) return paramProtocolo;
    const salvo = safeGetItem(`${STORAGE_PREFIX}active_protocol`);
    if (salvo) return sanitizeProtocolId(salvo);
    const ano = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const novo = `FEALQ-${ano}-${rand}`;
    safeSetItem(`${STORAGE_PREFIX}active_protocol`, novo);
    return novo;
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    if (paramSessao) return paramSessao;
    const salvo = safeGetItem(`${STORAGE_PREFIX}active_session`);
    if (salvo) return salvo;
    const novo = 'sess_' + Math.random().toString(36).substring(2, 12);
    safeSetItem(`${STORAGE_PREFIX}active_session`, novo);
    return novo;
  });

  const [sessao, setSessao] = useState<SessaoRastreabilidade>(() => {
    const key = `${STORAGE_PREFIX}sessao_${protocolId}`;
    const salvo = safeGetItem(key);
    const padrao = criarSessaoPadrao(protocolId, sessionId, paramOrigem || 'AberturaCursoEvento');
    return safeJsonParse<SessaoRastreabilidade>(salvo, padrao);
  });

  // Sincroniza parâmetros de URL quando a rota muda
  useEffect(() => {
    if (paramProtocolo && paramProtocolo !== protocolId) {
      setProtocolId(paramProtocolo);
      safeSetItem(`${STORAGE_PREFIX}active_protocol`, paramProtocolo);
      const sessaoVinculada = paramSessao || sessionId;
      setSessao(safeJsonParse<SessaoRastreabilidade>(
        safeGetItem(`${STORAGE_PREFIX}sessao_${paramProtocolo}`),
        criarSessaoPadrao(paramProtocolo, sessaoVinculada, paramOrigem || 'AberturaCursoEvento'),
      ));
    }
    if (paramSessao && paramSessao !== sessionId) {
      setSessionId(paramSessao);
      safeSetItem(`${STORAGE_PREFIX}active_session`, paramSessao);
    }
  }, [paramProtocolo, paramSessao, paramOrigem, protocolId, sessionId]);

  // Mantém a rastreabilidade local dos formulários vinculados.
  useEffect(() => {
    const key = `${STORAGE_PREFIX}sessao_${protocolId}`;
    safeSetItem(key, JSON.stringify(sessao));
  }, [sessao, protocolId]);

  useEffect(() => {
    const chaveSessao = `${STORAGE_PREFIX}sessao_${protocolId}`;
    const sincronizarOutraAba = (evento: StorageEvent) => {
      if (evento.key !== chaveSessao || !evento.newValue) return;
      const sessaoRecebida = safeJsonParse<SessaoRastreabilidade | null>(evento.newValue, null);
      if (!sessaoRecebida || sessaoRecebida.protocolId !== protocolId || sessaoRecebida.sessionId !== sessionId) return;
      setSessao((atual) => JSON.stringify(atual) === evento.newValue ? atual : sessaoRecebida);
    };
    window.addEventListener('storage', sincronizarOutraAba);
    return () => window.removeEventListener('storage', sincronizarOutraAba);
  }, [protocolId, sessionId]);

  const gerarNovoProtocolo = (origem: string = 'AberturaCursoEvento') => {
    const ano = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const novoProtocolo = `FEALQ-${ano}-${rand}`;
    const novaSessaoId = 'sess_' + Math.random().toString(36).substring(2, 12);
    setProtocolId(novoProtocolo);
    setSessionId(novaSessaoId);
    safeSetItem(`${STORAGE_PREFIX}active_protocol`, novoProtocolo);
    safeSetItem(`${STORAGE_PREFIX}active_session`, novaSessaoId);

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
    const processoPai = capturarProcessoPai(searchParams, true);
    const url = `${path}${separator}protocolo=${encodeURIComponent(protocolId)}&sessao=${encodeURIComponent(sessionId)}&origem=${encodeURIComponent(sessao.formOrigem)}&form_codigo=${encodeURIComponent(formCodigo)}${processoPai ? `&processo_pai=${encodeURIComponent(processoPai)}` : ''}`;
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
      const atualizada: SessaoRastreabilidade = {
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
      safeSetItem(`${STORAGE_PREFIX}sessao_${protocolId}`, JSON.stringify(atualizada));
      return atualizada;
    });
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
