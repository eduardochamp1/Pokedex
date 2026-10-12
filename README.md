# Pokédex

Uma Pokédex web completa em **React + TypeScript + Vite**, consumindo a [PokéAPI](https://pokeapi.co) — com filtros combináveis, busca parcial, comparador, favoritos, sprites shiny/animados, formas alternativas (Mega, Gigantamax), evoluções, um mapa-múndi interativo e uma seção completa de **lore** do universo Pokémon.

> O emulador de GB/GBC/GBA e tudo o que lia o save (treinador, ginásios, calculadora
> de dano) saíram daqui para um projeto próprio, o **[Pokemu](https://github.com/eduardochamp1/pokemu)**, em outubro de 2026.

---

## 📟 O aparelho

O site inteiro é uma **Pokédex dobrável aberta**: carcaça vermelha, duas telas com uma
dobradiça no meio, D-pad e botões A/B no rodapé. Toda aba segue o mesmo arranjo —
**controles e lista à esquerda, resultado à direita**.

- **Barra superior** — lente, luzes, as oito abas (Pokédex, Comparar, Time, Mapa, Lore, Quiz,
  Tamanhos, Favoritos), a busca (`Ctrl+K`), idioma, instalar e scanline
- **Pokédex** — `/` e `/pokemon/:nome` são a mesma tela: a lista (ou grade) à esquerda e a
  ficha à direita, com as abas Sobre, Status, Evol., Golpes e Local. Sem seleção, a ficha
  abre no Pokémon do dia
- **D-pad e teclado** — ↑ ↓ andam pela lista e viram a página nas pontas; ← → trocam de página
- **Celular** (abaixo de 860 px) — uma tela por vez, com duas abas grandes (LISTA/FICHA,
  ESCOLHER/DUELO…); A abre a tela da direita, B volta para a da esquerda
- **Rótulos em fonte bitmap vão sem acento** (`PSIQUICO`, `ELETRICO`): a Press Start 2P não
  tem os glifos. Texto corrido fica em Space Grotesk

O conceito e as medidas estão em `docs/design_handoff_pokedex_dobravel/`; o plano de
implementação e o que divergiu dele, em `docs/superpowers/plans/2026-10-11-pokedex-dobravel.md`.

---

## ✨ Funcionalidades

### Pokédex principal
- **Listagem paginada** dos 1.300+ pokémons (25 por página) com cache automático via React Query
- **Busca parcial** com debounce de 350 ms — `pika` encontra os 17 Pikachus; também aceita id (`25`)
- **Filtro por tipo** (18 tipos canônicos) — lista completa, não truncada
- **Filtro por geração** (I — Kanto até IX — Paldea)
- **Filtro por raridade** (lendários, míticos, bebês, iniciais)
- **Cross-filter** — busca + tipo + geração + raridade se combinam por interseção, com o total de resultados visível e paginação real
- **Favoritos persistentes** no `localStorage` com contador na aba Favoritos
- **Pokémon do dia** no topo — o mesmo para todo mundo no mesmo dia, sem
  servidor: `(dia × 389 + 25) mod 1025` passa pelas 1025 espécies antes de repetir

- **Visualizador de sprites** com quatro modos: normal, shiny ✨, animado (GIF), animado shiny ✨
- **Status base** com barras animadas
- **Lore** — texto oficial da Pokédex (PT-BR quando disponível, com fallback em inglês)
- **Badge de raridade** — Lendário 👑, Mítico ✨, Bebê 🍼
- **Evoluções** — a cadeia completa em linha, cada estágio clicável
- **Habilidades clicáveis** — cada uma leva a `/habilidade/:slug`, com o efeito,
  a geração e todos os pokémon que a têm, comum e oculta separadas
- **Formas alternativas** — Mega X/Y, Gigantamax, Origin, Regional, Therian, Ultra, etc.
- **Link para o mapa** — resolve a região de origem pela lista de emblemáticos ou pela geração da espécie
- **Onde encontrar** — rotas, método, nível e chance jogo a jogo, de
  `/pokemon/{id}/encounters`, com os slots de cada área somados numa linha. Abre
  no jogo do seu save (Emerald, FireRed, LeafGreen, Ruby ou Sapphire)
- **Chance de captura** — as oito bolas com as regras de Gen 3, em aritmética
  inteira como em pokeemerald (taxa 45 com HP cheio dá os 6,25% clássicos). A
  Repeat Ball olha a sua dex

### Comparador (`/comparar`)
- **Duas slots** com busca independente e autocomplete de todos os nomes
- **Status lado a lado** com barras espelhadas e vencedor por atributo
- **Efetividade de tipo** nos dois sentidos, via matriz canônica 18×18 local

### Time (`/time`)
- **Até seis pokémon**, guardados na URL (`?time=mudkip,torchic`) — o link
  leva o time junto; importa o time do save com um clique
- **Defesa** — quanto cada tipo de golpe causa em cada membro, com as linhas de
  perigo marcadas (dois ou mais fracos, e mais fracos do que quem resiste)
- **Ataque** — que tipos o time acerta 2×, contando os tipos de cada membro
- **Quem consertaria o time** — as 171 combinações de tipo pontuadas pelo que
  resolvem (aguentar os pontos fracos, acertar o que ninguém acerta) e pelo
  que pioram; as três melhores com espécies daquela combinação exata, das
  listas de `/type`, para adicionar num clique (opção de ficar até a Gen 3)
- Mesma matriz 18×18 do Comparar, sem request

### Quiz (`/quiz`)
- **Quem é esse Pokémon?** — a silhueta é o sprite local com `brightness(0)`;
  quatro alternativas do mesmo recorte de geração (`?ger=3`)
- **Outros modos** (`?modo=`) — **grito** (toca o cry da PokéAPI), **descrição**
  (texto da Pokédex com o nome escondido em todos os idiomas) e **tipo**
  (mostra o pokémon; quatro combinações de tipo para escolher)
- **Desafio do dia** (`?modo=diario`) — cinco rodadas passando pelos quatro
  modos, iguais para todo mundo no mesmo dia sem servidor (sorteio mulberry32
  com o número do dia como semente), uma tentativa por dia e o resultado em
  quadrados para copiar
- Atalhos **1–4** e **Enter**; sequência e recorde por recorte e modo no
  `localStorage`
- As alternativas esperam o índice de nomes: mostrar "#25" antes entregaria a
  resposta

### Favoritos (`/favoritos`)
- Grid reaproveita o cache do detail
- Empty state amigável quando vazio

### Mapa (`/mapa`)
- **SVG cartográfico** das 9 regiões, com hover, tooltip e dossiê por região
- **Legenda em botões reais** — o mapa é operável por teclado e leitor de tela
- **Ilhas e locais notáveis** por região dentro do dossiê, cada um com tipo e fonte
- `?region=<id>` é deep-linkável; id desconhecido mostra aviso em vez de tela vazia

### Seus dados (`/dados`)
Sem conta e sem servidor: o que o site guarda no `localStorage` (favoritos,
recordes e preferências) vai para um arquivo `.json`, e o arquivo importado
em outro navegador substitui os dados de lá, com confirmação e resumo do que
vem.

### Jogos (`/jogos`)
Os 24 jogos principais de 1996 até hoje, por ano de lançamento no Japão, com
plataforma, geração, região e remake. Cada um liga à região no mapa e à aba
de Gerações da lore. Filtros por geração e remakes.

### Evoluções (`/evolucoes`)
As árvores de evolução de todas as espécies, com a condição em cada seta.
Filtro por método (nível, pedra/item, troca, amizade, item segurado, golpe,
lugar, hora do dia, outros), geração, nome e só as que se ramificam, na URL
(`?metodo=trade&ger=1`). As 540 cadeias vêm de um arquivo gerado da
PokéAPI (`src/data/evolutionChains.ts`, 52 KB) — seriam 540 requests por
visita —, carregado só com a página.

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

### Em todo o site
- **Busca com Ctrl+K** (ou `/`, e o botão CTRL K na barra do aparelho) — Pokémon, habilidades,
  regiões, verbetes da lore e páginas num lugar só, só pelo teclado. Carrega na
  primeira abertura, porque indexa a lore inteira
- **Português e inglês** — seletor PT | EN na barra do aparelho; o padrão sai do navegador.
  Tradução em linha (`t("Buscar", "Search")`), ao lado do original. A PokéAPI
  responde no idioma escolhido, sem misturar os dois. A **lore inteira** tem
  versão em inglês em `src/data/en/`, só com os campos de texto, e
  `src/i18n/lore.test.ts` exige par para cada verbete e acusa português
  esquecido no inglês
- **Offline e instalável** — o service worker (`public/sw.js`, escrito à mão)
  guarda o build inteiro na primeira visita: um plugin do Vite
  (`vite-plugin-sw.ts`) injeta a lista de arquivos e a versão. Toda rota abre
  sem rede; sprites e PokéAPI entram no cache
  conforme são vistos (a PokéAPI com teto de 400 respostas). Faixa de "sem
  conexão" e botão **Instalar** quando o navegador oferece

### UX / Visual
- **Tema dark** com paleta em design tokens
- **Paleta canônica por tipo** — cores oficiais para os 18 tipos
- **Responsivo** — grid adapta de 4 → 1 colunas, sidebar vira barra horizontal no mobile
- **Skeleton loaders** durante o fetch inicial; spinner nas rotas carregadas sob demanda
- **`prefers-reduced-motion`** respeitado nas transições e animações
- **Cache inteligente** — trocar de página é instantâneo após a primeira visita
- **404** próprio para rotas inexistentes

---

### Acessibilidade
Auditado com axe-core (WCAG 2.1 A/AA e boas práticas) em todas as rotas e
abas da Lore, sem violações:

- **Um `<main>` por página** (o contêiner do App, destino do "Pular para o
  conteúdo"); os painéis da ficha são `<section>` com `<h2>`, sob um `<h1>`
- **Contraste** — texto dos chips de tipo escuro nas 13 cores claras e branco
  nas 5 escuras (5,6:1 ou mais em todas, sem mudar a paleta); `--text-dim`
  subiu para 4,5:1; títulos de item da Lore clareados no mesmo matiz
- **Nomes acessíveis** — os filtros da Home tinham o rótulo em `display:none`;
  imagens ao lado do próprio nome em texto têm `alt=""`

## 🛠️ Stack

- **[React 19](https://react.dev)** com hooks
- **[TypeScript](https://www.typescriptlang.org/)** em modo estrito
- **[Vite](https://vitejs.dev)** como bundler
- **[React Router](https://reactrouter.com)** para roteamento, com code splitting por rota
- **[TanStack React Query](https://tanstack.com/query)** para cache e sincronia
- **[Vitest](https://vitest.dev)** para os testes de lógica pura
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

A aplicação abre em [http://localhost:3001](http://localhost:3001).

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
| `npm run wiki:check` | Confere se todo campo `wiki` aponta para um artigo real da Bulbapedia — sem página inexistente, sem redirect e sem desambiguação (precisa de rede) |

> **Deploy:** é uma SPA com `BrowserRouter`. O host precisa reescrever qualquer
> rota para `index.html`, senão `/lore` e `/pokemon/:id` dão 404 no refresh.

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
│   ├── HomePage.tsx            A Pokédex: lista à esquerda, ficha à direita (serve / e /pokemon/:nome)
│   ├── ComparePage.tsx         Comparador de 2 pokémons + efetividade
│   ├── FavoritesPage.tsx       Grid dos favoritos
│   ├── LorePage.tsx            13 abas de lore
│   ├── MapPage.tsx             Mapa-múndi + dossiê por região
│   ├── PlayPage.tsx            Emulador GB/GBC/GBA + saves
│   ├── NotFoundPage.tsx        404 na carcaça do aparelho
│
├── components/
│   ├── device/                 O aparelho: Device (carcaça, abas, rodapé), Panes (as duas telas), RosterList (elenco)
│   ├── dex/                    DexList (lista e grade) e DexEntry (a ficha)
│   ├── Skeleton.tsx            Placeholders + fallback de rota lazy
│   ├── DexFilter.tsx / RarityFilter.tsx
│   ├── SpriteViewer.tsx        Toggle normal/shiny/animado
│   ├── VarietySwitcher.tsx     Mega, Gigantamax, formas regionais
│   ├── PokemonLore.tsx
│   ├── PokemonChip.tsx         Chip de pokémon (lore e mapa)
│   ├── ItemSprite.tsx          Sprite oficial de item, com fallback em emblema
│   ├── WikiSource.tsx          Chip "fonte: Bulbapedia" dos verbetes
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
│   ├── useTypewriter.ts        Verbete da dex se escrevendo, uma vez por visita
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


scripts/
└── fetch-sprites.mjs           Baixa os sprites; idempotente

```

---

## 🎨 Design tokens

Tudo em `src/design/tokens.css`, importado pelo `App.css`:

- Superfícies: `--bg`, `--surface-1..3`, `--border`, `--border-strong` — tons frios, para a sombra sólida e a borda de janela lerem como menu de jogo
- Texto: `--text`, `--text-muted`, `--text-dim`
- Acentos: `--accent` (fósforo do Game Boy, **o único acento de sistema**: foco, seleção, progresso, cursor), `--accent-hover`, `--accent-ink` (tinta escura legível sobre o fósforo)
- `--accent-alt` é o dourado: destaque secundário e **moldura de raridade**. `--fav` é o vermelho, reservado ao coração de favorito, e `--pokeball-red` guarda o vermelho da marca no ícone
- Carcaça do aparelho: `--shell`, `--shell-dark`, `--shell-border`, `--shell-frame`, `--shell-btn` — o vermelho pokébola, usado só na carcaça
- Papel do mapa: `--paper`, `--paper-ink`, `--paper-ink-soft`, `--paper-ps`, `--paper-edge`, `--paper-line`
- **Paleta de tipos**: `--t-fire`, `--t-water`, `--t-grass` etc. (18 tipos) — a única cor saturada dentro das telas
- Sombras sólidas (`--shadow-card`, `--shadow-hero`, sobre `--shadow-hard`) no lugar de blur, raios (`--radius-card`, `--radius-sm`, `--radius-pill`) e motion (`--dur-*`, `--ease-*`)
- Fontes: `--font-display`, `--font-body` e `--font-pixel` — a bitmap fica em número, rótulo e estado; nunca em texto corrido

As telas são dark-only por decisão de design. As exceções são superfícies de
artefato, não temas: a **carcaça** vermelha em volta, a **faixa verde** que abre cada
painel de resultado e o **mapa**, que é papel creme.

---

## 📝 Notas técnicas

- **Índice de nomes**: um único request (`/pokemon?limit=100000`, ~90 kB) monta o mapa nome → id que alimenta a busca parcial, a ordenação dos filtros e os sprites dos chips da lore. Cacheado por 1 h.
- **Filtros**: cada critério custa no máximo um request e devolve a lista **completa** de nomes; a interseção e a paginação são locais. Só a página visível (48 itens) tem os detalhes buscados — uma página fria leva ~1,9 s e o esqueleto cobre a espera.
- **Geração ≠ dex regional**: são dois filtros, e confundi-los é o erro mais fácil de cometer. A geração IX trouxe **120 espécies novas**; a dex de **Paldea tem 400 entradas**, porque lista tudo que aparece na região venha de onde vier. Os dois números estão certos — por isso o `DexFilter` separa os dois em grupos rotulados, em vez de oferecer só "Geração: IX — Paldea" e deixar o número parecer errado. Kalos e Galar não têm dex única: os jogos dividem em partes, e a lista reflete isso.
- **Sprites locais**: os 1.342 sprites pixelados e os 36 de item ficam em `public/sprites/` (~1,4 MB), baixados uma vez por `npm run sprites` e commitados. Como o caminho é determinístico (id do pokémon / slug do item), a Lore renderiza 140+ chips com **zero** request por pokémon e sem depender de CDN de terceiros.
- **O artwork grande não é local**: 475px × 1.351 daria ~176 MB. Ele continua saindo do objeto `Pokemon` que a PokéAPI já devolve nas telas que buscam o detalhe (card do grid, hero, sprite viewer).
- **A aba de Humanos ilustra pelo time**: cada verbete mostra os sprites dos pokémon da pessoa, que são imagem real de jogo e já estão em `public/sprites/`. O primeiro da lista é o parceiro de assinatura e aparece maior. Antes havia um monograma SVG com as iniciais no lugar — que não dizia nada e ainda colidia: o `id` do gradiente saía das iniciais, e `hb-L` era declarado quatro vezes (Lysandre, Lusamine, Leon, Lillie), então os quatro pintavam com o vermelho do primeiro.
- **Fontes**: cada verbete curado tem um campo `wiki` com o título exato da página na Bulbapedia, validado por `npm run wiki:check`. O texto do site é resumo próprio, não cópia.
- **Título que existe não é título que serve**: a validação cobre três defeitos, e o terceiro passou despercebido por meses. Página inexistente é óbvia; redirect funciona hoje e quebra quando a wiki reorganiza; **página de desambiguação** existe, não é redirect, e mesmo assim não é fonte de nada — abre numa lista de "você quis dizer". Eram sete: `Red`, `Blue`, `Silver`, `Secret Key`, `Battle Frontier`, `Pokémon Mansion` e `Mirage Island`. Cada uma foi resolvida pelo que o próprio verbete descreve — a chave do Rotom é a de Sinnoh, a mansão dos diários do dr. Fuji é a de Kanto, o Frontier de sete Brains é o de Hoenn.
- **Cache**: queries têm `staleTime` de 5–60 min, com `queryKey` compartilhada entre detail, evoluções e formas.
- **Aborts**: todos os fetches recebem `AbortSignal` — trocar de página cancela requests pendentes.
- **Erros**: `fetchJson` devolve `null` só em 404; qualquer outra falha propaga, para a UI distinguir "não existe" de "não deu para consultar".
- **Aliases**: nomes canônicos que a API não aceita direto (`giratina` → `giratina-altered`) passam por `resolveName`, usado tanto no fetch quanto na normalização dos filtros.
- **Nomes de lugar, em português ou em inglês**: a mistura é deliberada, não inconsistência. Cada lugar entra pelo nome que o público brasileiro reconhece — os que ficaram conhecidos pela dublagem do anime aparecem traduzidos ("Ilhas Seafoam", "Floresta Viridian", "Planalto Indigo", "Templo de Snowpoint"), e os que circularam só pelos jogos mantêm o original ("Sky Pillar", "Hall of Origin", "Brass Tower", "Silph Co."). Vale para todos os acervos da Lore; não uniformize.
- **Lore data**: os arquivos em `src/data/*.ts` são curados manualmente. As listas de lendários/míticos podem defasar a cada nova geração; para produção, considere buscar `is_legendary`/`is_mythical` via species endpoint.
- **Aparelho e páginas**: a página fala com o aparelho por `useDevicePage` (rótulos do celular, texto do rodapé e o que cada seta faz). Os handlers das setas vão por ref, não por estado — eles mudam a cada render, e registrá-los como estado renderizaria o aparelho inteiro a cada tecla. Trocar de aba volta para a tela da esquerda durante o render, não num efeito: o efeito do aparelho roda depois dos da página e desfaria o "abrir a ficha" de quem chega por link direto.
- **Costa do mapa**: os nove paths do `regionMap` são curvas suaves, legíveis no arquivo; o recorte de costa é calculado em runtime por `roughenPath`, com semente fixa — determinístico, então não muda entre renders nem entre visitas.
- **Scanline**: ligada por padrão e desligável pela barra do aparelho. O estado mora num atributo do `<html>` aplicado antes do primeiro render, para a página não aparecer lisa e só depois ganhar a textura.
- **Traduções próprias**: a PokéAPI não tem pt-BR para o texto da Pokédex, para as habilidades nem para os golpes. Os três foram traduzidos e ficam em `src/data/pt/` (1.025 textos de espécie, 314 habilidades com nome, resumo e efeito, 919 nomes de golpe), carregados por `src/i18n/ptData.ts` só quando o idioma é português. Não são traduções oficiais — os jogos nunca saíram em português —, então o nome original em inglês de golpes e habilidades aparece ao lado do traduzido, e é ele que os textos de efeito citam. Unidades foram convertidas para o sistema métrico. A descrição dos golpes e o texto de sabor das habilidades continuam só em inglês na PokéAPI: o primeiro aparece como vem, o segundo sai da tela em português.
- **`nav` é seletor de elemento**: a regra da navbar era `nav { position: sticky; z-index: 100; height: 56px }` e pegava **qualquer** `<nav>` da página. Os índices de grupo da Lore (Humanos, Locais) são `<nav>` por semântica e herdavam tudo isso — as fichas boiavam por cima dos cards assim que a página rolava, sem fundo próprio. A regra agora é `.navbar`. Vale a lição para `section`, `header` e `aside`.
- **Porcentagem dentro de custom property**: `--unidade: min(96px, calc((100% - 32px) / N))` é substituída como **texto** e resolvida por propriedade — a porcentagem resolve contra a largura no `width` e contra a **altura** no `height`. Usar a mesma variável nos dois dava uma caixa de 144×59 e o sprite encolhia para caber na menor. A arte de Humanos tira só a largura da variável e deixa a altura para o `aspect-ratio`. Mesma família da armadilha do `color-mix`: variável derivada tem que ser declarada onde a fonte existe.
- **Slug não é nome**: os verbetes curados guardam o slug da PokéAPI (`tapu-koko`, `great-tusk`, `ponyta-galar`) porque é ele que resolve o sprite e a rota da ficha. O chip escrevia esse slug com `text-transform: capitalize`, e saía "Tapu-Koko", "Great-Tusk", "Ponyta-Galar" — nenhum é o nome da criatura. Quem traduz agora é `pokemonLabel`: hífen vira espaço, sufixo regional vira "de Galar", e os nomes de pontuação própria (Ho-Oh, Type: Null, Farfetch'd) ficam numa lista de exceções, porque a regra geral os estragaria.
- **Testes**: `src/lib/*.test.ts` e `src/data/typeMatchups.test.ts` cobrem a lógica pura (interseção de filtros, busca, resolução de região, matriz de tipos). Os componentes não têm testes de render.

---


## 📄 Licença

Uso livre para fins educacionais. Marca Pokémon® é propriedade de Nintendo/Game Freak/The Pokémon Company. Este projeto é um fan-project que consome a [PokéAPI](https://pokeapi.co) pública.
