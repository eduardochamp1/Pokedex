# Pokédex pessoal — o save diz o que você já pegou

**Data:** 2026-09-26
**Direção:** A1 do brainstorm "o save como fonte de dados"

## Objetivo

A Pokédex principal (Home) passa a saber o que o jogador **viu** e **capturou**
no jogo de Gen 3 que roda em `/jogar`. Hoje o save só alimenta o painel do time;
depois disto ele alimenta a grade inteira.

## O que foi medido (não assumido)

No save real de Emerald (`saves/Pokemon - Emerald.sav`, jogador ZE, só um Mudkip
no time), dentro da **seção 0** (SaveBlock2) do bloco atual:

| offset | tamanho | conteúdo | valor medido |
|---|---|---|---|
| `0x28` | 52 bytes | bits de **capturado**, bit `n-1` = dex nacional `n` | `[258]` — Mudkip |
| `0x5C` | 52 bytes | bits de **visto** | `[252, 258, 261, 263, 265, 278]` |

A segunda cópia de "visto" em SaveBlock1 `0x988` bate bit a bit com `0x5C`, o
que confirma o offset por uma fonte independente. Treecko, Mudkip, Poochyena,
Zigzagoon, Wurmple e Wingull é exatamente o que se vê no começo de Emerald.

Ruby/Sapphire/FireRed/LeafGreen: o layout de SaveBlock2 é o mesmo nas
decompilações, mas **não foi medido**. O parser do time já recusa FR/LG (outro
offset de time), então hoje só Emerald chega até aqui de fato.

## Unidades

1. **`parseGen3Save`** (`src/emulator/saveParse/gen3.ts`) ganha
   `pokedex: { seen: number[]; owned: number[] } | null`. Só números de 1 a 386.
   Sanidade: capturado ⊆ visto (o jogo marca visto ao capturar). Se não for,
   `pokedex = null` — melhor não mostrar do que mostrar lixo.
2. **`playerDex`** (`src/lib/playerDex.ts`) — store em `localStorage`, no molde
   de `comparatorStore` (`useSyncExternalStore`). Guarda **uma entrada por ROM**
   (`{ rom, playerName, seen, owned, updatedAt }`) e expõe a mais recente.
   Validação na leitura: entrada com forma errada é descartada.
   Funções puras testáveis: `dexStatusOf(entry, national)`,
   `nationalsFor(entry, filtro)`.
3. **`useEmulator.refreshTeam`** — já parseia o save a cada gravação; passa a
   também chamar `recordPlayerDex(rom, save)`. Nenhum parse a mais.
4. **Home**:
   - filtro **"Seu jogo"** na sidebar, só quando existe uma dex gravada:
     Todos / Capturados / Vistos, não capturados / Não vistos. Parâmetro de URL
     `meu=capturados|vistos|faltam`. Entra na mesma interseção dos outros
     filtros. "Não vistos" se limita a 1–386: é a dex que aquele jogo tem.
   - resumo acima do filtro: "ZE · Pokemon - Emerald — 1 capturado, 6 vistos
     de 386", com barra de progresso.
5. **`Card`** ganha a prop opcional `dexMark?: "owned" | "seen"`, desenhada como
   selo no canto (mesma família de `.card-badge`). Só a grade da Home passa.

## Fora de escopo (YAGNI)

- Escolher entre vários jogos gravados: vale o mais recente.
- Marcar na página de detalhe.
- PC boxes, insígnias, tempo de jogo (isso é a A2).

## Erros

- Save que não abre, ou dex inconsistente: nada é gravado; a Home fica como
  hoje.
- `localStorage` indisponível: o store vira memória da sessão, sem quebrar.
- Entrada de outra versão com forma inválida: descartada na leitura.

## Testes

- `gen3.test.ts`: save construído em código com bits de dex; lê visto e
  capturado; recusa capturado ⊄ visto.
- `gen3Real.test.ts`: com `GEN3_SAVE`, a dex é não nula e capturado ⊆ visto.
- `playerDex.test.ts`: gravar, ler de volta, entrada inválida descartada, mais
  recente vence, `nationalsFor` por filtro.
- `homeParams.test.ts`: `meu` válido e inválido, ida e volta.
- Verificação no navegador: carregar o save, voltar à Home, ver filtro, resumo e
  selos.
