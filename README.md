# Pokédex

Uma Pokédex web completa em **React + TypeScript + Vite**, consumindo a [PokéAPI](https://pokeapi.co) — com filtros combináveis, busca parcial, comparador, favoritos, sprites shiny/animados, formas alternativas (Mega, Gigantamax), evoluções, um mapa-múndi interativo e uma seção completa de **lore** do universo Pokémon.

---

## ✨ Funcionalidades

### Pokédex principal
- **Listagem paginada** dos 1.300+ pokémons (25 por página) com cache automático via React Query
- **Busca parcial** com debounce de 350 ms — `pika` encontra os 17 Pikachus; também aceita id (`25`)
- **Filtro por tipo** (18 tipos canônicos) — lista completa, não truncada
- **Filtro por geração** (I — Kanto até IX — Paldea)
- **Filtro por raridade** (lendários, míticos, bebês, iniciais)
- **Cross-filter** — busca + tipo + geração + raridade se combinam por interseção, com o total de resultados visível e paginação real
- **Favoritos persistentes** no `localStorage` com contador no navbar

### Página de detalhe (`/pokemon/:nameOrId`)
- **Visualizador de sprites** com quatro modos: normal, shiny ✨, animado (GIF), animado shiny ✨
- **Card 3D** com foil e tilt seguindo o mouse (desligado sob `prefers-reduced-motion`)
- **Status base** com barras animadas
- **Lore** — texto oficial da Pokédex (PT-BR quando disponível, com fallback em inglês)
- **Badge de raridade** — Lendário 👑, Mítico ✨, Bebê 🍼
- **Evoluções** — chain completa com cards clicáveis
- **Formas alternativas** — Mega X/Y, Gigantamax, Origin, Regional, Therian, Ultra, etc.
- **Link para o mapa** — resolve a região de origem pela lista de emblemáticos ou pela geração da espécie

### Comparador (`/comparar`)
- **Duas slots** com busca independente e autocomplete de todos os nomes
- **Status lado a lado** com barras espelhadas e vencedor por atributo
- **Efetividade de tipo** nos dois sentidos, via matriz canônica 18×18 local

### Favoritos (`/favoritos`)
- Grid reaproveita o cache do detail
- Empty state amigável quando vazio

### Mapa (`/mapa`)
- **SVG cartográfico** das 9 regiões, com hover, tooltip e dossiê por região
- **Legenda em botões reais** — o mapa é operável por teclado e leitor de tela
- **Ilhas e locais notáveis** por região dentro do dossiê, cada um com tipo e fonte
- `?region=<id>` é deep-linkável; id desconhecido mostra aviso em vez de tela vazia

### Jogar (`/jogar`)
Emulador **Game Boy, Game Boy Color e Game Boy Advance** rodando no navegador,
via [mGBA](https://mgba.io) compilado para WebAssembly.

- **Sem ROM embutida.** Você carrega o seu próprio arquivo — por seletor, por
  arrastar-e-soltar, ou deixando em `roms/` (veja abaixo). Subpastas funcionam:
  `roms/gba/`, `roms/gbc/` etc.
- **Saves persistentes** — o core monta IDBFS, então save de bateria, save
  states e as próprias ROMs enviadas ficam no IndexedDB do navegador e
  sobrevivem a recarregar a página
- **6 slots de save state**, mais um estado automático a cada 30 s
- **Backup automático em `saves/`** no disco, mais exportar/importar `.sav`
- **Gamepad virtual** para toque, e teclas configuradas explicitamente
  (setas, Z/X, A/S, Enter, Backspace) — a legenda na tela lê do mesmo mapa que
  o `bindKey`, então não mente
- **Volume e velocidade** (até 5×)
- **Diagnóstico** quando falta isolamento: a página diz exatamente qual header
  está ausente em vez de falhar em silêncio

#### Onde os saves ficam — e o que é garantido
Duas camadas, e a página mostra o estado real das duas:

| Camada | Durabilidade |
|---|---|
| **Pasta `saves/` no disco** | Forte. Backup automático a cada gravação do jogo, mais botão manual. Arquivo comum: copie para levar embora. Só em dev/preview. |
| **IndexedDB do navegador** | Sobrevive a recarregar e a fechar o navegador — mas o navegador pode descartar sob pressão de disco, e "limpar dados do site" apaga. É por navegador e por perfil. |

O app pede `navigator.storage.persist()` no carregamento, que isentaria a origem
do descarte automático — mas o Chrome costuma **negar** em site sem engajamento
(medido: retorna `false` em `localhost`). Por isso o espelho em disco existe: é
o que não depende de política de navegador. A página diz qual das duas está
valendo, com o uso atual em bytes.

Para levar progresso para outra máquina: copie o `.sav` da pasta `saves/`, ou
use **Exportar .sav** na barra lateral.

#### Sua pasta `roms/`
Largue os `.gb`/`.gbc`/`.gba` em `roms/` e eles aparecem na biblioteca sem
precisar selecionar arquivo toda vez. Essa pasta é **ignorada pelo git**, e o
plugin `vite-plugin-local-roms.ts` só a serve em `dev` e `preview` — ela não
tem hook de build, então **não vai para `dist/`**. Os arquivos ficam na sua
máquina, e um deploy acidental não os leva.

#### Detalhes de implementação que custaram caro
- **O core é carregado por tag `<script>`, não por `import()`.** Ele mora em
  `public/emulator/` (precisa: o runtime de threads sobe o worker a partir da
  URL do próprio script e resolve o `.wasm` relativo a ela). Mas arquivo em
  `public/` não pode ser alvo de `import()` no fonte — em dev o Vite anexa
  `?import`, tenta transformar e responde **500**. O `/* @vite-ignore */` não
  evita. A correção é a que o próprio Vite indica: referenciar por tag.
- **O canvas e o core são singletons da sessão**, criados fora da árvore do
  React. O core é amarrado ao canvas na criação, então um canvas novo (StrictMode
  remonta em dev; navegar para fora e voltar remonta sempre) deixaria o core
  preso no antigo. A página só adota o canvas no container dela.
- **Save states usam `saveStateSlot`/`loadStateSlot`**, que a tipagem marca como
  *deprecated* — porque na mGBA-wasm 2.5.1 as recomendadas (`saveState`/`loadState`)
  retornam falso e não escrevem nada. Verificado no browser.
- **O core é copiado por um plugin do Vite**, não por hook do npm: `npm start`
  não tem `prestart`, então quem subisse por ali ficaria sem o core.
- **Dentro do core o nome da ROM é sempre o basename.** O FS virtual é plano; um
  nome com subpasta (`gb/jogo.gb`) faz `uploadRom` escrever num diretório
  inexistente, a escrita falha e o callback nunca dispara — a tela ficava presa
  em "Carregando…". Há um teto de tempo no upload para essa classe de falha
  aparecer em vez de travar.

#### Cross-origin isolation
O core usa threads, e threads exigem `SharedArrayBuffer`, que o navegador só
libera em página cross-origin isolated. Em `dev` e `preview` os headers já vão
no `vite.config.ts`; em produção o host precisa mandar os mesmos dois — veja
`public/_headers` (Netlify / Cloudflare Pages). Sem eles o resto do site
funciona igual e só `/jogar` avisa.

Consequência: todo recurso cross-origin da página precisa ser CORS/CORP. Os
sprites já são locais; o artwork da PokéAPI e a folha do Google Fonts levam
`crossorigin="anonymous"`.

### Lore do universo (`/lore`)
Página com **13 abas** cobrindo a mitologia oficial:

| Aba | Conteúdo |
|---|---|
| **Cronologia** | 61 eventos em 6 eras — do Ovo Original de Arceus a Koraidon/Miraidon; filtrável por era ou por pokémon |
| **Genealogia** | Árvore hierárquica de criação, com conectores desenhados — quem gerou ou moldou quem |
| **Gerações** | Os 9 jogos, de 1996 (Kanto) a 2022 (Paldea) |
| **Regiões** | 9 regiões com cidades, professor, champion, Elite Four e líderes de ginásio |
| **Humanos** | 33 personagens — Sir Aaron, AZ, Cyrus, N, Cynthia, Volo, professores, champions e rivais |
| **Vilões** | 10 organizações antagonistas com líder, motivação e desfecho |
| **Dimensões** | 7 planos paralelos — Mundo Distorcido, Ultra Espaço, Sinjoh, Hisui, Terastal etc. |
| **Batalhas** | 16 duelos históricos, com contendores, local e resultado |
| **Mitos** | 23 lendas regionais |
| **Civilizações** | 12 sítios arqueológicos, com descoberta e propósito |
| **Ovos** | 21 entradas cobrindo grupos, regras e casos especiais de breeding |
| **Itens** | 42 artefatos em 5 categorias, com sprite oficial, nome em inglês e jogo de estreia |
| **Locais** | 76 ilhas, ruínas, cavernas, torres e marcos, agrupados pelas 9 regiões |

A busca da sidebar filtra as 13 abas simultaneamente. Todo verbete cita sua fonte na Bulbapedia. Chips de pokémon são clicáveis (link para o detail) e têm botão de filtro.

### UX / Visual
- **Tema dark** com paleta em design tokens
- **Paleta canônica por tipo** — cores oficiais para os 18 tipos
- **Responsivo** — grid adapta de 4 → 1 colunas, sidebar vira barra horizontal no mobile
- **Skeleton loaders** durante o fetch inicial; spinner nas rotas carregadas sob demanda
- **`prefers-reduced-motion`** respeitado em tilt e animações
- **Cache inteligente** — trocar de página é instantâneo após a primeira visita
- **404** próprio para rotas inexistentes

---

## 🛠️ Stack

- **[React 18](https://react.dev)** com hooks
- **[TypeScript](https://www.typescriptlang.org/)** em modo estrito
- **[Vite](https://vitejs.dev)** como bundler
- **[React Router](https://reactrouter.com)** para roteamento, com code splitting por rota
- **[TanStack React Query](https://tanstack.com/query)** para cache e sincronia
- **[Vitest](https://vitest.dev)** para os testes de lógica pura
- **[mGBA](https://mgba.io)** via `@thenick775/mgba-wasm` (MPL-2.0) para o emulador
- **[PokéAPI](https://pokeapi.co)** como backend

Sem dependências pesadas: entry de ~80 kB gzip; Lore e Mapa vêm em chunks separados.

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
| `npm run lint` | ESLint (flat config, com `react-hooks`) |
| `npm test` | Suíte Vitest |
| `npm run test:watch` | Vitest em watch |
| `npm run sprites` | Baixa os sprites para `public/sprites/` (idempotente; `--force` rebaixa) |
| `npm run emulator:core` | Copia o core do emulador para `public/emulator/` (roda no predev/prebuild) |

> **Deploy:** é uma SPA com `BrowserRouter`. O host precisa reescrever qualquer
> rota para `index.html`, senão `/lore` e `/pokemon/:id` dão 404 no refresh — e
> mandar os headers de `public/_headers` para o emulador funcionar. Antes de
> publicar, confirme que não há ROM no build:
>
> ```bash
> find dist -iname "*.gb" -o -iname "*.gbc" -o -iname "*.gba"
> ```

---

## 📁 Estrutura

```
src/
├── main.tsx                    Bootstrap + providers (QueryClient, Router)
├── App.tsx                     Shell de rotas (lazy) + 404
├── App.css                     Estilos globais
├── api.ts                      Wrappers da PokéAPI (fetchJson<T> genérico, mapa de aliases)
│
├── pages/
│   ├── HomePage.tsx            Lista + busca + 3 filtros combináveis
│   ├── DetailPage.tsx          Sprite viewer, lore, evoluções, formas
│   ├── ComparePage.tsx         Comparador de 2 pokémons + efetividade
│   ├── FavoritesPage.tsx       Grid dos favoritos
│   ├── LorePage.tsx            13 abas de lore
│   ├── MapPage.tsx             Mapa-múndi + dossiê por região
│   ├── PlayPage.tsx            Emulador GB/GBC/GBA + saves
│   └── NotFoundPage.tsx        404
│
├── components/
│   ├── Navbar.tsx              Logo Pokéball + nav links
│   ├── Searchbar.tsx           Input debounce
│   ├── Pokedex.tsx             Grid + contador + paginação
│   ├── Card.tsx                Card 2:3 com foil, tilt e badges
│   ├── CardHero.tsx            Versão ampliada do card
│   ├── Pagination.tsx          Desabilita nos limites
│   ├── Skeleton.tsx            Placeholders + fallback de rota lazy
│   ├── TypeFilter.tsx / GenerationFilter.tsx / RarityFilter.tsx
│   ├── SpriteViewer.tsx        Toggle normal/shiny/animado
│   ├── VarietySwitcher.tsx     Mega, Gigantamax, formas regionais
│   ├── EvolutionChain.tsx
│   ├── PokemonLore.tsx
│   ├── PokemonChip.tsx         Chip de pokémon (lore e mapa)
│   ├── ItemSprite.tsx          Sprite oficial de item, com fallback em emblema
│   ├── WikiSource.tsx          Chip "fonte: Bulbapedia" dos verbetes
│   ├── TypeMatchup.tsx         Efetividade de tipos
│   ├── GenealogyTree.tsx       Componente recursivo da árvore
│   ├── WorldMap.tsx            SVG das regiões + legenda acessível
│   ├── LoreArt.tsx             Arte SVG (regiões, humanos, vilões, portais)
│   └── ParticleField.tsx       Partículas do oceano
│
├── hooks/
│   ├── usePokemon.ts           React Query wrappers (índice, seleção, página, species, evolution)
│   ├── useFavorites.ts         localStorage sync
│   ├── useFeaturedPokemon.ts   Lendário em destaque na Home
│   ├── useDebounce.ts          Debounce genérico
│   ├── useTiltEffect.ts        Tilt 3D seguindo o mouse
│   └── useReducedMotion.ts     prefers-reduced-motion
│
├── lib/                        Lógica pura, com testes
│   ├── filters.ts              Índice, busca parcial, interseção, paginação
│   ├── regionForPokemon.ts     Pokémon/geração → id de região
│   ├── localize.ts             Fallback pt-BR → pt → en
│   ├── sprites.ts              Caminho dos sprites locais (id / slug)
│   └── wiki.ts                 Monta as URLs de fonte
│
├── emulator/                   Integração do core mGBA
│   ├── core.ts                 Carrega /emulator/mgba.js e checa o isolamento
│   ├── useEmulator.ts          Hook que dirige o core (ROM, saves, estados)
│   ├── storage.ts              Persistência: pasta saves/ + status do navegador
│   ├── keyBindings.ts          Mapa de teclas + gamepad virtual
│   └── types.ts                Extensões, slots, status
│
├── contexts/
│   └── favoritesContext.tsx
│
├── data/                       Conteúdo curado (não vem da API)
│   ├── rarity.ts               Lendários / míticos / bebês / iniciais
│   ├── typeMatchups.ts         Matriz canônica 18×18 de efetividade
│   ├── i18n.ts                 Traduções PT-BR de tipos, habitats e genus
│   ├── lore.ts                 61 eventos cronológicos em 6 eras
│   ├── regions.ts              9 regiões documentadas
│   ├── regionMap.ts            Paths SVG das regiões
│   ├── humans.ts               33 personagens humanos
│   ├── genealogy.ts            Árvore de criação
│   ├── generations.ts          9 gerações de jogos
│   ├── villains.ts             10 organizações antagonistas
│   ├── dimensions.ts           7 planos dimensionais
│   ├── battles.ts              16 duelos históricos
│   ├── myths.ts                23 lendas regionais
│   ├── civilizations.ts        12 sítios arqueológicos
│   ├── breeding.ts             21 entradas de ovos
│   ├── items.ts                42 artefatos, com slug de sprite e fonte
│   └── landmarks.ts            76 ilhas e locais notáveis, ligados às regiões
│
├── design/
│   └── tokens.css              Variáveis CSS globais
│
└── types/
    └── pokemon.ts              Tipos da PokéAPI

public/
└── sprites/                    Assets locais, baixados por npm run sprites
    ├── pokemon/                1.342 sprites pixelados (~1,4 MB)
    └── items/                  36 sprites de item (~10 kB)

roms/                           SUAS ROMs — fora do git e fora do build (aceita subpastas)
saves/                          Backup dos seus saves em disco — fora do git

scripts/
├── fetch-sprites.mjs           Baixa os sprites; idempotente
└── copy-emulator-core.mjs      Copia mgba.js/mgba.wasm de node_modules

vite-plugin-local-roms.ts       Serve roms/ só em dev e preview
```

---

## 🎨 Design tokens

Tudo em `src/design/tokens.css`, importado pelo `App.css`:

- Superfícies: `--bg`, `--surface-1..3`, `--border`, `--border-strong`
- Texto: `--text`, `--text-muted`, `--text-dim`
- Acentos: `--accent` (vermelho Pokéball), `--accent-alt` (amarelo Pikachu), `--accent-hover`
- **Paleta de tipos**: `--t-fire`, `--t-water`, `--t-grass` etc. (18 tipos)
- Sombras (`--shadow-card`, `--shadow-hero`), raios (`--radius-card`, `--radius-pill`) e motion (`--dur-*`, `--ease-*`)

O tema é dark-only por decisão de design — não há variante clara.

---

## 📝 Notas técnicas

- **Índice de nomes**: um único request (`/pokemon?limit=100000`, ~90 kB) monta o mapa nome → id que alimenta a busca parcial, a ordenação dos filtros e os sprites dos chips da lore. Cacheado por 1 h.
- **Filtros**: cada critério custa no máximo um request e devolve a lista **completa** de nomes; a interseção e a paginação são locais. Só a página visível (25 itens) tem os detalhes buscados.
- **Sprites locais**: os 1.342 sprites pixelados e os 36 de item ficam em `public/sprites/` (~1,4 MB), baixados uma vez por `npm run sprites` e commitados. Como o caminho é determinístico (id do pokémon / slug do item), a Lore renderiza 140+ chips com **zero** request por pokémon e sem depender de CDN de terceiros.
- **O artwork grande não é local**: 475px × 1.351 daria ~176 MB. Ele continua saindo do objeto `Pokemon` que a PokéAPI já devolve nas telas que buscam o detalhe (card do grid, hero, sprite viewer).
- **Imagens de personagens, regiões e organizações**: não vêm de wiki. O Bulbapedia bloqueia hotlink (`archives.bulbagarden.net` responde 403) e a arte é propriedade da Nintendo/Game Freak — então a ilustração dessas seções é SVG gerado no próprio projeto (`LoreArt.tsx`), e a wiki entra como **fonte citada**.
- **Fontes**: cada verbete curado tem um campo `wiki` com o título exato da página na Bulbapedia. Os ~250 títulos usados foram validados em lote via API do MediaWiki — nenhum aponta para página inexistente. O texto do site é resumo próprio, não cópia.
- **Cache**: queries têm `staleTime` de 5–60 min, com `queryKey` compartilhada entre detail, evoluções e formas.
- **Aborts**: todos os fetches recebem `AbortSignal` — trocar de página cancela requests pendentes.
- **Erros**: `fetchJson` devolve `null` só em 404; qualquer outra falha propaga, para a UI distinguir "não existe" de "não deu para consultar".
- **Aliases**: nomes canônicos que a API não aceita direto (`giratina` → `giratina-altered`) passam por `resolveName`, usado tanto no fetch quanto na normalização dos filtros.
- **Lore data**: os arquivos em `src/data/*.ts` são curados manualmente. As listas de lendários/míticos podem defasar a cada nova geração; para produção, considere buscar `is_legendary`/`is_mythical` via species endpoint.
- **Emulador**: o core é carregado em runtime de `/emulator/mgba.js`, não pelo bundler — o runtime de threads do Emscripten sobe o worker de pthread a partir da URL do próprio script e resolve o `.wasm` relativo a ela. Por isso os dois arquivos são servidos lado a lado de `public/` (copiados de `node_modules` no `predev`/`prebuild`, e fora do git).
- **Testes**: `src/lib/*.test.ts` e `src/data/typeMatchups.test.ts` cobrem a lógica pura (interseção de filtros, busca, resolução de região, matriz de tipos). Os componentes não têm testes de render.

---

## 📄 Licença

Uso livre para fins educacionais. Marca Pokémon® é propriedade de Nintendo/Game Freak/The Pokémon Company. Este projeto é um fan-project que consome a [PokéAPI](https://pokeapi.co) pública.
