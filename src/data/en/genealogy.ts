import type { GenealogyBranch, GenealogyNode } from "../genealogy";

/** Ramos, por id. */
export const GENEALOGY_BRANCHES_EN: Record<string, Pick<GenealogyBranch, "title" | "note">> = {
  criacao: { title: "The creation trio", note: "The three axes the universe rests on." },
  lagos: { title: "The lake beings", note: "They gave humans what sets them apart from other animals." },
  terra: { title: "The sculptor and its golems", note: "Who shaped the land, and what it left behind." },
  clima: { title: "The weather trio", note: "Land, sea and sky — and the fight that nearly undid all three." },
  vida: { title: "The origin of life", note: "The common ancestor — and the only offspring made by humans." },
  luz: { title: "The light of Ultra Space", note: "What came from outside the world, and what was born of it." },
};

/** Nós da árvore, pelo nome do pokémon — é único na árvore inteira. */
export const GENEALOGY_NODES_EN: Record<string, Pick<GenealogyNode, "role" | "note">> = {
  arceus: { role: "The Original One", note: "Emerged from the cosmic Egg and created the universe." },
  dialga: { role: "Lord of Time", note: "Rules the timeline." },
  palkia: { role: "Lord of Space", note: "Shapes physical dimensions." },
  giratina: { role: "Guardian of Antimatter", note: "Banished to the Distortion World for its violence." },
  uxie: { role: "Being of Knowledge", note: "Gave humans intelligence. Lake Acuity." },
  mesprit: { role: "Being of Emotion", note: "Gave humans the ability to feel. Lake Verity." },
  azelf: { role: "Being of Willpower", note: "Gave humans the strength to act. Lake Valor." },
  regigigas: { role: "Sculptor of the Continents", note: "Towed the tectonic plates and created the three Regis." },
  regirock: { role: "Rock golem" },
  regice: { role: "Ice golem" },
  registeel: { role: "Steel golem" },
  groudon: { role: "Continent", note: "Rose from the magma, expanding the land." },
  kyogre: { role: "Ocean", note: "Came up from the depths to fill the seas." },
  rayquaza: { role: "Sky", note: "Descends from the stratosphere to calm Groudon and Kyogre." },
  mew: { role: "Ancestor of all Pokémon", note: "Its genes contain the DNA of every species." },
  mewtwo: { role: "Artificial descendant", note: "Cloned by scientists from Mew's DNA." },
  necrozma: { role: "Older than the world", note: "Comes from Ultra Space, hungry for light." },
  cosmog: { role: "Cosmic seed", note: "Falls from Ultra Space. Evolves into Cosmoem." },
  solgaleo: { role: "Devourer of the Sun" },
  lunala: { role: "Devourer of the Moon" },
};
