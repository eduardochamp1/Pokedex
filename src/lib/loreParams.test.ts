import { describe, it, expect } from "vitest";
import {
  DEFAULT_LORE_TAB,
  LORE_TABS,
  parseLoreTab,
  serializeLoreTab,
} from "./loreParams";

const params = (query: string) => new URLSearchParams(query);

describe("parseLoreTab", () => {
  it("lê uma aba válida", () => {
    expect(parseLoreTab(params("aba=generations"))).toBe("generations");
    expect(parseLoreTab(params("aba=landmarks"))).toBe("landmarks");
  });

  it("sem parâmetro, cai na aba padrão", () => {
    expect(parseLoreTab(params(""))).toBe(DEFAULT_LORE_TAB);
  });

  /** URL editada à mão não pode deixar a tela sem aba nenhuma. */
  it("valor fora da lista cai na aba padrão", () => {
    expect(parseLoreTab(params("aba=inexistente"))).toBe(DEFAULT_LORE_TAB);
    expect(parseLoreTab(params("aba="))).toBe(DEFAULT_LORE_TAB);
    expect(parseLoreTab(params("aba=GENERATIONS"))).toBe(DEFAULT_LORE_TAB);
  });

  it("toda aba da lista sobrevive à ida e à volta", () => {
    for (const tab of LORE_TABS) {
      expect(parseLoreTab(serializeLoreTab(tab))).toBe(tab);
    }
  });
});

describe("serializeLoreTab", () => {
  /** URL limpa no caso comum, como homeParams já faz. */
  it("não escreve a aba padrão na URL", () => {
    expect(serializeLoreTab(DEFAULT_LORE_TAB).toString()).toBe("");
  });

  it("escreve as demais", () => {
    expect(serializeLoreTab("generations").toString()).toBe("aba=generations");
  });
});
