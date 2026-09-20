/**
 * Extrai de uma ROM de Gen 3 a tabela de espécies e a conversão para dex
 * nacional, e emite `src/emulator/saveParse/gen3Species.ts`.
 *
 * A ROM **não** entra no repositório nem no bundle: o script roda uma vez, na
 * máquina de quem tem o cartucho, e o que se comita é o `.ts` gerado.
 *
 *   node scripts/gen3-species.mjs roms/Pokemon\ -\ Emerald.gba
 *
 * ## Por que localizador e não offset fixo
 *
 * Offset fixo não sobrevive a romhack. Medido nas quatro ROMs de `roms/`: a
 * tabela de nomes está em 0x3185C8 na Emerald, 0x245F2C na LeafGreen, 0x245EE0
 * na Rocket (offset da FireRed, não da LeafGreen) e 0x166A98C na Unbound, que
 * foi repontada e tem 1294 entradas indo até Gen 8, com nomes em caixa mista.
 *
 * Então a tabela é encontrada pelo conteúdo: procura-se `IVYSAUR` — e também
 * `Ivysaur`, por causa dos hacks — e volta-se 22 bytes (duas entradas de 11)
 * para chegar ao início. Três âncoras confirmam: índice 1 = Bulbasaur, 251 =
 * Celebi, 411 = Chimecho.
 *
 * ⚠️ Não ancore pela assinatura ingênua de dez `0xAC` seguidos: ela dá falso
 * positivo na Unbound, em 0x879DA6.
 *
 * ## Por que a conversão sai da ROM
 *
 * `nacional = índice − 25` é tentador e está errado: quebra a partir do índice
 * 301 e erra 109 das 135 espécies de Hoenn. A própria ROM carrega
 * `sSpeciesToNationalPokedexNum`, um `u16[411]` indexado por `espécie − 1`,
 * bijetivo e idêntico nas quatro ROMs. Basta ler.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRADA_BYTES = 11;
/** Quantas espécies a tabela oficial de Gen 3 tem. Prova de borda no README. */
const ESPECIES = 412;
const TERMINADOR = 0xff;

/**
 * Charset da Gen 3, deduzido empiricamente das ROMs.
 *
 * Não é ASCII: as letras começam em 0xBB e o espaço é 0x00. O `2` de PORYGON2 é
 * o único dígito que aparece na tabela oficial.
 */
const CHARSET = new Map([
  [0x00, " "],
  [0xa3, "2"],
  [0xac, "?"],
  [0xad, "."],
  [0xae, "-"],
  [0xb4, "'"],
  [0xb5, "♂"],
  [0xb6, "♀"],
]);
for (let i = 0; i < 26; i++) {
  CHARSET.set(0xbb + i, String.fromCharCode(65 + i)); // A-Z
  CHARSET.set(0xd5 + i, String.fromCharCode(97 + i)); // a-z
}

/** Texto -> bytes, para procurar na ROM. Devolve null se algum char faltar. */
function codificar(texto) {
  const inverso = new Map([...CHARSET].map(([b, c]) => [c, b]));
  const bytes = [];
  for (const ch of texto) {
    const b = inverso.get(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  return Buffer.from(bytes);
}

function decodificarEntrada(rom, offset) {
  let texto = "";
  for (let i = 0; i < ENTRADA_BYTES; i++) {
    const b = rom[offset + i];
    if (b === TERMINADOR) break;
    texto += CHARSET.get(b) ?? "";
  }
  return texto.trimEnd();
}

/** Todas as posições de um padrão na ROM. */
function acharTodos(rom, padrao) {
  const hits = [];
  let de = 0;
  for (;;) {
    const i = rom.indexOf(padrao, de);
    if (i < 0) break;
    hits.push(i);
    de = i + 1;
  }
  return hits;
}

/** Comparação frouxa: os hacks escrevem em caixa mista. */
const igual = (a, b) => a.toUpperCase() === b.toUpperCase();

function acharTabelaDeNomes(rom) {
  const candidatos = [];
  for (const forma of ["IVYSAUR", "Ivysaur"]) {
    const padrao = codificar(forma);
    if (!padrao) continue;
    for (const hit of acharTodos(rom, padrao)) {
      // Ivysaur é o índice 2; volta duas entradas para o início da tabela.
      const inicio = hit - 2 * ENTRADA_BYTES;
      if (inicio < 0) continue;
      const ancoras = [
        [1, "BULBASAUR"],
        [251, "CELEBI"],
        [411, "CHIMECHO"],
      ];
      const bate = ancoras.every(([idx, nome]) =>
        igual(decodificarEntrada(rom, inicio + idx * ENTRADA_BYTES), nome)
      );
      if (bate) candidatos.push(inicio);
    }
  }
  const unicos = [...new Set(candidatos)];
  if (unicos.length !== 1) {
    throw new Error(
      `esperava um hit único para a tabela de nomes, achei ${unicos.length}` +
        (unicos.length ? ": " + unicos.map((o) => "0x" + o.toString(16)) : "")
    );
  }
  return unicos[0];
}

/**
 * `sSpeciesToNationalPokedexNum`: u16[411] indexado por espécie − 1.
 *
 * Gen 1 e 2 têm nacional == espécie, então os 251 primeiros valores são
 * 1,2,3,…,251 — uma sequência longa o bastante para ser única. Duas âncoras
 * fora dela confirmam: entry[276] == 252 e entry[410] == 358.
 */
function acharTabelaDeConversao(rom) {
  const RUN = 251;
  const candidatos = [];
  for (let off = 0; off + 411 * 2 <= rom.length; off += 2) {
    let ok = true;
    for (let i = 0; i < RUN; i++) {
      if (rom.readUInt16LE(off + i * 2) !== i + 1) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (rom.readUInt16LE(off + 276 * 2) !== 252) continue;
    if (rom.readUInt16LE(off + 410 * 2) !== 358) continue;
    candidatos.push(off);
  }
  if (candidatos.length !== 1) {
    throw new Error(
      `esperava um hit único para a conversão, achei ${candidatos.length}`
    );
  }
  return candidatos[0];
}

// ---------------------------------------------------------------- execução

const caminho = process.argv[2];
if (!caminho) {
  console.error("uso: node scripts/gen3-species.mjs <rom.gba>");
  process.exit(2);
}

const rom = readFileSync(caminho);
const offNomes = acharTabelaDeNomes(rom);
const offConversao = acharTabelaDeConversao(rom);
console.log(`nomes      em 0x${offNomes.toString(16).toUpperCase()}`);
console.log(`conversão  em 0x${offConversao.toString(16).toUpperCase()}`);

/** índice de espécie (1..411) -> { nome, nacional } */
const porEspecie = new Map();
for (let idx = 1; idx < ESPECIES; idx++) {
  const nome = decodificarEntrada(rom, offNomes + idx * ENTRADA_BYTES);
  const nacional = rom.readUInt16LE(offConversao + (idx - 1) * 2);
  // Os 25 sentinelas (índices 252–276) mapeiam para 387..411 e não são
  // espécies — a tabela de nomes guarda "?" neles.
  if (nacional < 1 || nacional > 386) continue;
  porEspecie.set(idx, { nome, nacional });
}

console.log(`${porEspecie.size} espécies com nacional em 1..386`);

// ---- validação automática contra a PokéAPI, em vez de revisão manual
//
// `/pokemon-species` e não `/pokemon`: o segundo serve o slug da FORMA default
// ("deoxys-normal"), e a ROM guarda a espécie ("DEOXYS"). Comparar com o
// endpoint errado produz uma divergência falsa no índice 410.
const resposta = await fetch(
  "https://pokeapi.co/api/v2/pokemon-species?limit=100000"
);
if (!resposta.ok) {
  console.error(`PokéAPI respondeu ${resposta.status}`);
  process.exit(2);
}
const porId = new Map();
for (const p of (await resposta.json()).results) {
  const id = Number(p.url.split("/").filter(Boolean).pop());
  if (id >= 1 && id <= 386) porId.set(id, p.name);
}

const divergentes = [];
for (const [idx, { nome, nacional }] of porEspecie) {
  const daApi = porId.get(nacional);
  // A ROM escreve NIDORAN♂/♀, FARFETCH'D, MR. MIME; a API usa slug.
  const normal = (s) =>
    s
      .toLowerCase()
      .replace(/♂/g, "-m")
      .replace(/♀/g, "-f")
      .replace(/['. ]/g, "")
      .replace(/-/g, "");
  if (!daApi || normal(daApi) !== normal(nome)) {
    divergentes.push({ idx, nome, nacional, daApi });
  }
}

if (divergentes.length) {
  console.error(`\n${divergentes.length} divergências contra a PokéAPI:`);
  for (const d of divergentes.slice(0, 20)) {
    console.error(`  idx ${d.idx}: ROM "${d.nome}" -> #${d.nacional} = "${d.daApi}"`);
  }
  process.exit(1);
}
console.log("todas as espécies batem com a PokéAPI");

// ---- emissão
const linhas = [...porEspecie.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([idx, { nome, nacional }]) => `  [${idx}, ${nacional}], // ${nome}`);

const saida = `/**
 * Índice interno de espécie de Gen 3 -> número na dex nacional.
 *
 * GERADO por \`node scripts/gen3-species.mjs <rom.gba>\`. Não edite à mão.
 *
 * Os jogos de Gen 3 guardam no save o índice interno da espécie, que **não** é
 * o número da dex nacional. A conversão não tem fórmula: \`nacional = índice − 25\`
 * quebra a partir do índice 301 e erra 109 das 135 espécies de Hoenn. A tabela
 * sai de \`sSpeciesToNationalPokedexNum\`, lida da própria ROM.
 *
 * Os índices 252–276 não aparecem aqui: são sentinelas que a tabela de nomes
 * guarda como "?" e que mapeiam para 387..411, fora da dex de Gen 3.
 *
 * Cada linha foi conferida contra o índice da PokéAPI na geração — o script
 * falha em qualquer divergência, em vez de pedir revisão de 412 linhas à mão.
 */
export const GEN3_SPECIES_TO_NATIONAL: ReadonlyArray<readonly [number, number]> = [
${linhas.join("\n")}
];

/** Busca direta, montada uma vez. */
const POR_INDICE = new Map(GEN3_SPECIES_TO_NATIONAL);

/** Número na dex nacional de um índice interno de Gen 3, ou undefined. */
export function nationalFromGen3Species(index: number): number | undefined {
  return POR_INDICE.get(index);
}
`;

const destino = "src/emulator/saveParse/gen3Species.ts";
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, saida, "utf8");
console.log(`escrito ${destino} com ${porEspecie.size} entradas`);
