export interface Myth {
  id: string;
  title: string;
  region: string;
  summary: string;
  pokemons: string[];
  color?: string;
}

export const MYTHS: Myth[] = [
  // ==================== KANTO ====================
  {
    id: "abandoned-ship",
    title: "O barco fantasma de S.S. Anne",
    region: "Kanto",
    summary:
      "O S.S. Anne partiu de Vermilion Harbor e nunca chegou ao destino. Pescadores juram ver seu casco flutuando nas costas de Cinnabar em noites de neblina — com um Gastly no leme.",
    pokemons: ["gastly", "haunter"],
    color: "#735797",
  },
  {
    id: "pokemon-tower",
    title: "Pokémon Tower — o cemitério que canta",
    region: "Kanto (Lavender Town)",
    summary:
      "Alto templo de Lavender Town onde treinadores sepultam seus parceiros perdidos. Sem o Silph Scope, os visitantes só veem silhuetas gritando. Marowak protetor de sua cria é a assombração mais conhecida.",
    pokemons: ["cubone", "marowak", "gengar"],
    color: "#3a3a4a",
  },
  {
    id: "moon-stone-mt-moon",
    title: "As pedras da lua caídas em Mt. Moon",
    region: "Kanto",
    summary:
      "Diz a lenda que Clefairies dançam ao redor da Moon Stone gigante todas as noites de lua cheia. A pedra seria fragmento de um meteoro caído há eras — e Clefable seria descendente direto de uma raça alienígena.",
    pokemons: ["clefairy", "clefable"],
    color: "#d685ad",
  },

  // ==================== JOHTO ====================
  {
    id: "burned-tower",
    title: "Brass Tower — o incêndio dos três",
    region: "Johto (Ecruteak)",
    summary:
      "Séculos atrás, um raio destruiu a Brass Tower. Três pokémon anônimos que se refugiavam morreram no incêndio. Ho-Oh voou sobre as ruínas e os ressuscitou como Suicune, Raikou e Entei — cada um encarnando um elemento do fogo original.",
    pokemons: ["ho-oh", "suicune", "raikou", "entei"],
    color: "#c48d3a",
  },
  {
    id: "sprout-tower",
    title: "Sprout Tower — o pilar oscilante",
    region: "Johto (Violet)",
    summary:
      "A Sprout Tower foi esculpida em um único Bellsprout gigantesco que caiu ali há milênios. Seu pilar central ainda balança suavemente, como se o Bellsprout ainda estivesse vivo — dormindo há séculos.",
    pokemons: ["bellsprout", "bellossom"],
    color: "#7ac74c",
  },
  {
    id: "lake-of-rage",
    title: "O Gyarados vermelho do Lake of Rage",
    region: "Johto",
    summary:
      "A Team Rocket experimentou com evolução forçada em Magikarps do Lake of Rage. Um Gyarados nasceu vermelho de raiva pura. O primeiro Shiny documentado da história — símbolo do lago até hoje.",
    pokemons: ["magikarp", "gyarados"],
    color: "#a83a2c",
  },

  // ==================== HOENN ====================
  {
    id: "sky-pillar-rayquaza",
    title: "Sky Pillar — a torre até o céu",
    region: "Hoenn",
    summary:
      "Erguida por antigos hoennianos até tocar o céu. É onde Rayquaza dorme entre eras. Só se pode alcançar seu topo com bicicleta especial capaz de atravessar pisos que colapsam — teste de resolução.",
    pokemons: ["rayquaza"],
  },
  {
    id: "mirage-island",
    title: "Mirage Island — a ilha que só aparece por instantes",
    region: "Hoenn",
    summary:
      "Uma ilha selvagem no arquipélago sul só se materializa em certos dias, quando o ID de um Wynaut selvagem alinha com o do treinador. Só quem tem sorte astronômica caminha por suas selvas.",
    pokemons: ["wynaut", "wobbuffet"],
    color: "#f95587",
  },
  {
    id: "cave-of-origin",
    title: "Cave of Origin — o portal do início",
    region: "Hoenn (Sootopolis)",
    summary:
      "Dentro do vulcão de Sootopolis, esta caverna guarda a energia primordial de onde Groudon e Kyogre emergem quando despertos. Só os líderes do gym local — Wallace, Juan — conhecem a entrada.",
    pokemons: ["groudon", "kyogre"],
    color: "#6390f0",
  },

  // ==================== SINNOH ====================
  {
    id: "solaceon-ruins",
    title: "Solaceon Ruins — os Unown do subterrâneo",
    region: "Sinnoh",
    summary:
      "Rede de câmaras subterrâneas cheia de Unown formando frases em paredes. Só quem coleta os 26 pode abrir a câmara central, onde inscrições revelam que Unown escrevem o mundo à medida que se movem.",
    pokemons: ["unown"],
    color: "#3a6cb0",
  },
  {
    id: "snowpoint-temple",
    title: "Snowpoint Temple — o sepulcro de Regigigas",
    region: "Sinnoh",
    summary:
      "Templo congelado no norte de Sinnoh. Só se abre quando Regirock, Regice e Registeel estão no grupo do treinador. Regigigas, o pokémon-continente, dorme no altar inferior — só ele criou os três Regis originalmente.",
    pokemons: ["regigigas", "regirock", "regice", "registeel"],
    color: "#b7b7ce",
  },
  {
    id: "hall-of-origin",
    title: "Hall of Origin — o trono de Arceus",
    region: "Sinnoh (Mount Coronet apex)",
    summary:
      "Sala secreta no topo do Mount Coronet, acessível apenas com um Azure Flute — item lendário destruído após uso. Arceus repousa ali entre criações. Só treinadores dignos podem ecoar a flauta.",
    pokemons: ["arceus"],
    color: "#c48d3a",
  },

  // ==================== UNOVA ====================
  {
    id: "abundant-shrine",
    title: "Abundant Shrine — o santuário dos Kami",
    region: "Unova",
    summary:
      "Santuário no meio da floresta onde Tornadus, Thundurus e Landorus se manifestam em suas formas Therian. Landorus era o mais reverenciado — trazia colheitas boas. Tornadus e Thundurus só apareciam para punir aldeões desrespeitosos.",
    pokemons: ["tornadus", "thundurus", "landorus"],
    color: "#a98ff3",
  },
  {
    id: "relic-castle",
    title: "Relic Castle — as ruínas debaixo do deserto",
    region: "Unova",
    summary:
      "Cidadela pré-histórica soterrada por tempestades de areia. Suas câmaras profundas guardam fósseis de Volcarona — o único pokémon capaz de acender o sol quando o astro ameaçava se apagar sobre Unova.",
    pokemons: ["larvesta", "volcarona"],
    color: "#a6b91a",
  },
  {
    id: "dragonspiral-tower",
    title: "Dragonspiral Tower — o berço do Dragão",
    region: "Unova (Icirrus)",
    summary:
      "Torre mais antiga de Unova, onde o Dragão Original repousou depois de se dividir em Reshiram, Zekrom e Kyurem. Quem escala até o topo pode invocar aquele que corresponde à sua alma — verdade ou ideais.",
    pokemons: ["reshiram", "zekrom", "kyurem"],
    color: "#6f35fc",
  },

  // ==================== KALOS ====================
  {
    id: "terminus-cave",
    title: "Terminus Cave — o núcleo de Zygarde",
    region: "Kalos",
    summary:
      "Caverna profunda no leste de Kalos. É lá que Zygarde-50 dorme quando não há necessidade de intervir na ordem. Suas células-parciais (Zygarde-10) andam por Kalos monitorando o equilíbrio ecológico.",
    pokemons: ["zygarde"],
    color: "#7ac74c",
  },
  {
    id: "diamond-domain",
    title: "Diamond Domain — o palácio dos Carbink",
    region: "Kalos",
    summary:
      "Palácio subterrâneo escondido nos cristais das Reflection Cave. Diancie, a princesa, foi coroada por milhares de Carbink súditos. Só produz diamantes quando o palácio é ameaçado.",
    pokemons: ["diancie", "carbink"],
    color: "#d685ad",
  },

  // ==================== ALOLA ====================
  {
    id: "ruins-of-conflict",
    title: "As Ruínas dos Tapus",
    region: "Alola",
    summary:
      "Cada Tapu tem sua própria ruína — Conflict (Koko), Life (Lele), Abundance (Bulu), Hope (Fini). São altares construídos pelos primeiros humanos que chegaram em Alola por barco, agradecendo aos guardiões que os salvaram do naufrágio.",
    pokemons: ["tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini"],
    color: "#f7b32b",
  },
  {
    id: "altar-sunne-moone",
    title: "Altar do Sol / Altar da Lua",
    region: "Alola (Poni Canyon)",
    summary:
      "Dois altares gêmeos no interior de Poni. Cosmog cresce e evolui neles: em Sun, vira Solgaleo (Lion do Amanhecer); em Moon, vira Lunala (Batalhador da Meia-Noite). Necrozma se funde a um dos dois.",
    pokemons: ["cosmog", "solgaleo", "lunala", "necrozma"],
    color: "#f7d02c",
  },

  // ==================== GALAR ====================
  {
    id: "slumbering-weald",
    title: "Slumbering Weald — a floresta enevoada",
    region: "Galar",
    summary:
      "Floresta perpetuamente envolta em névoa espessa. É lá que os dois irmãos-heróis do Darkest Day encontraram Zacian e Zamazenta em suas formas anteriores. Só os corações puros podem atravessá-la sem se perder.",
    pokemons: ["zacian", "zamazenta"],
    color: "#3d5a80",
  },
  {
    id: "crown-tundra-freezington",
    title: "Freezington e o mito do Rei Corcel",
    region: "Galar (Crown Tundra)",
    summary:
      "Vilarejo isolado nas neves eternas. Guarda a memória de Calyrex, o Rei Corcel que governou séculos atrás. As crianças ainda deixam cenouras douradas no altar — o legado nunca esquecido apesar do rei banido do trono.",
    pokemons: ["calyrex", "glastrier", "spectrier"],
    color: "#96d9d6",
  },

  // ==================== PALDEA ====================
  {
    id: "area-zero-descent",
    title: "A descida à Área Zero",
    region: "Paldea",
    summary:
      "A Grande Cratera do Sul tem 4 postos de observação, cada um a uma profundidade diferente. No final está a Zero Lab, onde os professores Sada/Turo abriram o portal para o passado/futuro. Ninguém que desce sozinho volta como saiu.",
    pokemons: ["koraidon", "miraidon"],
    color: "#e63946",
  },
  {
    id: "kitakami-festival",
    title: "Kitakami — o Festival das Máscaras",
    region: "Paldea (Kitakami DLC)",
    summary:
      "Todo ano, o vilarejo de Mossui Town celebra a queda dos Loyal Three com o Festival of Masks. Só depois de investigar, o protagonista descobre que a narrativa está invertida: Ogerpon é a vítima; os Three foram os vilões esquecidos.",
    pokemons: ["ogerpon", "okidogi", "munkidori", "fezandipiti"],
    color: "#7ac74c",
  },
];
