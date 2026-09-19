// Árvore genealógica mitológica — quem criou/gerou quem no universo pokémon.
// Não confundir com evoluções: isto é lore de criação.
//
// Arceus tem doze descendentes diretos, e listar os doze lado a lado é o que
// transformava a árvore numa lista. Eles são agrupados aqui pelos clãs que a
// própria mitologia já reconhece — o trio da criação, os seres dos lagos, os
// golems, o trio do clima — porque a hierarquia que importa não é "Arceus ->
// doze", é "Arceus -> seis domínios".

export interface GenealogyNode {
  name: string;
  role: string;
  note?: string;
  children?: GenealogyNode[];
}

export interface GenealogyBranch {
  id: string;
  /** Nome do clã, como a lore o chama. */
  title: string;
  /** Uma linha sobre o que esse ramo respondeu na criação. */
  note: string;
  members: GenealogyNode[];
}

export const GENEALOGY_ROOT: GenealogyNode = {
  name: "arceus",
  role: "O Pokémon Original",
  note: "Emergiu do Ovo cósmico e criou o universo.",
};

export const GENEALOGY_BRANCHES: GenealogyBranch[] = [
  {
    id: "criacao",
    title: "O trio da criação",
    note: "Os três eixos em que o universo se apoia.",
    members: [
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
    ],
  },
  {
    id: "lagos",
    title: "Os seres dos lagos",
    note: "Deram aos humanos o que os separa dos outros animais.",
    members: [
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
    ],
  },
  {
    id: "terra",
    title: "O escultor e seus golems",
    note: "Quem deu forma ao relevo, e o que ele deixou para trás.",
    members: [
      {
        name: "regigigas",
        role: "Escultor dos Continentes",
        note: "Puxou as placas tectônicas e criou os três Regis.",
        children: [
          { name: "regirock", role: "Golem de Rocha" },
          { name: "regice", role: "Golem de Gelo" },
          { name: "registeel", role: "Golem de Aço" },
        ],
      },
    ],
  },
  {
    id: "clima",
    title: "O trio do clima",
    note: "Terra, mar e céu — e a briga que quase desfez os três.",
    members: [
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
    ],
  },
  {
    id: "vida",
    title: "A origem da vida",
    note: "O ancestral comum — e a única descendência feita por humanos.",
    members: [
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
    ],
  },
  {
    id: "luz",
    title: "A luz do Ultra Espaço",
    note: "O que veio de fora do mundo, e o que nasceu dele.",
    members: [
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
              { name: "lunala", role: "Devoradora da Lua" },
            ],
          },
        ],
      },
    ],
  },
];

/** Todo nome citado na genealogia, do Arceus à última folha. */
export function genealogyNames(): string[] {
  const acc: string[] = [GENEALOGY_ROOT.name];
  const walk = (n: GenealogyNode) => {
    acc.push(n.name);
    n.children?.forEach(walk);
  };
  GENEALOGY_BRANCHES.forEach((b) => b.members.forEach(walk));
  return acc;
}
