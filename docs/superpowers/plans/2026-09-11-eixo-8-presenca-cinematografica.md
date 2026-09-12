# Eixo 8 — Presença Cinematográfica: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar impacto visual da Pokédex com holo cards 3D em todo o grid, sprite scrubber (shiny/animado/costas), comparador de tamanho em `/tamanhos` e view transitions em todas as rotas + morph do sprite.

**Architecture:** 4 features independentes que compartilham 3 utilitários (`lib/motion.ts`, `lib/comparatorStore.ts`, `hooks/useSpriteFrames.ts`). Nenhuma dependência nova — CSS puro para holo, View Transitions API nativa, `useSyncExternalStore` para o carrinho.

**Tech Stack:** React 18 + TypeScript strict, Vite 5, React Router 7, Vitest, PokéAPI (`pokemon.sprites.versions`).

**Convention:** todos os comandos assumem `cd Z:/Projetos/pokedex/repo` (não faça `cd` no comando — o cwd já está resolvido). Commits terminam com `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

---

## Estrutura de arquivos

**Criar:**
- `src/lib/motion.ts` — `startTransition` wrapper.
- `src/lib/motion.test.ts` — fallback + reduced-motion gate.
- `src/lib/comparatorStore.ts` — carrinho global via `useSyncExternalStore`.
- `src/lib/comparatorStore.test.ts` — API + limites + persistência.
- `src/lib/tamanhosParams.ts` — parse/serialize da URL `/tamanhos?p=…`.
- `src/lib/tamanhosParams.test.ts`.
- `src/lib/sizeScale.ts` — helper puro pro `SizeCanvas`.
- `src/lib/sizeScale.test.ts`.
- `src/hooks/useSpriteFrames.ts` — extrai frames por geração da PokéAPI.
- `src/hooks/useSpriteFrames.test.ts`.
- `src/components/SpriteScrubber.tsx` — slider + toggles.
- `src/components/SizeCanvas.tsx` — SVG de comparação.
- `src/components/ComparatorButton.tsx` — FAB + modal.
- `src/pages/SizesPage.tsx` — rota `/tamanhos`.
- `src/styles/holo.css` — camadas foil/spectral/glitter.

**Modificar:**
- `src/hooks/useTiltEffect.ts` — IntersectionObserver + rAF + pointerenter gating; expõe `--rx`, `--ry` além de `--foil-x`/`--foil-y`.
- `src/components/Card.tsx` — adiciona `.card-spectral` e `.card-glitter`; seta `--holo-intensity`; adiciona botão `📏` e `view-transition-name` no sprite.
- `src/components/CardHero.tsx` — mesmo layering do Card; `view-transition-name` no sprite hero.
- `src/components/EvolutionChain.tsx` — `view-transition-name` nos sprites da cadeia.
- `src/pages/DetailPage.tsx` — substitui o sprite estático por `SpriteScrubber`; `view-transition-name` no hero.
- `src/App.tsx` — envolve `useNavigate` em `startTransition` via `RouterTransition`; adiciona rota `/tamanhos`; monta `ComparatorButton`.
- `src/components/Navbar.tsx` — link `Tamanhos`.
- `src/App.css` — importa `holo.css`; regras para `.card-spectral`, `.card-glitter`, `.sprite-scrubber`, `.size-canvas`, `.comparator-fab`, `.sizes-page`.

---

## Fase A — Infraestrutura

### Task 1: `lib/motion.ts` — wrapper de view transitions

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/lib/motion.test.ts`

- [ ] **Step 1: Escrever o teste falho**

```ts
// src/lib/motion.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { startTransition } from "./motion";

describe("startTransition", () => {
  beforeEach(() => {
    (document as any).startViewTransition = undefined;
  });
  afterEach(() => {
    delete (document as any).startViewTransition;
    document.documentElement.style.removeProperty("--force-reduced-motion");
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
      return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    });
    (document as any).startViewTransition = api;
    startTransition(cb);
    expect(api).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledOnce();
  });

  it("usa o fallback quando o usuario prefere movimento reduzido", () => {
    const cb = vi.fn();
    const api = vi.fn();
    (document as any).startViewTransition = api;
    window.matchMedia = ((q: string) =>
      ({ matches: q.includes("reduce"), media: q, addEventListener: () => {}, removeEventListener: () => {} } as any));
    startTransition(cb);
    expect(api).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run src/lib/motion.test.ts
```
Expected: FAIL (arquivo `motion.ts` não existe).

- [ ] **Step 3: Implementar `motion.ts`**

```ts
// src/lib/motion.ts
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ViewTransitionApi = (cb: () => void) => unknown;

export function startTransition(cb: () => void): void {
  const api = (document as unknown as { startViewTransition?: ViewTransitionApi })
    .startViewTransition;
  if (!api || prefersReducedMotion()) {
    cb();
    return;
  }
  api(cb);
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npx vitest run src/lib/motion.test.ts
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts
git commit -m "feat(motion): wrapper startTransition com fallback e reduced-motion" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: `RouterTransition` — fade entre todas as rotas

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css` (append)

- [ ] **Step 1: Ler o App.tsx atual pra achar onde a `Suspense`/`Routes` mora**

```bash
grep -n "Routes\|Route " src/App.tsx | head
```

- [ ] **Step 2: Adicionar `RouterTransition` que intercepta `navigate`**

Dentro de `src/App.tsx`, importar `startTransition`:

```tsx
import { startTransition } from "./lib/motion";
```

Envolver `<Routes>` numa `<div className="route-transition-root">` (o browser aplica o pseudo `::view-transition-old(root)` sobre esse container por default).

E adicionar um `NavigationInterceptor` que troca cliques em `<Link>` por `startTransition(() => navigate(...))`. Substituir a área de rotas assim:

```tsx
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { startTransition } from "./lib/motion";

function RouterTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prev = useRef(location.pathname);
  useLayoutEffect(() => {
    if (prev.current === location.pathname) return;
    prev.current = location.pathname;
    // Router ja mudou a rota; envolvemos o next paint num view transition.
    startTransition(() => {
      // no-op: forca o browser a snapshot antes de re-renderizar.
    });
  }, [location.pathname]);
  return <>{children}</>;
}
```

Colocar `<RouterTransition>` entre `<BrowserRouter>` e `<Routes>`.

- [ ] **Step 3: Adicionar CSS de fade padrão**

Append em `src/App.css`:

```css
/* ===== View Transitions ===== */
@media not (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 250ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  ::view-transition-old(root) {
    animation-name: fade-out;
  }
  ::view-transition-new(root) {
    animation-name: fade-in;
  }
  @keyframes fade-out {
    to { opacity: 0; }
  }
  @keyframes fade-in {
    from { opacity: 0; }
  }
}
```

- [ ] **Step 4: Verificar tipagem e build**

```bash
npm run typecheck
npm run build
```
Expected: `tsc -b` passa; build gera sem warning.

- [ ] **Step 5: Testar no navegador (Chrome/Edge)**

```bash
npm run dev
```
Abrir `http://localhost:5173`, navegar entre Home ↔ Mapa ↔ Lore. Deve haver fade suave.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat(routes): fade suave entre todas as rotas via View Transitions" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Fase B — Morph do sprite

### Task 3: `view-transition-name` no card → hero da detail

**Files:**
- Modify: `src/components/Card.tsx`
- Modify: `src/pages/DetailPage.tsx`

- [ ] **Step 1: Anexar `view-transition-name` ao artwork do Card só quando ele é clicado**

Adicionar estado `isNavigating` local no Card:

```tsx
import { useState } from "react";
// dentro do Card:
const [isNavigating, setIsNavigating] = useState(false);
```

Substituir a `<img>` do artwork por:

```tsx
<img
  src={artwork}
  crossOrigin="anonymous"
  alt={pokemon.name}
  loading="lazy"
  decoding="async"
  width={220}
  height={220}
  style={
    isNavigating
      ? ({ viewTransitionName: `sprite-${pokemon.id}` } as React.CSSProperties)
      : undefined
  }
/>
```

E marcar o link:

```tsx
{linkTo ? (
  <Link
    to={linkTo}
    className="card-link"
    onClick={() => setIsNavigating(true)}
  >
    {inner}
  </Link>
) : (
  inner
)}
```

- [ ] **Step 2: Anexar o mesmo nome ao artwork do hero da DetailPage**

Achar a `<img>` do hero:

```bash
grep -n "official-artwork\|front_default" src/pages/DetailPage.tsx | head
```

Adicionar ao style dela:

```tsx
style={{ viewTransitionName: `sprite-${pokemon.id}` }}
```

(onde `pokemon.id` já está no escopo).

- [ ] **Step 3: Testar manualmente**

```bash
npm run dev
```

Clicar em qualquer card do grid. O sprite deve "voar" para o hero. Em Firefox sem suporte, navegação normal.

- [ ] **Step 4: Reset do `isNavigating` no unmount**

Para não deixar o `view-transition-name` grudado se o usuário voltar (F5, back), garantir que estado local reseta ao desmontar (já acontece automaticamente com useState).

- [ ] **Step 5: Commit**

```bash
git add src/components/Card.tsx src/pages/DetailPage.tsx
git commit -m "feat(motion): morph do sprite card -> detail via view-transition-name" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Morph na cadeia de evolução (detail → detail)

**Files:**
- Modify: `src/components/EvolutionChain.tsx`

- [ ] **Step 1: Ler EvolutionChain.tsx**

```bash
grep -n "id\|Link\|to=" src/components/EvolutionChain.tsx | head
```

- [ ] **Step 2: Adicionar `view-transition-name` nos mini-cards**

Para cada link/imagem da cadeia, adicionar quando clicado (mesmo padrão do Task 3):

```tsx
const [navTo, setNavTo] = useState<string | null>(null);
// ...
<img
  src={sprite}
  alt={step.name}
  style={
    navTo === step.name
      ? ({ viewTransitionName: `sprite-${idForName(step.name)}` } as React.CSSProperties)
      : undefined
  }
/>
```

Onde `idForName` extrai o id do URL (ou usa mapa `nameToId` se disponível — reusar `useNameIndex`/`extractIdFromUrl` de `lib/filters.ts`).

- [ ] **Step 3: Testar**

```bash
npm run dev
```

Abrir a detail de Bulbasaur, clicar em Ivysaur na chain. Sprite deve morphar.

- [ ] **Step 4: Commit**

```bash
git add src/components/EvolutionChain.tsx
git commit -m "feat(motion): morph do sprite entre etapas da cadeia de evolucao" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Fase C — Holo cards

### Task 5: `useTiltEffect` performance-aware

**Files:**
- Modify: `src/hooks/useTiltEffect.ts`

- [ ] **Step 1: Reescrever com IntersectionObserver + rAF + pointerenter**

```tsx
// src/hooks/useTiltEffect.ts
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
```

- [ ] **Step 2: Verificar typecheck + lint**

```bash
npm run typecheck && npm run lint
```
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTiltEffect.ts
git commit -m "perf(tilt): gate por IntersectionObserver e rAF; expoe --rx/--ry" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: `holo.css` + camadas spectral/glitter no Card

**Files:**
- Create: `src/styles/holo.css`
- Modify: `src/components/Card.tsx`
- Modify: `src/components/CardHero.tsx`
- Modify: `src/App.css` (import)

- [ ] **Step 1: Criar `src/styles/holo.css`**

```css
/* ===== Holo layers (importado por Card/CardHero) =====
   Empilha sobre .card { position: relative; overflow: hidden; }
   Cada camada usa --holo-intensity (0..1) e --foil-x/y do useTiltEffect. */

.card { --holo-intensity: 0.4; }
.card.is-legendary { --holo-intensity: 0.9; }
.card.is-mythical { --holo-intensity: 1; }

.card-spectral,
.card-glitter {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease;
  border-radius: inherit;
}

.card:hover .card-spectral {
  opacity: calc(var(--holo-intensity) * 0.55);
}
.card:hover .card-glitter {
  opacity: calc(var(--holo-intensity) * 0.7);
}

@supports (mix-blend-mode: color-dodge) {
  .card-spectral {
    background: linear-gradient(
      115deg,
      transparent 20%,
      rgba(255, 0, 128, 0.35) 40%,
      rgba(0, 200, 255, 0.35) 55%,
      rgba(255, 255, 0, 0.35) 70%,
      transparent 85%
    );
    background-position: var(--foil-x, 50%) var(--foil-y, 50%);
    background-size: 200% 200%;
    mix-blend-mode: color-dodge;
  }
  .card-glitter {
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.6) 0, transparent 8%),
      radial-gradient(circle at 70% 40%, rgba(255, 255, 255, 0.5) 0, transparent 6%),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.6) 0, transparent 7%),
      radial-gradient(circle at 85% 75%, rgba(255, 255, 255, 0.5) 0, transparent 5%);
    mix-blend-mode: overlay;
  }
}

.card:not(.is-legendary):not(.is-mythical) .card-glitter {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .card-spectral,
  .card-glitter { display: none; }
}

@media (hover: none) {
  .card-spectral { opacity: calc(var(--holo-intensity) * 0.25); }
  .card-glitter { opacity: calc(var(--holo-intensity) * 0.3); }
}
```

- [ ] **Step 2: Importar em `App.css`**

Adicionar no topo de `src/App.css`:

```css
@import "./styles/holo.css";
```

- [ ] **Step 3: Adicionar as camadas no Card.tsx**

Logo depois do `<div className="card-foil" aria-hidden="true" />` já existente:

```tsx
<div className="card-foil" aria-hidden="true" />
<div className="card-spectral" aria-hidden="true" />
<div className="card-glitter" aria-hidden="true" />
```

- [ ] **Step 4: Adicionar as mesmas camadas no CardHero.tsx**

```bash
grep -n "card-foil\|card-hero" src/components/CardHero.tsx
```

Adicionar `.card-spectral` e `.card-glitter` logo após o `.card-foil` existente (ou criar se não houver — mesma estrutura do Card).

- [ ] **Step 5: Testar visualmente**

```bash
npm run dev
```

Passar o mouse sobre cards no grid. Comum: brilho sutil. Legendary/Mythical: brilho forte + glitter.

- [ ] **Step 6: Commit**

```bash
git add src/styles/holo.css src/components/Card.tsx src/components/CardHero.tsx src/App.css
git commit -m "feat(holo): camadas spectral e glitter escaladas por raridade" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Fase D — Sprite scrubber

### Task 7: `useSpriteFrames` — extrai frames por geração

**Files:**
- Create: `src/hooks/useSpriteFrames.ts`
- Create: `src/hooks/useSpriteFrames.test.ts`

- [ ] **Step 1: Escrever o teste falho**

```ts
// src/hooks/useSpriteFrames.test.ts
import { describe, expect, it } from "vitest";
import { extractFrames } from "./useSpriteFrames";

const bulbaSprites = {
  front_default: "https://home/1.png",
  versions: {
    "generation-i": { "red-blue": { front_default: "https://rb/1.png", back_default: "https://rb/back-1.png" } },
    "generation-ii": { crystal: { front_default: "https://crystal/1.png", front_shiny: "https://crystal/s1.png" } },
    "generation-v": {
      "black-white": {
        front_default: "https://bw/1.png",
        front_shiny: "https://bw/s1.png",
        animated: { front_default: "https://bw/1.gif", front_shiny: "https://bw/s1.gif" },
      },
    },
  },
} as any;

describe("extractFrames", () => {
  it("devolve um frame por geracao onde o sprite existe", () => {
    const frames = extractFrames(bulbaSprites, { shiny: false, animated: false, back: false });
    expect(frames.map((f) => f.gen)).toEqual(["I", "II", "V"]);
  });

  it("shiny troca a URL quando disponivel", () => {
    const frames = extractFrames(bulbaSprites, { shiny: true, animated: false, back: false });
    expect(frames.find((f) => f.gen === "II")?.url).toBe("https://crystal/s1.png");
  });

  it("animated so aplica na Gen V, fallback estatico nas outras", () => {
    const frames = extractFrames(bulbaSprites, { shiny: false, animated: true, back: false });
    const gen5 = frames.find((f) => f.gen === "V");
    expect(gen5?.url).toBe("https://bw/1.gif");
    expect(gen5?.isAnimated).toBe(true);
    expect(frames.find((f) => f.gen === "I")?.isAnimated).toBe(false);
  });

  it("back troca pro back_default quando existe", () => {
    const frames = extractFrames(bulbaSprites, { shiny: false, animated: false, back: true });
    expect(frames.find((f) => f.gen === "I")?.url).toBe("https://rb/back-1.png");
  });

  it("pula geracao onde o pokemon nao existia", () => {
    const frames = extractFrames({ versions: { "generation-vi": {} } } as any, {
      shiny: false, animated: false, back: false,
    });
    expect(frames).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run src/hooks/useSpriteFrames.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implementar**

```ts
// src/hooks/useSpriteFrames.ts
import type { Pokemon } from "../types/pokemon";

export interface Frame {
  gen: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII";
  url: string;
  isAnimated: boolean;
}

export interface Toggles {
  shiny: boolean;
  animated: boolean;
  back: boolean;
}

const GEN_ORDER: Array<{ gen: Frame["gen"]; key: string; game: string; animatedGen?: boolean }> = [
  { gen: "I", key: "generation-i", game: "red-blue" },
  { gen: "II", key: "generation-ii", game: "crystal" },
  { gen: "III", key: "generation-iii", game: "emerald" },
  { gen: "IV", key: "generation-iv", game: "platinum" },
  { gen: "V", key: "generation-v", game: "black-white", animatedGen: true },
  { gen: "VI", key: "generation-vi", game: "x-y" },
  { gen: "VII", key: "generation-vii", game: "ultra-sun-ultra-moon" },
  { gen: "VIII", key: "generation-viii", game: "icons" },
];

type Bag = Record<string, string | null | Record<string, string | null>>;

function pickUrl(bag: Bag | undefined, t: Toggles, allowAnimated: boolean): string | null {
  if (!bag) return null;
  if (t.animated && allowAnimated) {
    const anim = bag.animated as Bag | undefined;
    if (anim) {
      const key = t.back
        ? t.shiny ? "back_shiny" : "back_default"
        : t.shiny ? "front_shiny" : "front_default";
      const v = anim[key];
      if (typeof v === "string") return v;
    }
  }
  const key = t.back
    ? t.shiny ? "back_shiny" : "back_default"
    : t.shiny ? "front_shiny" : "front_default";
  const v = bag[key];
  return typeof v === "string" ? v : null;
}

export function extractFrames(sprites: Pokemon["sprites"], t: Toggles): Frame[] {
  const versions = (sprites as any).versions;
  if (!versions) return [];
  const out: Frame[] = [];
  for (const g of GEN_ORDER) {
    const games = versions[g.key];
    if (!games) continue;
    const bag = games[g.game] as Bag | undefined;
    const url = pickUrl(bag, t, !!g.animatedGen);
    if (!url) continue;
    out.push({
      gen: g.gen,
      url,
      isAnimated: !!(g.animatedGen && t.animated && url.endsWith(".gif")),
    });
  }
  return out;
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npx vitest run src/hooks/useSpriteFrames.test.ts
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpriteFrames.ts src/hooks/useSpriteFrames.test.ts
git commit -m "feat(sprites): extractFrames por geracao com shiny/animated/back" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: `SpriteScrubber` — slider + toggles

**Files:**
- Create: `src/components/SpriteScrubber.tsx`
- Modify: `src/App.css` (append)

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/SpriteScrubber.tsx
import { useMemo, useState } from "react";
import { extractFrames, type Toggles } from "../hooks/useSpriteFrames";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
}

const SpriteScrubber = ({ pokemon }: Props) => {
  const [toggles, setToggles] = useState<Toggles>({ shiny: false, animated: false, back: false });
  const [index, setIndex] = useState(0);

  const frames = useMemo(
    () => extractFrames(pokemon.sprites, toggles),
    [pokemon.sprites, toggles]
  );

  const safeIndex = Math.min(index, Math.max(0, frames.length - 1));
  const current = frames[safeIndex];

  return (
    <div className="sprite-scrubber">
      <div className="sprite-scrubber-stage">
        {current ? (
          <img
            src={current.url}
            alt={`${pokemon.name} — Gen ${current.gen}`}
            loading={current.isAnimated ? "lazy" : "eager"}
            style={{ imageRendering: "pixelated" as const }}
          />
        ) : (
          <span className="sprite-scrubber-empty">Sem sprite para este filtro</span>
        )}
      </div>
      {frames.length > 0 && (
        <>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={safeIndex}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Deslizar por geração"
            className="sprite-scrubber-range"
          />
          <div className="sprite-scrubber-label">
            Geração {current?.gen}
          </div>
        </>
      )}
      <div className="sprite-scrubber-toggles">
        <label>
          <input
            type="checkbox"
            checked={toggles.shiny}
            onChange={(e) => setToggles((t) => ({ ...t, shiny: e.target.checked }))}
          />
          ✨ Shiny
        </label>
        <label>
          <input
            type="checkbox"
            checked={toggles.animated}
            onChange={(e) => setToggles((t) => ({ ...t, animated: e.target.checked }))}
          />
          🎬 Animado
        </label>
        <label>
          <input
            type="checkbox"
            checked={toggles.back}
            onChange={(e) => setToggles((t) => ({ ...t, back: e.target.checked }))}
          />
          ↩️ Costas
        </label>
      </div>
    </div>
  );
};

export default SpriteScrubber;
```

- [ ] **Step 2: Estilos**

Append em `src/App.css`:

```css
/* ===== SpriteScrubber ===== */
.sprite-scrubber {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: var(--surface-1);
  border-radius: 12px;
}
.sprite-scrubber-stage {
  width: 180px;
  height: 180px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}
.sprite-scrubber-stage img {
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
  transition: opacity 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .sprite-scrubber-stage img { transition: none; }
}
.sprite-scrubber-range { width: 100%; }
.sprite-scrubber-label {
  font-size: 0.85rem;
  color: var(--text-dim);
}
.sprite-scrubber-toggles {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
}
.sprite-scrubber-empty {
  color: var(--text-dim);
  font-size: 0.85rem;
  text-align: center;
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SpriteScrubber.tsx src/App.css
git commit -m "feat(sprites): SpriteScrubber com slider e toggles" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Integrar `SpriteScrubber` na DetailPage

**Files:**
- Modify: `src/pages/DetailPage.tsx`

- [ ] **Step 1: Ler DetailPage para achar onde encaixar o painel**

```bash
grep -n "SpriteViewer\|sprite\|meta\|defense" src/pages/DetailPage.tsx | head
```

- [ ] **Step 2: Importar e montar**

```tsx
import SpriteScrubber from "../components/SpriteScrubber";
// ...dentro do JSX, adicionar um novo painel (grid slot novo):
<section className="detail-panel">
  <h3>Sprite através das gerações</h3>
  <SpriteScrubber pokemon={pokemon} />
</section>
```

Se `.detail-layout` for grid nomeado, adicionar linha `scrubber` no CSS. Caso contrário, apenas append como último painel.

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```

Abrir Bulbasaur, deslizar o slider — deve trocar de Gen I → V. Ativar shiny/animado.

- [ ] **Step 4: Commit**

```bash
git add src/pages/DetailPage.tsx
git commit -m "feat(detail): painel SpriteScrubber com evolucao dos sprites por geracao" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Fase E — Comparador de tamanho

### Task 10: `comparatorStore` — carrinho global

**Files:**
- Create: `src/lib/comparatorStore.ts`
- Create: `src/lib/comparatorStore.test.ts`

- [ ] **Step 1: Escrever teste falho**

```ts
// src/lib/comparatorStore.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { add, remove, clear, snapshot, MAX } from "./comparatorStore";

const p = (name: string, height = 10) => ({ name, height, sprite: `s/${name}` });

describe("comparatorStore", () => {
  beforeEach(() => {
    localStorage.clear();
    clear();
  });

  it("add adiciona um item", () => {
    add(p("pikachu"));
    expect(snapshot()).toEqual([p("pikachu")]);
  });

  it("add e idempotente pelo nome", () => {
    add(p("pikachu"));
    add(p("pikachu"));
    expect(snapshot()).toHaveLength(1);
  });

  it(`limita em ${MAX}`, () => {
    for (let i = 0; i < MAX + 3; i++) add(p(`p${i}`));
    expect(snapshot()).toHaveLength(MAX);
  });

  it("remove tira o item pelo nome", () => {
    add(p("a"));
    add(p("b"));
    remove("a");
    expect(snapshot().map((x) => x.name)).toEqual(["b"]);
  });

  it("clear zera o carrinho", () => {
    add(p("a"));
    clear();
    expect(snapshot()).toEqual([]);
  });

  it("persiste no localStorage", () => {
    add(p("pikachu"));
    const raw = localStorage.getItem("comparator-cart");
    expect(raw).toContain("pikachu");
  });
});
```

- [ ] **Step 2: Rodar e falhar**

```bash
npx vitest run src/lib/comparatorStore.test.ts
```

- [ ] **Step 3: Implementar**

```ts
// src/lib/comparatorStore.ts
import { useSyncExternalStore } from "react";

export interface Slot {
  name: string;
  height: number;
  sprite: string;
}

export const MAX = 6;
const KEY = "comparator-cart";

let state: Slot[] = load();
const listeners = new Set<() => void>();

function load(): Slot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Slot =>
        x && typeof x.name === "string" && typeof x.height === "number" && typeof x.sprite === "string"
    );
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignora quota
  }
}

function emit() {
  save();
  listeners.forEach((l) => l());
}

export function snapshot(): Slot[] {
  return state;
}

export function add(slot: Slot) {
  if (state.some((s) => s.name === slot.name)) return;
  if (state.length >= MAX) return;
  state = [...state, slot];
  emit();
}

export function remove(name: string) {
  const next = state.filter((s) => s.name !== name);
  if (next.length === state.length) return;
  state = next;
  emit();
}

export function clear() {
  if (state.length === 0) return;
  state = [];
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useComparator(): Slot[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
```

- [ ] **Step 4: Rodar e passar**

```bash
npx vitest run src/lib/comparatorStore.test.ts
```
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/comparatorStore.ts src/lib/comparatorStore.test.ts
git commit -m "feat(comparator): store global com useSyncExternalStore + localStorage" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 11: `sizeScale` — helper puro pro SizeCanvas

**Files:**
- Create: `src/lib/sizeScale.ts`
- Create: `src/lib/sizeScale.test.ts`

- [ ] **Step 1: Escrever teste falho**

```ts
// src/lib/sizeScale.test.ts
import { describe, expect, it } from "vitest";
import { computeScale, HUMAN_HEIGHT_DM, MIN_SPRITE_PX } from "./sizeScale";

describe("computeScale", () => {
  it("com 1 pokemon menor que humano, humano domina", () => {
    const s = computeScale([{ name: "joltik", height: 1 }], { canvasHeight: 400 });
    expect(s.maxHeightDm).toBe(HUMAN_HEIGHT_DM);
    expect(s.pxPerDm).toBeCloseTo(400 / HUMAN_HEIGHT_DM, 2);
  });

  it("com pokemon maior que humano, ele dita a escala", () => {
    const s = computeScale([{ name: "wailord", height: 145 }], { canvasHeight: 400 });
    expect(s.maxHeightDm).toBe(145);
    expect(s.pxPerDm).toBeCloseTo(400 / 145, 4);
  });

  it("aplica piso minimo por sprite", () => {
    const s = computeScale([{ name: "wailord", height: 145 }, { name: "joltik", height: 1 }], {
      canvasHeight: 400,
    });
    const jolt = s.sizes.find((x) => x.name === "joltik")!;
    expect(jolt.px).toBeGreaterThanOrEqual(MIN_SPRITE_PX);
  });

  it("multiplos pokemons produzem varias entradas", () => {
    const s = computeScale(
      [
        { name: "a", height: 5 },
        { name: "b", height: 10 },
        { name: "c", height: 20 },
      ],
      { canvasHeight: 400 }
    );
    expect(s.sizes).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Rodar e falhar**

```bash
npx vitest run src/lib/sizeScale.test.ts
```

- [ ] **Step 3: Implementar**

```ts
// src/lib/sizeScale.ts
export const HUMAN_HEIGHT_DM = 17;
export const MIN_SPRITE_PX = 12;

export interface Input {
  name: string;
  height: number; // decimetros
}

export interface ScaledSize {
  name: string;
  heightDm: number;
  px: number;
}

export interface Scale {
  maxHeightDm: number;
  pxPerDm: number;
  humanPx: number;
  sizes: ScaledSize[];
}

export function computeScale(
  inputs: Input[],
  { canvasHeight }: { canvasHeight: number }
): Scale {
  const maxHeightDm = Math.max(HUMAN_HEIGHT_DM, ...inputs.map((i) => i.height));
  const pxPerDm = canvasHeight / maxHeightDm;
  const humanPx = HUMAN_HEIGHT_DM * pxPerDm;
  const sizes: ScaledSize[] = inputs.map((i) => ({
    name: i.name,
    heightDm: i.height,
    px: Math.max(MIN_SPRITE_PX, i.height * pxPerDm),
  }));
  return { maxHeightDm, pxPerDm, humanPx, sizes };
}
```

- [ ] **Step 4: Rodar e passar**

```bash
npx vitest run src/lib/sizeScale.test.ts
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sizeScale.ts src/lib/sizeScale.test.ts
git commit -m "feat(comparator): helper computeScale com piso minimo por sprite" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: `tamanhosParams` — URL da SizesPage

**Files:**
- Create: `src/lib/tamanhosParams.ts`
- Create: `src/lib/tamanhosParams.test.ts`

- [ ] **Step 1: Escrever teste falho**

```ts
// src/lib/tamanhosParams.test.ts
import { describe, expect, it } from "vitest";
import { parseTamanhosParams, toSearchParams } from "./tamanhosParams";

describe("parseTamanhosParams", () => {
  it("vazio devolve lista vazia", () => {
    expect(parseTamanhosParams(new URLSearchParams())).toEqual([]);
  });

  it("le lista de nomes separada por virgula", () => {
    expect(parseTamanhosParams(new URLSearchParams("p=wailord,joltik,pikachu"))).toEqual([
      "wailord",
      "joltik",
      "pikachu",
    ]);
  });

  it("normaliza para caixa baixa e remove espacos", () => {
    expect(parseTamanhosParams(new URLSearchParams("p=%20Wailord%20,%20Joltik"))).toEqual([
      "wailord",
      "joltik",
    ]);
  });

  it("limita a 6 nomes", () => {
    const p = new URLSearchParams("p=a,b,c,d,e,f,g,h");
    expect(parseTamanhosParams(p)).toHaveLength(6);
  });

  it("remove duplicatas preservando ordem", () => {
    expect(parseTamanhosParams(new URLSearchParams("p=a,b,a,c"))).toEqual(["a", "b", "c"]);
  });
});

describe("toSearchParams", () => {
  it("vazio produz string vazia", () => {
    expect(toSearchParams([]).toString()).toBe("");
  });

  it("faz ida e volta", () => {
    const s = toSearchParams(["wailord", "joltik"]);
    expect(parseTamanhosParams(s)).toEqual(["wailord", "joltik"]);
  });
});
```

- [ ] **Step 2: Rodar e falhar**

```bash
npx vitest run src/lib/tamanhosParams.test.ts
```

- [ ] **Step 3: Implementar**

```ts
// src/lib/tamanhosParams.ts
const MAX = 6;

export function parseTamanhosParams(params: URLSearchParams): string[] {
  const raw = params.get("p");
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const clean = part.trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= MAX) break;
  }
  return out;
}

export function toSearchParams(names: string[]): URLSearchParams {
  const out = new URLSearchParams();
  if (names.length > 0) out.set("p", names.slice(0, MAX).join(","));
  return out;
}
```

- [ ] **Step 4: Rodar e passar**

```bash
npx vitest run src/lib/tamanhosParams.test.ts
```
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tamanhosParams.ts src/lib/tamanhosParams.test.ts
git commit -m "feat(comparator): parse/serialize da URL /tamanhos" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 13: `SizeCanvas` — SVG de comparação

**Files:**
- Create: `src/components/SizeCanvas.tsx`
- Modify: `src/App.css` (append)

- [ ] **Step 1: Criar componente**

```tsx
// src/components/SizeCanvas.tsx
import { computeScale, HUMAN_HEIGHT_DM } from "../lib/sizeScale";
import type { Slot } from "../lib/comparatorStore";

interface Props {
  items: Slot[];
  height?: number;
}

const SizeCanvas = ({ items, height = 420 }: Props) => {
  const scale = computeScale(
    items.map((i) => ({ name: i.name, height: i.height })),
    { canvasHeight: height - 40 }
  );
  const cellW = 120;
  const humanW = 60;
  const width = humanW + items.length * cellW + 60; // 60 = régua
  const baseline = height - 20;
  const rulerX = 40;

  const meters = Math.ceil(scale.maxHeightDm / 10);

  return (
    <svg
      className="size-canvas"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Comparação de tamanho"
    >
      {/* Régua vertical */}
      <line x1={rulerX} y1={20} x2={rulerX} y2={baseline} stroke="var(--text-dim)" strokeWidth={1} />
      {Array.from({ length: meters + 1 }, (_, m) => {
        const y = baseline - m * 10 * scale.pxPerDm;
        return (
          <g key={m}>
            <line x1={rulerX - 5} y1={y} x2={rulerX + 5} y2={y} stroke="var(--text-dim)" />
            <text x={rulerX - 8} y={y + 4} fill="var(--text-dim)" fontSize={10} textAnchor="end">
              {m}m
            </text>
          </g>
        );
      })}

      {/* Baseline chão */}
      <line x1={rulerX} y1={baseline} x2={width - 10} y2={baseline} stroke="var(--text-dim)" strokeWidth={1} />

      {/* Humano 1.70m */}
      <g transform={`translate(${rulerX + 20}, ${baseline - scale.humanPx})`}>
        <rect x={0} y={0} width={humanW * 0.4} height={scale.humanPx} fill="var(--surface-2)" rx={4} />
        <text x={humanW * 0.2} y={scale.humanPx + 12} fill="var(--text-dim)" fontSize={9} textAnchor="middle">
          humano 1.70m
        </text>
      </g>

      {/* Pokémons */}
      {scale.sizes.map((s, idx) => {
        const cx = rulerX + humanW + idx * cellW + cellW / 2;
        const item = items[idx];
        const spriteSize = Math.min(cellW - 20, s.px);
        return (
          <g key={s.name}>
            <image
              href={item.sprite}
              x={cx - spriteSize / 2}
              y={baseline - s.px}
              width={spriteSize}
              height={s.px}
              preserveAspectRatio="xMidYMax meet"
              crossOrigin="anonymous"
            />
            <text x={cx} y={baseline + 14} fill="var(--text)" fontSize={11} textAnchor="middle">
              {item.name}
            </text>
            <text x={cx} y={baseline + 26} fill="var(--text-dim)" fontSize={9} textAnchor="middle">
              {(s.heightDm / 10).toFixed(1)}m
            </text>
          </g>
        );
      })}

      {scale.maxHeightDm > HUMAN_HEIGHT_DM * 3 && (
        <text x={width - 10} y={height - 4} fill="var(--text-dim)" fontSize={9} textAnchor="end">
          escala não linear abaixo de 30cm
        </text>
      )}
    </svg>
  );
};

export default SizeCanvas;
```

- [ ] **Step 2: Estilos**

Append em `src/App.css`:

```css
/* ===== SizeCanvas ===== */
.size-canvas {
  width: 100%;
  height: auto;
  background: var(--surface-1);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SizeCanvas.tsx src/App.css
git commit -m "feat(comparator): SizeCanvas SVG com regua e humano de referencia" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 14: `SizesPage` — rota `/tamanhos`

**Files:**
- Create: `src/pages/SizesPage.tsx`
- Modify: `src/App.tsx` (rota)
- Modify: `src/App.css` (append)

- [ ] **Step 1: Criar a página**

```tsx
// src/pages/SizesPage.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getPokemonData } from "../api";
import SizeCanvas from "../components/SizeCanvas";
import { add, clear, useComparator } from "../lib/comparatorStore";
import { parseTamanhosParams, toSearchParams } from "../lib/tamanhosParams";

const PRESETS: { title: string; names: string[] }[] = [
  { title: "Wailord vs Joltik", names: ["wailord", "joltik"] },
  { title: "Lendários de Kanto", names: ["articuno", "zapdos", "moltres", "mewtwo"] },
  { title: "Do menor ao maior", names: ["joltik", "pikachu", "charizard", "onix", "wailord"] },
];

const SizesPage = () => {
  const [params, setParams] = useSearchParams();
  const namesFromUrl = parseTamanhosParams(params);
  const cart = useComparator();

  // Sincroniza URL → cart no mount / F5
  useEffect(() => {
    if (namesFromUrl.length === 0 || cart.length > 0) return;
    (async () => {
      for (const n of namesFromUrl) {
        try {
          const p = await getPokemon(n);
          const sprite =
            p.sprites.other?.["official-artwork"]?.front_default ??
            p.sprites.front_default ??
            "";
          add({ name: p.name, height: p.height, sprite });
        } catch {
          // pula nomes que não existem
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza cart → URL
  useEffect(() => {
    const next = toSearchParams(cart.map((c) => c.name));
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [cart, params, setParams]);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignora
    }
  };

  const loadPreset = async (names: string[]) => {
    clear();
    for (const n of names) {
      try {
        const p = await getPokemon(n);
        const sprite =
          p.sprites.other?.["official-artwork"]?.front_default ??
          p.sprites.front_default ??
          "";
        add({ name: p.name, height: p.height, sprite });
      } catch {
        // ignora
      }
    }
  };

  // pre-fetch background para preencher React Query cache
  useQueries({
    queries: cart.map((c) => ({
      queryKey: ["pokemon", c.name],
      queryFn: () => getPokemon(c.name),
      staleTime: Infinity,
    })),
  });

  return (
    <div className="sizes-page">
      <h2>Comparador de tamanho</h2>
      {cart.length === 0 ? (
        <div className="sizes-empty">
          <p>Escolha uma comparação pra começar:</p>
          <div className="sizes-presets">
            {PRESETS.map((p) => (
              <button key={p.title} type="button" onClick={() => loadPreset(p.names)}>
                {p.title}
              </button>
            ))}
          </div>
          <p className="sizes-hint">
            Ou adicione pokémons a partir da lista clicando no botão 📏 de cada card.
          </p>
        </div>
      ) : (
        <>
          <SizeCanvas items={cart} />
          <div className="sizes-actions">
            <button type="button" onClick={share}>Copiar link</button>
            <button type="button" onClick={clear}>Limpar</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SizesPage;
```

- [ ] **Step 2: Verificar `getPokemon`**

```bash
grep -n "export.*getPokemon" src/api/pokeApi.ts
```

Se a assinatura for diferente (ex.: `fetchPokemon` ou receber id), ajustar o import e chamadas no arquivo acima.

- [ ] **Step 3: Adicionar a rota + link no App.tsx**

```tsx
import SizesPage from "./pages/SizesPage";
// dentro de <Routes>:
<Route path="/tamanhos" element={<SizesPage />} />
```

- [ ] **Step 4: Estilos**

Append em `src/App.css`:

```css
/* ===== SizesPage ===== */
.sizes-page {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}
.sizes-page h2 { margin-bottom: 16px; }
.sizes-empty {
  padding: 24px;
  background: var(--surface-1);
  border-radius: 12px;
  text-align: center;
}
.sizes-presets {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 16px 0;
}
.sizes-presets button {
  padding: 10px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
}
.sizes-presets button:hover { background: var(--accent); color: var(--bg); }
.sizes-hint { color: var(--text-dim); font-size: 0.85rem; }
.sizes-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 12px;
}
```

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/SizesPage.tsx src/App.tsx src/App.css
git commit -m "feat(comparator): pagina /tamanhos com presets e URL compartilhavel" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 15: `ComparatorButton` (FAB + modal) + link na Navbar + botão 📏 no card

**Files:**
- Create: `src/components/ComparatorButton.tsx`
- Modify: `src/App.tsx` (montar o botão global)
- Modify: `src/components/Navbar.tsx` (link "Tamanhos")
- Modify: `src/components/Card.tsx` (botão 📏)
- Modify: `src/App.css` (append)

- [ ] **Step 1: Criar `ComparatorButton.tsx`**

```tsx
// src/components/ComparatorButton.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { remove, clear, useComparator } from "../lib/comparatorStore";

const ComparatorButton = () => {
  const cart = useComparator();
  const [open, setOpen] = useState(false);
  if (cart.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className="comparator-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Comparador (${cart.length})`}
      >
        📏 <span className="comparator-fab-count">{cart.length}</span>
      </button>
      {open && (
        <div
          className="comparator-modal"
          role="dialog"
          aria-label="Carrinho de comparação"
          onClick={() => setOpen(false)}
        >
          <div className="comparator-modal-body" onClick={(e) => e.stopPropagation()}>
            <h3>No comparador ({cart.length}/6)</h3>
            <ul>
              {cart.map((c) => (
                <li key={c.name}>
                  <img src={c.sprite} alt="" width={32} height={32} />
                  <span>{c.name}</span>
                  <button type="button" onClick={() => remove(c.name)} aria-label={`Remover ${c.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="comparator-modal-actions">
              <button type="button" onClick={clear}>Limpar</button>
              <Link to="/tamanhos" onClick={() => setOpen(false)}>
                Abrir página
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComparatorButton;
```

- [ ] **Step 2: Montar globalmente em `App.tsx`**

Adicionar antes do `</BrowserRouter>` (ou onde já vive um layout fixo):

```tsx
import ComparatorButton from "./components/ComparatorButton";
// ...
<ComparatorButton />
```

- [ ] **Step 3: Adicionar link na Navbar**

Editar `src/components/Navbar.tsx` — no bloco de links, adicionar:

```tsx
<NavLink to="/tamanhos" className="nav-link">
  <span className="nav-link-full">Tamanhos</span>
  <span className="nav-link-short">📏</span>
</NavLink>
```

- [ ] **Step 4: Adicionar botão 📏 no Card**

Em `src/components/Card.tsx`, importar `add`:

```tsx
import { add } from "../lib/comparatorStore";
```

E adicionar (junto do botão de favorito):

```tsx
<button
  type="button"
  className="card-compare"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      name: pokemon.name,
      height: pokemon.height,
      sprite: artwork,
    });
  }}
  aria-label={`Adicionar ${pokemon.name} ao comparador`}
  title="Adicionar ao comparador"
>
  📏
</button>
```

- [ ] **Step 5: Estilos**

Append em `src/App.css`:

```css
/* ===== ComparatorButton (FAB + modal) ===== */
.comparator-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  min-width: 56px;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 28px;
  background: var(--accent);
  color: var(--bg);
  border: 0;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 6px;
}
.comparator-fab-count {
  background: var(--bg);
  color: var(--accent);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.85rem;
}
.comparator-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 70;
}
.comparator-modal-body {
  background: var(--surface-1);
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
}
.comparator-modal-body h3 { margin: 0 0 12px; }
.comparator-modal-body ul { list-style: none; padding: 0; margin: 0 0 12px; }
.comparator-modal-body li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.comparator-modal-body li:last-child { border-bottom: 0; }
.comparator-modal-body li span { flex: 1; }
.comparator-modal-body li button {
  background: transparent;
  border: 0;
  color: var(--text-dim);
  font-size: 1.2rem;
  cursor: pointer;
}
.comparator-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.comparator-modal-actions button,
.comparator-modal-actions a {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  text-decoration: none;
}

/* Botão 📏 no card */
.card-compare {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  cursor: pointer;
  z-index: 3;
  opacity: 0;
  transition: opacity 200ms ease;
}
.card:hover .card-compare { opacity: 1; }
@media (hover: none) {
  .card-compare { opacity: 1; }
}
```

- [ ] **Step 6: Testar tudo**

```bash
npm run dev
```

Ir num card → clicar 📏 → FAB aparece com contagem 1 → adicionar mais → clicar FAB → modal abre → "Abrir página" → `/tamanhos` renderiza a SVG.

- [ ] **Step 7: Commit**

```bash
git add src/components/ComparatorButton.tsx src/App.tsx src/components/Navbar.tsx src/components/Card.tsx src/App.css
git commit -m "feat(comparator): FAB global, modal, botao no card e link na navbar" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Fase F — Fechamento

### Task 16: Verificação final e push

- [ ] **Step 1: Typecheck / lint / testes / build**

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: todos verdes; testes ~155 (131 anteriores + ~24 novos: 3 motion + 6 comparator + 5 sprites + 4 sizeScale + 7 tamanhosParams).

- [ ] **Step 2: Auditoria manual rápida no Chrome**

```bash
npm run dev
```

Checklist:
- [ ] Home carrega; passar mouse em card → tilt + brilho holo suave.
- [ ] Passar mouse em Mewtwo (mythical) → glitter forte visível.
- [ ] Clicar num card → sprite morfa pro hero.
- [ ] Na detail, ir na cadeia de evolução → clique morfa entre etapas.
- [ ] Scrubber muda sprite por geração; toggles shiny/animado/costas funcionam.
- [ ] Clicar 📏 num card → FAB aparece → modal abre → `/tamanhos` renderiza.
- [ ] Compartilhar link (`/tamanhos?p=wailord,joltik`) → F5 restaura estado.
- [ ] Navegar Home ↔ Mapa → fade suave.

- [ ] **Step 3: Auditoria mobile 375px + reduced-motion**

DevTools → device toolbar → 375px:
- [ ] Sem tilt (hover:none).
- [ ] FAB no canto ≥44px de área.
- [ ] Navbar mostra `📏` compacto.

DevTools → Rendering → prefers-reduced-motion: reduce:
- [ ] Sem morph, sem fade, sem gradient animado no holo.

- [ ] **Step 4: Push**

```bash
git push origin master
```

- [ ] **Step 5: Commit final se algo mudou na auditoria**

```bash
git status
# se houver arquivos:
git add -A
git commit -m "chore(polish): ajustes finais pos-auditoria eixo 8" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push
```

---

## Cobertura vs Spec

| Requisito da spec | Task(s) |
|---|---|
| Feature 1 — Holo em todo card, gate por raridade | 5, 6 |
| Feature 1 — Performance (IO + rAF + pointerenter + hover:none) | 5 |
| Feature 2 — useSpriteFrames com 3 toggles | 7 |
| Feature 2 — SpriteScrubber UI | 8 |
| Feature 2 — Integração na DetailPage | 9 |
| Feature 3 — Store global via useSyncExternalStore | 10 |
| Feature 3 — SizeCanvas com humano + piso mínimo | 11, 13 |
| Feature 3 — URL sincronizada (`/tamanhos?p=…`) | 12, 14 |
| Feature 3 — SizesPage com presets | 14 |
| Feature 3 — FAB + modal + 📏 no card + link Navbar | 15 |
| Feature 4 — Wrapper `startTransition` | 1 |
| Feature 4 — Fade entre todas as rotas | 2 |
| Feature 4 — Morph card → detail | 3 |
| Feature 4 — Morph na cadeia de evolução | 4 |
| Cross-cutting — reduced-motion | 1, 5, 6, 8, 9 |
| Cross-cutting — mobile (hover:none) | 5, 6, 15 |

Nenhuma seção do spec ficou sem task correspondente.
