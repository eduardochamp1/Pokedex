# Auditoria de /jogar — plano de execução

> **Este documento é feito para ser executado em pedaços, por sessões diferentes, sem contexto prévio.**
> Cada tarefa é independente e traz a evidência junto. Marque `- [x]` ao concluir e comite o documento
> junto com o código — o estado das caixas É o registro de progresso.
>
> **Sessão nova começa aqui:** leia "Contexto mínimo" (2 min), olhe o Painel de estado, escolha a
> primeira tarefa não marcada da fase mais baixa, e execute só ela. Não leia o backlog inteiro.

**Origem:** auditoria de 2026-09-20 — 8 lentes paralelas, 42 achados, 31 refutadores adversariais,
5 ângulos de oportunidade. Arquivos irmãos:
- [`2026-09-20-auditoria-jogar-backlog.md`](2026-09-20-auditoria-jogar-backlog.md) — os 42 achados e 25 oportunidades que **não** entraram nas fases abaixo. Consulta, não roteiro.
- `auditoria-jogar.raw.json` — o dado bruto integral (evidência literal, cenários passo a passo).

---

## Painel de estado

| Fase | O que é | Tarefas | Estado |
|---|---|---|---|
| 0 | Bugs confirmados no emulador | 5 | ☐ não iniciada |
| 1 | `romId.ts` — a pedra angular | 1 | ☐ não iniciada |
| 2 | Furar a ilha: a barra de três links | 1 | ☐ não iniciada |
| 3 | Pontes baratas | 4 | ☐ não iniciada |
| 4 | Parsing do save (com porta de pesquisa) | 3 | ☐ não iniciada |

**Ordem recomendada:** 0 → 1 → 2 → 3 → 4. A fase 1 destrava as fases 2, 3 e 4 — fora de ordem,
elas ficam bem mais caras. Dentro de uma fase, qualquer ordem serve.

---

## Contexto mínimo

Pokédex em React 18 + TypeScript strict + Vite 5, interface em pt-BR. Dados de pokémon vêm da
PokéAPI via TanStack Query; a lore é curada à mão em `src/data/`.

A aba `/jogar` é um emulador mGBA-wasm (GB/GBC/GBA): `src/pages/PlayPage.tsx` (870 linhas) e
`src/emulator/` (29 arquivos, `useEmulator.ts` com 890 linhas). Tem ROM por quatro caminhos,
6 save states com miniatura, auto-state a cada 30 s, rebobinar, captura, tela cheia, escalas,
volume, velocidade, gamepad virtual, Gamepad API, remapeamento de teclas, backup em `saves/`.

**O diagnóstico da auditoria:** a aba não é subdesenvolvida — é **desconectada**. As 870 linhas da
PlayPage não têm um único `<Link>`, não importam nada fora de `src/emulator/`, e só três arquivos
no site inteiro citam `/jogar` (Navbar, 404, definição de rota). Os dois lados de cada ponte já
existem; falta o vão do meio.

**Comandos:**
```bash
PATH="/c/Program Files/nodejs":$PATH npm run typecheck   # tsc -b
PATH="/c/Program Files/nodejs":$PATH npm run lint
PATH="/c/Program Files/nodejs":$PATH npm test            # vitest, environment "node"
PATH="/c/Program Files/nodejs":$PATH npm run build
```

**Atribuição nos commits:** siga o padrão dos commits anteriores do repo (autor é o dono;
`Co-Authored-By` de Claude no rodapé). Não comite arquivos `.claude/`.

### O buraco que explica tudo

136 testes em 10 arquivos, todos passando — e **todos sobre funções puras**. `vitest.config.ts` usa
`include: ["src/**/*.test.ts"]` com environment `node`. **Nenhum hook do emulador tem teste.** Nada
toca `FSSync`, `fastForward`, `turbo` ou `useEmulator`. Todo o código com estado e ciclo de vida
está descoberto — e é exatamente onde estão os bugs da Fase 0.

### As cinco desconexões, com endereço nos dois lados

| Um lado | O outro lado | Liga |
|---|---|---|
| `types.ts:42` `consoleOf()` só lê a extensão | `versionGroups.ts:21` já tem `red-blue`…`firered-leafgreen` | grep `versionGroups` em `src/emulator/`: **zero** |
| `MoveList.tsx:124` seletor listando Emerald, Crystal, FireRed | `/jogar` roda exatamente esses | zero |
| `LorePage.tsx:330` badges `Red` `Blue` `Yellow` como `<span>` inerte | `PokemonChip` logo abaixo é clicável | zero |
| `useEmulator.ts:772` captura vira `link.click()` e some | `capture.ts:55` já lê PNG do mesmo dir; `PlayPage.tsx:557` já renderiza | zero |
| `core.ts:239` `getLoadedRom()` | `Navbar.tsx:77` já tem o padrão do contador | zero |

### Fatos medidos na máquina (não são suposição)

- **`roms/` tem 4 ROMs e todas são Gen 3 GBA:** `Pokemon - Emerald.gba` (BPEE),
  `Pokemon - Leaf Green.gba` (BPGE), `Pokemon Rocket - b3.0.gba`, `Pokemon Unbound (v2.1.1.1).gba`
  (32 MB, hack de FireRed → se anuncia como BPRE). **Nenhuma de Gen 1 ou Gen 2.**
  Consequência: a estratégia óbvia de "começar por Gen 1, que é o formato mais simples" entrega
  **zero** para este projeto. O alvo é Gen 3, que é o formato difícil.
- **`saves/Pokemon - Emerald.sav` tem 131072 bytes e está inteiramente zerado** (conferido byte a
  byte). O jogo nunca gravou; o backup copiou a flash recém-alocada. Ver Tarefa 0.3.

---

# Fase 0 — Bugs confirmados no emulador

Os cinco achados abaixo vieram de uma leitura completa de `src/emulator/` + `PlayPage.tsx` +
`public/emulator/mgba.js`. Cada um cita a implementação literal. Nenhum tem teste hoje.

## Tarefa 0.1 — A barra de Velocidade não tem efeito nenhum

**Severidade: alta.** Um controle visível na tela está mentindo para quem joga agora.

**Arquivos:** `src/pages/PlayPage.tsx:129` e `:134`, `src/emulator/useEmulator.ts:711-719`

**O mecanismo:** `setTurbo` é um `useCallback` com `[fastForward]` nas dependências — logo sua
identidade muda toda vez que a barra muda. Esse mesmo `setTurbo` está na lista de dependências do
efeito de atalhos (`PlayPage.tsx:134`) **e** é chamado na limpeza dele (`PlayPage.tsx:129`).
Quando `fastForward` muda, o React desmonta o efeito antigo e roda a limpeza **antiga**, que fecha
sobre o valor **antigo** de `fastForward`, chamando
`coreRef.current?.setFastForwardMultiplier(active ? TURBO_MULTIPLIER : fastForward)` com
`active=false` e o `fastForward` velho. O core volta ao multiplicador anterior um instante depois
de `setFastForward` tê-lo ajustado certo. **A UI mostra o valor novo; o core roda no antigo.**

O comentário em `PlayPage.tsx:131-134` mostra que essa exata classe de problema já foi
diagnosticada e corrigida para o objeto `emu` — só passou batido no `setTurbo`.

**Reprodução:** carregar ROM → ligar "Mostrar FPS" → arrastar Velocidade de 1× para 5× num clique
só. Rótulo diz 5×, jogo continua normal. Confirmação cruzada: segurar e soltar a barra de espaço
(turbo) — ao soltar, `setTurbo(false)` roda com o `fastForward` atual e só então acelera.

- [ ] **Passo 1 — teste que falha primeiro.** Criar `src/emulator/useEmulator.test.ts`. É o
      primeiro teste de hook do módulo: precisa de `environment: "jsdom"` só para esse arquivo
      (docblock `// @vitest-environment jsdom` no topo) e de `@testing-library/react`. Se a
      dependência não existir, instale-a como devDependency. O teste monta o hook com um core
      dublê que registra as chamadas de `setFastForwardMultiplier`, muda `fastForward` de 1 para 5,
      e afirma que a **última** chamada recebida foi `5`.
- [ ] **Passo 2 — rodar e ver falhar.** `npx vitest run src/emulator/useEmulator.test.ts`.
      Esperado: última chamada é `1`, não `5`.
- [ ] **Passo 3 — corrigir.** Tirar `setTurbo` das dependências do efeito e da limpeza. O caminho
      limpo é um `useRef` que guarda a função de turbo mais recente, ou mover o desligamento do
      turbo para um `setFastForwardMultiplier` lido de ref. Siga o mesmo raciocínio que o autor já
      documentou nas linhas 131-134 para o objeto `emu`.
- [ ] **Passo 4 — verificar.** O teste passa; `npm run typecheck` e `npm test` limpos.
- [ ] **Passo 5 — verificar no navegador.** `npm run dev`, carregar ROM, ligar FPS, mexer na barra.
      A velocidade real tem que acompanhar o rótulo **sem** precisar apertar turbo.
- [ ] **Passo 6 — commit.** `fix(emulador): barra de velocidade nao tinha efeito`

## Tarefa 0.2 — `FSSync()` sem catch prende a tela em "Carregando…" para sempre

**Severidade: alta.**

**Arquivo:** `src/emulator/useEmulator.ts:383` (e mais 8 pontos)

**O mecanismo:** `Module.FSSync` rejeita quando `FS.syncfs` devolve erro — verificado no próprio
`public/emulator/mgba.js`:
`Module.FSSync=()=>new Promise((resolve,reject)=>{FS.syncfs(err=>{if(err){reject(new Error(...))}resolve()})})`.
Em `playFile`, o `await core.FSSync()` da linha 383 não tem catch e a função não tem try/catch.
Se o sync rejeita, `playFile` rejeita; quem chama faz `void emu.playFile(file)`
(`PlayPage.tsx:140` e `:397`), então vira unhandled rejection silenciosa e o status fica em
`{kind:"loading"}` indefinidamente — exatamente o sintoma que o comentário de `withTimeout`
(linhas 56-61) diz estar ali para evitar. **A única saída é recarregar a página.**

**Mesmo padrão sem guarda em:** `:449` (resumeLastRom), `:585` (saveState), `:620` (clearState),
`:650` (captureAutoState), `:683` (importSave), `:764` (takeScreenshot), `:815` (sync).

**Que é descuido e não decisão está provado no mesmo arquivo:** as linhas 266 e 554 fazem
`core.FSSync().catch(() => undefined)`.

**Variante mais comum que o caso da cota cheia:** com a cota no limite, clicar em "gravar" num slot
→ `saveState` grava no FS mas o `await core.FSSync()` da linha 585 rejeita → `refreshLibrary()` e
`setNotice()` nunca rodam → o painel não muda e nenhuma mensagem aparece. Quem joga conclui que
falhou e tenta de novo.

- [ ] **Passo 1 — decidir a política antes de codar.** Há dois comportamentos distintos:
      *falha ao carregar* deve virar status de erro com mensagem; *falha ao gravar/sincronizar*
      deve virar um `notice` visível sem derrubar o jogo. Não trate os 9 pontos igual.
- [ ] **Passo 2 — teste que falha primeiro.** No `useEmulator.test.ts` da tarefa anterior, um caso
      com core dublê cujo `FSSync` rejeita: afirmar que o status **não** fica em `loading` e que
      uma mensagem chega ao usuário.
- [ ] **Passo 3 — corrigir os 9 pontos** conforme a política do passo 1. Onde a falha for
      recuperável, `.catch()` com `setNotice`; onde for fatal para a operação, `setStatus({kind:"error"})`
      com texto que diz o que fazer (a cota é a causa provável — o painel "Onde ficam seus saves"
      já mostra uso/quota e pode ser citado na mensagem).
- [ ] **Passo 4 — verificar.** Teste passa; `npm run typecheck`, `npm test`, `npm run build` limpos.
- [ ] **Passo 5 — commit.** `fix(emulador): trata falha de FSSync em vez de travar em carregando`

## Tarefa 0.3 — O backup em `saves/` grava arquivo zerado e diz que é progresso

**Severidade: média.** Achado por acidente enquanto se investigava o parsing de save — e é o seu
`saves/Pokemon - Emerald.sav` real que está assim.

**Arquivo:** `src/emulator/useDiskBackup.ts:51`

**O mecanismo:** o guard testa `data.length === 0`, que só pega o caso de buffer vazio. Um save de
Gen 3 recém-alocado tem os 131072 bytes **certos** e todos **zero** — passa pelo guard e vira
arquivo em `saves/`. O dono fica com um arquivo que parece progresso e não é.

**Verificação:** um save de Gen 3 válido contém a assinatura `0x08012025` no rodapé de cada setor
de 4096 bytes (offset `0x0FF8` dentro do setor). O arquivo atual não tem nenhuma ocorrência.

- [ ] **Passo 1 — teste que falha primeiro.** Em `src/emulator/useDiskBackup.test.ts` (novo, função
      pura extraída): `Uint8Array(131072)` todo zero deve ser recusado; um buffer com a assinatura
      em ao menos um setor deve ser aceito.
- [ ] **Passo 2 — rodar e ver falhar.**
- [ ] **Passo 3 — corrigir.** Extrair um `hasRealSaveData(bytes)` que, além de `length === 0`,
      recuse buffer inteiramente zerado. Deixar a checagem de assinatura para a Fase 4 — aqui basta
      "não é só zeros", que é genérico e não depende de formato.
- [ ] **Passo 4 — limpar o arquivo morto.** Apagar `saves/Pokemon - Emerald.sav` (131072 bytes de
      zero, sem valor) **depois** de confirmar com o dono que não há nada a perder.
- [ ] **Passo 5 — commit.** `fix(emulador): nao grava save zerado como se fosse progresso`

## Tarefa 0.4 — Erro ao carregar ROM nova apaga os controles do jogo que continua rodando

**Severidade: média.**

**Arquivo:** `src/emulator/useEmulator.ts:520` (e os caminhos de `playFile`/`playStored`)

**O mecanismo:** `playLocal`, `playFile` e `playStored` põem o status em `{kind:"error"}` quando
falham ao carregar a ROM **nova**, mas nenhum dos três toca no jogo que já está rodando —
`core.pauseGame()` nunca é chamado nesses caminhos. Em `PlayPage.tsx:44-48`, `currentRom` só existe
para status `running` ou `paused`, então `playing` vira false. E todo o bloco de controles está
atrás de `{playing && (...)}` (`PlayPage.tsx:247`).

**Resultado:** o emulador continua emulando e tocando áudio, o canvas continua atualizando, e
somem da tela ao mesmo tempo: Pausar, Rebobinar, Capturar, Reiniciar, Fechar jogo, Sincronizar,
Tela cheia, Escala, Volume, Velocidade e o gamepad virtual inteiro. Os botões de save state ficam
`disabled` (`:571`, `:583`, `:596`) e "Exportar .sav" também (`:617`). **O jogo fica rodando sem
nenhum comando.**

- [ ] **Passo 1 — decidir o comportamento.** Duas saídas defensáveis: (a) pausar o jogo atual antes
      de tentar carregar o novo, ou (b) manter o status do jogo em execução e mostrar o erro como
      `notice` em vez de trocar o status. **(b) é menos destrutivo** — quem clicou numa ROM
      inválida não pediu para interromper o que estava jogando.
- [ ] **Passo 2 — teste que falha primeiro.** Core dublê com `loadGame` que devolve false: afirmar
      que o status continua `running` e que um notice apareceu.
- [ ] **Passo 3 — corrigir** nos três caminhos (`playLocal`, `playFile`, `playStored`), incluindo o
      estouro do `withTimeout` de 15 s em `playFile` (`:376`).
- [ ] **Passo 4 — verificar.** Teste passa; suíte limpa.
- [ ] **Passo 5 — commit.** `fix(emulador): erro ao carregar rom nao derruba os controles do jogo atual`

## Tarefa 0.5 — A cada 30 s o painel relê tudo e reconstrói 6 miniaturas em base64 na thread principal

**Severidade: média.** Custa FPS e estala o áudio a cada meio minuto.

**Arquivo:** `src/emulator/useEmulator.ts:172` (e `:279`, `capture.ts:45-52`)

**O mecanismo:** `refreshLibrary` está registrado como `autoSaveStateCapturedCallback` (`:279`),
ou seja, roda a cada captura automática. Dentro dele, duas leituras caras e síncronas:
1. `core.getAutoSaveState()` — lê o arquivo de estado **inteiro** só para usar `auto.data.length`
   na linha 174.
2. `readStateThumbnail` para cada slot ocupado (`:167`) — `FS.readFile` do PNG e conversão para
   `data:` URL via `toDataUrl`, que monta a string binária em blocos e passa por `btoa`
   (`capture.ts:45-52`). Até 6 PNGs relidos e recodificados.

Tudo na mesma thread que desenha o canvas e conduz o loop do core. Além do custo, cada miniatura
sai como **string nova**, então os seis `<img src={info.thumbnail}>` (`PlayPage.tsx:558-560`)
recebem src diferente e são redecodificados pelo navegador — o painel pisca junto.

O mesmo custo se repete em "gravar", "regravar", "apagar slot", "capturar agora", "Importar…" e
"remover da biblioteca", que também chamam `refreshLibrary`.

- [ ] **Passo 1 — separar o que é caro do que é barato.** O tamanho do auto-state pode vir de
      `FS.stat` em vez de ler o arquivo inteiro. As miniaturas só precisam ser relidas quando o
      slot correspondente muda — não a cada 30 s.
- [ ] **Passo 2 — implementar.** Um `refreshLibrary({ thumbnails: false })` para o caminho do
      auto-state, e cache das `data:` URL por (slot, mtime) para manter a identidade da string
      estável entre passagens.
- [ ] **Passo 3 — verificar no navegador.** `npm run dev`, gravar nos 6 slots, ligar "Mostrar FPS",
      observar 2 minutos. Sem queda de FPS nem estalo a cada 30 s; o painel não pisca.
- [ ] **Passo 4 — commit.** `perf(emulador): auto-state deixa de reler estado e 6 miniaturas a cada 30s`

---

# Fase 1 — `romId.ts`, a pedra angular

**Uma tarefa. Horas de trabalho. Viabilidade provada. Destrava as fases 2, 3 e 4.**

Hoje o site só olha a extensão do arquivo: `types.ts:42-48` faz
`if (lower.endsWith(".gba")) return "Game Boy Advance"`. Ele não sabe se é Emerald, Tetris ou um
homebrew. Enquanto isso, `versionGroups.ts:21-27` já carrega os ids exatos de todos os jogos que
o core roda. Grep de `versionGroups` em `src/emulator/`: **zero**.

## Tarefa 1.1 — Módulo puro que identifica o jogo pelo cabeçalho do cartucho

**Arquivos:** criar `src/emulator/romId.ts` e `src/emulator/romId.test.ts`

**Assinatura alvo:** recebe os primeiros 512 bytes (`Uint8Array`) e devolve
`{ titulo, codigo, console, jogo, geracao, regiao } | null`.

**Onde os bytes já estão:** `useEmulator.ts:353-399` (`playFile`) e `:510-529` (`playLocal`) — a ROM
já passa por memória no carregamento. Ler alguns bytes de um buffer que já existe é quase de graça.

**Offsets — atenção ao nível de confiança:**
- **GBA** (é o que importa aqui — todas as 4 ROMs do repo são GBA): título, game code de 4 letras
  e maker code em offsets fixos do cabeçalho. Os game codes das suas ROMs foram lidos dos arquivos
  reais: **BPEE** = Emerald, **BPGE** = LeafGreen, **BPRE** = FireRed.
- **GB/GBC** (logo em `0x0104`, título em `0x0134`, flag CGB em `0x0143`): **não verificado.** Esses
  offsets vieram da memória de um agente e não há nenhum `.gb`/`.gbc` no repo para conferir.
  **Confira contra o Pan Docs antes de codar essa metade**, ou deixe-a para depois — ela não bloqueia
  nada, já que a biblioteca real é toda GBA.

**A regra de honestidade com romhack — não pule esta parte.** `Pokemon Unbound` se anuncia como
**BPRE** (FireRed). Mostrar "Pokemon FireRed" para quem clicou em Unbound é mentira de cara limpa.
**Regra:** quando o nome do arquivo e o título interno divergem, **o nome do arquivo manda na linha
principal** e o detectado vira subtítulo (ex.: "base: FireRed").

- [ ] **Passo 1 — testes primeiro.** `romId.test.ts` com buffers montados à mão (não precisa de ROM
      real): um com game code `BPEE` deve devolver Emerald/Gen III/Hoenn; um com `BPGE` deve devolver
      LeafGreen/Gen III/Kanto; um com código desconhecido deve devolver `null` sem estourar; um
      buffer curto demais deve devolver `null`.
- [ ] **Passo 2 — rodar e ver falhar.** `npx vitest run src/emulator/romId.test.ts`
- [ ] **Passo 3 — implementar `romId.ts`.** Módulo puro, sem dependência do core. A tabela de game
      code → `{ versionGroupId, generation, region }` casa com os ids que já existem em
      `src/data/versionGroups.ts:18-51`, `src/data/generations.ts:16-90` e `src/data/regions.ts` —
      **reuse esses ids, não invente novos**, senão a Fase 2 não vai conseguir montar os links.
- [ ] **Passo 4 — ligar em `useEmulator`.** Chamar no carregamento e guardar o resultado no estado
      que `PlayPage` já lê. `consoleOf` (`types.ts:42`) continua como fallback quando `romId`
      devolver `null`.
- [ ] **Passo 5 — mostrar.** O bloco `play-now` (`PlayPage.tsx:153-159`) passa a dizer
      "Emerald · Geração III · Hoenn" em vez de só o nome do arquivo. A lista da pasta `roms/` e a
      biblioteca ganham o título de verdade como linha principal — respeitando a regra do romhack.
- [ ] **Passo 6 — verificar.** Suíte limpa. No navegador: carregar cada uma das 4 ROMs de `roms/`
      e conferir que Unbound **não** se apresenta como FireRed.
- [ ] **Passo 7 — commit.** `feat(emulador): identifica o jogo pelo cabecalho da rom`

---

# Fase 2 — Furar a ilha

## Tarefa 2.1 — A barra "o jogo que você está jogando"

**Payoff: transformador. Um dia. Depende da Fase 1.**

Não é feature nova: é apontar para três páginas que **já existem** e que hoje ninguém alcança de
dentro de `/jogar`. Com Emerald rodando, três links aparecem no bloco `play-now`:

| Link | Destino | Já existe? |
|---|---|---|
| Ver a dex de Hoenn | `/?ger=3` | `homeParams.ts:35-71` já parseia `ger` |
| Hoenn no mapa | `/mapa?region=hoenn` | `MapPage.tsx:15-22` já faz deep-link |
| Geração III na lore | `/lore?aba=generations` | **não** — ver o passo 3 |

- [ ] **Passo 1 — o mais barato primeiro.** Importar `Link` de `react-router-dom` em `PlayPage.tsx`
      (hoje o arquivo não importa nada de roteamento) e adicionar os dois primeiros links, que não
      exigem mudança fora da aba.
- [ ] **Passo 2 — verificar no navegador** que os dois levam ao lugar certo com a região/geração
      corretas para cada uma das 4 ROMs.
- [ ] **Passo 3 — o terceiro link exige mudar a LorePage.** `LorePage.tsx:91` guarda a aba ativa em
      `useState`, não na URL — a lore não é endereçável. Adicionar um parâmetro (`/lore?aba=`) e ler
      o estado inicial dele, no mesmo padrão que `homeParams.ts` já usa. É mudança em página fora de
      `/jogar`: faça com teste do parser de parâmetro, como os outros.
- [ ] **Passo 4 — ressalva honesta.** A dex regional não cobre tudo: FireRed/LeafGreen usam a dex de
      Kanto mas incluem espécies de Johto no pós-jogo. Se o link prometer "a dex deste jogo", ele
      mente um pouco. Prefira rotular como "Geração III" (fato) em vez de "a dex de Emerald"
      (aproximação).
- [ ] **Passo 5 — commit.** `feat(jogar): links para a dex, o mapa e a lore do jogo em execucao`

---

# Fase 3 — Pontes baratas

Quatro tarefas independentes entre si. Todas "viabilidade provada". Pegue qualquer uma.

## Tarefa 3.1 — Galeria de capturas (e o fim do vazamento silencioso)

**Um dia. Payoff alto.**

Hoje a captura vira `link.click()` e some (`useEmulator.ts:772-777`). Mas os PNGs **ficam no FS do
core** — e o painel já sabe renderizar PNG capturado: `capture.ts:55-71` (`readStateThumbnail`) faz
`core.FS.readFile` no mesmo `screenshotsPath` e devolve `toDataUrl(data)`, e `PlayPage.tsx:557-562`
desenha `<img className="play-slot-thumb" src={info.thumbnail} />`. O `unlink` de PNG existe só para
miniatura de slot (`:614-616`), **nunca para captura** — então a cota cresce sozinha, invisível.

- [ ] **Passo 1** — listar `core.FS.readdir(filePaths().screenshotsPath)` filtrando os `.ssN.png`
      que são miniatura de slot. O nome já é ordenável por data de propósito (`capture.ts:18-24`),
      então a ordem cronológica sai de graça.
- [ ] **Passo 2** — painel novo na sidebar, no mesmo molde das `section.play-panel` existentes, com
      miniatura, data, baixar de novo e apagar (`FS.unlink`).
- [ ] **Passo 3 — cuidado com memória.** Não materialize todas as `data:` URL de uma vez: leia
      tamanho por `FS.stat` e só converta as visíveis. Dezenas de PNGs de 240×160 são inofensivas;
      centenas não.
- [ ] **Passo 4 — commit.** `feat(jogar): galeria de capturas por jogo`

## Tarefa 3.2 — A Navbar mostra que tem jogo pausado

**Horas. Payoff médio.**

`core.ts:239-241` expõe `getLoadedRom(): string | null`, com o comentário em `:250` explicando que
sair de `/jogar` pausa. **Nenhuma tela fora da aba lê isso.** A Navbar já tem exatamente o padrão
necessário: `Navbar.tsx:77-79` mostra `<span className="nav-count">` com a contagem de favoritos.

- [ ] **Passo 1** — expor o estado do emulador acima da rota (um hook leve que lê `getLoadedRom()`,
      ou o `last-rom` que `session.ts:14` já guarda no localStorage sob o prefixo
      `pokedex:emulator:` de `prefs.ts:11`).
- [ ] **Passo 2** — ponto ou etiqueta "pausado" no link Jogar, no mesmo molde do `nav-count`.
- [ ] **Passo 3 — commit.** `feat(navbar): sinaliza jogo pausado no link Jogar`

## Tarefa 3.3 — "Você parou em Pokemon - Emerald" na Home

**Horas. Payoff médio.**

`session.ts` (`getLastRom`) e `prefs.ts` (`loadPref`) já sabem qual foi o último jogo — e a Home não
usa. Um cartão discreto ao lado do pokémon em destaque (`HomePage.tsx:93-115` é o molde) devolve a
pessoa ao jogo em um clique, **sem carregar 1,8 MB de emulador só para descobrir isso**.

- [ ] **Passo 1** — ler `getLastRom()` na Home; se não houver, não renderizar nada.
- [ ] **Passo 2 — o que NÃO dá para fazer:** mostrar idade ou tamanho do ponto automático.
      `autoState` vem de `core.getAutoSaveState()` e exige o core vivo. Se esse detalhe for
      desejado, grave um `savePref` com o carimbo na hora da captura — não tente ler da Home.
- [ ] **Passo 3 — commit.** `feat(home): cartao de retomar o ultimo jogo`

## Tarefa 3.4 — Os badges de jogo viram links (MoveList e LorePage)

**Horas. Depende da Fase 1 para saber quais jogos são jogáveis.**

Dois lugares nomeiam os jogos que o emulador roda e não oferecem jogá-los:
- `MoveList.tsx:124-136` — o seletor "Jogo" lista Emerald, Crystal, FireRed.
- `LorePage.tsx:330-336` — badges `Red`/`Blue`/`Yellow` como `<span>` inerte, enquanto o
  `PokemonChip` logo abaixo (`:358-365`) é clicável. A própria página já sabe tornar badge acionável.

- [ ] **Passo 1** — na MoveList, quando o versionGroup escolhido for jogável, link condicional para
      `/jogar?jogo=<id>`.
- [ ] **Passo 2** — a PlayPage lê `?jogo=` e destaca (ou carrega) a ROM correspondente da biblioteca
      **se existir**. Se não existir, **fique calado** — o site não distribui ROM e não deve prometer.
- [ ] **Passo 3** — na LorePage, badges de Gen I–III viram links; Gen IV+ continuam `<span>`, já que
      o core não roda. A assimetria até reforça qual época é jogável aqui.
- [ ] **Passo 4 — commit.** `feat(pokedex): badges de jogo levam para o emulador`

---

# Fase 4 — Parsing do save

**A aposta ambiciosa. Payoff transformador, e o único item com risco real de pesquisa.**

A tese: ler o `.sav` e mostrar o time do jogador com as mesmas cartas da Pokédex. O emulador deixa
de ser ilha e vira **fonte de dados do site**.

### O que já está provado

- **Os bytes estão na mão do JavaScript.** `node_modules/@thenick775/mgba-wasm/dist/mgba.d.ts:288`
  declara `getSave(): Uint8Array | null` — síncrono, é o conteúdo da SRAM/flash, não um handle.
  `useEmulator.ts:659` (exportSave) e `useDiskBackup.ts:50` já consomem isso em produção. O
  comentário em `:664` explica a cópia defensiva contra `SharedArrayBuffer` — o parser precisa do
  mesmo cuidado.
- **O gatilho existe.** `useEmulator.ts:266` registra `saveDataUpdatedCallback`: o core **avisa**
  quando o jogo grava. Use o mesmo throttle de 5 s que `useDiskBackup.ts:47` já aplica.
- **O destino existe e não precisa de componente novo.** `usePokemon.ts:300` exporta
  `usePokemonsByNames(names: string[])`, que devolve `Pokemon[]` pronto. `searchPokemon`
  (`api.ts:107`) aceita id como string — passar `"25"` funciona igual a `"pikachu"`. A ponte inteira
  é: **save → ids nacionais → `usePokemonsByNames` → `<Card>`**. `Card.tsx:18-25` só lê `pokemon`.
- **A tabela de espécies foi extraída das suas ROMs.** Emerald: base `0x3185C8`. LeafGreen:
  `0x245F2C`. 11 bytes por entrada, `0xFF` termina, índice 0 = `"??????????"`.
- **Aritmética não resolve a conversão.** Índices 1–251 batem com o dex nacional; 252–276 são 25
  slots vazios; 277–411 são as 135 espécies de Gen 3. O começo parece aritmético
  (277=TREECKO=nac 252), mas o fim prova que não é: **411=CHIMECHO=nac 358** — fim da ordem interna,
  meio da nacional. **Tabela de conversão é obrigatória.**

### O que NÃO está provado

O parser nunca foi validado contra save real, porque o único `.sav` do repo está zerado (Tarefa 0.3).
**Nenhuma linha de UI antes da Tarefa 4.1.**

## Tarefa 4.1 — Porta de pesquisa: obter um save real e validar o parser

**Faça isto primeiro. Se falhar, a fase 4 para aqui sem custo afundado.**

- [ ] **Passo 1** — jogar Emerald até o primeiro save dentro do jogo, exportar o `.sav` pela própria
      aba, e guardar como fixture de teste (fora do git se for grande; `saves/` já está no gitignore —
      confira antes).
- [ ] **Passo 2** — confirmar a assinatura `0x08012025` no offset `0x0FF8` de algum setor de 4096
      bytes. Se não aparecer, **pare**: a premissa do formato está errada e o resto do plano é inválido.
- [ ] **Passo 3** — escolher qual dos dois blocos de 14 setores (offset `0` e `0xE000`) é o atual,
      pelo contador de gravação em `0x0FFC`.
- [ ] **Passo 4** — localizar a seção do time e conferir que a contagem bate com o time real do jogo.
- [ ] **Passo 5 — decisão.** Os quatro passos acima passaram? Siga para 4.2. Algum falhou?
      Documente o que se aprendeu **neste arquivo** e pare a fase.

## Tarefa 4.2 — `src/emulator/saveParse/gen3.ts`

**Só depois da 4.1.** Módulo puro, testável com a fixture real.

**Estrutura do formato** (verificar cada passo contra a fixture, não confiar na descrição):
1. Cortar em 32 setores de 4096 bytes. Rodapé nos últimos 16: id da seção (u16 `@0x0FF4`),
   checksum (u16 `@0x0FF6`), assinatura `0x08012025` (u32 `@0x0FF8`), contador (u32 `@0x0FFC`).
2. Dois blocos de 14 setores são gravações alternadas; vence o de contador maior.
3. Seções vêm em ordem rotativa — leia **por id**, nunca por posição.
4. `SaveBlock1` = concatenação dos 3968 bytes úteis das seções de id 1, 2, 3, 4, nessa ordem.
   É lá que fica o time: u32 com a contagem (1..6) seguido de até seis registros de 100 bytes.
5. Cada pokémon: personality value (u32 `@0x00`), OT ID (u32 `@0x04`), apelido (10 bytes `@0x08`,
   charset próprio), checksum (u16 `@0x1C`), 48 bytes cifrados `@0x20`.
6. Decifra: XOR de cada palavra de 4 bytes com `(PV ^ OTID)`. Os 48 bytes são quatro sub-blocos de
   12 — Growth, Attacks, EVs, Misc — **na permutação nº `PV % 24`** das 24 possíveis.
7. Growth dá espécie (u16) e experiência; Misc dá os IVs em 5 bits cada num u32 e o bit de ovo;
   nível e HP atual/máximo estão **não cifrados** em `@0x54` e `@0x56`/`@0x58`.

- [ ] **Passo 1** — testes contra a fixture real, começando pelo mais externo (setores, assinatura,
      bloco vencedor) e só então descendo para a decifragem.
- [ ] **Passo 2** — implementar em camadas, cada uma com seu teste.
- [ ] **Passo 3** — tabela de conversão índice interno → id nacional. **Validador automático:**
      `filters.ts:13` (`buildNameIndex`) já constrói o Map nome→id nacional a partir do índice
      completo da PokéAPI (`usePokemon.ts:100`) — use isso para conferir a tabela em vez de revisar
      411 linhas à mão.
- [ ] **Passo 4 — commit.** `feat(emulador): parser de save de gen 3`

## Tarefa 4.3 — Painel "Seu time" em /jogar

- [ ] **Passo 1** — mais uma `section.play-panel` na lista que começa em `PlayPage.tsx:379`. O campo
      `team` entra no objeto `emu` (`useEmulator.ts:832-887`) ao lado de `slots`, `saves`, `localSaves`.
- [ ] **Passo 2** — `usePokemonsByNames(ids.map(String))` → `<Card pokemon={...} variant="mini"
      linkTo={/pokemon/${p.name}} />`. **Apelido, nível e HP entram como rodapé em volta da carta,
      não dentro dela** — `Card.tsx` fica intocado.
- [ ] **Passo 3** — reparsear no `saveDataUpdatedCallback` com throttle de 5 s.
- [ ] **Passo 4 — commit.** `feat(jogar): painel com o time do jogador lido do save`

---

## O que a auditoria descartou

Não refaça estes caminhos — foram investigados e o código não confirma a suspeita. A prova veio de
ler o `public/emulator/mgba.js` literal.

- **`addCoreCallbacks` não acumula listeners entre montagens.** O `mgba.js` mantém um
  `coreCallbackStore` de um ponteiro por evento e faz `removeFunction` do anterior. Voltar para
  `/jogar` substitui, não empilha.
- **Não há corrida entre trocar de ROM e um `saveState` em voo.** `saveStateSlot` e `screenshot` são
  síncronos e acontecem antes do único `await`. Sobra apenas um `setNotice` fora de hora.
- **`deleteRom` cumpre a promessa de `PlayPage.tsx:508`** ("remover mantém o save"). Ele só faz
  `unlink` em `gamePath`; saves de bateria (`/data/saves`) e estados (`/data/states`) ficam intactos.

## Como esta auditoria foi feita, e onde ela é fraca

Oito lentes paralelas produziram 42 achados; cada um seguiu para um cético instruído a **refutar**,
com ordem de derrubar na dúvida.

**Dos 42, só 14 chegaram a ter veredito** — os outros refutadores morreram no limite de sessão.
Dos 14 julgados, **nenhum sobreviveu acima de "média"**: 19 média, 12 baixa, zero alta, zero crítica,
todos com confiança alta. Os refutadores não foram lenientes; derrubaram a severidade de tudo que os
auditores tinham marcado como alta.

**Os 28 sem veredito estão no backlog e não devem ser tratados como fato.** Entre eles, o que mais
merece exame é **"tela cheia no celular deixa o jogo sem controle e sem saída"**: se procede, é o
único com cara de alta que ninguém examinou — o gamepad virtual fica fora do elemento que vira
fullscreen, e no toque ele é o único jeito de jogar.

Os cinco bugs da Fase 0 vieram de um agente separado que leu `src/emulator/` inteiro e o `mgba.js`,
e que descartou três suspeitas com prova. **Eles não passaram por refutação independente** — trate a
evidência como forte, mas confirme reproduzindo antes de corrigir.
