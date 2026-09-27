import type { BreedingEntry } from "../breeding";

/** Texto em inglês de `BREEDING`, por id. */
export const BREEDING_EN: Record<string, Pick<BreedingEntry, "title" | "summary">> = {
  basics: {
    title: "How Eggs work",
    summary:
      "Discovered by Prof. Elm in Johto. Two Pokémon from the same Egg Group (of opposite genders, or one of them a Ditto) left at the Nursery/Day Care produce an Egg. The Egg hatches after enough steps — faster with the Flame Body or Magma Armor ability on the team.",
  },
  ditto: {
    title: "Ditto — the universal parent",
    summary:
      "Ditto is the only Pokémon that breeds with any other (except the Undiscovered group). Its malleable DNA lets it transform into any partner. It is the universal breeder — without it, we'd never hatch the breedable legendaries.",
  },
  "egg-moves": {
    title: "Egg Moves — inheriting moves",
    summary:
      "Some moves can only be learned at birth. The parent passes these moves on to the child — if the parent knows it, the Egg inherits it. Certain moves only exist through breeding: Aqua Jet on Marill, Belly Drum on Azumarill, Wish on Togepi.",
  },
  "hidden-ability": {
    title: "Hidden Abilities and maternal inheritance",
    summary:
      "If the female has a Hidden Ability, the Egg has a 60% chance to inherit it. Ditto can pass it on regardless of gender since Gen 6. Some HAs are absurdly rare — Speed Boost on Torchic, Adaptability on Eevee, Contrary on Snivy.",
  },
  masuda: {
    title: "The Masuda method — hunting shinies",
    summary:
      "Named after Junichi Masuda. If the two parents come from games in different languages (e.g. one JP + one EN), the shiny odds rise from 1/4096 to 1/682. Combined with the Shiny Charm, they reach 1/512. It changed competitive shiny hunting forever.",
  },
  incense: {
    title: "Incense — the rare Eggs it reveals",
    summary:
      "Some baby Pokémon only hatch when the parent holds a specific Incense during breeding. Without the incense, the Egg produces the parent's species. E.g. Munchlax (Full Incense), Bonsly (Rock Incense), Wynaut (Lax Incense), Mime Jr. (Odd Incense).",
  },
  "group-monster": {
    title: "Monster group",
    summary:
      "Large Pokémon with a classic reptilian or mammalian look. It includes the Grass-type starters and several dragon Pokémon from before the Dragon group. They breed with each other without Ditto.",
  },
  "group-water1": {
    title: "Water 1 group",
    summary:
      "Amphibians, turtles, aquatic mammals and light crustaceans. The most versatile of the water Egg Groups. Squirtle, Psyduck, Poliwag and Lapras breed freely with one another.",
  },
  "group-water2": {
    title: "Water 2 group",
    summary:
      "True fish. Magikarp, Feebas, Basculin, Wailmer and Alomomola. Compatible only with their own group (and Ditto).",
  },
  "group-water3": {
    title: "Water 3 group",
    summary:
      "Crustaceans and primitive sea life. Krabby, Corsola, Corphish, Clauncher. They only breed within their own group.",
  },
  "group-bug": {
    title: "Bug group",
    summary:
      "Every Bug-type Pokémon. One of the largest groups. Caterpie, Weedle, Wurmple, Volbeat, Illumise, Volcarona.",
  },
  "group-flying": {
    title: "Flying group",
    summary: "Birds and classic flying Pokémon. Pidgey, Farfetch'd, Swablu, Wingull, Rufflet.",
  },
  "group-field": {
    title: "Field group",
    summary:
      "The most varied group — mammals, felines, rodents, canines. Eevee, Growlithe, Vulpix, Rattata, Meowth, Ponyta, Snorlax. They breed with each other easily.",
  },
  "group-fairy": {
    title: "Fairy group",
    summary:
      "Cute, fairy-like Pokémon. Clefairy, Jigglypuff, Togepi, Mareep, Marill (also Water 1), Snubbull, Ralts.",
  },
  "group-human-like": {
    title: "Human-Like group",
    summary:
      "Bipedal humanoid Pokémon. Machop, Abra, Hitmonlee/Hitmonchan/Hitmontop, Jynx, Mr. Mime, Gardevoir/Gallade, Lucario, Buneary.",
  },
  "group-mineral": {
    title: "Mineral group",
    summary:
      "Rocks, crystals and mineral formations. Geodude, Onix, Voltorb, Magnemite (also Amorphous?), Roggenrola, Bronzor. They only swap Eggs among themselves.",
  },
  "group-amorphous": {
    title: "Amorphous group",
    summary:
      "Pokémon with no fixed shape — gaseous, liquid, shadowy. Gastly, Grimer, Solosis, Frillish, Litwick, Vanillite. The group of ghosts and slimes.",
  },
  "group-dragon": {
    title: "Dragon group",
    summary:
      "Classic dragons and pseudo-dragons. Dratini, Bagon, Deino, Axew, Goomy. They also breed with some Monster-group Pokémon.",
  },
  "group-undiscovered": {
    title: "Undiscovered group — the ones that don't hatch",
    summary:
      "Babies (Pichu, Cleffa, Igglybuff…), pre-evolutions and most legendaries. They produce no Eggs. That is why there is only one Mewtwo, one Rayquaza, one Zacian. Manaphy is the only known legendary exception.",
  },
  "manaphy-egg": {
    title: "Manaphy — the only legendary Egg",
    summary:
      "Manaphy is the only legendary Pokémon that produces an Egg. When it breeds with Ditto at the Nursery, it produces a Phione. Phione never evolves into Manaphy — it is a different, permanently small offspring. Only the original Manaphy has Heart Swap.",
  },
  "day-care": {
    title: "Day Care and the Pokémon Nursery",
    summary:
      "The places that look after Pokémon left in their care. From the old couple on Kanto's Route 5 to Galar's Nursery complex. They charge a fee per step and per level. Some Trainers grind by leaving Pokémon there for days.",
  },
};
