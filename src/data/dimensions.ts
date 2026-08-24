export interface Dimension {
  id: string;
  name: string;
  ruler: string;
  access: string;
  description: string;
  inhabitants: string[];
  color: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "distortion",
    name: "Mundo Distorcido",
    ruler: "Giratina",
    access: "Turnback Cave (Sinnoh), Torre do Céu Distorcido (Platinum).",
    description:
      "Plano espelho do mundo normal onde a gravidade, tempo e espaço se comportam de forma caótica. Giratina foi banido para cá por Arceus após atos de violência durante a criação. Cyrus, o líder da Team Galactic, vagou sozinho por esse mundo após ser derrotado.",
    inhabitants: ["giratina"],
    color: "#4a3663",
  },
  {
    id: "ultraspace",
    name: "Ultra Espaço",
    ruler: "Necrozma (originalmente)",
    access: "Ultra Wormholes abertos pela Aether Foundation em Alola; ampliados pela obsessão de Lusamine.",
    description:
      "Rede de mundos alternativos ligados por buracos de minhoca. Cada Ultra Beast vem de um Ultra Mundo distinto — Ultra Jungle (Buzzwole), Ultra Desert (Kartana), Ultra Deep Sea (Nihilego), etc. Necrozma habitava aqui antes de ser banido; agora rouba luz para retornar.",
    inhabitants: ["necrozma", "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon"],
    color: "#6f35fc",
  },
  {
    id: "dreamworld",
    name: "Mundo dos Sonhos",
    ruler: "Musharna / Cresselia",
    access: "Entra-se através do Dream Mist de Musharna. Somente a mente vaga por lá — o corpo permanece dormindo.",
    description:
      "Plano dos sonhos ao qual todas as consciências vão durante o sono profundo. Cresselia entrega bons sonhos; Darkrai, condenado à Ilha Newmoon, entrega pesadelos. Alguns pokémon com habilidades ocultas só podem ser encontrados aqui.",
    inhabitants: ["musharna", "cresselia", "darkrai"],
    color: "#7a91d1",
  },
  {
    id: "sinjoh",
    name: "Ruínas de Sinjoh",
    ruler: "Arceus",
    access: "Cerimônia de Arceus + Ovo levado a Sinjoh Ruins na fronteira Sinnoh/Johto.",
    description:
      "Ponto de convergência entre eras. Trazer Arceus até este local com um item específico dispara um ritual que gera um Ovo contendo Dialga, Palkia ou Giratina em suas formas Origin. É onde a criação pode ser reencenada.",
    inhabitants: ["arceus", "dialga", "palkia", "giratina"],
    color: "#c9a94a",
  },
  {
    id: "hisui",
    name: "Hisui (Sinnoh ancestral)",
    ruler: "Nenhum — era pré-humana",
    access: "Fenda espaço-temporal em Jubilife Village (Legends: Arceus).",
    description:
      "O que hoje é Sinnoh, séculos antes da colonização humana. Aqui vivem Hisuian forms (Zorua, Braviary, Growlithe, Voltorb) e o próprio Arceus antes de ser mitologizado. Volo tentou explorar essa era para forçar Arceus a recriar o mundo.",
    inhabitants: ["arceus", "dialga", "palkia", "giratina", "zorua", "zoroark"],
    color: "#4a7a5c",
  },
  {
    id: "terastal",
    name: "Área Zero / Realm Terastal",
    ruler: "Terapagos",
    access: "Fundo da Grande Cratera do Sul, em Paldea.",
    description:
      "Cratera gigante formada por um meteorito cristalino. A energia Terastal que permeia o solo altera o tipo dos pokémon locais e cria as coroas cristalinas. Koraidon (passado) e Miraidon (futuro) vieram por rasgos aqui abertos por experimentos do Prof. Sada/Turo.",
    inhabitants: ["terapagos", "koraidon", "miraidon"],
    color: "#e63946",
  },
  {
    id: "shadow",
    name: "Reverse World / Colosseum",
    ruler: "Cipher (grupo criminoso)",
    access: "Região de Orre — jogos Pokémon Colosseum e XD: Gale of Darkness.",
    description:
      "Não é bem uma dimensão paralela, mas uma região sem grama alta onde pokémon selvagens não aparecem. Cipher desenvolveu técnica para fechar o coração dos pokémon, criando Shadow Pokémon — capazes de atacar humanos, tendência descoberta com Shadow Lugia (XD001).",
    inhabitants: ["lugia"],
    color: "#3a3a4a",
  },
];
