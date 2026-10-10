import { describe, expect, it } from "vitest";
import {
  AV_TOGGLES,
  DEFAULT_AV,
  appendLog,
  formatLogLine,
  isAvSettings,
  isProblem,
  isShown,
  logShape,
  type LogLine,
} from "./diagnostics";
import type { LogEntry, LogLevel } from "@thenick775/mgba-wasm";
import { MGBA_CORE_SETTINGS } from "./mgbaDefaults";

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

/**
 * O colapso por forma. O caso que motivou: o boot da Emerald escreve 74
 * `Bad memory Store16` seguidos, cada um com um endereço diferente — nenhum
 * igual ao anterior, então os 74 enchiam sozinhos a janela de 80 linhas.
 */
describe("logShape e o colapso por família", () => {
  it("endereço e valor somem da forma", () => {
    expect(logShape("Bad memory Store16: 0x00000022")).toBe(
      logShape("Bad memory Store16: 0x00000024")
    );
    expect(logShape("Stub I/O register write: 124")).toBe(
      logShape("Stub I/O register write: 126")
    );
  });

  /** O `\b` não casa entre letra e dígito — e é disso que depende a regra. */
  it("número grudado em palavra fica: Store16 não é Store32", () => {
    expect(logShape("Bad memory Store16: 0x22")).not.toBe(
      logShape("Bad memory Store32: 0x22")
    );
    expect(logShape("Unhandled SIOMULTI0 <- 0000")).not.toBe(
      logShape("Unhandled SIOMULTI1 <- 0000")
    );
  });

  it("os 74 do boot viram uma linha só", () => {
    let lines: LogLine[] = [];
    for (let i = 0; i < 74; i++) {
      const addr = (0x22 + i * 2).toString(16).padStart(8, "0");
      lines = appendLog(lines, entry(`Bad memory Store16: 0x${addr}`, "GAME ERROR"));
    }
    expect(lines).toHaveLength(1);
    expect(lines[0].count).toBe(74);
    expect(lines[0].varied).toBe(true);
    // A guardada é a primeira: é onde a coisa começou.
    expect(lines[0].message).toBe("Bad memory Store16: 0x00000022");
  });

  it("famílias diferentes não se misturam", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("Bad memory Store16: 0x22", "GAME ERROR"));
    lines = appendLog(lines, entry("Stub I/O register write: 124", "STUB"));
    lines = appendLog(lines, entry("Bad memory Store16: 0x24", "GAME ERROR"));
    expect(lines).toHaveLength(3);
  });

  it("repeticao identica nao vira 'parecidas'", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("igual"));
    lines = appendLog(lines, entry("igual"));
    expect(lines[0].varied).toBe(false);
  });
});

/**
 * A chave do `<li>` no painel. Sem identidade estavel, a janela deslizante
 * trocava a chave de todos os 80 itens a cada linha e o React recriava a lista
 * inteira — 15.423 mutacoes de DOM por segundo, medidas.
 */
describe("seq das linhas", () => {
  it("cada linha nova ganha um seq proprio, crescente", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("a"));
    lines = appendLog(lines, entry("b"));
    lines = appendLog(lines, entry("c"));
    expect(lines.map((l) => l.seq)).toEqual([1, 2, 3]);
  });

  it("repeticao colapsada mantem o seq: e o mesmo <li>", () => {
    let lines: LogLine[] = [];
    lines = appendLog(lines, entry("igual"));
    const antes = lines[0].seq;
    lines = appendLog(lines, entry("igual"));
    expect(lines[0].seq).toBe(antes);
    expect(lines[0].count).toBe(2);
  });

  it("a janela deslizar nao mexe no seq de quem ficou", () => {
    let lines: LogLine[] = [];
    for (let i = 0; i < 6; i++) lines = appendLog(lines, entry(`m${i}`), 3);
    // Sobraram m3, m4 e m5 — e cada um com o seq que tinha quando entrou.
    expect(lines.map((l) => l.message)).toEqual(["m3", "m4", "m5"]);
    expect(lines.map((l) => l.seq)).toEqual([4, 5, 6]);
  });
});

/**
 * O filtro que devolveu o turbo. Ver o comentario de `isShown`: DEBUG e INFO
 * eram 100% do trafego medido, a ~3,2 linhas por quadro emulado.
 */
describe("isShown", () => {
  it("o ruido por quadro nao chega ao painel", () => {
    expect(isShown("DEBUG")).toBe(false);
    expect(isShown("INFO")).toBe(false);
  });

  it("o que merece ser lido continua passando", () => {
    expect(isShown("FATAL")).toBe(true);
    expect(isShown("ERROR")).toBe(true);
    expect(isShown("GAME ERROR")).toBe(true);
    expect(isShown("WARN")).toBe(true);
    // STUB e raro e e exatamente "algo fora do comum".
    expect(isShown("STUB")).toBe(true);
  });

  it("tudo o que isProblem destaca sobrevive ao filtro", () => {
    const niveis: LogLevel[] = [
      "FATAL",
      "ERROR",
      "WARN",
      "INFO",
      "DEBUG",
      "STUB",
      "GAME ERROR",
    ];
    for (const n of niveis) {
      if (isProblem(n)) expect(isShown(n)).toBe(true);
    }
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
      formatLogLine({
        level: "WARN",
        category: "GBA BIOS",
        message: "oi",
        count: 1,
        varied: false,
        seq: 1,
      })
    ).toBe("[WARN] GBA BIOS: oi");
  });

  it("mostra a contagem quando houve repeticao", () => {
    expect(
      formatLogLine({
        level: "INFO",
        category: "GBA",
        message: "oi",
        count: 12,
        varied: false,
        seq: 1,
      })
    ).toBe("[INFO] GBA: oi (12×)");
  });

  it("avisa quando a contagem juntou mensagens parecidas, não iguais", () => {
    expect(
      formatLogLine({
        level: "GAME ERROR",
        category: "GBA Memory",
        message: "Bad memory Store16: 0x00000022",
        count: 74,
        varied: true,
        seq: 1,
      })
    ).toBe(
      "[GAME ERROR] GBA Memory: Bad memory Store16: 0x00000022 (74× parecidas)"
    );
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

/**
 * Quem manda no ritmo da emulação.
 *
 * Estes valores são os do core. Já apostei que `timestepSync` era a causa da
 * barra de velocidade não funcionar — não era, e a medição mostrou que o
 * problema estava no laço principal. Ver `aplicarVelocidade` no useEmulator.
 */
describe("ritmo da emulação", () => {
  it("os defaults são os do core", () => {
    expect(DEFAULT_AV.audioSync).toBe(false);
    expect(DEFAULT_AV.videoSync).toBe(false);
  });

  /**
   * O passo fixo saiu do painel porque desligado o jogo roda a 6,8× — medido.
   * Ele é constante do core agora, e a tela não pode oferecer desligá-lo.
   */
  it("o passo fixo não é mais oferecido, e continua ligado no core", () => {
    expect(AV_TOGGLES.map((t) => String(t.id))).not.toContain("timestepSync");
    expect(MGBA_CORE_SETTINGS.timestepSync).toBe(true);
  });

  /**
   * A v2 gravava `timestepSync`, e uma preferência daquelas com o passo fixo
   * desligado seria aplicada inteira pelo `setCoreSettings`. Campo a mais não
   * reprova no validador — quem aposenta a preferência velha é a chave v3, no
   * `useDiagnostics`.
   */
  it("preferência da v2 passa no validador — por isso a chave subiu para v3", () => {
    const v2 = {
      audioSync: false,
      videoSync: false,
      timestepSync: false,
      showFpsCounter: false,
    };
    expect(isAvSettings(v2)).toBe(true);
  });
});
