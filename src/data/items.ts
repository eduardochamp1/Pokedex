export interface ItemLore {
  id: string;
  name: string;
  category: "pokebola" | "sagrado" | "chave" | "cristal" | "livro";
  summary: string;
  pokemons: string[];
}

export const ITEMS: ItemLore[] = [
  // ==================== POKÉBOLAS ====================
  {
    id: "master-ball",
    name: "Master Ball",
    category: "pokebola",
    summary:
      "A pokébola perfeita — captura qualquer pokémon sem falhar. Desenvolvida pela Silph Co. em Saffron. A Team Rocket invadiu a sede em 1996 para roubar o protótipo; um treinador anônimo recuperou. Só existem 3 no mundo: uma na Silph, uma em Kanto, uma em Sinnoh.",
    pokemons: ["mewtwo", "arceus"],
  },
  {
    id: "gs-ball",
    name: "GS Ball",
    category: "pokebola",
    summary:
      "Pokébola dourada com padrão prateado descoberta por Kurt em Azalea Town. Nunca abriu por meios normais — só se ativa em Ilex Forest, chamando Celebi. Ash Ketchum a entregou a Kurt no anime, mas nunca a viu abrir.",
    pokemons: ["celebi"],
  },

  // ==================== ITENS SAGRADOS ====================
  {
    id: "rainbow-wing",
    name: "Rainbow Wing",
    category: "sagrado",
    summary:
      "Pena arco-íris de Ho-Oh, deixada quando ela sobrevoa uma alma pura. Ash a encontrou em seu primeiríssimo dia. Levando a pena para o topo da Tin Tower em Ecruteak, Ho-Oh desce para ser desafiado.",
    pokemons: ["ho-oh"],
  },
  {
    id: "silver-wing",
    name: "Silver Wing",
    category: "sagrado",
    summary:
      "Pena prateada de Lugia, encontrada em Pewter City. Necessária para acessar Whirl Islands e chamar Lugia até a superfície. Enquanto Rainbow Wing é sinal de bênção, Silver Wing é convite ao abismo marinho.",
    pokemons: ["lugia"],
  },
  {
    id: "azure-flute",
    name: "Azure Flute",
    category: "sagrado",
    summary:
      "Flauta azul que, tocada no topo do Mount Coronet, abre um caminho para o Hall of Origin — onde Arceus repousa. Só um treinador digno consegue tocá-la sem que ela se despedace. Após uso, some para sempre.",
    pokemons: ["arceus"],
  },
  {
    id: "prison-bottle",
    name: "Prison Bottle",
    category: "sagrado",
    summary:
      "Garrafa antiga que aprisiona o verdadeiro poder de Hoopa Unbound. Enquanto contido, Hoopa é infantil e travesso (Confined). Quebrada, libera o gigante devastador que causou eventos em Kalos há séculos.",
    pokemons: ["hoopa"],
  },

  // ==================== ITENS-CHAVE (transformações) ====================
  {
    id: "adamant-orb",
    name: "Adamant Orb",
    category: "chave",
    summary:
      "Esfera vermelha antiga que amplifica os ataques Dragon e Steel de Dialga. Foi entregue por seguidores sinnohanos como oferenda. Cyrus tentou usá-la para forçar Dialga a manipular o tempo.",
    pokemons: ["dialga"],
  },
  {
    id: "lustrous-orb",
    name: "Lustrous Orb",
    category: "chave",
    summary:
      "Esfera perolada de Palkia. Amplifica seus ataques Dragon e Water. Formaria par com Adamant no altar do Spear Pillar durante o ritual da Team Galactic.",
    pokemons: ["palkia"],
  },
  {
    id: "griseous-orb",
    name: "Griseous Orb",
    category: "chave",
    summary:
      "Esfera platina que transforma Giratina em sua forma Origin. Fora do Mundo Distorcido, Giratina retorna à forma Altered a menos que segure o Griseous Orb. Amplifica Ghost e Dragon.",
    pokemons: ["giratina"],
  },
  {
    id: "red-chain",
    name: "Red Chain",
    category: "chave",
    summary:
      "Corrente feita das Red Shards dos três lagos de Sinnoh. Só pode ser forjada com as memórias de Uxie, Mesprit e Azelf extraídas à força. Cyrus a usou para controlar Dialga e Palkia — antes de Giratina o levar.",
    pokemons: ["dialga", "palkia", "uxie", "mesprit", "azelf"],
  },
  {
    id: "dna-splicers",
    name: "DNA Splicers",
    category: "chave",
    summary:
      "Item da Team Plasma criado por Colress. Combina Kyurem com Reshiram (Kyurem Branco) ou Zekrom (Kyurem Preto). Reconstitui parcialmente o Dragão Original — a fusão nunca é perfeita e causa dor aos três.",
    pokemons: ["kyurem", "reshiram", "zekrom"],
  },
  {
    id: "n-solarizer",
    name: "N-Solarizer / N-Lunarizer",
    category: "chave",
    summary:
      "Dispositivos que fundem Necrozma com Solgaleo (Ultra Necrozma solar) ou Lunala (Ultra Necrozma lunar). Sem eles, Necrozma é apenas Dusk Mane ou Dawn Wings. Ultra Necrozma é o mais forte pokémon documentado.",
    pokemons: ["necrozma", "solgaleo", "lunala"],
  },
  {
    id: "rusted-sword",
    name: "Rusted Sword / Rusted Shield",
    category: "chave",
    summary:
      "As armas ancestrais que os dois heróis de Galar usaram para derrotar Eternatus no Darkest Day. Depois de 3000 anos, ainda transformam Zacian em Crowned Sword e Zamazenta em Crowned Shield.",
    pokemons: ["zacian", "zamazenta"],
  },
  {
    id: "zygarde-cube",
    name: "Zygarde Cube",
    category: "chave",
    summary:
      "Cubo científico usado para armazenar Zygarde Cells e Zygarde Cores encontradas por Kalos. Junte 10 células = Zygarde 10%; 50 = Zygarde 50%; 100 células + o Core Perfect = Zygarde Complete Forme.",
    pokemons: ["zygarde"],
  },
  {
    id: "meltan-box",
    name: "Mystery Box",
    category: "chave",
    summary:
      "Caixa dourada distribuída via Pokémon Home. Ativada, atrai Meltan por 30 minutos no Pokémon GO. Meltan em Pokémon Home nunca evolui — só o Meltan de Pokémon GO transferido pode virar Melmetal.",
    pokemons: ["meltan", "melmetal"],
  },
  {
    id: "ogerpon-masks",
    name: "Máscaras de Ogerpon",
    category: "chave",
    summary:
      "Quatro máscaras cerimoniais de Kitakami — Teal, Wellspring, Hearthflame, Cornerstone. Cada uma muda o tipo secundário de Ogerpon: Água, Fogo, Rocha. Uma delas foi roubada há séculos pelos Loyal Three.",
    pokemons: ["ogerpon"],
  },

  // ==================== CRISTAIS ====================
  {
    id: "plates",
    name: "Plates de Arceus",
    category: "cristal",
    summary:
      "17 tabuletas de pedra espalhadas por Sinnoh. Cada uma muda o tipo de Arceus quando ele segura uma. São fragmentos de sua consciência primordial — quando reunidas por completo, Arceus recobra memórias esquecidas.",
    pokemons: ["arceus"],
  },
  {
    id: "mega-stones",
    name: "Mega Stones",
    category: "cristal",
    summary:
      "Cristais forjados pela Máquina Definitiva de AZ há 3000 anos. A energia acumulada por Xerneas cristalizou nas pedras. Combinadas com um Key Stone empunhado por um treinador com laço forte, produzem Mega Evolução.",
    pokemons: ["xerneas", "charizard", "gyarados", "lucario"],
  },
  {
    id: "z-crystals",
    name: "Z-Crystals",
    category: "cristal",
    summary:
      "18 cristais elementais espalhados por Alola, guardados pelos Kahunas. Ativam Z-Moves — ataques poderosos únicos por cada Trial completado. Alguns Z-Crystals são específicos: Pikanium Z (só Pikachu), Alolan Meowth Z (só Meowth de Alola).",
    pokemons: ["pikachu"],
  },

  // ==================== LIVROS / DIÁRIOS ====================
  {
    id: "scarlet-violet-book",
    name: "Scarlet Book / Violet Book",
    category: "livro",
    summary:
      "Diários dos professores Sada (Scarlet) e Turo (Violet) sobre suas pesquisas na Área Zero. Descrevem os Paradox Pokémon (Great Tusk, Iron Treads etc.) e como abriram o portal temporal. Encontrados pelo protagonista após a morte dos autores.",
    pokemons: ["koraidon", "miraidon"],
  },
  {
    id: "sinnoh-lore-books",
    name: "Livros da Biblioteca de Canalave",
    category: "livro",
    summary:
      "Coleção de três livros na biblioteca de Canalave que contam os mitos da criação — Dialga/Palkia/Giratina, Uxie/Mesprit/Azelf. Livro #3 conta que 'humanos e pokémon eram um só'. Cyrus interpretou como confirmação de sua teoria.",
    pokemons: ["arceus", "dialga", "palkia", "giratina"],
  },
];
