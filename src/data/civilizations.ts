import type { WikiSourced } from "../lib/wiki";

export interface AncientSite extends WikiSourced {
  id: string;
  name: string;
  region: string;
  age: string;
  discovery: string;
  purpose: string;
  pokemons: string[];
  color?: string;
}

export const CIVILIZATIONS: AncientSite[] = [
  {
    id: "ruins-of-alph",
    wiki: "Ruins of Alph",
    name: "Ruínas de Alph",
    region: "Johto",
    age: "Mais de 1500 anos",
    discovery: "Descobertas por arqueólogos de Violet City no início do século.",
    purpose:
      "Câmaras subterrâneas cobertas por 26 hieróglifos idênticos ao alfabeto Unown moderno. Ninguém sabe se os Unown ensinaram o alfabeto aos humanos ou vice-versa. Escavações revelaram salas com quebra-cabeças (Kabuto, Aerodactyl, Ho-Oh, Omanyte) que precisam ser resolvidos para revelar câmaras adicionais.",
    pokemons: ["unown"],
    color: "#3a6cb0",
  },
  {
    id: "sinjoh-ruins",
    wiki: "Sinjoh Ruins",
    name: "Ruínas de Sinjoh",
    region: "Fronteira Johto/Sinnoh",
    age: "Idade indeterminada (pré-humana)",
    discovery:
      "Encontradas por caçadores de neve no vale entre Kanto e Sinnoh. Só se torna visível quando Arceus é trazido até lá.",
    purpose:
      "Câmara ritual onde a criação do mundo pode ser reencenada. Trazer Arceus + um item específico gera um Ovo contendo Dialga, Palkia ou Giratina em sua forma Origin. Único ponto conhecido onde a criação é reproduzível.",
    pokemons: ["arceus", "dialga", "palkia", "giratina"],
    color: "#c48d3a",
  },
  {
    id: "sealed-chamber",
    wiki: "Sealed Chamber",
    name: "Sealed Chamber",
    region: "Hoenn (Route 134)",
    age: "3000 anos ou mais",
    discovery:
      "Descoberta subaquática ao sul de Pacifidlog Town, entre correntes marítimas violentas.",
    purpose:
      "Câmara em Braille com instruções para liberar Regirock, Regice e Registeel de suas prisões espalhadas por Hoenn. O ritual exige um Wailord e um Relicanth nas extremidades opostas da party — pokémon do maior tamanho e do mais antigo.",
    pokemons: ["wailord", "relicanth", "regirock", "regice", "registeel"],
    color: "#b7b7ce",
  },
  {
    id: "snowpoint-temple",
    wiki: "Snowpoint Temple",
    name: "Templo de Snowpoint",
    region: "Sinnoh (extremo norte)",
    age: "Milênios (data desconhecida)",
    discovery:
      "Sempre esteve à vista sobre um penhasco gelado. Nunca havia sido aberto por não haver método conhecido.",
    purpose:
      "Sepulcro de Regigigas — o pokémon-continente que puxou as placas tectônicas com cordas e criou os três Regis. Só se abre quando o treinador leva Regirock, Regice e Registeel em sua party.",
    pokemons: ["regigigas", "regirock", "regice", "registeel"],
    color: "#96d9d6",
  },
  {
    id: "sky-pillar",
    wiki: "Sky Pillar",
    name: "Sky Pillar",
    region: "Hoenn (Route 131)",
    age: "Antiguidade profunda",
    discovery: "Torre isolada em uma ilha desabitada — visível de longe.",
    purpose:
      "Torre construída por antigos hoennianos para tocar o céu e invocar Rayquaza quando Groudon e Kyogre entrassem em conflito. Seus pisos superiores desmoronam sob peso — só uma Mach Bike consegue atravessar.",
    pokemons: ["rayquaza"],
    color: "#3a3a4a",
  },
  {
    id: "hall-of-origin",
    wiki: "Hall of Origin",
    name: "Hall of Origin",
    region: "Sinnoh (Mount Coronet apex)",
    age: "Anterior à própria criação",
    discovery: "Só existe quando Arceus permite ser visto.",
    purpose:
      "Trono de Arceus. Fica acima do topo do Mount Coronet, acessível apenas via Azure Flute — item destruído após um uso. É o único local onde Arceus pode ser encontrado por humanos, e mesmo assim raramente.",
    pokemons: ["arceus"],
    color: "#ffcb05",
  },
  {
    id: "relic-castle",
    wiki: "Relic Castle",
    name: "Relic Castle",
    region: "Unova (Desert Resort)",
    age: "Mais de 2500 anos",
    discovery: "Soterrado por tempestades de areia; escavações contínuas o revelam.",
    purpose:
      "Cidadela pré-histórica cujas câmaras profundas guardam fósseis de Volcarona — o pokémon-sol que acendeu a esfera solar quando ela ameaçou apagar-se. Considerado sagrado pelos primeiros unovanos.",
    pokemons: ["larvesta", "volcarona"],
    color: "#a6b91a",
  },
  {
    id: "abyssal-ruins",
    wiki: "Abyssal Ruins",
    name: "Ruínas Abissais",
    region: "Unova (Undella Bay)",
    age: "Idade desconhecida",
    discovery: "Só revelada quando o mar da baía recua em determinadas correntes.",
    purpose:
      "Complexo submarino com inscrições em Braille indicando localizações de tesouros lendários. Alguns creem que foi um posto avançado da civilização de Sinjoh; outros, um culto ao mar. Placas de plates de Arceus foram encontradas nas ruínas.",
    pokemons: ["arceus"],
    color: "#6390f0",
  },
  {
    id: "az-ruins",
    wiki: "Ultimate weapon",
    name: "Ruínas de AZ",
    region: "Kalos (Geosenge Town)",
    age: "Exatamente 3000 anos",
    discovery: "Sempre visíveis; datadas por carbono.",
    purpose:
      "Restos da Máquina Definitiva construída pelo rei AZ, alimentada por Xerneas. Sob a cidade de Geosenge, câmara subterrânea onde a Máquina foi lacrada. A Team Flare a reativou brevemente antes de ser destruída.",
    pokemons: ["xerneas", "yveltal"],
    color: "#7ac74c",
  },
  {
    id: "poni-altars",
    wiki: "Altar of the Sunne",
    name: "Altares de Poni",
    region: "Alola (Ilha de Poni)",
    age: "Anteriores à colonização humana de Alola",
    discovery: "Sempre estiveram à vista; guardados pelos Tapus.",
    purpose:
      "Dois altares gêmeos onde Cosmog evolui: em Sun, Altar do Sol libera Solgaleo; em Moon, Altar da Lua libera Lunala. Necrozma se funde a um dos dois quando faminta por luz. É onde os Ultra Wormholes se abriram durante a crise.",
    pokemons: ["cosmog", "solgaleo", "lunala", "necrozma"],
    color: "#f7d02c",
  },
  {
    id: "turffield-runes",
    wiki: "Turffield",
    name: "Turffield Runes",
    region: "Galar (Turffield)",
    age: "3000 anos",
    discovery: "Grande figura desenhada na encosta da colina, visível apenas de cima.",
    purpose:
      "Petróglifo gigante retratando os dois heróis do Darkest Day com Zacian e Zamazenta enfrentando um dragão colossal (Eternatus). Só foi decifrado por Sonia — a versão oficial da lenda de Galar estava errada por séculos.",
    pokemons: ["zacian", "zamazenta", "eternatus"],
    color: "#3d5a80",
  },
  {
    id: "area-zero",
    wiki: "Zero Lab",
    name: "Área Zero — Zero Lab",
    region: "Paldea (Grande Cratera do Sul)",
    age: "Cratera formada há eras; laboratório construído há décadas",
    discovery: "A cratera sempre existiu; o laboratório é ruína recente.",
    purpose:
      "Fundo da cratera onde Sada/Turo abriram fenda espaço-temporal. Levou à chegada dos Paradox Pokémon vindos do passado ou futuro. Terapagos foi encontrado ali, junto à Zero Lab abandonada.",
    pokemons: ["koraidon", "miraidon", "terapagos"],
    color: "#e63946",
  },
];
