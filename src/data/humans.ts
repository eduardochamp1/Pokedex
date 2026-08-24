export interface HumanLegend {
  name: string;
  role: string;
  region: string;
  summary: string;
  pokemons: string[];
}

export const HUMAN_LEGENDS: HumanLegend[] = [
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
    name: "Cynthia",
    role: "Champion de Sinnoh, historiadora",
    region: "Sinnoh",
    summary:
      "A Champion mais forte da série. Além de treinadora, estuda a mitologia sinnohana e as Ruínas de Solaceon. Seu Garchomp é lendário entre jogadores de todas as gerações.",
    pokemons: ["garchomp", "spiritomb", "milotic"],
  },
  {
    name: "Rei de Galar",
    role: "Herói do Darkest Day",
    region: "Galar (há 3000 anos)",
    summary:
      "Dois irmãos anônimos usaram as espadas e escudos de Zacian e Zamazenta para conter Eternatus quando este caiu do céu. A história oficial de Galar mente sobre quem realmente foi o herói.",
    pokemons: ["zacian", "zamazenta", "eternatus"],
  },
  {
    name: "Volo",
    role: "Mercador ambulante de Hisui",
    region: "Hisui (Sinnoh ancestral)",
    summary:
      "Aparentemente um comerciante amistoso, Volo é na verdade obcecado por atrair Arceus a Hisui. Descendente do clã de Cyrus, tenta destruir o mundo com Giratina para forçar Arceus a criar um novo.",
    pokemons: ["arceus", "giratina", "spiritomb", "togekiss"],
  },
];
