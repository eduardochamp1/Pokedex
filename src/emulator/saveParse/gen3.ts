/**
 * Lê o time e a dex do jogador de um save de Gen 3.
 *
 * **Todas as constantes daqui foram medidas**, não copiadas de memória. A
 * fixture foi um save real de Pokémon Emerald, exportado pela própria aba em
 * 2026-09-20, e cada passo abaixo diz o que a medição mostrou. O plano da
 * auditoria exigia isso explicitamente: escrever o parser antes de ter um save
 * de verdade testaria a imaginação de quem escreveu, não o formato.
 *
 * ## O formato, como ele se apresentou
 *
 * O arquivo tem 131072 bytes de save — e pode ter **mais**: o mGBA acrescenta
 * um rodapé de 16 bytes com data e hora (medido: `26 09 20 00 12 11 58 40 …`,
 * que é 2026-09-20 12:11:58). Tudo além de 131072 é ignorado.
 *
 * São 32 setores de 4096 bytes. Os 28 primeiros formam **dois blocos de 14**,
 * cada um uma fotografia completa do save; o resto guarda outras coisas. Cada
 * setor carrega, no fim, quatro campos:
 *
 * ```
 * 0x0FF4  u16  id da seção (0..13)
 * 0x0FF6  u16  checksum dos dados
 * 0x0FF8  u32  assinatura, sempre 0x08012025
 * 0x0FFC  u32  contador de gravação do bloco
 * ```
 *
 * **As seções giram dentro do bloco.** Medido: no bloco atual da fixture, as
 * posições físicas 0..13 carregavam os ids 10,11,12,13,0,1,…,9. Indexar por
 * posição leria a seção errada — este módulo indexa por id.
 *
 * **O bloco atual é o de maior contador.** Na fixture, bloco A tinha 4 e bloco
 * B tinha 3.
 *
 * **`SECTOR_DATA_SIZE` é 3968, e isso foi medido, não assumido.** Procurei o
 * menor tamanho que valida o checksum dos 28 setores: 3968. E dois setores têm
 * o último byte não-zero em 3967, exatamente o fim da região — então ela é
 * usada inteira. Vale a ressalva: a fixture **não distingue** 3968 de 4084,
 * porque o espaço entre os dois é todo zero neste save e somar zeros não muda
 * o checksum. Um romhack pode usar outro tamanho — a Unbound declara 4080.
 */
import { nationalFromGen3Species } from "./gen3Species";

const TAMANHO_DO_SAVE = 131072;
const SETOR = 4096;
const SETORES_POR_BLOCO = 14;
/** Medido: menor tamanho que valida os 28 checksums da fixture. */
const DADOS_POR_SETOR = 3968;
const ASSINATURA = 0x08012025;

const OFF_ID_DA_SECAO = 0x0ff4;
const OFF_CHECKSUM = 0x0ff6;
const OFF_ASSINATURA = 0x0ff8;
const OFF_CONTADOR = 0x0ffc;

/** SaveBlock1 é a concatenação das seções 1 a 4, nessa ordem. */
const SECOES_DO_SAVEBLOCK1 = [1, 2, 3, 4];

/**
 * Onde fica a contagem do time dentro do SaveBlock1.
 *
 * Medido, não assumido: uma varredura pelos primeiros 0x400 bytes procurando um
 * u32 entre 1 e 6 achou **exatamente uma** posição, `0x0234`, com o valor 1 — e
 * a tela do jogo mostrava um pokémon no time. FireRed e LeafGreen usam outro
 * offset (`0x0034`), que **não** foi verificado aqui: na fixture aquela posição
 * guarda 806170637, que não é contagem de time nenhuma.
 */
const OFF_CONTAGEM_DO_TIME = 0x0234;
const OFF_PRIMEIRO_DO_TIME = 0x0238;
const TAMANHO_DO_REGISTRO = 100;
const MAX_NO_TIME = 6;

/**
 * A dex do jogo, dentro da seção 0 (SaveBlock2): um bit por número nacional,
 * bit `n-1` para o pokémon `n`, 52 bytes cada.
 *
 * Medido no save real de Emerald: capturados deu `[258]` (o Mudkip do time) e
 * vistos deu `[252, 258, 261, 263, 265, 278]` — Treecko, Mudkip, Poochyena,
 * Zigzagoon, Wurmple e Wingull, que é o começo de Emerald. A cópia de "vistos"
 * que o jogo mantém em SaveBlock1 `0x988` bateu bit a bit com a daqui, o que
 * confirma o offset por uma segunda fonte. Ruby, Sapphire e FR/LG têm o mesmo
 * SaveBlock2 nas decompilações, mas isso **não** foi medido.
 */
const OFF_DEX_CAPTURADOS = 0x28;
const OFF_DEX_VISTOS = 0x5c;
/** 52 bytes guardam 416 bits; só 386 são pokémon. */
const TOTAL_DA_DEX = 386;

const OFF_PV = 0x00;
const OFF_OTID = 0x04;
const OFF_APELIDO = 0x08;
const TAMANHO_DO_APELIDO = 10;
const OFF_CHECKSUM_DO_REGISTRO = 0x1c;
const OFF_CIFRADO = 0x20;
const TAMANHO_CIFRADO = 48;
/** Medido na fixture: 5, num Mudkip inicial, com HP 21/21 logo em seguida. */
const OFF_NIVEL = 0x54;
/**
 * Depois do nível vêm os status já calculados, u16 cada: HP atual, HP máximo,
 * atq, def, vel, atq esp, def esp. Medido num Mudkip nv 8: 27/27, 14, 13, 12,
 * 13, 14 — e esses números fecharam com a fórmula de Gen 3 aplicada aos IVs,
 * EVs e natureza lidos abaixo, os seis. É essa conta que prova a ordem.
 */
const OFF_HP_ATUAL = 0x56;
const OFF_STATUS = [0x58, 0x5a, 0x5c, 0x5e, 0x60, 0x62];

/**
 * Dentro das subestruturas decifradas. Medido no mesmo Mudkip: amizade 87;
 * golpes 33, 45, 189 (Tackle, Growl, Mud-Slap) com PP 35, 40, 10; EVs e IVs na
 * ordem hp, atq, def, vel, atq esp, def esp — 5 bits por IV, e o bit 31 da
 * palavra é o slot de habilidade.
 */
const OFF_G_AMIZADE = 9;
const OFF_A_PP = 8;
const OFF_M_IVS = 4;

/**
 * As 24 ordens possíveis das quatro subestruturas de 12 bytes.
 *
 * G = crescimento (espécie), A = golpes, E = EVs, M = diversos. Qual ordem vale
 * sai de `PV % 24`. Na fixture deu `EMGA`, e o checksum bateu — que é o que
 * prova a permutação junto com a decifragem.
 */
const ORDENS = [
  "GAEM", "GAME", "GEAM", "GEMA", "GMAE", "GMEA",
  "AGEM", "AGME", "AEGM", "AEMG", "AMGE", "AMEG",
  "EGAM", "EGMA", "EAGM", "EAMG", "EMGA", "EMAG",
  "MGAE", "MGEA", "MAGE", "MAEG", "MEGA", "MEAG",
];

/**
 * Charset de Gen 3 dentro do jogo.
 *
 * Não é ASCII e **não é o mesmo** do cabeçalho do cartucho em `romId.ts`: ali as
 * letras são ASCII puro, aqui `A` é 0xBB. Confirmado decodificando o nome do
 * jogador da fixture — deu "ZE", que é o que a tela do jogo mostrava.
 */
const CHARSET = new Map<number, string>([
  [0x00, " "],
  [0xad, "."],
  [0xae, "-"],
  [0xb4, "'"],
  [0xb5, "♂"],
  [0xb6, "♀"],
]);
for (let i = 0; i < 10; i++) CHARSET.set(0xa1 + i, String(i));
for (let i = 0; i < 26; i++) {
  CHARSET.set(0xbb + i, String.fromCharCode(65 + i));
  CHARSET.set(0xd5 + i, String.fromCharCode(97 + i));
}
const TERMINADOR = 0xff;

export interface Gen3PartyMember {
  /** Posição no time, de 0 a 5. */
  slot: number;
  /** Número na dex nacional. */
  national: number;
  /** Apelido como está gravado — costuma ser o nome da espécie em maiúsculas. */
  nickname: string;
  level: number;
  /** 0..24, `PV % 25`. O nome e o efeito ficam em `lib/gen3Stats`. */
  nature: number;
  ivs: Gen3StatSpread;
  evs: Gen3StatSpread;
  /** Só os slots ocupados. `id` é o número do golpe, igual ao da PokéAPI. */
  moves: { id: number; pp: number }[];
  friendship: number;
  /** Os status como o jogo calculou e gravou — o registro de time os guarda. */
  stats: Gen3StatSpread & { maxHp: number };
  shiny: boolean;
  /** Qual das (até) duas habilidades comuns da espécie. */
  abilitySlot: 0 | 1;
}

export interface Gen3StatSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** Números nacionais, em ordem crescente. `owned` está sempre contido em `seen`. */
export interface Gen3Pokedex {
  seen: number[];
  owned: number[];
}

export interface Gen3Save {
  playerName: string;
  party: Gen3PartyMember[];
  /** `null` quando os bits não passam na sanidade — ver `lerDex`. */
  pokedex: Gen3Pokedex | null;
}

function lerTexto(bytes: Uint8Array, offset: number, tamanho: number): string {
  let texto = "";
  for (let i = 0; i < tamanho; i++) {
    const byte = bytes[offset + i];
    if (byte === undefined || byte === TERMINADOR) break;
    texto += CHARSET.get(byte) ?? "";
  }
  return texto.trimEnd();
}

interface Bloco {
  /** id da seção -> offset do início dela no arquivo. */
  secoes: Map<number, number>;
  contador: number;
  completo: boolean;
}

function lerBloco(view: DataView, primeiroSetor: number): Bloco {
  const secoes = new Map<number, number>();
  let contador = 0;
  for (let i = 0; i < SETORES_POR_BLOCO; i++) {
    const base = (primeiroSetor + i) * SETOR;
    if (view.getUint32(base + OFF_ASSINATURA, true) !== ASSINATURA) continue;
    secoes.set(view.getUint16(base + OFF_ID_DA_SECAO, true), base);
    contador = Math.max(contador, view.getUint32(base + OFF_CONTADOR, true));
  }
  return { secoes, contador, completo: secoes.size === SETORES_POR_BLOCO };
}

/** Soma u32 sobre a região de dados, dobrada em 16 bits. */
function checksumDoSetor(view: DataView, base: number): number {
  let soma = 0;
  for (let p = 0; p + 4 <= DADOS_POR_SETOR; p += 4) {
    soma = (soma + view.getUint32(base + p, true)) >>> 0;
  }
  return ((soma >>> 16) + (soma & 0xffff)) & 0xffff;
}

function lerBits(bytes: Uint8Array, offset: number): number[] {
  const numeros: number[] = [];
  for (let n = 1; n <= TOTAL_DA_DEX; n++) {
    const i = n - 1;
    if ((bytes[offset + (i >> 3)] ?? 0) & (1 << (i & 7))) numeros.push(n);
  }
  return numeros;
}

/**
 * O jogo marca visto ao capturar, então capturado fora de visto quer dizer que
 * estes offsets não são os deste jogo. Aí é `null`: não mostrar nada é melhor
 * que pintar a Pokédex de quem joga com lixo.
 */
function lerDex(bytes: Uint8Array, secao0: number): Gen3Pokedex | null {
  const seen = lerBits(bytes, secao0 + OFF_DEX_VISTOS);
  const owned = lerBits(bytes, secao0 + OFF_DEX_CAPTURADOS);
  const vistos = new Set(seen);
  if (!owned.every((n) => vistos.has(n))) return null;
  return { seen, owned };
}

/**
 * Lê o time e a dex do jogador. Devolve `null` quando os bytes não são um save de Gen 3
 * reconhecível — inclusive quando são flash virgem, que é o caso mais comum.
 */
export function parseGen3Save(bytes: Uint8Array): Gen3Save | null {
  if (!bytes || bytes.length < TAMANHO_DO_SAVE) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const a = lerBloco(view, 0);
  const b = lerBloco(view, SETORES_POR_BLOCO);
  // Entre os dois, vence o de maior contador — mas só se estiver completo: um
  // bloco pela metade é uma gravação interrompida, e o antigo ainda vale.
  const candidatos = [a, b]
    .filter((bloco) => bloco.completo)
    .sort((x, y) => y.contador - x.contador);
  const atual = candidatos[0];
  if (!atual) return null;

  // O checksum é o que separa save de lixo com a assinatura certa por acaso.
  for (const base of atual.secoes.values()) {
    if (checksumDoSetor(view, base) !== view.getUint16(base + OFF_CHECKSUM, true)) {
      return null;
    }
  }

  const secao0 = atual.secoes.get(0);
  if (secao0 === undefined) return null;
  const playerName = lerTexto(bytes, secao0, 7);

  // SaveBlock1 é montado juntando as quatro seções: o time atravessa a
  // fronteira entre elas, então ler seção por seção partiria registros ao meio.
  const sb1 = new Uint8Array(SECOES_DO_SAVEBLOCK1.length * DADOS_POR_SETOR);
  for (let i = 0; i < SECOES_DO_SAVEBLOCK1.length; i++) {
    const base = atual.secoes.get(SECOES_DO_SAVEBLOCK1[i]);
    if (base === undefined) return null;
    sb1.set(bytes.subarray(base, base + DADOS_POR_SETOR), i * DADOS_POR_SETOR);
  }
  const vb1 = new DataView(sb1.buffer, sb1.byteOffset, sb1.byteLength);

  const contagem = vb1.getUint32(OFF_CONTAGEM_DO_TIME, true);
  if (contagem > MAX_NO_TIME) return null;

  const party: Gen3PartyMember[] = [];
  for (let slot = 0; slot < contagem; slot++) {
    const off = OFF_PRIMEIRO_DO_TIME + slot * TAMANHO_DO_REGISTRO;
    if (off + TAMANHO_DO_REGISTRO > sb1.length) break;

    const pv = vb1.getUint32(off + OFF_PV, true);
    const otid = vb1.getUint32(off + OFF_OTID, true);
    const chave = (pv ^ otid) >>> 0;

    const claro = new DataView(new ArrayBuffer(TAMANHO_CIFRADO));
    for (let w = 0; w * 4 < TAMANHO_CIFRADO; w++) {
      const cifrado = vb1.getUint32(off + OFF_CIFRADO + w * 4, true);
      claro.setUint32(w * 4, (cifrado ^ chave) >>> 0, true);
    }

    // Soma u16 sobre os 48 bytes decifrados. Se não bater, a chave ou a leitura
    // estão erradas e o registro não vale — melhor pular do que inventar um
    // pokémon.
    let soma = 0;
    for (let p = 0; p < TAMANHO_CIFRADO; p += 2) {
      soma = (soma + claro.getUint16(p, true)) & 0xffff;
    }
    if (soma !== vb1.getUint16(off + OFF_CHECKSUM_DO_REGISTRO, true)) continue;

    const ordem = ORDENS[pv % 24];
    const G = ordem.indexOf("G") * 12;
    const national = nationalFromGen3Species(claro.getUint16(G, true));
    if (national === undefined) continue;

    const A = ordem.indexOf("A") * 12;
    const E = ordem.indexOf("E") * 12;
    const M = ordem.indexOf("M") * 12;

    const moves: { id: number; pp: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const id = claro.getUint16(A + i * 2, true);
      if (id !== 0) moves.push({ id, pp: claro.getUint8(A + OFF_A_PP + i) });
    }

    const palavraIv = claro.getUint32(M + OFF_M_IVS, true);
    const iv = (i: number) => (palavraIv >>> (i * 5)) & 31;
    const ev = (i: number) => claro.getUint8(E + i);
    const status = OFF_STATUS.map((o) => vb1.getUint16(off + o, true));

    const tid = otid & 0xffff;
    const sid = otid >>> 16;

    party.push({
      slot,
      national,
      nickname: lerTexto(sb1, off + OFF_APELIDO, TAMANHO_DO_APELIDO),
      level: sb1[off + OFF_NIVEL] ?? 0,
      nature: pv % 25,
      // A ordem do jogo põe a velocidade antes dos especiais.
      ivs: { hp: iv(0), atk: iv(1), def: iv(2), spe: iv(3), spa: iv(4), spd: iv(5) },
      evs: { hp: ev(0), atk: ev(1), def: ev(2), spe: ev(3), spa: ev(4), spd: ev(5) },
      moves,
      friendship: claro.getUint8(G + OFF_G_AMIZADE),
      stats: {
        hp: vb1.getUint16(off + OFF_HP_ATUAL, true),
        maxHp: status[0],
        atk: status[1],
        def: status[2],
        spe: status[3],
        spa: status[4],
        spd: status[5],
      },
      shiny: (tid ^ sid ^ (pv >>> 16) ^ (pv & 0xffff)) < 8,
      abilitySlot: (palavraIv >>> 31) as 0 | 1,
    });
  }

  return { playerName, party, pokedex: lerDex(bytes, secao0) };
}
