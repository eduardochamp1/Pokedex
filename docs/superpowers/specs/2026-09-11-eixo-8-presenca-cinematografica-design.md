# Eixo 8 — Presença Cinematográfica

**Data:** 2026-09-11
**Status:** Aprovado (brainstorming), aguardando plano de implementação
**Escopo:** UX/visual — 4 features que transformam a Pokédex de "navegador de fichas" em experiência sensorial.

## Objetivo

Elevar o impacto visual do site com quatro entregas coordenadas:

1. **Cartas 3D holográficas reativas ao mouse** em todos os cards.
2. **Sprite scrubber** com shiny, animado e costas.
3. **Comparador de tamanho** (`/tamanhos`) com carrinho global via modal.
4. **View transitions** entre todas as rotas + morph do sprite (grid → detail → chain).

Cada feature é independente e pode ser mergeada isoladamente, mas compartilha três utilitários novos (`lib/motion.ts`, `lib/comparatorStore.ts`, `hooks/useSpriteFrames.ts`).

## Não-objetivos

- Não adicionar dependências novas (Zustand, Framer Motion). Store própria com `useSyncExternalStore`; animações CSS + View Transitions API nativa.
- Não substituir o `SpriteViewer` de escolha de sprite atual (é para escolher variante); o scrubber é feature nova, coexistem se necessário.
- Não redesenhar cards existentes; `HoloCard` é wrapper que envolve o `Card`/`CardHero` atuais sem mudar sua API.

## Arquitetura

```
src/
├── lib/
│   ├── motion.ts             ← startTransition wrapper (usa useReducedMotion existente)
│   └── comparatorStore.ts    ← store leve p/ carrinho de tamanhos
├── hooks/
│   ├── useReducedMotion.ts   ← já existe
│   ├── useTiltEffect.ts      ← já existe; estender p/ expor CSS vars (--rx, --ry, --mx, --my)
│   └── useSpriteFrames.ts    ← lê sprites.versions da PokéAPI
├── components/
│   ├── HoloCard.tsx          ← wrapper 3D em volta de Card/CardHero
│   ├── SpriteScrubber.tsx    ← slider + 3 toggles
│   ├── SizeCanvas.tsx        ← SVG puro; pokémons + humano 1.70m
│   └── ComparatorButton.tsx  ← FAB + modal com carrinho
├── pages/
│   └── SizesPage.tsx         ← rota /tamanhos
├── styles/
│   └── holo.css              ← foil/spectral/glitter (lazy via HoloCard)
└── App.tsx                   ← RouterTransition wrapper + rota /tamanhos
```

## Feature 1 — Carta 3D holográfica

### Comportamento

- Todo card do grid recebe reatividade 3D ao mouse.
- Só o card sob o cursor tem listener ativo (via `pointerenter`/`pointerleave`).
- Card fora da viewport (`IntersectionObserver`, threshold 0.1) não instala listener.
- Um único `requestAnimationFrame` global atualiza o card ativo — no máximo um update por frame.

### Camadas visuais

Empilhadas dentro de `HoloCard`, com `mix-blend-mode`:

1. **Base** — o `Card`/`CardHero` existente, sem mudança.
2. **Foil** — `conic-gradient` girando com `--rx`/`--ry`, `blend: overlay`.
3. **Spectral** — `linear-gradient` arco-íris, `blend: color-dodge`, mascarado por raridade.
4. **Glitter** — só Mythical/Legendary. `radial-gradient` de pontos, opacidade proporcional à distância do centro.

Intensidade por raridade via CSS custom property `--holo-intensity`:

| Raridade | Intensidade |
|---|---|
| Common | 0.20 |
| Uncommon | 0.40 |
| Rare | 0.60 |
| Legendary | 0.90 |
| Mythical | 1.00 |

### Estratégia de performance

- CSS custom properties (`--rx`, `--ry`, `--mx`, `--my`) em vez de manipular `style` direto — o browser compila em GPU.
- `will-change: transform` adicionado no `pointerenter` e removido no `leave`.
- Mobile (`@media (hover: none)`): tilt desligado, gradiente reduzido a overlay estático.
- `prefers-reduced-motion: reduce`: sem tilt, sem gradiente animado.

## Feature 2 — Sprite scrubber

### Fonte de dados

`pokemon.sprites.versions.generation-{i..viii}.{jogo}`. Um jogo canônico por geração:

| Gen | Jogo | Animado |
|---|---|---|
| I | red-blue | não |
| II | crystal | não |
| III | emerald | não |
| IV | platinum | não |
| V | **black-white** | **sim (GIF)** |
| VI | x-y | não |
| VII | ultra-sun-ultra-moon | não |
| VIII | icons | não |
| IX | `other/home` (fallback) | não |

### Hook

`useSpriteFrames(pokemon, { shiny, animated, back })` retorna `Frame[]` — cada `Frame` tem `{ gen, url, isAnimated }`. Gerações sem sprite para aquele pokémon são puladas.

### UI

- Slider horizontal com marcas rotuladas ("Gen I", "Gen II"…) só nas gens existentes.
- Três toggles compactos: `✨ Shiny` · `🎬 Animado` · `↩️ Costas`.
- Frame renderiza `<img>` com `image-rendering: pixelated`.
- Crossfade 200ms entre frames (respeita reduced-motion).
- `loading="lazy"` para GIFs animados (só carrega quando toggle ativa).

## Feature 3 — Comparador de tamanho

### Store

`comparatorStore.ts` — módulo com `useSyncExternalStore`:

- Estado: `Array<{ name: string; height: number; sprite: string }>`, máx 6, persistido em `localStorage` na chave `comparator-cart`.
- API: `add(p)`, `remove(name)`, `clear()`, `useComparator()`.
- Idempotente: `add` do mesmo nome não duplica.

### Botão global

`ComparatorButton.tsx` — fixed bottom-right (área ≥44px, respeitando o padrão mobile).

- Visível apenas se `count > 0`.
- Badge com contagem.
- Clique abre modal com lista + botão "abrir página completa" → `/tamanhos?p=…`.

### Botão inline no card

Pequeno `📏` no canto superior direito do `Card`:

- Desktop: aparece no hover.
- Mobile: sempre visível.
- `pointer-events` isolado para não conflitar com o link do card.

### SizeCanvas

SVG único que:

1. Calcula altura máxima do conjunto (`Math.max(...heights, 17)` — 17dm = 1.70m humano).
2. Escala o viewport para caber.
3. Baseline compartilhada (chão comum).
4. Cada pokémon: sprite oficial escalado por `height_dm / maxHeight`.
5. Humano de 1.70m como silhueta SVG inline (sempre presente).
6. Régua vertical à esquerda com marcações a cada 1m.
7. Label sob cada figura: nome + altura formatada.
8. **Piso mínimo de 12px por sprite** para evitar Joltik virar 1px do lado de Wailord. Nota discreta: "escala não linear abaixo de 30cm".

### SizesPage (`/tamanhos`)

- Estado inicial (carrinho vazio): sugestões clicáveis — "Wailord vs Joltik", "Todos os lendários de Kanto", "Comparar meus favoritos".
- Estado com itens: `SizeCanvas` + ações (adicionar mais, limpar, copiar link).
- URL sincronizada: `/tamanhos?p=wailord,joltik,pikachu`.
- `parseTamanhosParams`/`toSearchParams` no mesmo padrão de `homeParams.ts`.
- Autocomplete para adicionar: reusa `searchNames` e `Searchbar`.

## Feature 4 — View transitions

### Wrapper

`lib/motion.ts`:

```ts
export function startTransition(cb: () => void) {
  if (prefersReducedMotion() || !document.startViewTransition) {
    cb();
    return;
  }
  document.startViewTransition(cb);
}
```

### Uso

- **Card → detail**: `<Link>` interceptado; o sprite recebe `view-transition-name: sprite-{id}` no card **e** no hero da detail. Morph automático.
- **Detail → detail (evolution chain)**: mesmo `view-transition-name`, muda só o id no clique.
- **Todas as rotas**: `RouterTransition` em `App.tsx` intercepta `useNavigate` e envolve a mudança em `startTransition`. Fade padrão de 250ms.

### Nomes únicos

Só o item ativo (clicado / sob cursor) recebe `view-transition-name`. Nome removido no fim da transição. Dois nomes iguais simultâneos abortam a animação — evitamos ativamente.

### Fallback

Se `document.startViewTransition === undefined` (Firefox pré-suporte), navegação normal. Zero regressão.

## Cross-cutting

### Reduced motion

Um único gate em `lib/motion.ts` desliga:

- Tilt do holo (só overlay estático).
- Gradiente animado (só cor sólida sutil).
- View transitions (navegação direta).
- Crossfade do scrubber (troca instantânea).

### Mobile 375px

- Holo: sem tilt, gradiente estático.
- Scrubber: toggles empilham em 2 linhas se necessário.
- SizesPage: canvas com scroll horizontal quando >4 pokémons.
- ComparatorButton: canto inferior direito, área ≥44px.

### Bundle

`holo.css` importado apenas em `HoloCard.tsx` — Vite faz code-splitting. Impacto estimado: +6 kB gzip.

## Testes (TDD)

| Alvo | Testes |
|---|---|
| `comparatorStore` | add limita a 6 · remove idempotente · clear · ordem preservada · localStorage roundtrip |
| `useSpriteFrames` | pula gens sem sprite · alterna shiny · toggle costas troca URL · animado só na Gen5 |
| `parseTamanhosParams` | vazio · com nomes · ignora nomes inválidos · ida e volta |
| helper de escala do `SizeCanvas` | 1 pokémon · 6 pokémons · humano dominando · piso mínimo aplicado |

Meta: +18 testes. Mantém a política de TDD estabelecida.

## Riscos

| Risco | Mitigação |
|---|---|
| Tilt em 60 cards derruba FPS em mobile fraco | IntersectionObserver + só card sob cursor + `hover:none` desliga tilt |
| View transitions dispara enquanto React ainda hidrata | Wrapper checa `document.readyState === "complete"` |
| Sprite animado do BW é GIF grande (~30 kB) | `loading="lazy"`, carrega só quando toggle animado ativa |
| Dois `view-transition-name` iguais na tela | Nome só no elemento clicado, remove no fim da transição |
| SizeCanvas com Wailord (14.5m) + Joltik (0.1m) | Piso mínimo de 12px por sprite, com nota "escala não linear" |
| CSS `mix-blend-mode` inconsistente em Safari antigo | Feature detection via `@supports (mix-blend-mode: overlay)`; fallback: só a camada foil |

## Ordem de implementação

Cada item vira um commit independente.

1. `lib/motion.ts` + `startTransition` — infraestrutura.
2. View transitions (Feature 4) — valida o pipeline com menor superfície.
3. `HoloCard` (Feature 1) — reutiliza `Card` existente.
4. `SpriteScrubber` (Feature 2) — vive na `DetailPage`.
5. Comparador (Feature 3) — store + `ComparatorButton` + `SizesPage`.

## Fora deste spec

- Fusion sprites, sound lab, PWA offline, deck builder — permanecem na lista "Trabalho em aberto" do plano anterior e receberão seus próprios specs quando priorizados.
