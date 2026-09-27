import type { Battle } from "../battles";

/** Texto em inglês de `BATTLES`, por id. */
export const BATTLES_EN: Record<
  string,
  Pick<Battle, "title" | "location" | "era" | "contenders" | "outcome" | "summary">
> = {
  "az-vs-world": {
    title: "AZ vs the world — the ultimate weapon",
    location: "Geosenge Town · Kalos",
    era: "Human kingdoms (3,000 years ago)",
    contenders: ["AZ", "The known world"],
    outcome: "Kalos devastated. AZ cursed with immortality.",
    summary:
      "Soldiers took AZ's Floette and spent it as a weapon in the Kalos war. Years later, when he got its body back, the king built the ultimate weapon with Xerneas's energy and managed to bring it back to life — and then turned that same weapon on the armies. Floette saw what he had done and left; the machine made AZ immortal to carry that alone.",
  },
  "volo-vs-arceus": {
    title: "Volo confronts Arceus",
    location: "Spear Pillar (Hisui) · ancient Sinnoh",
    era: "Hisui (ancient Sinnoh)",
    contenders: ["Volo (with Giratina)", "Protagonist (with Arceus)"],
    outcome: "Volo defeated; his obsession lingers on in the Distortion World.",
    summary:
      "A merchant of the Ginkgo Guild and a worshipper of Arceus, Volo claims to descend from Sinnoh's ancient people. He tries to force Arceus to come down and remake the world by destroying it with Giratina. Hisui's protagonist, having caught Arceus, stops him in an epic battle on the Spear Pillar of centuries past.",
  },
  "red-vs-blue": {
    title: "Red vs Blue — the Champion's Hall",
    location: "Indigo Plateau · Kanto",
    era: "Modern era",
    contenders: ["Red", "Blue Oak"],
    outcome: "Red wins; Blue loses the Champion title in less than 24 hours.",
    summary:
      "Blue beat the Elite Four minutes before Red arrived. At 11, Red defeated the reigning Champion with Pikachu, Charizard, Venusaur, Blastoise, Snorlax and Espeon. The fastest turn from coronation to dethronement in history.",
  },
  "gold-vs-red": {
    title: "Gold vs Red — atop Mt. Silver",
    location: "Mt. Silver · Kanto/Johto border",
    era: "Modern era",
    contenders: ["Gold", "Red"],
    outcome: "Gold wins — Red's only recorded defeat.",
    summary:
      "Three years after his coronation, Red lives in silence on the coldest peak on the border. Gold, Johto's new Champion, climbs the mountain to challenge him. The battle happens without a single word — just six Pokémon against six in the freezing wind.",
  },
  "silver-vs-champion": {
    title: "Silver vs Lance — redemption",
    location: "Indigo Plateau · Kanto",
    era: "Modern era",
    contenders: ["Silver", "Lance"],
    outcome: "Silver loses — but finds a new reason to battle.",
    summary:
      "Giovanni's abandoned son, Silver trained on hatred alone until he faced Lance. The defeat made him see that without bonds with his Pokémon he would never be strong. He went home ready to start over, and disappears from the player's view soon after.",
  },
  "steven-vs-wallace": {
    title: "Steven Stone vs Wallace — Hoenn's succession",
    location: "Sootopolis City · Hoenn",
    era: "Modern era",
    contenders: ["Steven Stone", "Wallace"],
    outcome: "Wallace takes over; Steven goes back to geological research.",
    summary:
      "After the Delta Episode, Steven gives up the title to devote himself to studying Mega Stones. Wallace, then a Gym Leader, is the natural successor. There was no ceremony: Steven simply stops defending the title, and whoever meets the challenger at the end of the League is now Wallace.",
  },
  "cynthia-vs-cyrus": {
    title: "Cynthia vs Cyrus — Spear Pillar",
    location: "Mount Coronet · Sinnoh",
    era: "Modern era",
    contenders: ["Cynthia", "Cyrus"],
    outcome: "Cyrus is defeated; Giratina drags him into the Distortion World.",
    summary:
      "At the top of Mount Coronet, Cyrus summons Dialga and Palkia to remake the universe without emotions. Cynthia, an expert in Sinnoh mythology, confronts him alongside the protagonist. Giratina emerges from the Distortion World to punish the heresy — and takes Cyrus with it.",
  },
  "n-vs-alder": {
    title: "N vs Alder — the dragons' speech",
    location: "Route 10 · Unova",
    era: "Modern era",
    contenders: ["N", "Alder"],
    outcome: "Alder is defeated and withdraws in dismay.",
    summary:
      "Alder is Unova's wandering Champion. N confronts him on a deserted route with Zoroark casting illusions. Alder's defeat shakes the whole League — Team Plasma's message is taken seriously for the first time.",
  },
  "champion-vs-n": {
    title: "Champion vs N — the glass castle",
    location: "N's Castle · Unova",
    era: "Modern era",
    contenders: ["Protagonist", "N"],
    outcome: "N is convinced — his philosophy was incomplete.",
    summary:
      "N raises a colossal castle around the League overnight. If the protagonist loses, every Pokémon will be set free; if they win, N will accept that Trainer and Pokémon can be partners. Reshiram and Zekrom decide the battle of the ages.",
  },
  "ghetsis-vs-champion": {
    title: "Ghetsis and the fused Kyurem",
    location: "Giant Chasm · Unova",
    era: "Modern era",
    contenders: ["Ghetsis", "Protagonist (BW2)"],
    outcome: "Ghetsis is defeated; Team Plasma disbands for good.",
    summary:
      "Years after N left, Ghetsis returns with Kyurem — able to fuse with Reshiram (White Kyurem) or Zekrom (Black Kyurem). His ambition was to freeze Unova and rule from the throne. The protagonist defeats him; Ghetsis is arrested, but never tried.",
  },
  "lysandre-final": {
    title: "Lysandre and the weapon's reactivation",
    location: "Team Flare HQ · Kalos",
    era: "Modern era",
    contenders: ["Lysandre", "Protagonist"],
    outcome: "Lysandre is buried under the ruins of the lab.",
    summary:
      "Lysandre reactivated AZ's ultimate weapon to wipe out the rest of the world. Only the beautiful would survive. Xerneas or Yveltal was awakened to stop the process. Lysandre collapses along with the underground lab, his body never found.",
  },
  "lusamine-final": {
    title: "Lusamine fused with Nihilego",
    location: "Ultra Space · Alola",
    era: "Modern era",
    contenders: ["Lusamine + Nihilego", "Gladion, Lillie and the protagonist"],
    outcome: "Lusamine is saved by her own children.",
    summary:
      "Obsessed with the Ultra Beasts, Lusamine fuses with Nihilego. Her children Gladion and Lillie chase her through the Ultra Wormhole until they tear her out of the fusion. She is taken to Kanto for treatment; Aether keeps running without their mother.",
  },
  "eternatus-galar": {
    title: "Eternatus and the Darkest Day",
    location: "Hammerlocke Stadium · Galar",
    era: "Modern era",
    contenders: ["Eternatus", "Zacian, Zamazenta and the protagonist"],
    outcome: "Eternatus is sealed (again) and caught.",
    summary:
      "Chairman Rose brings on the Darkest Day to solve the energy problem a thousand years ahead of time. Eternatus emerges from the meteor. Hop wields Zamazenta while the protagonist wields Zacian. The swords strike the space dragon.",
  },
  "leon-champion-cup": {
    title: "Leon vs the protagonist — the Champion Cup",
    location: "Wyndon Stadium · Galar",
    era: "Modern era",
    contenders: ["Leon", "Protagonist"],
    outcome: "Leon loses for the first time on national television.",
    summary:
      "Leon had never lost. His face was on every billboard in Galar. Gigantamax Charizard was unbeatable — until the protagonist, a rookie Leon himself had endorsed, broke the streak. Leon retires in peace and becomes a mentor at the Battle Tower.",
  },
  "nemona-final": {
    title: "Nemona vs the protagonist — the grand finale",
    location: "Naranja/Uva Academy · Paldea",
    era: "Modern era",
    contenders: ["Nemona", "Protagonist"],
    outcome: "Nemona finally faces an opponent who can match her.",
    summary:
      "Nemona was so strong she held back the whole journey so as not to humiliate the protagonist. Only after the protagonist became a Champion of Paldea (Path of Victory) could Nemona unleash her full strength — on the Academy's roof, at sunset.",
  },
  "ia-sada-turo": {
    title: "Sada/Turo's AI — Area Zero",
    location: "Area Zero · Paldea",
    era: "Modern era",
    contenders: ["Sada/Turo AI + Paradox Pokémon", "Arven, Nemona, Penny and the protagonist"],
    outcome: "The AI is destroyed; Koraidon/Miraidon is freed from its submission.",
    summary:
      "After the professors' actual deaths, an AI carried on the plans. It spent years feeding Paradox Pokémon from the past/future. Arven, the professor's son, had to destroy the AI — literally killing his father's digital memory — to close the time portal.",
  },
};
