import { useCallback, useEffect, useRef, useState } from 'react';
import { useProcesso, useProcessoNovo } from '../../contexts/ProcessoContext';
import { safeGetItem } from '../../utils/safeStorage';
import { useLocation, useNavigate } from 'react-router-dom';

export interface EventoFormulario { id: string; acao: string; resultado: string; detalhe: string; criado_em: string; }
export type ExecutarAcao = (acao: string, tarefa: (processoId: string) => void | Promise<void>, opcoes?: { antes?: boolean; depois?: boolean; atualizarRota?: boolean }) => Promise<void>;

export function useAcoesFormulario() {
  const navigate = useNavigate();
  const location = useLocation();
  const processo = useProcesso();
  const novo = useProcessoNovo();
  const id = processo?.processo.id || novo?.processoId;
  const contexto = useRef({ processo, novo, id, rota: location.pathname });
  contexto.current = { processo, novo, id, rota: location.pathname };
  const [eventos, setEventos] = useState<EventoFormulario[]>([]);
  const [erroHistorico, setErroHistorico] = useState('');
  const fila = useRef<Promise<void>>(Promise.resolve());
  const headers = (processoId: string) => ({ 'Content-Type': 'application/json', 'x-processo-token': safeGetItem(`@Fealq:processo:${processoId}`) || '' });
  const atualizarHistorico = useCallback(async () => {
    if (!id) return;
    try {
      const resposta = await fetch(`/api/processos/${id}/eventos`, { credentials: 'same-origin', headers: headers(id) });
      if (!resposta.ok) throw new Error('Não foi possível carregar o histórico.');
      setEventos(await resposta.json());
      setErroHistorico('');
    } catch (erro) { setErroHistorico(erro instanceof Error ? erro.message : 'Falha no histórico.'); }
  }, [id]);
  useEffect(() => { void atualizarHistorico(); }, [atualizarHistorico]);
  const registrar = useCallback(async (processoId: string | null | undefined, acao: string, resultado: string, detalhe = '') => {
    if (!processoId) return;
    try {
      const resposta = await fetch(`/api/processos/${processoId}/eventos`, { method: 'POST', credentials: 'same-origin', headers: headers(processoId), body: JSON.stringify({ acao: acao.slice(0, 120), resultado, detalhe: detalhe.slice(0, 500) }) });
      if (!resposta.ok) throw new Error('Falha ao registrar histórico.');
      const evento = await resposta.json() as EventoFormulario;
      setEventos((atuais) => [evento, ...atuais].slice(0, 100));
    } catch { setErroHistorico('O histórico está indisponível. O resultado da ação foi mantido.'); }
  }, []);
  const salvar = useCallback(async () => {
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const { processo, novo } = contexto.current;
      const antes = JSON.stringify(processo?.dados ?? novo?.dados);
      let salvo: string;
      if (processo) { if (!processo.somenteLeitura) await processo.salvar(); salvo = processo.processo.id; }
      else if (novo) salvo = await novo.salvarSemNavegar();
      else throw new Error('Não foi possível identificar o processo para salvar.');
      const atual = contexto.current;
      if (antes === JSON.stringify(atual.processo?.dados ?? atual.novo?.dados)) return salvo;
    }
    throw new Error('Aguarde o salvamento terminar antes de continuar editando.');
  }, []);
  const executarAcao = useCallback<ExecutarAcao>((acao, tarefa, opcoes = {}) => {
    const proxima = fila.current.catch(() => undefined).then(async () => {
      let processoId = contexto.current.id;
      let inicioRegistrado = false;
      try {
        if (processoId) { await registrar(processoId, acao, 'inicio'); inicioRegistrado = true; }
        if (opcoes.antes !== false) processoId = await salvar();
        if (!inicioRegistrado && processoId) { await registrar(processoId, acao, 'inicio'); inicioRegistrado = true; }
        await tarefa(processoId || '');
        if (opcoes.depois) processoId = await salvar();
        if (!inicioRegistrado) await registrar(processoId, acao, 'inicio');
        await registrar(processoId, acao, 'sucesso');
        const atual = contexto.current;
        const buscaAtual = new URLSearchParams(window.location.search);
        if (opcoes.atualizarRota !== false && fila.current === proxima && atual.novo && !atual.processo && window.location.pathname === atual.rota && buscaAtual.get('processo') === processoId) {
          navigate(`${window.location.pathname}${window.location.search}${window.location.hash}`, { replace: true });
        }
      } catch (erro) {
        processoId ||= contexto.current.id;
        await registrar(processoId, acao, 'falha', erro instanceof Error ? erro.message : 'Falha na ação.');
        throw erro;
      }
    });
    fila.current = proxima;
    return proxima;
  }, [registrar, salvar, navigate]);
  return { executarAcao, eventos, erroHistorico, atualizarHistorico };
}
