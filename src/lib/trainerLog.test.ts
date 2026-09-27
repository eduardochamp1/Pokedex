import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  snapshotOf,
  diffSnapshots,
  recordTrainerSave,
  latestTrainerEntry,
  reloadTrainerLog,
  MAX_EVENTS,
  type Snapshot,
} from "./trainerLog";
import type { Gen3Save, Gen3PartyMember, Gen3BoxMon } from "../emulator/saveParse/gen3";

const memory: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(memory)) delete memory[k];
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (k in memory ? memory[k] : null),
    setItem: (k: string, v: string) => {
      memory[k] = v;
    },
    removeItem: (k: string) => {
      delete memory[k];
    },
  } as unknown as Storage);
  reloadTrainerLog();
});

function membro(national: number, level: number, pv: number, nickname = "X"): Gen3PartyMember {
  return {
    slot: 0,
    national,
    nickname,
    level,
    nature: 0,
    ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: [],
    friendship: 0,
    experience: 0,
    stats: { hp: 1, maxHp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 },
    shiny: false,
    abilitySlot: 0,
    personality: pv,
  };
}

/** O save real: ZE, 0h45m50s, Mudkip nv 8, 3300, em Oldale. */
function save(over: Partial<{
  party: Gen3PartyMember[];
  owned: number[];
  seen: number[];
  badges: boolean[];
  towns: number[];
  seconds: number;
  money: number;
}> = {}): Gen3Save {
  const s = over.seconds ?? 45 * 60 + 50;
  return {
    game: "emerald",
    playerName: "ZE",
    party: over.party ?? [membro(258, 8, 0x25b7b8b0, "MUDKIP")],
    pokedex: { seen: over.seen ?? [252, 258, 261], owned: over.owned ?? [258] },
    trainer: {
      gender: "male",
      trainerId: 45125,
      secretId: 47784,
      playTime: { hours: Math.floor(s / 3600), minutes: Math.floor(s / 60) % 60, seconds: s % 60 },
      money: over.money ?? 3300,
      badges: over.badges ?? Array(8).fill(false),
      visitedTowns: over.towns ?? [0, 1],
      location: { group: 0, num: 10 },
    },
    boxes: { current: 0, boxes: [{ name: "BOX1", pokemon: [] }] },
  };
}

const snap = (o?: Parameters<typeof save>[0]) => snapshotOf(save(o), 1000) as Snapshot;

describe("conquistas na linha do tempo", () => {
  it("a primeira leitura não despeja o que já estava feito", () => {
    recordTrainerSave("e.gba", save({ owned: Array.from({ length: 12 }, (_, i) => i + 1) }), 1000);
    expect(latestTrainerEntry()?.events.map((e) => e.kind)).toEqual(["start"]);
  });

  it("o que destrava entre dois saves vira evento, depois das capturas", () => {
    const nove = Array.from({ length: 9 }, (_, i) => i + 1);
    recordTrainerSave("e.gba", save({ owned: nove, seconds: 100 }), 1000);
    recordTrainerSave("e.gba", save({ owned: [...nove, 263], seconds: 200 }), 2000);
    const ev = latestTrainerEntry()?.events ?? [];
    expect(ev.map((e) => e.kind)).toEqual(["start", "captured", "achievement"]);
    expect(ev[2]).toMatchObject({ kind: "achievement", id: "dex-10" });
  });
});

describe("time completo", () => {
  it("a ficha guarda o time com os status que o jogo gravou", () => {
    const s = save();
    recordTrainerSave("e.gba", s, 1000);
    expect(latestTrainerEntry()?.team).toEqual(s.party);
  });
});

describe("PC", () => {
  it("guarda a ficha inteira de cada pokémon da caixa", () => {
    const m = membro(252, 5, 0xabc, "TREECKO");
    const naCaixa: Gen3BoxMon = {
      slot: 7,
      national: m.national,
      nickname: m.nickname,
      nature: 3,
      ivs: { ...m.ivs, hp: 31 },
      evs: m.evs,
      moves: [{ id: 1, pp: 35 }],
      friendship: 70,
      experience: 135,
      shiny: true,
      abilitySlot: 1,
      personality: m.personality,
    };
    recordTrainerSave("e.gba", { ...save(), boxes: { current: 0, boxes: [{ name: "BOX1", pokemon: [naCaixa] }] } }, 1000);
    expect(latestTrainerEntry()?.boxes[0].pokemon[0]).toEqual(naCaixa);
  });
});

describe("FireRed/LeafGreen", () => {
  /** O save medido: LG, Bulbasaur nv 5, sem cidades nem mapa (só Emerald tem). */
  const frlg = (badges = Array(8).fill(false)): Gen3Save => {
    const s = save({ party: [membro(1, 5, 0x12345678, "BULBASAUR")], owned: [1], seen: [1], badges });
    return { ...s, game: "frlg", trainer: s.trainer && { ...s.trainer, visitedTowns: null, location: null } };
  };

  it("registra com o jogo, sem cidades", () => {
    recordTrainerSave("leafgreen.gba", frlg(), 1000);
    const e = latestTrainerEntry();
    expect(e?.game).toBe("frlg");
    expect(e?.last.towns).toEqual([]);
  });

  it("insígnia vira evento; cidade nunca", () => {
    recordTrainerSave("leafgreen.gba", frlg(), 1000);
    recordTrainerSave("leafgreen.gba", frlg([true, false, false, false, false, false, false, false]), 2000);
    const kinds = latestTrainerEntry()?.events.map((e) => e.kind);
    expect(kinds).toEqual(["start", "badge", "achievement"]);
  });

  it("Ruby/Sapphire sem insígnias não inventa evento", () => {
    const s = save();
    const rs: Gen3Save = { ...s, game: "rs", trainer: s.trainer && { ...s.trainer, money: null, badges: null, visitedTowns: null, location: null } };
    recordTrainerSave("ruby.gba", rs, 1000);
    recordTrainerSave("ruby.gba", { ...rs, pokedex: { seen: [258], owned: [258] } }, 2000);
    expect(latestTrainerEntry()?.events.map((e) => e.kind)).toEqual(["start"]);
  });
});

describe("diffSnapshots", () => {
  it("nada mudou, nenhum evento", () => {
    expect(diffSnapshots(snap(), snap())).toEqual([]);
  });

  it("captura nova", () => {
    const ev = diffSnapshots(snap(), snap({ owned: [258, 263], seen: [252, 258, 261, 263] }));
    expect(ev).toEqual([expect.objectContaining({ kind: "captured", national: 263 })]);
  });

  it("insígnia nova e cidade nova", () => {
    const badges = [true, false, false, false, false, false, false, false];
    const ev = diffSnapshots(snap(), snap({ badges, towns: [0, 1, 7] }));
    expect(ev).toEqual([
      expect.objectContaining({ kind: "badge", index: 0 }),
      expect.objectContaining({ kind: "town", index: 7 }),
    ]);
  });

  it("subiu de nível: um evento com de e para", () => {
    const ev = diffSnapshots(snap(), snap({ party: [membro(258, 10, 0x25b7b8b0, "MUDKIP")] }));
    expect(ev).toEqual([
      expect.objectContaining({ kind: "level", national: 258, from: 8, to: 10, nickname: "MUDKIP" }),
    ]);
  });

  /** O PV não muda ao evoluir: é o mesmo pokémon com outra espécie. */
  it("evoluiu: mesmo PV, outra espécie", () => {
    const ev = diffSnapshots(
      snap(),
      snap({ party: [membro(259, 16, 0x25b7b8b0, "MUDKIP")], owned: [258, 259], seen: [252, 258, 259, 261] })
    );
    // Em ordem de acontecimento: subir de nível é o que faz evoluir.
    expect(ev).toEqual([
      expect.objectContaining({ kind: "level", from: 8, to: 16 }),
      expect.objectContaining({ kind: "evolved", from: 258, to: 259, nickname: "MUDKIP" }),
    ]);
  });

  it("o evento leva o tempo de jogo do save novo", () => {
    const [e] = diffSnapshots(snap(), snap({ owned: [1, 258], seen: [1, 252, 258, 261], seconds: 7200 }));
    expect(e.playSeconds).toBe(7200);
  });
});

describe("recordTrainerSave", () => {
  it("o primeiro save abre a linha do tempo", () => {
    recordTrainerSave("Emerald.gba", save(), 1000);
    const e = latestTrainerEntry();
    expect(e?.rom).toBe("Emerald.gba");
    expect(e?.events).toEqual([expect.objectContaining({ kind: "start" })]);
  });

  it("acumula eventos entre saves e persiste", () => {
    recordTrainerSave("Emerald.gba", save(), 1000);
    recordTrainerSave("Emerald.gba", save({ owned: [258, 263], seen: [252, 258, 261, 263], seconds: 3000 }), 2000);
    recordTrainerSave("Emerald.gba", save({ owned: [258, 263], seen: [252, 258, 261, 263], seconds: 3100 }), 3000);
    reloadTrainerLog();
    const kinds = latestTrainerEntry()?.events.map((e) => e.kind);
    expect(kinds).toEqual(["start", "captured"]);
    expect(latestTrainerEntry()?.updatedAt).toBe(3000);
  });

  /**
   * Restaurar um backup antigo faz o tempo de jogo andar para trás. Comparar
   * daria "desceu de nível" e "perdeu insígnia": em vez disso, um evento só.
   */
  it("tempo de jogo voltando é um save antigo, não uma perda", () => {
    recordTrainerSave("Emerald.gba", save({ seconds: 9000, party: [membro(258, 20, 0x25b7b8b0)] }), 1000);
    recordTrainerSave("Emerald.gba", save({ seconds: 100 }), 2000);
    const kinds = latestTrainerEntry()?.events.map((e) => e.kind);
    expect(kinds).toEqual(["start", "rewind"]);
  });

  it("save sem ficha de treinador não entra", () => {
    recordTrainerSave("Ruby.gba", { ...save(), trainer: null }, 1000);
    expect(latestTrainerEntry()).toBeNull();
  });

  it("guarda no máximo MAX_EVENTS, descartando os mais velhos", () => {
    recordTrainerSave("Emerald.gba", save({ owned: [], seen: [] }), 0);
    const owned: number[] = [];
    for (let n = 1; n <= MAX_EVENTS + 5; n++) {
      owned.push(n);
      recordTrainerSave("Emerald.gba", save({ owned: [...owned], seen: [...owned], seconds: 3000 + n }), n);
    }
    const events = latestTrainerEntry()?.events ?? [];
    expect(events).toHaveLength(MAX_EVENTS);
    expect(events.at(-1)).toMatchObject({ kind: "captured", national: MAX_EVENTS + 5 });
  });

  it("JSON quebrado vira store vazio", () => {
    memory["pokedex:trainer-log"] = "{nada";
    reloadTrainerLog();
    expect(latestTrainerEntry()).toBeNull();
  });
});
