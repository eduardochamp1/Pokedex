import { describe, expect, it } from "vitest";
import {
  availableVersionGroups,
  groupByMethod,
  movesForVersionGroup,
  preferredVersionGroup,
  prettyMoveName,
  sortMoves,
  type LearnedMove,
} from "./moves";
import type { PokemonMove } from "../types/pokemon";

const ref = (name: string) => ({ name, url: "" });

/** Monta uma entrada crua como a da API. */
const move = (
  name: string,
  details: [versionGroup: string, method: string, level: number][]
): PokemonMove => ({
  move: ref(name),
  version_group_details: details.map(([vg, method, level]) => ({
    level_learned_at: level,
    version_group: ref(vg),
    move_learn_method: ref(method),
  })),
});

describe("availableVersionGroups", () => {
  it("lista sem repetir, do mais recente para o mais antigo", () => {
    const moves = [
      move("a", [["red-blue", "level-up", 1]]),
      move("b", [
        ["scarlet-violet", "machine", 0],
        ["red-blue", "level-up", 5],
      ]),
      move("c", [["sword-shield", "egg", 0]]),
    ];
    expect(availableVersionGroups(moves)).toEqual([
      "scarlet-violet",
      "sword-shield",
      "red-blue",
    ]);
  });

  it("sem golpes, sem jogos", () => {
    expect(availableVersionGroups([])).toEqual([]);
  });

  it("jogo desconhecido vai para o fim em vez de sumir", () => {
    // A PokeAPI ganha jogos novos; a lista curada pode ficar para tras.
    const moves = [
      move("a", [["jogo-do-futuro", "level-up", 1]]),
      move("b", [["red-blue", "level-up", 1]]),
    ];
    const vgs = availableVersionGroups(moves);
    expect(vgs).toContain("jogo-do-futuro");
    expect(vgs[vgs.length - 1]).toBe("jogo-do-futuro");
  });
});

describe("movesForVersionGroup", () => {
  const moves = [
    move("thunder-shock", [
      ["scarlet-violet", "level-up", 1],
      ["red-blue", "level-up", 1],
    ]),
    move("thunderbolt", [
      ["scarlet-violet", "machine", 0],
      ["scarlet-violet", "level-up", 36],
    ]),
    move("volt-tackle", [["red-blue", "egg", 0]]),
  ];

  it("traz so os golpes do jogo pedido", () => {
    const sv = movesForVersionGroup(moves, "scarlet-violet");
    expect(sv.map((m) => m.name).sort()).toEqual([
      "thunder-shock",
      "thunderbolt",
      "thunderbolt",
    ]);
  });

  it("o mesmo golpe por dois metodos aparece duas vezes", () => {
    // "como consigo esse golpe" tem duas respostas: nivel 36 e MT.
    const sv = movesForVersionGroup(moves, "scarlet-violet");
    const bolt = sv.filter((m) => m.name === "thunderbolt");
    expect(bolt.map((m) => m.method).sort()).toEqual(["level-up", "machine"]);
    expect(bolt.find((m) => m.method === "level-up")?.level).toBe(36);
  });

  it("jogo sem golpe nenhum devolve vazio", () => {
    expect(movesForVersionGroup(moves, "gold-silver")).toEqual([]);
  });

  it("metodo fora dos quatro conhecidos vira 'outro'", () => {
    const esp = [move("x", [["sword-shield", "form-change", 0]])];
    expect(movesForVersionGroup(esp, "sword-shield")[0].method).toBe("other");
  });

  it("par golpe+metodo repetido fica com o menor nivel", () => {
    const dup = [
      move("tackle", [
        ["red-blue", "level-up", 10],
        ["red-blue", "level-up", 4],
      ]),
    ];
    expect(movesForVersionGroup(dup, "red-blue")).toEqual([
      { name: "tackle", method: "level-up", level: 4 },
    ]);
  });
});

describe("sortMoves", () => {
  const m = (name: string, level: number): LearnedMove => ({
    name,
    method: "level-up",
    level,
  });

  it("por nivel crescente", () => {
    expect(sortMoves([m("c", 30), m("a", 5), m("b", 12)]).map((x) => x.name)).toEqual(
      ["a", "b", "c"]
    );
  });

  it("sem nivel vai depois, em ordem alfabetica", () => {
    const lista = [m("zap", 0), m("arc", 0), m("bolt", 7)];
    expect(sortMoves(lista).map((x) => x.name)).toEqual(["bolt", "arc", "zap"]);
  });

  it("nao muta a lista recebida", () => {
    const lista = [m("c", 30), m("a", 5)];
    sortMoves(lista);
    expect(lista[0].name).toBe("c");
  });
});

describe("groupByMethod", () => {
  it("agrupa na ordem dos metodos e some com os vazios", () => {
    const lista: LearnedMove[] = [
      { name: "b", method: "machine", level: 0 },
      { name: "a", method: "level-up", level: 3 },
      { name: "c", method: "egg", level: 0 },
    ];
    const grupos = groupByMethod(lista);
    expect(grupos.map((g) => g.method)).toEqual(["level-up", "machine", "egg"]);
    expect(grupos.every((g) => g.moves.length > 0)).toBe(true);
  });

  it("lista vazia nao produz grupo nenhum", () => {
    expect(groupByMethod([])).toEqual([]);
  });
});

describe("prettyMoveName", () => {
  it("slug vira titulo legivel", () => {
    expect(prettyMoveName("thunder-shock")).toBe("Thunder Shock");
    expect(prettyMoveName("tackle")).toBe("Tackle");
  });

  it("aguenta numero e palavra unica", () => {
    expect(prettyMoveName("double-slap-2")).toBe("Double Slap 2");
  });
});

describe("preferredVersionGroup", () => {
  it("escolhe o mais recente que ensina por nivel, nao o mais recente", () => {
    // O caso real do Pikachu: "champions" e o mais novo mas so tem `train`,
    // e abriria a tela com 60 golpes em "Outros" e nada mais.
    const moves = [
      move("thunder-shock", [
        ["scarlet-violet", "level-up", 1],
        ["champions", "train", 0],
      ]),
      move("thunderbolt", [["champions", "train", 0]]),
    ];
    expect(availableVersionGroups(moves)[0]).toBe("champions");
    expect(preferredVersionGroup(moves)).toBe("scarlet-violet");
  });

  it("entre dois com nivel, vence o mais recente", () => {
    const moves = [
      move("a", [
        ["red-blue", "level-up", 1],
        ["sword-shield", "level-up", 1],
      ]),
    ];
    expect(preferredVersionGroup(moves)).toBe("sword-shield");
  });

  it("sem nenhum por nivel, cai para o mais recente", () => {
    const moves = [move("a", [["champions", "train", 0]])];
    expect(preferredVersionGroup(moves)).toBe("champions");
  });

  it("sem golpes, sem escolha", () => {
    expect(preferredVersionGroup([])).toBeUndefined();
  });
});
