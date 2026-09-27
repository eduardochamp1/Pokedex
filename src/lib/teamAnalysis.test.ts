import { describe, expect, it } from "vitest";
import { defenseTable, offenseCoverage, teamGaps, parseTeamParam, toTeamParam, MAX_TEAM } from "./teamAnalysis";
import type { TypeName } from "../data/typeMatchups";

const m = (name: string, ...types: TypeName[]) => ({ name, types });

const MUDKIP = m("mudkip", "water");
const SWAMPERT = m("swampert", "water", "ground");
const GYARADOS = m("gyarados", "water", "flying");
const TORCHIC = m("torchic", "fire");

describe("defenseTable", () => {
  it("uma linha por tipo atacante, 18", () => {
    expect(defenseTable([MUDKIP])).toHaveLength(18);
  });

  it("água sozinha: fraca a planta e elétrico, resiste a fogo", () => {
    const t = defenseTable([MUDKIP]);
    const linha = (a: TypeName) => t.find((r) => r.attacker === a)!;
    expect(linha("grass").weak).toEqual(["mudkip"]);
    expect(linha("electric").weak).toEqual(["mudkip"]);
    expect(linha("fire").resist).toEqual(["mudkip"]);
  });

  /** Swampert: o terra anula o elétrico e dobra a fraqueza a planta. */
  it("tipo duplo: imunidade e fraqueza 4×", () => {
    const t = defenseTable([SWAMPERT]);
    expect(t.find((r) => r.attacker === "electric")!.immune).toEqual(["swampert"]);
    const planta = t.find((r) => r.attacker === "grass")!;
    expect(planta.weak).toEqual(["swampert"]);
    expect(planta.worst).toBe(4);
    expect(planta.byMember).toEqual({ swampert: 4 });
  });

  it("perigo: dois ou mais fracos e mais fracos que respostas", () => {
    const t = defenseTable([MUDKIP, SWAMPERT, TORCHIC]);
    // planta: mudkip e swampert fracos; torchic resiste → 2 > 1
    expect(t.find((r) => r.attacker === "grass")!.danger).toBe(true);
    // elétrico: mudkip fraco, swampert imune → não é perigo
    expect(t.find((r) => r.attacker === "electric")!.danger).toBe(false);
  });
});

describe("offenseCoverage", () => {
  it("considera só os tipos dos membros (golpes de mesmo tipo)", () => {
    const c = offenseCoverage([MUDKIP]);
    const alvo = (d: TypeName) => c.find((r) => r.defender === d)!;
    expect(alvo("fire").best).toBe(2);
    expect(alvo("fire").by).toEqual(["mudkip"]);
    expect(alvo("grass").best).toBe(0.5);
  });

  it("junta quem acerta super efetivo", () => {
    const c = offenseCoverage([MUDKIP, SWAMPERT]);
    expect(c.find((r) => r.defender === "rock")!.by).toEqual(["mudkip", "swampert"]);
    // terra do Swampert acerta elétrico 2×
    expect(c.find((r) => r.defender === "electric")!.by).toEqual(["swampert"]);
  });
});

describe("teamGaps", () => {
  it("time vazio não tem lacunas a apontar", () => {
    expect(teamGaps([])).toEqual({ weakSpots: [], uncovered: [] });
  });

  it("aponta perigos e tipos que ninguém acerta forte", () => {
    const g = teamGaps([MUDKIP, SWAMPERT, TORCHIC]);
    expect(g.weakSpots).toContain("grass");
    expect(g.uncovered).toContain("water"); // nem água, nem terra, nem fogo acertam água 2×
    expect(g.uncovered).not.toContain("fire");
  });

  it("voador: Gyarados não é fraco a terra", () => {
    const t = defenseTable([GYARADOS]);
    expect(t.find((r) => r.attacker === "ground")!.immune).toEqual(["gyarados"]);
  });
});

describe("parâmetro de URL", () => {
  it("ida e volta", () => {
    expect(parseTeamParam(toTeamParam(["mudkip", "torchic"]))).toEqual(["mudkip", "torchic"]);
  });

  it("limpa vazios, repetidos e corta em seis", () => {
    expect(parseTeamParam("a,,b,a,c,d,e,f,g")).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(MAX_TEAM).toBe(6);
  });

  it("nulo é time vazio", () => {
    expect(parseTeamParam(null)).toEqual([]);
  });
});
