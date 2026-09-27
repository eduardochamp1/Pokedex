import type { Region } from "../regions";

/**
 * Texto em inglês de `REGIONS`, por id. Líderes de ginásio e cidades já são
 * nomes oficiais; entram aqui só os campos que carregam português — inclusive
 * os parênteses de campeão e professor.
 */
export const REGIONS_EN: Record<
  string,
  Pick<Region, "inspiration" | "summary"> & Partial<Pick<Region, "champion" | "professor" | "eliteFour" | "cities">>
> = {
  kanto: {
    inspiration: "The Kantō region, Japan",
    summary:
      "The region where it all began. Home of the first 151 Pokémon, Prof. Oak and the rivalry between Red and Blue. The stage for Mewtwo's creation and the end of the original Team Rocket.",
    champion: "Blue Oak (after Red disappeared)",
  },
  johto: {
    inspiration: "The Kansai and Tōkai regions, Japan",
    summary:
      "A land of traditions and ancient towers. Ho-Oh and Lugia rule the skies; the Legendary Beasts roam its routes. Ecruteak, Violet City and the Bell Tower keep the ancestral history of the Pokémon world.",
    champion: "Lance (also part of Kanto's Elite Four)",
  },
  hoenn: {
    inspiration: "Kyūshū, Japan",
    summary:
      "A volcanic island, half land and half sea. The setting of the clash between Groudon and Kyogre, with Rayquaza as mediator. The three Regis sleep in sealed chambers scattered across the land.",
    champion: "Steven Stone / Wallace (rotation)",
  },
  sinnoh: {
    inspiration: "Hokkaidō, Japan",
    summary:
      "The region of creation. Mount Coronet rises at its center, where Dialga and Palkia were first summoned. The three lakes shelter Uxie, Mesprit and Azelf. Arceus slumbers in the Hall of Origin.",
  },
  unova: {
    inspiration: "New York, USA",
    summary:
      "The first region based on a Western metropolis. Home of the dragons of Truth and Ideals — Reshiram and Zekrom — and of the legendary Swords of Justice: Cobalion, Terrakion, Virizion and Keldeo.",
  },
  kalos: {
    inspiration: "France",
    summary:
      "The cradle of beauty and eternal life. Xerneas and Yveltal embody the cycle of existence, while Zygarde watches over the balance of order. The setting of the tragic story of King AZ and his ultimate weapon.",
  },
  alola: {
    inspiration: "Hawaii, USA",
    summary:
      "A tropical archipelago split into four islands, each protected by a Tapu. Here the portal to Ultra Space opens — the source of Necrozma, the Ultra Beasts and Cosmog's celestial family.",
    champion: "Hau (new League after the protagonist)",
  },
  galar: {
    inspiration: "United Kingdom",
    summary:
      "The land of Dynamax and Gigantamax. Home of Eternatus — the threat from the stars — and of the legendary canine swords Zacian and Zamazenta. The Isle of Armor and the Crown Tundra hold Kubfu, Calyrex and the power of winter.",
    professor: "Magnolia (and Sonia)",
    champion: "Leon (unbeaten until the protagonist)",
    eliteFour: ["No traditional Elite Four — the Champion Cup is the final tournament"],
  },
  paldea: {
    inspiration: "Spain and Portugal",
    summary:
      "An open region cut by the Great Crater of Paldea. In the depths of Area Zero, the past (Koraidon) and the future (Miraidon) collide. The four Treasures of Ruin hang over its lands like a cursed memory.",
    champion: "Geeta (Top Champion) / Nemona (candidate)",
    cities: [
      "Cabo Poco",
      "Los Platos",
      "Mesagoza",
      "Cortondo",
      "Alfornada",
      "Cascarrafa",
      "Levincia",
      "Zapapico",
      "Medali",
      "Montenevera",
      "Porto Marinada",
      "Area Zero",
    ],
  },
};
