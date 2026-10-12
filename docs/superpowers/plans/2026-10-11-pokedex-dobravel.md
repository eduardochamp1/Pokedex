# Pokédex Dobrável — plano de implementação

> **Para quem executa (humano ou agente em loop):** este arquivo é a fonte da verdade.
> A cada volta: leia **Regras do loop**, pegue a **primeira tarefa desmarcada**, faça só ela,
> verifique, commite, marque `[x]` e pare. Não releia o histórico da conversa: tudo que
> precisa está aqui e em `docs/design_handoff_pokedex_dobravel/`.

**Objetivo:** recriar o site como um aparelho de Pokédex dobrável (carcaça vermelha, dois
painéis com dobradiça, D-pad e A/B), com as 8 abas no padrão "controles à esquerda,
resultado à direita".

**Especificação visual:** `docs/design_handoff_pokedex_dobravel/README.md` (cores, medidas,
tipografia, comportamento de cada aba). Protótipo navegável:
`Pokedex Sistema.dc.html` na mesma pasta — consulte **só o trecho da aba da tarefa**
(procure pelo nome da view), não leia o arquivo inteiro.

**Branch:** `repaginada`. Nada vai para a `main` nem para o GitHub até a tarefa final, e
só com o dono pedindo.

---

## Decisões já tomadas (não reabrir)

1. A lógica existente fica: hooks (`src/hooks`), dados (`src/data`), URL (`homeParams`,
   `loreParams`, `tamanhosParams`, `?time=`, `?region=`), i18n (`useT`/`tr`), favoritos
   (`favoritesContext`), service worker. Muda a apresentação.
2. Selecionar um pokémon navega para `/pokemon/:nome`; `/` e `/pokemon/:nome` renderizam a
   mesma tela (lista à esquerda, ficha à direita). Em `/` sem seleção, a ficha mostra o
   **Pokémon do dia** (`useFeaturedPokemon`); o bloco "Pokémon do dia" separado some.
3. As cartas holográficas (`Card`, `CardHero`, `holo.css`, tilt) deixam de existir no fim.
4. **Calculadora de captura:** mantém a atual (`CapturePanel`, regras de Gen 3), só com o
   visual novo. Não usar a fórmula simplificada do protótipo.
5. **Tamanhos:** mantém `SizeCanvas` com artwork oficial; não implementar o recorte de
   sprites do protótipo.
6. Rótulos em `--font-pixel` (Press Start 2P) vão em CAIXA-ALTA **sem acento** (a fonte não
   tem os glifos). Texto corrido em `--font-display`. Os dois idiomas continuam: o rótulo
   sem acento é a versão PT; a EN vai ao lado, como hoje (`t("LISTA", "LIST")`).
7. Nada de dados de save, emulador ou headers COOP/COEP: isso é do projeto Pokemu.
8. CSS novo em `src/styles/device.css` (aparelho e primitivas) e um arquivo por aba
   (`src/styles/dex.css`, `compare.css`…). O `App.css` antigo só é podado na Fase 4.

## Regras do loop

- **Uma tarefa por volta.** Se a tarefa se mostrar grande demais, divida-a em subtarefas
  neste arquivo, commite o plano e faça a primeira.
- **Antes de editar um arquivo, leia-o.** Reaproveite o componente existente quando ele já
  faz o trabalho; só troque marcação e classes.
- **Verificação obrigatória ao fim de cada tarefa** (todos precisam passar):
  ```bash
  npx tsc -b && npx eslint . && npx vitest run
  ```
  Tarefas marcadas com 👁 também pedem conferência no navegador: `preview_start` com
  `pokedex-dev` (porta 3001), abrir a rota, checar console sem erro e o layout em desktop
  e em 375 px. Feche o servidor ao terminar.
- **Commit por tarefa**, na branch `repaginada`, mensagem em português descrevendo o que
  mudou, terminando com a linha `Co-Authored-By` da sessão. Marque a caixa da tarefa no
  mesmo commit.
- **Não fazer:** push, merge na `main`, mudar dependências, apagar código antigo antes da
  Fase 4 (a não ser o que a própria tarefa manda substituir).
- **Se travar** (teste que não passa após duas tentativas, decisão que é do dono), escreva
  o motivo em **Bloqueios** no fim deste arquivo, commite e pare o loop.
- **Fim de fase:** as tarefas `REVISÃO` param o loop para o dono olhar no preview.

---

## Fase 1 — Aparelho + Pokédex

- [x] **1.1 Tokens e primitivas de estilo.**
  Acrescentar em `src/design/tokens.css`: `--shell #c8202f`, `--shell-dark #8f1523`,
  `--shell-border #7a1220`, `--shell-frame #5c0d18`, `--shell-btn #a8192a`.
  Criar `src/styles/device.css` com as classes do aparelho e as primitivas reutilizadas por
  todas as abas, seguindo "Estrutura global" do handoff: `.dev` (página), `.dev-shell`
  (carcaça), `.dev-top`, `.dev-lens`, `.dev-lights`, `.dev-title`, `.dev-tabs`/`.dev-tab`,
  `.dev-body`, `.dev-pane`/`.dev-pane-left`/`.dev-pane-right`, `.dev-hinge`, `.dev-foot`,
  `.dev-dpad`, `.dev-ab`, `.dev-mtabs` (abas do celular); e primitivas: `.pane-bar` (faixa
  de controles `#151823`), `.pane-scroll` (área rolável), `.pane-band` (faixa verde),
  `.pane-card` (cartão `#151823`), `.px` (texto pixel), `.pane-row` (linha de lista com
  estado selecionado), `.pane-empty`. Breakpoint 860 px. Respeitar
  `prefers-reduced-motion`. Sem componente ainda.

- [x] **1.2 Componente do aparelho.** 👁
  Criar `src/components/device/Device.tsx` (carcaça, barra superior, corpo, rodapé) e
  `src/components/device/DeviceContext.tsx`. O contexto expõe:
  `pane: "left" | "right"`, `setPane`, e um registro que a página preenche com
  `useDevicePage({ labels: [esq, dir], onUp?, onDown?, onLeft?, onRight?, footer? })`.
  O `Device` lê o registro para: rótulos das abas do celular, ação das setas do D-pad,
  texto central do rodapé. Botão A = `setPane("right")`, B = `setPane("left")`.
  Criar `src/components/device/Panes.tsx`: `<Panes left={…} right={…} />` renderiza os
  dois painéis e a dobradiça; abaixo de 860 px mostra só o painel de `pane`.
  Barra superior: as 8 abas com `NavLink` (Favoritos com contador), botão de busca que
  chama `openSearch`, `LangToggle`, `InstallButton`, `ScanlineToggle`.
  Em `App.tsx`: trocar `<Navbar />` + `<main>` pelo `Device` envolvendo as rotas (manter o
  skip-link, `<main id="conteudo">`, `ErrorBoundary`, `Suspense`, `OfflineBanner`,
  `CommandLauncher`); remover `ComparatorButton`. Páginas ainda não migradas renderizam
  dentro do corpo do aparelho em painel único (`.dev-body-single`, rolável) — o site
  continua utilizável.
  Teste: `src/lib/deviceNav.test.ts` (a aba de um endereço). O teste de componente ficou de
  fora: a suíte roda em ambiente node, sem jsdom; A/B e D-pad foram conferidos no navegador.

- [x] **1.3 Pokédex — painel esquerdo.** 👁
  Criar `src/components/dex/DexList.tsx` e `src/styles/dex.css`. Recebe o mesmo estado que
  a `HomePage` já calcula (`current`, `update`, `pokemons`, `total`, `totalPages`). Faixa
  de controles: busca, alternância lista/grade (preferência em `localStorage`
  `pokedex:dex-view`), chips de tipo; os filtros de geração, dex regional, raridade e
  ordem ficam num bloco recolhível "FILTROS" na mesma faixa. Área rolável: modo lista
  (cursor ▶, sprite 72 px via `pixelSpriteUrl`, número, nome, bolinhas de tipo, ♥) e modo
  grade (`minmax(124px,1fr)`, sprite 96 px). Rodapé: "N DE M REGISTRADOS" + paginação.
  Cada item é um `Link` para `/pokemon/:nome` preservando a query atual. O selecionado
  recebe `aria-current`. Skeleton enquanto carrega; estado vazio.

- [x] **1.4 Pokédex — ficha (painel direito), parte 1: cabeçalho, Sobre e Status.** 👁
  Criar `src/components/dex/DexEntry.tsx` (recebe `nameOrId`). Usa `usePokemonDetail` e
  `usePokemonSpecies` como a `DetailPage` atual. Faixa verde: NO., raridade
  (`LEGENDARY`/`MYTHICAL`), `CryButton`, ♥ (favoritos), sprite 128 px, genus, nome, tipos.
  Abas SOBRE/STATUS/EVOL./GOLPES/LOCAL com `role="tablist"`, aba ativa em `?aba=` .
  **Sobre:** flavor text, cartões ALTURA/PESO/CAPTURA, `AbilityList` reestilizada, e as
  seções extras `SpriteViewer`/`SpriteScrubber` e `VarietySwitcher`.
  **Status:** seis barras (cores por faixa: ≥100 verde, ≥60 `#e8c33c`, senão `#e8543f`;
  escala 0–180), TOTAL e `TypeDefense` no formato de grade de 18 tipos.
  Carregando → `Skeleton`; erro/404 → mensagem no painel.

- [x] **1.5 Pokédex — ficha, parte 2: Evol., Golpes e Local.** 👁
  **Evol.:** `EvolutionChain` em linha, sprite 72 px, condição em `#e8c33c` com →, estágio
  atual com borda verde; cada estágio é link para a ficha. **Golpes:** `MoveList` como
  tabela GOLPE/TIPO/CAT./PODER/PREC. mantendo o seletor de jogo. **Local:**
  `EncounterPanel` em cartões + `CapturePanel` (decisão 4) com o visual novo, e
  `PokemonLore` se houver.

- [x] **1.6 Pokédex — página, rotas e teclado.** 👁
  Reescrever `HomePage.tsx` para montar `<Panes left={<DexList/>} right={<DexEntry/>} />`
  e servir `/` e `/pokemon/:nameOrId` (em `App.tsx`, as duas rotas apontam para ela;
  `DetailPage.tsx` e `routeModules.ts` saem). Sem seleção: ficha do Pokémon do dia.
  `useDevicePage`: rótulos LISTA/FICHA; ↑/↓ (teclado fora de campos e D-pad) vão para o
  anterior/próximo da lista atual, ←/→ trocam de página; Esc volta ao painel esquerdo no
  celular; rodapé "NO. 0025 / ↑ ↓ NAVEGAR". Selecionar no celular abre o painel direito.
  Extrair a escolha do vizinho para função pura `src/lib/dexNav.ts` com teste
  (`dexNav.test.ts`: primeiro, último, lista vazia, item fora da lista).
  Atualizar `CommandPalette` e qualquer `Link` para `/pokemon/…` (continuam válidos).

- [x] **1.7 REVISÃO da Fase 1.** Rodar a verificação completa + `npm run build`. Conferir
  no navegador: `/`, `/pokemon/25`, `/?tipo=fire&ger=1`, busca, lista×grade, as cinco abas
  da ficha, favoritar, Ctrl+K, troca de idioma, 375 px (LISTA/FICHA, A/B, D-pad).
  Escrever em **Notas de revisão** o que ficou diferente do handoff. **Parar o loop** e
  avisar o dono.

## Fase 2 — Comparar, Time, Favoritos, Tamanhos

- [x] **2.1 Seletor de elenco compartilhado.**
  Criar `src/components/device/RosterList.tsx`: lista rolável de pokémon com busca, usada
  por Comparar, Time e Tamanhos. Props: `marks(name) → ReactNode` (A/B, ✓/+), `onPick`.
  Fonte: o índice de nomes que `TeamBuilderPage` já usa (`usePokemonIndex` ou equivalente)
  com paginação/virtualização simples (render de 60 por vez, "MAIS").

- [x] **2.2 Comparar.** 👁 `ComparePage.tsx` + `src/styles/compare.css`, seção 2 do handoff.
  Esquerda: ARENA, SLOT A / SLOT B / ⇄ TROCAR, `RosterList` com marcas A/B (tocar atribui
  ao slot ativo e alterna). Direita: faixa verde com os dois sprites e VS; 7 linhas
  espelhadas; dois cartões de EFETIVIDADE (`TypeMatchup`). Manter os parâmetros de URL
  atuais. Rótulos ESCOLHER/DUELO.

- [x] **2.3 Time.** 👁 `TeamBuilderPage.tsx` + `team.css` reescrito, seção 3. Esquerda:
  MONTAR TIME, LIMPAR, `RosterList` com ✓/+ (máx. `MAX_TEAM`). Direita: 6 slots (clicar
  remove), cartões PONTOS FRACOS e NINGUEM ACERTA FORTE, tabela de defesa 18 × membros,
  `TeamSuggestions`. `?time=` continua. Rótulos ELENCO/TIME.

- [x] **2.4 Favoritos.** 👁 `FavoritesPage.tsx` + `favorites.css`, seção 8. Esquerda:
  COLECAO (tocar remove). Direita: "SUA COLECAO N CARTAS", grade `minmax(168px,1fr)` de
  fichas (sprite 112 px, nome, tipos, barras PS/ATK/DEF); tocar abre `/pokemon/:nome`.
  Estado vazio. Rótulos COLECAO/FICHAS.

- [x] **2.5 Tamanhos.** 👁 `SizesPage.tsx` + `sizes.css`, seção 7 e decisão 5. Esquerda:
  comparações prontas e `RosterList` com ✓/+. Direita: faixa "COMPARADOR DE TAMANHO" e
  `SizeCanvas`. `comparatorStore` e `tamanhosParams` continuam. Rótulos ELENCO/COMPARAR.

- [x] **2.6 REVISÃO da Fase 2.** Verificação + build + navegador nas quatro abas, desktop
  e 375 px. Notas de revisão. **Parar o loop.**

## Fase 3 — Mapa, Lore, Quiz

- [ ] **3.1 Mapa.** 👁 `MapPage.tsx`, seção 4. Esquerda: `WorldMap` (com `roughenPath` e a
  emenda Johto/Kanto que já existem) sobre fundo papel. Direita: vazio = "SELECIONE UMA
  REGIAO NO MAPA"; com seleção = faixa verde (DOSSIE · GERACAO N, nome, inspiração) e os
  blocos atuais do dossiê em cartões. `?region=` continua; selecionar no celular abre o
  painel direito. Rótulos MAPA/DOSSIE.

- [ ] **3.2 Lore — estrutura.** 👁 Em `LorePage.tsx`: as 13 abas viram lista de botões à
  esquerda (44 px, ativa com ▶ e borda verde), junto com a busca e os filtros que já
  existem; a direita ganha a faixa verde com o título da seção e passa a ser o contêiner
  de leitura. `parseLoreTab` e os demais parâmetros continuam. Rótulos SECOES/LEITURA.
  Extrair cada aba para `src/components/lore/<Aba>.tsx` **só se** isso for necessário para
  o arquivo caber na tarefa; não reescrever conteúdo.

- [ ] **3.3 Lore — padrão de leitura.** 👁 `lore.css`: cartões `#151823`, tag em `#e8c33c`,
  título 18 px, corpo 15 px, aplicados às 13 seções. Manter `GenealogyTree`,
  `PokemonChip`, `WikiSource`, `LoreArt` e os filtros de era e de pokémon.

- [ ] **3.4 Quiz.** 👁 `QuizPage.tsx` + `quiz.css`, seção 6. Esquerda: modos, seletor de
  geração (`GEN_RANGES`), placar (SEQUENCIA, RECORDE, ACERTOS). Direita: faixa com o
  título do modo, palco 240×240, 4 opções 2×2, resultado + PROXIMO, e a tela final do
  desafio do dia. Lógica (`makeRound`, `quizModes`, `dailyRounds`, `loadBest/saveBest`,
  grito real) intocada. Rótulos MODOS/RODADA.

- [ ] **3.5 REVISÃO da Fase 3.** Verificação + build + navegador. Notas. **Parar o loop.**

## Fase 4 — Restante, limpeza e publicação

- [ ] **4.1 Páginas fora do protótipo.** 👁 `AbilityPage`, `DataPage`, `EvolutionsPage`,
  `GamesPage`, `NotFoundPage`: mesma linguagem (faixa verde + cartões), em dois painéis
  quando houver lista + detalhe, senão painel único.

- [ ] **4.2 Poda.** Apagar o que ninguém mais importa: `Navbar`, `ComparatorButton`,
  `Card`, `CardHero`, `Pokedex`, `holo.css`, `useTiltEffect` etc. (confirmar com busca de
  imports antes de cada remoção). Remover do `App.css` as regras sem uso — conferir cada
  classe com `grep` em `src/**/*.tsx` antes de apagar. Remover testes só dos arquivos
  apagados.

- [ ] **4.3 Acessibilidade e offline.** 👁 Ordem de foco, `aria-current`/`aria-selected`
  nas listas e abas, contraste dos textos sobre a faixa verde e sobre a carcaça, alvos de
  44 px no toque, `prefers-reduced-motion`. Rodar a auditoria axe (nota de memória
  `auditoria-a11y-axe-via-cdp`) em `/`, `/lore`, `/quiz`. `npm run build` + preview:
  o service worker instala e as rotas abrem sem rede.

- [ ] **4.4 README e fechamento.** Atualizar `README.md` (funcionalidades, estrutura,
  design tokens) para o aparelho. Verificação completa + build.

- [ ] **4.5 REVISÃO FINAL.** **Parar o loop.** Resumir para o dono o que foi feito e as
  diferenças em relação ao handoff, e perguntar se pode fazer o merge na `main` e o push.

---

## Notas de revisão

### Fase 1 (2026-10-11)

Conferido no navegador: `/`, `/pokemon/pikachu`, `/pokemon/charizard?tipo=fire&aba=status`,
as cinco abas da ficha, setas do teclado e D-pad, e 375 px (LISTA/FICHA, A/B).

Diferenças em relação ao handoff:

- **Golpes** continua no formato atual (golpes agrupados por método, com seletor de jogo),
  e não a tabela GOLPE/TIPO/CAT./PODER/PREC.: tipo, categoria e poder exigem uma consulta à
  PokéAPI por golpe (dezenas por ficha). Fica como melhoria, se o dono quiser.
- **Sobre** ganhou as seções que o protótipo não tinha: ficha técnica (`PokemonMeta`),
  formas, sprites e o sprite através das gerações.
- **Local** usa a calculadora de captura atual (decisão 4) e o painel de encontros atual, com
  o estilo antigo por dentro; o acabamento visual deles fica para a tarefa 4.2.
- **Formas** (`VarietySwitcher`) ainda usa a carta antiga em miniatura; troca na Fase 4.
- **Filtros** de geração, dex regional, raridade e ordem ficam num bloco recolhível "FILTROS".
- **Celular:** as abas do topo e os chips de tipo viram fileiras que rolam de lado, em vez
  de quebrar em várias linhas.
- **D-pad:** ganhou ◀ ▶ (trocar de página); nas pontas da lista, ▲ ▼ viram a página.
- **Texto da Pokédex** (flavor) sai em inglês quando a PokéAPI não tem português — é o
  comportamento que o site já tinha.
- **Teste de componente** do aparelho não foi escrito (a suíte roda sem jsdom); há testes
  das funções puras `sectionOf` e `neighbor`.
- A transição de virada da carta para a ficha saiu junto com a página de detalhe.

### Fase 2 (2026-10-11)

Conferido no navegador (desktop): `/comparar`, `/time?time=…`, `/favoritos` (favoritar,
abrir e remover) e `/tamanhos?p=…`. O modo celular usa a mesma moldura da Fase 1 e não foi
reconferido aba por aba.

Diferenças em relação ao handoff:

- **Elenco** (`RosterList`) lista o índice inteiro da PokéAPI, 60 por vez, com botão MAIS e
  busca por nome ou número; o sprite sai do id, sem consulta por linha, então a lista não
  mostra bolinhas de tipo.
- **Comparar** continua sem guardar a dupla na URL (já era assim). As barras comparam os dois
  entre si (o maior enche a barra), como na página antiga.
- **Time**: os nomes do time aparecem abaixo dos seis slots, com link para a ficha. A análise
  (pontos fracos, sugestões, defesa, ataque) reaproveita a marcação e o `team.css` atuais.
- **Favoritos**: as fichas mostram as bolinhas de tipo e as três barras, sem número.
- **Tamanhos** usa o `SizeCanvas` atual (decisão 5). O botão 📏 das cartas sumiu junto com
  elas; pôr e tirar agora é pelo elenco.

## Bloqueios

_(vazio)_
