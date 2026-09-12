import { describe, expect, it, beforeEach, vi } from "vitest";
import { add, remove, clear, snapshot, MAX } from "./comparatorStore";

const p = (name: string, height = 10) => ({ name, height, sprite: `s/${name}` });

// Stub minimo pra localStorage no ambiente node.
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
    clear: () => {
      for (const k of Object.keys(memory)) delete memory[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage);
  clear();
});

describe("comparatorStore", () => {
  it("add adiciona um item", () => {
    add(p("pikachu"));
    expect(snapshot()).toEqual([p("pikachu")]);
  });

  it("add e idempotente pelo nome", () => {
    add(p("pikachu"));
    add(p("pikachu"));
    expect(snapshot()).toHaveLength(1);
  });

  it(`limita em ${MAX}`, () => {
    for (let i = 0; i < MAX + 3; i++) add(p(`p${i}`));
    expect(snapshot()).toHaveLength(MAX);
  });

  it("remove tira o item pelo nome", () => {
    add(p("a"));
    add(p("b"));
    remove("a");
    expect(snapshot().map((x) => x.name)).toEqual(["b"]);
  });

  it("clear zera o carrinho", () => {
    add(p("a"));
    clear();
    expect(snapshot()).toEqual([]);
  });

  it("persiste no localStorage", () => {
    add(p("pikachu"));
    expect(memory["comparator-cart"]).toContain("pikachu");
  });
});
