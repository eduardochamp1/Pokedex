/**
 * Idioma do site: português ou inglês.
 *
 * A tradução é **em linha** — `t("Buscar", "Search")` — e não por chave num
 * dicionário. São centenas de textos espalhados por dezenas de componentes, e
 * com a tradução ao lado do original cada uma se revisa no lugar, sem chave
 * órfã nem chave faltando.
 *
 * O idioma vive num store simples (mesmo molde de `playerDex`) e o `App` o lê
 * na raiz: trocar re-renderiza a árvore inteira — nenhum componente usa
 * `React.memo` —, então até quem só chama `pickLocalized` acompanha.
 */
import { useCallback, useSyncExternalStore } from "react";

export type Lang = "pt" | "en";

const KEY = "pokedex:lang";

/** Português do navegador em qualquer posição vira pt; o resto, en. */
export function detectLang(languages: readonly string[]): Lang {
  if (languages.length === 0) return "pt";
  return languages.some((l) => l.toLowerCase().startsWith("pt")) ? "pt" : "en";
}

function navegador(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language ?? ""];
}

function load(): Lang {
  try {
    const salvo = localStorage.getItem(KEY);
    if (salvo === "pt" || salvo === "en") return salvo;
  } catch {
    // sem localStorage: fica o do navegador
  }
  return detectLang(navegador());
}

let lang: Lang = "pt";
const listeners = new Set<() => void>();

function aplicar() {
  // O atributo do <html> é o idioma, não o locale de formatação.
  if (typeof document !== "undefined") document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  listeners.forEach((l) => l());
}

export function reloadLang(): void {
  lang = load();
  aplicar();
}

reloadLang();

export function getLang(): Lang {
  return lang;
}

export function setLang(next: Lang): void {
  lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // vale só nesta aba
  }
  aplicar();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "pt" as Lang);
}

/** Texto no idioma pedido. */
export function tr(l: Lang, pt: string, en: string): string {
  return l === "en" ? en : pt;
}

/** Para componentes: `const t = useT(); t("Buscar", "Search")`. */
export function useT(): (pt: string, en: string) => string {
  const l = useLang();
  return useCallback((pt: string, en: string) => tr(l, pt, en), [l]);
}

/** Locale de formatação de data e número. */
export function localeOf(l: Lang): string {
  return l === "en" ? "en-US" : "pt-BR";
}
