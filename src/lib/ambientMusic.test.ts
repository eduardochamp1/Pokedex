import { describe, expect, it } from "vitest";
import { MELODIA, midiParaHz } from "./ambientMusic";

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
});
