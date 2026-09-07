export interface GymLeader {
  name: string;
  type: string;
  city?: string;
}

export interface Region {
  id: string;
  name: string;
  generation: number;
  inspiration: string;
  summary: string;
  signature: string[];
  cities?: string[];
  professor?: string;
  champion?: string;
  eliteFour?: string[];
  gymLeaders?: GymLeader[];
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
    cities: ["Pallet Town", "Viridian City", "Pewter City", "Cerulean City", "Vermilion City", "Celadon City", "Fuchsia City", "Saffron City", "Cinnabar Island"],
    professor: "Samuel Oak",
    champion: "Blue Oak (após Red desaparecer)",
    eliteFour: ["Lorelei (Ice)", "Bruno (Fighting)", "Agatha (Ghost)", "Lance (Dragon)"],
    gymLeaders: [
      { name: "Brock", type: "rock", city: "Pewter" },
      { name: "Misty", type: "water", city: "Cerulean" },
      { name: "Lt. Surge", type: "electric", city: "Vermilion" },
      { name: "Erika", type: "grass", city: "Celadon" },
      { name: "Koga", type: "poison", city: "Fuchsia" },
      { name: "Sabrina", type: "psychic", city: "Saffron" },
      { name: "Blaine", type: "fire", city: "Cinnabar" },
      { name: "Giovanni", type: "ground", city: "Viridian" },
    ],
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    inspiration: "Regiões de Kansai e Tōkai, Japão",
    summary:
      "Terra de tradições e torres milenares. Ho-Oh e Lugia governam os céus; os Cães Lendários vagam por suas rotas. Ecruteak, Violet City e o Bell Tower guardam a história ancestral do mundo pokémon.",
    signature: ["ho-oh", "lugia", "suicune", "raikou", "entei", "celebi"],
    cities: ["New Bark Town", "Cherrygrove", "Violet City", "Azalea Town", "Goldenrod City", "Ecruteak City", "Olivine City", "Mahogany Town", "Blackthorn City"],
    professor: "Elm",
    champion: "Lance (também parte da Elite Four de Kanto)",
    eliteFour: ["Will (Psychic)", "Koga (Poison)", "Bruno (Fighting)", "Karen (Dark)"],
    gymLeaders: [
      { name: "Falkner", type: "flying", city: "Violet" },
      { name: "Bugsy", type: "bug", city: "Azalea" },
      { name: "Whitney", type: "normal", city: "Goldenrod" },
      { name: "Morty", type: "ghost", city: "Ecruteak" },
      { name: "Chuck", type: "fighting", city: "Cianwood" },
      { name: "Jasmine", type: "steel", city: "Olivine" },
      { name: "Pryce", type: "ice", city: "Mahogany" },
      { name: "Clair", type: "dragon", city: "Blackthorn" },
    ],
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    inspiration: "Kyūshū, Japão",
    summary:
      "Ilha vulcânica com metade terra e metade mar. Cenário da batalha entre Groudon e Kyogre, com Rayquaza como mediador. Os três Regis dormem em câmaras seladas espalhadas pelo continente.",
    signature: ["groudon", "kyogre", "rayquaza", "latios", "latias", "deoxys"],
    cities: ["Littleroot Town", "Petalburg City", "Rustboro City", "Slateport City", "Mauville City", "Lavaridge Town", "Fortree City", "Lilycove City", "Mossdeep City", "Sootopolis City", "Ever Grande City"],
    professor: "Birch",
    champion: "Steven Stone / Wallace (rotação)",
    eliteFour: ["Sidney (Dark)", "Phoebe (Ghost)", "Glacia (Ice)", "Drake (Dragon)"],
    gymLeaders: [
      { name: "Roxanne", type: "rock", city: "Rustboro" },
      { name: "Brawly", type: "fighting", city: "Dewford" },
      { name: "Wattson", type: "electric", city: "Mauville" },
      { name: "Flannery", type: "fire", city: "Lavaridge" },
      { name: "Norman", type: "normal", city: "Petalburg" },
      { name: "Winona", type: "flying", city: "Fortree" },
      { name: "Tate & Liza", type: "psychic", city: "Mossdeep" },
      { name: "Wallace / Juan", type: "water", city: "Sootopolis" },
    ],
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    inspiration: "Hokkaidō, Japão",
    summary:
      "A região da criação. O Mount Coronet ergue-se no centro, onde Dialga e Palkia foram invocados pela primeira vez. Os três lagos abrigam Uxie, Mesprit e Azelf. Arceus adormece em Hall of Origin.",
    signature: ["dialga", "palkia", "giratina", "arceus", "uxie", "mesprit", "azelf"],
    cities: ["Twinleaf Town", "Sandgem Town", "Jubilife City", "Oreburgh City", "Floaroma Town", "Eterna City", "Hearthome City", "Solaceon Town", "Veilstone City", "Pastoria City", "Canalave City", "Snowpoint City", "Sunyshore City"],
    professor: "Rowan",
    champion: "Cynthia",
    eliteFour: ["Aaron (Bug)", "Bertha (Ground)", "Flint (Fire)", "Lucian (Psychic)"],
    gymLeaders: [
      { name: "Roark", type: "rock", city: "Oreburgh" },
      { name: "Gardenia", type: "grass", city: "Eterna" },
      { name: "Maylene", type: "fighting", city: "Veilstone" },
      { name: "Crasher Wake", type: "water", city: "Pastoria" },
      { name: "Fantina", type: "ghost", city: "Hearthome" },
      { name: "Byron", type: "steel", city: "Canalave" },
      { name: "Candice", type: "ice", city: "Snowpoint" },
      { name: "Volkner", type: "electric", city: "Sunyshore" },
    ],
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    inspiration: "Nova York, EUA",
    summary:
      "A primeira região baseada em uma metrópole ocidental. Casa dos Dragões da Verdade e do Ideal — Reshiram e Zekrom — e das lendárias Espadas da Justiça: Cobalion, Terrakion, Virizion e Keldeo.",
    signature: ["reshiram", "zekrom", "kyurem", "cobalion", "terrakion", "virizion", "keldeo"],
    cities: ["Nuvema Town", "Accumula Town", "Striaton City", "Nacrene City", "Castelia City", "Nimbasa City", "Driftveil City", "Mistralton City", "Icirrus City", "Opelucid City"],
    professor: "Juniper",
    champion: "Alder → Iris (BW2)",
    eliteFour: ["Shauntal (Ghost)", "Grimsley (Dark)", "Caitlin (Psychic)", "Marshal (Fighting)"],
    gymLeaders: [
      { name: "Chili/Cress/Cilan", type: "fire/water/grass", city: "Striaton" },
      { name: "Lenora", type: "normal", city: "Nacrene" },
      { name: "Burgh", type: "bug", city: "Castelia" },
      { name: "Elesa", type: "electric", city: "Nimbasa" },
      { name: "Clay", type: "ground", city: "Driftveil" },
      { name: "Skyla", type: "flying", city: "Mistralton" },
      { name: "Brycen", type: "ice", city: "Icirrus" },
      { name: "Drayden / Iris", type: "dragon", city: "Opelucid" },
    ],
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    inspiration: "França",
    summary:
      "Berço da beleza e da vida eterna. Xerneas e Yveltal encarnam o ciclo da existência, enquanto Zygarde vigia o equilíbrio da ordem. Cenário da história trágica do rei AZ e sua Máquina Definitiva.",
    signature: ["xerneas", "yveltal", "zygarde", "diancie", "hoopa", "volcanion"],
    cities: ["Vaniville Town", "Aquacorde Town", "Santalune City", "Lumiose City", "Camphrier Town", "Cyllage City", "Ambrette Town", "Geosenge Town", "Shalour City", "Coumarine City", "Laverre City", "Dendemille Town", "Anistar City", "Couriway Town", "Snowbelle City"],
    professor: "Sycamore",
    champion: "Diantha",
    eliteFour: ["Malva (Fire)", "Siebold (Water)", "Wikstrom (Steel)", "Drasna (Dragon)"],
    gymLeaders: [
      { name: "Viola", type: "bug", city: "Santalune" },
      { name: "Grant", type: "rock", city: "Cyllage" },
      { name: "Korrina", type: "fighting", city: "Shalour" },
      { name: "Ramos", type: "grass", city: "Coumarine" },
      { name: "Clemont", type: "electric", city: "Lumiose" },
      { name: "Valerie", type: "fairy", city: "Laverre" },
      { name: "Olympia", type: "psychic", city: "Anistar" },
      { name: "Wulfric", type: "ice", city: "Snowbelle" },
    ],
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    inspiration: "Havaí, EUA",
    summary:
      "Arquipélago tropical dividido em quatro ilhas, cada uma protegida por um Tapu. Aqui abre-se o portal para o Ultra Espaço — de onde vieram Necrozma, os Ultra Beasts e a família celestial de Cosmog.",
    signature: ["tapu-koko", "solgaleo", "lunala", "necrozma", "marshadow", "zeraora"],
    cities: ["Iki Town", "Hau'oli City", "Heahea City", "Konikoni City", "Malie City", "Tapu Village", "Seafolk Village"],
    professor: "Kukui",
    champion: "Hau (nova Liga após protagonista)",
    eliteFour: ["Hala (Fighting)", "Olivia (Rock)", "Acerola (Ghost)", "Kahili (Flying)"],
    gymLeaders: [
      { name: "Ilima (Normal)", type: "normal" },
      { name: "Lana (Water)", type: "water" },
      { name: "Kiawe (Fire)", type: "fire" },
      { name: "Mallow (Grass)", type: "grass" },
      { name: "Sophocles (Electric)", type: "electric" },
      { name: "Acerola (Ghost)", type: "ghost" },
      { name: "Mina (Fairy)", type: "fairy" },
    ],
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    inspiration: "Reino Unido",
    summary:
      "Terra da Dynamax e do Gigantamax. Casa de Eternatus — a ameaça vinda das estrelas — e das lendárias espadas caninas Zacian e Zamazenta. A Ilha da Armadura e a Coroa da Tundra guardam Kubfu, Calyrex e o poder do inverno.",
    signature: ["zacian", "zamazenta", "eternatus", "calyrex", "urshifu"],
    cities: ["Postwick", "Wedgehurst", "Motostoke", "Turffield", "Hulbury", "Hammerlocke", "Stow-on-Side", "Ballonlea", "Circhester", "Spikemuth", "Wyndon"],
    professor: "Magnolia (e Sonia)",
    champion: "Leon (invicto até o protagonista)",
    eliteFour: ["Sem Elite Four tradicional — Champion Cup como torneio final"],
    gymLeaders: [
      { name: "Milo", type: "grass", city: "Turffield" },
      { name: "Nessa", type: "water", city: "Hulbury" },
      { name: "Kabu", type: "fire", city: "Motostoke" },
      { name: "Bea / Allister", type: "fighting/ghost", city: "Stow-on-Side" },
      { name: "Opal", type: "fairy", city: "Ballonlea" },
      { name: "Gordie / Melony", type: "rock/ice", city: "Circhester" },
      { name: "Piers", type: "dark", city: "Spikemuth" },
      { name: "Raihan", type: "dragon", city: "Hammerlocke" },
    ],
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    inspiration: "Espanha e Portugal",
    summary:
      "Região aberta cortada pela Grande Cratera do Sul. Nas profundezas da Área Zero, o passado (Koraidon) e o futuro (Miraidon) colidem. Os Quatro Tesouros da Ruína pairam sobre suas terras como memória amaldiçoada.",
    signature: ["koraidon", "miraidon", "ogerpon", "terapagos", "chien-pao", "chi-yu"],
    cities: ["Cabo Poco", "Los Platos", "Mesagoza", "Cortondo", "Alfornada", "Cascarrafa", "Levincia", "Zapapico", "Medali", "Montenevera", "Porto Marinada", "Área Zero"],
    professor: "Sada (Scarlet) / Turo (Violet)",
    champion: "Geeta (Top Champion) / Nemona (candidata)",
    eliteFour: ["Rika (Ground)", "Poppy (Steel)", "Larry (Flying)", "Hassel (Dragon)"],
    gymLeaders: [
      { name: "Katy", type: "bug", city: "Cortondo" },
      { name: "Brassius", type: "grass", city: "Artazon" },
      { name: "Iono", type: "electric", city: "Levincia" },
      { name: "Kofu", type: "water", city: "Cascarrafa" },
      { name: "Larry", type: "normal", city: "Medali" },
      { name: "Ryme", type: "ghost", city: "Montenevera" },
      { name: "Tulip", type: "psychic", city: "Alfornada" },
      { name: "Grusha", type: "ice", city: "Glaseado" },
    ],
  },
];
