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

  // ==== EXPANSÃO: sagas modernas e eventos anexos ====

  {
    era: "Era antiga",
    title: "As Penas Arco-íris de Ho-Oh",
    body:
      "Diz a lenda que Ho-Oh deixa cair sete penas de cores diferentes ao voar. Quem encontrar as sete e as levar até a Tin Tower pode invocar o pokémon lendário. Ash Ketchum viu Ho-Oh em seu primeiríssimo dia de treinador.",
    pokemons: ["ho-oh"],
  },
  {
    era: "Era antiga",
    title: "A ilusão do castelo de Zoroark",
    body:
      "Zoroark tem o poder de projetar ilusões elaboradas. Séculos atrás, um Zoroark protegeu sua cria construindo com sua mente um castelo inteiro invisível — a Crown City original, hoje conhecida apenas em relatos.",
    pokemons: ["zorua", "zoroark"],
  },
  {
    era: "Reinos humanos",
    title: "Prof. Oak e o nascimento da Pokédex",
    body:
      "Séculos após a domesticação dos pokémon, o Prof. Samuel Oak de Pallet Town cria o primeiro dispositivo capaz de escanear e catalogar espécies automaticamente — a Pokédex. Distribui três protótipos a jovens treinadores: Red, Blue e Green.",
    pokemons: ["mew", "bulbasaur", "charmander", "squirtle"],
  },
  {
    era: "Reinos humanos",
    title: "Red desaparece no Mount Silver",
    body:
      "Após tornar-se o Champion mais jovem da história aos 11 anos, Red simplesmente sumiu. Foi encontrado três anos depois no topo do Mount Silver, em silêncio absoluto, treinando com seu Pikachu e outros parceiros contra pokémon selvagens de nível brutal.",
    pokemons: ["pikachu", "charizard", "venusaur", "blastoise", "snorlax"],
  },
  {
    era: "Reinos humanos",
    title: "A queda da Team Rocket original",
    body:
      "Giovanni, líder da Team Rocket, foi derrotado em seu Ginásio de Viridian por Red. Envergonhado, se refugiou no exílio, deixando o próprio filho Silver para trás. A organização se dissolveu — só ressurge três anos depois em Johto, sem seu líder.",
    pokemons: ["mewtwo", "persian"],
  },
  {
    era: "Reinos humanos",
    title: "Delta Episode — o meteoro sobre Hoenn",
    body:
      "Após os eventos de Kyogre e Groudon, cientistas de Hoenn descobrem que um meteoro colossal está em rota de colisão com o planeta. Deoxys aparece do espaço. Rayquaza absorve a Mega Pedra para atingir sua forma Mega e destruir o meteoro em pleno voo.",
    pokemons: ["rayquaza", "deoxys"],
  },
  {
    era: "Reinos humanos",
    title: "Cyrus vaga eternamente no Mundo Distorcido",
    body:
      "Após ser derrotado no Spear Pillar, Cyrus é arrastado por Giratina ao Mundo Distorcido. Décadas se passam para nós; ele ainda anda por lá, sozinho, procurando alguma forma de escapar. Alguns testemunhos dizem tê-lo visto refletido em espelhos.",
    pokemons: ["giratina"],
  },
  {
    era: "Reinos humanos",
    title: "N e o Castelo de Vidro",
    body:
      "A Team Plasma ergueu um castelo colossal ao redor da Pokémon League de Unova durante os eventos de Black/White. N esperava seu Champion no topo — se ele vencesse, todos os pokémon seriam libertados; se perdesse, sua filosofia estava errada. A batalha final decidiu a era.",
    pokemons: ["reshiram", "zekrom"],
  },
  {
    era: "Reinos humanos",
    title: "Rainbow Rocket — os vilões de todas as regiões",
    body:
      "Em Alola, Giovanni reuniu líderes derrotados de todas as regiões (Maxie, Archie, Cyrus, Ghetsis, Lysandre) em uma dimensão paralela onde eles venceram. A Rainbow Rocket foi derrotada apenas quando o protagonista provou que a vitória do herói é a única constante.",
    pokemons: ["mewtwo", "kyogre", "groudon", "dialga", "kyurem", "yveltal"],
  },
  {
    era: "Reinos humanos",
    title: "Wally e a captura sob orientação",
    body:
      "Wally, um garoto doente de Petalburg, quer aprender a capturar seu primeiro pokémon. Sob a supervisão do protagonista, captura Ralts — que depois se torna Gallade Mega e o transforma em um dos treinadores mais fortes de Hoenn.",
    pokemons: ["ralts", "gallade"],
  },
  {
    era: "Reinos humanos",
    title: "Necrozma rouba a luz de Alola",
    body:
      "Necrozma se funde com Solgaleo (ou Lunala) para tornar-se Ultra Necrozma. Rouba toda a luz de Alola até o sol se apagar. Só é derrotado quando o protagonista atravessa Ultra Wormholes e o encontra em Ultra Megalopolis, sua terra natal.",
    pokemons: ["necrozma", "solgaleo", "lunala"],
  },
  {
    era: "Reinos humanos",
    title: "Leon perde pela primeira vez",
    body:
      "Após anos como Champion invicto de Galar, Leon é derrotado pelo protagonista em uma partida transmitida para toda a região. O Charizard Gigantamax é vencido pela primeira vez, marcando o fim de uma era e o começo de outra.",
    pokemons: ["charizard"],
  },
  {
    era: "Passado e futuro",
    title: "A Grande Cratera do Sul e a Área Zero",
    body:
      "No centro de Paldea abre-se uma cratera colossal formada por meteoritos cristalinos. Pesquisadores identificaram criaturas ali que não existem em nenhum outro lugar do mundo: variações antigas e futurísticas dos pokémon conhecidos, chamadas Paradox Pokémon.",
    pokemons: ["koraidon", "miraidon", "terapagos"],
  },
  {
    era: "Passado e futuro",
    title: "IA de Sada e Turo",
    body:
      "Prof. Sada (passado) e Prof. Turo (futuro) morreram na Área Zero durante suas pesquisas. Criaram IAs de si mesmos para continuar o trabalho — mas essas IAs continuaram os planos além do razoável, obrigando seus filhos Arven a destruí-las junto do jogador.",
    pokemons: ["koraidon", "miraidon"],
  },
  {
    era: "Passado e futuro",
    title: "Terapagos e a Ilha das Escamas",
    body:
      "Dentro do Terarium DLC — a bioesfera artificial de Blueberry Academy — Terapagos revela-se o pokémon original que gerou toda energia Terastal. Estava selado em uma pequena forma inofensiva por séculos, até ser reencontrado.",
    pokemons: ["terapagos"],
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
