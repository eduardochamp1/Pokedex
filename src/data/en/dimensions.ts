import type { Dimension } from "../dimensions";

/** Texto em inglês de `DIMENSIONS`, por id. Nomes próprios como nos jogos. */
export const DIMENSIONS_EN: Record<string, Pick<Dimension, "name" | "ruler" | "access" | "description">> = {
  distortion: {
    name: "Distortion World",
    ruler: "Giratina",
    access: "Turnback Cave (Sinnoh), the distorted Spear Pillar (Platinum).",
    description:
      "A mirror plane of the normal world where gravity, time and space behave chaotically. Arceus banished Giratina here for its violence during the creation. Cyrus, the leader of Team Galactic, wandered this world alone after his defeat.",
  },
  ultraspace: {
    name: "Ultra Space",
    ruler: "Necrozma (originally)",
    access: "Ultra Wormholes opened by the Aether Foundation in Alola; widened by Lusamine's obsession.",
    description:
      "A network of alternate worlds linked by wormholes. Each Ultra Beast comes from a different Ultra World — Ultra Jungle (Buzzwole), Ultra Desert (Kartana), Ultra Deep Sea (Nihilego), and so on. Necrozma lived here before it was banished; now it steals light to return.",
  },
  dreamworld: {
    name: "Dream World",
    ruler: "Musharna / Cresselia",
    access: "You enter through Musharna's Dream Mist. Only the mind wanders there — the body stays asleep.",
    description:
      "The plane of dreams every consciousness drifts to in deep sleep. Cresselia brings good dreams; Darkrai, confined to Newmoon Island, brings nightmares. Some Pokémon with hidden abilities can only be found here.",
  },
  sinjoh: {
    name: "Sinjoh Ruins",
    ruler: "Arceus",
    access: "Arceus's ceremony + an Egg carried to the Sinjoh Ruins on the Sinnoh/Johto border.",
    description:
      "A meeting point between eras. Bringing Arceus here with a specific item triggers a ritual that produces an Egg holding Dialga, Palkia or Giratina in their Origin forms. It is where the creation can be re-enacted.",
  },
  hisui: {
    name: "Hisui (ancient Sinnoh)",
    ruler: "None — a pre-human era",
    access: "A space-time rift in Jubilife Village (Legends: Arceus).",
    description:
      "What is now Sinnoh, centuries before human settlement. Hisuian forms live here (Zorua, Braviary, Growlithe, Voltorb), and so does Arceus itself before it became myth. Volo tried to exploit this era to force Arceus to remake the world.",
  },
  terastal: {
    name: "Area Zero / Terastal realm",
    ruler: "Terapagos",
    access: "The bottom of the Great Crater of Paldea.",
    description:
      "A giant crater formed by a crystalline meteorite. The Terastal energy that soaks the ground changes the type of local Pokémon and creates the crystal crowns. Koraidon (past) and Miraidon (future) came through rifts opened here by Professor Sada/Turo's experiments.",
  },
  shadow: {
    name: "Reverse World / Colosseum",
    ruler: "Cipher (criminal group)",
    access: "The Orre region — the games Pokémon Colosseum and XD: Gale of Darkness.",
    description:
      "Not quite a parallel dimension, but a region with no tall grass where wild Pokémon don't appear. Cipher developed a technique to close Pokémon's hearts, creating Shadow Pokémon — able to attack humans, a tendency discovered with Shadow Lugia (XD001).",
  },
};
