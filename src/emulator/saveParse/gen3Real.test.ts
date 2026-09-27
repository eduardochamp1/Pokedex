import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { parseGen3Save } from "./gen3";

/**
 * Valida o parser contra um `.sav` de verdade, quando alguém aponta um.
 *
 *   npm run gen3:save-check "saves/Pokemon - Emerald.sav"
 *
 * Por que por variável de ambiente e não por caminho fixo: `saves/` está no
 * `.gitignore` e o `.sav` é progresso de jogo de quem o gerou, então ele não
 * existe em nenhuma outra máquina. Um teste que dependesse dele falharia por
 * motivo errado em todas elas.
 *
 * Sem a variável, o arquivo não declara teste nenhum — nada de `skip` silencioso
 * que a suíte reporta como verde e ninguém percebe que nunca rodou. O caso
 * hermético, que roda em qualquer lugar, é o `gen3.test.ts` ao lado, com um save
 * construído em código.
 */
const CAMINHO = process.env.GEN3_SAVE;

describe.runIf(CAMINHO)("parser contra um save real", () => {
  it("abre o save e lê um time plausível", () => {
    const caminho = CAMINHO as string;
    expect(existsSync(caminho), `não achei ${caminho}`).toBe(true);

    const bytes = new Uint8Array(readFileSync(caminho));
    const save = parseGen3Save(bytes);

    expect(save, "o parser recusou este save").not.toBeNull();
    expect(save?.playerName.length).toBeGreaterThan(0);
    expect(save?.party.length).toBeLessThanOrEqual(6);
    for (const p of save?.party ?? []) {
      expect(p.national).toBeGreaterThanOrEqual(1);
      expect(p.national).toBeLessThanOrEqual(386);
      expect(p.level).toBeGreaterThanOrEqual(1);
      expect(p.level).toBeLessThanOrEqual(100);
    }

    // A dex precisa passar na sanidade, e todo pokémon do time foi capturado.
    const dex = save?.pokedex;
    expect(dex, "a dex não passou na sanidade").not.toBeNull();
    const capturados = new Set(dex?.owned);
    for (const p of save?.party ?? []) expect(capturados.has(p.national)).toBe(true);

    console.log(
      `jogador ${save?.playerName} · ` +
        (save?.party.map((p) => `#${p.national} ${p.nickname} nv${p.level}`).join(", ") ||
          "time vazio") +
        ` · dex: ${dex?.owned.length} capturados, ${dex?.seen.length} vistos`
    );
  });
});
