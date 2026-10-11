# Handoff: Pokédex Dobrável (repaginada do site)

## Overview
Repaginada do site `pokedex` (React + TypeScript + react-router, ver `src/`). A Pokédex deixa de ser uma grade de cartas e vira um aparelho de Pokédex dobrável aberto: duas telas lado a lado com uma dobradiça no meio, carcaça vermelha pokébola. Todas as abas do site (Pokédex, Comparar, Time, Mapa, Lore, Quiz, Tamanhos, Favoritos) seguem o mesmo conceito: **controles/lista à esquerda, resultado/ficha à direita**.

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** (protótipos com o visual e o comportamento pretendidos), não código de produção para copiar. A tarefa é **recriar essas telas no código existente** (`pokedex/src`, React + react-router + hooks de dados já existentes) usando os padrões e bibliotecas dele. Os dados nos protótipos são amostras fixas (16 Pokémon); no site real devem vir da PokéAPI e dos módulos `src/data/*` existentes.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamento e interações são finais. Recriar com precisão.

## Arquivos
- `Pokedex Sistema.dc.html`: **protótipo principal**, as 8 abas com navegação entre elas.
- `Pokedex Dobravel v2.dc.html`: só a Pokédex com ficha completa (versão anterior, útil como referência isolada).
- `Pokedex Dobravel.dc.html`: primeira versão (lista + ficha simples).
- `sprites/*.png`: 33 sprites 96×96 copiados de `pokedex/public/sprites/pokemon/` (no site real usar o mesmo diretório).

Os `.dc.html` abrem direto no navegador. A lógica está em uma classe `Component` no fim de cada arquivo (estado, dados de amostra, cálculos). O template usa `{{ }}` e `<sc-for>`/`<sc-if>`, que equivalem a `.map` e renderização condicional em React.

## Estrutura global (shell)
- Página: fundo `#0b0e13`, padding `32px 24px` (mobile: 0), conteúdo centralizado, `max-width: 1280px`.
- **Carcaça**: fundo `#c8202f`, raio 22px, sombra dura `8px 8px 0 #242c3d` + `inset 0 0 0 3px #8f1523`, padding `22px 24px`, gap 14px. Mobile (`< 860px`): sem raio, sem sombra, padding 14px, altura mínima 100vh.
- **Barra superior** (flex, wrap, gap 14px): lente (44px, círculo `#9ad8ff`, borda 4px `#f2f2f5`, anel `0 0 0 3px #7a1220`, brilho branco 12px), três luzes (11px: `#ee1e35`, `#e8c33c`, `#9bbc0f`, borda 2px `#7a1220`), título "POKEDEX" (Press Start 2P 14px, `#f2f2f5`, `text-shadow: 2px 2px 0 #7a1220`), abas de navegação, atalhos "CTRL K" e "PT".
- **Abas de navegação** (Press Start 2P 9px, padding `9px 10px`, raio 6px, borda 2px, min-height 36px): inativa fundo `#a8192a`, texto `#f2f2f5`, borda `#7a1220`, hover `#c8202f`; ativa fundo `#9bbc0f`, texto `#0b0e13`, borda `#0b0e13`. Favoritos mostra contador.
- **Corpo**: flex, altura 760px no desktop (auto no mobile). Painel esquerdo, dobradiça, painel direito.
- **Painéis**: fundo `#10131c`, borda 4px `#5c0d18`, raio `14px 0 0 14px` (esq.) e `0 14px 14px 0` (dir.), `overflow: hidden`, coluna flex. Mobile: raio 10px, um painel por vez.
- **Dobradiça** (só desktop): 26px de largura, fundo `#8f1523`, bordas verticais 2px `#7a1220`, margem vertical 14px, três parafusos 14×34 raio 4 `#5c0d18`.
- **Rodapé do aparelho**: D-pad (grid 3×3 de 44px, `#1e2330`, ativo `#9bbc0f`/`#0b0e13`; ▲ ▼ chamam anterior/próximo), texto central "NO. 0025 / ↑ ↓ NAVEGAR" (Press Start 2P 9px, sombra `1px 1px 0 #7a1220`), botões B (`#2b3345`) e A (`#9bbc0f`) de 48px, borda 3px `#7a1220`, girados −18°. B volta ao painel esquerdo, A abre o direito (útil no mobile).
- **Mobile**: abaixo de 860px aparecem duas abas grandes acima do corpo (rótulos mudam por aba: Pokédex LISTA/FICHA, Comparar ESCOLHER/DUELO, Time ELENCO/TIME, Mapa MAPA/DOSSIE, Lore SECOES/LEITURA, Quiz MODOS/RODADA, Tamanhos ELENCO/COMPARAR, Favoritos COLECAO/FICHAS). Selecionar item na Pokédex/Mapa/Lore troca para o painel direito.

## Tokens
Os tokens já existem em `src/design/tokens.css`; reaproveitar:
- Fundo `--bg #0b0e13`, superfícies `--surface-1 #151823`, `--surface-2 #10131c`, `--surface-3 #1e2330`, bordas `--border #2b3345`, `--border-strong #3a445c`.
- Texto `--text #f2f2f5`, `--text-muted #a2a9b8`, `--text-dim #838a9d`.
- Acento `--accent #9bbc0f` (hover `#b9dc2a`, tinta `#0b0e13`), `--accent-alt #e8c33c`, `--fav #e8543f`, `--pokeball-red #ee1e35`.
- Sombra dura `--shadow-hard #242c3d`.
- Tipos `--t-*` (paleta canônica).
- **Novos** (acrescentar): carcaça `#c8202f`, carcaça escura `#8f1523`, borda carcaça `#7a1220`, moldura de tela `#5c0d18`, botão da carcaça `#a8192a`.
- Fontes: `--font-display` Space Grotesk (nomes e texto), `--font-pixel` Press Start 2P (rótulos, números, estado; **sem acento**, a fonte não tem glifos acentuados, então escrever rótulos em caixa-alta sem acento: PSIQUICO, ELETRICO, NO.). Texto corrido sempre em Space Grotesk.
- Raios: 6px (controles), 10–14px (painéis), 22px (carcaça).

## Telas

### 1. Pokédex (`/`)
**Esquerda**: faixa de controles (fundo `#151823`, padding 14, borda inferior 2px `#2b3345`): busca (44px de altura, fundo `#0b0e13`, borda 2px `#3a445c`, foco `#9bbc0f`), alternância lista/grade (botões 44px; ativo `#9bbc0f`), chips de tipo (Press Start 2P 8px, bolinha da cor do tipo; ativo fundo `#9bbc0f`). Abaixo, área rolável:
- **Lista**: linhas com cursor ▶ (verde), sprite 72px (margem vertical −8px), número (Press Start 2P 9px `#838a9d`), nome (Space Grotesk 700 17px), bolinhas de tipo 12px, ♥ se favorito. Selecionada: fundo `#1e2330`, borda `#9bbc0f`.
- **Grade**: `repeat(auto-fill, minmax(124px, 1fr))`, gap 8; sprite 96px.
- Rodapé: "N DE M REGISTRADOS" e paginação.
**Direita (ficha)**:
- Faixa verde `#9bbc0f` (texto `#0b0e13`): linha com "NO. 0025", raridade (★ LENDARIO / ✦ MITICO), botões ♪ GRITO e ♥ (44px, borda 2px `#0b0e13`); abaixo sprite 128px sobre gradiente radial `#b9dc2a → #9bbc0f`, genus, nome (Space Grotesk 700 32px), tipos (Press Start 2P 9px, fundo cor do tipo, borda `#0b0e13`).
- Abas (SOBRE, STATUS, EVOL., GOLPES, LOCAL): flex, min-height 44, Press Start 2P 8px, borda inferior 4px (ativa `#9bbc0f`, texto `#9bbc0f`; inativa transparente, `#838a9d`).
- **Sobre**: citação do flavor (16px, 1.55), três cartões ALTURA/PESO/CAPTURA, lista de HABILIDADES (tag OCULTA em `#e8c33c`, COMUM em contorno).
- **Status**: seis barras (grid `44px 1fr 36px`; cor da barra: ≥100 verde, ≥60 `#e8c33c`, senão `#e8543f`; escala 0–180), TOTAL, grade de DEFESAS com os 18 tipos (cabeçalho na cor do tipo, abreviação 3 letras; célula ×4 `#ee1e35`, ×2 `#e8543f`, ½/¼ `#1d3a24` com texto `#b9dc2a`, 0 `#0b0e13`).
- **Evol.**: estágios em linha com sprite 72px, rótulo da condição em `#e8c33c` com seta →; estágio atual com borda `#9bbc0f`; clicável quando existe na lista.
- **Golpes**: tabela GOLPE/TIPO/CAT./PODER/PREC. (F físico, E especial, S status).
- **Local**: cartões jogo + local; calculadora de captura (bola Poké 1×, Great 1.5×, Ultra 2×; slider de PS 1–100%; chance = `(b/65536)^4` com `a = (3H−2h)·taxa·bola / 3H`, `b = 1048560 / sqrt(sqrt(16711680/a))`, `a ≥ 255` = 100%).
**Funcionalidades existentes a preservar**: URL com filtros (`homeParams`), filtros de geração/região/raridade, paginação, transição de view para a ficha, `Ctrl+K`, i18n PT/EN (`useT`), favoritos (`favoritesContext`). A ficha vira o painel direito da Home; a rota `/pokemon/:nome` pode continuar existindo e abrir a mesma tela com o Pokémon pré-selecionado. Dados reais: `usePokemonDetail`, `usePokemonSpecies`, `useEvolutionChain`, `AbilityList`, `MoveList`, `EncounterPanel`, `CapturePanel`, `TypeDefense`, `SpriteViewer`, `SpriteScrubber`, `VarietySwitcher`, `CryButton` (esses dois últimos blocos, formas e sprites por geração, não aparecem no protótipo; reaproveitar a lógica e encaixar como seções extras da ficha).

### 2. Comparar (`/comparar`)
Esquerda: faixa com "ARENA", botões SLOT A / SLOT B / ⇄ TROCAR, depois lista de elenco com marcas A e B. Tocar atribui ao slot ativo e alterna o slot.
Direita: faixa verde com dois sprites 112px (nome e tipos) e "VS"; 7 linhas espelhadas (`40px 1fr 52px 1fr 40px`; vencedor em `#9bbc0f`, perdedor barra `#838a9d`); dois cartões de EFETIVIDADE (cada tipo do atacante contra o defensor, com ×N).

### 3. Time (`/time`)
Esquerda: "MONTAR TIME", botão LIMPAR, elenco com ✓ / +. Máx. 6 (`MAX_TEAM`).
Direita: faixa verde com 6 slots quadrados (clicar remove); cartões PONTOS FRACOS (tipos com ≥2 fracos e mais fracos que resistentes) e NINGUEM ACERTA FORTE (tipos que nenhum membro acerta ×2); tabela de defesa 18 linhas × membros + coluna FRACOS (linha marcada com borda `#e8543f`). Usar `defenseTable`, `offenseCoverage`, `teamGaps`, `TeamSuggestions`; time continua na URL (`?time=`).

### 4. Mapa (`/mapa`)
Esquerda: SVG 1000×640, fundo papel `#ede2c2`, borda 2px `#b8892b`, grupo com `transform="translate(-24,22) scale(0.97)"`, paths e cores de `src/data/regionMap.ts` (usar também `roughenPath` para a costa recortada e a emenda Johto/Kanto, omitidas no protótipo). Região selecionada: contorno 4px `#2b2620`. Rótulos Space Grotesk 700 20px `#2b2620`.
Direita: sem seleção mostra "SELECIONE UMA REGIAO NO MAPA". Com seleção: faixa verde (DOSSIE · GERACAO N, nome 36px, inspiração) e corpo com resumo, PROFESSOR e CAMPEAO. No site real incluir também pokémons emblemáticos, locais, eventos, humanos e vilões (blocos existentes de `MapPage`). Região na URL (`?region=`).

### 5. Lore (`/lore`)
Esquerda: 13 seções (Cronologia, Genealogia, Gerações, Regiões, Humanos, Vilões, Dimensões, Batalhas, Mitos, Civilizações, Ovos, Itens, Locais) como lista de botões (44px; ativa com ▶ e borda `#9bbc0f`). Aba na URL (`parseLoreTab`).
Direita: faixa verde com título da seção; cartões `#151823` com tag em `#e8c33c`, título 18px e corpo 15px. No protótipo só Cronologia e Regiões têm conteúdo; as demais devem ganhar o mesmo padrão de leitura (cartões), mantendo os componentes próprios onde existirem (`GenealogyTree`, `PokemonChip`, `WikiSource`, filtros de era e de Pokémon).

### 6. Quiz (`/quiz`)
Esquerda: modos (Silhueta, Grito, Descrição, Tipo, Desafio do dia) e placar (SEQUENCIA, RECORDE, ACERTOS). Falta no protótipo o seletor de geração (`GEN_RANGES`).
Direita: faixa verde com título do modo; palco 240×240 (gradiente verde, borda 4px `#0b0e13`) com sprite em silhueta (`filter: brightness(0)`), botão ♪ OUVIR ou texto da descrição com o nome ocultado; 4 opções em grade 2×2 (correta `#9bbc0f`, errada `#e8543f`, texto `#0b0e13`); depois de responder aparece resultado + PROXIMO. Desafio do dia: 5 rodadas semeadas pelo dia (`dailyRounds`), tela final com pontuação. Usar `makeRound`, `quizModes`, `loadBest/saveBest`, grito real (`cries.latest`).

### 7. Tamanhos (`/tamanhos`)
Esquerda: botões de comparação pronta (as do site: Wailord vs Joltik, Lendários de Kanto, Do menor ao maior) e lista de elenco com ✓ / +.
Direita: faixa verde "COMPARADOR DE TAMANHO"; área com sprites alinhados na base (linha de chão 4px `#9bbc0f`), altura proporcional à altura real (maior = 300px, mínimo 28px), nome e altura embaixo. Os sprites são **cortados no bounding box** da área opaca (canvas `getImageData`, alfa > 20) para a proporção ser real. No site real, `SizeCanvas` com artwork oficial pode substituir isso. Cart em `comparatorStore` e URL (`parseTamanhosParams`) continuam.

### 8. Favoritos (`/favoritos`)
Esquerda: "COLECAO" com lista de favoritos; tocar remove. Direita: faixa verde "SUA COLECAO N CARTAS" e grade `minmax(168px,1fr)` de fichas (sprite 112px sobre gradiente verde, nome, bolinhas de tipo, três barras PS/ATK/DEF). Tocar abre a ficha na Pokédex. Vazio: "NENHUM POKEMON NA SUA COLECAO AINDA".

## Interações
- Teclado: ↑/↓/←/→ navega a lista na Pokédex (fora de inputs); Esc fecha ficha.
- Hover em linhas: fundo `#1e2330`; hover em cartões da coleção: borda `#9bbc0f`; botões do D-pad ativos invertem para `#9bbc0f`.
- Sem animações elaboradas no protótipo. Sugestão: manter `prefers-reduced-motion`; a transição de view-transition `card-flip` pode virar transição do sprite para a ficha.
- `Ctrl+K` abre a paleta de comandos existente.

## Estado (protótipo)
`view`, `sel`, `q`, `type`, `vw` (list/grid), `pane` (mobile), `tab`, `ball`, `hp`, `favs`, `cmpA/cmpB/cmpSlot`, `team`, `region`, `loreTab`, `qmode/round/picked/streak/best/tot/ok/daily`, `sizes`, `trim`. No site real, mover o que já é URL (filtros, time, região, aba da lore, modo do quiz, tamanhos) para `useSearchParams` como hoje; favoritos continuam no contexto.

## Limitações do protótipo (a resolver na implementação)
- 16 Pokémon de amostra; habilidades sem descrição; golpes/locais escritos à mão (conferir contra a PokéAPI).
- Grito é um bip sintetizado (WebAudio); usar o áudio real.
- Lore: só 2 de 13 seções com conteúdo; Mapa sem costa recortada.
- Sem estados de carregamento/erro (usar `Skeleton`, `ErrorBoundary`, `AppStatus` existentes dentro dos painéis).
- Sem remover `ScanlineToggle`, `LangToggle`, `InstallButton`: devem entrar na barra superior (ou em um menu do aparelho).
- Páginas não tratadas: `AbilityPage`, `DataPage`, `EvolutionsPage`, `GamesPage`, `NotFoundPage`; aplicar a mesma linguagem (faixa verde + cartões `#151823`).

## Assets
Sprites em `sprites/` vieram de `pokedex/public/sprites/pokemon/` do próprio projeto. Fontes: Space Grotesk e Press Start 2P (Google Fonts, já usadas pelo site). Nenhum ícone desenhado; símbolos são caracteres (▲ ▼ ☰ ▦ ♥ ♪ ★ ✦).
