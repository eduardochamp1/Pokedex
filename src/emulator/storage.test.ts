import { describe, expect, it } from "vitest";
import { formatBytes, saveNameFor } from "./storage";

describe("saveNameFor", () => {
  it("troca a extensão da ROM por .sav", () => {
    expect(saveNameFor("emerald.gba")).toBe("emerald.sav");
    expect(saveNameFor("crystal.gbc")).toBe("crystal.sav");
    expect(saveNameFor("red.gb")).toBe("red.sav");
  });

  // A pasta roms/ aceita subpastas, e o nome do save nunca deve carregar
  // caminho — senão o PUT tentaria escrever em saves/gba/, que não existe.
  it("descarta o caminho da subpasta", () => {
    expect(saveNameFor("gba/emerald.gba")).toBe("emerald.sav");
    expect(saveNameFor("gb/kanto/red.gb")).toBe("red.sav");
    expect(saveNameFor("gba\\emerald.gba")).toBe("emerald.sav");
  });

  it("ignora a caixa da extensão", () => {
    expect(saveNameFor("EMERALD.GBA")).toBe("EMERALD.sav");
  });

  it("não confunde extensão no meio do nome", () => {
    expect(saveNameFor("pokemon.gba.backup.gba")).toBe("pokemon.gba.backup.sav");
  });

  it("nome sem extensão conhecida só ganha o sufixo", () => {
    expect(saveNameFor("jogo")).toBe("jogo.sav");
  });
});

describe("formatBytes", () => {
  it("escolhe a unidade legível", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(32768)).toBe("32 kB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
    expect(formatBytes(3330491713)).toBe("3.1 GB");
  });

  it("zero é zero, não indefinido", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("indefinido vira travessão em vez de NaN", () => {
    expect(formatBytes(undefined)).toBe("—");
  });
});
