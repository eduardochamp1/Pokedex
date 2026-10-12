import { describe, expect, it } from "vitest";
import { MELODIA, midiParaHz, volumeNoLaco } from "./ambientMusic";

describe("trilha ambiente", () => {
  it("converte nota MIDI em frequência", () => {
    expect(midiParaHz(69)).toBe(440);
    expect(midiParaHz(81)).toBe(880);
    expect(midiParaHz(60)).toBeCloseTo(261.63, 2);
  });

  it("a melodia fecha em oito compassos de oito passos", () => {
    expect(MELODIA).toHaveLength(8);
    for (const compasso of MELODIA) expect(compasso).toHaveLength(8);
  });

  it("a faixa entra e sai em fade, e passa pelo silêncio na volta do laço", () => {
    expect(volumeNoLaco(0, 60, 0.08, 2)).toBe(0);
    expect(volumeNoLaco(1, 60, 0.08, 2)).toBeCloseTo(0.04);
    expect(volumeNoLaco(30, 60, 0.08, 2)).toBe(0.08);
    expect(volumeNoLaco(59, 60, 0.08, 2)).toBeCloseTo(0.04);
    expect(volumeNoLaco(60, 60, 0.08, 2)).toBe(0);
  });

  it("faixa curta ou sem duração conhecida toca no volume cheio", () => {
    expect(volumeNoLaco(1, 3, 0.08, 2)).toBe(0.08);
    expect(volumeNoLaco(1, NaN, 0.08, 2)).toBe(0.08);
  });
});
