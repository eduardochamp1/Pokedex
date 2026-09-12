import { RefObject, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface Options {
  maxDeg?: number;
  scale?: number;
}

let activeRaf = 0;

export function useTiltEffect(
  ref: RefObject<HTMLElement>,
  options: Options = {}
) {
  const { maxDeg = 8, scale = 1 } = options;
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    if (!hoverCapable) return; // mobile: sem tilt

    let visible = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    let pending: { x: number; y: number } | null = null;
    const flush = () => {
      activeRaf = 0;
      if (!pending || !el.isConnected) return;
      const { x, y } = pending;
      const rotY = x * maxDeg * 2;
      const rotX = -y * maxDeg * 2;
      el.style.transform =
        `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale})`;
      el.style.setProperty("--rx", `${rotX.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${rotY.toFixed(2)}deg`);
      el.style.setProperty("--foil-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--foil-y", `${((y + 0.5) * 100).toFixed(1)}%`);
      pending = null;
    };

    const onEnter = () => {
      if (!visible) return;
      el.style.willChange = "transform";
    };
    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      const rect = el.getBoundingClientRect();
      pending = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
      if (!activeRaf) activeRaf = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      pending = null;
      el.style.transform = "";
      el.style.willChange = "";
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.style.removeProperty("--foil-x");
      el.style.removeProperty("--foil-y");
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (activeRaf) {
        cancelAnimationFrame(activeRaf);
        activeRaf = 0;
      }
    };
  }, [ref, maxDeg, scale, reduced]);
}
