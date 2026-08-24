// Árvore genealógica mitológica — quem criou/gerou quem no universo pokémon.
// Estrutura hierárquica (não confundir com evoluções — isso é lore de criação).

export interface GenealogyNode {
  name: string;
  role: string;
  note?: string;
  children?: GenealogyNode[];
}

export const GENEALOGY_TREE: GenealogyNode = {
  name: "arceus",
  role: "O Pokémon Original",
  note: "Emergiu do Ovo cósmico e criou o universo.",
  children: [
    {
      name: "dialga",
      role: "Senhor do Tempo",
      note: "Rege a linha temporal.",
    },
    {
      name: "palkia",
      role: "Senhor do Espaço",
      note: "Molda dimensões físicas.",
    },
    {
      name: "giratina",
      role: "Guardião da Antimatéria",
      note: "Banido ao Mundo Distorcido por sua violência.",
    },
    {
      name: "uxie",
      role: "Ser do Conhecimento",
      note: "Deu aos humanos a inteligência. Lago Acuity.",
    },
    {
      name: "mesprit",
      role: "Ser da Emoção",
      note: "Deu aos humanos a capacidade de sentir. Lago Verity.",
    },
    {
      name: "azelf",
      role: "Ser da Vontade",
      note: "Deu aos humanos a força de agir. Lago Valor.",
    },
    {
      name: "regigigas",
      role: "Escultor dos Continentes",
      note: "Puxou as placas tectônicas e criou os três Regis.",
      children: [
        { name: "regirock", role: "Golem de Rocha" },
        { name: "regice",   role: "Golem de Gelo" },
        { name: "registeel", role: "Golem de Aço" },
      ],
    },
    {
      name: "groudon",
      role: "Continente",
      note: "Emergiu do magma expandindo a terra firme.",
    },
    {
      name: "kyogre",
      role: "Oceano",
      note: "Surgiu das profundezas para encher os mares.",
    },
    {
      name: "rayquaza",
      role: "Céu",
      note: "Desce da estratosfera para acalmar Groudon e Kyogre.",
    },
    {
      name: "mew",
      role: "Ancestral de todos os pokémon",
      note: "Seus genes contêm o DNA de todas as espécies.",
      children: [
        {
          name: "mewtwo",
          role: "Descendente artificial",
          note: "Clonado por cientistas a partir do DNA de Mew.",
        },
      ],
    },
    {
      name: "necrozma",
      role: "Anterior ao mundo",
      note: "Vem do Ultra Espaço, faminto pela luz.",
      children: [
        {
          name: "cosmog",
          role: "Semente cósmica",
          note: "Cai do Ultra Espaço. Evolui em Cosmoem.",
          children: [
            { name: "solgaleo", role: "Devorador do Sol" },
            { name: "lunala",   role: "Devoradora da Lua" },
          ],
        },
      ],
    },
  ],
};
