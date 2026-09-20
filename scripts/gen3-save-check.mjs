/**
 * Valida o parser de save contra um `.sav` de verdade.
 *
 *   npm run gen3:save-check "saves/Pokemon - Emerald.sav"
 *
 * É só um disparo: passa o caminho em `GEN3_SAVE` e roda
 * `src/emulator/saveParse/gen3Real.test.ts` pelo vitest, que já resolve o
 * TypeScript e a resolução de módulo do projeto. Importar o parser direto daqui
 * não funciona — o `node --experimental-strip-types` exige extensão explícita
 * nos imports, e o resto do projeto usa resolução de bundler.
 *
 * O `.sav` fica fora do repositório de propósito (`saves/` está no
 * `.gitignore`): é progresso de jogo de quem o gerou. O caso hermético, que
 * roda em qualquer máquina, é o `gen3.test.ts`, com um save montado em código.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const caminho = process.argv[2];
if (!caminho) {
  console.error('uso: npm run gen3:save-check "<arquivo.sav>"');
  process.exit(2);
}
if (!existsSync(caminho)) {
  console.error(`não achei ${caminho}`);
  process.exit(2);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const { status } = spawnSync(
  npx,
  ["vitest", "run", "src/emulator/saveParse/gen3Real.test.ts"],
  { stdio: "inherit", env: { ...process.env, GEN3_SAVE: caminho }, shell: true }
);
process.exit(status ?? 1);
