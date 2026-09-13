import { describe, expect, it } from "vitest";
import {
  DEFAULT_AV,
  appendLog,
  formatLogLine,
  isAvSettings,
  isProblem,
  type LogLine,
} from "./diagnostics";
import type { LogEntry, LogLevel } from "@thenick775/mgba-wasm";

const entry = (
  message: string,
  level: LogLevel = "INFO",
  category = "GBA"
): LogEntry => ({
  level,
  category,
  message,
});

describe("appendLog", () => {
  it("acrescenta linhas em ordem", () => {
    const l1 = appendLog([], entry("um"));
    const l2 = appendLog(l1, entry("dois"));
    expect(l2.map((l) => l.message)).toEqual(["um", "dois"]);
  });

  it("colapsa repeticao imediata em vez de encher o log", () => {
    let lines: LogLine[] = [];
    for (let i = 0; i < 5; i++) lines = appendLog(lines, entry("igual"));
    expect(lines).toHaveLength(1);
    expect(lines[0].count).toBe(5);
  });

  it("repeticao nao imediata conta como linha nova", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("a"));
    lines = appendLog(lines, entry("b"));
    lines = appendLog(lines, entry("a"));
    expect(lines.map((l) => l.message)).toEqual(["a", "b", "a"]);
  });

  it("mesma mensagem em categoria diferente nao colapsa", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("x", "INFO", "GBA"));
    lines = appendLog(lines, entry("x", "INFO", "GB"));
    expect(lines).toHaveLength(2);
  });

  it("mesma mensagem em nivel diferente nao colapsa", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("x", "INFO"));
    lines = appendLog(lines, entry("x", "ERROR"));
    expect(lines).toHaveLength(2);
  });

  it("respeita o teto, descartando as mais antigas", () => {
    let lines: LogLine[] = [];
    for (let i = 0; i < 10; i++) lines = appendLog(lines, entry(`m${i}`), 4);
    expect(lines).toHaveLength(4);
    expect(lines.map((l) => l.message)).toEqual(["m6", "m7", "m8", "m9"]);
  });

  it("nao muta a lista recebida", () => {
    const original = appendLog([], entry("a"));
    appendLog(original, entry("a"));
    expect(original[0].count).toBe(1);
  });
});

describe("isProblem", () => {
  it("destaca o que e falha", () => {
    expect(isProblem("FATAL")).toBe(true);
    expect(isProblem("ERROR")).toBe(true);
    expect(isProblem("GAME ERROR")).toBe(true);
  });

  it("ruido comum nao e destaque", () => {
    expect(isProblem("INFO")).toBe(false);
    expect(isProblem("DEBUG")).toBe(false);
    expect(isProblem("WARN")).toBe(false);
    expect(isProblem("STUB")).toBe(false);
  });
});

describe("formatLogLine", () => {
  it("uma linha legivel", () => {
    expect(
      formatLogLine({ level: "WARN", category: "GBA BIOS", message: "oi", count: 1 })
    ).toBe("[WARN] GBA BIOS: oi");
  });

  it("mostra a contagem quando houve repeticao", () => {
    expect(
      formatLogLine({ level: "INFO", category: "GBA", message: "oi", count: 12 })
    ).toBe("[INFO] GBA: oi (12×)");
  });
});

describe("isAvSettings", () => {
  it("aceita o formato completo", () => {
    expect(isAvSettings(DEFAULT_AV)).toBe(true);
  });

  it("recusa o que veio pela metade ou errado", () => {
    expect(isAvSettings({ audioSync: true })).toBe(false);
    expect(isAvSettings({ ...DEFAULT_AV, videoSync: "sim" })).toBe(false);
    expect(isAvSettings(null)).toBe(false);
    expect(isAvSettings("audioSync")).toBe(false);
  });
});
