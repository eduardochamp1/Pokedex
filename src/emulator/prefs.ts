/**
 * Preferencias do emulador no localStorage.
 *
 * Escolhas de tela e de controle sao do aparelho de quem joga, nao da sessao:
 * refazer a cada visita e atrito puro. Fica no localStorage e nao no IndexedDB
 * do core porque nao tem nada a ver com o estado do jogo — e se o
 * localStorage estiver indisponivel (modo privado restrito, cota estourada), o
 * emulador tem que continuar funcionando com o padrao.
 */

const PREFIX = "pokedex:emulator:";

/**
 * Le uma preferencia, validando o que voltou. Um valor gravado por uma versao
 * antiga do app pode nao ter mais forma valida — o validador e o que impede
 * isso de virar estado quebrado em vez de simplesmente cair no padrao.
 */
export function loadPref<T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | undefined {
  let raw: string | null;
  try {
    raw = localStorage.getItem(PREFIX + key);
  } catch {
    return undefined;
  }
  if (raw === null) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** Grava uma preferencia. Falha em silencio: nao vale quebrar o jogo por isso. */
export function savePref(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // sem localStorage: a preferencia so nao sobrevive a sessao
  }
}

/** Remove uma preferencia (volta ao padrao). */
export function clearPref(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // idem
  }
}
