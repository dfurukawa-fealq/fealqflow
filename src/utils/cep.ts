/**
 * Serviço resiliente de busca de CEP para o FealqFlow.
 * Possui tratamento de timeout (AbortController), captura de falhas de rede
 * e validação estrita dos dados retornados.
 */

export interface EnderecoCepResult {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  sucesso: boolean;
  erro?: string;
}

export const buscarEnderecoPorCep = async (
  cepBruto: string,
  timeoutMs = 5000
): Promise<EnderecoCepResult> => {
  const limpo = cepBruto.replace(/\D/g, '');
  if (limpo.length !== 8) {
    return {
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: '',
      sucesso: false,
      erro: 'CEP inválido. Deve conter 8 dígitos numéricos.',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`, {
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return {
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        sucesso: false,
        erro: `Falha na consulta ao serviço de CEP (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    if (data.erro) {
      return {
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        sucesso: false,
        erro: 'CEP não encontrado na base de dados.',
      };
    }

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
      sucesso: true,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err?.name === 'AbortError';
    return {
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: '',
      sucesso: false,
      erro: isTimeout
        ? 'Tempo limite de busca excedido. Preencha o endereço manualmente.'
        : 'Não foi possível conectar ao serviço de busca de CEP.',
    };
  }
};
