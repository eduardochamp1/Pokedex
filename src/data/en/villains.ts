import type { VillainTeam } from "../villains";

/** Texto em inglês de `VILLAIN_TEAMS`, por id. Nome e líder já são oficiais. */
export const VILLAIN_TEAMS_EN: Record<string, Pick<VillainTeam, "region" | "motivation" | "fate">> = {
  rocket: {
    region: "Kanto / Johto",
    motivation:
      "The classic criminal organization. Sells stolen Pokémon on the black market and experiments with cloning — they were responsible for Mewtwo.",
    fate:
      "Disbanded after Giovanni's defeat. Resurfaces three years later in Johto (Radio Tower), but without its leader.",
  },
  magma: {
    region: "Hoenn",
    motivation:
      "Believes that expanding the land (through Groudon) will give humans more room to evolve.",
    fate:
      "Groudon slips out of control and the world falls into an extreme drought until Rayquaza steps in. Maxie admits his mistake.",
  },
  aqua: {
    region: "Hoenn",
    motivation:
      "Team Magma's direct rival. Wants to expand the oceans (through Kyogre) to restore the natural world as it was before humans.",
    fate: "Kyogre unleashes devastating floods. Archie realizes his utopia was destructive.",
  },
  galactic: {
    region: "Sinnoh",
    motivation:
      "Cyrus wants to destroy the current universe and remake it without emotions — which he sees as the source of all human suffering.",
    fate:
      "He summons Dialga and Palkia at Spear Pillar, but Giratina drags him into the Distortion World, where he wanders forever.",
  },
  plasma: {
    region: "Unova",
    motivation:
      "Publicly preaches freeing Pokémon from humans, with the charismatic N as its public face. Behind the scenes, Ghetsis uses the ideology to seize power.",
    fate:
      "N awakens the Original Dragon but changes his mind once he understands that Trainers and Pokémon can be partners. Ghetsis returns years later with Kyurem.",
  },
  flare: {
    region: "Kalos",
    motivation:
      "Aesthetic elitism. Lysandre believes only the beautiful deserve to live and plans to reactivate AZ's ultimate weapon.",
    fate: "Xerneas or Yveltal is awakened. Lysandre is buried in the ruins of the underground lab.",
  },
  skull: {
    region: "Alola",
    motivation:
      "A gang of dropouts who couldn't get past the Island Challenge. They vandalize towns, but are more pathetic than dangerous — until the Aether Foundation manipulates them.",
    fate:
      "Disbanded after the Ultra Beast crisis. Guzma becomes a Battle Tree mentor; many members reform.",
  },
  aether: {
    region: "Alola",
    motivation:
      "A philanthropic front that actually experiments with Ultra Beasts. Lusamine became so obsessed with Nihilego that she tried to fuse with it.",
    fate: "Saved by her children Gladion and Lillie. The Ultra Beasts are returned to Ultra Space.",
  },
  macro: {
    region: "Galar",
    motivation:
      "The energy corporation that funds the Galar League. Rose learns that the energy will run out in a thousand years and decides to release Eternatus now to solve the problem.",
    fate:
      "Brings about the Darkest Day. The protagonists contain Eternatus with Zacian and Zamazenta. Rose turns himself in to the police.",
  },
  star: {
    region: "Paldea",
    motivation:
      "They aren't villains: they are bullying victims who founded Team Star to protect themselves. The threat of expulsion from the academy sparked the conflict.",
    fate:
      "Reconciled with the Academy. Penny becomes an ally; the leaders of the five bases go back to being regular students.",
  },
};
