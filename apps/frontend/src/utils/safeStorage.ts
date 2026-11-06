/**
 * Utilitário de armazenamento resiliente para o FealqFlow.
 * Protege a aplicação contra crashes em ambientes restritos (ex: iFrame do WordPress,
 * navegação anônima com cookies bloqueados, ou QuotaExceededError).
 */

const memoryStore = new Map<string, string>();

const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__fealq_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const hasLocalStorage = isLocalStorageAvailable();
export const armazenamentoPersistenteDisponivel = hasLocalStorage;

export const safeGetItem = (key: string): string | null => {
  try {
    if (hasLocalStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore.get(key) ?? null;
  } catch (err) {
    console.warn(`[safeStorage] Falha ao ler chave "${key}":`, err);
    return memoryStore.get(key) ?? null;
  }
};

export const safeSetItem = (key: string, value: string): void => {
  try {
    if (hasLocalStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`[safeStorage] Falha ao persistir chave "${key}" no localStorage (usando memória):`, err);
  }
  memoryStore.set(key, value);
};

export const safeRemoveItem = (key: string): void => {
  try {
    if (hasLocalStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[safeStorage] Falha ao remover chave "${key}":`, err);
  }
  memoryStore.delete(key);
};

export const safeJsonParse = <T>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[safeStorage] JSON corrompido no storage, utilizando fallback padrão:', err);
    return fallback;
  }
};
