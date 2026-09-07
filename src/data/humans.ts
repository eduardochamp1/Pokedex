export interface HumanLegend {
  name: string;
  role: string;
  region: string;
  summary: string;
  pokemons: string[];
}

export const HUMAN_LEGENDS: HumanLegend[] = [
  // ==================== HERÓIS ANTIGOS ====================
  {
    name: "Sir Aaron",
    role: "Guardião do Reino de Rota",
    region: "Kanto (lendas antigas)",
    summary:
      "Aura Guardian ancestral. Sacrificou sua própria vida para salvar o Tree of Beginning, junto de seu Lucario. Sua consciência ficou selada no bastão real por séculos.",
    pokemons: ["lucario", "mew"],
  },
  {
    name: "AZ",
    role: "Rei imortal de Kalos",
    region: "Kalos (há 3000 anos)",
    summary:
      "Rei de Kalos que perdeu seu Floette na guerra e construiu a Máquina Definitiva. Foi punido com a imortalidade — vagou pelos séculos até reencontrar seu Floette perdido.",
    pokemons: ["floette", "xerneas"],
  },
  {
    name: "Rei de Galar",
    role: "Herói do Darkest Day",
    region: "Galar (há 3000 anos)",
    summary:
      "Dois irmãos anônimos usaram as espadas e escudos de Zacian e Zamazenta para conter Eternatus quando este caiu do céu. A história oficial de Galar mente sobre quem realmente foi o herói.",
    pokemons: ["zacian", "zamazenta", "eternatus"],
  },

  // ==================== PROFESSORES ====================
  {
    name: "Professor Samuel Oak",
    role: "Pioneiro da pesquisa Pokémon",
    region: "Kanto (Pallet Town)",
    summary:
      "O primeiro professor moderno. Desenvolveu a Pokédex — dispositivo revolucionário que catalogou pela primeira vez centenas de espécies. Descobriu Mew em suas expedições. Padrinho da maioria dos treinadores de Kanto.",
    pokemons: ["mew", "tauros", "dragonite"],
  },
  {
    name: "Professor Elm",
    role: "Especialista em breeding",
    region: "Johto (New Bark Town)",
    summary:
      "Pupilo de Oak. Descobriu que pokémon se reproduzem e chocam ovos. Sua pesquisa revelou pokémon-bebê como Pichu, Cleffa e Igglybuff — evolução para trás nunca antes vista.",
    pokemons: ["togepi", "pichu"],
  },
  {
    name: "Professor Birch",
    role: "Estudioso de habitats",
    region: "Hoenn (Littleroot Town)",
    summary:
      "Pesquisa de campo em vez de laboratório. Foi salvo por seu primeiro treinador de um bando de Poochyena selvagens — momento icônico que se tornou lenda regional.",
    pokemons: ["poochyena", "zigzagoon"],
  },
  {
    name: "Professor Rowan",
    role: "Autoridade em evoluções",
    region: "Sinnoh (Sandgem Town)",
    summary:
      "Foi mentor de Oak. Seus estudos sobre evolução revelaram novas formas evolutivas até então desconhecidas — Rhyperior, Magmortar, Electivire, Weavile, Yanmega.",
    pokemons: ["kricketune", "empoleon"],
  },
  {
    name: "Professora Juniper",
    role: "Origens dos pokémon",
    region: "Unova (Nuvema Town)",
    summary:
      "Primeira professora feminina da saga principal. Pesquisa as origens ancestrais dos pokémon — como surgiram no mundo. Trabalha junto ao pai (também professor).",
    pokemons: ["snivy", "tepig", "oshawott"],
  },
  {
    name: "Professor Sycamore",
    role: "Especialista em Mega Evolução",
    region: "Kalos (Lumiose City)",
    summary:
      "Redescobriu o fenômeno das Mega Evoluções após séculos esquecido. Distribuiu Mega Pedras para treinadores após provar sua capacidade.",
    pokemons: ["garchomp", "bulbasaur", "charmander", "squirtle"],
  },
  {
    name: "Professor Kukui",
    role: "Estudioso de Z-Moves",
    region: "Alola",
    summary:
      "Pesquisa o poder das Z-Moves e a relação treinador-pokémon. Fundou a primeira Liga Pokémon de Alola. Nos bastidores, é The Masked Royal — lutador de wrestling secreto.",
    pokemons: ["lycanroc", "incineroar"],
  },
  {
    name: "Professora Magnolia",
    role: "Pioneira do Dynamax",
    region: "Galar",
    summary:
      "Descobriu o fenômeno Dynamax nos Power Spots de Galar. Trabalha com sua neta Sonia investigando lendas da região — inclusive a verdade sobre o Darkest Day.",
    pokemons: ["alcremie"],
  },
  {
    name: "Professores Sada e Turo",
    role: "Pesquisadores do tempo",
    region: "Paldea (Área Zero)",
    summary:
      "Sada estudou o passado (Scarlet), Turo o futuro (Violet). Ambos morreram na Área Zero, deixando cópias digitais — IA — que continuaram suas pesquisas até serem destruídas por seus filhos.",
    pokemons: ["koraidon", "miraidon"],
  },

  // ==================== VILÕES ====================
  {
    name: "Cyrus",
    role: "Líder do Team Galactic",
    region: "Sinnoh",
    summary:
      "Homem sem coração que buscou destruir o universo e recriá-lo sem emoções. Invocou Dialga e Palkia no topo do Mount Coronet — mas foi levado por Giratina ao Mundo Distorcido, onde permanece até hoje.",
    pokemons: ["dialga", "palkia", "giratina"],
  },
  {
    name: "N (Natural Harmonia Gropius)",
    role: "Rei da Team Plasma",
    region: "Unova",
    summary:
      "Criado em isolamento por Ghetsis para libertar todos os pokémon dos humanos. Despertou o Dragão Original — Zekrom ou Reshiram — e desafiou o Champion, mas foi convencido de sua própria filosofia estar quebrada.",
    pokemons: ["zekrom", "reshiram", "zorua", "zoroark"],
  },
  {
    name: "Ghetsis",
    role: "Verdadeiro líder da Team Plasma",
    region: "Unova",
    summary:
      "O antagonista real por trás de N. Ao ser derrotado, retorna com Kyurem — a carcaça vazia do Dragão Original — para tentar dominar Unova pela força bruta.",
    pokemons: ["hydreigon", "kyurem"],
  },
  {
    name: "Lysandre",
    role: "Líder da Team Flare",
    region: "Kalos",
    summary:
      "Milionário que acreditava só os belos merecerem viver. Reativou a Máquina Definitiva de AZ para exterminar o resto do mundo. Xerneas ou Yveltal decidiu o desfecho.",
    pokemons: ["xerneas", "yveltal"],
  },
  {
    name: "Lusamine",
    role: "Presidente da Aether Foundation",
    region: "Alola",
    summary:
      "Obcecada com os Ultra Beasts, abre o portal Ultra Space usando Cosmog como bateria. Se funde com Nihilego para se tornar uma criatura alienígena, até ser salva por seu filho Gladion.",
    pokemons: ["nihilego", "cosmog", "solgaleo", "lunala"],
  },
  {
    name: "Volo",
    role: "Mercador ambulante de Hisui",
    region: "Hisui (Sinnoh ancestral)",
    summary:
      "Aparentemente um comerciante amistoso, Volo é na verdade obcecado por atrair Arceus a Hisui. Descendente do clã de Cyrus, tenta destruir o mundo com Giratina para forçar Arceus a criar um novo.",
    pokemons: ["arceus", "giratina", "spiritomb", "togekiss"],
  },

  // ==================== CHAMPIONS ====================
  {
    name: "Red",
    role: "Champion silencioso de Kanto",
    region: "Kanto",
    summary:
      "Menino de Pallet Town que se tornou o Champion mais forte da história aos 11 anos. Após vencer a Elite Four, subiu ao Mount Silver e sumiu. Só volta ao mundo humano para desafiar quem alcança seu pico.",
    pokemons: ["pikachu", "charizard", "venusaur", "blastoise", "snorlax", "espeon"],
  },
  {
    name: "Blue Oak",
    role: "Ex-Champion, neto do Prof. Oak",
    region: "Kanto",
    summary:
      "Foi Champion por um dia — derrotado por Red antes mesmo do jogador chegar. Se tornou o Líder de Ginásio de Viridian City. Rival eterno de Red, sempre um passo atrás.",
    pokemons: ["pidgeot", "alakazam", "arcanine", "gyarados", "exeggutor", "rhydon"],
  },
  {
    name: "Silver",
    role: "Rival de Johto, filho de Giovanni",
    region: "Johto",
    summary:
      "Filho abandonado de Giovanni (Team Rocket) que roubou um pokémon inicial do Prof. Elm. Odiava fraqueza e acreditava que só o poder importava — até ser humilhado por um treinador iniciante e reformar seu jeito.",
    pokemons: ["sneasel", "feraligatr", "meganium", "typhlosion"],
  },
  {
    name: "Steven Stone",
    role: "Champion de Hoenn, geólogo",
    region: "Hoenn",
    summary:
      "Filho do presidente da Devon Corporation. Especialista em pokémon do tipo Steel. Foi o primeiro humano a estabilizar a Mega Evolução, com seu Metagross como parceiro sincronizado.",
    pokemons: ["metagross", "aggron", "cradily", "armaldo", "claydol", "skarmory"],
  },
  {
    name: "Cynthia",
    role: "Champion de Sinnoh, historiadora",
    region: "Sinnoh",
    summary:
      "A Champion mais forte da série. Além de treinadora, estuda a mitologia sinnohana e as Ruínas de Solaceon. Seu Garchomp é lendário entre jogadores de todas as gerações.",
    pokemons: ["garchomp", "spiritomb", "milotic", "lucario", "roserade", "togekiss"],
  },
  {
    name: "Alder",
    role: "Champion errante de Unova",
    region: "Unova",
    summary:
      "Perdeu seu pokémon parceiro anos antes dos jogos e passou a viajar Unova em silêncio. Não é derrotado por N — é convencido por N. Retorna como mentor após os eventos de Black/White.",
    pokemons: ["volcarona", "bouffalant", "escavalier", "accelgor", "druddigon", "vanilluxe"],
  },
  {
    name: "Iris",
    role: "Champion de Unova (BW2)",
    region: "Unova",
    summary:
      "Garota da Village of Dragons. Substituiu Alder como Champion após treinamento intensivo com dragões. Especialista em Dragon-types, sua Haxorus é temida.",
    pokemons: ["haxorus", "hydreigon", "druddigon", "aggron", "lapras", "archeops"],
  },
  {
    name: "Diantha",
    role: "Champion de Kalos, atriz",
    region: "Kalos",
    summary:
      "Estrela de cinema e Champion. Seu Gardevoir pode Mega-evoluir, criando um dos duelos mais elegantes da série. Vive dividida entre o palco e a Liga.",
    pokemons: ["gardevoir", "aurorus", "tyrantrum", "gourgeist", "goodra", "hawlucha"],
  },
  {
    name: "Hau",
    role: "Champion inicial de Alola",
    region: "Alola",
    summary:
      "Neto do Kahuna Hala. Alegre e amigável, tornou-se o primeiro Champion oficial da nova Liga de Alola após vencer o protagonista na cerimônia inaugural.",
    pokemons: ["decidueye", "incineroar", "primarina", "raichu-alola", "tauros"],
  },
  {
    name: "Leon",
    role: "Champion invicto de Galar",
    region: "Galar",
    summary:
      "Nunca perdeu uma batalha oficial. Superstar nacional de Galar, aparece nos telões dos estádios com seu Charizard Gigantamax. Irmão mais velho de Hop.",
    pokemons: ["charizard", "aegislash", "haxorus", "dragapult", "rhyperior", "seismitoad"],
  },
  {
    name: "Nemona",
    role: "Rival e Champion de Paldea",
    region: "Paldea",
    summary:
      "Obcecada por batalhar. Foi Champion da Liga de Paldea desde criança — sua força é tanta que precisa se conter para não humilhar seus adversários. Adora encontrar rivais à altura.",
    pokemons: ["meowscarada", "skeledirge", "quaquaval", "orthworm", "goodra-hisui", "pawmot"],
  },

  // ==================== RIVAIS E COADJUVANTES ====================
  {
    name: "Lillie",
    role: "Aluna da Aether Foundation",
    region: "Alola",
    summary:
      "Filha de Lusamine. Resgatou Cosmog (a quem chamou de Nebby) das experiências de sua mãe. Após a crise Ultra Beast, viajou para Kanto para curar sua mãe do trauma.",
    pokemons: ["cosmog", "solgaleo", "lunala", "clefable"],
  },
  {
    name: "Gladion",
    role: "Ex-Team Skull, filho de Lusamine",
    region: "Alola",
    summary:
      "Fugiu de casa com Type: Null (agora Silvally) para escapar dos experimentos de Lusamine. Se aliou brevemente à Team Skull. Depois da crise, se torna Champion interino.",
    pokemons: ["silvally", "lucario", "zoroark", "crobat", "weavile"],
  },
  {
    name: "Hop",
    role: "Rival de Galar, irmão do Champion",
    region: "Galar",
    summary:
      "Irmão mais novo de Leon. Passou boa parte da jornada na sombra do irmão. Encontrou seu próprio caminho investigando o Darkest Day junto ao protagonista.",
    pokemons: ["zamazenta", "dubwool", "corviknight", "cramorant"],
  },
  {
    name: "Marnie",
    role: "Idol e rival de Galar",
    region: "Galar",
    summary:
      "Da região de Spikemuth. Irmã de Piers (Líder de Ginásio). Tem uma legião de fãs (Team Yell) que a seguem por onde vai. Especialista em Dark-types.",
    pokemons: ["morpeko", "grimmsnarl", "toxicroak", "liepard"],
  },
];
