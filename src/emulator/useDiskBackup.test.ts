import { describe, it, expect } from "vitest";
import { hasRealSaveData } from "./useDiskBackup";

/** Assinatura que todo setor de um save de Gen 3 carrega no offset 0x0FF8. */
function setorDeGen3(): Uint8Array {
  const bytes = new Uint8Array(4096);
  new DataView(bytes.buffer).setUint32(0x0ff8, 0x08012025, true);
  return bytes;
}

describe("hasRealSaveData", () => {
  it("recusa buffer ausente ou vazio", () => {
    expect(hasRealSaveData(undefined)).toBe(false);
    expect(hasRealSaveData(new Uint8Array(0))).toBe(false);
  });

  /**
   * O caso que motivou a função, e que o guard antigo (`length === 0`) deixava
   * passar: a flash de um jogo de Gen 3 é alocada com o tamanho certo —
   * 131072 bytes — e preenchida de zero. O jogo nunca gravou, mas o backup
   * copiava assim mesmo e o dono ficava com um arquivo em `saves/` que parece
   * progresso e não é. Foi o que aconteceu com o `Pokemon - Emerald.sav` do
   * repositório: 131072 bytes, nenhum byte diferente de zero.
   */
  it("recusa flash recém-alocada, que tem o tamanho certo e é toda zero", () => {
    expect(hasRealSaveData(new Uint8Array(131072))).toBe(false);
    expect(hasRealSaveData(new Uint8Array(32768))).toBe(false);
  });

  it("aceita qualquer buffer com conteúdo", () => {
    const quaseZerado = new Uint8Array(131072);
    quaseZerado[131071] = 1;
    expect(hasRealSaveData(quaseZerado)).toBe(true);
  });

  it("aceita um save de Gen 3 de verdade", () => {
    const save = new Uint8Array(131072);
    save.set(setorDeGen3(), 0);
    expect(hasRealSaveData(save)).toBe(true);
  });
});
