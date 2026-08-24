# Pokédex

Uma Pokédex web completa em **React + TypeScript + Vite**, consumindo a [PokéAPI](https://pokeapi.co) — com filtros avançados, comparador, favoritos, sprites shiny/animados, formas alternativas (Mega, Gigantamax), evoluções e uma seção completa de **lore** do universo Pokémon (cronologia, genealogia, gerações, regiões, humanos, vilões e dimensões).

---

## ✨ Funcionalidades

### Pokédex principal
- **Listagem paginada** dos 1.025+ pokémons (25 por página) com cache automático via React Query
- **Busca reativa** com debounce de 350 ms — buscar por nome ou ID
- **Filtro por tipo** (18 tipos canônicos)
- **Filtro por geração** (I — Kanto até IX — Paldea)
- **Filtro por raridade** (lendários, míticos, bebês, iniciais)
- **Cross-filter** — combine tipo + geração + raridade e obtenha a interseção
- **Favoritos persistentes** no `localStorage` com contador no navbar

### Página de detalhe (`/pokemon/:nameOrId`)
- **Visualizador de sprites** com quatro modos: normal, shiny ✨, animado (GIF), animado shiny ✨
- **Hero colorido** com gradiente derivado do tipo primário
- **Status base** com barras animadas
- **Habilidades, altura, peso, habitat, gênero (categoria)**
- **Lore** — texto oficial da Pokédex (em PT-BR quando disponível, com fallback em inglês)
- **Badge de raridade** — Lendário 👑, Mítico ✨, Bebê 🍼
- **Evoluções** — chain completa com sprites clicáveis
- **Formas alternativas** — Mega X/Y, Gigantamax, Origin, Regional, Therian, Ultra, etc.

### Comparador (`/comparar`)
- **Duas slots** com busca independente
- **Status lado a lado** com barras espelhadas
- **Vencedor por atributo** destacado em verde
- **Total base stats** com comparação final

### Favoritos (`/favoritos`)
- Grid reaproveita o cache do detail
- Empty state amigável quando vazio

### Lore do universo (`/lore`)
Página com **7 abas** cobrindo toda a mitologia oficial:

| Aba | Conteúdo |
|---|---|
| **Cronologia** | 31 eventos em 6 eras — do Ovo Original de Arceus a Koraidon/Miraidon; filtrável por era ou por pokémon |
| **Genealogia** | Árvore hierárquica de criação — quem gerou ou moldou quem |
| **Gerações** | Timeline visual dos 9 jogos, de 1996 (Kanto) a 2022 (Paldea) |
| **Regiões** | 9 regiões documentadas com signature pokémons e inspiração real |
| **Humanos** | 10 personagens lendários — Sir Aaron, AZ, Cyrus, N, Cynthia, Volo etc. |
| **Vilões** | 10 organizações antagonistas com líder, motivação e desfecho |
| **Dimensões** | 7 planos paralelos — Mundo Distorcido, Ultra Espaço, Sinjoh, Hisui, Terastal etc. |

Chips de pokémon em qualquer aba são clicáveis (link para o detail) e têm botão de filtro que redireciona à cronologia filtrada por aquele pokémon.

### UX / Visual
- **Tema Pokéball** — vermelho + faixa amarela, tipografia limpa
- **Paleta canônica por tipo** — cores oficiais para os 18 tipos
- **Dark mode automático** via `prefers-color-scheme`
- **Responsivo** — grid adapta de 4 → 1 colunas, tabs scrolláveis no mobile
- **Skeleton loaders** durante fetch inicial
- **Cache inteligente** — trocar de página é instantâneo após a primeira visita

---

## 🛠️ Stack

- **[React 18](https://react.dev)** com hooks
- **[TypeScript](https://www.typescriptlang.org/)** em modo estrito
- **[Vite](https://vitejs.dev)** como bundler
- **[React Router](https://reactrouter.com)** para roteamento
- **[TanStack React Query](https://tanstack.com/query)** para cache e sincronia
- **[PokéAPI](https://pokeapi.co)** como backend

Sem dependências pesadas: bundle de ~90 kB gzip.

---

## 🚀 Rodando localmente

```bash
git clone https://github.com/eduardochamp1/Pokedex.git
cd Pokedex
npm install
npm run dev
```

A aplicação abre em [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando | Ação |
|---|---|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Type-check (`tsc -b`) + build de produção |
| `npm run preview` | Serve o build local |
| `npm run typecheck` | Só o type-check, sem emitir |

---

## 📁 Estrutura

```
src/
├── main.tsx                    Bootstrap + providers (QueryClient, Router)
├── App.tsx                     Shell de rotas
├── App.css                     Design tokens + estilos globais
├── api.ts                      Wrappers da PokéAPI (fetchJson<T> genérico)
│
├── pages/
│   ├── HomePage.tsx            Lista + busca + 3 filtros
│   ├── DetailPage.tsx          Sprite viewer, lore, evoluções, formas
│   ├── ComparePage.tsx         Comparador de 2 pokémons
│   ├── FavoritesPage.tsx       Grid dos favoritos
│   └── LorePage.tsx            7 abas de lore
│
├── components/
│   ├── Navbar.tsx              Logo Pokéball + nav links
│   ├── Searchbar.tsx           Input debounce
│   ├── Pokedex.tsx             Grid + paginação
│   ├── Pokemon.tsx             Card individual
│   ├── Pagination.tsx
│   ├── Skeleton.tsx            Placeholders animados
│   ├── TypeFilter.tsx
│   ├── GenerationFilter.tsx
│   ├── RarityFilter.tsx
│   ├── SpriteViewer.tsx        Toggle normal/shiny/animado
│   ├── VarietySwitcher.tsx     Mega, Gigantamax, formas regionais
│   ├── EvolutionChain.tsx
│   ├── PokemonLore.tsx
│   └── GenealogyTree.tsx       Componente recursivo da árvore
│
├── hooks/
│   ├── usePokemon.ts           React Query wrappers (list, search, type, gen, species, evolution)
│   ├── useFavorites.ts         localStorage sync
│   └── useDebounce.ts          Debounce genérico
│
├── contexts/
│   └── favoritesContext.tsx
│
├── data/                       Conteúdo curado (não vem da API)
│   ├── rarity.ts               Listas de lendários / míticos / bebês / iniciais
│   ├── lore.ts                 31 eventos cronológicos em 6 eras
│   ├── regions.ts              9 regiões documentadas
│   ├── humans.ts               10 personagens humanos
│   ├── genealogy.ts            Árvore de criação
│   ├── generations.ts          9 gerações de jogos
│   ├── villains.ts             10 organizações antagonistas
│   └── dimensions.ts           7 planos dimensionais
│
└── types/
    └── pokemon.ts              Tipos da PokéAPI
```

---

## 🎨 Design tokens

Todo o CSS vive em `src/App.css` e usa variáveis:

- Cores: `--bg`, `--surface`, `--text`, `--accent` (vermelho Pokéball), `--accent-alt` (amarelo Pikachu)
- **Paleta de tipos**: `--t-fire`, `--t-water`, `--t-grass` etc.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- Dark mode: substitui as tokens dentro de `@media (prefers-color-scheme: dark)`

---

## 📝 Notas técnicas

- **Cache**: queries têm `staleTime` de 5–30 min. Sprites, species e evolution chains ficam em cache até 1 h.
- **Aborts**: todos os fetches recebem `AbortSignal` — trocar de página cancela requests pendentes.
- **Filtros cruzados**: o Home combina os resultados de tipo + geração + raridade via interseção por ID em client-side.
- **Lore data**: os arquivos em `src/data/*.ts` são curados manualmente. Lendários/míticos podem defasar a cada nova geração; para produção, considere buscar `is_legendary`/`is_mythical` via species endpoint.
- **Comparador de sprites**: usa `sprites.other.showdown.front_default` (GIFs Showdown) para animação e `sprites.other["official-artwork"].front_default` para o normal.

---

## 📄 Licença

Uso livre para fins educacionais. Marca Pokémon® é propriedade de Nintendo/Game Freak/The Pokémon Company. Este projeto é um fan-project que consome a [PokéAPI](https://pokeapi.co) pública.
