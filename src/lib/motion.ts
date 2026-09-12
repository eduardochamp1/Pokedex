export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ViewTransitionApi = (cb: () => void) => unknown;

export function startTransition(cb: () => void): void {
  const api = (
    document as unknown as { startViewTransition?: ViewTransitionApi }
  ).startViewTransition;
  if (!api || prefersReducedMotion()) {
    cb();
    return;
  }
  api(cb);
}
