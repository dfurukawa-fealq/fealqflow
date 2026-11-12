/** Prioriza as chaves canônicas e mantém compatibilidade com rascunhos antigos. */
export const lerTextoProcesso = (campos: Record<string, unknown>, ...nomes: string[]): string => {
  for (const nome of nomes) {
    const chaves = [nome, `campo:${nome}`, ...Object.keys(campos).filter((chave) => chave.startsWith(`campo:${nome}:`))];
    for (const chave of chaves) {
      const valor = campos[chave];
      if (typeof valor === 'string' && valor.trim()) return valor.trim();
    }
  }
  return '';
};
