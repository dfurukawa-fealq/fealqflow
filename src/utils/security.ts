/**
 * Utilitários de segurança e sanitização para o FealqFlow.
 * Previne vetores de injeção de parâmetros, open redirects e sanitiza entradas.
 */

/**
 * Sanitiza identificador de protocolo permitindo apenas caracteres alfanuméricos e hífens.
 */
export const sanitizeProtocolId = (raw: string | null | undefined): string => {
  if (!raw) return '';
  return raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
};

/**
 * Sanitiza texto genérico recebido via query params ou inputs externos.
 * Remove caracteres de controle perigosos e limita o tamanho máximo.
 */
export const sanitizeInputText = (raw: string | null | undefined, maxLength = 255): string => {
  if (!raw) return '';
  return raw
    .replace(/[\x00-\x1F\x7F<>]/g, '') // Remove caracteres de controle e tags HTML básicas
    .trim()
    .slice(0, maxLength);
};

/**
 * Valida se uma URL é segura para navegação SPA interna ou externa permitida.
 * Rejeita esquemas perigosos como 'javascript:', 'data:', 'vbscript:'.
 */
export const isSafeUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  
  // Rotas relativas seguras da aplicação
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  
  // URLs absolutas estritamente HTTP ou HTTPS
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Retorna uma URL segura de retorno. Se a URL fornecida for inválida ou insegura,
 * retorna a rota padrão de fallback.
 */
export const getSafeReturnUrl = (url: string | null | undefined, fallback = '/projetos/form-curso'): string => {
  if (url && isSafeUrl(url)) {
    return url;
  }
  return fallback;
};
