# Pokédex completa, mobile e robustez — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Goal:** Fechar o buraco entre a lore (riquíssima, 13 abas, ~250 verbetes) e a Pokédex em si (hoje mostra menos que a maioria das Pokédex online), corrigir os bugs de mobile e adicionar a rede de segurança que falta.

**Architecture:** A maior parte do Tier 1 sai de dados que **já são baixados** (`abilities`, `height`, `weight`) ou de lógica que **já existe** (a matriz 18×18 em `src/data/typeMatchups.ts`). Novos painéis entram no grid de `.detail-panel` já estabelecido em `DetailPage`. Lógica pura vai para `src/lib/`, com teste, seguindo o padrão de `filters.ts` / `regionForPokemon.ts`.

**Tech Stack:** React 18, TypeScript estrito, Vite 5, React Router 7, TanStack Query 5, Vitest. Sem dependência nova em nenhuma tarefa deste plano.

**Working directory:** `Z:/Projetos/pokedex/repo/`

**Commit identity:** o repo não tem identidade configurada. Todo commit precisa de:
`git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit ...`
E toda mensagem termina com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

**Verificação:** `npm run typecheck && npm run lint && npm test && npm run build`. Para conferir no browser: `mcp__Claude_Browser__preview_start` com `name: "pokedex-dev"` (porta 3000) ou `"pokedex-preview"` (4173).

---

## Estado do repositório em 2026-09-07

- `master` = `59c045a`, sincronizado com `origin/master`. Árvore limpa.
- Branch `feat/emulador-e-revisao-geral` existe no remoto apontando para `4abbb01` (já mergeada, pode ser apagada).
- 106 testes passando em 8 arquivos.
- Entry bundle: 80 kB gzip. Lore, Mapa e Jogar são chunks lazy.

### Armadilhas já descobertas — não redescobrir

1. **Arquivo em `public/` não pode ser alvo de `import()` no fonte.** Em dev o Vite anexa `?import`, tenta transformar e responde 500 (*"It can only be referenced via HTML tags"*). `/* @vite-ignore */` não evita. Ver `src/emulator/core.ts` e o guarda em `src/emulator/core.test.ts`.
2. **`saveState`/`loadState` não funcionam na mgba-wasm 2.5.1**; use `saveStateSlot`/`loadStateSlot`, apesar do *deprecated* na tipagem.
3. **O site roda cross-origin isolated** (COOP/COEP, exigido pelas threads do emulador). Qualquer `<img>` ou `<link>` cross-origin novo precisa de `crossorigin="anonymous"`, senão é bloqueado.
4. **O FS do core é plano**: nome de ROM com subpasta faz `uploadRom` falhar sem disparar callback.
5. **Chips da lore usam `idOf` do `usePokemonIndex`**, que passa por `resolveName` — nomes amigáveis (`giratina`) não casam com o slug da API (`giratina-altered`) sem isso.
6. **O heredoc do Bash come `\\` e `\n`** em alguns casos. Para escrever arquivo com regex/escapes, use a ferramenta Write, não `cat <<EOF`.
7. **Screenshots do Browser pane falham em página longa e escura depois de scroll por JS.** Verifique por DOM (`getBoundingClientRect`, `elementFromPoint`) quando o print vier preto.

---

## Evidência da revisão (medida, não estimada)

| Achado | Medição |
|---|---|
| `abilities`, `height`, `weight` buscados e nunca renderizados | `grep` em `src/pages/DetailPage.tsx` retorna só `name`, `stats`, `types`, `varieties` |
| Matriz de tipos usada só no Comparar | `typeMatchups.ts` importado apenas por `TypeMatchup.tsx`, que só aparece em `ComparePage` |
| Condição de evolução descartada | API dá `min_level: 16`, `trigger: level-up`; `flattenEvolutionChain` devolve só `string[]` |
| Movesets ausentes | Charizard tem 131 entradas em `moves[]` com método e nível |
| Dados de espécie ignorados | `capture_rate: 45`, `base_happiness: 70`, `growth_rate: medium-slow`, `egg_groups: [monster, dragon]`, `gender_rate: 1`, `hatch_counter: 20` |
| Cries disponíveis | `cries.latest` → `.../cries/pokemon/latest/6.ogg` |
| Filtros fora da URL | `grep -c useSearchParams src/pages/HomePage.tsx` = 0 |
| Navbar não cabe no mobile | Último link "Favoritos (0)" termina em `right: 419px` com viewport de `419px`; `overflow-x: visible` |
| Listagem longe da dobra | Hero = 800px; `.card-grid` começa em 1266px = 1,4 telas |
| Alvos de toque pequenos | 29 elementos abaixo de 40px em 375px |
| Sem error boundary | `grep -rn "componentDidCatch\|ErrorBoundary" src` = 0 |
| Manifest com resíduo do scaffold | `public/manifest.json` → `"name": "Create React App Sample"` |
| CSS monolítico | `src/App.css` = 3.260 linhas |

---

## File Structure

### Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/typeDefense.ts` | Calcula o perfil defensivo (fraquezas/resistências/imunidades) a partir da matriz existente |
| `src/lib/typeDefense.test.ts` | Testes do cálculo |
| `src/lib/evolution.ts` | Traduz `evolution_details` da API em texto legível em PT-BR |
| `src/lib/evolution.test.ts` | Testes da tradução |
| `src/components/TypeDefense.tsx` | Painel "Defesas" na página de detalhe |
| `src/components/AbilityList.tsx` | Painel "Habilidades" com nome, oculta e efeito |
| `src/components/PokemonMeta.tsx` | Painel "Ficha": altura, peso, captura, felicidade, crescimento, grupos de ovo, gênero |
| `src/components/CryButton.tsx` | Botão de tocar o cry |
| `src/components/ErrorBoundary.tsx` | Boundary de classe, envolve as rotas |
| `src/hooks/useAbilities.ts` | Busca as descrições de habilidade (React Query, cache longo) |

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/types/pokemon.ts` | Adicionar `cries`, `AbilityDetail`, `EvolutionDetail`, campos de espécie |
| `src/hooks/usePokemon.ts` | `useEvolutionChain` passa a devolver nós com condição, não `string[]` |
| `src/components/EvolutionChain.tsx` | Renderizar a condição entre os cards |
| `src/pages/DetailPage.tsx` | Montar os painéis novos |
| `src/pages/HomePage.tsx` | Filtros e ordenação na URL |
| `src/components/Navbar.tsx` | Rótulos curtos + scroll horizontal no mobile |
| `src/App.tsx` | Envolver as rotas no `ErrorBoundary` |
| `src/App.css` | Estilos dos painéis novos, navbar mobile, alvos de toque |
| `public/manifest.json` | Nome, cores e ícones corretos |

---

## Fase 1 — Aproveitar o que já vem de graça

### Task 1: Ficha do pokémon (altura, peso e dados de espécie)

**Files:**
- Create: `src/components/PokemonMeta.tsx`
- Modify: `src/types/pokemon.ts`
- Modify: `src/pages/DetailPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Estender os tipos de espécie**

Em `src/types/pokemon.ts`, dentro de `interface PokemonSpecies`, adicionar:

```ts
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  /** -1 = sem gênero; 0..8 = oitavos de chance de ser fêmea. */
  gender_rate: number;
  growth_rate: { name: string; url: string } | null;
  egg_groups: { name: string; url: string }[];
```

E em `interface Pokemon`, adicionar:

```ts
  base_experience: number | null;
  cries?: { latest: string | null; legacy: string | null };
```

- [ ] **Step 2: Escrever o componente**

Criar `src/components/PokemonMeta.tsx`:

```tsx
import type { Pokemon, PokemonSpecies } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  species: PokemonSpecies | null | undefined;
}

const GROWTH_PT: Record<string, string> = {
  slow: "Lento",
  medium: "Médio",
  fast: "Rápido",
  "medium-slow": "Médio-lento",
  "slow-then-very-fast": "Lento, depois muito rápido",
  "fast-then-very-slow": "Rápido, depois muito lento",
};

const EGG_GROUP_PT: Record<string, string> = {
  monster: "Monstro",
  water1: "Água 1",
  water2: "Água 2",
  water3: "Água 3",
  bug: "Inseto",
  flying: "Voador",
  ground: "Campo",
  fairy: "Fada",
  plant: "Planta",
  "humanshape": "Humanoide",
  mineral: "Mineral",
  indeterminate: "Amorfo",
  ditto: "Ditto",
  dragon: "Dragão",
  "no-eggs": "Sem ovos",
};

/** gender_rate vem em oitavos de chance de ser fêmea; -1 = sem gênero. */
function genderText(rate: number): string {
  if (rate < 0) return "Sem gênero";
  const female = (rate / 8) * 100;
  return `${(100 - female).toFixed(1)}% ♂ · ${female.toFixed(1)}% ♀`;
}

/** A API dá decímetros e hectogramas. */
function heightText(dm: number): string {
  return `${(dm / 10).toFixed(1)} m`;
}
function weightText(hg: number): string {
  return `${(hg / 10).toFixed(1)} kg`;
}

const PokemonMeta = ({ pokemon, species }: Props) => (
  <dl className="detail-meta">
    <dt>Altura</dt>
    <dd>{heightText(pokemon.height)}</dd>
    <dt>Peso</dt>
    <dd>{weightText(pokemon.weight)}</dd>
    {pokemon.base_experience !== null && pokemon.base_experience !== undefined && (
      <>
        <dt>Exp. base</dt>
        <dd>{pokemon.base_experience}</dd>
      </>
    )}
    {species && (
      <>
        <dt>Captura</dt>
        <dd>
          {species.capture_rate}/255{" "}
          <span className="detail-meta-hint">
            ({((species.capture_rate / 255) * 100).toFixed(0)}%)
          </span>
        </dd>
        <dt>Gênero</dt>
        <dd>{genderText(species.gender_rate)}</dd>
        {species.growth_rate && (
          <>
            <dt>Crescimento</dt>
            <dd>{GROWTH_PT[species.growth_rate.name] ?? species.growth_rate.name}</dd>
          </>
        )}
        {species.egg_groups.length > 0 && (
          <>
            <dt>Grupos de ovo</dt>
            <dd>
              {species.egg_groups
                .map((g) => EGG_GROUP_PT[g.name] ?? g.name)
                .join(" · ")}
            </dd>
          </>
        )}
        {species.hatch_counter !== null && (
          <>
            <dt>Ciclos de choco</dt>
            <dd>{species.hatch_counter}</dd>
          </>
        )}
      </>
    )}
  </dl>
);

export default PokemonMeta;
```

- [ ] **Step 3: Montar o painel no DetailPage**

Em `src/pages/DetailPage.tsx`, adicionar o import:

```tsx
import PokemonMeta from "../components/PokemonMeta";
```

E inserir o painel logo antes do painel `detail-panel-stats` (linha ~130):

```tsx
        <aside className="detail-panel detail-panel-meta">
          <h3>Ficha</h3>
          <PokemonMeta pokemon={pokemon} species={species.data} />
        </aside>
```

- [ ] **Step 4: Estilo**

Anexar em `src/App.css`:

```css
/* ========= Ficha do pokémon ========= */
.detail-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  margin: 0;
  font-size: 0.8rem;
}
.detail-meta dt {
  color: var(--text-dim);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  align-self: center;
}
.detail-meta dd {
  margin: 0;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.detail-meta-hint {
  color: var(--text-dim);
}
```

- [ ] **Step 5: Verificar**

Rodar: `npm run typecheck && npm run lint && npm run build`
Esperado: os três passam sem saída de erro.

Abrir `http://localhost:3000/pokemon/charizard` e conferir: Altura 1.7 m, Peso 90.5 kg, Exp. base 240, Captura 45/255 (18%), Gênero 87.5% ♂ · 12.5% ♀, Crescimento Médio-lento, Grupos de ovo Monstro · Dragão, Ciclos 20.

- [ ] **Step 6: Commit**

```bash
git add src/components/PokemonMeta.tsx src/types/pokemon.ts src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detalhe): painel de ficha com altura, peso e dados de especie

Os campos height e weight ja vinham na resposta e eram descartados desde o
redesign TCG. capture_rate, gender_rate, growth_rate, egg_groups e
hatch_counter vinham na especie e nunca foram usados — ironico num site com
uma aba de lore inteira sobre Ovos.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Perfil defensivo (lógica pura, TDD)

**Files:**
- Create: `src/lib/typeDefense.ts`
- Create: `src/lib/typeDefense.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/typeDefense.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defenseProfile } from "./typeDefense";

describe("defenseProfile", () => {
  it("agrupa por multiplicador, do pior para o melhor", () => {
    const p = defenseProfile(["fire", "flying"]);
    // Rocha bate 2x em Fogo e 2x em Voador -> 4x
    expect(p.find((g) => g.multiplier === 4)?.types).toContain("rock");
  });

  it("acha a imunidade de tipo duplo", () => {
    // Terra nao afeta Voador
    const p = defenseProfile(["fire", "flying"]);
    expect(p.find((g) => g.multiplier === 0)?.types).toContain("ground");
  });

  it("nao inclui grupo de 1x — neutro nao e informacao", () => {
    const p = defenseProfile(["normal"]);
    expect(p.some((g) => g.multiplier === 1)).toBe(false);
  });

  it("tipo unico funciona", () => {
    const p = defenseProfile(["water"]);
    expect(p.find((g) => g.multiplier === 2)?.types.sort()).toEqual([
      "electric",
      "grass",
    ]);
  });

  it("ordena do multiplicador maior para o menor", () => {
    const p = defenseProfile(["steel", "rock"]);
    const ms = p.map((g) => g.multiplier);
    expect([...ms].sort((a, b) => b - a)).toEqual(ms);
  });

  it("lista vazia devolve vazio", () => {
    expect(defenseProfile([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Rodar: `npx vitest run src/lib/typeDefense.test.ts`
Esperado: FAIL — `Failed to resolve import "./typeDefense"`.

- [ ] **Step 3: Implementar**

Criar `src/lib/typeDefense.ts`:

```ts
import { POKEMON_TYPES } from "../hooks/usePokemon";
import { attackMultiplier, type TypeName } from "../data/typeMatchups";

export interface DefenseGroup {
  multiplier: number;
  types: TypeName[];
}

/**
 * Perfil defensivo de um pokemon: quanto cada tipo atacante causa contra a
 * combinacao dele.
 *
 * Reaproveita a matriz canonica de src/data/typeMatchups.ts, que ate agora era
 * usada so no Comparar. Nao faz request nenhum.
 *
 * O grupo de 1x fica de fora de proposito: neutro nao e informacao util numa
 * ficha, e ocuparia metade do painel.
 */
export function defenseProfile(defenderTypes: string[]): DefenseGroup[] {
  if (defenderTypes.length === 0) return [];
  const defenders = defenderTypes as TypeName[];

  const byMultiplier = new Map<number, TypeName[]>();
  for (const attacker of POKEMON_TYPES) {
    const m = attackMultiplier(attacker, defenders);
    if (m === 1) continue;
    const list = byMultiplier.get(m) ?? [];
    list.push(attacker);
    byMultiplier.set(m, list);
  }

  return [...byMultiplier.entries()]
    .map(([multiplier, types]) => ({ multiplier, types }))
    .sort((a, b) => b.multiplier - a.multiplier);
}

/** Rotulo curto do multiplicador, para badge. */
export function multiplierLabel(m: number): string {
  if (m === 0) return "imune";
  if (m === 0.25) return "¼×";
  if (m === 0.5) return "½×";
  return `${m}×`;
}
```

- [ ] **Step 4: Rodar e ver passar**

Rodar: `npx vitest run src/lib/typeDefense.test.ts`
Esperado: PASS, 6 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/typeDefense.ts src/lib/typeDefense.test.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(lib): calculo do perfil defensivo a partir da matriz existente

A matriz 18x18 de src/data/typeMatchups.ts existia desde o redesign mas era
usada so no Comparar. Zero request: o perfil sai de calculo local.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Painel de defesas na página de detalhe

**Files:**
- Create: `src/components/TypeDefense.tsx`
- Modify: `src/pages/DetailPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Escrever o componente**

Criar `src/components/TypeDefense.tsx`:

```tsx
import { defenseProfile, multiplierLabel } from "../lib/typeDefense";
import { tType } from "../data/i18n";

interface Props {
  types: string[];
}

/** Classe de cor por faixa de multiplicador. */
function toneOf(m: number): string {
  if (m === 0) return "is-immune";
  if (m > 1) return "is-weak";
  return "is-resist";
}

const TypeDefense = ({ types }: Props) => {
  const groups = defenseProfile(types);
  if (groups.length === 0) return null;

  return (
    <ul className="defense-list">
      {groups.map((g) => (
        <li key={g.multiplier} className={"defense-row " + toneOf(g.multiplier)}>
          <span className="defense-mult">{multiplierLabel(g.multiplier)}</span>
          <span className="defense-types">
            {g.types.map((t) => (
              <span key={t} className="card-type-dot-lg" data-type={t}>
                {tType(t)}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TypeDefense;
```

- [ ] **Step 2: Montar no DetailPage**

Em `src/pages/DetailPage.tsx`, adicionar o import:

```tsx
import TypeDefense from "../components/TypeDefense";
```

E inserir o painel depois do painel `detail-panel-meta` criado na Task 1:

```tsx
        <aside className="detail-panel detail-panel-defense">
          <h3>Defesas</h3>
          <TypeDefense types={pokemon.types.map((t) => t.type.name)} />
        </aside>
```

- [ ] **Step 3: Estilo**

Anexar em `src/App.css`:

```css
/* ========= Perfil defensivo ========= */
.defense-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.defense-row {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 10px;
  align-items: center;
}
.defense-mult {
  padding: 3px 0;
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.defense-row.is-weak .defense-mult {
  color: var(--t-fire);
  border-color: var(--t-fire);
}
.defense-row.is-resist .defense-mult {
  color: var(--t-grass);
  border-color: var(--t-grass);
}
.defense-row.is-immune .defense-mult {
  color: var(--text-dim);
  font-size: 0.62rem;
}
.defense-types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
```

- [ ] **Step 4: Verificar**

Rodar: `npm run typecheck && npm run lint && npm test && npm run build`

Abrir `http://localhost:3000/pokemon/charizard` e conferir a linha `4×` com **Pedra**, a `2×` com **Água** e **Elétrico**, e a `imune` com **Terra**.

- [ ] **Step 5: Commit**

```bash
git add src/components/TypeDefense.tsx src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detalhe): painel de defesas por tipo

E o dado mais consultado numa Pokedex e estava a um componente de distancia:
a matriz ja existia e o calculo e local.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Fase 2 — Um request a mais, muito contexto

### Task 4: Habilidades com descrição de efeito

**Files:**
- Create: `src/hooks/useAbilities.ts`
- Create: `src/components/AbilityList.tsx`
- Modify: `src/types/pokemon.ts`
- Modify: `src/pages/DetailPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Tipar a resposta de habilidade**

Adicionar em `src/types/pokemon.ts`:

```ts
export interface AbilityDetail {
  name: string;
  names: { name: string; language: { name: string } }[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: { name: string };
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
}
```

- [ ] **Step 2: Escrever o hook**

Criar `src/hooks/useAbilities.ts`:

```ts
import { useQueries } from "@tanstack/react-query";
import { fetchJsonPublic } from "../api";
import type { AbilityDetail, PokemonAbility } from "../types/pokemon";

const HOUR = 60 * 60 * 1000;

export interface ResolvedAbility {
  slug: string;
  isHidden: boolean;
  detail: AbilityDetail | null;
}

/**
 * Busca a descricao de cada habilidade do pokemon.
 *
 * Sao 1 a 3 requests por pokemon, cacheados por uma hora e compartilhados
 * entre pokemons que tem a mesma habilidade (a queryKey e o slug).
 */
export function useAbilities(abilities: PokemonAbility[]): {
  resolved: ResolvedAbility[];
  isLoading: boolean;
} {
  const queries = useQueries({
    queries: abilities.map((a) => ({
      queryKey: ["ability", a.ability.name],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        fetchJsonPublic<AbilityDetail>(a.ability.url, signal),
      staleTime: HOUR,
      gcTime: HOUR,
    })),
  });

  return {
    resolved: abilities.map((a, i) => ({
      slug: a.ability.name,
      isHidden: a.is_hidden,
      detail: queries[i]?.data ?? null,
    })),
    isLoading: queries.some((q) => q.isLoading),
  };
}
```

- [ ] **Step 3: Escrever o componente**

Criar `src/components/AbilityList.tsx`:

```tsx
import { useAbilities } from "../hooks/useAbilities";
import { pickLocalized } from "../lib/localize";
import type { PokemonAbility } from "../types/pokemon";

interface Props {
  abilities: PokemonAbility[];
}

/** "solar-power" -> "Solar Power" (fallback quando nao ha nome localizado). */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const AbilityList = ({ abilities }: Props) => {
  const { resolved, isLoading } = useAbilities(abilities);

  if (abilities.length === 0) {
    return <p className="detail-muted">Sem habilidades registradas.</p>;
  }

  return (
    <ul className="ability-list">
      {resolved.map((a) => {
        const nome =
          pickLocalized(a.detail?.names, (n) => n.name) || humanize(a.slug);
        const efeito = pickLocalized(
          a.detail?.effect_entries,
          (e) => e.short_effect
        );
        return (
          <li key={a.slug} className="ability-item">
            <div className="ability-head">
              <strong>{nome}</strong>
              {a.isHidden && <span className="ability-hidden">oculta</span>}
            </div>
            {efeito ? (
              <p className="ability-effect">{efeito}</p>
            ) : isLoading ? (
              <p className="ability-effect detail-muted">Carregando…</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default AbilityList;
```

> Nota: `pickLocalized` (em `src/lib/localize.ts`) já aceita `undefined` e devolve `""`, então não precisa de guarda extra.

- [ ] **Step 4: Montar no DetailPage**

Import e painel em `src/pages/DetailPage.tsx`:

```tsx
import AbilityList from "../components/AbilityList";
```

```tsx
        <aside className="detail-panel detail-panel-abilities">
          <h3>Habilidades</h3>
          <AbilityList abilities={pokemon.abilities} />
        </aside>
```

- [ ] **Step 5: Estilo**

Anexar em `src/App.css`:

```css
/* ========= Habilidades ========= */
.ability-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ability-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ability-head strong {
  font-size: 0.85rem;
}
.ability-hidden {
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--accent-alt);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ability-effect {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}
```

- [ ] **Step 6: Verificar e commitar**

Rodar: `npm run typecheck && npm run lint && npm test && npm run build`

Em `/pokemon/charizard`, conferir **Blaze** com o efeito e **Solar Power** marcada como `oculta`.

```bash
git add src/hooks/useAbilities.ts src/components/AbilityList.tsx src/types/pokemon.ts src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detalhe): habilidades com descricao de efeito

pokemon.abilities era buscado e descartado. A queryKey e o slug da
habilidade, entao o cache e compartilhado entre pokemons que a dividem.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Condições de evolução (lógica pura, TDD)

**Files:**
- Create: `src/lib/evolution.ts`
- Create: `src/lib/evolution.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/evolution.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evolutionConditionText } from "./evolution";
import type { EvolutionDetail } from "../types/pokemon";

const base: EvolutionDetail = {
  trigger: { name: "level-up", url: "" },
  min_level: null,
  item: null,
  held_item: null,
  known_move: null,
  location: null,
  min_happiness: null,
  min_affection: null,
  min_beauty: null,
  needs_overworld_rain: false,
  time_of_day: "",
  turn_upside_down: false,
  gender: null,
  trade_species: null,
};

describe("evolutionConditionText", () => {
  it("nivel simples", () => {
    expect(evolutionConditionText({ ...base, min_level: 16 })).toBe("nível 16");
  });

  it("pedra de evolucao", () => {
    expect(
      evolutionConditionText({
        ...base,
        trigger: { name: "use-item", url: "" },
        item: { name: "fire-stone", url: "" },
      })
    ).toBe("Fire Stone");
  });

  it("felicidade combina com hora do dia", () => {
    expect(
      evolutionConditionText({
        ...base,
        min_happiness: 160,
        time_of_day: "day",
      })
    ).toBe("amizade 160, de dia");
  });

  it("troca", () => {
    expect(
      evolutionConditionText({ ...base, trigger: { name: "trade", url: "" } })
    ).toBe("troca");
  });

  it("troca com item segurado", () => {
    expect(
      evolutionConditionText({
        ...base,
        trigger: { name: "trade", url: "" },
        held_item: { name: "metal-coat", url: "" },
      })
    ).toBe("troca segurando Metal Coat");
  });

  it("golpe conhecido", () => {
    expect(
      evolutionConditionText({
        ...base,
        min_level: 25,
        known_move: { name: "ancient-power", url: "" },
      })
    ).toBe("nível 25 sabendo Ancient Power");
  });

  it("caso sem nenhuma condicao legivel nao inventa texto", () => {
    expect(evolutionConditionText({ ...base })).toBe("");
  });

  it("undefined nao explode", () => {
    expect(evolutionConditionText(undefined)).toBe("");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Rodar: `npx vitest run src/lib/evolution.test.ts`
Esperado: FAIL — módulo não resolve.

- [ ] **Step 3: Tipar o `EvolutionDetail`**

Adicionar em `src/types/pokemon.ts`:

```ts
export interface EvolutionDetail {
  trigger: { name: string; url: string };
  min_level: number | null;
  item: { name: string; url: string } | null;
  held_item: { name: string; url: string } | null;
  known_move: { name: string; url: string } | null;
  location: { name: string; url: string } | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  needs_overworld_rain: boolean;
  time_of_day: string;
  turn_upside_down: boolean;
  gender: number | null;
  trade_species: { name: string; url: string } | null;
}
```

E trocar `EvolutionNode` para carregar os detalhes:

```ts
export interface EvolutionNode {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
  evolution_details: EvolutionDetail[];
}
```

- [ ] **Step 4: Implementar**

Criar `src/lib/evolution.ts`:

```ts
import type { EvolutionDetail } from "../types/pokemon";

/** "fire-stone" -> "Fire Stone" */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TIME_PT: Record<string, string> = {
  day: "de dia",
  night: "de noite",
};

/**
 * Traduz o evolution_details da API numa frase curta em PT-BR.
 *
 * A API expoe ~20 campos de condicao e quase todos vem null. Montamos so o
 * que esta preenchido e devolvemos string vazia quando nada e legivel — a UI
 * decide se esconde a legenda. Nunca inventar texto.
 */
export function evolutionConditionText(
  detail: EvolutionDetail | undefined
): string {
  if (!detail) return "";

  const trigger = detail.trigger?.name ?? "";
  const partes: string[] = [];

  if (trigger === "use-item" && detail.item) {
    partes.push(humanize(detail.item.name));
  } else if (trigger === "trade") {
    partes.push(
      detail.held_item
        ? `troca segurando ${humanize(detail.held_item.name)}`
        : "troca"
    );
  } else {
    if (detail.min_level !== null) partes.push(`nível ${detail.min_level}`);
    if (detail.min_happiness !== null) partes.push(`amizade ${detail.min_happiness}`);
    if (detail.min_affection !== null) partes.push(`afeto ${detail.min_affection}`);
    if (detail.min_beauty !== null) partes.push(`beleza ${detail.min_beauty}`);
    if (detail.held_item) partes.push(`segurando ${humanize(detail.held_item.name)}`);
    if (detail.location) partes.push(`em ${humanize(detail.location.name)}`);
    if (detail.needs_overworld_rain) partes.push("na chuva");
    if (detail.turn_upside_down) partes.push("de cabeça para baixo");
    if (detail.gender === 1) partes.push("fêmea");
    if (detail.gender === 2) partes.push("macho");
  }

  // known_move e hora do dia valem para qualquer gatilho.
  if (detail.known_move) {
    const texto = `sabendo ${humanize(detail.known_move.name)}`;
    if (partes.length > 0) return `${partes.join(", ")} ${texto}`;
    partes.push(texto);
  }
  if (detail.time_of_day && TIME_PT[detail.time_of_day]) {
    partes.push(TIME_PT[detail.time_of_day]);
  }

  return partes.join(", ");
}
```

- [ ] **Step 5: Rodar e ver passar**

Rodar: `npx vitest run src/lib/evolution.test.ts`
Esperado: PASS, 8 testes.

> Se o teste de "golpe conhecido" falhar por ordem das partes, o esperado é
> `"nível 25 sabendo Ancient Power"` — o `known_move` entra depois do join,
> sem vírgula. Conferir a ordem no código antes de mexer no teste.

- [ ] **Step 6: Commit**

```bash
git add src/lib/evolution.ts src/lib/evolution.test.ts src/types/pokemon.ts
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(lib): traduz condicao de evolucao da API para PT-BR

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Mostrar a condição na cadeia de evolução

**Files:**
- Modify: `src/hooks/usePokemon.ts`
- Modify: `src/components/EvolutionChain.tsx`
- Modify: `src/pages/DetailPage.tsx:111-121`
- Modify: `src/App.css`

- [ ] **Step 1: `useEvolutionChain` passa a devolver nós, não nomes**

Em `src/hooks/usePokemon.ts`, trocar `flattenEvolutionChain` e o hook por:

```ts
export interface EvolutionStep {
  name: string;
  /** Condicao para chegar NESTE estagio; vazio no primeiro. */
  condition: string;
}

function flattenEvolutionChain(
  node: EvolutionNode,
  condition = ""
): EvolutionStep[] {
  const steps: EvolutionStep[] = [{ name: node.species.name, condition }];
  for (const child of node.evolves_to) {
    steps.push(
      ...flattenEvolutionChain(
        child,
        evolutionConditionText(child.evolution_details?.[0])
      )
    );
  }
  return steps;
}

export function useEvolutionChain(speciesUrl: string | undefined) {
  return useQuery<EvolutionStep[]>({
    queryKey: ["evolution-chain", speciesUrl],
    queryFn: async ({ signal }) => {
      if (!speciesUrl) return [];
      const species = await fetchJsonPublic<PokemonSpecies>(speciesUrl, signal);
      if (!species) return [];
      const chain = await fetchJsonPublic<EvolutionChain>(
        species.evolution_chain.url,
        signal
      );
      if (!chain) return [];
      return flattenEvolutionChain(chain.chain);
    },
    enabled: Boolean(speciesUrl),
    staleTime: HOUR,
  });
}
```

E adicionar o import no topo do arquivo:

```ts
import { evolutionConditionText } from "../lib/evolution";
```

- [ ] **Step 2: `EvolutionChain` recebe os passos**

Em `src/components/EvolutionChain.tsx`, trocar a interface e o corpo:

```tsx
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { EvolutionStep } from "../hooks/usePokemon";
import type { Pokemon } from "../types/pokemon";

interface Props {
  steps: EvolutionStep[];
  currentName?: string;
}

const EvolutionChain = ({ steps, currentName }: Props) => {
  const queries = useQueries({
    queries: steps.map((s) => ({
      queryKey: ["pokemon-detail", s.name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        searchPokemon(s.name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (steps.length <= 1)
    return <p className="detail-muted">Esse pokémon não evolui.</p>;

  return (
    <div className="evo-chain">
      {queries.map((q, i) => {
        const data = q.data as Pokemon | null | undefined;
        const step = steps[i];
        const isCurrent =
          step.name.toLowerCase() === currentName?.toLowerCase();
        return (
          <div key={step.name} className="evo-step">
            {i > 0 && (
              <span className="evo-arrow-group" aria-hidden="true">
                <span className="evo-arrow">→</span>
                {step.condition && (
                  <span className="evo-condition">{step.condition}</span>
                )}
              </span>
            )}
            <div className={"evo-card-wrap" + (isCurrent ? " active" : "")}>
              {data ? (
                <Card
                  pokemon={data}
                  variant="mini"
                  linkTo={`/pokemon/${step.name}`}
                  showActions={false}
                />
              ) : (
                <Link to={`/pokemon/${step.name}`} className="variety-fallback" />
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

- [ ] **Step 3: Ajustar a chamada no DetailPage**

Em `src/pages/DetailPage.tsx`, trocar `names={evolution.data ?? []}` por:

```tsx
              steps={evolution.data ?? []}
```

- [ ] **Step 4: Estilo**

Anexar em `src/App.css`:

```css
/* ========= Condição de evolução ========= */
.evo-arrow-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
}
.evo-condition {
  max-width: 9ch;
  color: var(--text-dim);
  font-size: 0.6rem;
  line-height: 1.3;
  text-align: center;
}
```

- [ ] **Step 5: Verificar e commitar**

Rodar: `npm run typecheck && npm run lint && npm test && npm run build`

Conferir em `/pokemon/charmander`: entre os cards deve aparecer `nível 16` e `nível 36`. Em `/pokemon/eevee`, as pedras. Em `/pokemon/machoke`, `troca`.

```bash
git add src/hooks/usePokemon.ts src/components/EvolutionChain.tsx src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detalhe): condicao de evolucao entre os cards da cadeia

Antes: Charmeleon -> Charizard. Agora: nivel 36. O evolution_details ja vinha
na resposta e era descartado por flattenEvolutionChain.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Cry (áudio) na página de detalhe

**Files:**
- Create: `src/components/CryButton.tsx`
- Modify: `src/pages/DetailPage.tsx`
- Modify: `src/App.css`

> `cries` já foi tipado na Task 1, Step 1.

- [ ] **Step 1: Escrever o componente**

Criar `src/components/CryButton.tsx`:

```tsx
import { useRef, useState } from "react";

interface Props {
  /** URL do .ogg vindo de pokemon.cries.latest. */
  src: string | null | undefined;
  name: string;
}

/**
 * Toca o cry do pokemon.
 *
 * A URL e cross-origin (raw.githubusercontent). A pagina roda cross-origin
 * isolated (COEP require-corp), entao o crossOrigin="anonymous" e obrigatorio
 * — sem ele o audio e bloqueado sem erro visivel.
 */
const CryButton = ({ src, name }: Props) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <>
      <button
        type="button"
        className="cry-button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          el.currentTime = 0;
          void el.play().catch(() => setFailed(true));
        }}
        aria-label={`Ouvir o som de ${name}`}
        title={`Ouvir o som de ${name}`}
      >
        🔊
      </button>
      <audio
        ref={ref}
        src={src}
        crossOrigin="anonymous"
        preload="none"
        onError={() => setFailed(true)}
      />
    </>
  );
};

export default CryButton;
```

- [ ] **Step 2: Montar no DetailPage**

Import:

```tsx
import CryButton from "../components/CryButton";
```

Colocar ao lado do botão de favoritar, dentro de `.detail-hero-slot`:

```tsx
          <CryButton src={pokemon.cries?.latest} name={pokemon.name} />
```

- [ ] **Step 3: Estilo**

```css
/* ========= Botão de cry ========= */
.cry-button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  font-size: 1rem;
  transition: background var(--dur-fast), transform var(--dur-fast);
}
.cry-button:hover {
  background: var(--surface-3);
  transform: scale(1.06);
}
.cry-button:active {
  transform: scale(0.96);
}
```

- [ ] **Step 4: Verificar e commitar**

Abrir `/pokemon/pikachu`, clicar no 🔊 e confirmar que toca. Conferir no console que **não** há erro de COEP.

```bash
git add src/components/CryButton.tsx src/pages/DetailPage.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(detalhe): botao para ouvir o cry do pokemon

crossOrigin=anonymous e obrigatorio: a pagina roda cross-origin isolated por
causa do emulador, e sem ele o audio cross-origin e bloqueado em silencio.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Fase 3 — Mobile e robustez

### Task 8: Navbar que caiba no mobile

**Problema medido:** com 6 links, "Favoritos (0)" termina em `right: 419px` num viewport de `419px`. `overflow-x` é `visible`, então não há como alcançá-lo.

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Rótulo curto e contagem separada**

Em `src/components/Navbar.tsx`, trocar o link de favoritos por:

```tsx
        <NavLink
          to="/favoritos"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          <span className="nav-link-full">Favoritos</span>
          <span className="nav-link-short" aria-hidden="true">
            ♥
          </span>
          {favoritePokemons.length > 0 && (
            <span className="nav-count">{favoritePokemons.length}</span>
          )}
        </NavLink>
```

- [ ] **Step 2: Estilo — scroll horizontal e alvos de 44px**

Anexar em `src/App.css`:

```css
/* ========= Navbar responsiva ========= */
.nav-link-short {
  display: none;
}
.nav-count {
  margin-left: 5px;
  padding: 0 5px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: #fff;
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 700px) {
  /* Rolar em vez de cortar: 6 links nao cabem em 375px. */
  .nav-links {
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 auto;
    justify-content: flex-end;
  }
  .nav-links::-webkit-scrollbar {
    display: none;
  }
  .nav-link {
    flex: 0 0 auto;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .nav-link-full {
    display: none;
  }
  .nav-link-short {
    display: inline;
    font-size: 1rem;
  }
  /* Só o link de favoritos tem versão curta; os outros mantêm o texto. */
  .nav-link:not([href="/favoritos"]) .nav-link-full {
    display: inline;
  }
}
```

- [ ] **Step 3: Verificar**

No Browser pane: `resize_window` com `preset: "mobile"`, abrir `/`, e rodar:

```js
const links = document.querySelector('.nav-links');
const ultimo = [...document.querySelectorAll('.nav-link')].pop();
const r = ultimo.getBoundingClientRect();
({ alcancavel: links.scrollWidth <= links.clientWidth || getComputedStyle(links).overflowX === 'auto',
   cortado: r.right > innerWidth,
   alturaMinima: r.height })
```

Esperado: `cortado: false` **ou** `overflowX: 'auto'`, e `alturaMinima >= 44`.
Resetar depois com `preset: "desktop"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "fix(mobile): navbar de 6 links cortava o ultimo item

Medido em 375px: Favoritos terminava exatamente na borda com overflow visible,
sem como alcancar. Agora rola, o rotulo encurta e os alvos tem 44px.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Aproximar a listagem da dobra no mobile

**Problema medido:** hero de 800px; `.card-grid` começa em 1266px = 1,4 telas de scroll antes do primeiro pokémon.

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Encolher o hero no mobile**

Anexar em `src/App.css`:

```css
@media (max-width: 700px) {
  /* O hero ocupava 800px e empurrava a listagem para 1,4 telas abaixo. */
  .home-featured {
    padding: 14px;
    gap: 12px;
  }
  .home-featured .card-hero {
    max-width: 210px;
    margin: 0 auto;
  }
  .home-featured-copy h2 {
    font-size: 1.4rem;
  }
  .home-featured-copy p {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

- [ ] **Step 2: Verificar**

Em `preset: "mobile"`, abrir `/` e rodar:

```js
const grid = document.querySelector('.card-grid').getBoundingClientRect();
({ gridComecaEm: Math.round(grid.top + scrollY),
   telas: +((grid.top + scrollY)/innerHeight).toFixed(2) })
```

Esperado: `telas` abaixo de `0.9` (era `1.4`).

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "fix(mobile): hero encolhe para a listagem caber na primeira tela

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Error boundary

**Problema:** `grep -rn "componentDidCatch\|ErrorBoundary" src` = 0. Um crash de componente apaga o app inteiro — o React sugeriu isso explicitamente durante a depuração do emulador.

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Escrever o boundary**

Criar `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Impede que um erro de render derrube o app inteiro.
 *
 * Precisa ser classe: nao existe equivalente em hook para
 * getDerivedStateFromError / componentDidCatch.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro de render capturado:", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="boundary-shell" role="alert">
        <div className="boundary-code" aria-hidden="true">
          !
        </div>
        <h1>Algo quebrou nesta tela</h1>
        <p>
          O resto do site continua funcionando. Se persistir, recarregue a
          página.
        </p>
        <pre className="boundary-detail">{error.message}</pre>
        <div className="boundary-actions">
          <button
            type="button"
            className="boundary-cta"
            onClick={() => this.setState({ error: null })}
          >
            Tentar de novo
          </button>
          <a href="/">Ir para a Pokédex</a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
```

- [ ] **Step 2: Envolver as rotas**

Em `src/App.tsx`, importar e envolver o `<Suspense>`:

```tsx
import ErrorBoundary from "./components/ErrorBoundary";
```

```tsx
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* ...rotas inalteradas... */}
          </Routes>
        </Suspense>
      </ErrorBoundary>
```

- [ ] **Step 3: Estilo**

```css
/* ========= Error boundary ========= */
.boundary-shell {
  max-width: 560px;
  margin: 0 auto;
  padding: 72px 24px;
  text-align: center;
}
.boundary-code {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  color: var(--accent);
  opacity: 0.4;
}
.boundary-shell h1 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin: 12px 0 8px;
}
.boundary-shell p {
  color: var(--text-muted);
  margin-bottom: 16px;
}
.boundary-detail {
  overflow-x: auto;
  margin: 0 0 20px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-1);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.72rem;
  text-align: left;
}
.boundary-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
}
.boundary-cta {
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
}
.boundary-cta:hover {
  background: var(--accent-hover);
}
.boundary-actions a {
  color: var(--text-muted);
  font-size: 0.85rem;
}
```

- [ ] **Step 4: Provar que funciona**

Adicionar temporariamente em `src/pages/FavoritesPage.tsx`, na primeira linha do componente:

```tsx
  if (new URLSearchParams(location.search).has("boom"))
    throw new Error("teste do boundary");
```

Abrir `/favoritos?boom` e confirmar que aparece "Algo quebrou nesta tela" e que a navbar continua funcionando. **Remover as duas linhas depois.**

- [ ] **Step 5: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/App.tsx src/App.css
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat: error boundary nas rotas

Sem ele um erro de render apagava o app inteiro. Verificado com um throw
temporario: a tela de erro aparece e a navbar continua utilizavel.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Corrigir o manifest do PWA

**Problema:** `public/manifest.json` ainda tem `"name": "Create React App Sample"`, resíduo do scaffold original.

**Files:**
- Modify: `public/manifest.json`

- [ ] **Step 1: Reescrever o arquivo**

Substituir todo o conteúdo de `public/manifest.json` por:

```json
{
  "short_name": "Pokédex",
  "name": "Pokédex — lore, mapa e emulador",
  "description": "Pokédex completa em React com lore do universo, mapa-múndi e emulador GB/GBC/GBA.",
  "lang": "pt-BR",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    }
  ],
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0d0e14",
  "background_color": "#0d0e14"
}
```

> `theme_color` e `background_color` passam a ser o `--bg` do tema dark
> (`#0d0e14`). O `#ffffff` anterior fazia a splash piscar branco.

- [ ] **Step 2: Verificar e commitar**

Rodar: `npm run build`, depois abrir `/manifest.json` no preview e conferir o JSON servido.

```bash
git add public/manifest.json
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "fix: manifest ainda tinha o nome do scaffold do Create React App

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Fase 4 — Estado compartilhável

### Task 12: Filtros e ordenação na URL

**Problema:** `grep -c useSearchParams src/pages/HomePage.tsx` = 0. Não dá para compartilhar nem favoritar "fogo + gen 1", e um F5 perde tudo. `MapPage` já usa o padrão.

**Files:**
- Create: `src/lib/homeParams.ts`
- Create: `src/lib/homeParams.test.ts`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/lib/filters.ts`
- Modify: `src/components/Pokedex.tsx`

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/homeParams.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseHomeParams, toSearchParams, SORTS } from "./homeParams";

describe("parseHomeParams", () => {
  it("vazio devolve o padrao", () => {
    const p = parseHomeParams(new URLSearchParams());
    expect(p).toEqual({
      search: "",
      type: undefined,
      generation: undefined,
      rarity: undefined,
      sort: "id",
      page: 0,
    });
  });

  it("le todos os criterios", () => {
    const p = parseHomeParams(
      new URLSearchParams("q=char&tipo=fire&ger=1&rar=legendary&ord=nome&p=3")
    );
    expect(p.search).toBe("char");
    expect(p.type).toBe("fire");
    expect(p.generation).toBe(1);
    expect(p.rarity).toBe("legendary");
    expect(p.sort).toBe("nome");
    expect(p.page).toBe(2); // p=3 na URL e 1-based
  });

  it("recusa tipo que nao existe", () => {
    expect(parseHomeParams(new URLSearchParams("tipo=banana")).type).toBeUndefined();
  });

  it("recusa geracao fora de 1..9", () => {
    expect(parseHomeParams(new URLSearchParams("ger=99")).generation).toBeUndefined();
    expect(parseHomeParams(new URLSearchParams("ger=0")).generation).toBeUndefined();
  });

  it("recusa ordenacao desconhecida e cai no padrao", () => {
    expect(parseHomeParams(new URLSearchParams("ord=xyz")).sort).toBe("id");
  });

  it("pagina negativa vira zero", () => {
    expect(parseHomeParams(new URLSearchParams("p=-5")).page).toBe(0);
  });
});

describe("toSearchParams", () => {
  it("omite o que esta no padrao — URL limpa", () => {
    const s = toSearchParams({
      search: "",
      type: undefined,
      generation: undefined,
      rarity: undefined,
      sort: "id",
      page: 0,
    });
    expect(s.toString()).toBe("");
  });

  it("faz ida e volta", () => {
    const original = {
      search: "char",
      type: "fire",
      generation: 3,
      rarity: undefined,
      sort: "total" as const,
      page: 2,
    };
    expect(parseHomeParams(toSearchParams(original))).toEqual(original);
  });
});

describe("SORTS", () => {
  it("tem id como primeira opcao", () => {
    expect(SORTS[0].id).toBe("id");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Rodar: `npx vitest run src/lib/homeParams.test.ts`
Esperado: FAIL — módulo não resolve.

- [ ] **Step 3: Implementar**

Criar `src/lib/homeParams.ts`:

```ts
import { POKEMON_TYPES } from "../hooks/usePokemon";
import { RARITIES, type RarityId } from "../data/rarity";

export const SORTS = [
  { id: "id", label: "Número" },
  { id: "nome", label: "Nome" },
  { id: "total", label: "Total de status" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export interface HomeParams {
  search: string;
  type: string | undefined;
  generation: number | undefined;
  rarity: RarityId | undefined;
  sort: SortId;
  page: number;
}

const DEFAULTS: HomeParams = {
  search: "",
  type: undefined,
  generation: undefined,
  rarity: undefined,
  sort: "id",
  page: 0,
};

/**
 * Le os criterios da URL, validando cada um. Valor invalido cai no padrao em
 * vez de propagar — a URL e entrada de usuario.
 */
export function parseHomeParams(params: URLSearchParams): HomeParams {
  const type = params.get("tipo") ?? undefined;
  const validType =
    type && (POKEMON_TYPES as readonly string[]).includes(type)
      ? type
      : undefined;

  const genRaw = Number(params.get("ger"));
  const generation =
    Number.isInteger(genRaw) && genRaw >= 1 && genRaw <= 9 ? genRaw : undefined;

  const rarity = params.get("rar") ?? undefined;
  const validRarity = RARITIES.some((r) => r.id === rarity)
    ? (rarity as RarityId)
    : undefined;

  const sortRaw = params.get("ord");
  const sort = SORTS.some((s) => s.id === sortRaw)
    ? (sortRaw as SortId)
    : DEFAULTS.sort;

  const pageRaw = Number(params.get("p"));
  const page =
    Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw - 1 : 0;

  return {
    search: params.get("q") ?? "",
    type: validType,
    generation,
    rarity: validRarity,
    sort,
    page,
  };
}

/** Serializa, omitindo o que esta no padrao para a URL nao encher de lixo. */
export function toSearchParams(p: HomeParams): URLSearchParams {
  const out = new URLSearchParams();
  if (p.search) out.set("q", p.search);
  if (p.type) out.set("tipo", p.type);
  if (p.generation) out.set("ger", String(p.generation));
  if (p.rarity) out.set("rar", p.rarity);
  if (p.sort !== DEFAULTS.sort) out.set("ord", p.sort);
  if (p.page > 0) out.set("p", String(p.page + 1));
  return out;
}
```

- [ ] **Step 4: Rodar e ver passar**

Rodar: `npx vitest run src/lib/homeParams.test.ts`
Esperado: PASS, 10 testes.

- [ ] **Step 5: Adicionar a ordenação em `filters.ts`**

Anexar em `src/lib/filters.ts`:

```ts
/** Ordena nomes alfabeticamente (para o modo de ordenacao "nome"). */
export function sortNamesAlphabetically(names: string[]): string[] {
  return [...names].sort((a, b) => a.localeCompare(b));
}
```

E adicionar o teste correspondente em `src/lib/filters.test.ts`:

```ts
describe("sortNamesAlphabetically", () => {
  it("ordena por nome", () => {
    expect(sortNamesAlphabetically(["pikachu", "abra", "mew"])).toEqual([
      "abra",
      "mew",
      "pikachu",
    ]);
  });

  it("nao muta a entrada", () => {
    const input = ["b", "a"];
    sortNamesAlphabetically(input);
    expect(input).toEqual(["b", "a"]);
  });
});
```

Atualizar o import no topo do arquivo de teste para incluir `sortNamesAlphabetically`.

- [ ] **Step 6: Ligar no HomePage**

Em `src/pages/HomePage.tsx`, trocar os seis `useState` de critério por `useSearchParams`:

```tsx
import { useSearchParams } from "react-router-dom";
import { parseHomeParams, toSearchParams, SORTS } from "../lib/homeParams";
import { sortNamesAlphabetically } from "../lib/filters";
```

```tsx
  const [params, setParams] = useSearchParams();
  const current = parseHomeParams(params);

  /** Aplica uma mudanca parcial; qualquer criterio novo volta para a pagina 1. */
  const update = (patch: Partial<typeof current>) => {
    const next = { ...current, ...patch };
    if (!("page" in patch)) next.page = 0;
    setParams(toSearchParams(next), { replace: true });
  };

  const [searchInput, setSearchInput] = useState(current.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  // O input e local (para nao reescrever a URL a cada tecla); o valor
  // debounced e que vai para a URL.
  useEffect(() => {
    if (debouncedSearch !== current.search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);
```

Trocar as chamadas de filtro para usar `update`:
- `onChange={setTypeFilter}` → `onChange={(v) => update({ type: v })}`
- `onChange={setGenFilter}` → `onChange={(v) => update({ generation: v })}`
- `onChange={setRarityFilter}` → `onChange={(v) => update({ rarity: v })}`
- `setPage={setPage}` → `setPage={(p) => update({ page: p })}`

E passar `current.type`, `current.generation`, `current.rarity`, `current.page` no lugar das variáveis de estado antigas.

Aplicar a ordenação sobre `selection.names` antes de paginar:

```tsx
  const orderedNames = useMemo(() => {
    if (!selection.names) return null;
    if (current.sort === "nome") return sortNamesAlphabetically(selection.names);
    // "id" ja vem ordenado por id de usePokemonSelection.
    // "total" precisa dos detalhes, entao ordena a pagina em usePokemonPage.
    return selection.names;
  }, [selection.names, current.sort]);

  const selected = usePokemonPage(orderedNames, current.page);
```

- [ ] **Step 7: Adicionar o seletor de ordenação na sidebar**

Depois do `RarityFilter` em `src/pages/HomePage.tsx`:

```tsx
          <h3>Ordenar</h3>
          <div className="type-filter">
            <label htmlFor="sort-select">Ordem:</label>
            <select
              id="sort-select"
              value={current.sort}
              onChange={(e) => update({ sort: e.target.value as typeof current.sort })}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
```

> **Escopo:** a ordenação por `total` de status exige os detalhes da página
> inteira e não cabe nesta task. Se `SORTS` incluir `total`, ordene **dentro
> da página já carregada** em `Pokedex.tsx` (`pokemons.sort` por soma de
> `base_stat`) e deixe claro na UI que a ordem é dentro da página. Se isso
> parecer confuso, remova `total` de `SORTS` e do teste correspondente.

- [ ] **Step 8: Verificar**

Rodar: `npm run typecheck && npm run lint && npm test && npm run build`

No browser: aplicar tipo Fogo + geração I, conferir que a URL vira
`/?tipo=fire&ger=1`, dar F5 e confirmar que os filtros voltam. Ir para a página
2 e conferir `p=2` na URL.

- [ ] **Step 9: Commit**

```bash
git add src/lib/homeParams.ts src/lib/homeParams.test.ts src/lib/filters.ts src/lib/filters.test.ts src/pages/HomePage.tsx
git -c user.name="eduardochamp1" -c user.email="zezouain@gmail.com" commit -m "feat(home): filtros, ordenacao e pagina na URL

Antes o estado vivia so em memoria: nao dava para compartilhar uma busca nem
sobreviver a um F5. MapPage ja usava useSearchParams; agora a Home tambem.
Valor invalido na URL cai no padrao em vez de propagar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Trabalho em aberto (fora deste plano)

Registrado para não se perder. Cada item merece plano próprio.

1. **Movesets.** O maior buraco de dados que resta: 131 golpes para o Charizard, com método de aprendizado e nível. Precisa de decisão de UI (tabela? filtro por método? por geração?) e provavelmente de virtualização da lista.
2. **Integração emulador ↔ Pokédex.** A ideia com mais potencial: marcar "capturado" conforme se joga, lendo o save do emulador, e a Pokédex refletir a run em vez de ser catálogo genérico. Exige entender o formato do save (Gen 3 tem estrutura documentada) e é a tarefa mais ambiciosa da lista.
3. **Team builder de 6 slots** com análise de cobertura ofensiva e defensiva. Extensão natural do Comparar + `typeDefense.ts` desta Fase 1.
4. **PWA offline.** Os sprites já são locais; falta service worker. Com a Task 11 o manifest fica correto, então é o próximo passo natural.
5. **Dividir `src/App.css`** (3.260 linhas). Risco de regressão visual alto, ganho baixo — só vale junto de outra refatoração da mesma área.
6. **Testes de componente.** Hoje só lógica pura é testada. `@testing-library/react` cobriria o `ErrorBoundary`, os painéis novos e o `PlayPage`.
7. **Alvos de toque.** 29 elementos abaixo de 40px em 375px. As Tasks 8 e 9 resolvem os da navbar; os chips da lore e os botões de slot seguem pequenos.
8. **`tGenus` é frágil.** Traduz genus palavra por palavra com um dicionário; qualquer palavra ausente devolve o original em inglês. Vale trocar por um mapa de genus completo ou aceitar o inglês.

---

## Self-review

**Cobertura:** as 6 linhas do Tier 1 da revisão viraram Tasks 1–7 (ficha, defesas, habilidades, evolução, cry), com movesets explicitamente diferido no item 1 de "trabalho em aberto". Tier 2 → Tasks 11 e 12. Tier 3 → Tasks 8, 9, 10, com alvos de toque parcialmente diferidos (item 7). Tier 4 → itens 2 e 3.

**Consistência de tipos:** `EvolutionStep` é definido na Task 6 Step 1 e consumido no Step 2 e 3. `EvolutionDetail` é definido na Task 5 Step 3 e usado na Task 6 via `evolutionConditionText`. `cries` é tipado na Task 1 Step 1 e usado na Task 7 — **a Task 7 depende da Task 1**. `AbilityDetail` é definido na Task 4 Step 1 e usado no Step 2. `defenseProfile`/`multiplierLabel` são definidos na Task 2 e usados na Task 3. `SortId` e `HomeParams` são definidos na Task 12 Step 3 e usados nos Steps 6 e 7.

**Ordem obrigatória:** Task 1 antes da 7 (tipo `cries`). Task 2 antes da 3. Task 5 antes da 6. O resto é independente.

**Sem placeholders:** todo passo que muda código traz o código. Os dois pontos com julgamento em aberto — ordenação por `total` na Task 12 Step 7 e a remoção do throw de teste na Task 10 Step 4 — estão marcados explicitamente com o que decidir.
