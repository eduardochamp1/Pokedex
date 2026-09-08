# Cardex TCG Redesign — Implementation Plan

> **STATUS: CONCLUÍDO** (redesign entregue até o commit `ce204fe`). Este
> documento fica como registro histórico — os checkboxes abaixo não foram
> marcados durante a execução. Desvios conscientes em relação ao plano:
>
> - `src/design/utilities.css` não foi criado; as utilitárias ficaram no `App.css`.
> - `src/components/EditorialCard.tsx` não foi criado; os cards editoriais são
>   classes CSS (`.editorial-card`) aplicadas direto no `LorePage`.
> - `App.css` não ficou "só com resets globais": tem ~2.400 linhas com todos os
>   estilos de página. Dividir em módulos continua sendo trabalho em aberto.
> - `useFeaturedPokemon` sorteia um lendário por mount, não "baseado na data".
> - A lore cresceu de 7 para 12 abas depois deste plano (Batalhas, Mitos,
>   Civilizações, Ovos, Itens).
>
> Correções posteriores de comportamento e performance (truncamento dos filtros,
> link do mapa, tratamento de erro, code splitting, testes, ESLint) estão no
> README e no histórico do git, não aqui.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a camada visual do Pokédex (React 18 + Vite + TS) para uma experiência TCG showroom, sem alterar APIs, hooks, rotas ou dados.

**Architecture:** Substituir `App.css` por sistema de design tokens dark-first, introduzir componentes `Card`/`CardHero` como unidade fundamental, refatorar cada página consumidora para o novo layout, adicionar hook `useReducedMotion` e nova rota `/mapa?region=X`. Nenhuma dependência nova além de Google Fonts (Space Grotesk).

**Tech Stack:** React 18, TypeScript 5, Vite 5, React Router 7, TanStack Query 5. Sem test runner ativo — verificação é `npm run build` (TS check) + inspeção visual no browser via `mcp__Claude_Browser`.

**Working directory:** `Z:/Projetos/pokedex/repo/`

**Reference spec:** `docs/superpowers/specs/2026-08-24-cardex-tcg-redesign-design.md`

**Commit identity:** todos os commits devem usar `-c user.name="eduardochamp1" -c user.email="zezouain@gmail.com"` para NÃO usar identidade Claude.

**Preview verification pattern:** o repo tem `.claude/launch.json` no PARENT (`Z:/Projetos/pokedex/.claude/launch.json`) apontando para `npm run dev` no port 3000. Use `mcp__Claude_Browser__preview_start` com `name: "pokedex-dev"` para subir; `preview_stop` no fim se necessário. Após qualquer commit, cheque também `git status` e não commite `dist/`, `.tsbuildinfo`, ou `.claude/` (já cobertos pelo `.gitignore`).

---

## File Structure

### New files
- `src/design/tokens.css` — variáveis CSS globais (nova paleta dark-first, tipografia, motion)
- `src/design/utilities.css` — classes utilitárias (aura por tipo, animações compartilhadas)
- `src/components/Card.tsx` — card 2:3 com foil, tilt, legendary shine, shiny sparkles
- `src/components/CardHero.tsx` — versão ampliada do card para o center do detail
- `src/components/TypeMatchup.tsx` — matriz de efetividade de tipos para o Comparar
- `src/components/ParticleField.tsx` — SVG de partículas para o mapa (fundo oceano)
- `src/components/EditorialCard.tsx` — card genérico usado em Regiões/Humanos/Vilões/Dimensões da lore
- `src/hooks/useReducedMotion.ts` — respeita `prefers-reduced-motion`
- `src/hooks/useTiltEffect.ts` — mouse tracking para tilt 3D
- `src/hooks/useFeaturedPokemon.ts` — pokémon rotativo baseado na data
- `src/data/typeMatchups.ts` — matriz canônica 18×18 de efetividade

### Modified files
- `src/App.css` — reescrita: importa tokens + utilities; contém só resets globais e overrides mínimos
- `src/App.tsx` — sem mudança de estrutura, só de imports (`Card`/`CardHero`)
- `src/main.tsx` — adicionar import de tokens + Google Fonts link no `index.html`
- `index.html` — `<link>` para Space Grotesk
- `src/components/Pokemon.tsx` — DELETADO (substituído por `Card.tsx`)
- `src/components/Navbar.tsx` — ajustes visuais (barra 56px, novo tratamento de nav-links)
- `src/components/Searchbar.tsx` — restilizado (input mais moderno, focus glow amarelo)
- `src/components/Pagination.tsx` — restilizado (botões redondos com estética dark)
- `src/components/TypeFilter.tsx` — vira componente sidebar-friendly
- `src/components/GenerationFilter.tsx` — vira componente sidebar-friendly
- `src/components/RarityFilter.tsx` — vira componente sidebar-friendly
- `src/components/Skeleton.tsx` — cards em 2:3 durante loading
- `src/components/SpriteViewer.tsx` — refatorado como painel de miniaturas verticais que substitui o hero
- `src/components/VarietySwitcher.tsx` — refatorado como stack de mini-cards 2:3
- `src/components/EvolutionChain.tsx` — refatorado como chain horizontal de mini-cards com setas iluminadas
- `src/components/PokemonLore.tsx` — refatorado para leitura editorial em serif itálico
- `src/components/GenealogyTree.tsx` — refatorado com linhas SVG curvas + cards nos nodes
- `src/components/WorldMap.tsx` — adicionar glow por tipo + partículas via `ParticleField`
- `src/pages/HomePage.tsx` — refatorado com featured + sidebar sticky
- `src/pages/DetailPage.tsx` — refatorado com layout de 5 painéis + FLIP animation
- `src/pages/ComparePage.tsx` — refatorado com hero cards + matriz de matchup
- `src/pages/FavoritesPage.tsx` — refatorado com título grande + grid 3 col + carimbo
- `src/pages/LorePage.tsx` — refatorado com sidebar vertical + apresentação editorial por aba
- `src/pages/MapPage.tsx` — deep-link `?region=X` + painel dossier

### Files NOT to touch
- `src/api.ts` — nenhuma mudança
- `src/hooks/{usePokemon,useFavorites,useDebounce}.ts` — nenhuma mudança
- `src/data/{lore,regions,humans,genealogy,generations,villains,dimensions,rarity,regionMap}.ts` — sem mudanças de conteúdo
- `src/types/pokemon.ts` — sem mudanças
- `src/contexts/favoritesContext.tsx` — sem mudanças
- `tsconfig*.json`, `vite.config.ts`, `package.json` — sem mudanças

---

## Fase 1 — Fundação (tokens, fonts, hooks base)

### Task 1: Criar sistema de design tokens

**Files:**
- Create: `src/design/tokens.css`

- [ ] **Step 1: Criar `src/design/tokens.css`**

```css
:root {
  /* Palco */
  --bg: #0d0e14;
  --surface-1: #1a1c25;
  --surface-2: #141520;
  --surface-3: #212433;
  --border: #2a2c37;
  --border-strong: #3a3d4d;

  /* Texto */
  --text: #f2f2f5;
  --text-muted: #a1a1a6;
  --text-dim: #6b6b70;

  /* Acentos */
  --accent: #ee1e35;
  --accent-alt: #ffcb05;
  --accent-hover: #ff3550;

  /* Sombras */
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-card-hover: 0 16px 40px rgba(0, 0, 0, 0.6);
  --shadow-hero: 0 24px 60px rgba(0, 0, 0, 0.7);

  /* Raios */
  --radius-card: 14px;
  --radius-sm: 8px;
  --radius-pill: 999px;

  /* Motion */
  --dur-fast: 120ms;
  --dur-base: 250ms;
  --dur-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);

  /* Tipos — paleta canônica (mesma do CSS antigo) */
  --t-normal:   #a8a77a;
  --t-fire:     #ee8130;
  --t-water:    #6390f0;
  --t-electric: #f7d02c;
  --t-grass:    #7ac74c;
  --t-ice:      #96d9d6;
  --t-fighting: #c22e28;
  --t-poison:   #a33ea1;
  --t-ground:   #e2bf65;
  --t-flying:   #a98ff3;
  --t-psychic:  #f95587;
  --t-bug:      #a6b91a;
  --t-rock:     #b6a136;
  --t-ghost:    #735797;
  --t-dragon:   #6f35fc;
  --t-dark:     #705746;
  --t-steel:    #b7b7ce;
  --t-fairy:    #d685ad;

  /* Fontes */
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

- [ ] **Step 2: Verificar arquivo salvo**

Run: `ls src/design/tokens.css`
Expected: caminho existe

- [ ] **Step 3: Commit**

```bash
git add src/design/tokens.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design: adiciona sistema de tokens Cardex"
```

---

### Task 2: Adicionar Google Fonts (Space Grotesk)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar preconnect + link no `<head>` de `index.html`**

Editar `index.html`, inserir logo após `<link rel="icon" ... />`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Rodar dev server e conferir se fonte carrega**

Ferramenta: `mcp__Claude_Browser__preview_start` com `name: "pokedex-dev"`.
Depois `mcp__Claude_Browser__javascript_tool` para checar:

```js
document.fonts.check('16px "Space Grotesk"')
```

Expected: `true` após ~2s.

- [ ] **Step 3: Commit**

```bash
git add index.html
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design: embed Space Grotesk via Google Fonts"
```

---

### Task 3: Criar hook `useReducedMotion`

**Files:**
- Create: `src/hooks/useReducedMotion.ts`

- [ ] **Step 1: Escrever o hook**

```ts
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReducedMotion.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(hooks): useReducedMotion respeita preferência do usuário"
```

---

### Task 4: Criar hook `useTiltEffect`

**Files:**
- Create: `src/hooks/useTiltEffect.ts`

- [ ] **Step 1: Escrever o hook**

```ts
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
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTiltEffect.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(hooks): useTiltEffect para efeito 3D em cards"
```

---

### Task 5: Criar hook `useFeaturedPokemon`

**Files:**
- Create: `src/hooks/useFeaturedPokemon.ts`

- [ ] **Step 1: Escrever o hook**

```ts
import { usePokemonDetail } from "./usePokemon";

// Determinístico por data — mesmo dia → mesmo pokémon.
// Total gen 1-9: 1025 espécies (id 1..1025).
const TOTAL_SPECIES = 1025;

function pickIdFromDate(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const seed = y * 10000 + m * 100 + d;
  return ((seed % TOTAL_SPECIES) + 1);
}

export function useFeaturedPokemon() {
  const id = pickIdFromDate(new Date());
  return usePokemonDetail(String(id));
}
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFeaturedPokemon.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(hooks): useFeaturedPokemon (rotativo por data)"
```

---

## Fase 2 — Componentes fundacionais

### Task 6: Criar componente `Card`

**Files:**
- Create: `src/components/Card.tsx`
- Modify: `src/App.css` (adiciona classes .card-* — ver Task 12 para reescrita completa)

- [ ] **Step 1: Escrever `src/components/Card.tsx`**

```tsx
import { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  variant?: "grid" | "mini";
  linkTo?: string;
  showActions?: boolean;
}

const STAT_ORDER = ["hp", "attack", "defense"] as const;

const Card = ({
  pokemon,
  variant = "grid",
  linkTo,
  showActions = true,
}: Props) => {
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltEffect(cardRef, { maxDeg: variant === "mini" ? 4 : 8 });

  const isFavorite = favoritePokemons.includes(pokemon.name);
  const isLegendary = LEGENDARY.includes(pokemon.name);
  const isMythical = MYTHICAL.includes(pokemon.name);
  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    "";

  const stats = STAT_ORDER.map((slug) => {
    const s = pokemon.stats.find((x) => x.stat.name === slug);
    return { slug, value: s?.base_stat ?? 0 };
  });

  const inner = (
    <>
      <div className="card-header">
        <div className="card-name">{pokemon.name}</div>
        <div className="card-types">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="card-type-dot"
              data-type={t.type.name}
              title={t.type.name}
            />
          ))}
        </div>
      </div>
      <div className="card-artwork">
        {artwork ? <img src={artwork} alt={pokemon.name} /> : <span>?</span>}
      </div>
      <div className="card-footer">
        <div className="card-meta-row">
          <span className="card-id">#{String(pokemon.id).padStart(3, "0")}</span>
          <span className="card-hp">
            HP <strong>{stats[0].value}</strong>
          </span>
        </div>
        {variant === "grid" && (
          <ul className="card-stats">
            {stats.slice(1).map((s) => (
              <li key={s.slug}>
                <span className="card-stat-label">{s.slug}</span>
                <span className="card-stat-bar">
                  <span
                    className="card-stat-fill"
                    style={{ width: `${Math.min(100, (s.value / 200) * 100)}%` }}
                  />
                </span>
                <span className="card-stat-value">{s.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showActions && (
        <button
          type="button"
          className="card-fav"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateFavoritePokemons(pokemon.name);
          }}
          aria-label={
            isFavorite
              ? `Remover ${pokemon.name} dos favoritos`
              : `Favoritar ${pokemon.name}`
          }
        >
          {isFavorite ? "❤️" : "🖤"}
        </button>
      )}
      {isLegendary && !isMythical && <span className="card-badge">👑</span>}
      {isMythical && <span className="card-badge">✨</span>}
    </>
  );

  const className =
    "card" +
    ` card-${variant}` +
    (isLegendary ? " is-legendary" : "") +
    (isMythical ? " is-mythical" : "") +
    (isFavorite ? " is-favorite" : "");

  return (
    <div
      ref={cardRef}
      className={className}
      data-primary-type={primaryType}
      style={{ ["--type-color" as string]: `var(--t-${primaryType})` }}
    >
      <div className="card-foil" aria-hidden="true" />
      {linkTo ? (
        <Link to={linkTo} className="card-link">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
};

export default Card;
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit (não valida visualmente ainda — CSS vem depois)**

```bash
git add src/components/Card.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(card): componente Card 2:3 com tilt e badges de raridade"
```

---

### Task 7: Criar componente `CardHero`

**Files:**
- Create: `src/components/CardHero.tsx`

- [ ] **Step 1: Escrever `src/components/CardHero.tsx`**

```tsx
import { useRef } from "react";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  spriteUrl?: string; // permite override (usado pelo SpriteViewer)
}

const CardHero = ({ pokemon, spriteUrl }: Props) => {
  const heroRef = useRef<HTMLDivElement>(null);
  useTiltEffect(heroRef, { maxDeg: 12 });

  const isLegendary = LEGENDARY.includes(pokemon.name);
  const isMythical = MYTHICAL.includes(pokemon.name);
  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const artwork =
    spriteUrl ??
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    "";

  return (
    <div
      ref={heroRef}
      className={
        "card-hero" +
        (isLegendary ? " is-legendary" : "") +
        (isMythical ? " is-mythical" : "")
      }
      data-primary-type={primaryType}
      style={{ ["--type-color" as string]: `var(--t-${primaryType})` }}
    >
      <div className="card-foil" aria-hidden="true" />
      <div className="card-header">
        <div className="card-name">{pokemon.name}</div>
        <div className="card-types">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="card-type-dot card-type-dot-lg"
              data-type={t.type.name}
              title={t.type.name}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>
      <div className="card-artwork card-artwork-hero">
        {artwork ? (
          <img src={artwork} alt={pokemon.name} key={artwork} />
        ) : (
          <span>?</span>
        )}
      </div>
      <div className="card-footer">
        <div className="card-meta-row">
          <span className="card-id">#{String(pokemon.id).padStart(3, "0")}</span>
          <span className="card-hp">
            HP <strong>{pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0}</strong>
          </span>
        </div>
      </div>
      {isLegendary && !isMythical && <span className="card-badge">👑</span>}
      {isMythical && <span className="card-badge">✨</span>}
    </div>
  );
};

export default CardHero;
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/CardHero.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(card): CardHero para uso central no detail"
```

---

### Task 8: Reescrever CSS global — reset + variáveis de tipos aplicadas

**Files:**
- Modify: `src/App.css` — reescrita completa

- [ ] **Step 1: Substituir integralmente `src/App.css`**

```css
@import "./design/tokens.css";

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root { height: 100%; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

button { font-family: inherit; cursor: pointer; border: none; background: transparent; color: inherit; }
a { color: inherit; text-decoration: none; }
input, select, textarea { font-family: inherit; }
img { display: block; max-width: 100%; }

:focus-visible {
  outline: 2px solid var(--accent-alt);
  outline-offset: 2px;
  border-radius: 4px;
}

::selection { background: var(--accent); color: white; }

/* Card base — proporção 2:3 */
.card {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--surface-1);
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--type-color, var(--border)) 30%, var(--border));
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
  transition:
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
  transform-style: preserve-3d;
  will-change: transform;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}
.card-link { display: contents; }

.card-foil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-out);
  background:
    conic-gradient(
      from calc(var(--foil-x, 50%) * 3.6deg),
      transparent 0%,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 100%
    );
  mix-blend-mode: overlay;
  border-radius: inherit;
}
.card:hover .card-foil { opacity: 1; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.card-name {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text);
  text-transform: capitalize;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}
.card-types { display: flex; gap: 4px; }
.card-type-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--type-fill, var(--text-muted));
  box-shadow: 0 0 6px var(--type-fill, transparent);
}
.card-type-dot-lg {
  width: auto;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 0.65rem;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  height: auto;
}
.card-type-dot[data-type="normal"], .card-type-dot-lg[data-type="normal"]     { --type-fill: var(--t-normal); }
.card-type-dot[data-type="fire"], .card-type-dot-lg[data-type="fire"]         { --type-fill: var(--t-fire); }
.card-type-dot[data-type="water"], .card-type-dot-lg[data-type="water"]       { --type-fill: var(--t-water); }
.card-type-dot[data-type="electric"], .card-type-dot-lg[data-type="electric"] { --type-fill: var(--t-electric); }
.card-type-dot[data-type="grass"], .card-type-dot-lg[data-type="grass"]       { --type-fill: var(--t-grass); }
.card-type-dot[data-type="ice"], .card-type-dot-lg[data-type="ice"]           { --type-fill: var(--t-ice); }
.card-type-dot[data-type="fighting"], .card-type-dot-lg[data-type="fighting"] { --type-fill: var(--t-fighting); }
.card-type-dot[data-type="poison"], .card-type-dot-lg[data-type="poison"]     { --type-fill: var(--t-poison); }
.card-type-dot[data-type="ground"], .card-type-dot-lg[data-type="ground"]     { --type-fill: var(--t-ground); }
.card-type-dot[data-type="flying"], .card-type-dot-lg[data-type="flying"]     { --type-fill: var(--t-flying); }
.card-type-dot[data-type="psychic"], .card-type-dot-lg[data-type="psychic"]   { --type-fill: var(--t-psychic); }
.card-type-dot[data-type="bug"], .card-type-dot-lg[data-type="bug"]           { --type-fill: var(--t-bug); }
.card-type-dot[data-type="rock"], .card-type-dot-lg[data-type="rock"]         { --type-fill: var(--t-rock); }
.card-type-dot[data-type="ghost"], .card-type-dot-lg[data-type="ghost"]       { --type-fill: var(--t-ghost); }
.card-type-dot[data-type="dragon"], .card-type-dot-lg[data-type="dragon"]     { --type-fill: var(--t-dragon); }
.card-type-dot[data-type="dark"], .card-type-dot-lg[data-type="dark"]         { --type-fill: var(--t-dark); }
.card-type-dot[data-type="steel"], .card-type-dot-lg[data-type="steel"]       { --type-fill: var(--t-steel); }
.card-type-dot[data-type="fairy"], .card-type-dot-lg[data-type="fairy"]       { --type-fill: var(--t-fairy); }

.card-artwork {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
      circle at center,
      color-mix(in srgb, var(--type-color) 25%, transparent) 0%,
      transparent 70%
    ),
    var(--surface-2);
  border-radius: var(--radius-sm);
  padding: 8px;
  margin: 4px 0;
}
.card-artwork img { max-width: 100%; max-height: 100%; object-fit: contain; }
.card-artwork-hero { min-height: 260px; }
.card-artwork-hero img { animation: hero-float 6s ease-in-out infinite; }
@keyframes hero-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

.card-footer { font-family: var(--font-display); font-weight: 500; }
.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}
.card-hp strong { color: var(--text); font-weight: 700; font-size: 1rem; }

.card-stats {
  list-style: none;
  display: grid;
  gap: 3px;
  margin-top: 6px;
  font-size: 0.7rem;
}
.card-stats li {
  display: grid;
  grid-template-columns: 30px 1fr 26px;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.card-stat-value {
  text-align: right;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.card-stat-bar {
  height: 4px;
  background: var(--surface-3);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.card-stat-fill {
  display: block;
  height: 100%;
  background: var(--type-color);
  border-radius: inherit;
  transition: width var(--dur-slow) var(--ease-out);
}

.card-fav {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--dur-fast) var(--ease-out);
}
.card-fav:hover { transform: scale(1.15); }

.card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
}

/* Legendary shine — borda dourada percorrendo */
.card.is-legendary,
.card-hero.is-legendary {
  border-color: transparent;
  background:
    linear-gradient(var(--surface-1), var(--surface-1)) padding-box,
    conic-gradient(from var(--shine-angle, 0deg), var(--accent-alt), #ff9d00, var(--accent-alt), transparent 60%) border-box;
  border: 2px solid transparent;
  animation: legendary-shine 4s linear infinite;
}
.card.is-mythical,
.card-hero.is-mythical {
  border-color: transparent;
  background:
    linear-gradient(var(--surface-1), var(--surface-1)) padding-box,
    conic-gradient(from var(--shine-angle, 0deg), #ff5eb0, #7fc8ff, #ff5eb0, transparent 60%) border-box;
  border: 2px solid transparent;
  animation: legendary-shine 6s linear infinite;
}
@property --shine-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
@keyframes legendary-shine { to { --shine-angle: 360deg; } }

/* CardHero base */
.card-hero {
  position: relative;
  aspect-ratio: 2 / 3;
  width: 100%;
  max-width: 420px;
  background: var(--surface-1);
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--type-color, var(--border)) 30%, var(--border));
  box-shadow: var(--shadow-hero);
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  transition: transform var(--dur-base) var(--ease-out);
  transform-style: preserve-3d;
}
.card-hero .card-name { font-size: 1.6rem; }
.card-hero .card-hp strong { font-size: 1.3rem; }
.card-hero .card-id { font-size: 1rem; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 100ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 100ms !important;
  }
  .card:hover, .card-hero:hover { transform: none !important; }
}
```

- [ ] **Step 2: Rodar build**

Run: `npm run build`
Expected: build passa sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design: reescreve App.css com tokens dark-first e card 2:3"
```

---

## Fase 3 — Home refit

### Task 9: Substituir `Pokemon.tsx` por `Card` na Home

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/components/Pokedex.tsx`
- Delete: `src/components/Pokemon.tsx`

- [ ] **Step 1: Editar `src/components/Pokedex.tsx` — trocar import**

Substituir:
```tsx
import Pokemon from "./Pokemon";
```
Por:
```tsx
import Card from "./Card";
```

E o JSX que renderiza:
```tsx
<Pokemon key={pokemon.id} pokemon={pokemon} />
```
Por:
```tsx
<Card key={pokemon.id} pokemon={pokemon} linkTo={`/pokemon/${pokemon.name}`} />
```

- [ ] **Step 2: Deletar `src/components/Pokemon.tsx`**

Run: `rm src/components/Pokemon.tsx`

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passa.

- [ ] **Step 4: Verificar visualmente**

```
mcp__Claude_Browser__preview_start name="pokedex-dev"
mcp__Claude_Browser__navigate tabId="seed" url="http://localhost:3000"
```
Depois:
```js
JSON.stringify({
  cards: document.querySelectorAll('.card').length,
  proportion: (() => { const r = document.querySelector('.card')?.getBoundingClientRect(); return r ? (r.height / r.width).toFixed(2) : null; })(),
  firstName: document.querySelector('.card-name')?.innerText,
})
```
Expected: `cards >= 20`, `proportion ≈ 1.50`, primeiro nome = "bulbasaur".

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/components/Pokedex.tsx
git rm src/components/Pokemon.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "refactor(home): substitui Pokemon por Card 2:3"
```

---

### Task 10: Featured section na Home

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.css` (adiciona `.home-featured` — patch abaixo)

- [ ] **Step 1: Adicionar CSS ao final de `src/App.css`**

```css
.home-featured {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  padding: 32px 32px 24px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}
.home-featured-copy h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 2.4rem;
  margin-bottom: 8px;
  text-transform: capitalize;
}
.home-featured-copy .home-featured-genus {
  color: var(--accent-alt);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.home-featured-copy p {
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: 12px;
  font-style: italic;
  font-family: var(--font-display);
}
@media (max-width: 900px) {
  .home-featured {
    grid-template-columns: 1fr;
    padding: 20px;
  }
  .home-featured-copy { order: 2; }
}
```

- [ ] **Step 2: Editar topo do `HomePage.tsx` para incluir featured**

Adicionar import:
```tsx
import CardHero from "../components/CardHero";
import { useFeaturedPokemon } from "../hooks/useFeaturedPokemon";
import { usePokemonSpecies } from "../hooks/usePokemon";
```

Dentro do componente, antes do `return`:
```tsx
const featured = useFeaturedPokemon();
const featuredSpecies = usePokemonSpecies(featured.data?.species.url);
```

E antes do `<div className="home-controls">` no JSX, adicionar:
```tsx
{featured.data && (
  <section className="home-featured">
    <div className="home-featured-copy">
      {featuredSpecies.data && (
        <div className="home-featured-genus">
          {featuredSpecies.data.genera.find((g) => g.language.name === "en")?.genus ?? "Pokémon"}
        </div>
      )}
      <h2>{featured.data.name}</h2>
      <div className="pokemon-type">
        {featured.data.types.map((t) => (
          <span key={t.type.name} className="card-type-dot-lg" data-type={t.type.name}>
            {t.type.name}
          </span>
        ))}
      </div>
      {featuredSpecies.data && (
        <p>
          {(featuredSpecies.data.flavor_text_entries.find((e) => e.language.name === "en")?.flavor_text ?? "")
            .replace(/[\f\n\r\v]/g, " ")}
        </p>
      )}
    </div>
    <CardHero pokemon={featured.data} />
  </section>
)}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passa.

- [ ] **Step 4: Verificar visualmente**

```js
JSON.stringify({
  hasFeatured: !!document.querySelector('.home-featured'),
  featuredName: document.querySelector('.home-featured-copy h2')?.innerText,
  hasCardHero: !!document.querySelector('.card-hero'),
})
```
Expected: os três verdadeiros/preenchidos.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(home): featured pokémon rotativo por data"
```

---

### Task 11: Sidebar sticky de filtros na Home

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.css` (adiciona `.home-layout`, `.home-sidebar`)

- [ ] **Step 1: Adicionar ao `App.css`**

```css
.home-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 0 32px 60px;
  max-width: 1200px;
  margin: 0 auto;
}
.home-sidebar {
  position: sticky;
  top: 80px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
}
.home-sidebar h3 {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 4px;
}
.home-sidebar select,
.home-sidebar input {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 0.9rem;
  transition: border-color var(--dur-fast);
}
.home-sidebar input:focus,
.home-sidebar select:focus {
  outline: none;
  border-color: var(--accent-alt);
}
@media (max-width: 900px) {
  .home-layout {
    grid-template-columns: 1fr;
    padding: 0 14px 40px;
  }
  .home-sidebar { position: static; }
}
```

- [ ] **Step 2: Envolver o grid+filtros no JSX**

No `HomePage.tsx`, envolver o conteúdo após o featured num `<div className="home-layout">`, colocando `<aside className="home-sidebar">` com o Searchbar + os 3 filtros verticalmente, e o `<Pokedex ...>` na segunda coluna.

Exemplo do JSX principal (substituir bloco atual):
```tsx
<div className="home-layout">
  <aside className="home-sidebar">
    <h3>Buscar</h3>
    <Searchbar value={searchInput} onChange={setSearchInput} />
    <h3>Tipo</h3>
    <TypeFilter value={typeFilter} onChange={onTypeChange} />
    <h3>Geração</h3>
    <GenerationFilter value={genFilter} onChange={onGenChange} />
    <h3>Raridade</h3>
    <RarityFilter value={rarityFilter} onChange={onRarityChange} />
  </aside>
  <main>
    {notFound ? (
      <div className="not-found-text">Nenhum pokémon encontrado.</div>
    ) : showInitialLoading ? (
      <CardSkeleton count={12} />
    ) : (
      <Pokedex
        pokemons={pokemons}
        loading={isFetching && pokemons.length === 0}
        page={currentPage}
        setPage={setPage}
        totalPages={totalPages}
      />
    )}
  </main>
</div>
```

Remover a `<div className="home-controls">` antiga.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passa.

- [ ] **Step 4: Verificar**

```js
JSON.stringify({
  layoutGrid: getComputedStyle(document.querySelector('.home-layout')).gridTemplateColumns,
  sidebarSticky: getComputedStyle(document.querySelector('.home-sidebar')).position,
  filterCount: document.querySelectorAll('.home-sidebar select').length,
})
```
Expected: `gridTemplateColumns` inclui `240px`, `sidebarSticky: "sticky"`, `filterCount: 3` (type, gen, rarity).

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(home): sidebar sticky com filtros verticais"
```

---

### Task 12: Navbar slim (56px) + estilo novo

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Adicionar ao `App.css`**

```css
nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.navbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}
.navbar-pokeball {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(#f5f5f7 0 50%, var(--accent) 50% 100%);
  border: 2px solid var(--text);
  position: relative;
}
.navbar-pokeball::after {
  content: "";
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--text);
}
.navbar-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}
.nav-links { display: flex; gap: 4px; }
.nav-link {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.85rem;
  transition: color var(--dur-fast), background var(--dur-fast);
}
.nav-link:hover { color: var(--text); background: var(--surface-1); }
.nav-link-active { color: var(--accent-alt); background: var(--surface-1); }

@media (max-width: 640px) {
  nav { padding: 0 14px; height: 48px; }
  .navbar-title { display: none; }
  .nav-link { padding: 6px 8px; font-size: 0.75rem; }
}
```

- [ ] **Step 2: Verificar `Navbar.tsx` já usa `.navbar-brand`, `.navbar-pokeball`, `.navbar-title`**

Se sim (deve estar da alteração anterior), nada a mudar em `Navbar.tsx`. Só validar via build.

- [ ] **Step 3: Build + preview**

Run: `npm run build`
Expected: passa.
Verificar:
```js
JSON.stringify({
  navHeight: getComputedStyle(document.querySelector('nav')).height,
  sticky: getComputedStyle(document.querySelector('nav')).position,
})
```
Expected: `navHeight: "56px"`, `sticky: "sticky"`.

- [ ] **Step 4: Commit**

```bash
git add src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(nav): navbar slim 56px sticky com blur"
```

---

### Task 13: Skeleton em cards 2:3

**Files:**
- Modify: `src/components/Skeleton.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Reescrever `src/components/Skeleton.tsx`**

```tsx
interface Props { count?: number; }

export const CardSkeleton = ({ count = 12 }: Props) => (
  <div className="card-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card card-skeleton" aria-hidden="true">
        <div className="skeleton skeleton-line skeleton-line-lg" />
        <div className="skeleton skeleton-artwork" />
        <div className="skeleton skeleton-line skeleton-line-sm" />
        <div className="skeleton skeleton-line" />
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="detail-skeleton" aria-hidden="true">
    <div className="skeleton skeleton-hero" />
  </div>
);
```

- [ ] **Step 2: Adicionar CSS**

```css
.card-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.card-skeleton { display: flex; flex-direction: column; gap: 8px; }
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 50%, var(--surface-2) 100%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-line { height: 12px; }
.skeleton-line-lg { width: 70%; height: 16px; }
.skeleton-line-sm { width: 40%; }
.skeleton-artwork { flex: 1; min-height: 140px; }
.skeleton-hero { aspect-ratio: 2 / 3; max-width: 420px; margin: 0 auto; }
.detail-skeleton { padding: 60px 20px; }
```

- [ ] **Step 3: Também atualizar `Pokedex.tsx` para usar `.card-grid`**

Substituir `<div className="pokedex-grid">` por `<div className="card-grid">` em `Pokedex.tsx`.

- [ ] **Step 4: Build + verificar**

Run: `npm run build`
Expected: passa.

- [ ] **Step 5: Commit**

```bash
git add src/components/Skeleton.tsx src/App.css src/components/Pokedex.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design: skeletons em card 2:3 e grid unificado"
```

---

## Fase 4 — Detail com 5 painéis

### Task 14: Layout de 5 painéis + FLIP animation

**Files:**
- Modify: `src/pages/DetailPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Reescrever `src/pages/DetailPage.tsx`**

```tsx
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import FavoriteContext from "../contexts/favoritesContext";
import CardHero from "../components/CardHero";
import EvolutionChain from "../components/EvolutionChain";
import SpriteViewer from "../components/SpriteViewer";
import VarietySwitcher from "../components/VarietySwitcher";
import PokemonLore from "../components/PokemonLore";
import { DetailSkeleton } from "../components/Skeleton";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atq",
  defense: "Def",
  "special-attack": "Atq Esp",
  "special-defense": "Def Esp",
  speed: "Vel",
};

const DetailPage = () => {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const navigate = useNavigate();
  const { data: pokemon, isLoading, isError } = usePokemonDetail(nameOrId);
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const species = usePokemonSpecies(pokemon?.species.url);
  const evolution = useEvolutionChain(pokemon?.species.url);
  const [spriteOverride, setSpriteOverride] = useState<string | undefined>();

  useEffect(() => setSpriteOverride(undefined), [pokemon?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && navigate(-1);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !pokemon) {
    return (
      <div className="detail-shell">
        <p>Pokémon não encontrado.</p>
        <Link to="/">← Voltar</Link>
      </div>
    );
  }

  const isFav = favoritePokemons.includes(pokemon.name);
  const total = pokemon.stats.reduce((s, x) => s + x.base_stat, 0);

  return (
    <div className="detail-shell" data-primary-type={pokemon.types[0]?.type.name}>
      <button
        type="button"
        className="detail-close"
        onClick={() => navigate(-1)}
        aria-label="Fechar"
      >
        ✕
      </button>

      <div className="detail-layout">
        {/* top-left */}
        <aside className="detail-panel detail-panel-sprites">
          <h3>Sprites</h3>
          {species.data && (
            <SpriteViewer pokemon={pokemon} onSelect={setSpriteOverride} />
          )}
        </aside>

        {/* center */}
        <div className="detail-hero-slot">
          <CardHero pokemon={pokemon} spriteUrl={spriteOverride} />
          <button
            type="button"
            className="detail-fav-btn"
            onClick={() => updateFavoritePokemons(pokemon.name)}
          >
            {isFav ? "❤️ Nos favoritos" : "🖤 Favoritar"}
          </button>
        </div>

        {/* top-right */}
        {species.data && species.data.varieties.length > 1 && (
          <aside className="detail-panel detail-panel-forms">
            <h3>Formas</h3>
            <VarietySwitcher
              varieties={species.data.varieties}
              currentName={pokemon.name}
            />
          </aside>
        )}

        {/* bottom-left */}
        <aside className="detail-panel detail-panel-evo">
          <h3>Evoluções</h3>
          {evolution.data && evolution.data.length > 0 ? (
            <EvolutionChain
              names={evolution.data}
              currentName={pokemon.name}
            />
          ) : (
            <p className="detail-muted">Sem evoluções.</p>
          )}
        </aside>

        {/* middle-right */}
        {species.data && (
          <aside className="detail-panel detail-panel-lore">
            <h3>Sobre</h3>
            <PokemonLore species={species.data} />
          </aside>
        )}

        {/* bottom-right */}
        <aside className="detail-panel detail-panel-stats">
          <h3>Status base</h3>
          <ul className="detail-stats">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                <span className="detail-stat-label">{STAT_LABELS[s.stat.name] ?? s.stat.name}</span>
                <span className="detail-stat-bar">
                  <span
                    className="detail-stat-fill"
                    style={{ width: `${Math.min(100, (s.base_stat / 200) * 100)}%` }}
                  />
                </span>
                <span className="detail-stat-value">{s.base_stat}</span>
              </li>
            ))}
            <li className="detail-stat-total">
              <span>Total</span>
              <span></span>
              <span>{total}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DetailPage;
```

- [ ] **Step 2: Adicionar CSS ao `App.css`**

```css
.detail-shell {
  position: relative;
  min-height: calc(100vh - 56px);
  padding: 40px 24px;
}
.detail-shell[data-primary-type]::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(
    circle at 50% 30%,
    color-mix(in srgb, var(--type-fill, transparent) 20%, transparent),
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}
.detail-shell[data-primary-type="normal"]   { --type-fill: var(--t-normal); }
.detail-shell[data-primary-type="fire"]     { --type-fill: var(--t-fire); }
.detail-shell[data-primary-type="water"]    { --type-fill: var(--t-water); }
.detail-shell[data-primary-type="electric"] { --type-fill: var(--t-electric); }
.detail-shell[data-primary-type="grass"]    { --type-fill: var(--t-grass); }
.detail-shell[data-primary-type="ice"]      { --type-fill: var(--t-ice); }
.detail-shell[data-primary-type="fighting"] { --type-fill: var(--t-fighting); }
.detail-shell[data-primary-type="poison"]   { --type-fill: var(--t-poison); }
.detail-shell[data-primary-type="ground"]   { --type-fill: var(--t-ground); }
.detail-shell[data-primary-type="flying"]   { --type-fill: var(--t-flying); }
.detail-shell[data-primary-type="psychic"]  { --type-fill: var(--t-psychic); }
.detail-shell[data-primary-type="bug"]      { --type-fill: var(--t-bug); }
.detail-shell[data-primary-type="rock"]     { --type-fill: var(--t-rock); }
.detail-shell[data-primary-type="ghost"]    { --type-fill: var(--t-ghost); }
.detail-shell[data-primary-type="dragon"]   { --type-fill: var(--t-dragon); }
.detail-shell[data-primary-type="dark"]     { --type-fill: var(--t-dark); }
.detail-shell[data-primary-type="steel"]    { --type-fill: var(--t-steel); }
.detail-shell[data-primary-type="fairy"]    { --type-fill: var(--t-fairy); }

.detail-close {
  position: fixed;
  top: 72px; right: 24px;
  z-index: 50;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--surface-1);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1rem;
  transition: transform var(--dur-fast), background var(--dur-fast);
}
.detail-close:hover {
  transform: scale(1.1);
  background: var(--accent);
  color: white;
}

.detail-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "sprites hero forms"
    "evo     hero lore"
    "evo     hero stats";
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.detail-panel-sprites { grid-area: sprites; }
.detail-panel-forms   { grid-area: forms; }
.detail-panel-evo     { grid-area: evo; }
.detail-panel-lore    { grid-area: lore; }
.detail-panel-stats   { grid-area: stats; }
.detail-hero-slot {
  grid-area: hero;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}
.detail-fav-btn {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  border: 1px solid var(--border);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9rem;
  transition: transform var(--dur-fast), background var(--dur-fast);
}
.detail-fav-btn:hover { background: var(--surface-3); transform: translateY(-2px); }

.detail-panel {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
}
.detail-panel h3 {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--accent-alt);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 12px;
}

.detail-stats { list-style: none; display: grid; gap: 8px; }
.detail-stats li {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}
.detail-stat-label { color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; }
.detail-stat-bar { height: 8px; background: var(--surface-3); border-radius: var(--radius-pill); overflow: hidden; }
.detail-stat-fill {
  display: block; height: 100%;
  background: linear-gradient(90deg, var(--accent-alt), var(--type-fill, var(--accent)));
  border-radius: inherit;
  transition: width var(--dur-slow) var(--ease-out);
}
.detail-stat-value { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.detail-stat-total { border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px; font-weight: 700; }
.detail-stat-total span:last-child { color: var(--accent-alt); font-size: 1rem; }

@media (max-width: 1024px) {
  .detail-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "hero    hero"
      "sprites forms"
      "evo     evo"
      "lore    lore"
      "stats   stats";
  }
}
@media (max-width: 640px) {
  .detail-layout { grid-template-columns: 1fr; grid-template-areas: "hero" "sprites" "forms" "evo" "lore" "stats"; }
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passa (`SpriteViewer` ainda usa API antiga — passa temporariamente porque `onSelect` é opcional; corrigido em Task 15).

- [ ] **Step 4: Verificar**

Rodar dev server, navegar para `/pokemon/pikachu`:
```js
JSON.stringify({
  gridAreas: [...document.querySelectorAll('.detail-panel, .detail-hero-slot')].map(e => e.className),
  hasHero: !!document.querySelector('.card-hero'),
  statsCount: document.querySelectorAll('.detail-stats li').length,
})
```
Expected: 6 áreas (sprites, hero, forms, evo, lore, stats), hero true, `statsCount: 7` (6 stats + total).

- [ ] **Step 5: Commit**

```bash
git add src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detail): layout de 5 painéis + card hero central"
```

---

### Task 15: Refatorar `SpriteViewer` para trocar sprite do hero

**Files:**
- Modify: `src/components/SpriteViewer.tsx`

- [ ] **Step 1: Reescrever para expor callback `onSelect(url)`**

```tsx
import { useMemo, useState } from "react";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  onSelect?: (url: string | undefined) => void;
}

type Mode = "static" | "shiny" | "animated" | "animated-shiny";

const MODE_LABELS: Record<Mode, string> = {
  static: "Normal",
  shiny: "Shiny ✨",
  animated: "Animado",
  "animated-shiny": "Anim. ✨",
};

const SpriteViewer = ({ pokemon, onSelect }: Props) => {
  const [mode, setMode] = useState<Mode>("static");

  const sources = useMemo(() => {
    const art = pokemon.sprites.other?.["official-artwork"];
    const show = pokemon.sprites.other?.showdown;
    return {
      static: art?.front_default ?? pokemon.sprites.front_default ?? "",
      shiny: art?.front_shiny ?? pokemon.sprites.front_shiny ?? "",
      animated: show?.front_default ?? "",
      "animated-shiny": show?.front_shiny ?? "",
    } as Record<Mode, string>;
  }, [pokemon]);

  const available: Mode[] = (Object.keys(MODE_LABELS) as Mode[]).filter((m) => !!sources[m]);

  const pick = (m: Mode) => {
    setMode(m);
    onSelect?.(m === "static" ? undefined : sources[m]);
  };

  return (
    <ul className="sprite-list">
      {available.map((m) => (
        <li key={m}>
          <button
            type="button"
            className={"sprite-btn" + (m === mode ? " active" : "")}
            onClick={() => pick(m)}
            aria-pressed={m === mode}
          >
            <img src={sources[m]} alt={MODE_LABELS[m]} />
            <span>{MODE_LABELS[m]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SpriteViewer;
```

- [ ] **Step 2: Adicionar CSS**

```css
.sprite-list { list-style: none; display: grid; gap: 8px; }
.sprite-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.sprite-btn:hover { background: var(--surface-3); }
.sprite-btn.active { border-color: var(--accent-alt); }
.sprite-btn img { width: 40px; height: 40px; object-fit: contain; }
.sprite-btn span {
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text);
}
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  spriteBtns: document.querySelectorAll('.sprite-btn').length,
  active: document.querySelector('.sprite-btn.active span')?.innerText,
})
```
Expected em Pikachu: 4 botões, active `"Normal"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/SpriteViewer.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "refactor(sprite): SpriteViewer com callback para trocar hero"
```

---

### Task 16: `VarietySwitcher` como mini-cards 2:3

**Files:**
- Modify: `src/components/VarietySwitcher.tsx`

- [ ] **Step 1: Reescrever para renderizar mini-cards**

```tsx
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { Pokemon, PokemonVariety } from "../types/pokemon";

interface Props {
  varieties: PokemonVariety[];
  currentName: string;
}

const NOTABLE = /-(mega|gmax|primal|origin|alola|galar|hisui|paldea|therian|zen|complete|blade|shield|attack|defense|speed|dawn|dusk|midnight|midday|ultra|black|white|resolute|pirouette|sky|sunshine|rainy|snowy|sunny|overcast|10|50|100)/;

function labelFor(name: string, isDefault: boolean): string {
  const parts = name.split("-").slice(1);
  if (parts.length === 0) return isDefault ? "Padrão" : name;
  return parts
    .map((w) => {
      if (w === "mega") return "Mega";
      if (w === "gmax") return "Gigantamax";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const VarietySwitcher = ({ varieties, currentName }: Props) => {
  const notable = varieties.filter((v) => v.is_default || NOTABLE.test(v.pokemon.name));
  const queries = useQueries({
    queries: notable.map((v) => ({
      queryKey: ["pokemon-detail", v.pokemon.name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) => searchPokemon(v.pokemon.name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (notable.length <= 1) return <p className="detail-muted">Sem formas alternativas.</p>;

  return (
    <ul className="variety-list">
      {notable.map((v, i) => {
        const data = queries[i].data as Pokemon | null | undefined;
        const isCurrent = v.pokemon.name === currentName;
        return (
          <li key={v.pokemon.name} className={"variety-item" + (isCurrent ? " active" : "")}>
            {data ? (
              <Card
                pokemon={data}
                variant="mini"
                linkTo={`/pokemon/${v.pokemon.name}`}
                showActions={false}
              />
            ) : (
              <Link to={`/pokemon/${v.pokemon.name}`} className="variety-fallback">
                <div className="skeleton skeleton-artwork" />
              </Link>
            )}
            <span className="variety-label">{labelFor(v.pokemon.name, v.is_default)}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default VarietySwitcher;
```

- [ ] **Step 2: Adicionar CSS**

```css
.variety-list { list-style: none; display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
.variety-item { display: flex; flex-direction: column; gap: 6px; align-items: stretch; }
.variety-item.active .card { outline: 2px solid var(--accent-alt); outline-offset: 2px; }
.variety-label {
  text-align: center;
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: capitalize;
}
.variety-fallback {
  aspect-ratio: 2 / 3;
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  display: block;
}
.card-mini { padding: 6px; }
.card-mini .card-name { font-size: 0.7rem; }
.card-mini .card-stats { display: none; }
.card-mini .card-hp strong { font-size: 0.75rem; }
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  varieties: document.querySelectorAll('.variety-item').length,
  hasMiniCard: !!document.querySelector('.card-mini'),
})
```
Expected em `/pokemon/charizard`: `varieties: 4`, `hasMiniCard: true`.

- [ ] **Step 4: Commit**

```bash
git add src/components/VarietySwitcher.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "refactor(variety): switcher com mini-cards 2:3"
```

---

### Task 17: `EvolutionChain` como chain de mini-cards conectados

**Files:**
- Modify: `src/components/EvolutionChain.tsx`

- [ ] **Step 1: Reescrever**

```tsx
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { Pokemon } from "../types/pokemon";

interface Props { names: string[]; currentName?: string; }

const EvolutionChain = ({ names, currentName }: Props) => {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-detail", name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) => searchPokemon(name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (names.length <= 1) return <p className="detail-muted">Esse pokémon não evolui.</p>;

  return (
    <div className="evo-chain">
      {queries.map((q, i) => {
        const data = q.data as Pokemon | null | undefined;
        const name = names[i];
        const isCurrent = name.toLowerCase() === currentName?.toLowerCase();
        return (
          <div key={name} className="evo-step">
            {i > 0 && <span className="evo-arrow" aria-hidden="true">→</span>}
            <div className={"evo-card-wrap" + (isCurrent ? " active" : "")}>
              {data ? (
                <Card pokemon={data} variant="mini" linkTo={`/pokemon/${name}`} showActions={false} />
              ) : (
                <Link to={`/pokemon/${name}`} className="variety-fallback" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EvolutionChain;
```

- [ ] **Step 2: CSS**

```css
.evo-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
}
.evo-step { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.evo-arrow {
  font-size: 1.4rem;
  color: var(--accent-alt);
  text-shadow: 0 0 8px var(--accent-alt);
}
.evo-card-wrap { width: 110px; }
.evo-card-wrap.active .card { outline: 2px solid var(--accent-alt); outline-offset: 2px; box-shadow: 0 0 20px color-mix(in srgb, var(--accent-alt) 30%, transparent); }
.detail-muted { color: var(--text-muted); font-size: 0.9rem; }
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  steps: document.querySelectorAll('.evo-step').length,
  arrows: document.querySelectorAll('.evo-arrow').length,
})
```
Expected em `/pokemon/bulbasaur`: `steps: 3`, `arrows: 2`.

- [ ] **Step 4: Commit**

```bash
git add src/components/EvolutionChain.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "refactor(evo): chain com mini-cards conectados por setas iluminadas"
```

---

### Task 18: `PokemonLore` — tratamento editorial serif

**Files:**
- Modify: `src/components/PokemonLore.tsx`

- [ ] **Step 1: Reescrever**

```tsx
import { Link } from "react-router-dom";
import type { PokemonSpecies } from "../types/pokemon";

interface Props { species: PokemonSpecies; }

const LANGS = ["pt-br", "pt", "en"];
function pickBest<T extends { language: { name: string } }>(entries: T[]): T | undefined {
  for (const l of LANGS) { const f = entries.find((e) => e.language.name === l); if (f) return f; }
  return entries[0];
}

const PokemonLore = ({ species }: Props) => {
  const flavor = pickBest(species.flavor_text_entries);
  const genus = pickBest(species.genera);
  const rarity: string[] = [];
  if (species.is_mythical) rarity.push("Mítico ✨");
  else if (species.is_legendary) rarity.push("Lendário 👑");
  if (species.is_baby) rarity.push("Bebê 🍼");
  const cleanFlavor = flavor?.flavor_text.replace(/[\f\n\r\v]/g, " ").replace(/\s+/g, " ").trim();

  return (
    <div className="lore-block">
      <div className="lore-tags">
        {genus && <span className="lore-tag lore-genus">{genus.genus}</span>}
        {rarity.map((r) => <span key={r} className="lore-tag lore-rarity">{r}</span>)}
        {species.habitat && (
          <span className="lore-tag lore-habitat">
            Habitat: <b>{species.habitat.name}</b>
          </span>
        )}
        <Link to={`/mapa?region=${encodeURIComponent(species.name)}`} className="lore-tag lore-region">
          ver no mapa →
        </Link>
      </div>
      {cleanFlavor && <blockquote className="lore-quote">"{cleanFlavor}"</blockquote>}
    </div>
  );
};

export default PokemonLore;
```

- [ ] **Step 2: CSS**

```css
.lore-block { display: flex; flex-direction: column; gap: 12px; }
.lore-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lore-tag {
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: var(--surface-3);
  color: var(--text-muted);
}
.lore-genus { color: var(--accent-alt); }
.lore-rarity { background: linear-gradient(90deg, var(--accent-alt), #ff9d00); color: #333; }
.lore-region { color: var(--text); background: var(--surface-2); text-decoration: none; }
.lore-region:hover { color: var(--accent-alt); }
.lore-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  padding: 12px 16px;
  border-left: 3px solid var(--accent-alt);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  tags: [...document.querySelectorAll('.lore-tag')].map(t => t.innerText.slice(0, 20)),
  hasQuote: !!document.querySelector('.lore-quote'),
})
```
Expected em `/pokemon/mewtwo`: inclui genus, "Lendário 👑", habitat, "ver no mapa →"; quote presente.

- [ ] **Step 4: Commit**

```bash
git add src/components/PokemonLore.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(lore): tratamento editorial em serif itálico"
```

---

## Fase 5 — Comparar com matchup

### Task 19: Criar dados de matchup de tipos

**Files:**
- Create: `src/data/typeMatchups.ts`

- [ ] **Step 1: Escrever tabela canônica**

```ts
export type TypeName =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

// Multiplier: linha attacker → coluna defender
const M: Record<TypeName, Partial<Record<TypeName, number>>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function attackMultiplier(attacker: TypeName, defenderTypes: TypeName[]): number {
  return defenderTypes.reduce((mult, def) => mult * (M[attacker]?.[def] ?? 1), 1);
}
```

- [ ] **Step 2: Validar TypeScript**

Run: `npm run typecheck`
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add src/data/typeMatchups.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "data: matriz canônica de efetividade de tipos"
```

---

### Task 20: Componente `TypeMatchup`

**Files:**
- Create: `src/components/TypeMatchup.tsx`

- [ ] **Step 1: Escrever**

```tsx
import { attackMultiplier, type TypeName } from "../data/typeMatchups";

interface Props {
  attacker: string[];
  defender: string[];
  side: "left" | "right";
}

function label(m: number): string {
  if (m === 0) return "sem efeito";
  if (m >= 2) return `${m}×`;
  if (m <= 0.5) return `${m}×`;
  return "1×";
}

function color(m: number): string {
  if (m === 0) return "var(--text-dim)";
  if (m >= 2) return "var(--t-grass)";
  if (m <= 0.5) return "var(--t-fire)";
  return "var(--text-muted)";
}

const TypeMatchup = ({ attacker, defender, side }: Props) => {
  return (
    <ul className={"matchup-list matchup-" + side}>
      {attacker.map((a) => {
        const m = attackMultiplier(a as TypeName, defender as TypeName[]);
        return (
          <li key={a} className="matchup-row">
            <span className="card-type-dot-lg" data-type={a}>{a}</span>
            <span className="matchup-value" style={{ color: color(m) }}>
              {label(m)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default TypeMatchup;
```

- [ ] **Step 2: CSS**

```css
.matchup-list { list-style: none; display: grid; gap: 6px; }
.matchup-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  gap: 8px;
}
.matchup-value { font-weight: 700; font-variant-numeric: tabular-nums; font-family: var(--font-display); }
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passa.

- [ ] **Step 4: Commit**

```bash
git add src/components/TypeMatchup.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(compare): componente TypeMatchup"
```

---

### Task 21: Reescrever `ComparePage`

**Files:**
- Modify: `src/pages/ComparePage.tsx`

- [ ] **Step 1: Reescrever**

```tsx
import { useState } from "react";
import CardHero from "../components/CardHero";
import TypeMatchup from "../components/TypeMatchup";
import { usePokemonDetail } from "../hooks/usePokemon";
import { useDebounce } from "../hooks/useDebounce";
import type { Pokemon } from "../types/pokemon";

const STAT_LABELS: Record<string, string> = {
  hp: "HP", attack: "Atq", defense: "Def",
  "special-attack": "Atq Esp", "special-defense": "Def Esp", speed: "Vel",
};

const totalOf = (p: Pokemon) => p.stats.reduce((s, x) => s + x.base_stat, 0);

const ComparePage = () => {
  const [left, setLeft] = useState("bulbasaur");
  const [right, setRight] = useState("charmander");
  const leftDeb = useDebounce(left.trim(), 350);
  const rightDeb = useDebounce(right.trim(), 350);
  const leftQ = usePokemonDetail(leftDeb || undefined);
  const rightQ = usePokemonDetail(rightDeb || undefined);
  const both = leftQ.data && rightQ.data ? [leftQ.data, rightQ.data] as const : null;

  const swap = () => { setLeft(right); setRight(left); };

  return (
    <div className="compare-shell">
      <h1 className="compare-title">Arena</h1>

      <div className="compare-inputs">
        <input value={left} onChange={(e) => setLeft(e.target.value)} placeholder="Pokémon 1" />
        <button type="button" className="compare-swap" onClick={swap} aria-label="Trocar posições">⇄</button>
        <input value={right} onChange={(e) => setRight(e.target.value)} placeholder="Pokémon 2" />
      </div>

      <div className="compare-arena">
        <div className="compare-slot">
          {leftQ.data && <CardHero pokemon={leftQ.data} />}
        </div>
        <div className="compare-slot">
          {rightQ.data && <CardHero pokemon={rightQ.data} />}
        </div>
      </div>

      {both && (
        <>
          <section className="compare-section">
            <h2>Status base</h2>
            <ul className="compare-stats">
              {both[0].stats.map((s, i) => {
                const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
                const lv = s.base_stat, rv = both[1].stats[i]?.base_stat ?? 0;
                const max = Math.max(lv, rv, 1);
                return (
                  <li key={s.stat.name}>
                    <span className={"compare-value left" + (lv > rv ? " winner" : "")}>{lv}</span>
                    <span className="compare-bar-wrap">
                      <span className="compare-bar left"><span style={{ width: `${(lv/max)*100}%` }} /></span>
                      <span className="compare-label">{label}</span>
                      <span className="compare-bar right"><span style={{ width: `${(rv/max)*100}%` }} /></span>
                    </span>
                    <span className={"compare-value right" + (rv > lv ? " winner" : "")}>{rv}</span>
                  </li>
                );
              })}
              <li className="compare-total-row">
                <span className={"compare-value left" + (totalOf(both[0]) > totalOf(both[1]) ? " winner" : "")}>{totalOf(both[0])}</span>
                <span className="compare-bar-wrap"><span className="compare-label compare-total-label">TOTAL</span></span>
                <span className={"compare-value right" + (totalOf(both[1]) > totalOf(both[0]) ? " winner" : "")}>{totalOf(both[1])}</span>
              </li>
            </ul>
          </section>

          <section className="compare-section">
            <h2>Efetividade</h2>
            <div className="matchup-grid">
              <div>
                <h3 className="matchup-title">{both[0].name} ataca</h3>
                <TypeMatchup
                  attacker={both[0].types.map((t) => t.type.name)}
                  defender={both[1].types.map((t) => t.type.name)}
                  side="left"
                />
              </div>
              <div>
                <h3 className="matchup-title">{both[1].name} ataca</h3>
                <TypeMatchup
                  attacker={both[1].types.map((t) => t.type.name)}
                  defender={both[0].types.map((t) => t.type.name)}
                  side="right"
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ComparePage;
```

- [ ] **Step 2: CSS**

```css
.compare-shell { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
.compare-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 24px;
  color: var(--accent-alt);
  letter-spacing: -0.02em;
}
.compare-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
.compare-inputs input {
  padding: 10px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface-1);
  color: var(--text);
  font-size: 0.95rem;
}
.compare-inputs input:focus { outline: none; border-color: var(--accent-alt); }
.compare-swap {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--surface-1);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1.2rem;
  transition: transform var(--dur-fast), background var(--dur-fast);
}
.compare-swap:hover { transform: rotate(180deg); background: var(--surface-3); }

.compare-arena { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.compare-slot { display: flex; justify-content: center; }

.compare-section { margin-top: 32px; }
.compare-section h2 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 14px;
  text-align: center;
}

.compare-stats { list-style: none; display: grid; gap: 8px; }
.compare-stats li {
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  gap: 10px;
}
.compare-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: var(--text-muted);
}
.compare-value.left { text-align: right; }
.compare-value.right { text-align: left; }
.compare-value.winner { color: var(--accent-alt); font-size: 1.05rem; }
.compare-bar-wrap { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
.compare-bar {
  height: 6px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  overflow: hidden;
  display: flex;
}
.compare-bar.left { justify-content: flex-end; }
.compare-bar span {
  display: block; height: 100%;
  transition: width var(--dur-slow) var(--ease-out);
}
.compare-bar.left span { background: linear-gradient(90deg, var(--t-water), #2f5bb0); }
.compare-bar.right span { background: linear-gradient(90deg, var(--t-fire), #b34e10); }
.compare-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  min-width: 60px;
  text-align: center;
}
.compare-total-row {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  margin-top: 6px;
}
.compare-total-label { color: var(--text); font-weight: 700; }

.matchup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.matchup-title {
  text-transform: capitalize;
  font-family: var(--font-display);
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: var(--text);
}

@media (max-width: 700px) {
  .compare-arena, .matchup-grid { grid-template-columns: 1fr; }
  .compare-inputs { grid-template-columns: 1fr auto 1fr; font-size: 0.85rem; }
}
```

- [ ] **Step 3: Build + verificar em `/comparar`**

```js
JSON.stringify({
  slots: document.querySelectorAll('.compare-slot .card-hero').length,
  hasSwap: !!document.querySelector('.compare-swap'),
  matchupRows: document.querySelectorAll('.matchup-row').length,
})
```
Expected: `slots: 2`, `hasSwap: true`, `matchupRows >= 2`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ComparePage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(compare): arena com hero cards e matriz de efetividade"
```

---

## Fase 6 — Favoritos + Lore + Mapa

### Task 22: Favoritos com carimbo e grid 3-col

**Files:**
- Modify: `src/pages/FavoritesPage.tsx`

- [ ] **Step 1: Reescrever**

```tsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useFavoritePokemons } from "../hooks/usePokemon";
import Card from "../components/Card";

const FavoritesPage = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  const { pokemons, isLoading } = useFavoritePokemons(favoritePokemons);

  if (favoritePokemons.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="favorites-empty-ghost" aria-hidden="true">?</div>
        <p>Nenhuma carta na sua coleção ainda.</p>
        <Link to="/" className="favorites-empty-cta">Explorar Pokédex →</Link>
      </div>
    );
  }

  return (
    <div className="favorites-shell">
      <header className="favorites-header">
        <h1>Sua coleção</h1>
        <span className="favorites-count">{favoritePokemons.length} {favoritePokemons.length === 1 ? "carta" : "cartas"}</span>
      </header>
      {isLoading && pokemons.length === 0 ? (
        <p>Carregando…</p>
      ) : (
        <div className="favorites-grid">
          {pokemons.map((p, idx) => (
            <div key={p.id} className="favorites-item">
              <Card pokemon={p} linkTo={`/pokemon/${p.name}`} />
              <span className="favorites-stamp">#{idx + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
```

- [ ] **Step 2: CSS**

```css
.favorites-shell { max-width: 1000px; margin: 0 auto; padding: 32px 24px 60px; }
.favorites-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.favorites-header h1 {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.favorites-count { color: var(--text-muted); font-family: var(--font-display); font-weight: 500; }
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.favorites-item { position: relative; }
.favorites-stamp {
  position: absolute;
  top: -8px; left: -8px;
  z-index: 3;
  background: var(--accent-alt);
  color: #333;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  border: 2px solid var(--bg);
}

.favorites-empty {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-muted);
}
.favorites-empty-ghost {
  width: 120px; height: 180px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-card);
  display: flex; align-items: center; justify-content: center;
  font-size: 3rem; color: var(--text-dim);
}
.favorites-empty-cta {
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: white;
  font-family: var(--font-display);
  font-weight: 600;
  text-decoration: none;
  transition: transform var(--dur-fast);
}
.favorites-empty-cta:hover { transform: translateY(-2px); }

@media (max-width: 700px) {
  .favorites-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  cards: document.querySelectorAll('.favorites-item .card').length,
  stamps: [...document.querySelectorAll('.favorites-stamp')].map(s => s.innerText),
})
```
Expected: N cards, stamps começando em `#1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/FavoritesPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(favorites): coleção pessoal com carimbo e empty state fantasma"
```

---

### Task 23: LorePage com sidebar vertical

**Files:**
- Modify: `src/pages/LorePage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Editar apenas a estrutura de `LorePage.tsx`**

Manter os `useState`, hooks e dados. Substituir a `<div className="lore-tabs">` horizontal por sidebar vertical:

```tsx
return (
  <div className="lore-shell">
    <aside className="lore-sidebar">
      <h2 className="lore-sidebar-title">Universo Pokémon</h2>
      {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
        <button
          key={t}
          className={"lore-sidebar-btn" + (tab === t ? " active" : "")}
          onClick={() => setTab(t)}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </aside>
    <main className="lore-main">
      {tab === "timeline" && (...)}
      {tab === "genealogy" && (...)}
      {/* ... resto do conteúdo idêntico ao atual ... */}
    </main>
  </div>
);
```

Remover a `<header className="lore-header">` (o título vai para a sidebar).

- [ ] **Step 2: CSS**

```css
.lore-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 56px);
}
.lore-sidebar {
  position: sticky;
  top: 80px;
  align-self: start;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lore-sidebar-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  padding: 0 12px;
  margin-bottom: 12px;
}
.lore-sidebar-btn {
  padding: 10px 12px;
  text-align: left;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: background var(--dur-fast), color var(--dur-fast);
}
.lore-sidebar-btn:hover { background: var(--surface-2); color: var(--text); }
.lore-sidebar-btn.active { background: var(--surface-3); color: var(--accent-alt); }

.lore-main { min-width: 0; }

@media (max-width: 900px) {
  .lore-shell { grid-template-columns: 1fr; }
  .lore-sidebar { position: static; flex-direction: row; overflow-x: auto; }
}
```

- [ ] **Step 3: Build + verificar**

Rodar `/lore`:
```js
JSON.stringify({
  sidebarBtns: document.querySelectorAll('.lore-sidebar-btn').length,
  activeBtn: document.querySelector('.lore-sidebar-btn.active')?.innerText,
})
```
Expected: `sidebarBtns: 7`, `activeBtn: "Cronologia"`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/LorePage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(lore): sidebar vertical no lugar de tabs horizontais"
```

---

### Task 24: `ParticleField` + glow nas regiões do mapa

**Files:**
- Create: `src/components/ParticleField.tsx`
- Modify: `src/components/WorldMap.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Criar `ParticleField.tsx`**

```tsx
interface Props { count?: number; }

const ParticleField = ({ count = 20 }: Props) => {
  // Determinístico — evita hidration mismatch e re-render
  const seed = 42;
  const particles = Array.from({ length: count }).map((_, i) => {
    const x = ((seed * (i + 1) * 37) % 1000);
    const y = ((seed * (i + 1) * 71) % 600);
    const r = ((i * 13) % 3) + 1;
    const delay = (i * 0.3).toFixed(2);
    return { x, y, r, delay };
  });
  return (
    <g className="particle-field" aria-hidden="true">
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={p.r}
          fill="white"
          className="particle"
          style={{ animationDelay: `${p.delay}s` }}
        />
      ))}
    </g>
  );
};

export default ParticleField;
```

- [ ] **Step 2: Editar `WorldMap.tsx`** — importar e renderizar dentro do SVG após o `<rect>` do oceano:

```tsx
import ParticleField from "./ParticleField";

// ... dentro do <svg>, após o rect do grid:
<ParticleField />
```

Também adicionar `filter="url(#region-glow)"` no `<path>` de cada região, e defs para o filter:

```tsx
<defs>
  {/* ... existentes ... */}
  <filter id="region-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="4" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

- [ ] **Step 3: CSS**

```css
.particle {
  opacity: 0;
  animation: particle-drift 8s ease-in-out infinite;
}
@keyframes particle-drift {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 0.6; transform: translateY(-6px); }
}
.worldmap-region path {
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--region-color) 40%, transparent));
}
```

- [ ] **Step 4: Build + verificar**

```js
JSON.stringify({
  particles: document.querySelectorAll('.particle').length,
})
```
Expected: `20`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ParticleField.tsx src/components/WorldMap.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(mapa): partículas no oceano + glow permanente nas regiões"
```

---

### Task 25: Deep-linking `/mapa?region=X`

**Files:**
- Modify: `src/pages/MapPage.tsx`

- [ ] **Step 1: Adicionar leitura de query param**

No topo do `MapPage`:

```tsx
import { useSearchParams } from "react-router-dom";

// substituir o useState de selectedId por:
const [params, setParams] = useSearchParams();
const selectedId = params.get("region") ?? undefined;
const setSelectedId = (id: string | undefined) => {
  if (id) setParams({ region: id });
  else setParams({});
};
```

- [ ] **Step 2: Build + verificar deep-link**

Navegar para `/mapa?region=kanto`:
```js
JSON.stringify({
  selectedName: document.querySelector('.mappage-detail-name')?.innerText,
  url: location.search,
})
```
Expected: `selectedName: "Kanto"`, `url: "?region=kanto"`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/MapPage.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(mapa): deep-linking via ?region=X"
```

---

### Task 26: Reskin conteúdo interno da Lore (todas as abas)

**Files:**
- Modify: `src/pages/LorePage.tsx`
- Modify: `src/components/GenealogyTree.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Timeline editorial**

No JSX de `tab === "timeline"` dentro de `LorePage.tsx`, adicionar classes novas — `.lore-event-body` já existe, aplicar novo padrão:

```tsx
<li key={event.title} className="lore-event lore-event-editorial">
  <div className="lore-event-era-mark">{era}</div>
  <div className="lore-event-body">
    <h3 className="lore-event-title">{event.title}</h3>
    <p className="lore-event-text">{event.body}</p>
    <div className="lore-event-pokemons">
      {event.pokemons.map((name) => (
        <PokemonChip
          key={name}
          name={name}
          pokemon={byName.get(name)}
          onFilter={() => setPokemonFilter(name)}
        />
      ))}
    </div>
  </div>
</li>
```

Manter `PokemonChip` como está (já usa mini card).

- [ ] **Step 2: Genealogia com linhas curvas SVG e pulsação no root**

Reescrever `src/components/GenealogyTree.tsx` para renderizar dentro de um SVG que desenha linhas curvas entre nodes. Estrutura recursiva:

```tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { GenealogyNode } from "../data/genealogy";
import type { Pokemon } from "../types/pokemon";

interface Props {
  node: GenealogyNode;
  byName: Map<string, Pokemon>;
  depth?: number;
}

const GenealogyTree = ({ node, byName, depth = 0 }: Props) => {
  const p = byName.get(node.name);
  const sprite =
    p?.sprites.other?.["official-artwork"]?.front_default ??
    p?.sprites.front_default ??
    "";
  const rootRef = useRef<HTMLDivElement>(null);
  const childrenWrapRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<string[]>([]);

  useEffect(() => {
    if (!node.children || !rootRef.current || !childrenWrapRef.current) return;
    const rootRect = rootRef.current.getBoundingClientRect();
    const parentBottom = { x: rootRect.left + rootRect.width / 2, y: rootRect.bottom };
    const childEls = childrenWrapRef.current.querySelectorAll<HTMLElement>(
      ":scope > .genealogy-node > .genealogy-card"
    );
    const paths: string[] = [];
    childEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top;
      const midY = (parentBottom.y + cy) / 2;
      paths.push(`M ${parentBottom.x} ${parentBottom.y} C ${parentBottom.x} ${midY}, ${cx} ${midY}, ${cx} ${cy}`);
    });
    setConnectors(paths);
  }, [node.children]);

  return (
    <div className={"genealogy-node depth-" + depth}>
      <div ref={rootRef} className="genealogy-card">
        <Link to={`/pokemon/${node.name}`} className="genealogy-portrait">
          {sprite ? <img src={sprite} alt={node.name} /> : <span>?</span>}
        </Link>
        <div className="genealogy-info">
          <Link to={`/pokemon/${node.name}`} className="genealogy-name">{node.name}</Link>
          <div className="genealogy-role">{node.role}</div>
          {node.note && <p className="genealogy-note">{node.note}</p>}
        </div>
        {depth === 0 && <span className="genealogy-pulse" aria-hidden="true" />}
      </div>
      {node.children && (
        <>
          <svg className="genealogy-connectors" aria-hidden="true">
            {connectors.map((d, i) => (
              <path key={i} d={d} stroke="var(--accent-alt)" strokeWidth="1.5" fill="none" opacity="0.4" />
            ))}
          </svg>
          <div ref={childrenWrapRef} className="genealogy-children">
            {node.children.map((c) => (
              <GenealogyTree key={c.name} node={c} byName={byName} depth={depth + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GenealogyTree;
```

- [ ] **Step 3: Gerações como carrossel horizontal**

No JSX de `tab === "generations"` no `LorePage.tsx`, envolver o `<ol className="gen-timeline">` num container scrollável e alterar CSS para `flex row` em vez de `grid`:

```tsx
<div className="gen-carousel-wrap">
  <ol className="gen-carousel">
    {GAME_GENERATIONS.map((g) => (
      <li key={g.id} className="gen-slide" style={{ ["--gen-color" as string]: g.color }}>
        <div className="gen-slide-year">{g.year}</div>
        <div className="gen-slide-roman">Geração {g.roman}</div>
        <div className="gen-slide-region">{g.region}</div>
        <div className="gen-games">
          {g.mainGames.map((game) => (
            <span key={game} className="gen-game-badge">{game}</span>
          ))}
        </div>
        <p className="gen-slide-fact">{g.gimmick}</p>
        <div className="lore-event-pokemons">
          {g.signature.map((name) => (
            <PokemonChip key={name} name={name} pokemon={byName.get(name)} onFilter={() => focusPokemon(name)} />
          ))}
        </div>
      </li>
    ))}
  </ol>
</div>
```

- [ ] **Step 4: Adicionar CSS para todas as mudanças acima**

```css
/* Timeline editorial */
.lore-event-editorial {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  padding: 0;
  border: none;
}
.lore-event-editorial::before { display: none; }
.lore-event-era-mark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.7rem;
  color: var(--accent-alt);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding-top: 20px;
  text-align: right;
  border-right: 2px solid var(--border);
  padding-right: 12px;
}
.lore-event-editorial .lore-event-body {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px 24px;
}
.lore-event-editorial .lore-event-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.15rem;
  margin-bottom: 10px;
}
.lore-event-editorial .lore-event-text {
  font-family: var(--font-body);
  line-height: 1.7;
  color: var(--text);
  margin-bottom: 14px;
}

/* Genealogy connectors */
.genealogy-connectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.genealogy-node { position: relative; }
.genealogy-children > .genealogy-children::before { display: none; }
.depth-0 > .genealogy-card { position: relative; }
.genealogy-pulse {
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  border: 2px solid var(--accent-alt);
  opacity: 0.5;
  animation: genealogy-pulse 3s ease-in-out infinite;
  pointer-events: none;
}
@keyframes genealogy-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.15; }
}

/* Generations carousel */
.gen-carousel-wrap {
  margin: 0 -24px;
  padding: 0 24px 8px;
}
.gen-carousel {
  list-style: none;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
}
.gen-slide {
  flex: 0 0 320px;
  scroll-snap-align: start;
  background: var(--surface-1);
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  border-top: 4px solid var(--gen-color);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gen-slide-year {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gen-color);
  font-variant-numeric: tabular-nums;
}
.gen-slide-roman {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
.gen-slide-region {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.2rem;
}
.gen-slide-fact {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.5;
}
```

- [ ] **Step 5: Build + verificar**

Rodar `/lore` e checar cada aba visualmente:
```js
JSON.stringify({
  timelineEditorial: !!document.querySelector('.lore-event-editorial'),
  genealogyPulse: !!document.querySelector('.genealogy-pulse'),
  genealogySvg: !!document.querySelector('.genealogy-connectors'),
  genCarouselSlides: document.querySelectorAll('.gen-slide').length,
})
```
Expected: `true, true, true, 9`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/LorePage.tsx src/components/GenealogyTree.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(lore): reskin editorial de cronologia, genealogia e gerações"
```

---

### Task 27: Reskin regions/humans/villains/dimensions como editorial cards

**Files:**
- Modify: `src/pages/LorePage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Uniformizar visual de todos os 4 tabs**

Nenhuma mudança de conteúdo — apenas adicionar wrapper `.lore-editorial-grid` em cada aba e adaptar CSS. Substituir as classes existentes (`regions-grid`, `humans-grid`, `villains-grid`, `dimensions-grid`) por uma nova `.editorial-grid` compartilhada; distinguir por modifier (ex `.editorial-grid--regions`).

- [ ] **Step 2: CSS**

```css
.editorial-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.editorial-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.editorial-card::before {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: var(--card-accent, var(--accent));
}
.editorial-card h2 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--card-accent, var(--accent));
  text-transform: capitalize;
}
.editorial-card .subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-style: italic;
}
.editorial-card p {
  color: var(--text);
  line-height: 1.55;
  font-size: 0.92rem;
  text-align: left;
}
.editorial-card p strong { color: var(--card-accent); }
```

- [ ] **Step 3: Manter os cards existentes intactos por dentro (region-card / human-card / villain-card / dimension-card)** — apenas adicionar a classe `.editorial-card` além delas para pegar o novo padrão base. Deixar `--card-accent` via inline style em cada card conforme já feito para `--villain-color`, `--dim-color`, etc.

- [ ] **Step 4: Build + verificar**

```js
JSON.stringify({
  editorialCards: document.querySelectorAll('.editorial-card').length,
})
```
Expected em `/lore` na aba Regiões: `9`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LorePage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(lore): unifica regions/humans/villains/dimensions como editorial cards"
```

---

### Task 28: Mapa — dossier detail panel

**Files:**
- Modify: `src/pages/MapPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Reformular o painel `.mappage-detail` já existente**

Adicionar no topo do painel o path SVG grande da região (usar `REGION_SHAPES` já disponível), assinado com "Dossier — {nome}":

```tsx
{region && shape && (
  <section className="mappage-detail" style={{ ["--region-color" as string]: shape.color }}>
    <div className="mappage-dossier-head">
      <svg viewBox="0 0 1000 600" className="mappage-dossier-map" aria-hidden="true">
        <path d={shape.path} fill={shape.color} opacity="0.9" />
      </svg>
      <div className="mappage-dossier-title">
        <span className="mappage-dossier-stamp">DOSSIER</span>
        <h2 className="mappage-detail-name">{region.name}</h2>
        <p className="mappage-detail-sub">Geração {region.generation} · {region.inspiration}</p>
      </div>
    </div>
    {/* resto do painel — pokémons, eventos, humanos, vilões — igual */}
  </section>
)}
```

- [ ] **Step 2: CSS**

```css
.mappage-dossier-head {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.mappage-dossier-map {
  width: 100%;
  height: 120px;
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--region-color) 40%, transparent));
}
.mappage-dossier-title { display: flex; flex-direction: column; gap: 4px; }
.mappage-dossier-stamp {
  display: inline-block;
  align-self: flex-start;
  background: var(--surface-3);
  border: 2px solid var(--region-color);
  color: var(--region-color);
  padding: 2px 10px;
  border-radius: 3px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  transform: rotate(-3deg);
  margin-bottom: 6px;
}
```

- [ ] **Step 3: Build + verificar**

```js
JSON.stringify({
  hasStamp: !!document.querySelector('.mappage-dossier-stamp'),
  hasMap: !!document.querySelector('.mappage-dossier-map'),
})
```
Expected após clicar em Kanto: `true, true`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MapPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "design(mapa): painel de dossier com carimbo e path grande"
```

---

## Fase 7 — Polimento

### Task 29: Auditoria de contraste AA

**Files:**
- Modify: `src/App.css` (patches conforme necessário)

- [ ] **Step 1: Rodar em cada rota principal e coletar valores de contraste**

Via browser console:
```js
(() => {
  const check = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { el: sel, color: s.color, bg: s.backgroundColor };
  };
  return JSON.stringify([
    check('.card-name'),
    check('.card-hp'),
    check('.detail-stat-label'),
    check('.nav-link'),
    check('.lore-quote'),
  ]);
})()
```

- [ ] **Step 2: Para cada par com contraste < 4.5:1, ajustar cor em `tokens.css`**

Usar https://webaim.org/resources/contrastchecker/ como referência.

- [ ] **Step 3: Commit (se houve mudança)**

```bash
git add src/design/tokens.css src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "a11y: ajusta contrastes para AA em todo o site"
```

---

### Task 30: Auditoria reduced-motion

**Files:**
- (Verificação apenas)

- [ ] **Step 1: Simular preferência via devtools browser**

```js
// Emular via CDP não é possível daqui; forçar via CSS temporariamente:
document.documentElement.style.setProperty('--force-reduce', '1');
const style = document.createElement('style');
style.textContent = `
  @media all {
    * { animation-duration: 100ms !important; transition-duration: 100ms !important; }
    .card:hover { transform: none !important; }
  }
`;
document.head.appendChild(style);
```

Navegar por todas as rotas, verificar que nenhum elemento pula ou treme.

- [ ] **Step 2: Se algum componente não respeitou, adicionar guardas explícitas com `useReducedMotion()`**

Aplica-se principalmente a `useTiltEffect` (já respeita) e animações CSS não cobertas pela regra global.

- [ ] **Step 3: Commit se aplicável**

```bash
git add [arquivos alterados]
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "a11y: aprimora respeito a prefers-reduced-motion"
```

---

### Task 31: Auditoria mobile

**Files:**
- Modify: `src/App.css` (patches responsivos)

- [ ] **Step 1: Testar em 375px de largura via `mcp__Claude_Browser__resize_window` com `preset: "mobile"`**

Navegar cada rota:
- `/` — grid deve virar 2 col; sidebar deve virar bottom-sheet ou colapsar
- `/pokemon/pikachu` — layout de painéis deve empilhar vertical (via grid-template-areas em 640px)
- `/comparar` — arena empilha vertical
- `/favoritos` — grid vira 2 col
- `/lore` — sidebar vira horizontal scroll
- `/mapa` — SVG mantém aspect-ratio

Reportar overflow horizontal:
```js
document.body.scrollWidth <= window.innerWidth ? "ok" : "OVERFLOW"
```
Expected: `"ok"` em todas as rotas.

- [ ] **Step 2: Corrigir overflow onde ocorrer**

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "responsive: aprimora layout mobile"
```

---

### Task 32: Build final + limpeza

**Files:**
- Nenhum (verificação)

- [ ] **Step 1: Rodar build de produção**

Run: `npm run build`
Expected: passa, sem warnings TS.

- [ ] **Step 2: Rodar preview local para conferência final**

Ferramenta: `mcp__Claude_Browser__preview_start name="pokedex-dev"` (dev server basta para conferência).

- [ ] **Step 3: Remover arquivos temporários e verificar `git status`**

```bash
rm -rf dist
find . -maxdepth 2 -name "*.tsbuildinfo" -delete
git status --short
```
Expected: só arquivos-fonte modificados; nada de `dist/`, `.claude/`, `*.tsbuildinfo`.

- [ ] **Step 4: Commit final se restam mudanças + push para origin**

```bash
git push origin master
```

---

## Notas gerais para o executor

- **Ordem importa** — cada fase depende da anterior (Fase 3 depende do Card criado na Fase 2; Fase 4 depende do CardHero + Card refatorados).
- **Nunca commite `.claude/`**, `dist/`, `node_modules/`, `.tsbuildinfo` — o `.gitignore` já cobre, mas verifique `git status` antes de cada commit.
- **Identidade de commit**: use SEMPRE `-c user.name="eduardochamp1" -c user.email="zezouain@gmail.com"` — nunca mencione Claude ou coautor.
- **Preview**: o dev server é iniciado via `mcp__Claude_Browser__preview_start name="pokedex-dev"`. Se port 3000 estiver ocupado por processo órfão de sessão anterior, matar via `Stop-Process -Id <pid> -Force`.
- **HMR**: mudanças em `.tsx` refletem no browser sem restart; mudanças em `App.css` também. Se algo parecer não atualizar, force reload via `mcp__Claude_Browser__navigate url="..." force=true`.
- **Falhas visuais**: se um layout parecer errado após uma mudança CSS, primeiro verifique `getComputedStyle` no elemento afetado para descartar cascata; depois, `read_page` para conferir DOM.
- **Assumir zero regressão de dados**: nenhum arquivo em `src/data/` deve ser modificado por esse plano. Se um teste visual precisar alterar conteúdo, é sinal de bug.
