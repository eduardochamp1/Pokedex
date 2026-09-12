import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { startTransition } from "./motion";

describe("startTransition", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {} as unknown as Document);
    vi.stubGlobal("window", {
      matchMedia: (q: string) => ({
        matches: false,
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    } as unknown as Window);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama o callback quando a API nao existe (fallback)", () => {
    const cb = vi.fn();
    startTransition(cb);
    expect(cb).toHaveBeenCalledOnce();
  });

  it("chama o callback via startViewTransition quando disponivel", () => {
    const cb = vi.fn();
    const api = vi.fn((fn: () => void) => {
      fn();
      return {};
    });
    vi.stubGlobal("document", { startViewTransition: api } as unknown as Document);
    startTransition(cb);
    expect(api).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledOnce();
  });

  it("usa o fallback quando o usuario prefere movimento reduzido", () => {
    const cb = vi.fn();
    const api = vi.fn();
    vi.stubGlobal("document", { startViewTransition: api } as unknown as Document);
    vi.stubGlobal("window", {
      matchMedia: (q: string) => ({
        matches: q.includes("reduce"),
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    } as unknown as Window);
    startTransition(cb);
    expect(api).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledOnce();
  });
});
