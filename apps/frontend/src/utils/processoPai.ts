const CHAVES_PROCESSO_PAI = ['processo_pai', 'processoPai', 'processo-pai', 'proocesso'] as const;

/** Captura o identificador do processo pai nos formatos usados pelos links legados. */
export const capturarProcessoPai = (parametros: URLSearchParams, incluirProcessoLegado = false): string | null => {
  for (const chave of CHAVES_PROCESSO_PAI) {
    const valor = parametros.get(chave)?.trim();
    if (valor && /^[0-9a-f-]{36}$/i.test(valor)) return valor;
  }
  if (!incluirProcessoLegado) return null;
  const processo = parametros.get('processo')?.trim();
  return processo && /^[0-9a-f-]{36}$/i.test(processo) ? processo : null;
};
