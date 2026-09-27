/**
 * Os times dos oito líderes de ginásio, como os jogos os definem.
 *
 * Gerado de `src/data/trainer_parties.h` das decompilações (pret/pokeemerald:
 * sParty_Roxanne1 … sParty_Juan1, a primeira luta de cada um; pret/pokefirered:
 * sParty_LeaderBrock … sParty_LeaderGiovanni). O IV do arquivo vai de 0 a 255 e
 * vale igual para os seis status; aqui já está em 0–31 (`iv × 31 / 255`) — em
 * FR/LG os líderes têm IV 0. Tipos da espécie e tipo/poder de cada golpe são os
 * de Gen 3, tirados da PokéAPI por `past_types` e `past_values`.
 *
 * Ruby/Sapphire têm times um pouco diferentes (e Wallace no lugar de Juan):
 * não estão aqui.
 */
import type { TypeName } from "./typeMatchups";

export interface GymMove {
  slug: string;
  type: TypeName;
  /** `null`: golpe de status ou de dano fixo. */
  power: number | null;
}

export interface GymMon {
  national: number;
  species: string;
  level: number;
  /** 0–31, o mesmo nos seis status. */
  iv: number;
  types: TypeName[];
  item?: string;
  moves: GymMove[];
}

export interface Gym {
  leader: string;
  city: string;
  type: TypeName;
  party: GymMon[];
}

export const EMERALD_GYMS: Gym[] = [
  {
    leader: "Roxanne",
    city: "Rustboro City",
    type: "rock",
    party: [
      { national: 74, species: "geodude", level: 12, iv: 12, types: ["rock","ground"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "defense-curl", type: "normal", power: null }, { slug: "rock-throw", type: "rock", power: 50 }, { slug: "rock-tomb", type: "rock", power: 50 }] },
      { national: 74, species: "geodude", level: 12, iv: 12, types: ["rock","ground"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "defense-curl", type: "normal", power: null }, { slug: "rock-throw", type: "rock", power: 50 }, { slug: "rock-tomb", type: "rock", power: 50 }] },
      { national: 299, species: "nosepass", level: 15, iv: 24, types: ["rock"], item: "oran-berry", moves: [{ slug: "block", type: "normal", power: null }, { slug: "harden", type: "normal", power: null }, { slug: "tackle", type: "normal", power: 35 }, { slug: "rock-tomb", type: "rock", power: 50 }] },
    ],
  },
  {
    leader: "Brawly",
    city: "Dewford Town",
    type: "fighting",
    party: [
      { national: 66, species: "machop", level: 16, iv: 12, types: ["fighting"], moves: [{ slug: "karate-chop", type: "fighting", power: 50 }, { slug: "low-kick", type: "fighting", power: null }, { slug: "seismic-toss", type: "fighting", power: null }, { slug: "bulk-up", type: "fighting", power: null }] },
      { national: 307, species: "meditite", level: 16, iv: 12, types: ["fighting","psychic"], moves: [{ slug: "focus-punch", type: "fighting", power: 150 }, { slug: "light-screen", type: "psychic", power: null }, { slug: "reflect", type: "psychic", power: null }, { slug: "bulk-up", type: "fighting", power: null }] },
      { national: 296, species: "makuhita", level: 19, iv: 24, types: ["fighting"], item: "sitrus-berry", moves: [{ slug: "arm-thrust", type: "fighting", power: 15 }, { slug: "vital-throw", type: "fighting", power: 70 }, { slug: "reversal", type: "fighting", power: null }, { slug: "bulk-up", type: "fighting", power: null }] },
    ],
  },
  {
    leader: "Wattson",
    city: "Mauville City",
    type: "electric",
    party: [
      { national: 100, species: "voltorb", level: 20, iv: 24, types: ["electric"], moves: [{ slug: "rollout", type: "rock", power: 30 }, { slug: "spark", type: "electric", power: 65 }, { slug: "self-destruct", type: "normal", power: 200 }, { slug: "shock-wave", type: "electric", power: 60 }] },
      { national: 309, species: "electrike", level: 20, iv: 24, types: ["electric"], moves: [{ slug: "shock-wave", type: "electric", power: 60 }, { slug: "leer", type: "normal", power: null }, { slug: "quick-attack", type: "normal", power: 40 }, { slug: "howl", type: "normal", power: null }] },
      { national: 82, species: "magneton", level: 22, iv: 26, types: ["electric","steel"], moves: [{ slug: "supersonic", type: "normal", power: null }, { slug: "shock-wave", type: "electric", power: 60 }, { slug: "thunder-wave", type: "electric", power: null }, { slug: "sonic-boom", type: "normal", power: null }] },
      { national: 310, species: "manectric", level: 24, iv: 30, types: ["electric"], item: "sitrus-berry", moves: [{ slug: "quick-attack", type: "normal", power: 40 }, { slug: "thunder-wave", type: "electric", power: null }, { slug: "shock-wave", type: "electric", power: 60 }, { slug: "howl", type: "normal", power: null }] },
    ],
  },
  {
    leader: "Flannery",
    city: "Lavaridge Town",
    type: "fire",
    party: [
      { national: 322, species: "numel", level: 24, iv: 24, types: ["fire","ground"], moves: [{ slug: "overheat", type: "fire", power: 140 }, { slug: "take-down", type: "normal", power: 90 }, { slug: "magnitude", type: "ground", power: null }, { slug: "sunny-day", type: "fire", power: null }] },
      { national: 218, species: "slugma", level: 24, iv: 24, types: ["fire"], moves: [{ slug: "overheat", type: "fire", power: 140 }, { slug: "smog", type: "poison", power: 20 }, { slug: "light-screen", type: "psychic", power: null }, { slug: "sunny-day", type: "fire", power: null }] },
      { national: 323, species: "camerupt", level: 26, iv: 30, types: ["fire","ground"], moves: [{ slug: "overheat", type: "fire", power: 140 }, { slug: "tackle", type: "normal", power: 35 }, { slug: "sunny-day", type: "fire", power: null }, { slug: "attract", type: "normal", power: null }] },
      { national: 324, species: "torkoal", level: 29, iv: 30, types: ["fire"], item: "white-herb", moves: [{ slug: "overheat", type: "fire", power: 140 }, { slug: "sunny-day", type: "fire", power: null }, { slug: "body-slam", type: "normal", power: 85 }, { slug: "attract", type: "normal", power: null }] },
    ],
  },
  {
    leader: "Norman",
    city: "Petalburg City",
    type: "normal",
    party: [
      { national: 327, species: "spinda", level: 27, iv: 24, types: ["normal"], moves: [{ slug: "teeter-dance", type: "normal", power: null }, { slug: "psybeam", type: "psychic", power: 65 }, { slug: "facade", type: "normal", power: 70 }, { slug: "encore", type: "normal", power: null }] },
      { national: 288, species: "vigoroth", level: 27, iv: 24, types: ["normal"], moves: [{ slug: "slash", type: "normal", power: 70 }, { slug: "facade", type: "normal", power: 70 }, { slug: "encore", type: "normal", power: null }, { slug: "feint-attack", type: "dark", power: 60 }] },
      { national: 264, species: "linoone", level: 29, iv: 24, types: ["normal"], moves: [{ slug: "slash", type: "normal", power: 70 }, { slug: "belly-drum", type: "normal", power: null }, { slug: "facade", type: "normal", power: 70 }, { slug: "headbutt", type: "normal", power: 70 }] },
      { national: 289, species: "slaking", level: 31, iv: 30, types: ["normal"], item: "sitrus-berry", moves: [{ slug: "counter", type: "fighting", power: null }, { slug: "yawn", type: "normal", power: null }, { slug: "facade", type: "normal", power: 70 }, { slug: "feint-attack", type: "dark", power: 60 }] },
    ],
  },
  {
    leader: "Winona",
    city: "Fortree City",
    type: "flying",
    party: [
      { national: 333, species: "swablu", level: 29, iv: 25, types: ["normal","flying"], moves: [{ slug: "perish-song", type: "normal", power: null }, { slug: "mirror-move", type: "flying", power: null }, { slug: "safeguard", type: "normal", power: null }, { slug: "aerial-ace", type: "flying", power: 60 }] },
      { national: 357, species: "tropius", level: 29, iv: 25, types: ["grass","flying"], moves: [{ slug: "sunny-day", type: "fire", power: null }, { slug: "aerial-ace", type: "flying", power: 60 }, { slug: "solar-beam", type: "grass", power: 120 }, { slug: "synthesis", type: "grass", power: null }] },
      { national: 279, species: "pelipper", level: 30, iv: 25, types: ["water","flying"], moves: [{ slug: "water-gun", type: "water", power: 40 }, { slug: "supersonic", type: "normal", power: null }, { slug: "protect", type: "normal", power: null }, { slug: "aerial-ace", type: "flying", power: 60 }] },
      { national: 227, species: "skarmory", level: 31, iv: 26, types: ["steel","flying"], moves: [{ slug: "sand-attack", type: "ground", power: null }, { slug: "fury-attack", type: "normal", power: 15 }, { slug: "steel-wing", type: "steel", power: 70 }, { slug: "aerial-ace", type: "flying", power: 60 }] },
      { national: 334, species: "altaria", level: 33, iv: 31, types: ["dragon","flying"], item: "oran-berry", moves: [{ slug: "earthquake", type: "ground", power: 100 }, { slug: "dragon-breath", type: "dragon", power: 60 }, { slug: "dragon-dance", type: "dragon", power: null }, { slug: "aerial-ace", type: "flying", power: 60 }] },
    ],
  },
  {
    leader: "Tate & Liza",
    city: "Mossdeep City",
    type: "psychic",
    party: [
      { national: 344, species: "claydol", level: 41, iv: 30, types: ["ground","psychic"], moves: [{ slug: "earthquake", type: "ground", power: 100 }, { slug: "ancient-power", type: "rock", power: 60 }, { slug: "psychic", type: "psychic", power: 90 }, { slug: "light-screen", type: "psychic", power: null }] },
      { national: 178, species: "xatu", level: 41, iv: 30, types: ["psychic","flying"], moves: [{ slug: "psychic", type: "psychic", power: 90 }, { slug: "sunny-day", type: "fire", power: null }, { slug: "confuse-ray", type: "ghost", power: null }, { slug: "calm-mind", type: "psychic", power: null }] },
      { national: 337, species: "lunatone", level: 42, iv: 30, types: ["rock","psychic"], item: "sitrus-berry", moves: [{ slug: "light-screen", type: "psychic", power: null }, { slug: "psychic", type: "psychic", power: 90 }, { slug: "hypnosis", type: "psychic", power: null }, { slug: "calm-mind", type: "psychic", power: null }] },
      { national: 338, species: "solrock", level: 42, iv: 30, types: ["rock","psychic"], item: "sitrus-berry", moves: [{ slug: "sunny-day", type: "fire", power: null }, { slug: "solar-beam", type: "grass", power: 120 }, { slug: "psychic", type: "psychic", power: 90 }, { slug: "flamethrower", type: "fire", power: 95 }] },
    ],
  },
  {
    leader: "Juan",
    city: "Sootopolis City",
    type: "water",
    party: [
      { national: 370, species: "luvdisc", level: 41, iv: 24, types: ["water"], moves: [{ slug: "water-pulse", type: "water", power: 60 }, { slug: "attract", type: "normal", power: null }, { slug: "sweet-kiss", type: "normal", power: null }, { slug: "flail", type: "normal", power: null }] },
      { national: 340, species: "whiscash", level: 41, iv: 24, types: ["water","ground"], moves: [{ slug: "rain-dance", type: "water", power: null }, { slug: "water-pulse", type: "water", power: 60 }, { slug: "amnesia", type: "psychic", power: null }, { slug: "earthquake", type: "ground", power: 100 }] },
      { national: 364, species: "sealeo", level: 43, iv: 24, types: ["ice","water"], moves: [{ slug: "encore", type: "normal", power: null }, { slug: "body-slam", type: "normal", power: 85 }, { slug: "aurora-beam", type: "ice", power: 65 }, { slug: "water-pulse", type: "water", power: 60 }] },
      { national: 342, species: "crawdaunt", level: 43, iv: 24, types: ["water","dark"], moves: [{ slug: "water-pulse", type: "water", power: 60 }, { slug: "crabhammer", type: "water", power: 90 }, { slug: "taunt", type: "dark", power: null }, { slug: "leer", type: "normal", power: null }] },
      { national: 230, species: "kingdra", level: 46, iv: 30, types: ["water","dragon"], item: "chesto-berry", moves: [{ slug: "water-pulse", type: "water", power: 60 }, { slug: "double-team", type: "normal", power: null }, { slug: "ice-beam", type: "ice", power: 95 }, { slug: "rest", type: "psychic", power: null }] },
    ],
  },
];

export const FRLG_GYMS: Gym[] = [
  {
    leader: "Brock",
    city: "Pewter City",
    type: "rock",
    party: [
      { national: 74, species: "geodude", level: 12, iv: 0, types: ["rock","ground"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "defense-curl", type: "normal", power: null }] },
      { national: 95, species: "onix", level: 14, iv: 0, types: ["rock","ground"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "bind", type: "normal", power: 15 }, { slug: "rock-tomb", type: "rock", power: 50 }] },
    ],
  },
  {
    leader: "Misty",
    city: "Cerulean City",
    type: "water",
    party: [
      { national: 120, species: "staryu", level: 18, iv: 0, types: ["water"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "harden", type: "normal", power: null }, { slug: "recover", type: "normal", power: null }, { slug: "water-pulse", type: "water", power: 60 }] },
      { national: 121, species: "starmie", level: 21, iv: 0, types: ["water","psychic"], moves: [{ slug: "swift", type: "normal", power: 60 }, { slug: "recover", type: "normal", power: null }, { slug: "rapid-spin", type: "normal", power: 20 }, { slug: "water-pulse", type: "water", power: 60 }] },
    ],
  },
  {
    leader: "Lt. Surge",
    city: "Vermilion City",
    type: "electric",
    party: [
      { national: 100, species: "voltorb", level: 21, iv: 0, types: ["electric"], moves: [{ slug: "sonic-boom", type: "normal", power: null }, { slug: "tackle", type: "normal", power: 35 }, { slug: "screech", type: "normal", power: null }, { slug: "shock-wave", type: "electric", power: 60 }] },
      { national: 25, species: "pikachu", level: 18, iv: 0, types: ["electric"], moves: [{ slug: "quick-attack", type: "normal", power: 40 }, { slug: "thunder-wave", type: "electric", power: null }, { slug: "double-team", type: "normal", power: null }, { slug: "shock-wave", type: "electric", power: 60 }] },
      { national: 26, species: "raichu", level: 24, iv: 0, types: ["electric"], moves: [{ slug: "quick-attack", type: "normal", power: 40 }, { slug: "thunder-wave", type: "electric", power: null }, { slug: "double-team", type: "normal", power: null }, { slug: "shock-wave", type: "electric", power: 60 }] },
    ],
  },
  {
    leader: "Erika",
    city: "Celadon City",
    type: "grass",
    party: [
      { national: 71, species: "victreebel", level: 29, iv: 0, types: ["grass","poison"], moves: [{ slug: "stun-spore", type: "grass", power: null }, { slug: "acid", type: "poison", power: 40 }, { slug: "poison-powder", type: "poison", power: null }, { slug: "giga-drain", type: "grass", power: 60 }] },
      { national: 114, species: "tangela", level: 24, iv: 0, types: ["grass"], moves: [{ slug: "poison-powder", type: "poison", power: null }, { slug: "constrict", type: "normal", power: 10 }, { slug: "ingrain", type: "grass", power: null }, { slug: "giga-drain", type: "grass", power: 60 }] },
      { national: 45, species: "vileplume", level: 29, iv: 0, types: ["grass","poison"], moves: [{ slug: "sleep-powder", type: "grass", power: null }, { slug: "acid", type: "poison", power: 40 }, { slug: "stun-spore", type: "grass", power: null }, { slug: "giga-drain", type: "grass", power: 60 }] },
    ],
  },
  {
    leader: "Koga",
    city: "Fuchsia City",
    type: "poison",
    party: [
      { national: 109, species: "koffing", level: 37, iv: 0, types: ["poison"], moves: [{ slug: "self-destruct", type: "normal", power: 200 }, { slug: "sludge", type: "poison", power: 65 }, { slug: "smokescreen", type: "normal", power: null }, { slug: "toxic", type: "poison", power: null }] },
      { national: 89, species: "muk", level: 39, iv: 0, types: ["poison"], moves: [{ slug: "minimize", type: "normal", power: null }, { slug: "sludge", type: "poison", power: 65 }, { slug: "acid-armor", type: "poison", power: null }, { slug: "toxic", type: "poison", power: null }] },
      { national: 109, species: "koffing", level: 37, iv: 0, types: ["poison"], moves: [{ slug: "self-destruct", type: "normal", power: 200 }, { slug: "sludge", type: "poison", power: 65 }, { slug: "smokescreen", type: "normal", power: null }, { slug: "toxic", type: "poison", power: null }] },
      { national: 110, species: "weezing", level: 43, iv: 0, types: ["poison"], moves: [{ slug: "tackle", type: "normal", power: 35 }, { slug: "sludge", type: "poison", power: 65 }, { slug: "smokescreen", type: "normal", power: null }, { slug: "toxic", type: "poison", power: null }] },
    ],
  },
  {
    leader: "Sabrina",
    city: "Saffron City",
    type: "psychic",
    party: [
      { national: 64, species: "kadabra", level: 38, iv: 0, types: ["psychic"], moves: [{ slug: "psybeam", type: "psychic", power: 65 }, { slug: "reflect", type: "psychic", power: null }, { slug: "future-sight", type: "psychic", power: 80 }, { slug: "calm-mind", type: "psychic", power: null }] },
      { national: 122, species: "mr-mime", level: 37, iv: 0, types: ["psychic"], moves: [{ slug: "barrier", type: "psychic", power: null }, { slug: "psybeam", type: "psychic", power: 65 }, { slug: "baton-pass", type: "normal", power: null }, { slug: "calm-mind", type: "psychic", power: null }] },
      { national: 49, species: "venomoth", level: 38, iv: 0, types: ["bug","poison"], moves: [{ slug: "psybeam", type: "psychic", power: 65 }, { slug: "gust", type: "flying", power: 40 }, { slug: "leech-life", type: "bug", power: 20 }, { slug: "supersonic", type: "normal", power: null }] },
      { national: 65, species: "alakazam", level: 43, iv: 0, types: ["psychic"], moves: [{ slug: "psychic", type: "psychic", power: 90 }, { slug: "recover", type: "normal", power: null }, { slug: "future-sight", type: "psychic", power: 80 }, { slug: "calm-mind", type: "psychic", power: null }] },
    ],
  },
  {
    leader: "Blaine",
    city: "Cinnabar Island",
    type: "fire",
    party: [
      { national: 58, species: "growlithe", level: 42, iv: 0, types: ["fire"], moves: [{ slug: "bite", type: "dark", power: 60 }, { slug: "roar", type: "normal", power: null }, { slug: "take-down", type: "normal", power: 90 }, { slug: "fire-blast", type: "fire", power: 120 }] },
      { national: 77, species: "ponyta", level: 40, iv: 0, types: ["fire"], moves: [{ slug: "stomp", type: "normal", power: 65 }, { slug: "bounce", type: "flying", power: 85 }, { slug: "fire-spin", type: "fire", power: 15 }, { slug: "fire-blast", type: "fire", power: 120 }] },
      { national: 78, species: "rapidash", level: 42, iv: 0, types: ["fire"], moves: [{ slug: "stomp", type: "normal", power: 65 }, { slug: "bounce", type: "flying", power: 85 }, { slug: "fire-spin", type: "fire", power: 15 }, { slug: "fire-blast", type: "fire", power: 120 }] },
      { national: 59, species: "arcanine", level: 47, iv: 0, types: ["fire"], moves: [{ slug: "bite", type: "dark", power: 60 }, { slug: "roar", type: "normal", power: null }, { slug: "take-down", type: "normal", power: 90 }, { slug: "fire-blast", type: "fire", power: 120 }] },
    ],
  },
  {
    leader: "Giovanni",
    city: "Viridian City",
    type: "ground",
    party: [
      { national: 111, species: "rhyhorn", level: 45, iv: 0, types: ["ground","rock"], moves: [{ slug: "take-down", type: "normal", power: 90 }, { slug: "rock-blast", type: "rock", power: 25 }, { slug: "scary-face", type: "normal", power: null }, { slug: "earthquake", type: "ground", power: 100 }] },
      { national: 51, species: "dugtrio", level: 42, iv: 0, types: ["ground"], moves: [{ slug: "slash", type: "normal", power: 70 }, { slug: "sand-tomb", type: "ground", power: 15 }, { slug: "mud-slap", type: "ground", power: 20 }, { slug: "earthquake", type: "ground", power: 100 }] },
      { national: 31, species: "nidoqueen", level: 44, iv: 0, types: ["poison","ground"], moves: [{ slug: "body-slam", type: "normal", power: 85 }, { slug: "double-kick", type: "fighting", power: 30 }, { slug: "poison-sting", type: "poison", power: 15 }, { slug: "earthquake", type: "ground", power: 100 }] },
      { national: 34, species: "nidoking", level: 45, iv: 0, types: ["poison","ground"], moves: [{ slug: "thrash", type: "normal", power: 90 }, { slug: "double-kick", type: "fighting", power: 30 }, { slug: "poison-sting", type: "poison", power: 15 }, { slug: "earthquake", type: "ground", power: 100 }] },
      { national: 111, species: "rhyhorn", level: 50, iv: 0, types: ["ground","rock"], moves: [{ slug: "take-down", type: "normal", power: 90 }, { slug: "rock-blast", type: "rock", power: 25 }, { slug: "scary-face", type: "normal", power: null }, { slug: "earthquake", type: "ground", power: 100 }] },
    ],
  },
];
