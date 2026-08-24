// Cronologia da mitologia Pokémon — compilada a partir de folclore in-game
// (Sinnoh Myths, Alolan Myths, Diaries de vilas, Kalos legends, etc.).

export interface LoreEvent {
  era: string;
  title: string;
  body: string;
  pokemons: string[];
}

export const LORE_EVENTS: LoreEvent[] = [
  // ================= ANTES DO TEMPO =================
  {
    era: "Antes do tempo",
    title: "O Ovo Original e o vazio",
    body:
      "Do vórtice do caos surge Arceus, o pokémon original, dentro de um Ovo cósmico. Ao emergir, dá origem a si mesmo e à noção de existência. Suas 1000 mãos são a origem de todas as leis do universo.",
    pokemons: ["arceus"],
  },
  {
    era: "Antes do tempo",
    title: "As Placas da criação",
    body:
      "Arceus deixa espalhadas pelo mundo dezessete Placas — uma para cada elemento — capazes de transformá-lo em qualquer tipo. Quem reunir todas pode invocar sua presença no topo do Monte Coronet.",
    pokemons: ["arceus"],
  },

  // ================= CRIAÇÃO DO UNIVERSO =================
  {
    era: "Criação do universo",
    title: "Nascem tempo, espaço e antimatéria",
    body:
      "Arceus cria a trindade da criação: Dialga passa a controlar o tempo, Palkia o espaço e Giratina — pela sua violência — é banido ao Mundo Distorcido, existindo em um plano paralelo espelhado.",
    pokemons: ["dialga", "palkia", "giratina"],
  },
  {
    era: "Criação do universo",
    title: "Os guardiões do coração humano",
    body:
      "Arceus cria três seres para dar vida ao Ser Humano: Uxie concede o conhecimento, Mesprit as emoções e Azelf a força de vontade. Cada um repousa no fundo de um dos lagos de Sinnoh.",
    pokemons: ["uxie", "mesprit", "azelf"],
  },
  {
    era: "Criação do universo",
    title: "A criação do Ultra Espaço",
    body:
      "Um rasgo entre os mundos: os Ultra Buracos ligam o universo conhecido ao Ultra Espaço. Necrozma habitava lá antes, alimentando-se de luz. Cosmog vem desse vazio, semente de Solgaleo e Lunala.",
    pokemons: ["necrozma", "cosmog", "solgaleo", "lunala"],
  },

  // ================= FORMAÇÃO DO MUNDO =================
  {
    era: "Formação do mundo",
    title: "Regigigas e os continentes",
    body:
      "Regigigas, o pokémon colossal, ergueu os continentes puxando placas tectônicas com cordas. Ao terminar, moldou seus três servos — Regirock, Regice e Registeel — a partir dos elementos primordiais.",
    pokemons: ["regigigas", "regirock", "regice", "registeel"],
  },
  {
    era: "Formação do mundo",
    title: "O confronto pela terra e pelo mar",
    body:
      "Groudon emerge do magma expandindo os continentes; Kyogre surge das profundezas para preencher os oceanos. A guerra entre os dois moldou o clima e devastou paisagens até que Rayquaza desceu dos céus para acalmá-los, restaurando o equilíbrio.",
    pokemons: ["groudon", "kyogre", "rayquaza"],
  },
  {
    era: "Formação do mundo",
    title: "Meloetta e a canção do mundo",
    body:
      "Diz-se que Meloetta cantava para a natureza recém-formada, e as espécies aprenderam suas próprias vozes ouvindo-a. Sua canção esquecida ainda ecoa em ruínas antigas de Unova.",
    pokemons: ["meloetta"],
  },

  // ================= ERA ANTIGA =================
  {
    era: "Era antiga",
    title: "Mew, o ancestral de todos os pokémon",
    body:
      "Diz a lenda que todos os pokémon descendem de Mew, encontrado nas profundezas das selvas de Guyana. Seus genes contêm o material genético de todas as espécies conhecidas — e um dia, cientistas usariam essa amostra para criar Mewtwo.",
    pokemons: ["mew", "mewtwo"],
  },
  {
    era: "Era antiga",
    title: "Manaphy e o berço do mar",
    body:
      "Nas profundezas do Templo do Mar, um Ovo lendário se preserva há milênios. Dele nasce Manaphy, cuja habilidade Heart Swap conecta os corações de todas as criaturas marinhas. Phione é o descendente natural de Manaphy.",
    pokemons: ["manaphy", "phione"],
  },
  {
    era: "Era antiga",
    title: "A Torre dos Sinos e o incêndio",
    body:
      "Séculos atrás, três pokémon anônimos morreram em um incêndio na Brass Tower, em Ecruteak City. Ho-Oh, ao voar sobre as ruínas, os ressuscitou como Suicune (a chuva purificadora), Raikou (o relâmpago) e Entei (o vulcão).",
    pokemons: ["ho-oh", "suicune", "raikou", "entei"],
  },
  {
    era: "Era antiga",
    title: "Lugia, guardião dos mares",
    body:
      "Lugia habita as profundezas mais escuras do oceano, evitando os humanos. Comanda os três pássaros lendários de Kanto — Articuno, Zapdos e Moltres — quando sua rivalidade ameaça o equilíbrio climático mundial.",
    pokemons: ["lugia", "articuno", "zapdos", "moltres"],
  },
  {
    era: "Era antiga",
    title: "Fósseis do mar pré-histórico",
    body:
      "Antes das eras humanas, os oceanos eram dominados por criaturas hoje conhecidas apenas por seus fósseis: Omanyte, Kabuto, Aerodactyl. Cientistas os ressuscitam a partir de âmbar e concha antiga.",
    pokemons: ["omanyte", "kabuto", "aerodactyl"],
  },
  {
    era: "Era antiga",
    title: "Absol, o arauto dos desastres",
    body:
      "Absol vive isolado nas montanhas, mas quando desce até as vilas humanas, é presságio de calamidade. Injustamente temido: ele não causa, ele avisa.",
    pokemons: ["absol"],
  },

  // ================= REINOS HUMANOS =================
  {
    era: "Reinos humanos",
    title: "AZ e a Guerra de Kalos",
    body:
      "Há três mil anos, o rei AZ perdeu seu Floette na guerra e, em luto, construiu a Máquina Definitiva — que devastou Kalos. Xerneas concede vida eterna; Yveltal a rouba. Zygarde vigia o equilíbrio entre ambos. AZ vagou pelos séculos até reencontrar seu Floette.",
    pokemons: ["xerneas", "yveltal", "zygarde", "floette"],
  },
  {
    era: "Reinos humanos",
    title: "Diancie, a princesa de diamante",
    body:
      "Nas cavernas de Kalos, um Carbink raro sofre uma mutação e transforma-se em Diancie, capaz de criar diamantes com as mãos. É reverenciada como princesa pelos Carbink que a rodeiam.",
    pokemons: ["diancie", "carbink"],
  },
  {
    era: "Reinos humanos",
    title: "Reshiram e Zekrom — a verdade e o ideal",
    body:
      "Dois irmãos de Unova fundaram um reino unido, mas se dividiram sobre verdade e ideais. O Dragão Original se dividiu em Reshiram (verdade) e Zekrom (ideais), deixando Kyurem como a carcaça vazia — o dragão do vazio.",
    pokemons: ["reshiram", "zekrom", "kyurem"],
  },
  {
    era: "Reinos humanos",
    title: "Latios e Latias em Alto Mare",
    body:
      "Na cidade insular de Alto Mare, uma dupla de irmãos Latios e Latias protege os canais com a Alma Devocional — uma pedra sagrada que apenas eles podem despertar.",
    pokemons: ["latios", "latias"],
  },
  {
    era: "Reinos humanos",
    title: "As Ruínas de Sinjoh e o ritual do Ovo",
    body:
      "Nas fronteiras entre Sinnoh e Johto, cientistas descobrem que ao trazer Arceus às Ruínas de Sinjoh, um novo Ovo é gerado — contendo Dialga, Palkia ou Giratina, dependendo do momento e do lugar do ritual.",
    pokemons: ["arceus", "dialga", "palkia", "giratina"],
  },
  {
    era: "Reinos humanos",
    title: "A Espada de Rota e o povo de Aaron",
    body:
      "Séculos atrás, o herói Sir Aaron salvou o reino de Rota sacrificando-se junto com Lucario, sua sombra e conselheiro. Sua consciência permaneceu selada no bastão real por gerações.",
    pokemons: ["lucario"],
  },
  {
    era: "Reinos humanos",
    title: "Cyrus e a rasgadura do céu",
    body:
      "Cyrus, líder do Team Galactic, buscou capturar Dialga e Palkia para destruir o universo e reconstruí-lo sem emoções. Ao invocar a Chain Rouge no Mount Coronet, quase rasgou a realidade — mas Giratina o arrastou ao Mundo Distorcido.",
    pokemons: ["dialga", "palkia", "giratina"],
  },
  {
    era: "Reinos humanos",
    title: "N e o Dragão Original",
    body:
      "Criado pela Team Plasma para libertar todos os pokémon, o rapaz N despertou o dragão adormecido — Zekrom (Black) ou Reshiram (White) — para desafiar o Champion. Sua ideologia dividiu Unova.",
    pokemons: ["zekrom", "reshiram"],
  },
  {
    era: "Reinos humanos",
    title: "Os Tapus, guardiões de Alola",
    body:
      "Cada uma das quatro ilhas de Alola tem seu guardião: Tapu Koko (Melemele), Tapu Lele (Akala), Tapu Bulu (Ula'ula) e Tapu Fini (Poni). Servem à família real de Cosmog, criada nas fendas do Ultra Espaço.",
    pokemons: ["tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini"],
  },
  {
    era: "Reinos humanos",
    title: "Necrozma e o roubo da luz",
    body:
      "Necrozma, faminto por luz depois de banido de seu mundo original, se funde a Solgaleo ou Lunala para roubar a luz de Alola. Só a Z-Move de Zeraora restaura o equilíbrio quando o Sol se apaga.",
    pokemons: ["necrozma", "solgaleo", "lunala"],
  },
  {
    era: "Reinos humanos",
    title: "Ultra Beasts vazam do Ultra Espaço",
    body:
      "A pesquisa da Aether Foundation abre buracos entre dimensões. Criaturas de outros mundos — Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord — invadem Alola. Guzma e Lusamine ficam obcecados por elas.",
    pokemons: ["nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord"],
  },
  {
    era: "Reinos humanos",
    title: "Os heróis de Galar e o Darkest Day",
    body:
      "Há três mil anos, o Darkest Day ameaçou Galar quando Eternatus surgiu do espaço. Dois irmãos — hoje conhecidos apenas como os heróis — o selaram com as espadas e escudos de Zacian e Zamazenta.",
    pokemons: ["eternatus", "zacian", "zamazenta"],
  },
  {
    era: "Reinos humanos",
    title: "Kubfu e as torres gêmeas",
    body:
      "Kubfu, quando treinado nas Torres do Punho da Água ou do Punho Sombrio da Ilha da Armadura, evolui para Urshifu — um estilo de luta rápido (Single-Strike) ou fluido (Rapid-Strike), conforme a torre.",
    pokemons: ["kubfu", "urshifu"],
  },
  {
    era: "Reinos humanos",
    title: "Calyrex, o rei-corcel esquecido",
    body:
      "Séculos atrás, Calyrex governou a Coroa da Tundra com seus dois corcéis — Glastrier no inverno e Spectrier no crepúsculo. Esquecido pelos humanos, retorna para reclamar seu trono.",
    pokemons: ["calyrex", "glastrier", "spectrier"],
  },

  // ================= PASSADO E FUTURO =================
  {
    era: "Passado e futuro",
    title: "Koraidon e Miraidon — vindos de outra era",
    body:
      "As expedições ao Área Zero de Paldea revelaram criaturas que atravessaram o tempo: Koraidon vem de uma era pré-histórica, Miraidon do futuro distante. Ambos servem como montaria dos exploradores modernos.",
    pokemons: ["koraidon", "miraidon"],
  },
  {
    era: "Passado e futuro",
    title: "Os Quatro Tesouros da Ruína",
    body:
      "Há muito tempo, no continente que hoje é Paldea, quatro objetos amaldiçoados foram selados por seus crimes — a espada Chien-Pao, o jade Ting-Lu, a vela Chi-Yu e as fitas Wo-Chien. Cada um encarna a ruína de um antigo reino.",
    pokemons: ["chien-pao", "ting-lu", "chi-yu", "wo-chien"],
  },
  {
    era: "Passado e futuro",
    title: "Ogerpon e a máscara emprestada",
    body:
      "Em Kitakami, Ogerpon foi injustamente acusada e teve sua máscara roubada. Suas quatro máscaras (Teal, Wellspring, Hearthflame, Cornerstone) alteram seu tipo. Terapagos, escondido nas profundezas, guarda o poder Terastal.",
    pokemons: ["ogerpon", "terapagos"],
  },
];

export const ERAS = Array.from(new Set(LORE_EVENTS.map((e) => e.era)));
