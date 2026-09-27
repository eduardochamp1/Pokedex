import type { ItemLore } from "../items";

/**
 * Texto em inglês de `ITEMS`, por id. Nome e estreia só aparecem quando o
 * original carrega português.
 */
export const ITEMS_EN: Record<string, Pick<ItemLore, "summary"> & Partial<Pick<ItemLore, "name" | "debut">>> = {
  "master-ball": {
    summary:
      "The perfect Poké Ball — it catches any Pokémon without fail. Developed by Silph Co. in Saffron City, it is the most expensive and rarest product in the world: the player gets exactly one per region, from the company president or a leader. Team Rocket occupied Silph's headquarters precisely to seize the prototype.",
  },
  "gs-ball": {
    summary:
      "A golden Poké Ball with a silver pattern. In the games, it was the item of a Japanese event never released in the West: handed to Kurt in Azalea Town, it would make Celebi appear in Ilex Forest. In the anime, Ash carried it for a whole season without ever managing to open it — the arc was dropped without explanation.",
  },
  "poke-flute": {
    summary:
      "A flute whose melody wakes any sleeping Pokémon. Needed to move the Snorlax blocking Kanto's Routes 12 and 16. You get it from Mr. Fuji in Lavender Town, after the player drives Team Rocket out of Pokémon Tower.",
  },
  "rainbow-wing": {
    summary:
      "Ho-Oh's rainbow feather, left behind when it flies over a pure soul. Taken to the top of the Bell Tower in Ecruteak City, it makes Ho-Oh come down to be challenged. In the anime, Ash finds it in the very first episode — Ho-Oh flies over him before the boy has even caught a Pokémon.",
  },
  "silver-wing": {
    summary:
      "Lugia's silver feather, obtained in Pewter City. It grants access to the depths of the Whirl Islands, where Lugia hides. If the Rainbow Wing is a sign of blessing from the sky, the Silver Wing is the invitation to descend into the sea's abyss.",
  },
  "clear-bell": {
    summary:
      "A crystal bell kept by Ecruteak's Kimono Girls. Its chime echoes in the Bell Tower and calls Ho-Oh. In HeartGold & SoulSilver it was replaced by the Rainbow Wing, but it remains the canonical item of the Gold version.",
  },
  "tidal-bell": {
    summary:
      "The sea counterpart of the Clear Bell. Its sound travels through water and reaches Lugia in the depths of the Whirl Islands. The two bells form Johto's ritual pair: one calls from above, the other from below.",
  },
  "light-stone": {
    summary:
      "The white stone Reshiram fell asleep in after the war between Unova's two brothers split the Original Dragon. It sits on display in Nacrene City's museum for centuries, with nobody knowing what it is — until it awakens before the hero who seeks the truth.",
  },
  "dark-stone": {
    summary:
      "The black counterpart of the Light Stone, where Zekrom slept. It awakens for those who seek ideals instead of truth. In Black, the hero receives Reshiram and N awakens Zekrom; in White, the roles are reversed.",
  },
  "magma-stone": {
    summary:
      "A glowing stone lodged in the heart of Stark Mountain, Sinnoh's volcano. While it stays in place, Heatran lives in the mountain; once it's removed, the Pokémon leaves and the volcano starts to stir. Buck pulls it out — and then has to put it back.",
  },
  "lunar-wing": {
    summary:
      "Cresselia's feather, the only thing able to wake those trapped in Darkrai's endless nightmare. A boy in Canalave City falls asleep in terror; the cure lies on Fullmoon Island, and it leads the player straight to Darkrai on Newmoon Island.",
  },
  "enigma-stone": {
    summary:
      "A Soul Dew fragment from an event. Taken to the Pewter Museum, it turns out to be a pair of eyes that calls Latias or Latios to Southern Island — the island that, in Ruby & Sapphire, only existed on an event card.",
  },
  "sun-flute": {
    summary:
      "One of the two flutes of the Altar of the Sunne, on Poni Island. Played at the altar under the sun, it opens the portal Solgaleo crosses — and through which Lusamine escaped into Ultra Space.",
  },
  "moon-flute": {
    summary:
      "The night counterpart of the Sun Flute, at the Altar of the Moone. It calls Lunala. Together the two flutes are the key to the wormhole linking Alola to Ultra Space — the same technology the Aether Foundation tried to industrialize.",
  },
  "azure-flute": {
    debut: "Diamond & Pearl (2006) — never distributed",
    summary:
      "A blue flute that, played at the top of Mount Coronet, raises a staircase of light up to the Hall of Origin, where Arceus rests. It is programmed into the games, with its own music and a full cutscene — but Nintendo never officially distributed it. It is the most famous item no legitimate player ever obtained.",
  },
  "prison-bottle": {
    summary:
      "An ancient bottle that imprisons Hoopa's true power. Contained, Hoopa is childish and mischievous (Confined); unleashed, it becomes the six-armed giant that razed a whole city a hundred years ago — and that the elders sealed back into the neck of the bottle.",
  },
  "adamant-orb": {
    summary:
      "An ancient orb that boosts Dialga's Dragon and Steel moves. Kept as an offering by the ancient people of Sinnoh. In Legends: Arceus, it is one of the pieces Volo needs to summon the lord of time.",
  },
  "lustrous-orb": {
    summary:
      "Palkia's pearly orb, which strengthens its Dragon and Water moves. It pairs with the Adamant Orb on the Spear Pillar altar — together they are what Team Galactic needed to force time and space to obey.",
  },
  "griseous-orb": {
    summary:
      "A platinum orb that keeps Giratina in its Origin form outside the Distortion World. Without it, Giratina's body readjusts to our world's physical laws and returns to its Altered form. It boosts Ghost and Dragon moves.",
  },
  "red-orb": {
    summary:
      "A relic kept on Mt. Pyre that awakens Groudon. Team Magma stole it to cause the drought that would expand the continents. In Omega Ruby, the orb goes further: it triggers Primal Reversion, returning Groudon to the form it had at the birth of the world.",
  },
  "blue-orb": {
    summary:
      "The Red Orb's counterpart, tied to Kyogre. Stolen by Team Aqua to sink the lands beneath the sea. The two orbs sat side by side at the summit of Mt. Pyre precisely so that neither force would be awakened alone.",
  },
  "jade-orb": {
    summary:
      "Hoenn's third orb, tied to Rayquaza — the arbiter that breaks up the fight between Groudon and Kyogre. It appears in Emerald as a reward after the player stops the cataclysm, completing the trio of orbs.",
  },
  "red-chain": {
    summary:
      "A chain forged from the Red Shards of Sinnoh's three lakes. To make it, Cyrus forcibly extracted the memories of Uxie, Mesprit and Azelf. With it, he chained Dialga and Palkia at the Spear Pillar — until Giratina opened a portal and dragged him into the Distortion World.",
  },
  "dna-splicers": {
    summary:
      "A Team Plasma device designed by Colress. It fuses Kyurem with Reshiram (White Kyurem) or Zekrom (Black Kyurem), partly rebuilding the Original Dragon. The fusion is never perfect — Kyurem is the husk left over from the split, and absorbing its sibling only creates an unstable chimera.",
  },
  "reveal-glass": {
    summary:
      "A mirror that shows the true form of Unova's Kami. Tornadus, Thundurus and Landorus live in their humanoid Incarnate forms; before the mirror, they reveal their Therian forms — bestial, and the ones that appear in the farmers' legends.",
  },
  "zygarde-cube": {
    summary:
      "A scientific cube that stores the Zygarde Cells and Cores scattered across Alola. Zygarde is not an individual: it is a swarm. 10 cells make the 10% Forme; 50, the 50% Forme; with 100 cells and the Core, the Complete Forme — the guardian of ecological balance in its full body.",
  },
  "rusted-sword": {
    summary:
      "The two ancient weapons with which Galar's heroes held back Eternatus on the Darkest Day. Three thousand years later, rusted and displayed as relics in Hammerlocke, they still turn Zacian into the Crowned Sword and Zamazenta into the Crowned Shield.",
  },
  "ogerpon-masks": {
    name: "Ogerpon's masks",
    summary:
      "Four ceremonial masks from Kitakami. Each one changes Ogerpon's secondary type: Water, Fire or Rock. The village's official legend says the Loyal Three were heroes who recovered the masks Ogerpon stole — the truth is the reverse, and the game takes the whole DLC to admit it.",
  },
  "meltan-box": {
    summary:
      "A golden box unlocked by transferring a Pokémon to Let's Go or Pokémon HOME. Activated, it attracts Meltan for half an hour in Pokémon GO. It is the only road to Melmetal: a Meltan from HOME doesn't evolve — only one caught in GO and transferred does.",
  },
  gracidea: {
    summary:
      "A bouquet of flowers that turns Shaymin into its Sky Forme. It only works by day and while Shaymin isn't frozen or asleep — at night, it reverts to its Land Forme on its own. The flowers are a thank-you from a Floaroma florist.",
  },
  "member-card": {
    summary:
      "An event card that opens the door of an inn in Canalave City. Sleeping there, the player dreams of Newmoon Island — and wakes up on it, face to face with Darkrai. Without the card, the island doesn't exist on the map.",
  },
  "oaks-letter": {
    summary:
      "A letter from Professor Oak asking the player to investigate Route 224. At the end of the trail lies the Flower Paradise, where Shaymin live. It is the narrative twin of the Member Card: one leads to the Pokémon of nightmares, the other to the Pokémon of flowers.",
  },
  "secret-key": {
    summary:
      "An event key that unlocks a room in the back of the Team Galactic HQ in Eterna. Inside are appliances that Rotom can possess, one by one — the five alternate forms of the electric ghost Pokémon.",
  },
  "silph-scope": {
    summary:
      "A Silph Co. device that reveals the identity of ghost Pokémon. Without it, Pokémon Tower's floors can't be crossed. With it, the shape on the top floor reveals itself: the Marowak Team Rocket killed while it defended its child.",
  },
  "dowsing-machine": {
    summary:
      "A detector of buried items, called the Itemfinder in the first generations. It is the tool behind half of the Pokémon world's amateur archaeology — from Mt. Moon's fossils to Alola's Zygarde Cells.",
  },
  plates: {
    name: "Arceus's Plates",
    summary:
      "Seventeen stone tablets scattered across Sinnoh, one for every type besides Normal. Held by Arceus, they change its type — because they are fragments of the very substance it shaped the world with. Gathered together, they are the complete inventory of the creation.",
  },
  "mega-stones": {
    summary:
      "Crystals formed when AZ's ultimate weapon went off three thousand years ago and Xerneas's energy condensed into Kalos's rock. Combined with a Key Stone held by a Trainer with a strong enough bond, they produce Mega Evolution.",
  },
  "key-stone": {
    summary:
      "The human half of Mega Evolution. It is set into the Trainer's glove, brooch or bracelet and resonates with the Pokémon's Mega Stone. Without a real emotional bond between the two, the stone doesn't respond — it is the only item in the series that requires an emotional condition.",
  },
  "z-crystals": {
    summary:
      "Elemental crystals kept by the Kahunas and handed over for each Trial passed. Set into the Z-Power Ring, they unleash one Z-Move per battle. Some are exclusive to one species — Pikanium Z only works for Pikachu, and Alolan Meowth has its own.",
  },
  "soul-dew": {
    summary:
      "A crystallized drop found on Southern Island, bound to the souls of Latias and Latios. Held by either of them, it boosts their Psychic and Dragon moves. The item's description says it is the soul of one of the siblings — which makes equipping it uncomfortably literal.",
  },
  "scarlet-violet-book": {
    summary:
      "Field journals by Professors Sada (Scarlet) and Turo (Violet) about Area Zero. They describe the Paradox Pokémon and how the time portal works, interspersed with increasingly unstable personal notes. The player reads them knowing, from the start, that the authors are not alive.",
  },
  "sinnoh-lore-books": {
    name: "The Canalave Library books",
    summary:
      "A collection of myths on the second floor of Canalave's library. They tell of the creation of Dialga, Palkia and Giratina and the origin of Uxie, Mesprit and Azelf. The third volume states that 'humans and Pokémon were one' — the sentence Cyrus read as license to take the universe apart.",
  },
};
