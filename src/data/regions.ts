export interface Region {
  id: string;
  name: string;
  generation: number;
  inspiration: string;
  summary: string;
  signature: string[]; // pokémons emblemáticos
}

export const REGIONS: Region[] = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    inspiration: "Região de Kantō, Japão",
    summary:
      "A região onde tudo começou. Terra dos primeiros 151 pokémon, do Prof. Oak e da rivalidade entre Red e Blue. Palco do surgimento de Mewtwo e do fim da Team Rocket original.",
    signature: ["mewtwo", "mew", "articuno", "zapdos", "moltres"],
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    inspiration: "Regiões de Kansai e Tōkai, Japão",
    summary:
      "Terra de tradições e torres milenares. Ho-Oh e Lugia governam os céus; os Cães Lendários vagam por suas rotas. Ecruteak, Violet City e o Bell Tower guardam a história ancestral do mundo pokémon.",
    signature: ["ho-oh", "lugia", "suicune", "raikou", "entei", "celebi"],
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    inspiration: "Kyūshū, Japão",
    summary:
      "Ilha vulcânica com metade terra e metade mar. Cenário da batalha entre Groudon e Kyogre, com Rayquaza como mediador. Os três Regis dormem em câmaras seladas espalhadas pelo continente.",
    signature: ["groudon", "kyogre", "rayquaza", "latios", "latias", "deoxys"],
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    inspiration: "Hokkaidō, Japão",
    summary:
      "A região da criação. O Mount Coronet ergue-se no centro, onde Dialga e Palkia foram invocados pela primeira vez. Os três lagos abrigam Uxie, Mesprit e Azelf. Arceus adormece em Hall of Origin.",
    signature: ["dialga", "palkia", "giratina", "arceus", "uxie", "mesprit", "azelf"],
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    inspiration: "Nova York, EUA",
    summary:
      "A primeira região baseada em uma metrópole ocidental. Casa dos Dragões da Verdade e do Ideal — Reshiram e Zekrom — e das lendárias Espadas da Justiça: Cobalion, Terrakion, Virizion e Keldeo.",
    signature: ["reshiram", "zekrom", "kyurem", "cobalion", "terrakion", "virizion", "keldeo"],
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    inspiration: "França",
    summary:
      "Berço da beleza e da vida eterna. Xerneas e Yveltal encarnam o ciclo da existência, enquanto Zygarde vigia o equilíbrio da ordem. Cenário da história trágica do rei AZ e sua Máquina Definitiva.",
    signature: ["xerneas", "yveltal", "zygarde", "diancie", "hoopa", "volcanion"],
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    inspiration: "Havaí, EUA",
    summary:
      "Arquipélago tropical dividido em quatro ilhas, cada uma protegida por um Tapu. Aqui abre-se o portal para o Ultra Espaço — de onde vieram Necrozma, os Ultra Beasts e a família celestial de Cosmog.",
    signature: ["tapu-koko", "solgaleo", "lunala", "necrozma", "marshadow", "zeraora"],
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    inspiration: "Reino Unido",
    summary:
      "Terra da Dynamax e do Gigantamax. Casa de Eternatus — a ameaça vinda das estrelas — e das lendárias espadas caninas Zacian e Zamazenta. A Ilha da Armadura e a Coroa da Tundra guardam Kubfu, Calyrex e o poder do inverno.",
    signature: ["zacian", "zamazenta", "eternatus", "calyrex", "urshifu"],
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    inspiration: "Espanha e Portugal",
    summary:
      "Região aberta cortada pela Grande Cratera do Sul. Nas profundezas da Área Zero, o passado (Koraidon) e o futuro (Miraidon) colidem. Os Quatro Tesouros da Ruína pairam sobre suas terras como memória amaldiçoada.",
    signature: ["koraidon", "miraidon", "ogerpon", "terapagos", "chien-pao", "chi-yu"],
  },
];
