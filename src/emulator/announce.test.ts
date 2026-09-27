import { describe, it, expect } from "vitest";
import { padLabel, statusAnnouncement } from "./announce";

describe("statusAnnouncement", () => {
  const rom = "Pokemon - Emerald.gba";

  it("anuncia as transições que importam, sem a extensão do arquivo", () => {
    expect(statusAnnouncement({ kind: "ready" }, { kind: "running", rom }, "pt")).toBe("Jogando Pokemon - Emerald.");
    expect(statusAnnouncement({ kind: "running", rom }, { kind: "paused", rom }, "pt")).toBe("Pausado.");
    expect(statusAnnouncement({ kind: "paused", rom }, { kind: "running", rom }, "pt")).toBe("Continuando.");
    expect(statusAnnouncement({ kind: "running", rom }, { kind: "ready" }, "pt")).toBe("Jogo fechado.");
    expect(statusAnnouncement({ kind: "checking" }, { kind: "loading" }, "en")).toBe("Loading the emulator…");
    expect(statusAnnouncement({ kind: "loading" }, { kind: "ready" }, "en")).toBe("Emulator ready. Pick a game.");
  });

  it("trocar de jogo sem passar por pronto também é anunciado", () => {
    expect(statusAnnouncement({ kind: "running", rom }, { kind: "running", rom: "leaf.gba" }, "en")).toBe("Playing leaf.");
  });

  it("nada a dizer quando nada mudou; erro e 'sem suporte' já têm aviso próprio", () => {
    expect(statusAnnouncement({ kind: "running", rom }, { kind: "running", rom }, "pt")).toBe("");
    expect(statusAnnouncement({ kind: "running", rom }, { kind: "error", message: "x" }, "pt")).toBe("");
    expect(statusAnnouncement(null, { kind: "checking" }, "pt")).toBe("");
  });
});

describe("padLabel", () => {
  it("direcional com nome no idioma; botões com o nome do console", () => {
    expect(padLabel("Up", "pt")).toBe("Cima");
    expect(padLabel("Left", "en")).toBe("Left");
    expect(padLabel("A", "pt")).toBe("A");
    expect(padLabel("Start", "pt")).toBe("Start");
  });
});
