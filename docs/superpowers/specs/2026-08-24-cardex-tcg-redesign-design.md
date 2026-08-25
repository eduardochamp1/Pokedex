# Cardex — Redesign TCG showroom

**Status:** Approved for planning
**Date:** 2026-08-24
**Author:** eduardochamp1

## Contexto

A Pokédex atual (React + Vite + TS) tem todas as funcionalidades desejadas (lista, busca, detalhe com sprites shiny/animados, evoluções, formas Mega/Gmax, comparador, favoritos, lore multi-aba, mapa mundi). O tema visual atual — Pokéball vermelho no topo + cards horizontais verde-menta em dark mode auto — é funcional mas genérico. Este spec redefine **apenas a camada visual e a apresentação da informação**, mantendo intactas todas as APIs, hooks e dados curados já implementados.

## Objetivo

Transformar o site em uma experiência **imersiva de Trading Card Game (TCG)** — cada pokémon é apresentado como uma carta real, com moldura vertical 2:3, efeitos de foil no hover, tilt 3D e destaques permanentes para lendários e shinies. A navegação abandona a lógica de "dashboard de dados" e vira "vitrine de coleção".

## Princípios

1. **A carta é a unidade visual central** — grid, hero de detail, evoluções, favoritos e lore: tudo é uma carta ou um card derivado.
2. **Palco escuro, sempre** — não existe dark-mode toggle; a identidade É escura. Cards são as fontes de luz.
3. **Cor comunica tipo** — cada card e cada painel de detalhe assume uma aura sutil na cor canônica do tipo primário.
4. **Efeitos elegantes, não exagerados** — foil só no hover; brilho permanente apenas em lendários, míticos e shinies. Performance importa.
5. **Nada quebra** — todas as rotas atuais (`/`, `/pokemon/:id`, `/comparar`, `/favoritos`, `/lore`, `/mapa`) continuam existindo, aceitam os mesmos parâmetros e persistem os mesmos dados no `localStorage`.
6. **Acessível** — `prefers-reduced-motion` desliga todo tilt/parallax/shine; foco visível em qualquer elemento interativo; contraste AA em todo texto sobre cards coloridos.

## Linguagem visual

### Paleta
- Palco: `#0d0e14` (fundo global)
- Superfície de card: `#1a1c25`
- Superfície secundária: `#141520`
- Borda hairline: `#2a2c37`
- Acento primário: `#ee1e35` (vermelho Pokéball)
- Acento secundário: `#ffcb05` (amarelo Pikachu)
- Texto primário: `#f2f2f5`
- Texto muted: `#a1a1a6`
- **Paleta de tipos** — mantida a canônica já implementada (fire `#ee8130`, water `#6390f0`, grass `#7ac74c`, etc.), agora usada como fonte de aura dos cards, não apenas dos badges.

### Tipografia
- **Display** — `"Space Grotesk"` via Google Fonts, weights 500 e 700, usado em: nome do pokémon nos cards, títulos de seção, números grandes (HP, ID, stats).
- **Body** — `system-ui, -apple-system, "Segoe UI", sans-serif`, usado em: descrições, tabelas, badges.
- **Voice / lore** — mesma display Space Grotesk mas em itálico para flavor text e citações da Pokédex, sugerindo tratamento editorial.
- `font-variant-numeric: tabular-nums` global em todos os números.

### O card (elemento fundacional)
Proporção 2:3 (ex: 220×330 no grid desktop). Estrutura:

```
┌─────────────────────┐
│  nome       tipo○   │  Header: nome (display 500), círculos de tipo à direita
│  ─────────────────  │
│                     │
│   [artwork]         │  Corpo: sprite official-artwork, centralizado, 60% da altura
│                     │
│  ─────────────────  │
│  #025      HP 35    │  Rodapé: id + primeira stat como "HP" (destacada)
│  ▓▓▓ atk 55         │  2-3 stats principais em mini-barras horizontais
│  gen I · kanto      │  Metadados: geração + região em texto muted
└─────────────────────┘
```

- Idle: sombra `0 8px 24px rgba(0,0,0,0.4)`, borda 1px hairline sutil na cor do tipo primário (10% opacidade).
- Hover: `translateY(-8px)`, sombra cresce para `0 16px 40px rgba(0,0,0,0.55)`, tilt 3D seguindo cursor (`perspective(1000px) rotateX/Y` até 8°), overlay `conic-gradient` diagonal que gira com a posição do mouse (efeito foil).
- **Lendário / mítico**: borda superior dourada (`#ffcb05`) com animação `shimmer` de 4s eterna, badge canto superior "👑" ou "✨".
- **Shiny**: 4 ícones ✨ animando rotação lenta nos cantos.
- Todo hover/animação é suspenso quando `prefers-reduced-motion: reduce`.

## Home (`/`) — vitrine

### Layout desktop (≥1024px)
- **Barra superior** slim (56px): pokéball SVG + wordmark "Pokédex", busca reativa centralizada, nav links à direita (Comparar / Lore / Mapa / Favoritos com contador).
- **Featured** — 40vh no topo: um pokémon rotativo por dia (baseado em ID sorteado a partir da data), card grande (~450px altura) com holo animado e tilt permanente, texto lateral com genus + flavor text curto.
- **Barra de filtros** sticky à esquerda quando usuário rola: Buscar / Tipo / Geração / Raridade em coluna vertical, colada ao viewport.
- **Grid** de 4-5 colunas: cards 2:3 (220×330), gap 20px, `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`.
- Paginação continua no rodapé do grid.

### Layout mobile (<768px)
- Barra superior colapsada (48px) com apenas logo + hamburguer.
- Featured colapsado para 30vh.
- Filtros como bottom-sheet arrastável (ícone flutuante).
- Grid: 2 colunas.

## Detail (`/pokemon/:nameOrId`)

### Comportamento
Clicar num card do grid **não navega** para uma URL branca. A carta cresce até o centro do viewport com animação FLIP genuína (~350ms), o resto do grid recebe `filter: blur(6px) brightness(0.4)`, e ao redor da carta central abrem-se **5 painéis periféricos** distribuídos nos 4 cantos (Lore e Formas empilhados no canto superior direito). Abrir a URL `/pokemon/:name` diretamente renderiza a mesma vista sem o grid atrás (backdrop escuro sólido).

### Layout desktop
```
   ┌──────────────┐          ┌──────────────┐
   │   SPRITES    │          │   FORMAS     │
   │   Normal     │          │  Mega X      │
   │   Shiny      │          │  Mega Y      │
   │   Animado    │          │  Gigantamax  │
   │   Animado ✨ │          │  Alolan      │
   └──────────────┘  ┌─────┐ └──────────────┘
                     │     │
   ┌──────────────┐  │CARD │ ┌──────────────┐
   │  EVOLUÇÕES   │  │HERO │ │   LORE       │
   │              │  │     │ │  gênero      │
   │  ←mini→ mini │  │     │ │  habitat     │
   │              │  │     │ │  flavor text │
   └──────────────┘  │     │ └──────────────┘
                     │     │
                     └─────┘ ┌──────────────┐
                             │   STATS      │
                             │  todos os 6  │
                             │  barras+total│
                             └──────────────┘
```

### Painéis
1. **Sprites** (top-left) — miniaturas verticais: Normal / Shiny ✨ / Animado / Animado ✨. Clicar substitui o sprite do card hero com crossfade 200ms. Modo ativo com borda dourada.
2. **Formas** (top-right) — mini-cards 2:3 (~120×180) das variedades. Clicar transiciona o card hero para aquela forma (novo fetch, mesma queryKey).
3. **Evoluções** (bottom-left) — chain horizontal com mini-cards conectados por setas iluminadas na cor do tipo. Card atual com aura destacada.
4. **Lore** (top-right, abaixo de Formas) — genus, badge de raridade, habitat, região (link para `/mapa?region=X`), flavor text em serif itálico como citação.
5. **Stats** (bottom-right) — 6 barras horizontais na cor do tipo primário + total no rodapé em display.

### Fechar
- × no canto superior direito
- Tecla ESC
- Clicar no backdrop
- Animação inversa: painéis dobram, card volta ao slot do grid

### Mobile
Sem painéis periféricos. Scroll vertical: hero sticky no topo (60vh) + seções empilhadas (sprites → formas → evoluções → lore → stats).

## Comparar (`/comparar`)

- Dois hero cards **encarando-se** no palco, cada um com holo/tilt independente.
- **Painel de arena** entre eles:
  - Barras de stats espelhadas (esq. cresce ←, dir. cresce →)
  - **Matriz de efetividade de tipo** — nova seção: para cada tipo do card A, calcula 0.5×/1×/2×/0× contra os tipos do card B, e vice-versa. Renderizada como grid de tiles pequenos.
  - Vencedor por atributo destacado; badge "VENCEDOR" no total maior.
- Botão "Trocar" com animação: cards deslizam invertendo posição em 400ms.
- Inputs de busca com debounce mantidos (350ms).

## Favoritos (`/favoritos`)

- Título grande "Sua coleção — X cartas".
- Grid de **3 colunas** (não 4-5 como home) — cards maiores (~280×420).
- Cada card com carimbo pequeno no canto: número da ordem que foi favoritado (1, 2, 3…).
- Ordem de exibição: mesma ordem que foi favoritado (FIFO da lista no localStorage).
- Empty state: silhueta fantasma de card com "Nenhuma carta na sua coleção ainda" + botão "Explorar Pokédex →".

## Lore (`/lore`)

Conteúdo idêntico ao atual (7 abas × 31 eventos + 20 nodes genealogia + 9 gerações + 9 regiões + 10 humanos + 10 vilões + 7 dimensões). Reskin:
- **Sidebar vertical fixa** à esquerda (240px), colada ao viewport, com as 7 abas em lista com ícone.
- **Cronologia**: cada evento como "página de livro" — margem generosa, número de era grande em display, chips de pokémon como mini-cards 2:3 reais (~60px altura).
- **Genealogia**: linhas curvas SVG conectando os nodes (não retas), pulsação sutil no root Arceus, cards no lugar dos cards planos atuais.
- **Gerações**: horizontal scrollable — "carrossel" de cenas grandes por gen (não empilhado vertical).
- **Regiões / Humanos / Vilões / Dimensões**: cards editoriais grandes com hero image ou ícone temático; clicar abre painel de leitura em serif à direita.

## Mapa (`/mapa`)

- Fundo do oceano com **partículas flutuando** (15-20 pontos brancos, opacidade animada).
- Cada região com **glow permanente sutil** na cor canônica (Kanto pulsando vermelho, Sinnoh azul, etc.) via `filter: drop-shadow`.
- Hover mais dramático — região selecionada "levanta" (scale 1.08), demais escurecem para `brightness(0.5)`.
- **Painel de detalhes** ao clicar vira "dossier": header com o path SVG grande da região, chips de pokémons emblemáticos como mini-cards 2:3, seções (lore/humanos/vilões) em "arquivos" com header estilo carimbo.
- Deep-linking: `/mapa?region=kanto` abre com Kanto já selecionado (novo — não existe hoje).

## Motion system

Consistente através de todas as páginas:

| Interação | Efeito | Duração |
|---|---|---|
| Card idle | Sombra estática | — |
| Card hover | translateY(-8px) + tilt 3D + foil overlay | 200ms ease-out |
| Card open (grid → hero) | FLIP animation genuína | 350ms cubic-bezier |
| Card close | Inverso do open | 300ms |
| Sprite swap | Crossfade | 200ms |
| Route transition | Fade + slide-up | 300ms |
| Backdrop | Blur 6px + brightness 0.4 | 250ms |
| Legendary shine | Gradient dourado percorrendo borda | 4s loop |
| Shiny sparkles | Rotação lenta 4 estrelas | 6s loop |
| Focus visible | Outline 2px amarelo | — |

**Reduced motion**: quando `prefers-reduced-motion: reduce`, todas as transições reduzem para 100ms sem tilt, sem parallax, sem shine, sem sparkles.

## Escopo e não-escopo

### Dentro do escopo
- Reescrita completa de `src/App.css` com nova paleta e sistema de tokens
- Novo componente `Card` (2:3, foil, tilt, legendary shine, shiny sparkles) substituindo `Pokemon.tsx`
- Novo componente `CardHero` (versão ampliada para o center do detail)
- Refatoração de `DetailPage.tsx` para layout de 4 painéis + FLIP animation
- Refatoração de `HomePage.tsx` com sidebar sticky, featured section, grid ajustado
- Refatoração de `ComparePage.tsx` com hero cards + matriz de efetividade
- Refatoração de `LorePage.tsx` com sidebar vertical + cards editoriais
- Refatoração de `MapPage.tsx` com partículas + glow por tipo + dossier
- Novo componente `TypeMatchup` para a matriz de efetividade
- Novo hook `useReducedMotion` para respeitar preferência
- Google Fonts embed de Space Grotesk
- Deep-linking em `/mapa?region=X`

### Fora do escopo
- Novas features de dados (nenhum endpoint novo da PokéAPI)
- Testes automatizados (out of scope, considerar em spec separada)
- PWA / offline
- i18n (mantém PT-BR + fallback EN atual)
- Drag & drop de favoritos (nice-to-have, opcional em fase 2)
- Booster pack / abertura animada (rejeitada no brainstorm)
- Card binder view (rejeitada no brainstorm)

## Componentes que ficam

- `src/api.ts` — sem mudanças
- `src/hooks/*` — sem mudanças estruturais (novo hook `useReducedMotion` adicionado)
- `src/data/*` — sem mudanças
- `src/types/pokemon.ts` — sem mudanças
- React Router, React Query, roteamento — inalterados
- `localStorage` key `"f"` de favoritos — inalterada (compatibilidade)

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| FLIP animation quebra em navegações diretas (sem grid atrás) | Detectar via `useLocation`; sem grid = renderizar direto sem transição |
| Foil (conic-gradient rotativo) pode custar 60fps em muitos cards visíveis | Aplicar só no card hovered; pausar animação em cards fora do viewport (IntersectionObserver) |
| Space Grotesk falha ao carregar (rede lenta) | Fallback stack robusta; `font-display: swap` |
| Layout de 4 painéis muito apertado em 1024px | Breakpoint intermediário 1024-1280px: painéis abaixo (2 colunas), card no topo |
| Migrar todos os componentes de vez pode gerar regressões | Implementação em plano de fases (ver plano de implementação) |

## Sucesso

- Todas as rotas continuam funcionando com os mesmos parâmetros
- Todo pokémon aparece como card 2:3 no grid
- Detail abre com FLIP animation em ≥200ms na maioria dos hardware
- Legendários e shinies são visualmente distinguíveis à distância
- Lighthouse Performance ≥85 em desktop
- Contraste AA em todo texto
- Reduced-motion respeitado
- Nenhum favorito antigo é perdido (mesma chave `"f"` no localStorage)
