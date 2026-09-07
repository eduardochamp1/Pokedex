// Traduções PT-BR para strings que vêm da PokéAPI em inglês.

const TYPES_PT: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

const HABITATS_PT: Record<string, string> = {
  cave: "Caverna",
  forest: "Floresta",
  grassland: "Campo",
  mountain: "Montanha",
  rare: "Raro",
  "rough-terrain": "Terreno acidentado",
  sea: "Mar",
  urban: "Urbano",
  "waters-edge": "Beira d'água",
};

// Mapeia palavras comuns de genus em inglês para PT-BR
// PokéAPI tem "X Pokémon" (ex: "Seed Pokémon"); resultado será "Pokémon X" (ex: "Pokémon Semente")
const GENUS_WORDS_PT: Record<string, string> = {
  Seed: "Semente",
  Lizard: "Lagarto",
  Flame: "Chama",
  Tiny: "Minúsculo",
  Turtle: "Tartaruga",
  Shellfish: "Marisco",
  Worm: "Verme",
  Cocoon: "Casulo",
  Butterfly: "Borboleta",
  Hairy: "Peludo",
  Poison: "Veneno",
  Bee: "Abelha",
  Bird: "Pássaro",
  Mouse: "Rato",
  Fox: "Raposa",
  Balloon: "Balão",
  Bat: "Morcego",
  Weed: "Erva",
  Flower: "Flor",
  Mushroom: "Cogumelo",
  Fairy: "Fada",
  Superpower: "Superpoderoso",
  Rock: "Pedra",
  Fire: "Fogo",
  Fish: "Peixe",
  Water: "Água",
  Dragon: "Dragão",
  Genetic: "Genético",
  Psi: "Psíquico",
  New: "Novo",
  Species: "Espécie",
  Legendary: "Lendário",
  Mythical: "Mítico",
  Time: "Tempo",
  Space: "Espaço",
  Renegade: "Renegado",
  Original: "Original",
  Alpha: "Alfa",
  Emotion: "Emoção",
  Knowledge: "Conhecimento",
  Willpower: "Vontade",
  Continent: "Continente",
  Sea: "Mar",
  Sky: "Céu",
  Aura: "Aura",
  Steel: "Aço",
  Ice: "Gelo",
  Iron: "Ferro",
  Cavalry: "Cavalaria",
  Blade: "Lâmina",
  Sword: "Espada",
  Shield: "Escudo",
  Guardian: "Guardião",
  Boss: "Chefe",
  Gigantic: "Gigantesco",
  Colossal: "Colossal",
  Ancient: "Ancestral",
  Beast: "Fera",
  Life: "Vida",
  Destruction: "Destruição",
  Order: "Ordem",
  Sun: "Sol",
  Moon: "Lua",
  Prism: "Prisma",
  Solitary: "Solitário",
  Twinkle: "Cintilação",
  Grass: "Planta",
  Lava: "Lava",
  Ghost: "Fantasma",
  Shadow: "Sombra",
  Dark: "Sombrio",
  Light: "Luz",
  Wave: "Onda",
  Storm: "Tempestade",
  Thunder: "Trovão",
  Bolt: "Raio",
  Electric: "Elétrico",
  Cloud: "Nuvem",
  Wind: "Vento",
  Snow: "Neve",
  Freeze: "Congelamento",
  Mineral: "Mineral",
  Wisdom: "Sabedoria",
  Feeling: "Sentimento",
  Restraint: "Contenção",
  Volcano: "Vulcão",
  Mountain: "Montanha",
};

export function tType(name: string | undefined | null): string {
  if (!name) return "";
  return TYPES_PT[name.toLowerCase()] ?? name;
}

export function tHabitat(name: string | undefined | null): string {
  if (!name) return "";
  return HABITATS_PT[name.toLowerCase()] ?? name;
}

// Se o genus veio em inglês (ex: "Seed Pokémon"), tenta converter para
// "Pokémon Semente". Se qualquer palavra não estiver no mapa, retorna o original.
export function tGenus(genus: string | undefined | null): string {
  if (!genus) return "";
  // Já é PT-BR? Se começa com "Pokémon", provável.
  if (/^pok[eé]mon\s/i.test(genus)) return genus;
  // Padrão "X Pokémon" — converte
  const m = genus.match(/^(.+?)\s+Pok[eé]mon$/i);
  if (m) {
    const descriptor = m[1].trim();
    // Tenta traduzir cada palavra do descriptor
    const words = descriptor.split(/\s+/);
    const translated = words.map((w) => GENUS_WORDS_PT[w] ?? w);
    return `Pokémon ${translated.join(" ")}`;
  }
  return genus;
}
