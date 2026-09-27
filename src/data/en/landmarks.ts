import type { Landmark, LandmarkKind } from "../landmarks";

export const LANDMARK_KIND_LABELS_EN: Record<LandmarkKind, string> = {
  ilha: "Island",
  ruina: "Ruin",
  caverna: "Cave",
  torre: "Tower",
  montanha: "Mountain",
  floresta: "Forest",
  lago: "Lake",
  marco: "Landmark",
  laboratorio: "Lab",
};

/** Texto em inglês de `LANDMARKS`, por id. Nomes de lugar como nos jogos. */
export const LANDMARKS_EN: Record<string, Pick<Landmark, "name" | "summary">> = {
  "sevii-islands": {
    name: "Sevii Islands",
    summary:
      "An archipelago of nine islands south of Kanto, introduced in FireRed & LeafGreen. The first four open early; the rest only after the National Pokédex. It has ruins with Unown writing, Icefall Cave and the Rocket Warehouse — where Team Rocket tried to regroup after Giovanni's fall.",
  },
  "cinnabar-island": {
    name: "Cinnabar Island",
    summary:
      "A volcanic island that housed the Pokémon Mansion — the lab where Mewtwo was created from Mew's DNA. The burned journals in the building are the only record of the experiment. The volcano erupts between Gen I and Gen II and destroys the town.",
  },
  "seafoam-islands": {
    name: "Seafoam Islands",
    summary:
      "Two twin islands carved by sea currents, with an ice maze underground. Articuno sleeps at the bottom. The inner currents push the player back unless they block the way with boulders — the only hydraulic puzzle of the first generation.",
  },
  "pokemon-tower": {
    name: "Pokémon Tower",
    summary:
      "A seven-story graveyard in Lavender Town. Ghost Pokémon appear as faceless shapes until the player gets the Silph Scope. At the top is the spirit of the Marowak Team Rocket killed for resisting — the only Pokémon in the series the player has to exorcise, not catch.",
  },
  "cerulean-cave": {
    name: "Cerulean Cave",
    summary:
      "A sealed-off cave north of Cerulean City, opened only after the player beats the Elite Four. Mewtwo hides on the lowest level. It is the franchise's first postgame content and remains the model: a closed place, no NPCs, a single tenant.",
  },
  "viridian-forest": {
    name: "Viridian Forest",
    summary:
      "A natural maze between Viridian and Pewter, treated in the anime as a place you walk into and don't know how to leave. It is where most Kanto Trainers catch their first Pokémon — and where Ash caught his Caterpie.",
  },
  "silph-co": {
    name: "Silph Co.",
    summary:
      "An eleven-story corporate headquarters in Saffron City, the world's largest Poké Ball maker. It was occupied by Team Rocket, who wanted the Master Ball prototype. The whole building is a puzzle of teleporters — and Giovanni waits on the top floor.",
  },
  "indigo-plateau": {
    name: "Indigo Plateau",
    summary:
      "The seat of the Pokémon League serving Kanto and Johto at once — the two regions share a single Elite Four. It is where Red beat Blue the same day Blue took the title, the shortest reign in League history.",
  },
  "power-plant": {
    name: "Power Plant",
    summary:
      "A disused plant east of Cerulean, taken over by Electric Pokémon feeding on the leftover current. Zapdos nests inside. In Gen II it runs again to power the Magnet Train — and the part stolen from the generator is what stalls the line until the player gets it back.",
  },
  "tree-of-beginning": {
    name: "Tree of Beginning",
    summary:
      "A living formation in the Kingdom of Rota, made of rock and organic matter, with its own immune system that dissolves intruders. Mew lives at its core. Sir Aaron gave his life to stop a war from destroying it — and his consciousness was sealed in the royal staff for centuries.",
  },
  "whirl-islands": {
    name: "Whirl Islands",
    summary:
      "Four islands ringed by whirlpools between Cianwood and Olivine, crossable only with Whirlpool. At the bottom of the undersea cave lies Lugia's Chamber. The Silver Wing is what brings the Pokémon to the surface.",
  },
  "bell-tower": {
    name: "Bell Tower",
    summary:
      "A ten-story tower in Ecruteak where Ho-Oh used to land. It survived the fire that consumed its twin, the Brass Tower, a hundred and fifty years ago. Bring the Rainbow Wing to the top and Ho-Oh comes down — the only legendary in the series that appears by invitation, not by ambush.",
  },
  "burned-tower": {
    name: "Burned Tower",
    summary:
      "The ruin of the Brass Tower, destroyed by lightning and a fire that killed three Pokémon trapped inside. Ho-Oh revived them as Raikou, Entei and Suicune. When the player goes down to the basement, the three awaken and scatter across Johto — and the hunt for the roamers begins.",
  },
  "sprout-tower": {
    name: "Sprout Tower",
    summary:
      "Violet City's pagoda, over thirty meters tall, held up by a central pillar that legend says was made from a Bellsprout of that same height. The pillar sways nonstop, absorbing earthquakes. The monks who keep it teach that Pokémon and humans grow in the same direction — slowly, and upward.",
  },
  "ilex-forest": {
    name: "Ilex Forest",
    summary:
      "A dense forest west of Azalea, watched over by a shrine to the protector of the woods — Celebi. It is where the GS Ball was meant to be used, and in HeartGold & SoulSilver it is the shrine that sends the player back in time to face Giovanni. Without the runaway Farfetch'd, you can't get through.",
  },
  "ruins-of-alph": {
    name: "Ruins of Alph",
    summary:
      "An archaeological complex with four sealed chambers, each with a mosaic puzzle. Once solved, the floor collapses and releases Unown — the species that is itself an alphabet. The researchers on site admit they don't know whether the Unown wrote the walls or were born from them.",
  },
  "mt-silver": {
    name: "Mt. Silver",
    summary:
      "A mountain on the Kanto–Johto border, with the highest-level wildlife in the whole series. At the summit, in absolute silence, stands Red — who doesn't say a word, battles with a level-80 team and disappears after losing. The franchise's canonical final showdown.",
  },
  "lake-of-rage": {
    name: "Lake of Rage",
    summary:
      "A lake overrun by Magikarp and a red Gyarados. The color isn't natural: Team Rocket set up a radio transmitter in Mahogany Town that forces evolution, and the shiny Gyarados is the side effect. The series' first shiny with a story explanation.",
  },
  "dragons-den": {
    name: "Dragon's Den",
    summary:
      "A cave behind the Blackthorn Gym where the Dragon Clan keeps its rituals. Only those who pass the elder's oral exam — five questions about what it means to be a Trainer — receive the Dragon Fang and the right to train dragons.",
  },
  "sky-pillar": {
    name: "Sky Pillar",
    summary:
      "An ancient tower on an islet in eastern Hoenn, with floors so fragile they collapse if the player pedals slowly. Rayquaza sleeps at the top. When Groudon and Kyogre clash, this is where Wallace brings the player — only the arbiter can separate the two.",
  },
  "cave-of-origin": {
    name: "Cave of Origin",
    summary:
      "A cave beneath Sootopolis, treated by the locals as the place where life in Hoenn began. In Ruby & Sapphire it is where Groudon or Kyogre is found, and in Omega Ruby & Alpha Sapphire where Primal Reversion happens. In Emerald it holds no legendary at all: it is where Wallace discusses Rayquaza's whereabouts. There are no wild Pokémon inside.",
  },
  "mt-pyre": {
    name: "Mt. Pyre",
    summary:
      "A graveyard mountain where Trainers bury their Pokémon. At the summit, an elderly couple kept the Red Orb and the Blue Orb side by side — precisely so that neither force would be awakened alone. Magma and Aqua climb up and each takes one.",
  },
  "sealed-chamber": {
    name: "Sealed Chamber",
    summary:
      "An underwater chamber with a Braille inscription nobody in the game translates for the player. Following the instructions to the letter opens the three Regi tombs — Regirock, Regice and Registeel. The only puzzle in the series that requires material from outside the game to solve.",
  },
  "mirage-island": {
    name: "Mirage Island",
    summary:
      "An island that appears off the coast of Route 130 with a 1-in-65,536 chance per day, comparing a hidden value in the save with a random number. An old man in Pacifidlog spends his days watching the sea, hoping to see it. It is full of Liechi Berries and Wynaut.",
  },
  "southern-island": {
    name: "Southern Island",
    summary:
      "An event islet, reachable only with the Eon Ticket. At its center stands a pedestal with the Soul Dew and one of the Eon siblings — Latias in Ruby, Latios in Sapphire — waiting. In HeartGold & SoulSilver, the Enigma Stone recreates the event.",
  },
  "meteor-falls": {
    name: "Meteor Falls",
    summary:
      "A cave with inner waterfalls where a meteorite fell. It is home to the Bagon and the hideout of Hoenn's Dragon Clan. The fallen stone is what Team Magma tries to steal to speed up Groudon's awakening — and, in ORAS, what nearly brings down an entire asteroid.",
  },
  "new-mauville": {
    name: "New Mauville",
    summary:
      "An underground city built as a housing project and abandoned before anyone moved in, now occupied by Voltorb and Magnemite. The generator is still running, draining Mauville's power — and the player is sent there to shut it down.",
  },
  "mount-coronet": {
    name: "Mount Coronet",
    summary:
      "A mountain range that cuts Sinnoh in two and, according to the myths, the exact point where the world began. It crosses the whole region from north to south. At its highest point stands Spear Pillar; above it, reachable only with the Azure Flute, the Hall of Origin.",
  },
  "spear-pillar": {
    name: "Spear Pillar",
    summary:
      "A platform of broken columns at the summit of Mount Coronet. It was here that Cyrus used the Red Chain to shackle Dialga and Palkia and open his spiritless universe — and from here that Giratina came out of the Distortion World to drag him away.",
  },
  "distortion-world": {
    name: "Distortion World",
    summary:
      "A parallel dimension with no fixed gravity and no flow of time, where Arceus exiled Giratina for its violence. It is the only place in the series where the player walks on walls and ceilings, with no random battles at all — just silence and impossible geometry.",
  },
  "snowpoint-temple": {
    name: "Snowpoint Temple",
    summary:
      "A six-level ice temple — a ground floor and five basements — under Snowpoint City, where the ancients sealed Regigigas. The seal only gives way to whoever brings Hoenn's three Regis in the party — the game requires the player to have completed an entire region first.",
  },
  "turnback-cave": {
    name: "Turnback Cave",
    summary:
      "A maze of identical, randomly generated rooms with three hidden pillars. Finding all three opens the way to Giratina; taking a wrong turn sends the player back to the entrance. The name is literal: the cave exists to make you turn back.",
  },
  "lake-verity": {
    name: "Lake Verity",
    summary:
      "A lake near Twinleaf where Mesprit, the Being of Emotion, lives. Sinnoh's three lakes form a triangle on the map, and the myth says the three spirits living in them hatched from the same Egg.",
  },
  "lake-valor": {
    name: "Lake Valor",
    summary:
      "Sinnoh's central lake, home of Azelf, the Being of Willpower. Team Galactic bombed it to force the spirit to reveal itself — the explosion dried up part of the lake, and it is the point where the organization stops being a gang of thieves and becomes a cosmological threat.",
  },
  "lake-acuity": {
    name: "Lake Acuity",
    summary:
      "A frozen lake in the north, where Uxie, the Being of Knowledge, lives. It is also where Team Galactic defeats the player's rival — the game takes the trouble to show the defeat instead of just mentioning it.",
  },
  "stark-mountain": {
    name: "Stark Mountain",
    summary:
      "An active volcano in the Battle Zone, with a final chamber where the Magma Stone keeps Heatran anchored. Buck removes the stone and the volcano starts to stir — the postgame mission is to convince him to put it back.",
  },
  "fullmoon-island": {
    name: "Fullmoon Island",
    summary:
      "An islet north of Canalave where Cresselia leaves a Lunar Wing — the only cure for the endless nightmare. Getting here requires a boy from the town to be sick with dreams, which only happens because Darkrai lives on the neighboring island.",
  },
  "newmoon-island": {
    name: "Newmoon Island",
    summary:
      "An island that doesn't appear on the map without the Member Card. Covered in permanent fog, it has Darkrai at the center of a clearing. The Pokémon isn't malicious — it causes nightmares simply by existing, as a side effect of its own body.",
  },
  "flower-paradise": {
    name: "Flower Paradise",
    summary:
      "A field of Gracidea at the end of Route 224, reachable only with Oak's Letter. It is the Shaymin colony. The path there runs along a row of signs with messages left by the developers — Diamond & Pearl's hidden thank-you.",
  },
  "solaceon-ruins": {
    name: "Solaceon Ruins",
    summary:
      "An underground network of galleries where Sinnoh's Unown live, with walls covered in their writing. Seeing 26 different forms makes the Ruin Maniac finish the tunnel connecting to Route 214 — and only then do the \"!\" and \"?\" forms appear. It is Sinnoh's echo of the Ruins of Alph.",
  },
  "sinjoh-ruins": {
    name: "Sinjoh Ruins",
    summary:
      "An isolated site reachable only by bringing an Arceus as a companion to the Ruins of Alph, where the Unown open the way. There, Arceus creates before the player an Egg of Dialga, Palkia or Giratina — the only moment in the entire franchise where you watch an act of divine creation.",
  },
  "dragonspiral-tower": {
    name: "Dragonspiral Tower",
    summary:
      "Unova's oldest structure — nobody knows who built it, or when. It is here that the Light Stone or the Dark Stone awakens, and where Team Plasma takes Kyurem to forcibly rebuild the dragon that was once split in two.",
  },
  "relic-castle": {
    name: "Relic Castle",
    summary:
      "A castle buried under the Desert Resort, whose floors descend through quicksand — whoever falls doesn't climb back up. At the bottom is a chamber with Volcarona, and in Black & White it is where you meet Ryoku, one of Team Plasma's Seven Sages. In Black 2 & White 2 the sand fills the core: only the first two floors and Volcarona's room remain, the latter through the Relic Passage.",
  },
  "giant-chasm": {
    name: "Giant Chasm",
    summary:
      "A crater formed by a meteor strike, with an ice cave where Kyurem sleeps. It is the stage of Black 2 & White 2's final showdown: Ghetsis uses the DNA Splicers inside and orders Kyurem to freeze the player — literally.",
  },
  "abyssal-ruins": {
    name: "Abyssal Ruins",
    summary:
      "Ruins at the bottom of Undella's sea, explorable only with Dive and with a step limit — going over it throws the player out. The walls bear a coded script that can only be read with the documents Ghetsis left behind, and even once deciphered it still has to be read backwards.",
  },
  "abundant-shrine": {
    name: "Abundant Shrine",
    summary:
      "A rural shrine dedicated to the Kami — Tornadus, Thundurus and Landorus. Landorus is summoned here once the other two have been caught: the local myth says it comes down to calm its brothers, who destroy the crops.",
  },
  "ns-castle": {
    name: "N's Castle",
    summary:
      "A fortress Ghetsis built in secret, which bursts out of the ground around the Pokémon League, surrounding it. Inside is the playroom where N grew up in isolation — the only room in the castle that explains the villain.",
  },
  "liberty-garden": {
    name: "Liberty Garden",
    summary:
      "An island with a lighthouse near Castelia, reachable through an event. Victini had been sealed in the basement for centuries. Legend says the Pokémon grants victory to whoever has it at their side — and that is why it was locked away, not protected.",
  },
  "ultimate-weapon": {
    name: "Ultimate Weapon",
    summary:
      "A weapon built by AZ three thousand years ago to revive his Floette, killed in the war. It worked — and then he turned it on the world, ending the war by killing everyone. The steel flower lies buried under Geosenge; Lysandre reactivates it.",
  },
  "geosenge-town": {
    name: "Geosenge Town",
    summary:
      "A village ringed by standing stones raised in memory of the dead of AZ's war. Beneath it lie the Ultimate Weapon and Team Flare's HQ. The residents live on top of their own funeral monument without knowing it.",
  },
  "terminus-cave": {
    name: "Terminus Cave",
    summary:
      "An abandoned ore-rail mine, with a final chamber where Zygarde rests in its 50% Forme. The deepest galleries were closed because those who went down didn't come back — and the explanation, at the end of the corridor, is a hundred-meter green serpent.",
  },
  "diamond-domain": {
    name: "Diamond Domain",
    summary:
      "An underground cave in Kalos inhabited by Carbink, with a Diancie at its center producing the diamonds that sustain the ecosystem. It appears in the movie Diancie and the Cocoon of Destruction — the diamond heart is dying and has to be replaced.",
  },
  "pokemon-village": {
    name: "Pokémon Village",
    summary:
      "A clearing hidden behind the Winding Woods where Pokémon abandoned by their Trainers live. They attack humans out of distrust. It is the most melancholy place in Kalos — and it is among its flowers that you find Ditto.",
  },
  "sea-spirits-den": {
    name: "Sea Spirit's Den",
    summary:
      "A small grotto in the north of Azure Bay. One of the three legendary birds appears here after the player crosses paths with it eleven times as it roams Kalos — defeated, it returns to its nest; if the player flees, it goes back to roaming. The grotto's name alludes to Lugia, the birds' leader in the anime, but Lugia isn't here.",
  },
  "lost-hotel": {
    name: "Lost Hotel",
    summary:
      "A ruined luxury hotel on Route 15, occupied by punks and by Trubbish and Garbodor feeding on the piled-up trash. The wrecked hallways are the most direct portrait of Kalos's theme: beauty that aged badly.",
  },
  "melemele-island": {
    name: "Melemele Island",
    summary:
      "The first of Alola's four islands, guarded by Tapu Koko and led by Kahuna Hala. It is where the player arrives, gets their starter from Kukui and takes their first Trial — the system Alola uses instead of Gyms.",
  },
  "akala-island": {
    name: "Akala Island",
    summary:
      "The second island, home of Tapu Lele and Kahuna Olivia. It holds Wela Volcano, the Lush Jungle and, off the coast, Aether Paradise. It is here that the Aether Foundation's philanthropic front starts to crack.",
  },
  "ulaula-island": {
    name: "Ula'ula Island",
    summary:
      "Alola's largest island, home of Tapu Bulu and Kahuna Nanu — a former International Police officer and Looker's old superior, who now leaves Team Skull alone. It has Po Town, taken over by the gang, and the Aether House, the orphanage for abandoned Pokémon.",
  },
  "poni-island": {
    name: "Poni Island",
    summary:
      "The least populated and wildest island, home of Tapu Fini and Kahuna Hapu. It holds the Vast Poni Canyon and, at its end, the Altar of the Sunne and Moone — the door to Ultra Space.",
  },
  "altar-sunne-moone": {
    name: "Altar of the Sunne and Moone",
    summary:
      "A stone altar high in the Vast Poni Canyon, which changes shape with the time of day. Playing the two flutes there opens the wormhole Solgaleo or Lunala crosses — and through which Lusamine vanished chasing the Ultra Beasts.",
  },
  "ruins-of-conflict": {
    name: "Ruins of the Tapus",
    summary:
      "Four shrines, one per island, each named after a concept and with a guardian inside: Conflict and Tapu Koko on Melemele, Life and Tapu Lele on Akala, Abundance and Tapu Bulu on Ula'ula, Hope and Tapu Fini on Poni. The first lies north of the Mahalo Trail.",
  },
  "aether-paradise": {
    name: "Aether Paradise",
    summary:
      "The Aether Foundation's artificial island, presented as a sanctuary for injured Pokémon. The basement floors hold the labs where Lusamine keeps Ultra Beasts frozen and opens wormholes with a captive Cosmog.",
  },
  "mount-lanakila": {
    name: "Mount Lanakila",
    summary:
      "Alola's highest point, covered in snow, where the region's first Pokémon League was built — until then it had none. Necrozma appears here in Ultra Sun & Ultra Moon, after being driven out of Ultra Megalopolis.",
  },
  "exeggutor-island": {
    name: "Exeggutor Island",
    summary:
      "An islet off Poni, declared a nature reserve, covered in Alolan Exeggutor — the regional form with an absurdly long neck that exists because Alola's sun never stops. It is a visual gag the game takes seriously as a biome.",
  },
  "ultra-space": {
    name: "Ultra Space",
    summary:
      "A set of dimensions linked to ours by wormholes, each with its own physics and climate — Ultra Jungle, Ultra Desert, Ultra Ruin, Ultra Megalopolis. The Ultra Beasts come from there, and the Ultra Recon Squad crosses over to warn about Necrozma.",
  },
  "slumbering-weald": {
    name: "Slumbering Weald",
    summary:
      "A permanently misty forest near Postwick, where the player and Hop meet, on the very first day, two silhouettes nobody believes ever existed. They are Zacian and Zamazenta — and the game waits twenty hours to confirm it.",
  },
  "energy-plant": {
    name: "Energy Plant",
    summary:
      "A facility Chairman Rose built under Hammerlocke to draw infinite energy from the source of the Darkest Day. He switches it on a thousand years ahead of time out of fear of a future energy crisis — and wakes Eternatus in the middle of the championship final.",
  },
  hammerlocke: {
    name: "Hammerlocke",
    summary:
      "A fortified city built around a medieval castle. The stadium is the largest building in town and hides Macro Cosmos's Energy Plant, one elevator ride from the lobby. The castle museum displays the Rusted Sword and the Rusted Shield, treated as decoration until they stop being that.",
  },
  "isle-of-armor": {
    name: "Isle of Armor",
    summary:
      "An island south of Galar with the dojo of master Mustard, a former Champion. Training there earns you Kubfu, which becomes a Single Strike or Rapid Strike Style Urshifu — the choice is final and made in one of two towers.",
  },
  "crown-tundra": {
    name: "Crown Tundra",
    summary:
      "An arctic region to the north, run by Peony like an amateur expedition. It brings together the Regis, the legendary birds in their Galarian forms and the legend of the steed king — Calyrex, who lost his horse and his kingdom, and wants both back.",
  },
  freezington: {
    name: "Freezington",
    summary:
      "A tiny village in the Crown Tundra that worships Calyrex as the King of Bountiful Harvests. At the center of the square stands a statue of it, broken — and giving Calyrex back what it lost literally means fixing it.",
  },
  wyndon: {
    name: "Wyndon",
    summary:
      "Galar's most populous city, in the far north, where the Gym Challenge ends. North of the square stands Rose Tower — Rose's office, home to all of Macro Cosmos's subsidiaries. It is from there that the chairman leaves in the middle of the final to switch on the Energy Plant in Hammerlocke.",
  },
  "glimwood-tangle": {
    name: "Glimwood Tangle",
    summary:
      "A permanently dark forest between Stow-on-Side and Ballonlea. The trail is lit by glowing mushrooms scattered across the ground — touching one makes it glow brighter and open a wider circle of light. The Japanese name is literal: Forest of the Luminous Maze.",
  },
  "stow-on-side": {
    name: "Stow-on-Side",
    summary:
      "A mountain village that grew around an ancient mural, at the top of two flights of stairs. Bede tries to destroy it looking for Wishing Stars and knocks it down — and the fallen wall reveals a hidden chamber with statues of Zacian, Zamazenta and Galar's first kings.",
  },
  turffield: {
    name: "Turffield",
    summary:
      "The rural village of Galar's first Gym, with a huge geoglyph on a hillside to the west: a gigantic Pokémon under a whirl of darkness. It is the Darkest Day drawn on the ground long before the game says what it was — and it can only be seen whole from the top of the neighboring hill.",
  },
  "area-zero": {
    name: "Area Zero",
    summary:
      "A gigantic crater at the center of Paldea, surrounded by walls and four abandoned research stations. At the bottom lies a biome that matches no era — because species from the remote past and the distant future live side by side.",
  },
  "zero-lab": {
    name: "Zero Lab",
    summary:
      "A facility at the bottom of Area Zero where Sada or Turo built the time machine and the AI that took on their identity. The final showdown is against the hologram of a dead scientist who refuses to accept being switched off.",
  },
  "glaseado-mountain": {
    name: "Glaseado Mountain",
    summary:
      "A snowy range crossing northern Paldea, with Grusha's Ice Gym at the top. It is where altitude changes the wildlife most abruptly on the open map: Cetitan and Cryogonal appear as soon as the snow begins.",
  },
  kitakami: {
    name: "Kitakami",
    summary:
      "A rural land visited on a school trip, with a yearly festival celebrating the Loyal Three as heroes who defeated an ogre. The official version is reversed: the ogre was Ogerpon, and the heroes were the thieves.",
  },
  "blueberry-academy": {
    name: "Blueberry Academy",
    summary:
      "A school inside an undersea dome in Unova, with four artificial biomes built for field training. It is where Terapagos is found — and where Paldea's academic fellowship gets a foreign mirror.",
  },
  mesagoza: {
    name: "Mesagoza",
    summary:
      "Paldea's largest city, at the region's geographic center — and the most populous in the entire Pokémon world, as far as anyone knows. Two staircases climb from the central square to the academy, and it is while climbing them, between two fights with Team Star, that the player receives their Tera Orb.",
  },
  "paldea-academy": {
    name: "Naranja / Uva Academy",
    summary:
      "The school at the top of Mesagoza — Naranja in Scarlet, Uva in Violet — and sister school of Blueberry, at the bottom of Unova's sea. Director Clavell gives every student an independent study project: the Treasure Hunt. And he makes it clear that the Great Crater of Paldea is off limits to all of them.",
  },
  "casseroya-lake": {
    name: "Casseroya Lake",
    summary:
      "A large lake in northwestern Paldea, with islets and the Socarrat Trail inside it. It is home to the False Dragon Titan, which is neither a dragon nor a single Pokémon: Dondozo does the work, and the one in charge is the Tatsugiri tucked in its mouth.",
  },
  "asado-desert": {
    name: "Asado Desert",
    summary:
      "A desert covering much of the West Province and swallowing the city of Cascarrafa. It is home to the Quaking Earth Titan — Great Tusk in Scarlet, Iron Treads in Violet: the same niche filled by a creature from the remote past or the distant future, depending on the version.",
  },
  "alfornada-cavern": {
    name: "Alfornada Cavern",
    summary:
      "A passage in the southwest linking the South Province to Alfornada overland — the route for those who don't want to face the False Dragon Titan to get there. In the postgame it becomes Groudon's lair, which appears here after Snacksworth hands over the right snack.",
  },
};
