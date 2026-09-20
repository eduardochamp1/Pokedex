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
- **Continuidade** — sair para outra página e voltar mantém o jogo rodando, no
  mesmo ponto. Recarregar a página recarrega a última ROM sozinho; "Fechar jogo"
  é como dizer que não a quer de volta
- **6 slots de save state** que mostram o que têm — a **imagem** do momento
  gravado, há quanto tempo, e um botão para apagar. Os estados são por ROM: os
  slots de um jogo não aparecem em outro
- **"Continuar de onde parou"** — o core já capturava um estado automático a
  cada 30 s; agora ele tem um botão em vez de ser descartado
- **Atalhos** — F1–F6 carregam um estado, Shift+F1–F6 gravam, e segurar Espaço
  dá turbo 5× enquanto durar
- **Biblioteca gerenciável** — cada ROM mostra quanto ocupa e pode ser removida;
  o save de bateria fica, então o progresso volta se a ROM voltar
- **Backup automático em `saves/`** no disco, mais exportar/importar `.sav`
- **Tela cheia e escala inteira** — cada pixel do console vira exatamente N
  pixels na tela. Esticar com `object-fit` dava escala fracionária, e o
  arredondamento deixava uns pixels com 3 px de lado e outros com 4
- **Sabe que jogo é** — o cabeçalho do cartucho é lido no carregamento e a tela
  diz "base: Emerald · Geração III" além do nome do arquivo
- **Ligada ao resto do site** — com um jogo rodando, três links levam à dex
  daquela geração, à região no mapa e à geração na lore
- **Galeria de capturas** por jogo, com miniatura, data, baixar de novo e
  apagar — antes o PNG ficava no FS para sempre e a cota crescia invisível
- **Seu time, lido do save** — o save de bateria de Gen 3 é interpretado e o
  time aparece com as **mesmas cartas** da Pokédex, com apelido e nível. É onde
  o emulador deixa de ser ilha e vira fonte de dados do site
- **Gamepad virtual** para toque, **gamepad físico** pela Gamepad API (layout
  standard) e **teclas remapeáveis** — clique numa tecla da legenda e pressione
  a nova. A legenda lê do mesmo mapa que o `bindKey`, então não mente
- **Rebobinar** — segure e o jogo anda para trás, até ~10 s
- **Captura de tela** em PNG, com download
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
- **O ponto automático não é aplicado sozinho ao recarregar a página.**
  `loadAutoSaveState` recusa logo depois de um `loadGame` — medido no browser:
  pelo botão da tela, com o jogo já rodando, funciona; na mesma volta do
  carregamento devolve `false`, e continua devolvendo mesmo repetindo por
  segundos. Mesma família do problema de `saveState`/`loadState` abaixo. Então a
  ROM volta sozinha e quem decide retomar é quem joga, no botão — que o aviso
  aponta.
- **Um efeito que dependa do objeto do hook se auto-cancela.** O retorno de
  `useEmulator` é um objeto novo a cada render; com ele na lista de dependências,
  a limpeza do efeito roda a cada renderização. No turbo isso significava ligar e
  desligar no mesmo instante — a tecla nunca pegava. As dependências são as
  funções avulsas, cada uma estável por si.
- **Remapear precisa desvincular, e a API pública não tem isso.** O core guarda
  tecla → ação, então só reescrever o mapa deixaria a tecla antiga disparando em
  paralelo com a nova. Sem função de desvincular exposta, o caminho é o `cwrap`
  cru: `bindKey(tecla, -1)`, um índice que não casa com nenhuma ação. Conferido
  no browser com o jogo rodando — depois de mover Start para outra tecla, Enter
  parou de avançar a tela de título. O acesso ao `cwrap` fica isolado numa
  função só, porque a tipagem publicada do core não o declara.
- **Teclas vêm de `KeyboardEvent.code`, com `key` como recuo.** `code` é a tecla
  física e não muda com o layout — é o que corresponde ao que a pessoa memoriza,
  a posição. Mas nem sempre vem: teclado virtual de sistema, alguns IMEs e
  ferramentas de automação entregam `code` vazio. Nesses casos `key` resolve, e
  se nenhum dos dois servir a tela diz isso em vez de ignorar a tecla.
- **A escala é inteira por padrão.** O canvas era esticado com `object-fit:
  contain`, o que dá fator fracionário; com `image-rendering: pixelated` o
  arredondamento deixa uns pixels do jogo com 3 px de lado e outros com 4, e o
  resultado treme nas bordas e nas fontes. Escala inteira sobra borda preta e é
  o preço certo. Os fatores fixos (1×–4×) são tetos, não pisos: escolher 4× numa
  janela que só comporta 2× aplica 2× e a tela informa o que está valendo.
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
| **Cronologia** | 77 eventos em 6 eras — do Ovo Original de Arceus a Koraidon/Miraidon; filtrável por era ou por pokémon, cada um com fonte citada |
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
| `npm run names:check` | Confere se todo nome usado pelo site resolve para um slug da PokéAPI — a lore, as nove gerações e as 16 dex regionais (precisa de rede) |
| `npm run gen3:species <rom.gba>` | Regera `src/emulator/saveParse/gen3Species.ts` lendo a tabela de espécies da sua ROM. A ROM não entra no repo nem no bundle |
| `npm run gen3:save-check "<arquivo.sav>"` | Valida o leitor de save contra um `.sav` de verdade. A suíte usa um save sintético; este é para quem tem um real |
| `npm run wiki:check` | Confere se todo campo `wiki` aponta para um artigo real da Bulbapedia — sem página inexistente, sem redirect e sem desambiguação (precisa de rede) |
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
│   ├── NotFoundPage.tsx        404 na carcaça do aparelho
│   └── routeModules.ts         Ficha em lazy + preload (a virada de carta precisa do módulo antes de navegar)
│
├── components/
│   ├── Navbar.tsx              Logo Pokéball + nav links
│   ├── Searchbar.tsx           Input debounce
│   ├── Pokedex.tsx             Grid + contador + paginação
│   ├── Card.tsx                Card 2:3 com foil, tilt e badges
│   ├── CardHero.tsx            Versão ampliada do card
│   ├── Pagination.tsx          Desabilita nos limites
│   ├── Skeleton.tsx            Placeholders + fallback de rota lazy
│   ├── TypeFilter.tsx / DexFilter.tsx / RarityFilter.tsx
│   ├── SpriteViewer.tsx        Toggle normal/shiny/animado
│   ├── VarietySwitcher.tsx     Mega, Gigantamax, formas regionais
│   ├── EvolutionChain.tsx
│   ├── PokemonLore.tsx
│   ├── PokemonChip.tsx         Chip de pokémon (lore e mapa)
│   ├── ItemSprite.tsx          Sprite oficial de item, com fallback em emblema
│   ├── WikiSource.tsx          Chip "fonte: Bulbapedia" dos verbetes
│   ├── TypeMatchup.tsx         Efetividade de tipos
│   ├── GenealogyTree.tsx       Árvore de criação: Arceus + painéis de clã
│   ├── WorldMap.tsx            Mapa em papel (folha 1000x640) + legenda acessível
│   ├── ScanlineToggle.tsx      Liga/desliga a scanline, guardada no localStorage
│   └── LoreArt.tsx             Arte SVG (regiões, vilões, portais)
│
├── hooks/
│   ├── usePokemon.ts           React Query wrappers (índice, seleção, página, species, evolution)
│   ├── useFavorites.ts         localStorage sync
│   ├── useFeaturedPokemon.ts   Lendário em destaque na Home
│   ├── useDebounce.ts          Debounce genérico
│   ├── useTiltEffect.ts        Tilt 3D seguindo o mouse
│   ├── useTypewriter.ts        Verbete da dex se escrevendo, uma vez por visita
│   └── useReducedMotion.ts     prefers-reduced-motion
│
├── lib/                        Lógica pura, com testes
│   ├── filters.ts              Índice, busca parcial, interseção, paginação
│   ├── regionForPokemon.ts     Pokémon/geração → id de região
│   ├── localize.ts             Fallback pt-BR → pt → en
│   ├── sprites.ts              Caminho dos sprites locais (id / slug)
│   ├── roughenPath.ts          Ruído de costa determinístico nos paths do mapa
│   ├── scanline.ts             Preferência da scanline, aplicada antes do render
│   └── wiki.ts                 Monta as URLs de fonte
│
├── emulator/                   Integração do core mGBA
│   ├── core.ts                 Carrega /emulator/mgba.js e checa o isolamento
│   ├── useEmulator.ts          Hook que dirige o core (ROM, saves, estados)
│   ├── storage.ts              Persistência: pasta saves/ + status do navegador
│   ├── saveStates.ts           Estado real dos 6 slots, lido do FS do core
│   ├── session.ts              Última ROM, volume e velocidade entre visitas
│   ├── shortcuts.ts            F1–F6, Shift+F1–F6 e turbo no Espaço
│   ├── display.ts              Escala inteira; useDisplay.ts aplica e faz tela cheia
│   ├── capture.ts              Nome das capturas + ajustes do buffer de rebobinar
│   ├── keyBindings.ts          Mapa de teclas (remapeável) + gamepad virtual
│   ├── keyNames.ts             KeyboardEvent → nome SDL que o bindKey aceita
│   ├── useGamepad.ts           Gamepad físico (layout standard) por polling
│   ├── prefs.ts                Preferências no localStorage, com validação
│   └── types.ts                Extensões, slots, status
│
├── contexts/
│   └── favoritesContext.tsx
│
├── data/                       Conteúdo curado (não vem da API)
│   ├── rarity.ts               Lendários / míticos / bebês / iniciais
│   ├── typeMatchups.ts         Matriz canônica 18×18 de efetividade
│   ├── i18n.ts                 Traduções PT-BR de tipos, habitats e genus
│   ├── lore.ts                 77 eventos cronológicos em 6 eras, com fonte citada
│   ├── regions.ts              9 regiões documentadas
│   ├── regionMap.ts            Paths SVG das regiões
│   ├── humans.ts               33 personagens humanos
│   ├── genealogy.ts            Árvore de criação, agrupada em seis clãs
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

- Superfícies: `--bg`, `--surface-1..3`, `--border`, `--border-strong` — tons frios, para a sombra sólida e a borda de janela lerem como menu de jogo
- Texto: `--text`, `--text-muted`, `--text-dim`
- Acentos: `--accent` (fósforo do Game Boy, **o único acento de sistema**: foco, seleção, progresso, cursor), `--accent-hover`, `--accent-ink` (tinta escura legível sobre o fósforo)
- `--accent-alt` é o dourado: destaque secundário e **moldura de raridade**. `--fav` é o vermelho, reservado ao coração de favorito, e `--pokeball-red` guarda o vermelho da marca no ícone
- Papel da carta e do mapa: `--paper`, `--paper-ink`, `--paper-ink-soft`, `--paper-ps`, `--paper-edge`, `--paper-line`
- **Paleta de tipos**: `--t-fire`, `--t-water`, `--t-grass` etc. (18 tipos) — a única cor saturada da tela, e a que desenha a moldura da carta
- Sombras sólidas (`--shadow-card`, `--shadow-hero`, sobre `--shadow-hard`) no lugar de blur, raios (`--radius-card`, `--radius-sm`, `--radius-pill`) e motion (`--dur-*`, `--ease-*`)
- Fontes: `--font-display`, `--font-body` e `--font-pixel` — a bitmap fica em número, rótulo e estado; nunca em texto corrido

O cromo é dark-only por decisão de design. As duas exceções são superfícies de
artefato, não temas: a **carta** e o **mapa** são papel creme, com a moldura da
carta na cor do tipo e o dourado reservado a raridade.

---

## 📝 Notas técnicas

- **Índice de nomes**: um único request (`/pokemon?limit=100000`, ~90 kB) monta o mapa nome → id que alimenta a busca parcial, a ordenação dos filtros e os sprites dos chips da lore. Cacheado por 1 h.
- **Filtros**: cada critério custa no máximo um request e devolve a lista **completa** de nomes; a interseção e a paginação são locais. Só a página visível (48 itens) tem os detalhes buscados — uma página fria leva ~1,9 s e o esqueleto cobre a espera.
- **Geração ≠ dex regional**: são dois filtros, e confundi-los é o erro mais fácil de cometer. A geração IX trouxe **120 espécies novas**; a dex de **Paldea tem 400 entradas**, porque lista tudo que aparece na região venha de onde vier. Os dois números estão certos — por isso o `DexFilter` separa os dois em grupos rotulados, em vez de oferecer só "Geração: IX — Paldea" e deixar o número parecer errado. Kalos e Galar não têm dex única: os jogos dividem em partes, e a lista reflete isso.
- **Sprites locais**: os 1.342 sprites pixelados e os 36 de item ficam em `public/sprites/` (~1,4 MB), baixados uma vez por `npm run sprites` e commitados. Como o caminho é determinístico (id do pokémon / slug do item), a Lore renderiza 140+ chips com **zero** request por pokémon e sem depender de CDN de terceiros.
- **O artwork grande não é local**: 475px × 1.351 daria ~176 MB. Ele continua saindo do objeto `Pokemon` que a PokéAPI já devolve nas telas que buscam o detalhe (card do grid, hero, sprite viewer).
- **Imagens de personagens, regiões e organizações**: não vêm de wiki. O Bulbapedia bloqueia hotlink (`archives.bulbagarden.net` responde 403) e a arte é propriedade da Nintendo/Game Freak. Não existe retrato de treinador em fonte que o projeto possa usar: `PokeAPI/sprites` serve `pokemon`, `items`, `badges` e `types`, e nada de treinador. Então a ilustração dessas seções é SVG gerado no próprio projeto (`LoreArt.tsx`), e a wiki entra como **fonte citada**.
- **A aba de Humanos ilustra pelo time**: cada verbete mostra os sprites dos pokémon da pessoa, que são imagem real de jogo e já estão em `public/sprites/`. O primeiro da lista é o parceiro de assinatura e aparece maior. Antes havia um monograma SVG com as iniciais no lugar — que não dizia nada e ainda colidia: o `id` do gradiente saía das iniciais, e `hb-L` era declarado quatro vezes (Lysandre, Lusamine, Leon, Lillie), então os quatro pintavam com o vermelho do primeiro.
- **Fontes**: cada verbete curado tem um campo `wiki` com o título exato da página na Bulbapedia, validado por `npm run wiki:check`. O texto do site é resumo próprio, não cópia.
- **Título que existe não é título que serve**: a validação cobre três defeitos, e o terceiro passou despercebido por meses. Página inexistente é óbvia; redirect funciona hoje e quebra quando a wiki reorganiza; **página de desambiguação** existe, não é redirect, e mesmo assim não é fonte de nada — abre numa lista de "você quis dizer". Eram sete: `Red`, `Blue`, `Silver`, `Secret Key`, `Battle Frontier`, `Pokémon Mansion` e `Mirage Island`. Cada uma foi resolvida pelo que o próprio verbete descreve — a chave do Rotom é a de Sinnoh, a mansão dos diários do dr. Fuji é a de Kanto, o Frontier de sete Brains é o de Hoenn.
- **Cache**: queries têm `staleTime` de 5–60 min, com `queryKey` compartilhada entre detail, evoluções e formas.
- **Aborts**: todos os fetches recebem `AbortSignal` — trocar de página cancela requests pendentes.
- **Erros**: `fetchJson` devolve `null` só em 404; qualquer outra falha propaga, para a UI distinguir "não existe" de "não deu para consultar".
- **Aliases**: nomes canônicos que a API não aceita direto (`giratina` → `giratina-altered`) passam por `resolveName`, usado tanto no fetch quanto na normalização dos filtros.
- **Nomes de lugar, em português ou em inglês**: a mistura é deliberada, não inconsistência. Cada lugar entra pelo nome que o público brasileiro reconhece — os que ficaram conhecidos pela dublagem do anime aparecem traduzidos ("Ilhas Seafoam", "Floresta Viridian", "Planalto Indigo", "Templo de Snowpoint"), e os que circularam só pelos jogos mantêm o original ("Sky Pillar", "Hall of Origin", "Brass Tower", "Silph Co."). Vale para todos os acervos da Lore; não uniformize.
- **Lore data**: os arquivos em `src/data/*.ts` são curados manualmente. As listas de lendários/míticos podem defasar a cada nova geração; para produção, considere buscar `is_legendary`/`is_mythical` via species endpoint.
- **Emulador**: o core é carregado em runtime de `/emulator/mgba.js`, não pelo bundler — o runtime de threads do Emscripten sobe o worker de pthread a partir da URL do próprio script e resolve o `.wasm` relativo a ela. Por isso os dois arquivos são servidos lado a lado de `public/` (copiados de `node_modules` no `predev`/`prebuild`, e fora do git).
- **Virada de carta**: a transição da grade para a ficha usa a View Transitions API direto, não o `viewTransition` do react-router — o app monta o `BrowserRouter` clássico, e aquele hook exige data router. Como a ficha é lazy, a carta pré-carrega o módulo antes de começar a transição; sem isso o retrato novo pegaria o esqueleto do Suspense no lugar do hero.
- **Costa do mapa**: os nove paths do `regionMap` são curvas suaves, legíveis no arquivo; o recorte de costa é calculado em runtime por `roughenPath`, com semente fixa — determinístico, então não muda entre renders nem entre visitas.
- **Scanline**: ligada por padrão e desligável pela navbar. O estado mora num atributo do `<html>` aplicado antes do primeiro render, para a página não aparecer lisa e só depois ganhar a textura.
- **Romhack tem o cabeçalho do jogo original, byte a byte**. Medido nas ROMs de
  `roms/`: `Pokemon Rocket` e `Pokemon Unbound` têm o bloco `0xA0..0xBF`
  idêntico ao de uma FireRed oficial — mesmo título, mesmo game code, mesmo
  checksum. Não existe campo anti-hack, porque a BIOS valida o logo Nintendo no
  boot e todo hack o preserva; nem o tamanho separa (Rocket tem os mesmos 16 MB
  de uma FireRed). Por isso `romId.ts` devolve a **base** do cartucho e a tela
  põe o nome do arquivo na linha principal. E por isso o game code **nunca**
  pode virar chave de save: os dois hacks gerariam a mesma chave e
  compartilhariam progresso.
- **Tabela de espécies de Gen 3 sai da ROM, não de uma constante**. O save
  guarda o índice interno da espécie, e `nacional = índice − 25` quebra a
  partir do índice 301 — erra 109 das 135 espécies de Hoenn. A própria ROM traz
  `sSpeciesToNationalPokedexNum`. O localizador acha as duas tabelas pelo
  conteúdo (âncoras Bulbasaur/Celebi/Chimecho), e não por offset fixo, que não
  sobrevive a romhack: a Unbound está repontada para `0x166A98C`.
- **O formato do save de Gen 3, medido e não lembrado.** São 32 setores de 4096
  bytes; os 28 primeiros formam dois blocos de 14, e vence o de maior contador.
  Três coisas só apareceram com um save real na mão: **as seções giram dentro do
  bloco** (as posições físicas 0..13 carregavam os ids 10,11,12,13,0,…,9, então
  indexar por posição lê a seção errada); o mGBA **acrescenta 16 bytes** de data
  e hora depois dos 131072; e `playerPartyCount` está em `0x0234`, confirmado
  por varredura — há exatamente um u32 entre 1 e 6 nos primeiros 0x400 bytes.
  `SECTOR_DATA_SIZE` é **3968**, o menor tamanho que valida os 28 checksums;
  esta fixture não o distingue de 4084, porque o espaço entre os dois é zero.
- **`FSSync()` rejeita**, e engolir essa rejeição prendia a tela em
  "Carregando…" para sempre. Carregar é fatal e vira `status` de erro; gravar,
  apagar e importar são recuperáveis e viram aviso sem derrubar o jogo.
- **Save virgem não é progresso, e tem dois formatos**: flash alocada é toda
  `0x00`, flash apagada é toda `0xFF`. O backup em `saves/` recusa qualquer
  buffer uniforme — testar só contra zero deixava o `0xFF` passar.
- **`nav` é seletor de elemento**: a regra da navbar era `nav { position: sticky; z-index: 100; height: 56px }` e pegava **qualquer** `<nav>` da página. Os índices de grupo da Lore (Humanos, Locais) são `<nav>` por semântica e herdavam tudo isso — as fichas boiavam por cima dos cards assim que a página rolava, sem fundo próprio. A regra agora é `.navbar`. Vale a lição para `section`, `header` e `aside`.
- **Porcentagem dentro de custom property**: `--unidade: min(96px, calc((100% - 32px) / N))` é substituída como **texto** e resolvida por propriedade — a porcentagem resolve contra a largura no `width` e contra a **altura** no `height`. Usar a mesma variável nos dois dava uma caixa de 144×59 e o sprite encolhia para caber na menor. A arte de Humanos tira só a largura da variável e deixa a altura para o `aspect-ratio`. Mesma família da armadilha do `color-mix`: variável derivada tem que ser declarada onde a fonte existe.
- **Slug não é nome**: os verbetes curados guardam o slug da PokéAPI (`tapu-koko`, `great-tusk`, `ponyta-galar`) porque é ele que resolve o sprite e a rota da ficha. O chip escrevia esse slug com `text-transform: capitalize`, e saía "Tapu-Koko", "Great-Tusk", "Ponyta-Galar" — nenhum é o nome da criatura. Quem traduz agora é `pokemonLabel`: hífen vira espaço, sufixo regional vira "de Galar", e os nomes de pontuação própria (Ho-Oh, Type: Null, Farfetch'd) ficam numa lista de exceções, porque a regra geral os estragaria.
- **Testes**: `src/lib/*.test.ts` e `src/data/typeMatchups.test.ts` cobrem a lógica pura (interseção de filtros, busca, resolução de região, matriz de tipos). Os componentes não têm testes de render.

---

## 📄 Licença

Uso livre para fins educacionais. Marca Pokémon® é propriedade de Nintendo/Game Freak/The Pokémon Company. Este projeto é um fan-project que consome a [PokéAPI](https://pokeapi.co) pública.
