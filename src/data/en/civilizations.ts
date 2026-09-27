import type { AncientSite } from "../civilizations";

/** Texto em inglês de `CIVILIZATIONS`, por id. Nomes de lugar como nos jogos. */
export const CIVILIZATIONS_EN: Record<
  string,
  Pick<AncientSite, "name" | "region" | "age" | "discovery" | "purpose">
> = {
  "ruins-of-alph": {
    name: "Ruins of Alph",
    region: "Johto",
    age: "Over 1,500 years",
    discovery: "Discovered by archaeologists from Violet City early in the century.",
    purpose:
      "Underground chambers covered in 26 hieroglyphs identical to the modern Unown alphabet. Nobody knows whether the Unown taught humans the alphabet or the other way around. Excavations revealed rooms with puzzles (Kabuto, Aerodactyl, Ho-Oh, Omanyte) that must be solved to reveal further chambers.",
  },
  "sinjoh-ruins": {
    name: "Sinjoh Ruins",
    region: "Johto/Sinnoh border",
    age: "Undetermined age (pre-human)",
    discovery:
      "Found by snow hunters in the valley between Kanto and Sinnoh. It only becomes visible when Arceus is brought there.",
    purpose:
      "A ritual chamber where the creation of the world can be re-enacted. Bringing Arceus + a specific item produces an Egg holding Dialga, Palkia or Giratina in its Origin form. The only known place where the creation can be reproduced.",
  },
  "sealed-chamber": {
    name: "Sealed Chamber",
    region: "Hoenn (Route 134)",
    age: "3,000 years or more",
    discovery: "An underwater find south of Pacifidlog Town, amid violent sea currents.",
    purpose:
      "A chamber written in Braille with instructions to free Regirock, Regice and Registeel from their prisons scattered across Hoenn. The ritual requires a Wailord and a Relicanth at opposite ends of the party — the largest Pokémon and the oldest.",
  },
  "snowpoint-temple": {
    name: "Snowpoint Temple",
    region: "Sinnoh (far north)",
    age: "Millennia (date unknown)",
    discovery:
      "It was always in plain sight on an icy cliff. It had never been opened because no method was known.",
    purpose:
      "The tomb of Regigigas — the continent Pokémon that towed the tectonic plates with ropes and created the three Regis. It only opens when the Trainer brings Regirock, Regice and Registeel in the party.",
  },
  "sky-pillar": {
    name: "Sky Pillar",
    region: "Hoenn (Route 131)",
    age: "Deep antiquity",
    discovery: "An isolated tower on an uninhabited island — visible from afar.",
    purpose:
      "A tower ancient Hoenn people built to touch the sky and summon Rayquaza whenever Groudon and Kyogre clashed. Its upper floors crumble under weight — only a Mach Bike can cross them.",
  },
  "hall-of-origin": {
    name: "Hall of Origin",
    region: "Sinnoh (Mount Coronet apex)",
    age: "Older than the creation itself",
    discovery: "It only exists when Arceus allows itself to be seen.",
    purpose:
      "Arceus's throne. It sits above the summit of Mount Coronet, reachable only through the Azure Flute — an item destroyed after one use. It is the only place where humans can meet Arceus, and even then rarely.",
  },
  "relic-castle": {
    name: "Relic Castle",
    region: "Unova (Desert Resort)",
    age: "Over 2,500 years",
    discovery: "Buried by sandstorms; ongoing excavations keep revealing it.",
    purpose:
      "A prehistoric citadel whose deep chambers hold Volcarona fossils — the sun Pokémon that relit the sun when it threatened to go out. Considered sacred by the first people of Unova.",
  },
  "abyssal-ruins": {
    name: "Abyssal Ruins",
    region: "Unova (Undella Bay)",
    age: "Unknown age",
    discovery: "Only revealed when the bay's water recedes under certain currents.",
    purpose:
      "An undersea complex with Braille inscriptions pointing to legendary treasures. Some believe it was an outpost of the Sinjoh civilization; others, a sea cult. Arceus's Plates were found in the ruins.",
  },
  "az-ruins": {
    name: "AZ's ruins",
    region: "Kalos (Geosenge Town)",
    age: "Exactly 3,000 years",
    discovery: "Always visible; carbon-dated.",
    purpose:
      "The remains of the ultimate weapon built by King AZ, powered by Xerneas. Under Geosenge Town lies the underground chamber where the weapon was sealed. Team Flare briefly reactivated it before it was destroyed.",
  },
  "poni-altars": {
    name: "Poni altars",
    region: "Alola (Poni Island)",
    age: "Older than human settlement in Alola",
    discovery: "Always in plain sight; guarded by the Tapus.",
    purpose:
      "Two twin altars where Cosmog evolves: in Sun, the Altar of the Sunne releases Solgaleo; in Moon, the Altar of the Moone releases Lunala. Necrozma fuses with one of the two when it hungers for light. It is where the Ultra Wormholes opened during the crisis.",
  },
  "turffield-runes": {
    name: "Turffield Runes",
    region: "Galar (Turffield)",
    age: "3,000 years",
    discovery: "A huge figure drawn on the hillside, visible only from above.",
    purpose:
      "A giant petroglyph showing the two heroes of the Darkest Day with Zacian and Zamazenta facing a colossal dragon (Eternatus). Only Sonia deciphered it — the official version of Galar's legend had been wrong for centuries.",
  },
  "area-zero": {
    name: "Area Zero — Zero Lab",
    region: "Paldea (Great Crater of Paldea)",
    age: "Crater formed ages ago; lab built decades ago",
    discovery: "The crater always existed; the lab is a recent ruin.",
    purpose:
      "The bottom of the crater where Sada/Turo opened a space-time rift. It led to the arrival of Paradox Pokémon from the past or the future. Terapagos was found there, next to the abandoned Zero Lab.",
  },
};
