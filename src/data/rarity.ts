// Curadoria de raridade — nomes canônicos da PokéAPI.
// Referência: is_legendary / is_mythical / is_baby dos endpoints /pokemon-species.

export const MYTHICAL: string[] = [
  "mew", "celebi", "jirachi", "deoxys", "phione", "manaphy", "darkrai",
  "shaymin", "arceus", "victini", "keldeo", "meloetta", "genesect",
  "diancie", "hoopa", "volcanion", "magearna", "marshadow", "zeraora",
  "meltan", "melmetal", "zarude", "pecharunt",
];

export const LEGENDARY: string[] = [
  // Kanto
  "articuno", "zapdos", "moltres", "mewtwo",
  // Johto
  "raikou", "entei", "suicune", "lugia", "ho-oh",
  // Hoenn
  "regirock", "regice", "registeel", "latias", "latios",
  "kyogre", "groudon", "rayquaza",
  // Sinnoh
  "uxie", "mesprit", "azelf", "dialga", "palkia", "heatran",
  "regigigas", "giratina", "cresselia",
  // Unova
  "cobalion", "terrakion", "virizion", "tornadus", "thundurus", "landorus",
  "reshiram", "zekrom", "kyurem",
  // Kalos
  "xerneas", "yveltal", "zygarde",
  // Alola
  "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini",
  "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma",
  // Galar
  "zacian", "zamazenta", "eternatus", "kubfu", "urshifu",
  "regieleki", "regidrago", "glastrier", "spectrier", "calyrex",
  // Paldea
  "koraidon", "miraidon", "wo-chien", "chien-pao", "ting-lu", "chi-yu",
  "okidogi", "munkidori", "fezandipiti", "ogerpon", "terapagos",
];

export const BABY: string[] = [
  "pichu", "cleffa", "igglybuff", "togepi", "tyrogue", "smoochum",
  "elekid", "magby", "azurill", "wynaut", "budew", "chingling",
  "bonsly", "mime-jr", "happiny", "munchlax", "riolu", "mantyke", "toxel",
];

export const STARTERS: string[] = [
  "bulbasaur", "charmander", "squirtle",
  "chikorita", "cyndaquil", "totodile",
  "treecko", "torchic", "mudkip",
  "turtwig", "chimchar", "piplup",
  "snivy", "tepig", "oshawott",
  "chespin", "fennekin", "froakie",
  "rowlet", "litten", "popplio",
  "grookey", "scorbunny", "sobble",
  "sprigatito", "fuecoco", "quaxly",
];

export const RARITIES = [
  { id: "legendary", label: "Lendários", names: LEGENDARY },
  { id: "mythical",  label: "Míticos",   names: MYTHICAL  },
  { id: "baby",      label: "Bebês",     names: BABY      },
  { id: "starter",   label: "Iniciais",  names: STARTERS  },
] as const;

export type RarityId = (typeof RARITIES)[number]["id"];
