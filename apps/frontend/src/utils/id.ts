export const gerarIdLocal = (): string => {
  const uuid = globalThis.crypto?.randomUUID;
  if (typeof uuid === 'function') return uuid.call(globalThis.crypto);
  const aleatorio = Math.random().toString(36).slice(2, 10);
  return `local-${Date.now().toString(36)}-${aleatorio}`;
};
