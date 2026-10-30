// =============================================
//  El Consejo de la Familia — Storage Layer
//  Thin localStorage wrapper. Kept separate from
//  pure game logic (core.ts) so the engine can
//  be tested without a DOM or storage API.
// =============================================

export const STORAGE_KEY = 'elConsejoV2:state';

/**
 * Serialize a GameState to a JSON string, or null on failure.
 */
export function serializeState(state: unknown): string | null {
  try {
    return JSON.stringify(state);
  } catch {
    return null;
  }
}

/**
 * Deserialize a JSON string into a value, or null on failure.
 */
export function deserializeState<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Persist the full game state to localStorage under STORAGE_KEY.
 * Returns true on success.
 */
export function saveState<T extends Record<string, unknown>>(state: T): boolean {
  const raw = serializeState(state);
  if (!raw) return false;
  try {
    (globalThis as { localStorage?: Storage }).localStorage!.setItem(
      STORAGE_KEY,
      raw,
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the game state from localStorage, or null if absent/corrupt.
 * Wrapped in try/catch so private-browsing modes never break the game.
 */
export function loadState<T extends Record<string, unknown>>(): T | null {
  try {
    const store = (globalThis as { localStorage?: Storage }).localStorage;
    if (!store) return null;
    const raw = store.getItem(STORAGE_KEY);
    return deserializeState<T>(raw);
  } catch {
    return null;
  }
}

/**
 * Remove the game state from localStorage.
 */
export function clearState(): boolean {
  try {
    (globalThis as { localStorage?: Storage }).localStorage!.removeItem(
      STORAGE_KEY,
    );
    return true;
  } catch {
    return false;
  }
}
