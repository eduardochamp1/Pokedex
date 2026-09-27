import { describe, expect, it } from "vitest";
import { formatPlayTime, formatMoney, formatTrainerId, describeEvent } from "./trainerText";

const nome = (n: number) => ({ 258: "Mudkip", 259: "Marshtomp", 263: "Zigzagoon" })[n] ?? `#${n}`;
const base = { at: 0, playSeconds: 0 };

describe("formatos", () => {
  it("tempo de jogo, como o cartão do jogo", () => {
    expect(formatPlayTime(45 * 60 + 50)).toBe("45min");
    expect(formatPlayTime(2 * 3600 + 5 * 60)).toBe("2h 05min");
    expect(formatPlayTime(0)).toBe("0min");
  });

  it("dinheiro com separador de milhar", () => {
    expect(formatMoney(3300)).toBe("₽3.300");
    expect(formatMoney(999999)).toBe("₽999.999");
  });

  it("ID com cinco dígitos", () => {
    expect(formatTrainerId(45125)).toBe("45125");
    expect(formatTrainerId(42)).toBe("00042");
  });
});

describe("describeEvent", () => {
  it("uma frase para cada tipo", () => {
    expect(describeEvent({ ...base, kind: "start", owned: 1, seen: 6 }, nome)).toBe(
      "Começou a registrar: 1 capturado, 6 vistos"
    );
    expect(describeEvent({ ...base, kind: "captured", national: 263 }, nome)).toBe("Capturou Zigzagoon");
    expect(describeEvent({ ...base, kind: "badge", index: 0 }, nome)).toBe(
      "Ganhou a Stone Badge de Roxanne"
    );
    expect(describeEvent({ ...base, kind: "town", index: 7 }, nome)).toBe("Chegou a Petalburg City");
    expect(describeEvent({ ...base, kind: "evolved", nickname: "MUDKIP", from: 258, to: 259 }, nome)).toBe(
      "MUDKIP evoluiu de Mudkip para Marshtomp"
    );
    expect(describeEvent({ ...base, kind: "rewind" }, nome)).toBe("Um save anterior foi carregado");
  });

  it("nível: um ou vários de uma vez", () => {
    const lv = { ...base, kind: "level" as const, national: 258, nickname: "MUDKIP" };
    expect(describeEvent({ ...lv, from: 8, to: 9 }, nome)).toBe("MUDKIP subiu para o nível 9");
    expect(describeEvent({ ...lv, from: 8, to: 12 }, nome)).toBe("MUDKIP subiu do nível 8 para o 12");
  });
});

describe("em inglês", () => {
  it("formatos e frases", () => {
    expect(formatMoney(3300, "en")).toBe("₽3,300");
    expect(describeEvent({ ...base, kind: "badge", index: 0 }, nome, "en")).toBe("Earned Roxanne's Stone Badge");
    expect(describeEvent({ ...base, kind: "town", index: 7 }, nome, "en")).toBe("Reached Petalburg City");
    expect(describeEvent({ ...base, kind: "evolved", nickname: "MUDKIP", from: 258, to: 259 }, nome, "en")).toBe(
      "MUDKIP evolved from Mudkip into Marshtomp"
    );
    expect(describeEvent({ ...base, kind: "start", owned: 1, seen: 6 }, nome, "en")).toBe(
      "Started recording: 1 caught, 6 seen"
    );
  });
});
