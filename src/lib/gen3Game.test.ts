import { describe, it, expect } from "vitest";
import { badgesOf, gameLabel, regionOfGame, saveVersion } from "./gen3Game";

describe("saveVersion", () => {
  it("Emerald é Emerald", () => {
    expect(saveVersion("emerald", "Pokemon - Emerald.gba")).toBe("emerald");
  });
  it("FR/LG se separa pelo nome da ROM, FireRed na dúvida", () => {
    expect(saveVersion("frlg", "Pokemon - Leaf Green (USA).gba")).toBe("leafgreen");
    expect(saveVersion("frlg", "leafgreen.gba")).toBe("leafgreen");
    expect(saveVersion("frlg", "Pokemon Fire Red.gba")).toBe("firered");
    expect(saveVersion("frlg", "rom.gba")).toBe("firered");
  });
  it("R/S se separa pelo nome da ROM, Ruby na dúvida", () => {
    expect(saveVersion("rs", "Pokemon - Sapphire Version.gba")).toBe("sapphire");
    expect(saveVersion("rs", "ruby.gba")).toBe("ruby");
    expect(saveVersion("rs", "x.gba")).toBe("ruby");
  });
});

describe("badgesOf / regionOfGame / gameLabel", () => {
  it("FR/LG é Kanto, os outros Hoenn", () => {
    expect(badgesOf("frlg")[0]?.leader).toBe("Brock");
    expect(badgesOf("emerald")[0]?.leader).toBe("Roxanne");
    expect(badgesOf("rs")[7]?.leader).toBe("Juan");
    expect(regionOfGame("frlg")).toBe("kanto");
    expect(regionOfGame("rs")).toBe("hoenn");
  });
  it("nome do jogo", () => {
    expect(gameLabel("frlg")).toBe("FireRed/LeafGreen");
    expect(gameLabel("rs")).toBe("Ruby/Sapphire");
    expect(gameLabel("emerald")).toBe("Emerald");
  });
});
