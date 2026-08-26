import { RefObject, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface Options {
  maxDeg?: number;
  scale?: number;
}

export function useTiltEffect(
  ref: RefObject<HTMLElement>,
  options: Options = {}
) {
  const { maxDeg = 8, scale = 1 } = options;
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = x * maxDeg * 2;
      const rotX = -y * maxDeg * 2;
      el.style.transform =
        `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale})`;
      el.style.setProperty("--foil-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--foil-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.transform = "";
      el.style.removeProperty("--foil-x");
      el.style.removeProperty("--foil-y");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, maxDeg, scale, reduced]);
}
