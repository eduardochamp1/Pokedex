import { describe, it, expect } from "vitest";
import { parseGen3Save } from "./gen3";

/**
 * Constrói um save de Gen 3 válido, byte a byte.
 *
 * O `.sav` real que provou o formato **não** vive no repositório: `saves/` está
 * no `.gitignore`, o arquivo é progresso de jogo de quem o gerou, e um teste
 * que depende de arquivo fora do git falha por motivo errado em qualquer outra
 * máquina. Então a suíte constrói o save que precisa — e o construtor só é
 * capaz de montá-lo porque o formato foi medido antes, no save real.
 *
 * Quem tiver um `.sav` de verdade em mãos valida contra ele com
 * `npm run gen3:save-check <arquivo.sav>`.
 */
const SETOR = 4096;
const DADOS = 3968;
const ASSINATURA = 0x08012025;

const ORDENS = [
  "GAEM", "GAME", "GEAM", "GEMA", "GMAE", "GMEA",
  "AGEM", "AGME", "AEGM", "AEMG", "AMGE", "AMEG",
  "EGAM", "EGMA", "EAGM", "EAMG", "EMGA", "EMAG",
  "MGAE", "MGEA", "MAGE", "MAEG", "MEGA", "MEAG",
];

/** Texto -> bytes no charset de Gen 3 (A = 0xBB, terminador 0xFF). */
function escreverTexto(destino: Uint8Array, offset: number, texto: string) {
  let i = 0;
  for (const ch of texto) {
    const code = ch.charCodeAt(0);
    if (ch === " ") destino[offset + i] = 0x00;
    else if (code >= 65 && code <= 90) destino[offset + i] = 0xbb + (code - 65);
    else if (code >= 97 && code <= 122) destino[offset + i] = 0xd5 + (code - 97);
    else destino[offset + i] = 0x00;
    i++;
  }
  destino[offset + i] = 0xff;
}

interface Membro {
  /** Índice interno de espécie de Gen 3, não o número nacional. */
  indice: number;
  apelido: string;
  nivel: number;
  pv?: number;
  otid?: number;
  /** Ordem do jogo: hp, atq, def, vel, atq esp, def esp. */
  ivs?: number[];
  evs?: number[];
  golpes?: { id: number; pp: number }[];
  amizade?: number;
  habilidade?: 0 | 1;
  /** hp atual, hp máximo, atq, def, vel, atq esp, def esp — fora da cifra. */
  status?: number[];
}

function montarSave(opts: {
  nome: string;
  time: Membro[];
  /** Ordem dos ids das seções no bloco A. Gira de propósito, como o jogo faz. */
  rotacao?: number;
  contadorA?: number;
  contadorB?: number;
  /** Bytes extras depois dos 131072, como o rodapé de RTC que o mGBA junta. */
  rodape?: number;
  /** Números nacionais marcados como vistos / capturados na dex do jogo. */
  vistos?: number[];
  capturados?: number[];
}): Uint8Array {
  const rotacao = opts.rotacao ?? 4;
  const bytes = new Uint8Array(131072 + (opts.rodape ?? 0));
  const view = new DataView(bytes.buffer);

  // --- SaveBlock1: contagem do time e os registros de 100 bytes
  const sb1 = new Uint8Array(4 * DADOS);
  const vb1 = new DataView(sb1.buffer);
  vb1.setUint32(0x0234, opts.time.length, true);

  opts.time.forEach((m, slot) => {
    const off = 0x0238 + slot * 100;
    const pv = m.pv ?? 0x25b7b8b0;
    const otid = m.otid ?? 0xbaa8b045;
    vb1.setUint32(off + 0x00, pv, true);
    vb1.setUint32(off + 0x04, otid, true);
    escreverTexto(sb1, off + 0x08, m.apelido);
    sb1[off + 0x54] = m.nivel;

    // Monta os 48 bytes em claro, com a espécie na subestrutura de crescimento,
    // e só então cifra com PV ^ OTID.
    const claro = new DataView(new ArrayBuffer(48));
    const ordem = ORDENS[pv % 24];
    const G = ordem.indexOf("G") * 12;
    const A = ordem.indexOf("A") * 12;
    const E = ordem.indexOf("E") * 12;
    const M = ordem.indexOf("M") * 12;
    claro.setUint16(G, m.indice, true);
    claro.setUint8(G + 9, m.amizade ?? 0);
    (m.golpes ?? []).forEach((g, i) => {
      claro.setUint16(A + i * 2, g.id, true);
      claro.setUint8(A + 8 + i, g.pp);
    });
    (m.evs ?? []).forEach((ev, i) => claro.setUint8(E + i, ev));
    let ivs = 0;
    (m.ivs ?? []).forEach((iv, i) => (ivs |= iv << (i * 5)));
    if (m.habilidade) ivs |= 1 << 31;
    claro.setUint32(M + 4, ivs >>> 0, true);
    const offStatus = [0x56, 0x58, 0x5a, 0x5c, 0x5e, 0x60, 0x62];
    (m.status ?? []).forEach((s, i) => vb1.setUint16(off + offStatus[i], s, true));

    let soma = 0;
    for (let p = 0; p < 48; p += 2) soma = (soma + claro.getUint16(p, true)) & 0xffff;
    vb1.setUint16(off + 0x1c, soma, true);

    const chave = (pv ^ otid) >>> 0;
    for (let w = 0; w < 12; w++) {
      vb1.setUint32(off + 0x20 + w * 4, (claro.getUint32(w * 4, true) ^ chave) >>> 0, true);
    }
  });

  // --- distribui as seções pelos 14 setores do bloco A, girando os ids
  for (let pos = 0; pos < 14; pos++) {
    const id = (pos + rotacao) % 14;
    const base = pos * SETOR;
    if (id === 0) {
      escreverTexto(bytes, base, opts.nome);
      const marcar = (offset: number, n: number) => {
        bytes[base + offset + ((n - 1) >> 3)] |= 1 << ((n - 1) & 7);
      };
      for (const n of opts.capturados ?? []) marcar(0x28, n);
      for (const n of opts.vistos ?? []) marcar(0x5c, n);
    }
    const indiceNoSb1 = [1, 2, 3, 4].indexOf(id);
    if (indiceNoSb1 >= 0) {
      bytes.set(sb1.subarray(indiceNoSb1 * DADOS, (indiceNoSb1 + 1) * DADOS), base);
    }
    view.setUint16(base + 0x0ff4, id, true);
    view.setUint32(base + 0x0ff8, ASSINATURA, true);
    view.setUint32(base + 0x0ffc, opts.contadorA ?? 4, true);
    let soma = 0;
    for (let p = 0; p + 4 <= DADOS; p += 4) soma = (soma + view.getUint32(base + p, true)) >>> 0;
    view.setUint16(base + 0x0ff6, ((soma >>> 16) + (soma & 0xffff)) & 0xffff, true);
  }

  // --- bloco B: uma cópia mais velha, vazia, só para o seletor ter o que comparar
  for (let pos = 0; pos < 14; pos++) {
    const base = (14 + pos) * SETOR;
    view.setUint16(base + 0x0ff4, pos, true);
    view.setUint32(base + 0x0ff8, ASSINATURA, true);
    view.setUint32(base + 0x0ffc, opts.contadorB ?? 3, true);
    let soma = 0;
    for (let p = 0; p + 4 <= DADOS; p += 4) soma = (soma + view.getUint32(base + p, true)) >>> 0;
    view.setUint16(base + 0x0ff6, ((soma >>> 16) + (soma & 0xffff)) & 0xffff, true);
  }

  return bytes;
}

/** Mudkip: índice interno 283, nacional 258. Foi o caso do save real. */
const MUDKIP = { indice: 283, apelido: "MUDKIP", nivel: 5 };

describe("parseGen3Save", () => {
  it("lê o nome do jogador e o time", () => {
    const save = parseGen3Save(montarSave({ nome: "ZE", time: [MUDKIP] }));
    expect(save).not.toBeNull();
    expect(save?.playerName).toBe("ZE");
    expect(save?.party).toMatchObject([
      { slot: 0, national: 258, nickname: "MUDKIP", level: 5 },
    ]);
  });

  /**
   * As seções giram dentro do bloco: no save real, as posições físicas 0..13
   * carregavam os ids 10,11,12,13,0,1,…,9. Indexar por posição leria a seção
   * errada, e é o tipo de erro que passa quando a rotação é zero por acaso.
   */
  it("acha as seções mesmo com a rotação mudando", () => {
    for (const rotacao of [0, 1, 4, 7, 13]) {
      const save = parseGen3Save(montarSave({ nome: "ZE", time: [MUDKIP], rotacao }));
      expect(save?.party[0]?.national).toBe(258);
    }
  });

  it("escolhe o bloco de maior contador", () => {
    const novoNoA = parseGen3Save(
      montarSave({ nome: "ANA", time: [MUDKIP], contadorA: 9, contadorB: 2 })
    );
    expect(novoNoA?.playerName).toBe("ANA");
    // Com o bloco B mais novo, o A deixa de valer — e o B daqui está vazio.
    const novoNoB = parseGen3Save(
      montarSave({ nome: "ANA", time: [MUDKIP], contadorA: 2, contadorB: 9 })
    );
    expect(novoNoB?.party).toEqual([]);
  });

  /** O mGBA acrescenta 16 bytes de data e hora depois dos 131072. */
  it("ignora o rodapé que o mGBA acrescenta", () => {
    const save = parseGen3Save(
      montarSave({ nome: "ZE", time: [MUDKIP], rodape: 16 })
    );
    expect(save?.party[0]?.nickname).toBe("MUDKIP");
  });

  it("lê um time cheio, com espécies diferentes", () => {
    const time = [
      { indice: 277, apelido: "TREECKO", nivel: 5 },
      { indice: 280, apelido: "TORCHIC", nivel: 7 },
      { indice: 283, apelido: "MUDKIP", nivel: 9 },
      { indice: 1, apelido: "BULBASAUR", nivel: 11 },
      { indice: 251, apelido: "CELEBI", nivel: 30 },
      { indice: 411, apelido: "CHIMECHO", nivel: 40 },
    ];
    const save = parseGen3Save(montarSave({ nome: "ZE", time }));
    expect(save?.party.map((p) => p.national)).toEqual([252, 255, 258, 1, 251, 358]);
    expect(save?.party.map((p) => p.level)).toEqual([5, 7, 9, 11, 30, 40]);
  });

  // ---- o que não é save

  it("recusa flash virgem, nos dois estados", () => {
    expect(parseGen3Save(new Uint8Array(131072))).toBeNull();
    expect(parseGen3Save(new Uint8Array(131072).fill(0xff))).toBeNull();
  });

  it("recusa buffer curto demais", () => {
    expect(parseGen3Save(new Uint8Array(0))).toBeNull();
    expect(parseGen3Save(new Uint8Array(131071))).toBeNull();
  });

  /**
   * Assinatura certa com dados corrompidos é o caso perigoso: sem conferir o
   * checksum, o parser inventaria um time a partir de lixo.
   */
  it("recusa quando o checksum do setor não bate", () => {
    const bytes = montarSave({ nome: "ZE", time: [MUDKIP] });
    bytes[100] ^= 0xff;
    expect(parseGen3Save(bytes)).toBeNull();
  });

  it("pula o registro cujo checksum interno não bate", () => {
    const bytes = montarSave({ nome: "ZE", time: [MUDKIP] });
    // Estraga o checksum do registro sem tocar no do setor.
    const view = new DataView(bytes.buffer);
    let alvo = -1;
    for (let pos = 0; pos < 14; pos++) {
      if (view.getUint16(pos * SETOR + 0x0ff4, true) === 1) alvo = pos * SETOR;
    }
    view.setUint16(alvo + 0x0238 + 0x1c, 0x0000, true);
    let soma = 0;
    for (let p = 0; p + 4 <= DADOS; p += 4) soma = (soma + view.getUint32(alvo + p, true)) >>> 0;
    view.setUint16(alvo + 0x0ff6, ((soma >>> 16) + (soma & 0xffff)) & 0xffff, true);

    expect(parseGen3Save(bytes)?.party).toEqual([]);
  });

  it("recusa contagem de time impossível", () => {
    const bytes = montarSave({ nome: "ZE", time: [MUDKIP] });
    const view = new DataView(bytes.buffer);
    let alvo = -1;
    for (let pos = 0; pos < 14; pos++) {
      if (view.getUint16(pos * SETOR + 0x0ff4, true) === 1) alvo = pos * SETOR;
    }
    view.setUint32(alvo + 0x0234, 99, true);
    let soma = 0;
    for (let p = 0; p + 4 <= DADOS; p += 4) soma = (soma + view.getUint32(alvo + p, true)) >>> 0;
    view.setUint16(alvo + 0x0ff6, ((soma >>> 16) + (soma & 0xffff)) & 0xffff, true);

    expect(parseGen3Save(bytes)).toBeNull();
  });

  // ---- a dex do jogo

  /**
   * Offsets medidos no save real de Emerald: capturados em 0x28 e vistos em
   * 0x5C da seção 0, um bit por número nacional. Lá deu capturados [258] e
   * vistos [252, 258, 261, 263, 265, 278].
   */
  it("lê vistos e capturados da dex", () => {
    const save = parseGen3Save(
      montarSave({
        nome: "ZE",
        time: [MUDKIP],
        vistos: [252, 258, 261, 263, 265, 278],
        capturados: [258],
      })
    );
    expect(save?.pokedex).toEqual({
      seen: [252, 258, 261, 263, 265, 278],
      owned: [258],
    });
  });

  it("lê as pontas da dex de Gen 3: 1 e 386", () => {
    const save = parseGen3Save(
      montarSave({ nome: "ZE", time: [], vistos: [1, 8, 9, 386], capturados: [1, 386] })
    );
    expect(save?.pokedex).toEqual({ seen: [1, 8, 9, 386], owned: [1, 386] });
  });

  it("dex vazia é dex, não ausência", () => {
    const save = parseGen3Save(montarSave({ nome: "ZE", time: [] }));
    expect(save?.pokedex).toEqual({ seen: [], owned: [] });
  });

  /** Os 52 bytes têm 416 bits; os 30 depois do 386 não são pokémon nenhum. */
  it("ignora bits depois do 386", () => {
    const save = parseGen3Save(
      montarSave({ nome: "ZE", time: [], vistos: [258, 387, 416], capturados: [258] })
    );
    expect(save?.pokedex).toEqual({ seen: [258], owned: [258] });
  });

  /**
   * O jogo marca visto ao capturar. Capturado sem visto quer dizer que os
   * offsets não são os deste jogo — e aí mostrar nada é melhor que mostrar lixo.
   */
  it("descarta a dex quando capturado não está contido em visto", () => {
    const save = parseGen3Save(
      montarSave({ nome: "ZE", time: [MUDKIP], vistos: [252], capturados: [258] })
    );
    expect(save).not.toBeNull();
    expect(save?.party[0]?.national).toBe(258);
    expect(save?.pokedex).toBeNull();
  });

  // ---- a ficha de cada membro

  /**
   * O Mudkip do save real, campo por campo. Os status gravados fecharam com a
   * fórmula de Gen 3 usando estes IVs, EVs e a natureza Timid — é o que prova
   * a ordem dos IVs e EVs (hp, atq, def, vel, atq esp, def esp).
   */
  const MUDKIP_REAL = {
    ...MUDKIP,
    nivel: 8,
    ivs: [24, 1, 0, 0, 6, 13],
    evs: [2, 3, 0, 4, 0, 0],
    golpes: [
      { id: 33, pp: 35 },
      { id: 45, pp: 40 },
      { id: 189, pp: 10 },
    ],
    amizade: 87,
    status: [27, 27, 14, 13, 12, 13, 14],
  };

  it("lê natureza, IVs, EVs, golpes, amizade e status", () => {
    const [m] = parseGen3Save(montarSave({ nome: "ZE", time: [MUDKIP_REAL] }))?.party ?? [];
    expect(m).toMatchObject({
      nature: 10,
      ivs: { hp: 24, atk: 1, def: 0, spe: 0, spa: 6, spd: 13 },
      evs: { hp: 2, atk: 3, def: 0, spe: 4, spa: 0, spd: 0 },
      moves: [
        { id: 33, pp: 35 },
        { id: 45, pp: 40 },
        { id: 189, pp: 10 },
      ],
      friendship: 87,
      stats: { hp: 27, maxHp: 27, atk: 14, def: 13, spe: 12, spa: 13, spd: 14 },
      shiny: false,
      abilitySlot: 0,
    });
  });

  it("golpe vazio não entra na lista", () => {
    const [m] = parseGen3Save(montarSave({ nome: "ZE", time: [MUDKIP_REAL] }))?.party ?? [];
    expect(m?.moves).toHaveLength(3);
  });

  it("lê o segundo slot de habilidade", () => {
    const [m] =
      parseGen3Save(montarSave({ nome: "ZE", time: [{ ...MUDKIP, habilidade: 1 }] }))?.party ?? [];
    expect(m?.abilitySlot).toBe(1);
  });

  /** IV 31 em tudo usa os 30 bits inteiros: nenhum campo pode vazar no vizinho. */
  it("IVs máximos não vazam entre campos", () => {
    const [m] =
      parseGen3Save(
        montarSave({ nome: "ZE", time: [{ ...MUDKIP, ivs: [31, 31, 31, 31, 31, 31], habilidade: 1 }] })
      )?.party ?? [];
    expect(m?.ivs).toEqual({ hp: 31, atk: 31, def: 31, spe: 31, spa: 31, spd: 31 });
    expect(m?.abilitySlot).toBe(1);
  });

  /** Shiny em Gen 3: TID ^ SID ^ metade alta do PV ^ metade baixa < 8. */
  it("reconhece shiny", () => {
    const shiny = { ...MUDKIP, pv: 0x00010002, otid: 0x00000003 };
    const [m] = parseGen3Save(montarSave({ nome: "ZE", time: [shiny] }))?.party ?? [];
    expect(m?.national).toBe(258);
    expect(m?.shiny).toBe(true);
  });
});
