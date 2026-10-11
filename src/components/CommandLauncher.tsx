import { Suspense, lazy, useEffect, useState } from "react";
import { OPEN_SEARCH_EVENT } from "../lib/searchEvents";

/** A paleta traz a lore inteira para indexar: só carrega quando abre. */
const CommandPalette = lazy(() => import("./CommandPalette"));

const digitando = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/**
 * Ctrl+K (⌘K no Mac) abre a busca em qualquer página; "/" também, quando o
 * foco não está num campo.
 */
const CommandLauncher = () => {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const atalho = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const barra =
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !digitando(e.target);
      if (atalho || barra) {
        e.preventDefault();
        setAberta(true);
      }
    };
    const onEvento = () => setAberta(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onEvento);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onEvento);
    };
  }, []);

  if (!aberta) return null;
  return (
    <Suspense fallback={null}>
      <CommandPalette onClose={() => setAberta(false)} />
    </Suspense>
  );
};

export default CommandLauncher;
