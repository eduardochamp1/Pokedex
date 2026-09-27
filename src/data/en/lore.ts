import type { LoreEvent } from "../lore";

/** As eras da cronologia, na forma exata em que aparecem em `LORE_EVENTS`. */
export const ERAS_EN: Record<string, string> = {
  "Antes do tempo": "Before time",
  "Criação do universo": "Creation of the universe",
  "Formação do mundo": "Formation of the world",
  "Era antiga": "Ancient era",
  "Reinos humanos": "Human kingdoms",
  "Passado e futuro": "Past and future",
};

/**
 * Texto em inglês de `LORE_EVENTS`, pelo **título em português** — o evento
 * não tem id. Renomear um título sem atualizar aqui quebra o teste de
 * sincronia, que é o que se quer. A era sai de `ERAS_EN`.
 */
export const LORE_EVENTS_EN: Record<string, Pick<LoreEvent, "title" | "body">> = {
  "O Ovo Original e o vazio": {
    title: "The Original Egg and the void",
    body:
      "From the vortex of chaos, Arceus, the original Pokémon, emerges inside a cosmic Egg. As it hatches, it gives rise to itself and to the very notion of existence. Its 1,000 arms are the origin of every law of the universe.",
  },
  "As Placas da criação": {
    title: "The Plates of creation",
    body:
      "Arceus leaves seventeen Plates scattered across the world — one for each element — able to turn it into any type. Whoever gathers them all can summon its presence at the top of Mount Coronet.",
  },
  "O Salão da Origem": {
    title: "The Hall of Origin",
    body:
      "Above the summit of Mount Coronet lies a place that appears on no map and only opens to whoever carries the Azure Flute. It is where Arceus rests between one creation and the next, and the only point in the world where a human can meet it.",
  },
  "Nascem tempo, espaço e antimatéria": {
    title: "Time, space and antimatter are born",
    body:
      "Arceus creates the creation trio: Dialga comes to control time, Palkia space, and Giratina — for its violence — is banished to the Distortion World, existing on a mirrored parallel plane.",
  },
  "Os guardiões do coração humano": {
    title: "The guardians of the human heart",
    body:
      "Arceus creates three beings to give life to humankind: Uxie grants knowledge, Mesprit emotions and Azelf willpower. Each one rests at the bottom of one of Sinnoh's lakes.",
  },
  "Xerneas e Yveltal — dar e tirar a vida": {
    title: "Xerneas and Yveltal — giving and taking life",
    body:
      "In Kalos, creation splits in two. Xerneas shares eternal life and then sleeps as a tree for a thousand years; Yveltal drains the life of everything around it and seals itself in a cocoon. Neither exists without the other.",
  },
  "Zygarde vigia o equilíbrio": {
    title: "Zygarde watches over the balance",
    body:
      "Spread across the world as cells and cores, Zygarde observes the ecosystem without interfering. Only when order is threatened do the parts come together — and the worse the threat, the larger the form it takes.",
  },
  "A criação do Ultra Espaço": {
    title: "The creation of Ultra Space",
    body:
      "A tear between worlds: the Ultra Wormholes connect the known universe to Ultra Space. Necrozma lived there before, feeding on light. Cosmog comes from that void, the seed of Solgaleo and Lunala.",
  },
  "O Monte Coronet, espinha de Sinnoh": {
    title: "Mount Coronet, Sinnoh's spine",
    body:
      "The mountain range that cuts Sinnoh in half was treated by the ancients as the place where the world began. At its top stands Spear Pillar, the point where time and space can be torn open by anyone who knows how.",
  },
  "Regigigas e os continentes": {
    title: "Regigigas and the continents",
    body:
      "Regigigas, the colossal Pokémon, raised the continents by towing tectonic plates with ropes. When it was done, it shaped its three servants — Regirock, Regice and Registeel — out of the primordial elements.",
  },
  "O confronto pela terra e pelo mar": {
    title: "The clash over land and sea",
    body:
      "Groudon rises from the magma, expanding the continents; Kyogre surges from the depths to fill the oceans. The war between the two shaped the climate and ravaged landscapes until Rayquaza came down from the skies to calm them, restoring the balance.",
  },
  "Heatran e o coração vulcânico": {
    title: "Heatran and the volcanic heart",
    body:
      "Born in boiling lava, Heatran digs through cave walls with cross-shaped claws and lives inside volcanoes. It is the heat that keeps the underground moving — and the reason certain mountains never cool.",
  },
  "A cratera gigante de Unova": {
    title: "Unova's giant crater",
    body:
      "A meteorite opens a crater in eastern Unova. At its bottom, in a shelter of ice, sleeps Kyurem — what remained of the Original Dragon after it split into Reshiram and Zekrom, and which has been seeking what it lacks ever since.",
  },
  "Eternatus cai sobre Galar": {
    title: "Eternatus falls on Galar",
    body:
      "A creature that feeds on energy arrives from space inside a meteorite. The impact spreads across Galar the energy that, much later, would make Dynamax possible, and leaves dormant what would wake again on the Darkest Day.",
  },
  "Meloetta e a canção do mundo": {
    title: "Meloetta and the song of the world",
    body:
      "It is said that Meloetta sang to the newly formed nature, and species learned their own voices by listening to it. Its forgotten song still echoes in Unova's ancient ruins.",
  },
  "Mew, o ancestral de todos os pokémon": {
    title: "Mew, the ancestor of all Pokémon",
    body:
      "Legend says every Pokémon descends from Mew, found deep in the jungles of Guyana. Its genes contain the genetic material of every known species — and one day, scientists would use that sample to create Mewtwo.",
  },
  "Fósseis do mar pré-histórico": {
    title: "Fossils of the prehistoric sea",
    body:
      "Before the human eras, the oceans were ruled by creatures now known only from their fossils: Omanyte, Kabuto, Aerodactyl. Scientists revive them from amber and ancient shells.",
  },
  "O âmbar e o céu pré-histórico": {
    title: "Amber and the prehistoric sky",
    body:
      "An insect trapped in resin holds the blood of a Pokémon that flew before written history existed. From that material Aerodactyl is rebuilt, and with it the proof that the ancient sky already had an owner.",
  },
  "Manaphy e o berço do mar": {
    title: "Manaphy and the cradle of the sea",
    body:
      "Deep in the Sea Temple, a legendary Egg has been preserved for millennia. From it hatches Manaphy, whose Heart Swap connects the hearts of every sea creature. Phione is Manaphy's natural offspring.",
  },
  "Lugia, guardião dos mares": {
    title: "Lugia, guardian of the seas",
    body:
      "Lugia lives in the darkest depths of the ocean, avoiding humans. It commands Kanto's three legendary birds — Articuno, Zapdos and Moltres — when their rivalry threatens the world's climatic balance.",
  },
  "Whirl Islands — o refúgio de Lugia": {
    title: "Whirl Islands — Lugia's refuge",
    body:
      "In southwestern Johto, an archipelago of four rocky islands with violent sea currents hides an underwater chamber where Lugia rests. Only Trainers who master Surf, Whirlpool and Waterfall can reach it.",
  },
  "A Torre dos Sinos e o incêndio": {
    title: "The Bell Tower and the fire",
    body:
      "Centuries ago, three nameless Pokémon died in a fire at the Brass Tower in Ecruteak City. Ho-Oh, flying over the ruins, revived them as Suicune (the purifying rain), Raikou (the lightning) and Entei (the volcano).",
  },
  "Bell Tower e as chamas sagradas": {
    title: "The Bell Tower and the sacred flames",
    body:
      "In Ecruteak City, the Bell Tower is the only sacred place where Ho-Oh allows itself to be seen. Its companion was the Brass Tower — now a burned ruin. Some say the fire was an accident; others say it was the work of the gods.",
  },
  "As Penas Arco-íris de Ho-Oh": {
    title: "Ho-Oh's Rainbow Feathers",
    body:
      "Legend says Ho-Oh drops seven feathers of different colors as it flies. Whoever finds all seven and brings them to the Tin Tower can summon the legendary Pokémon. Ash Ketchum saw Ho-Oh on his very first day as a Trainer.",
  },
  "Ilex Forest e Celebi": {
    title: "Ilex Forest and Celebi",
    body:
      "Deep in Ilex Forest, by the shrine, Celebi lives outside of time. It only appears to the pure of heart. It has been seen with a young Team Rocket member, which created time paradoxes.",
  },
  "As Ruínas de Alph": {
    title: "The Ruins of Alph",
    body:
      "Ruins excavated in Johto reveal walls covered in 26 hieroglyphs identical to the modern Unown. Each Unown matches a letter. Nobody knows whether the Unown taught humans the alphabet or the other way around.",
  },
  "Celestic Town e os que adoravam a criação": {
    title: "Celestic Town and those who worshipped creation",
    body:
      "Sinnoh's oldest village keeps a shrine with paintings of Dialga and Palkia on the wall. It was there that the first humans recorded what they believed was the beginning of everything — and the region is still organized around that record.",
  },
  "Jubilife e a fenda no céu": {
    title: "Jubilife and the rift in the sky",
    body:
      "A space-time rift opens over Hisui and drops people and Pokémon from other eras. Jubilife Village organizes itself around the problem, and from there comes the first team dedicated to studying Pokémon instead of fearing them.",
  },
  "As nobres de Hisui e o frenesi": {
    title: "Hisui's nobles and the frenzy",
    body:
      "In Hisui, certain Pokémon receive blessings and are revered as nobles by the clans. When the energy running through them goes out of control, they fall into a frenzy — and only the balm prepared by the wardens can calm them.",
  },
  "Volo e a obsessão pelo Original": {
    title: "Volo and the obsession with the Original One",
    body:
      "A traveling merchant from Hisui gathers the Plates with a single goal: to force Arceus to undo the world and remake it his way. He loses, and vanishes — making it clear that the creation had been challenged long before.",
  },
  "A ilusão do castelo de Zoroark": {
    title: "Zoroark's castle illusion",
    body:
      "Zoroark has the power to project elaborate illusions. Centuries ago, a Zoroark protected its child by building an entire invisible castle with its mind — the original Crown City, now known only from accounts.",
  },
  "Absol, o arauto dos desastres": {
    title: "Absol, the herald of disaster",
    body:
      "Absol lives alone in the mountains, but when it comes down to human villages, it is an omen of calamity. Unfairly feared: it doesn't cause disasters, it warns of them.",
  },
  "AZ e a Guerra de Kalos": {
    title: "AZ and the Kalos war",
    body:
      "Three thousand years ago, King AZ lost his Floette in the war and, in grief, built the ultimate weapon — which devastated Kalos. Xerneas grants eternal life; Yveltal steals it. Zygarde watches the balance between them. AZ wandered the centuries until he found his Floette again.",
  },
  "A Espada de Rota e o povo de Aaron": {
    title: "The Sword of Rota and Aaron's people",
    body:
      "Centuries ago, the hero Sir Aaron saved the kingdom of Rota by sacrificing himself together with Lucario, his shadow and advisor. His consciousness remained sealed in the royal staff for generations.",
  },
  "Diancie, a princesa de diamante": {
    title: "Diancie, the diamond princess",
    body:
      "In the caves of Kalos, a rare Carbink mutates and becomes Diancie, able to create diamonds with its hands. It is revered as a princess by the Carbink around it.",
  },
  "Latios e Latias em Alto Mare": {
    title: "Latios and Latias in Alto Mare",
    body:
      "In the island city of Alto Mare, a pair of siblings, Latios and Latias, protect the canals with the Soul Dew — a sacred stone only they can awaken.",
  },
  "Reshiram e Zekrom — a verdade e o ideal": {
    title: "Reshiram and Zekrom — truth and ideals",
    body:
      "Two brothers from Unova founded a united kingdom, but split over truth and ideals. The Original Dragon divided into Reshiram (truth) and Zekrom (ideals), leaving Kyurem as the empty husk — the dragon of the void.",
  },
  "Os heróis de Galar e o Darkest Day": {
    title: "Galar's heroes and the Darkest Day",
    body:
      "Three thousand years ago, the Darkest Day threatened Galar when Eternatus appeared from space. Two brothers — now known only as the heroes — sealed it with the swords and shields of Zacian and Zamazenta.",
  },
  "Kubfu e as torres gêmeas": {
    title: "Kubfu and the twin towers",
    body:
      "Kubfu, when trained in the Tower of Waters or the Tower of Darkness on the Isle of Armor, evolves into Urshifu — a fast fighting style (Single Strike) or a flowing one (Rapid Strike), depending on the tower.",
  },
  "Calyrex, o rei-corcel esquecido": {
    title: "Calyrex, the forgotten steed king",
    body:
      "Centuries ago, Calyrex ruled the Crown Tundra with its two steeds — Glastrier in winter and Spectrier at dusk. Forgotten by humans, it returns to reclaim its throne.",
  },
  "Os Tapus, guardiões de Alola": {
    title: "The Tapus, guardians of Alola",
    body:
      "Each of Alola's four islands has its guardian: Tapu Koko (Melemele), Tapu Lele (Akala), Tapu Bulu (Ula'ula) and Tapu Fini (Poni). They serve Cosmog's royal family, raised in the rifts of Ultra Space.",
  },
  "As Ruínas de Sinjoh e o ritual do Ovo": {
    title: "The Sinjoh Ruins and the Egg ritual",
    body:
      "On the border between Sinnoh and Johto, scientists discover that bringing Arceus to the Sinjoh Ruins produces a new Egg — holding Dialga, Palkia or Giratina, depending on the moment and place of the ritual.",
  },
  "Wailord + Relicanth = os Regis despertam": {
    title: "Wailord + Relicanth = the Regis awaken",
    body:
      "A secret chamber in the Sealed Chamber only opens when a Wailord and a Relicanth are placed at the ends of the room. The ritual, deciphered from the Braille on the wall, frees Regirock, Regice and Registeel from their tombs.",
  },
  "Silph Co. e a Master Ball": {
    title: "Silph Co. and the Master Ball",
    body:
      "The corporate giant of Saffron City developed the Master Ball — the perfect Poké Ball, able to catch any Pokémon. Team Rocket raided the headquarters to steal the prototype. Only one exists in the world — the rest is legend.",
  },
  "Cinnabar Mansion — o nascimento de Mewtwo": {
    title: "Cinnabar Mansion — the birth of Mewtwo",
    body:
      "In the abandoned mansion on Cinnabar Island, journals found by Red reveal how Mewtwo was created. Dr. Fuji, the lead scientist, was trying to clone his dead daughter using Mew's DNA. Mewtwo destroyed the lab before escaping.",
  },
  "Prof. Oak e o nascimento da Pokédex": {
    title: "Prof. Oak and the birth of the Pokédex",
    body:
      "Centuries after Pokémon were domesticated, Prof. Samuel Oak of Pallet Town creates the first device able to scan and catalog species automatically — the Pokédex. He hands out three prototypes to young Trainers: Red, Blue and Green.",
  },
  "A queda da Team Rocket original": {
    title: "The fall of the original Team Rocket",
    body:
      "Giovanni, Team Rocket's leader, was defeated by Red at his Viridian Gym. Ashamed, he went into exile, leaving his own son Silver behind. The organization disbanded — it only resurfaces three years later in Johto, without its leader.",
  },
  "Radio Tower Takeover — Johto": {
    title: "The Radio Tower takeover — Johto",
    body:
      "Three years after the original collapse, what was left of Team Rocket seizes Goldenrod City's Radio Tower with a plan: broadcast a signal that would make Giovanni come back. The plan failed — the transmitter was silenced by a nameless Trainer.",
  },
  "Red desaparece no Mount Silver": {
    title: "Red disappears on Mt. Silver",
    body:
      "After becoming the youngest Champion in history at 11, Red simply vanished. He was found three years later at the top of Mt. Silver, in absolute silence, training with his Pikachu and other partners against brutally high-level wild Pokémon.",
  },
  "Wally e a captura sob orientação": {
    title: "Wally and the guided catch",
    body:
      "Wally, a sickly boy from Petalburg, wants to learn to catch his first Pokémon. Under the protagonist's supervision, he catches Ralts — which later becomes a Mega Gallade and turns him into one of Hoenn's strongest Trainers.",
  },
  "Battle Frontier — o desafio pós-Champion": {
    title: "Battle Frontier — the post-Champion challenge",
    body:
      "Beyond the Elite Four, the Battle Frontier offered seven Frontier Brains and ever more brutal rules. Brandon (Regirock/Regice/Registeel), Anabel (Alakazam/Snorlax/Entei), Palmer (Rhyperior/Milotic/Dragonite) — the Brains were semi-legendary among Trainers.",
  },
  "Delta Episode — o meteoro sobre Hoenn": {
    title: "Delta Episode — the meteor over Hoenn",
    body:
      "After the events with Kyogre and Groudon, Hoenn's scientists discover that a colossal meteor is on a collision course with the planet. Deoxys appears from space. Rayquaza absorbs the Mega Stone to reach its Mega form and destroy the meteor in mid-flight.",
  },
  "Shadow Lugia (XD001) — Orre": {
    title: "Shadow Lugia (XD001) — Orre",
    body:
      "In Orre, the Cipher organization developed a technique to close Pokémon's hearts, creating Shadow Pokémon able to attack humans. The most brutal experiment was XD001: Shadow Lugia. It was only purified by a lone Trainer.",
  },
  "Old Chateau — o menino do quadro": {
    title: "Old Chateau — the boy in the painting",
    body:
      "In Sinnoh's Eterna Forest, an abandoned Victorian mansion houses ghosts. At night, a painting comes to life: a boy in red walks the halls. Some say they see Rotom possessing the appliances around it.",
  },
  "Cyrus e a rasgadura do céu": {
    title: "Cyrus and the tearing of the sky",
    body:
      "Cyrus, leader of Team Galactic, sought to capture Dialga and Palkia to destroy the universe and rebuild it without emotions. By summoning them with the Red Chain on Mount Coronet, he nearly tore reality apart — but Giratina dragged him into the Distortion World.",
  },
  "Cyrus vaga eternamente no Mundo Distorcido": {
    title: "Cyrus wanders the Distortion World forever",
    body:
      "After his defeat at Spear Pillar, Cyrus is dragged by Giratina into the Distortion World. Decades pass for us; he still walks there, alone, looking for some way out. Some accounts claim to have seen him reflected in mirrors.",
  },
  "N e o Dragão Original": {
    title: "N and the Original Dragon",
    body:
      "Raised by Team Plasma to free every Pokémon, the young man N awakened the sleeping dragon — Zekrom (Black) or Reshiram (White) — to challenge the Champion. His ideology divided Unova.",
  },
  "N e o Castelo de Vidro": {
    title: "N and the glass castle",
    body:
      "Team Plasma raised a colossal castle around Unova's Pokémon League during the events of Black/White. N awaited his Champion at the top — if he won, every Pokémon would be set free; if he lost, his philosophy was wrong. The final battle decided the era.",
  },
  "Colress e a máquina de potencial": {
    title: "Colress and the potential machine",
    body:
      "A scientist with no clear side builds a device to draw the most strength out of a Pokémon. He works for Team Plasma while the lab serves his research, and leaves the day it stops serving it.",
  },
  "Hoopa e os anéis dimensionais": {
    title: "Hoopa and the dimensional rings",
    body:
      "Hoopa Confined is a contained version of the true Hoopa Unbound. Its rings open portals to anywhere in the world. A Kalos village was devastated by Hoopa Unbound centuries ago — the containment ring was created afterwards.",
  },
  "Volcanion escapa da pesquisa": {
    title: "Volcanion escapes the research",
    body:
      "Volcanion, the only Fire/Water-type Pokémon, was captured in a lab in Azoth. After years of study, it escaped. It formed an unlikely alliance with Magearna, the doll Pokémon created 500 years before the era of the ultimate weapon.",
  },
  "A Fundação Aether e os buracos de minhoca": {
    title: "The Aether Foundation and the wormholes",
    body:
      "A foundation that claims to exist to care for injured Pokémon starts opening Ultra Wormholes on its own. Lusamine goes through one of them after Nihilego, and what comes back from the other side is no longer just her.",
  },
  "Ultra Beasts vazam do Ultra Espaço": {
    title: "Ultra Beasts leak out of Ultra Space",
    body:
      "The Aether Foundation's research opens holes between dimensions. Creatures from other worlds — Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord — invade Alola. Guzma and Lusamine become obsessed with them.",
  },
  "Necrozma rouba a luz de Alola": {
    title: "Necrozma steals Alola's light",
    body:
      "Hungry for light ever since it was banished from its own world, Necrozma fuses with Solgaleo or Lunala and becomes Ultra Necrozma, stealing Alola's light until the sun goes out. It is only stopped when the protagonist crosses the Ultra Wormholes and faces it in Ultra Megalopolis, its homeland.",
  },
  "Rainbow Rocket — os vilões de todas as regiões": {
    title: "Rainbow Rocket — the villains of every region",
    body:
      "In Alola, Giovanni gathered defeated leaders from every region (Maxie, Archie, Cyrus, Ghetsis, Lysandre) from a parallel dimension where they had won. Rainbow Rocket was only defeated when the protagonist proved that the hero's victory is the one constant.",
  },
  "Leon perde pela primeira vez": {
    title: "Leon loses for the first time",
    body:
      "After years as Galar's unbeaten Champion, Leon is defeated by the protagonist in a match broadcast to the whole region. Gigantamax Charizard is beaten for the first time, marking the end of one era and the start of another.",
  },
  "Blueberry Academy e o Terarium": {
    title: "Blueberry Academy and the Terarium",
    body:
      "A partner school of Paldea's Naranja/Uva Academy. It sits in an undersea dome in the ocean to the east. Inside it, the Terarium — an artificial biosphere with 4 biomes — houses Terapagos and other rare, acclimatized species.",
  },
  "As formas Origin de Hisui": {
    title: "Hisui's Origin forms",
    body:
      "In Hisui, Dialga and Palkia appear in forms the later games don't show, and Giratina returns from the Distortion World with them. It is the creation trio seen before it settled into the shape the modern world knows.",
  },
  "Celebi e os saltos no tempo": {
    title: "Celebi and the leaps through time",
    body:
      "The Voice of the Forest crosses time with no apparent effort, and wherever it lands the vegetation grows back. Whoever finds it tends to find, along with it, a different version of their own world.",
  },
  "A Grande Cratera do Sul e a Área Zero": {
    title: "The Great Crater of Paldea and Area Zero",
    body:
      "At the center of Paldea opens a colossal crater formed by crystalline meteorites. Researchers identified creatures there that exist nowhere else in the world: ancient and futuristic variations of known Pokémon, called Paradox Pokémon.",
  },
  "IA de Sada e Turo": {
    title: "Sada and Turo's AI",
    body:
      "Prof. Sada (past) and Prof. Turo (future) died in Area Zero during their research. They created AIs of themselves to carry on the work — but those AIs carried the plans beyond reason, forcing their son Arven to destroy them together with the player.",
  },
  "Koraidon e Miraidon — vindos de outra era": {
    title: "Koraidon and Miraidon — from another era",
    body:
      "The expeditions into Paldea's Area Zero revealed creatures that crossed time: Koraidon comes from a prehistoric era, Miraidon from the distant future. Both serve as mounts for modern explorers.",
  },
  "A Terastalização e o cristal de Paldea": {
    title: "Terastallization and Paldea's crystal",
    body:
      "The energy leaking out of Area Zero covers Paldea's Pokémon with a crystal crown and changes their type while it lasts. Nobody can say whether the phenomenon is natural or a residue of what was opened down there.",
  },
  "Terapagos e a Ilha das Escamas": {
    title: "Terapagos and the island of scales",
    body:
      "Inside the Terarium DLC — Blueberry Academy's artificial biosphere — Terapagos turns out to be the original Pokémon that generated all Terastal energy. It had been sealed in a small, harmless form for centuries, until it was found again.",
  },
  "Os Quatro Tesouros da Ruína": {
    title: "The four Treasures of Ruin",
    body:
      "Long ago, on the continent that is now Paldea, four cursed objects were sealed for their crimes — the sword Chien-Pao, the jade Ting-Lu, the candle Chi-Yu and the ribbons Wo-Chien. Each one embodies the ruin of an ancient kingdom.",
  },
  "The Loyal Three — Kitakami": {
    title: "The Loyal Three — Kitakami",
    body:
      "In Kitakami's mountainous region, three Pokémon — Okidogi, Munkidori and Fezandipiti — were revered as heroes who drove out a demon (Ogerpon). The historical truth is the opposite: they were the villains; Ogerpon was the heroine, unjustly exiled.",
  },
  "Ogerpon e a máscara emprestada": {
    title: "Ogerpon and the borrowed mask",
    body:
      "In Kitakami, Ogerpon was unjustly accused and had its mask stolen. Its four masks (Teal, Wellspring, Hearthflame, Cornerstone) change its type. Terapagos, hidden in the depths, holds the Terastal power.",
  },
};
