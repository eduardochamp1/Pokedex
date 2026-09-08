import type { WikiSourced } from "../lib/wiki";

export interface VillainTeam extends WikiSourced {
  id: string;
  name: string;
  region: string;
  leader: string;
  motivation: string;
  fate: string;
  signature: string[];
  color: string;
}

export const VILLAIN_TEAMS: VillainTeam[] = [
  {
    id: "rocket",
    name: "Team Rocket",
    wiki: "Team Rocket",
    region: "Kanto / Johto",
    leader: "Giovanni",
    motivation:
      "Organização criminosa clássica. Vende pokémon roubados no mercado negro e experimenta com clonagem — foram os responsáveis por Mewtwo.",
    fate:
      "Dissolvida após Giovanni ser derrotado. Ressurge três anos depois em Johto (Radio Tower), mas sem seu líder.",
    signature: ["mewtwo", "persian", "kangaskhan"],
    color: "#000000",
  },
  {
    id: "magma",
    name: "Team Magma",
    wiki: "Team Magma",
    region: "Hoenn",
    leader: "Maxie",
    motivation:
      "Acredita que expandir a terra firme (via Groudon) criará mais espaço para os humanos evoluírem.",
    fate:
      "Groudon foge do controle, o mundo entra em seca extrema até Rayquaza intervir. Maxie reconhece o erro.",
    signature: ["groudon", "camerupt", "mightyena"],
    color: "#a83a2c",
  },
  {
    id: "aqua",
    name: "Team Aqua",
    wiki: "Team Aqua",
    region: "Hoenn",
    leader: "Archie",
    motivation:
      "Rival direto da Team Magma. Quer expandir os oceanos (via Kyogre) para restaurar o mundo natural anterior aos humanos.",
    fate:
      "Kyogre causa dilúvios devastadores. Archie percebe que sua utopia era destrutiva.",
    signature: ["kyogre", "sharpedo", "crawdaunt"],
    color: "#2e5aa8",
  },
  {
    id: "galactic",
    name: "Team Galactic",
    wiki: "Team Galactic",
    region: "Sinnoh",
    leader: "Cyrus",
    motivation:
      "Cyrus quer destruir o universo atual e recriá-lo sem emoções — que ele considera fonte de todo sofrimento humano.",
    fate:
      "Invoca Dialga e Palkia no Spear Pillar, mas é levado por Giratina ao Mundo Distorcido, onde vaga eternamente.",
    signature: ["dialga", "palkia", "giratina", "weavile"],
    color: "#6b4a9b",
  },
  {
    id: "plasma",
    name: "Team Plasma",
    wiki: "Team Plasma",
    region: "Unova",
    leader: "N / Ghetsis",
    motivation:
      "Publicamente prega a libertação dos pokémon dos humanos, com o carismático N como rosto público. Internamente, Ghetsis usa a ideologia para monopolizar o poder.",
    fate:
      "N desperta o Dragão Original mas se converte após entender que treinadores e pokémon podem ser parceiros. Ghetsis retorna anos depois com Kyurem.",
    signature: ["reshiram", "zekrom", "kyurem", "hydreigon"],
    color: "#3a3a4a",
  },
  {
    id: "flare",
    name: "Team Flare",
    wiki: "Team Flare",
    region: "Kalos",
    leader: "Lysandre",
    motivation:
      "Elitismo estético. Lysandre acredita que apenas os belos merecem viver e planeja reativar a Máquina Definitiva de AZ.",
    fate:
      "Xerneas ou Yveltal é despertado. Lysandre é enterrado nas ruínas do laboratório subterrâneo.",
    signature: ["xerneas", "yveltal", "pyroar"],
    color: "#e63946",
  },
  {
    id: "skull",
    name: "Team Skull",
    wiki: "Team Skull",
    region: "Alola",
    leader: "Guzma",
    motivation:
      "Bando de perdedores que não conseguiram passar do Island Challenge. Vandalizam vilas, mas são mais patéticos do que perigosos — até serem manipulados pela Aether Foundation.",
    fate:
      "Dissolvida após o Ultra Beast Crisis. Guzma se torna sensei da Battle Tree; muitos membros se reformam.",
    signature: ["golisopod", "salazzle", "scizor"],
    color: "#1a1a1a",
  },
  {
    id: "aether",
    name: "Aether Foundation",
    wiki: "Aether Foundation",
    region: "Alola",
    leader: "Lusamine",
    motivation:
      "Fachada filantrópica que na verdade experimenta com Ultra Beasts. Lusamine se obcecou por Nihilego a ponto de tentar se fundir com ela.",
    fate:
      "Salva por seus filhos Gladion e Lillie. Os Ultra Beasts são devolvidos ao Ultra Espaço.",
    signature: ["nihilego", "silvally", "solgaleo"],
    color: "#f7d02c",
  },
  {
    id: "macro",
    name: "Macro Cosmos / Chairman Rose",
    wiki: "Macro Cosmos",
    region: "Galar",
    leader: "Chairman Rose",
    motivation:
      "Corporação energética que sustenta a Liga de Galar. Rose descobre que a energia acabará em mil anos e decide liberar Eternatus agora para resolver o problema.",
    fate:
      "Precipita o Darkest Day. Eternatus é contido pelos protagonistas com Zacian e Zamazenta. Rose se entrega à polícia.",
    signature: ["copperajah", "eternatus"],
    color: "#c48d3a",
  },
  {
    id: "star",
    name: "Team Star",
    wiki: "Team Star",
    region: "Paldea",
    leader: "Penny (The Big Boss)",
    motivation:
      "Não são vilões: são vítimas de bullying que fundaram Team Star para se protegerem. A pressão de expulsão da escola gerou o conflito.",
    fate:
      "Reconciliados com a Academia. Penny se torna aliada; os líderes das cinco bases voltam como estudantes normais.",
    signature: ["revavroom", "eevee"],
    color: "#e63946",
  },
];
