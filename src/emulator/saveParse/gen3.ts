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

/**
 * O treinador, medido no save real de Emerald (ZE, 0h45m50s, em Oldale).
 *
 * Na seção 0: gênero em 0x08; TID e SID em 0x0A e 0x0C — 45125 e 47784, os
 * mesmos do OT gravado no Mudkip do time, que é uma fonte independente; tempo
 * de jogo em 0x0E (u16 horas), 0x10 (min), 0x11 (s).
 *
 * Em 0xAC, a chave de segurança de Emerald. O dinheiro, em SaveBlock1 0x490,
 * vem cifrado com ela: o valor bruto era 1.821.742.666, e com o XOR deu 3300 —
 * os 3000 do começo de jogo mais o que se ganha em batalha. Ruby/Sapphire
 * gravam 0 em 0xAC e FR/LG gravam 1; neles o layout é outro e nada disto vale.
 */
const OFF_GENERO = 0x08;
const OFF_TID = 0x0a;
const OFF_SID = 0x0c;
const OFF_HORAS = 0x0e;
const OFF_MINUTOS = 0x10;
const OFF_SEGUNDOS = 0x11;
const OFF_CHAVE_DE_SEGURANCA = 0xac;
const OFF_DINHEIRO = 0x490;
/** Grupo e número do mapa. Medido: 0 e 10, Oldale Town — onde o save foi feito. */
const OFF_MAPA = 0x04;

/**
 * As flags do jogo começam em SaveBlock1 0x1270, uma por bit. Medido na
 * vizinhança das insígnias: 0x860 (tem pokémon) e 0x861 (tem Pokédex) ligadas,
 * 0x862 (PokéNav) desligada, as oito insígnias 0x867–0x86E desligadas e
 * 0x86F (visitou Littleroot) e 0x870 (visitou Oldale) ligadas — exatamente o
 * começo de Emerald, com as insígnias entre flags que se confirmaram.
 */
const OFF_FLAGS = 0x1270;
const FLAG_PRIMEIRA_INSIGNIA = 0x867;
const FLAG_PRIMEIRA_CIDADE = 0x86f;
const INSIGNIAS = 8;
const CIDADES = 16;

/**
 * As caixas do PC: seções 5 a 13 juntas. Um u32 com a caixa atual, 14 caixas ×
 * 30 registros de 80 bytes, e depois os 14 nomes de 9 bytes — medidos: "BOX1"
 * a "BOX14". O registro de caixa é o do time sem os 20 bytes finais.
 */
const SECOES_DO_PC = [5, 6, 7, 8, 9, 10, 11, 12, 13];
const CAIXAS = 14;
const POR_CAIXA = 30;
const TAMANHO_NA_CAIXA = 80;
const OFF_PRIMEIRA_CAIXA = 4;
const OFF_NOMES_DAS_CAIXAS = OFF_PRIMEIRA_CAIXA + CAIXAS * POR_CAIXA * TAMANHO_NA_CAIXA;
const TAMANHO_DO_NOME_DA_CAIXA = 9;

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
  /** O PV não muda ao evoluir: é o que identifica o mesmo pokémon entre saves. */
  personality: number;
}

export interface Gen3Trainer {
  gender: "male" | "female";
  trainerId: number;
  secretId: number;
  playTime: { hours: number; minutes: number; seconds: number };
  money: number;
  /** As oito insígnias de Hoenn, na ordem dos ginásios. */
  badges: boolean[];
  /** Índices, na ordem das flags de cidade visitada, das já visitadas. */
  visitedTowns: number[];
  /** Grupo e número do mapa onde o jogo foi salvo. */
  location: { group: number; num: number };
}

export interface Gen3BoxMon {
  slot: number;
  national: number;
  nickname: string;
  personality: number;
}

export interface Gen3Storage {
  /** Caixa aberta por último, 0..13. */
  current: number;
  boxes: { name: string; pokemon: Gen3BoxMon[] }[];
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
  /** `null` fora de Emerald: só ele foi medido. */
  trainer: Gen3Trainer | null;
  boxes: Gen3Storage | null;
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

interface Registro {
  pv: number;
  otid: number;
  claro: DataView;
  ordem: string;
  national: number;
  nickname: string;
}

/**
 * Decifra os primeiros 80 bytes de um registro — a parte comum a time e caixa.
 * `null` para slot vazio, checksum que não bate ou espécie desconhecida:
 * melhor pular do que inventar um pokémon.
 */
function decifrarRegistro(dados: Uint8Array, off: number): Registro | null {
  const v = new DataView(dados.buffer, dados.byteOffset, dados.byteLength);
  const pv = v.getUint32(off + OFF_PV, true);
  const otid = v.getUint32(off + OFF_OTID, true);
  const chave = (pv ^ otid) >>> 0;

  const claro = new DataView(new ArrayBuffer(TAMANHO_CIFRADO));
  for (let w = 0; w * 4 < TAMANHO_CIFRADO; w++) {
    const cifrado = v.getUint32(off + OFF_CIFRADO + w * 4, true);
    claro.setUint32(w * 4, (cifrado ^ chave) >>> 0, true);
  }

  // Soma u16 sobre os 48 bytes decifrados. Se não bater, a chave ou a leitura
  // estão erradas e o registro não vale.
  let soma = 0;
  for (let p = 0; p < TAMANHO_CIFRADO; p += 2) {
    soma = (soma + claro.getUint16(p, true)) & 0xffff;
  }
  if (soma !== v.getUint16(off + OFF_CHECKSUM_DO_REGISTRO, true)) return null;

  const ordem = ORDENS[pv % 24];
  const national = nationalFromGen3Species(claro.getUint16(ordem.indexOf("G") * 12, true));
  if (national === undefined) return null;

  return {
    pv,
    otid,
    claro,
    ordem,
    national,
    nickname: lerTexto(dados, off + OFF_APELIDO, TAMANHO_DO_APELIDO),
  };
}

/** Junta seções pelo id, na ordem pedida. `null` se faltar alguma. */
function juntarSecoes(
  bytes: Uint8Array,
  secoes: Map<number, number>,
  ids: number[]
): Uint8Array | null {
  const out = new Uint8Array(ids.length * DADOS_POR_SETOR);
  for (let i = 0; i < ids.length; i++) {
    const base = secoes.get(ids[i]);
    if (base === undefined) return null;
    out.set(bytes.subarray(base, base + DADOS_POR_SETOR), i * DADOS_POR_SETOR);
  }
  return out;
}

function lerTreinador(
  view: DataView,
  bytes: Uint8Array,
  secao0: number,
  sb1: Uint8Array
): Gen3Trainer | null {
  const chave = view.getUint32(secao0 + OFF_CHAVE_DE_SEGURANCA, true);
  if (chave === 0 || chave === 1) return null;

  const vb1 = new DataView(sb1.buffer, sb1.byteOffset, sb1.byteLength);
  const flag = (f: number) => ((sb1[OFF_FLAGS + (f >> 3)] ?? 0) >> (f & 7)) & 1;
  const visitedTowns: number[] = [];
  for (let i = 0; i < CIDADES; i++) if (flag(FLAG_PRIMEIRA_CIDADE + i)) visitedTowns.push(i);

  return {
    gender: bytes[secao0 + OFF_GENERO] === 1 ? "female" : "male",
    trainerId: view.getUint16(secao0 + OFF_TID, true),
    secretId: view.getUint16(secao0 + OFF_SID, true),
    playTime: {
      hours: view.getUint16(secao0 + OFF_HORAS, true),
      minutes: bytes[secao0 + OFF_MINUTOS] ?? 0,
      seconds: bytes[secao0 + OFF_SEGUNDOS] ?? 0,
    },
    money: (vb1.getUint32(OFF_DINHEIRO, true) ^ chave) >>> 0,
    badges: Array.from({ length: INSIGNIAS }, (_, i) => flag(FLAG_PRIMEIRA_INSIGNIA + i) === 1),
    visitedTowns,
    location: { group: sb1[OFF_MAPA] ?? 0, num: sb1[OFF_MAPA + 1] ?? 0 },
  };
}

function lerCaixas(pc: Uint8Array): Gen3Storage {
  const v = new DataView(pc.buffer, pc.byteOffset, pc.byteLength);
  const boxes: Gen3Storage["boxes"] = [];
  for (let c = 0; c < CAIXAS; c++) {
    const pokemon: Gen3BoxMon[] = [];
    for (let slot = 0; slot < POR_CAIXA; slot++) {
      const off = OFF_PRIMEIRA_CAIXA + (c * POR_CAIXA + slot) * TAMANHO_NA_CAIXA;
      const r = decifrarRegistro(pc, off);
      if (r) pokemon.push({ slot, national: r.national, nickname: r.nickname, personality: r.pv });
    }
    const nome = OFF_NOMES_DAS_CAIXAS + c * TAMANHO_DO_NOME_DA_CAIXA;
    boxes.push({ name: lerTexto(pc, nome, TAMANHO_DO_NOME_DA_CAIXA), pokemon });
  }
  return { current: v.getUint32(0, true), boxes };
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
  const sb1 = juntarSecoes(bytes, atual.secoes, SECOES_DO_SAVEBLOCK1);
  if (!sb1) return null;
  const vb1 = new DataView(sb1.buffer, sb1.byteOffset, sb1.byteLength);

  const contagem = vb1.getUint32(OFF_CONTAGEM_DO_TIME, true);
  if (contagem > MAX_NO_TIME) return null;

  const party: Gen3PartyMember[] = [];
  for (let slot = 0; slot < contagem; slot++) {
    const off = OFF_PRIMEIRO_DO_TIME + slot * TAMANHO_DO_REGISTRO;
    if (off + TAMANHO_DO_REGISTRO > sb1.length) break;
    const r = decifrarRegistro(sb1, off);
    if (!r) continue;
    const { pv, otid, claro, ordem } = r;

    const G = ordem.indexOf("G") * 12;
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
      national: r.national,
      nickname: r.nickname,
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
      personality: pv,
    });
  }

  const pc = juntarSecoes(bytes, atual.secoes, SECOES_DO_PC);

  return {
    playerName,
    party,
    pokedex: lerDex(bytes, secao0),
    trainer: lerTreinador(view, bytes, secao0, sb1),
    boxes: pc ? lerCaixas(pc) : null,
  };
}
