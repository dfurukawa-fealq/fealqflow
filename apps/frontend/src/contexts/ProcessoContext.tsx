import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { safeGetItem, safeJsonParse, safeRemoveItem, safeSetItem } from '../utils/safeStorage';
import { useUser } from './UserContext';

interface DadosProcesso {
  campos: Record<string, unknown>;
}

interface Processo {
  id: string;
  protocolo: string;
  categoria: 'projeto' | 'apoio';
  formulario_id: string;
  formulario_nome: string;
  formulario_rota: string;
  status: string;
  dados_json: DadosProcesso;
  versao: number;
  documentos?: DocumentoProcesso[];
}

interface DocumentoProcesso {
  id: string;
  arquivo_nome: string | null;
  status: string;
}

interface ContextoProcesso {
  processo: Processo;
  dados: DadosProcesso;
  erro: string;
  salvando: boolean;
  documentos: DocumentoProcesso[];
  atualizarCampo: (campo: string, valor: unknown) => void;
  salvar: () => Promise<void>;
  save_state: () => Promise<void>;
  enviar: () => Promise<void>;
  novaTentativa: () => Promise<void>;
  anexarDocumento: (codigo: string, arquivo: File) => Promise<void>;
  removerDocumento: (codigo: string) => Promise<void>;
  baixarDocumento: (codigo: string, nome: string) => Promise<void>;
  registrarDocumentos: (itens: Array<{ id: string; obrigatorio: boolean; concluido: boolean }>) => Promise<void>;
}

const ProcessoContext = createContext<ContextoProcesso | null>(null);
const requisicoesCriacao = new Map<string, Promise<Processo & { token: string }>>();
const gerarBytes = (tamanho: number) => crypto.getRandomValues(new Uint8Array(tamanho));
const gerarUuid = () => {
  const bytes = gerarBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((valor) => valor.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const gerarToken = () => btoa(String.fromCharCode(...gerarBytes(32))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const nomesFormularios: Record<string, string> = {
  'form-coordenador': 'Cadastro de Coordenador',
  'form-curso': 'Abertura de Curso/Evento', 'form-evento': 'Abertura de Curso/Evento',
  'form-curso-evento': 'Abertura de Curso/Evento',
  'form-publicacao': 'Abertura de Publicação', 'form-pesquisa': 'Abertura de Projeto de Pesquisa',
  'form-pesquisa-v2': 'Processo de Abertura de Projeto de Pesquisa', 'form-trabalho': 'Plano de Trabalho',
  'form-patrocinador': 'Cadastro de Patrocinador', 'form-parceiro': 'Cadastro de Parceiro',
  'form-cotas': 'Cotas de Patrocínio', 'form-financiadora': 'Cadastro de Financiadora',
  'form-plano-recursos': 'Plano de Aplicação de Recursos', 'form-programa-epe': 'Abertura de Programa EPE',
  'form-central': 'Abertura de Central Multiusuário',
  'apoio-bolsa-pos': 'Bolsa Pós-Graduação', 'apoio-bolsa-grad': 'Bolsa Graduação',
  'apoio-infra': 'Apoio à Infraestrutura', 'apoio-evento-trabalho': 'Apresentação em Evento',
  'apoio-viagem': 'Auxílio Viagem', 'apoio-publicacao': 'Auxílio Publicação',
  'apoio-comunidade': 'Interesse da Comunidade', 'apoio-material-evento': 'Material para Eventos',
  'apoio-cultura': 'Cultura e Extensão',
};
export const CHAVE_PROCESSOS_LOCAIS = '@Fealq:processos_locais';
export interface ProcessoLocal { id: string; rota: string; categoria: 'projeto' | 'apoio'; }
const registrarProcessoLocal = (processo: Processo & { token: string }) => {
  safeSetItem(`@Fealq:processo:${processo.id}`, processo.token);
  const atuais = safeJsonParse<ProcessoLocal[]>(safeGetItem(CHAVE_PROCESSOS_LOCAIS), []);
  const proximos = [{ id: processo.id, rota: processo.formulario_rota, categoria: processo.categoria }, ...atuais.filter((item) => item.id !== processo.id)];
  safeSetItem(CHAVE_PROCESSOS_LOCAIS, JSON.stringify(proximos));
};

const mensagemErro = async (resposta: Response) => {
  const corpo: unknown = await resposta.json().catch(() => null);
  return corpo && typeof corpo === 'object' && 'error' in corpo && typeof corpo.error === 'string'
    ? corpo.error : `Falha na comunicação com o servidor (${resposta.status}).`;
};

const criarProcesso = async (rota: string, chaveCriacao: string, token: string): Promise<Processo & { token: string }> => {
  const categoria = rota.startsWith('/projetos/') ? 'projeto' : 'apoio';
  const resposta = await fetch('/api/processos', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoria,
      formularioId: rota.split('/').pop(),
      formularioNome: nomesFormularios[rota.split('/').pop() || ''] || 'Formulário',
      formularioRota: rota,
      chaveCriacao, token,
    }),
  });
  if (!resposta.ok) throw new Error(await mensagemErro(resposta));
  return resposta.json() as Promise<Processo & { token: string }>;
};

export const ProcessoRoute = ({ children }: { children: ReactNode }) => {
  const { podeAcessar, carregando: carregandoSessao } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const parametros = new URLSearchParams(location.search);
  const id = parametros.get('processo');
  const inicio = parametros.get('inicio');
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [token, setToken] = useState('');

  useEffect(() => {
    let ativo = true;
    setProcesso(null);
    setErro('');
    if (!id) {
      if (!inicio) {
        const chave = gerarUuid();
        safeSetItem(`@Fealq:inicio:${chave}`, gerarToken());
        const busca = new URLSearchParams(location.search);
        busca.set('inicio', chave);
        navigate(`${location.pathname}?${busca.toString()}`, { replace: true });
        return () => { ativo = false; };
      }
      if (!/^[0-9a-f-]{36}$/i.test(inicio)) {
        setErro('Identificador de início inválido. Abra o formulário novamente pela lista.');
        return () => { ativo = false; };
      }
      let tokenCriacao = safeGetItem(`@Fealq:inicio:${inicio}`);
      if (!tokenCriacao) {
        tokenCriacao = gerarToken();
        safeSetItem(`@Fealq:inicio:${inicio}`, tokenCriacao);
      }
      let requisicao = requisicoesCriacao.get(inicio);
      if (!requisicao) {
        requisicao = criarProcesso(location.pathname, inicio, tokenCriacao);
        requisicoesCriacao.set(inicio, requisicao);
        void requisicao.finally(() => requisicoesCriacao.delete(inicio)).catch(() => undefined);
      }
      requisicao.then((novo) => {
        if (!ativo) return;
        registrarProcessoLocal(novo);
        safeRemoveItem(`@Fealq:inicio:${inicio}`);
        const busca = new URLSearchParams(location.search);
        busca.delete('inicio');
        busca.set('processo', novo.id);
        navigate(`${location.pathname}?${busca.toString()}`, { replace: true });
      }).catch((falha: unknown) => { if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível iniciar o processo.'); });
    } else {
      const chaveToken = safeGetItem(`@Fealq:processo:${id}`) || '';
      setToken(chaveToken);
      fetch(`/api/processos/${encodeURIComponent(id)}`, {
        credentials: 'same-origin', headers: chaveToken ? { 'x-processo-token': chaveToken } : {},
      }).then(async (resposta) => {
        if (!resposta.ok) throw new Error(await mensagemErro(resposta));
        return resposta.json() as Promise<Processo>;
      }).then((carregado) => {
        if (!ativo) return;
        if (carregado.formulario_rota !== location.pathname) {
          setErro('Este processo pertence a outro formulário.');
          return;
        }
        setProcesso(carregado);
      }).catch((falha: unknown) => { if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível abrir o processo.'); });
    }
    return () => { ativo = false; };
  }, [id, inicio, location.key, location.pathname, location.search, navigate, tentativa]);

  const novaTentativa = useCallback(async () => {
    const chave = gerarUuid();
    safeSetItem(`@Fealq:inicio:${chave}`, gerarToken());
    const busca = new URLSearchParams(location.search);
    busca.delete('processo');
    if (!busca.has('processo_pai')) {
      for (const chave of ['protocolo', 'sessao', 'origem', 'form_codigo']) busca.delete(chave);
    }
    busca.set('inicio', chave);
    navigate(`${location.pathname}?${busca.toString()}`);
  }, [location.pathname, location.search, navigate]);

  const area = location.pathname.startsWith('/projetos/') ? 'projeto' : 'apoio';
  if (carregandoSessao) return <div className="p-lg text-on-surface" role="status">Verificando acesso...</div>;
  if (!podeAcessar(area)) return <Navigate to={area === 'projeto' ? '/programas-de-apoio' : '/projetos'} replace />;
  if (erro) return (
    <main className="mx-auto flex w-full max-w-[600px] flex-col gap-md p-lg" role="alert">
      <h1 className="text-xl font-bold text-primary">Não foi possível abrir o formulário</h1>
      <p className="text-error">{erro}</p>
      <div className="flex flex-wrap gap-sm">
        <button type="button" className="rounded bg-primary px-md py-sm text-white" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button>
        <button type="button" className="rounded border border-outline-variant px-md py-sm text-primary" onClick={() => void novaTentativa()}>Iniciar nova tentativa</button>
      </div>
    </main>
  );
  if (!processo || !id) return <div className="p-lg text-on-surface" role="status">Preparando processo...</div>;
  if (!['rascunho', 'em_preenchimento'].includes(processo.status)) return (
    <main className="mx-auto flex w-full max-w-[600px] flex-col gap-md p-lg">
      <h1 className="text-xl font-bold text-primary">Processo enviado</h1>
      <p>O processo {processo.protocolo} foi registrado. Para preencher novamente, inicie outra tentativa.</p>
      <button type="button" className="self-start rounded bg-primary px-md py-sm text-white" onClick={() => void novaTentativa().catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível iniciar outra tentativa.'))}>Iniciar nova tentativa</button>
    </main>
  );
  return <ProcessoProvider key={processo.id} processoInicial={processo} token={token} novaTentativa={novaTentativa}>{children}</ProcessoProvider>;
};

const ProcessoProvider = ({ children, processoInicial, token, novaTentativa }: {
  children: ReactNode; processoInicial: Processo; token: string; novaTentativa: () => Promise<void>;
}) => {
  const chaveBackup = `@Fealq:rascunho:${processoInicial.id}`;
  const dadosServidor = processoInicial.dados_json?.campos ? processoInicial.dados_json : { campos: {} };
  const [dados, setDados] = useState<DadosProcesso>(() => {
    const backup = safeJsonParse<{ versao: number; dados: DadosProcesso } | null>(safeGetItem(chaveBackup), null);
    return backup?.versao === processoInicial.versao && backup.dados?.campos ? backup.dados : dadosServidor;
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoProcesso[]>(processoInicial.documentos || []);
  const dadosRef = useRef(dados);
  const versaoRef = useRef(processoInicial.versao);
  const ultimoSalvoRef = useRef(JSON.stringify(dadosServidor));
  const filaRef = useRef<Promise<void>>(Promise.resolve());

  const atualizarCampo = useCallback((campo: string, valor: unknown) => {
    setDados((atual) => {
      if (JSON.stringify(atual.campos[campo]) === JSON.stringify(valor)) return atual;
      const proximo = { campos: { ...atual.campos, [campo]: valor } };
      dadosRef.current = proximo;
      return proximo;
    });
  }, []);

  const salvar = useCallback((): Promise<void> => {
    const proxima = filaRef.current.then(async () => {
      const instantaneo = JSON.stringify(dadosRef.current);
      if (instantaneo === ultimoSalvoRef.current) return;
      setSalvando(true);
      try {
        const campos = dadosRef.current.campos;
        const lerCampo = (...nomes: string[]) => {
          for (const nome of nomes) {
            const chave = Object.keys(campos).find((item) => item === nome || item.startsWith(`campo:${nome}:`));
            const valor = chave ? campos[chave] : undefined;
            if (typeof valor === 'string' && valor.trim()) return valor.trim();
          }
          return '';
        };
        const resposta = await fetch(`/api/processos/${processoInicial.id}`, {
          method: 'PATCH', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'x-processo-token': token },
          body: JSON.stringify({
            dados: dadosRef.current, versao: versaoRef.current,
            titulo: lerCampo('titulo', 'tituloPesquisa', 'nomeProjeto', 'nomeEvento', 'Título do Projeto', 'Título do Curso/Evento'),
            solicitanteNome: lerCampo('coordNome', 'nome', 'Nome Completo do Coordenador'),
            solicitanteEmail: lerCampo('coordEmail', 'email', 'E-mail Institucional'),
          }),
        });
        if (!resposta.ok) throw new Error(await mensagemErro(resposta));
        const salvo = await resposta.json() as { versao: number };
        versaoRef.current = salvo.versao;
        ultimoSalvoRef.current = instantaneo;
        if (JSON.stringify(dadosRef.current) === instantaneo) safeRemoveItem(chaveBackup);
        else safeSetItem(chaveBackup, JSON.stringify({ versao: versaoRef.current, dados: dadosRef.current }));
        setErro('');
      } catch (falha) {
        const mensagem = falha instanceof Error ? falha.message : 'Não foi possível salvar o rascunho.';
        setErro(mensagem);
        throw falha;
      } finally { setSalvando(false); }
    });
    filaRef.current = proxima.catch(() => undefined);
    return proxima;
  }, [processoInicial.id, token, chaveBackup]);

  useEffect(() => {
    if (JSON.stringify(dados) === ultimoSalvoRef.current) return;
    safeSetItem(chaveBackup, JSON.stringify({ versao: versaoRef.current, dados }));
    const temporizador = window.setTimeout(() => { void salvar().catch(() => undefined); }, 900);
    return () => window.clearTimeout(temporizador);
  }, [dados, salvar, chaveBackup]);

  const enviar = useCallback(async () => {
    await salvar();
    const resposta = await fetch(`/api/processos/${processoInicial.id}/enviar`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'x-processo-token': token },
      body: JSON.stringify({ versao: versaoRef.current }),
    });
    if (!resposta.ok) {
      const mensagem = await mensagemErro(resposta);
      setErro(mensagem);
      throw new Error(mensagem);
    }
    setErro('');
    setEnviado(true);
  }, [processoInicial.id, token, salvar]);

  const anexarDocumento = useCallback(async (codigo: string, arquivo: File) => {
    if (arquivo.size > 15 * 1024 * 1024) throw new Error('O arquivo deve ter até 15 MB.');
    const resposta = await fetch(`/api/processos/${processoInicial.id}/documentos/${encodeURIComponent(codigo)}`, {
      method: 'POST', credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/octet-stream', 'x-processo-token': token,
        'x-arquivo-tipo': arquivo.type, 'x-arquivo-nome': encodeURIComponent(arquivo.name),
      },
      body: arquivo,
    });
    if (!resposta.ok) throw new Error(await mensagemErro(resposta));
    const documento = await resposta.json() as DocumentoProcesso;
    setDocumentos((atuais) => [...atuais.filter((item) => item.id !== codigo), documento]);
    setErro('');
  }, [processoInicial.id, token]);

  const removerDocumento = useCallback(async (codigo: string) => {
    const resposta = await fetch(`/api/processos/${processoInicial.id}/documentos/${encodeURIComponent(codigo)}`, {
      method: 'DELETE', credentials: 'same-origin', headers: { 'x-processo-token': token },
    });
    if (!resposta.ok) throw new Error(await mensagemErro(resposta));
    setDocumentos((atuais) => atuais.map((item) => item.id === codigo ? { ...item, arquivo_nome: null, status: 'pendente' } : item));
    setErro('');
  }, [processoInicial.id, token]);

  const baixarDocumento = useCallback(async (codigo: string, nome: string) => {
    const resposta = await fetch(`/api/processos/${processoInicial.id}/documentos/${encodeURIComponent(codigo)}`, {
      credentials: 'same-origin', headers: { 'x-processo-token': token },
    });
    if (!resposta.ok) throw new Error(await mensagemErro(resposta));
    const url = URL.createObjectURL(await resposta.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [processoInicial.id, token]);

  const registrarDocumentos = useCallback(async (itens: Array<{ id: string; obrigatorio: boolean; concluido: boolean }>) => {
    const resposta = await fetch(`/api/processos/${processoInicial.id}/documentos`, {
      method: 'PUT', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'x-processo-token': token },
      body: JSON.stringify({ documentos: itens }),
    });
    if (!resposta.ok) throw new Error(await mensagemErro(resposta));
    setDocumentos(await resposta.json() as DocumentoProcesso[]);
  }, [processoInicial.id, token]);

  const valor = useMemo<ContextoProcesso>(() => ({ processo: processoInicial, dados, erro, salvando, documentos, atualizarCampo, salvar, save_state: salvar, enviar, novaTentativa, anexarDocumento, removerDocumento, baixarDocumento, registrarDocumentos }),
    [processoInicial, dados, erro, salvando, documentos, atualizarCampo, salvar, enviar, novaTentativa, anexarDocumento, removerDocumento, baixarDocumento, registrarDocumentos]);
  if (enviado) return <main className="mx-auto flex w-full max-w-[600px] flex-col gap-md p-lg">
    <h1 className="text-xl font-bold text-primary">Processo enviado</h1>
    <p>O processo {processoInicial.protocolo} foi registrado no servidor.</p>
    <button type="button" className="self-start rounded bg-primary px-md py-sm text-white" onClick={() => void novaTentativa()}>Iniciar nova tentativa</button>
  </main>;
  return <ProcessoContext.Provider value={valor}>{children}</ProcessoContext.Provider>;
};

export const useProcesso = () => useContext(ProcessoContext);

export function useProcessoState<T>(campo: string, inicial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const processo = useProcesso();
  const [valor, setValor] = useState<T>(() => {
    const salvo = processo?.dados.campos[campo];
    return salvo !== undefined ? salvo as T : typeof inicial === 'function' ? (inicial as () => T)() : inicial;
  });
  useEffect(() => { processo?.atualizarCampo(campo, valor); }, [campo, valor, processo?.atualizarCampo]);
  return [valor, setValor];
}
