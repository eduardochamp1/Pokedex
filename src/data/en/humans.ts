import type { HumanCategory, HumanLegend } from "../humans";

export const HUMAN_CATEGORY_LABELS_EN: Record<HumanCategory, string> = {
  heroi: "Ancient heroes",
  professor: "Professors",
  vilao: "Villains",
  champion: "Champions",
  rival: "Rivals and supporting cast",
};

/**
 * Texto em inglês de `HUMAN_LEGENDS`, pelo nome **em português** (a chave do
 * verbete). Quando o nome também está em português, ele vem traduzido aqui.
 */
export const HUMAN_LEGENDS_EN: Record<
  string,
  Pick<HumanLegend, "role" | "region" | "summary"> & Partial<Pick<HumanLegend, "name">>
> = {
  "Sir Aaron": {
    role: "Guardian of the Kingdom of Rota",
    region: "Kanto (ancient legends)",
    summary:
      "An ancestral Aura Guardian. He gave his own life to save the Tree of Beginning, together with his Lucario. His consciousness was sealed in the royal staff for centuries.",
  },
  AZ: {
    role: "The immortal king of Kalos",
    region: "Kalos (3,000 years ago)",
    summary:
      "The king of Kalos who lost his Floette in the war and built the ultimate weapon. He was punished with immortality — he wandered the centuries until he found his lost Floette again.",
  },
  "Rei de Galar": {
    name: "King of Galar",
    role: "Hero of the Darkest Day",
    region: "Galar (3,000 years ago)",
    summary:
      "Two nameless brothers used the swords and shields of Zacian and Zamazenta to hold back Eternatus when it fell from the sky. Galar's official history lies about who the real hero was.",
  },
  "Professor Samuel Oak": {
    role: "Pioneer of Pokémon research",
    region: "Kanto (Pallet Town)",
    summary:
      "The first modern professor. He developed the Pokédex — a revolutionary device that catalogued hundreds of species for the first time. He discovered Mew on his expeditions. Mentor to most of Kanto's Trainers.",
  },
  "Professor Elm": {
    role: "Breeding expert",
    region: "Johto (New Bark Town)",
    summary:
      "Oak's pupil. He discovered that Pokémon breed and hatch from Eggs. His research revealed baby Pokémon such as Pichu, Cleffa and Igglybuff — evolution in reverse, never seen before.",
  },
  "Professor Birch": {
    role: "Habitat scholar",
    region: "Hoenn (Littleroot Town)",
    summary:
      "Field research instead of the lab. His first Trainer saved him from a pack of wild Poochyena — an iconic moment that became a regional legend.",
  },
  "Professor Rowan": {
    role: "Authority on evolution",
    region: "Sinnoh (Sandgem Town)",
    summary:
      "He was Oak's mentor. His studies on evolution revealed new evolved forms unknown until then — Rhyperior, Magmortar, Electivire, Weavile, Yanmega.",
  },
  "Professora Juniper": {
    name: "Professor Juniper",
    role: "Origins of Pokémon",
    region: "Unova (Nuvema Town)",
    summary:
      "The first female professor of the main series. She studies the ancestral origins of Pokémon — how they came into the world. She works alongside her father (also a professor).",
  },
  "Professor Sycamore": {
    role: "Mega Evolution expert",
    region: "Kalos (Lumiose City)",
    summary:
      "He rediscovered Mega Evolution after centuries of oblivion. He handed out Mega Stones to Trainers once they proved themselves.",
  },
  "Professor Kukui": {
    role: "Z-Move scholar",
    region: "Alola",
    summary:
      "He studies the power of Z-Moves and the bond between Trainer and Pokémon. He founded Alola's first Pokémon League. Behind the scenes, he is the Masked Royal — a secret wrestler.",
  },
  "Professora Magnolia": {
    name: "Professor Magnolia",
    role: "Dynamax pioneer",
    region: "Galar",
    summary:
      "She discovered the Dynamax phenomenon at Galar's Power Spots. She works with her granddaughter Sonia investigating the region's legends — including the truth about the Darkest Day.",
  },
  "Professores Sada e Turo": {
    name: "Professors Sada and Turo",
    role: "Researchers of time",
    region: "Paldea (Area Zero)",
    summary:
      "Sada studied the past (Scarlet), Turo the future (Violet). Both died in Area Zero, leaving digital copies — AI — that carried on their research until their children destroyed them.",
  },
  Cyrus: {
    role: "Leader of Team Galactic",
    region: "Sinnoh",
    summary:
      "A heartless man who sought to destroy the universe and remake it without emotions. He summoned Dialga and Palkia at the top of Mount Coronet — but Giratina took him into the Distortion World, where he remains to this day.",
  },
  "N (Natural Harmonia Gropius)": {
    role: "King of Team Plasma",
    region: "Unova",
    summary:
      "Raised in isolation by Ghetsis to free every Pokémon from humans. He awakened the Original Dragon — Zekrom or Reshiram — and challenged the Champion, but was convinced that his own philosophy was broken.",
  },
  Ghetsis: {
    role: "The true leader of Team Plasma",
    region: "Unova",
    summary:
      "The real antagonist behind N. After his defeat, he returns with Kyurem — the empty husk of the Original Dragon — to try to rule Unova by brute force.",
  },
  Lysandre: {
    role: "Leader of Team Flare",
    region: "Kalos",
    summary:
      "A millionaire who believed only the beautiful deserved to live. He reactivated AZ's ultimate weapon to wipe out the rest of the world. Xerneas or Yveltal decided the outcome.",
  },
  Lusamine: {
    role: "President of the Aether Foundation",
    region: "Alola",
    summary:
      "Obsessed with the Ultra Beasts, she opens the portal to Ultra Space using Cosmog as a battery. She fuses with Nihilego and becomes an alien creature, until her son Gladion saves her.",
  },
  Volo: {
    role: "Hisui's traveling merchant",
    region: "Hisui (ancient Sinnoh)",
    summary:
      "Apparently a friendly trader, Volo is actually obsessed with luring Arceus to Hisui. A descendant of Cyrus's clan, he tries to destroy the world with Giratina to force Arceus to create a new one.",
  },
  Red: {
    role: "Kanto's silent Champion",
    region: "Kanto",
    summary:
      "A boy from Pallet Town who became the strongest Champion in history at 11. After beating the Elite Four, he climbed Mt. Silver and vanished. He only returns to the human world to challenge whoever reaches his peak.",
  },
  "Blue Oak": {
    role: "Former Champion, Prof. Oak's grandson",
    region: "Kanto",
    summary:
      "He was Champion for a day — defeated by Red before the player even arrived. He became Viridian City's Gym Leader. Red's eternal rival, always one step behind.",
  },
  Silver: {
    role: "Johto rival, Giovanni's son",
    region: "Johto",
    summary:
      "Giovanni's (Team Rocket) abandoned son, who stole a starter Pokémon from Prof. Elm. He hated weakness and believed only power mattered — until a beginner Trainer humbled him and he changed his ways.",
  },
  "Steven Stone": {
    role: "Hoenn Champion, geologist",
    region: "Hoenn",
    summary:
      "Son of the Devon Corporation's president. A Steel-type specialist. He was the first human to stabilize Mega Evolution, with his Metagross as a synchronized partner.",
  },
  Cynthia: {
    role: "Sinnoh Champion, historian",
    region: "Sinnoh",
    summary:
      "The strongest Champion in the series. Besides training, she studies Sinnoh mythology and the Solaceon Ruins. Her Garchomp is legendary among players of every generation.",
  },
  Alder: {
    role: "Unova's wandering Champion",
    region: "Unova",
    summary:
      "He lost his partner Pokémon years before the games and began traveling Unova in silence. N doesn't defeat him — N convinces him. He returns as a mentor after the events of Black/White.",
  },
  Iris: {
    role: "Unova Champion (BW2)",
    region: "Unova",
    summary:
      "A girl from the Village of Dragons. She replaced Alder as Champion after intense training with dragons. A Dragon-type specialist; her Haxorus is feared.",
  },
  Diantha: {
    role: "Kalos Champion, actress",
    region: "Kalos",
    summary:
      "A film star and Champion. Her Gardevoir can Mega Evolve, making for one of the most elegant duels in the series. She lives torn between the stage and the League.",
  },
  Hau: {
    role: "Alola's first Champion",
    region: "Alola",
    summary:
      "Grandson of Kahuna Hala. Cheerful and friendly, he became the first official Champion of Alola's new League after beating the protagonist at the opening ceremony.",
  },
  Leon: {
    role: "Galar's unbeaten Champion",
    region: "Galar",
    summary:
      "He never lost an official battle. Galar's national superstar, he appears on stadium screens with his Gigantamax Charizard. Hop's older brother.",
  },
  Nemona: {
    role: "Rival and Champion of Paldea",
    region: "Paldea",
    summary:
      "Obsessed with battling. She has been a Champion of the Paldea League since childhood — she is so strong she has to hold back so as not to humiliate her opponents. She loves finding worthy rivals.",
  },
  Lillie: {
    role: "Aether Foundation student",
    region: "Alola",
    summary:
      "Lusamine's daughter. She rescued Cosmog (whom she called Nebby) from her mother's experiments. After the Ultra Beast crisis, she traveled to Kanto to heal her mother from the trauma.",
  },
  Gladion: {
    role: "Former Team Skull, Lusamine's son",
    region: "Alola",
    summary:
      "He ran away from home with Type: Null (now Silvally) to escape Lusamine's experiments. He briefly sided with Team Skull. After the crisis, he becomes an interim Champion.",
  },
  Hop: {
    role: "Galar rival, the Champion's brother",
    region: "Galar",
    summary:
      "Leon's younger brother. He spent much of the journey in his brother's shadow. He found his own path by investigating the Darkest Day alongside the protagonist.",
  },
  Marnie: {
    role: "Galar idol and rival",
    region: "Galar",
    summary:
      "From Spikemuth. Sister of Piers (Gym Leader). She has a legion of fans (Team Yell) who follow her everywhere. A Dark-type specialist.",
  },
};
