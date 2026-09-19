import { useEffect, useRef, useState } from "react";

/** 18 ms por caractere: rapido o bastante para nao irritar quem so quer ler. */
const STEP_MS = 18;

/**
 * Nomes que ja foram digitados nesta visita. Fica fora do React de proposito:
 * voltar para um pokemon que voce ja viu nao deve redigitar o texto, e um
 * estado dentro do componente morre a cada desmontagem de rota.
 */
const alreadyTyped = new Set<string>();

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface Result {
  /** O trecho ja digitado — igual a `text` assim que termina. */
  shown: string;
  done: boolean;
  /** Completa na hora. */
  skip: () => void;
}

/**
 * Digita `text` caractere a caractere. `id` identifica de quem e o texto,
 * para que a animacao rode uma vez so por visita.
 */
export function useTypewriter(text: string, id: string): Result {
  // Ja visto, sem movimento ou sem texto: entrega pronto, sem timer nenhum.
  const instant = !text || alreadyTyped.has(id) || prefersReducedMotion();
  const [count, setCount] = useState(() => (instant ? text.length : 0));
  const idRef = useRef(id);

  useEffect(() => {
    // Trocou de pokemon sem desmontar o componente: recomeca (ou nao).
    if (idRef.current !== id) {
      idRef.current = id;
      setCount(!text || alreadyTyped.has(id) || prefersReducedMotion() ? text.length : 0);
      return;
    }
    if (count >= text.length) {
      if (text) alreadyTyped.add(id);
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [count, text, id]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    skip: () => setCount(text.length),
  };
}
