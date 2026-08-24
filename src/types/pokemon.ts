export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: { name: string; url: string };
}

export interface ShowdownSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
}

export interface OfficialArtwork {
  front_default: string | null;
  front_shiny: string | null;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    ["official-artwork"]?: OfficialArtwork;
    dream_world?: { front_default: string | null };
    home?: { front_default: string | null; front_shiny: string | null };
    showdown?: ShowdownSprites;
  };
}

export interface PokemonVariety {
  is_default: boolean;
  pokemon: { name: string; url: string };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: { name: string; url: string };
  version: { name: string; url: string };
}

export interface Genus {
  genus: string;
  language: { name: string; url: string };
}

export interface PokemonSpecies {
  name: string;
  evolution_chain: { url: string };
  varieties: PokemonVariety[];
  generation: { name: string; url: string };
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  habitat: { name: string; url: string } | null;
  color: { name: string; url: string };
}

export interface EvolutionNode {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionNode;
}

export interface GenerationResponse {
  id: number;
  name: string;
  main_region: { name: string; url: string };
  pokemon_species: { name: string; url: string }[];
}

export interface Pokemon {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  height: number;
  weight: number;
  species: { name: string; url: string };
}
