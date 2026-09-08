import type { WikiSourced } from "../lib/wiki";

export interface GameGeneration extends WikiSourced {
  id: number;
  roman: string;
  year: number;
  region: string;
  mainGames: string[];
  newPokemons: number;
  totalAfter: number;
  gimmick: string;
  signature: string[];
  color: string;
}

export const GAME_GENERATIONS: GameGeneration[] = [
  {
    id: 1,
    wiki: "Generation I", roman: "I", year: 1996, region: "Kanto",
    mainGames: ["Red", "Blue", "Yellow"],
    newPokemons: 151, totalAfter: 151,
    gimmick: "O início — 15 tipos, sem habilidades, sem items segurados.",
    signature: ["mewtwo", "mew"], color: "#dc0a2d",
  },
  {
    id: 2,
    wiki: "Generation II", roman: "II", year: 1999, region: "Johto",
    mainGames: ["Gold", "Silver", "Crystal"],
    newPokemons: 100, totalAfter: 251,
    gimmick: "Ciclo dia/noite, tipos Dark e Steel, criação de ovos e breeding.",
    signature: ["lugia", "ho-oh", "celebi"], color: "#c48d3a",
  },
  {
    id: 3,
    wiki: "Generation III", roman: "III", year: 2002, region: "Hoenn",
    mainGames: ["Ruby", "Sapphire", "Emerald"],
    newPokemons: 135, totalAfter: 386,
    gimmick: "Habilidades, natures, contests, batalhas duplas.",
    signature: ["groudon", "kyogre", "rayquaza"], color: "#a83a2c",
  },
  {
    id: 4,
    wiki: "Generation IV", roman: "IV", year: 2006, region: "Sinnoh",
    mainGames: ["Diamond", "Pearl", "Platinum"],
    newPokemons: 107, totalAfter: 493,
    gimmick: "Divisão física/especial por move (não mais por tipo), Wi-Fi via DS.",
    signature: ["dialga", "palkia", "giratina", "arceus"], color: "#3a6cb0",
  },
  {
    id: 5,
    wiki: "Generation V", roman: "V", year: 2010, region: "Unova",
    mainGames: ["Black", "White", "Black 2", "White 2"],
    newPokemons: 156, totalAfter: 649,
    gimmick: "Nenhum pokémon anterior aparece antes do pós-game — reset completo.",
    signature: ["reshiram", "zekrom", "kyurem"], color: "#1a1a1a",
  },
  {
    id: 6,
    wiki: "Generation VI", roman: "VI", year: 2013, region: "Kalos",
    mainGames: ["X", "Y"],
    newPokemons: 72, totalAfter: 721,
    gimmick: "Modelos 3D, Mega Evoluções, tipo Fairy.",
    signature: ["xerneas", "yveltal", "zygarde"], color: "#c8ab74",
  },
  {
    id: 7,
    wiki: "Generation VII", roman: "VII", year: 2016, region: "Alola",
    mainGames: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    newPokemons: 88, totalAfter: 809,
    gimmick: "Z-Moves, formas regionais Alolan, Ilhas com Kahunas.",
    signature: ["solgaleo", "lunala", "necrozma"], color: "#f7b32b",
  },
  {
    id: 8,
    wiki: "Generation VIII", roman: "VIII", year: 2019, region: "Galar",
    mainGames: ["Sword", "Shield", "Arceus (Hisui)", "Brilliant Diamond/Shining Pearl"],
    newPokemons: 96, totalAfter: 905,
    gimmick: "Dynamax/Gigantamax, Wild Area, Hisuian forms em Legends: Arceus.",
    signature: ["zacian", "zamazenta", "eternatus", "calyrex"], color: "#3d5a80",
  },
  {
    id: 9,
    wiki: "Generation IX", roman: "IX", year: 2022, region: "Paldea",
    mainGames: ["Scarlet", "Violet"],
    newPokemons: 120, totalAfter: 1025,
    gimmick: "Mundo aberto, Terastalization, três histórias paralelas.",
    signature: ["koraidon", "miraidon", "terapagos"], color: "#e63946",
  },
];
