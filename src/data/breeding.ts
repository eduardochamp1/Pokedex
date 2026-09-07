export interface BreedingEntry {
  id: string;
  title: string;
  category: "grupo" | "regra" | "especial";
  summary: string;
  examples?: string[]; // nomes de pokémon representativos
  pokemons: string[];
}

export const BREEDING: BreedingEntry[] = [
  // ==================== REGRAS ====================
  {
    id: "basics",
    title: "Como os ovos funcionam",
    category: "regra",
    summary:
      "Descoberto pelo Prof. Elm em Johto. Dois pokémon do mesmo grupo de ovos (e sexos opostos, ou um deles Ditto) deixados na Nursery/Day Care produzem um ovo. O ovo choca após passos suficientes — mais rápido com a habilidade Flame Body ou Magma Armor no time.",
    pokemons: ["togepi", "pichu", "cleffa"],
  },
  {
    id: "ditto",
    title: "Ditto — o pai/mãe universal",
    category: "especial",
    summary:
      "Ditto é o único pokémon que se acasala com qualquer outro (exceto o grupo Undiscovered). Seu DNA plástico permite se transformar em qualquer parceiro. É o breeder universal — sem ele, nunca chocaríamos lendários acasaláveis.",
    pokemons: ["ditto"],
  },
  {
    id: "egg-moves",
    title: "Egg Moves — a herança dos golpes",
    category: "regra",
    summary:
      "Alguns golpes só podem ser aprendidos ao nascer. O pai passa esses golpes ao filho — se o pai souber, o ovo herda. Certos golpes existem apenas via breeding: Aqua Jet em Marill, Belly Drum em Azumarill, Wish em Togepi.",
    pokemons: ["marill", "togepi"],
  },
  {
    id: "hidden-ability",
    title: "Hidden Abilities e a herança materna",
    category: "regra",
    summary:
      "Se a fêmea tem uma Hidden Ability, o ovo tem 60% de chance de herdar. Ditto pode passar em qualquer sexo desde Gen 6. Algumas HAs são absurdamente raras — Speed Boost em Torchic, Adaptability em Eevee, Contrary em Snivy.",
    pokemons: ["torchic", "eevee", "snivy"],
  },
  {
    id: "masuda",
    title: "Método Masuda — a caça ao shiny",
    category: "regra",
    summary:
      "Batizado em homenagem a Junichi Masuda. Se os dois pais são de idiomas diferentes (ex: um JP + um EN), a chance de shiny sobe de 1/4096 para 1/682. Combinado com Shiny Charm, chega a 1/512. Alterou para sempre a caça a shinies competitivos.",
    pokemons: ["ditto"],
  },
  {
    id: "incense",
    title: "Incense — os ovos raros que ele revela",
    category: "regra",
    summary:
      "Alguns pokémon-bebê só chocam quando o pai/mãe segura um Incense específico durante o breeding. Sem o incenso, o ovo produz o pai. Ex: Munchlax (Full Incense), Bonsly (Rock Incense), Wynaut (Lax Incense), Mime Jr. (Odd Incense).",
    pokemons: ["munchlax", "bonsly", "wynaut", "mime-jr"],
  },

  // ==================== GRUPOS ====================
  {
    id: "group-monster",
    title: "Grupo Monster",
    category: "grupo",
    summary:
      "Pokémon grandes, de aparência reptiliana ou mamífera clássica. Incluem os iniciais de tipo Grass e vários pokémon-dragão pré-Dragon-group. Compatíveis entre si sem Ditto.",
    examples: ["bulbasaur", "charmander", "rhyhorn"],
    pokemons: ["bulbasaur", "charmander", "rhyhorn", "totodile"],
  },
  {
    id: "group-water1",
    title: "Grupo Water 1",
    category: "grupo",
    summary:
      "Anfíbios, tartarugas, mamíferos aquáticos e crustáceos leves. O grupo mais versátil dos ovos aquáticos. Squirtle, Psyduck, Poliwag e Lapras se acasalam livremente entre si.",
    examples: ["squirtle", "psyduck", "poliwag", "lapras"],
    pokemons: ["squirtle", "psyduck", "poliwag", "lapras"],
  },
  {
    id: "group-water2",
    title: "Grupo Water 2",
    category: "grupo",
    summary:
      "Peixes verdadeiros. Magikarp, Feebas, Basculin, Wailmer e Alomomola. Compatíveis apenas com o próprio grupo (e Ditto).",
    examples: ["magikarp", "feebas", "wailmer"],
    pokemons: ["magikarp", "feebas", "wailmer"],
  },
  {
    id: "group-water3",
    title: "Grupo Water 3",
    category: "grupo",
    summary:
      "Crustáceos e vida marinha primitiva. Krabby, Corsola, Corphish, Clauncher. Cruzam apenas dentro do próprio grupo.",
    examples: ["krabby", "corsola", "corphish"],
    pokemons: ["krabby", "corsola", "corphish"],
  },
  {
    id: "group-bug",
    title: "Grupo Bug",
    category: "grupo",
    summary:
      "Todos os pokémon do tipo Bug. Um dos grupos mais numerosos. Caterpie, Weedle, Wurmple, Volbeat, Illumise, Volcarona.",
    examples: ["caterpie", "weedle", "volcarona"],
    pokemons: ["caterpie", "weedle", "volcarona", "scizor"],
  },
  {
    id: "group-flying",
    title: "Grupo Flying",
    category: "grupo",
    summary:
      "Pássaros e pokémon voadores clássicos. Pidgey, Farfetch'd, Swablu, Wingull, Rufflet.",
    examples: ["pidgey", "swablu", "rufflet"],
    pokemons: ["pidgey", "swablu", "rufflet"],
  },
  {
    id: "group-field",
    title: "Grupo Field (Ground)",
    category: "grupo",
    summary:
      "O grupo mais heterogêneo — mamíferos, felinos, roedores, canídeos. Eevee, Growlithe, Vulpix, Rattata, Meowth, Ponyta, Snorlax. Cruzam entre si com facilidade.",
    examples: ["eevee", "growlithe", "meowth"],
    pokemons: ["eevee", "growlithe", "meowth", "vulpix", "snorlax"],
  },
  {
    id: "group-fairy",
    title: "Grupo Fairy",
    category: "grupo",
    summary:
      "Pokémon fofos e feéricos. Clefairy, Jigglypuff, Togepi, Mareep, Marill (que também é Water 1), Snubbull, Ralts.",
    examples: ["clefairy", "jigglypuff", "togepi", "ralts"],
    pokemons: ["clefairy", "jigglypuff", "togepi", "ralts"],
  },
  {
    id: "group-human-like",
    title: "Grupo Human-Like",
    category: "grupo",
    summary:
      "Pokémon bípedes humanoides. Machop, Abra, Hitmonlee/Hitmonchan/Hitmontop, Jynx, Mr. Mime, Gardevoir/Gallade, Lucario, Buneary.",
    examples: ["machop", "abra", "lucario"],
    pokemons: ["machop", "abra", "lucario"],
  },
  {
    id: "group-mineral",
    title: "Grupo Mineral",
    category: "grupo",
    summary:
      "Rochas, cristais e formações minerais. Geodude, Onix, Voltorb, Magnemite (também Amorphous?), Roggenrola, Bronzor. Trocam ovos apenas entre si.",
    examples: ["geodude", "onix", "roggenrola"],
    pokemons: ["geodude", "onix", "roggenrola"],
  },
  {
    id: "group-amorphous",
    title: "Grupo Amorphous",
    category: "grupo",
    summary:
      "Pokémon sem forma definida — gasosos, líquidos, sombras. Gastly, Grimer, Solosis, Frillish, Litwick, Vanillite. Grupo dos fantasmas e slimes.",
    examples: ["gastly", "grimer", "solosis"],
    pokemons: ["gastly", "grimer", "solosis"],
  },
  {
    id: "group-dragon",
    title: "Grupo Dragon",
    category: "grupo",
    summary:
      "Dragões clássicos e pseudo-dragões. Dratini, Bagon, Deino, Axew, Goomy. Cruzam também com alguns pokémon do grupo Monster.",
    examples: ["dratini", "bagon", "goomy"],
    pokemons: ["dratini", "bagon", "goomy"],
  },
  {
    id: "group-undiscovered",
    title: "Grupo Undiscovered — os que não chocam",
    category: "grupo",
    summary:
      "Bebês (Pichu, Cleffa, Igglybuff…), pré-evoluções e a maioria dos lendários. Não geram ovos. É por isso que só há uma Mewtwo, um Rayquaza, um Zacian. Manaphy é a única exceção lendária conhecida.",
    examples: ["pichu", "mewtwo", "rayquaza"],
    pokemons: ["pichu", "cleffa", "mewtwo"],
  },
  {
    id: "manaphy-egg",
    title: "Manaphy — o único ovo lendário",
    category: "especial",
    summary:
      "Manaphy é o único pokémon lendário que gera ovo. Quando cruza com Ditto na Nursery, produz um Phione. Phione nunca evolui em Manaphy — é uma cria diferente, permanentemente pequena. Só o Manaphy original tem o Heart Swap.",
    pokemons: ["manaphy", "phione"],
  },
  {
    id: "day-care",
    title: "Day Care e Pokémon Nursery",
    category: "especial",
    summary:
      "As instituições que cuidam de pokémon deixados. Do velho casal do Route 5 de Kanto ao complexo Nursery de Galar. Cobram uma taxa por passo e por level. Alguns treinadores fazem 'grinding' deixando pokémon lá dias inteiros.",
    pokemons: ["togepi"],
  },
];
