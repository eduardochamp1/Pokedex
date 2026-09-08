import type { WikiSourced } from "../lib/wiki";

export type LandmarkKind =
  | "ilha"
  | "ruina"
  | "caverna"
  | "torre"
  | "montanha"
  | "floresta"
  | "lago"
  | "marco"
  | "laboratorio";

export interface Landmark extends WikiSourced {
  id: string;
  name: string;
  /** id da regiao em src/data/regions.ts — liga o local ao mapa. */
  regionId: string;
  kind: LandmarkKind;
  summary: string;
  pokemons: string[];
}

export const LANDMARK_KIND_LABELS: Record<LandmarkKind, string> = {
  ilha: "Ilha",
  ruina: "Ruína",
  caverna: "Caverna",
  torre: "Torre",
  montanha: "Montanha",
  floresta: "Floresta",
  lago: "Lago",
  marco: "Marco",
  laboratorio: "Laboratório",
};

export const LANDMARKS: Landmark[] = [
  // ==================== KANTO ====================
  {
    id: "sevii-islands",
    name: "Ilhas Sete",
    regionId: "kanto",
    kind: "ilha",
    wiki: "Sevii Islands",
    summary:
      "Arquipélago de nove ilhas a sudeste de Kanto, introduzido em FireRed & LeafGreen. Tem Pokédex própria, ruínas com escrita Unown e as Icefall e Rocket Warehouse — onde a Team Rocket tentou se reorganizar depois da queda de Giovanni.",
    pokemons: ["moltres", "lugia", "ho-oh"],
  },
  {
    id: "cinnabar-island",
    name: "Ilha Cinnabar",
    regionId: "kanto",
    kind: "ilha",
    wiki: "Cinnabar Island",
    summary:
      "Ilha vulcânica onde funcionava a Pokémon Mansion — o laboratório em que Mewtwo foi criado a partir do DNA de Mew. Os diários queimados no prédio são a única documentação do experimento. O vulcão entra em erupção entre Gen I e Gen II e destrói a cidade.",
    pokemons: ["mewtwo", "mew", "magmar", "ponyta"],
  },
  {
    id: "seafoam-islands",
    name: "Ilhas Seafoam",
    regionId: "kanto",
    kind: "ilha",
    wiki: "Seafoam Islands",
    summary:
      "Duas ilhas gêmeas escavadas por correntes marítimas, com um labirinto de gelo no subsolo. No fundo dorme Articuno. As correntes internas empurram o jogador de volta se ele não bloquear a passagem com pedras — o único quebra-cabeça hidráulico da primeira geração.",
    pokemons: ["articuno", "seel", "dewgong"],
  },
  {
    id: "pokemon-tower",
    name: "Pokémon Tower",
    regionId: "kanto",
    kind: "torre",
    wiki: "Pokémon Tower",
    summary:
      "Cemitério de sete andares em Lavender Town. Os pokémon fantasmas aparecem como vultos sem identidade até o jogador conseguir a Silph Scope. No topo está o espírito do Marowak que a Team Rocket matou por resistir — o único pokémon da série que o jogador precisa exorcizar, não capturar.",
    pokemons: ["marowak", "cubone", "gastly", "haunter"],
  },
  {
    id: "cerulean-cave",
    name: "Caverna Cerulean",
    regionId: "kanto",
    kind: "caverna",
    wiki: "Cerulean Cave",
    summary:
      "Caverna interditada ao norte de Cerulean City, liberada só depois que o jogador vence a Elite Four. Mewtwo se esconde no nível mais baixo. É o primeiro conteúdo pós-jogo da franquia e continua sendo o modelo: um lugar fechado, sem NPC, com um único inquilino.",
    pokemons: ["mewtwo", "ditto", "chansey"],
  },
  {
    id: "viridian-forest",
    name: "Floresta Viridian",
    regionId: "kanto",
    kind: "floresta",
    wiki: "Viridian Forest",
    summary:
      "Labirinto natural entre Viridian e Pewter, tratado no anime como um lugar em que se entra e não se sabe sair. É onde a maioria dos treinadores de Kanto captura seu primeiro pokémon — e onde Ash pegou Caterpie e Pikachu enfrentou os Spearow.",
    pokemons: ["pikachu", "caterpie", "weedle", "pidgey"],
  },
  {
    id: "silph-co",
    name: "Silph Co.",
    regionId: "kanto",
    kind: "marco",
    wiki: "Silph Co.",
    summary:
      "Sede corporativa de onze andares em Saffron City, maior fabricante de pokébolas do mundo. Foi ocupada pela Team Rocket, que queria o protótipo da Master Ball. O prédio inteiro é um quebra-cabeça de teletransportadores — e Giovanni espera no último andar.",
    pokemons: ["lapras", "mewtwo"],
  },
  {
    id: "indigo-plateau",
    name: "Planalto Indigo",
    regionId: "kanto",
    kind: "marco",
    wiki: "Indigo Plateau",
    summary:
      "Sede da Liga Pokémon que serve Kanto e Johto ao mesmo tempo — as duas regiões compartilham uma única Elite Four. É onde Red venceu Blue no mesmo dia em que Blue assumiu o título, o reinado mais curto da história da Liga.",
    pokemons: ["dragonite", "gengar", "arcanine"],
  },
  {
    id: "power-plant",
    name: "Usina Abandonada",
    regionId: "kanto",
    kind: "marco",
    wiki: "Kanto Power Plant",
    summary:
      "Usina desativada a leste de Cerulean, tomada por pokémon elétricos que se alimentam da corrente residual. Zapdos faz ninho lá dentro. Em Gen II, a usina volta a operar — e a peça roubada de seu gerador é o gancho para o arco da Radio Tower.",
    pokemons: ["zapdos", "electabuzz", "magnemite", "voltorb"],
  },
  {
    id: "tree-of-beginning",
    name: "Árvore do Início",
    regionId: "kanto",
    kind: "marco",
    wiki: "Tree of Beginning",
    summary:
      "Formação viva no Reino de Rota, feita de rocha e matéria orgânica, com sistema imunológico próprio que dissolve intrusos. Mew habita seu núcleo. Sir Aaron deu a vida para impedir que uma guerra a destruísse — e sua consciência ficou selada no bastão real por séculos.",
    pokemons: ["mew", "lucario", "regirock"],
  },

  // ==================== JOHTO ====================
  {
    id: "whirl-islands",
    name: "Ilhas Whirl",
    regionId: "johto",
    kind: "ilha",
    wiki: "Whirl Islands",
    summary:
      "Quatro ilhas cercadas por redemoinhos entre Cianwood e Olivine, atravessáveis só com Whirlpool. No fundo da caverna submarina está a Câmara de Lugia. A Silver Wing é o que traz o pokémon à superfície.",
    pokemons: ["lugia", "krabby", "tentacool"],
  },
  {
    id: "bell-tower",
    name: "Torre do Sino",
    regionId: "johto",
    kind: "torre",
    wiki: "Bell Tower",
    summary:
      "Torre de nove andares em Ecruteak onde Ho-Oh pousava. Sobreviveu ao incêndio que consumiu sua gêmea, a Brass Tower, há cento e cinquenta anos. Levando a Rainbow Wing ao topo, Ho-Oh desce — o único legendário da série que aparece por convite, não por emboscada.",
    pokemons: ["ho-oh", "murkrow", "gastly"],
  },
  {
    id: "burned-tower",
    name: "Torre Queimada",
    regionId: "johto",
    kind: "torre",
    wiki: "Burned Tower",
    summary:
      "Ruína da Brass Tower, destruída por um raio e por um incêndio que matou três pokémon presos dentro. Ho-Oh os ressuscitou como Raikou, Entei e Suicune. Quando o jogador desce ao subsolo, os três despertam e se espalham por Johto — e a caçada aos roamers começa.",
    pokemons: ["raikou", "entei", "suicune", "koffing"],
  },
  {
    id: "sprout-tower",
    name: "Torre Sprout",
    regionId: "johto",
    kind: "torre",
    wiki: "Sprout Tower",
    summary:
      "Torre de Violet City construída em torno de um Bellsprout gigante de cem anos. O pilar central oscila sem parar, absorvendo terremotos. Os monges que a mantêm ensinam que pokémon e humano crescem na mesma direção — devagar, e para cima.",
    pokemons: ["bellsprout", "hoothoot", "rattata"],
  },
  {
    id: "ilex-forest",
    name: "Floresta Ilex",
    regionId: "johto",
    kind: "floresta",
    wiki: "Ilex Forest",
    summary:
      "Floresta densa a oeste de Azalea, guardada por um santuário dedicado ao protetor do bosque — Celebi. É onde a GS Ball deveria ser usada, e no anime é o lugar por onde Celebi viaja no tempo. Sem o Farfetch'd fugitivo, não se atravessa.",
    pokemons: ["celebi", "farfetchd", "paras", "oddish"],
  },
  {
    id: "ruins-of-alph",
    name: "Ruínas de Alph",
    regionId: "johto",
    kind: "ruina",
    wiki: "Ruins of Alph",
    summary:
      "Complexo arqueológico com quatro câmaras seladas, cada uma com um quebra-cabeça de mosaico. Resolvidos, o chão desaba e libera Unown — a espécie que é, ela mesma, um alfabeto. Os pesquisadores no local admitem não saber se os Unown escreveram as paredes ou nasceram delas.",
    pokemons: ["unown", "natu", "smeargle"],
  },
  {
    id: "mt-silver",
    name: "Monte Silver",
    regionId: "johto",
    kind: "montanha",
    wiki: "Mt. Silver",
    summary:
      "Montanha na fronteira entre Kanto e Johto, com fauna de nível mais alto de toda a série. No cume, em silêncio absoluto, está Red — que não diz uma palavra, luta com um time de nível 80 e desaparece depois de perder. O confronto final canônico da franquia.",
    pokemons: ["larvitar", "tyranitar", "donphan", "pikachu"],
  },
  {
    id: "lake-of-rage",
    name: "Lago da Fúria",
    regionId: "johto",
    kind: "lago",
    wiki: "Lake of Rage",
    summary:
      "Lago tomado por Magikarp e por um Gyarados vermelho. A cor não é natural: a Team Rocket instalou na Mahogany Town um transmissor de ondas de rádio que força evolução, e o Gyarados shiny é o efeito colateral. O primeiro shiny com explicação narrativa da série.",
    pokemons: ["gyarados", "magikarp"],
  },
  {
    id: "dragons-den",
    name: "Covil dos Dragões",
    regionId: "johto",
    kind: "caverna",
    wiki: "Dragon's Den",
    summary:
      "Caverna atrás do ginásio de Blackthorn, onde o Clã do Dragão guarda seus rituais. Só quem passa pelo exame oral do ancião — cinco perguntas sobre o que é ser treinador — recebe a Dragon Fang e o direito de treinar dragões.",
    pokemons: ["dratini", "dragonair", "dragonite", "magikarp"],
  },

  // ==================== HOENN ====================
  {
    id: "sky-pillar",
    name: "Pilar Celeste",
    regionId: "hoenn",
    kind: "torre",
    wiki: "Sky Pillar",
    summary:
      "Torre antiga sobre uma ilhota a leste de Hoenn, com piso tão frágil que desmorona se o jogador pedalar devagar. No topo dorme Rayquaza. Quando Groudon e Kyogre entram em conflito, é aqui que Wallace traz o jogador — só o árbitro pode separar os dois.",
    pokemons: ["rayquaza", "claydol", "banette"],
  },
  {
    id: "cave-of-origin",
    name: "Caverna da Origem",
    regionId: "hoenn",
    kind: "caverna",
    wiki: "Cave of Origin",
    summary:
      "Caverna sob Sootopolis, tratada pelos moradores como o ponto onde a vida em Hoenn começou. Em Emerald é onde Groudon ou Kyogre se recolhe; em Omega Ruby & Alpha Sapphire, é onde a Primal Reversion acontece. O interior não tem pokémon selvagem nenhum.",
    pokemons: ["groudon", "kyogre"],
  },
  {
    id: "mt-pyre",
    name: "Monte Pyre",
    regionId: "hoenn",
    kind: "montanha",
    wiki: "Mt. Pyre",
    summary:
      "Montanha-cemitério onde treinadores enterram seus pokémon. No cume, um casal de anciãos guardava o Red Orb e o Blue Orb lado a lado — precisamente para que nenhuma das duas forças fosse acordada sozinha. Magma e Aqua sobem e levam um cada.",
    pokemons: ["groudon", "kyogre", "shuppet", "duskull"],
  },
  {
    id: "sealed-chamber",
    name: "Câmara Selada",
    regionId: "hoenn",
    kind: "ruina",
    wiki: "Sealed Chamber",
    summary:
      "Câmara submarina com uma inscrição em Braille que ninguém no jogo traduz para o jogador. Seguir as instruções à risca abre as três tumbas dos Regis — Regirock, Regice e Registeel. O único puzzle da série que exige material de fora do jogo para resolver.",
    pokemons: ["regirock", "regice", "registeel"],
  },
  {
    id: "mirage-island",
    name: "Ilha Miragem",
    regionId: "hoenn",
    kind: "ilha",
    wiki: "Mirage Island",
    summary:
      "Ilha que aparece na costa de Route 130 com chance de 1 em 65.536 por dia, comparando um valor oculto do save com um número aleatório. Um ancião de Pacifidlog passa o dia olhando o mar esperando vê-la. Guarda os Liechi Berry e Wynaut em profusão.",
    pokemons: ["wynaut", "wobbuffet"],
  },
  {
    id: "southern-island",
    name: "Ilha do Sul",
    regionId: "hoenn",
    kind: "ilha",
    wiki: "Southern Island",
    summary:
      "Ilhota de evento, acessível só com o Eon Ticket. No centro há um pedestal com a Soul Dew e um dos irmãos Eon — Latias em Ruby, Latios em Sapphire — esperando. Em HeartGold & SoulSilver, a Enigma Stone recria o evento.",
    pokemons: ["latias", "latios"],
  },
  {
    id: "meteor-falls",
    name: "Cataratas Meteoro",
    regionId: "hoenn",
    kind: "caverna",
    wiki: "Meteor Falls",
    summary:
      "Caverna com cachoeiras internas onde caiu um meteorito. É o lar dos Bagon e o esconderijo do Clã do Dragão de Hoenn. A pedra caída é o que a Team Magma tenta roubar para acelerar o despertar de Groudon — e, em ORAS, o que quase traz um asteroide inteiro.",
    pokemons: ["bagon", "salamence", "solrock", "lunatone"],
  },
  {
    id: "new-mauville",
    name: "Nova Mauville",
    regionId: "hoenn",
    kind: "marco",
    wiki: "New Mauville",
    summary:
      "Cidade subterrânea construída como projeto habitacional e abandonada antes de ser habitada, hoje ocupada por Voltorb e Magnemite. O gerador continua ligado, drenando energia de Mauville — e o jogador é mandado lá para desligá-lo.",
    pokemons: ["voltorb", "electrode", "magnemite"],
  },

  // ==================== SINNOH ====================
  {
    id: "mount-coronet",
    name: "Monte Coronet",
    regionId: "sinnoh",
    kind: "montanha",
    wiki: "Mount Coronet",
    summary:
      "Cordilheira que corta Sinnoh em duas e, segundo os mitos, o ponto exato onde o mundo começou. Atravessa a região inteira de norte a sul. Em seu ponto mais alto está o Spear Pillar; acima dele, alcançável só pela Azure Flute, o Hall of Origin.",
    pokemons: ["dialga", "palkia", "clefairy", "bronzor"],
  },
  {
    id: "spear-pillar",
    name: "Pilar da Lança",
    regionId: "sinnoh",
    kind: "ruina",
    wiki: "Spear Pillar",
    summary:
      "Plataforma de colunas quebradas no cume do Mount Coronet. Foi aqui que Cyrus usou a Red Chain para acorrentar Dialga e Palkia e abrir seu universo sem espírito — e daqui que Giratina saiu do Mundo Distorcido para arrastá-lo embora.",
    pokemons: ["dialga", "palkia", "giratina"],
  },
  {
    id: "distortion-world",
    name: "Mundo Distorcido",
    regionId: "sinnoh",
    kind: "marco",
    wiki: "Distortion World",
    summary:
      "Dimensão paralela sem gravidade fixa nem fluxo de tempo, para onde Arceus exilou Giratina por violência. É o único cenário da série em que o jogador anda por paredes e tetos, sem batalha aleatória alguma — só silêncio e geometria impossível.",
    pokemons: ["giratina"],
  },
  {
    id: "snowpoint-temple",
    name: "Templo de Snowpoint",
    regionId: "sinnoh",
    kind: "ruina",
    wiki: "Snowpoint Temple",
    summary:
      "Templo de gelo de cinco andares sob Snowpoint City, onde os antigos selaram Regigigas. O selo só cede a quem trouxer os três Regis de Hoenn no time — o jogo exige que o jogador tenha resolvido uma região inteira antes.",
    pokemons: ["regigigas", "regirock", "regice", "registeel"],
  },
  {
    id: "turnback-cave",
    name: "Caverna do Retorno",
    regionId: "sinnoh",
    kind: "caverna",
    wiki: "Turnback Cave",
    summary:
      "Labirinto de salas idênticas geradas ao acaso, com três pilares escondidos. Achar os três abre a passagem para Giratina; errar o caminho devolve o jogador à entrada. O nome é literal: a caverna existe para fazer você voltar.",
    pokemons: ["giratina", "dusclops", "golbat"],
  },
  {
    id: "lake-verity",
    name: "Lago Verity",
    regionId: "sinnoh",
    kind: "lago",
    wiki: "Lake Verity",
    summary:
      "Lago perto de Twinleaf onde vive Uxie, o Ser do Conhecimento. Os três lagos de Sinnoh formam um triângulo perfeito no mapa e nasceram, segundo o mito, do mesmo ovo que gerou os três espíritos.",
    pokemons: ["mesprit", "starly", "magikarp"],
  },
  {
    id: "lake-valor",
    name: "Lago Valor",
    regionId: "sinnoh",
    kind: "lago",
    wiki: "Lake Valor",
    summary:
      "Lago central de Sinnoh, morada de Azelf, o Ser da Vontade. A Team Galactic o bombardeou para forçar o espírito a se revelar — a explosão secou parte do lago e é o ponto em que a organização deixa de ser um bando de ladrões e passa a ser uma ameaça cosmológica.",
    pokemons: ["azelf", "quagsire", "gyarados"],
  },
  {
    id: "lake-acuity",
    name: "Lago Acuity",
    regionId: "sinnoh",
    kind: "lago",
    wiki: "Lake Acuity",
    summary:
      "Lago congelado ao norte, onde habita Mesprit, o Ser da Emoção. É também o único ponto da história em que o rival do jogador perde uma batalha de forma decisiva — e o jogo se dá o trabalho de mostrar isso.",
    pokemons: ["uxie", "sneasel", "snorunt"],
  },
  {
    id: "stark-mountain",
    name: "Montanha Stark",
    regionId: "sinnoh",
    kind: "montanha",
    wiki: "Stark Mountain",
    summary:
      "Vulcão ativo na Battle Zone, com uma câmara final onde a Magma Stone mantém Heatran ancorado. Buck retira a pedra e o vulcão começa a se agitar — a missão pós-jogo consiste em convencê-lo a devolvê-la.",
    pokemons: ["heatran", "magmar", "numel"],
  },
  {
    id: "fullmoon-island",
    name: "Ilha da Lua Cheia",
    regionId: "sinnoh",
    kind: "ilha",
    wiki: "Fullmoon Island",
    summary:
      "Ilhota ao norte de Canalave onde Cresselia deixa uma Lunar Wing — a única cura para o pesadelo eterno. Chegar aqui exige que um garoto da cidade esteja adoecido de sonhos, o que só acontece porque Darkrai existe na ilha vizinha.",
    pokemons: ["cresselia"],
  },
  {
    id: "newmoon-island",
    name: "Ilha da Lua Nova",
    regionId: "sinnoh",
    kind: "ilha",
    wiki: "Newmoon Island",
    summary:
      "Ilha que não aparece no mapa sem o Member Card. Coberta de névoa permanente, tem Darkrai no centro de uma clareira. O pokémon não é malicioso — provoca pesadelos por existir, como um efeito colateral do próprio corpo.",
    pokemons: ["darkrai"],
  },
  {
    id: "flower-paradise",
    name: "Paraíso das Flores",
    regionId: "sinnoh",
    kind: "marco",
    wiki: "Flower Paradise",
    summary:
      "Campo de gracideas no fim da Route 224, alcançável só com a Oak's Letter. É a colônia dos Shaymin. O caminho até lá passa por um corredor de placas com mensagens deixadas pelos desenvolvedores — o agradecimento escondido de Diamond & Pearl.",
    pokemons: ["shaymin"],
  },
  {
    id: "solaceon-ruins",
    name: "Ruínas de Solaceon",
    regionId: "sinnoh",
    kind: "ruina",
    wiki: "Solaceon Ruins",
    summary:
      "Rede subterrânea de galerias onde vivem os Unown de Sinnoh, com paredes cobertas de sua escrita. Reunir formas específicas revela mensagens; encontrar todas as 28 abre a câmara final. É o eco sinnohano das Ruínas de Alph.",
    pokemons: ["unown"],
  },
  {
    id: "sinjoh-ruins",
    name: "Ruínas de Sinjoh",
    regionId: "sinnoh",
    kind: "ruina",
    wiki: "Sinjoh Ruins",
    summary:
      "Sítio isolado que só se alcança levando um Arceus até uma casa em Johto. Lá, Arceus cria diante do jogador um ovo de Dialga, Palkia ou Giratina — o único momento em toda a franquia em que se assiste a um ato de criação divina.",
    pokemons: ["arceus", "dialga", "palkia", "giratina"],
  },

  // ==================== UNOVA ====================
  {
    id: "dragonspiral-tower",
    name: "Torre Espiral do Dragão",
    regionId: "unova",
    kind: "torre",
    wiki: "Dragonspiral Tower",
    summary:
      "A construção mais antiga de Unova, onde o Dragão Original foi criado e depois partido em dois. É aqui que a Light Stone ou a Dark Stone desperta, e onde a Team Plasma leva Kyurem para reconstituir o dragão à força.",
    pokemons: ["reshiram", "zekrom", "kyurem", "druddigon"],
  },
  {
    id: "relic-castle",
    name: "Castelo Relíquia",
    regionId: "unova",
    kind: "ruina",
    wiki: "Relic Castle",
    summary:
      "Castelo soterrado pelo Desert Resort, cujos andares descem por areia movediça — quem cai não volta subindo. No fundo há uma câmara com Volcarona. Em Black 2 & White 2 é o esconderijo dos Plasma dissidentes.",
    pokemons: ["volcarona", "darmanitan", "sandile", "yamask"],
  },
  {
    id: "giant-chasm",
    name: "Abismo Gigante",
    regionId: "unova",
    kind: "caverna",
    wiki: "Giant Chasm",
    summary:
      "Cratera formada pela queda de um meteoro, com uma caverna de gelo onde Kyurem dorme. É o palco do confronto final de Black 2 & White 2: Ghetsis usa as DNA Splicers ali dentro e ordena a Kyurem que congele o jogador — literalmente.",
    pokemons: ["kyurem", "zweilous", "clefairy", "piloswine"],
  },
  {
    id: "abyssal-ruins",
    name: "Ruínas Abissais",
    regionId: "unova",
    kind: "ruina",
    wiki: "Abyssal Ruins",
    summary:
      "Ruínas no fundo do mar de Undella, exploráveis só com Dive e com limite de passos — passar do limite expulsa o jogador. As paredes contam, em Braille, a história de um povo que afundou junto com sua cidade.",
    pokemons: ["relicanth", "frillish", "jellicent"],
  },
  {
    id: "abundant-shrine",
    name: "Santuário Abundante",
    regionId: "unova",
    kind: "marco",
    wiki: "Abundant Shrine",
    summary:
      "Santuário rural dedicado aos Kami — Tornadus, Thundurus e Landorus. Landorus é invocado aqui quando os outros dois já foram capturados: o mito local diz que ele desce para apaziguar os irmãos que destroem as plantações.",
    pokemons: ["landorus", "tornadus", "thundurus"],
  },
  {
    id: "ns-castle",
    name: "Castelo de N",
    regionId: "unova",
    kind: "marco",
    wiki: "N's Castle",
    summary:
      "Fortaleza que Ghetsis ergueu em segredo e que irrompe do chão em volta da Liga Pokémon, cercando-a. Dentro há o quarto de brinquedos em que N cresceu isolado — o único cômodo do castelo que explica o vilão.",
    pokemons: ["reshiram", "zekrom", "zorua"],
  },
  {
    id: "liberty-garden",
    name: "Jardim Liberty",
    regionId: "unova",
    kind: "ilha",
    wiki: "Liberty Garden",
    summary:
      "Ilha com um farol perto de Castelia, acessível por evento. Victini estava selado no porão há séculos. A lenda diz que o pokémon garante vitória a quem o tiver ao lado — e que por isso foi trancado, não protegido.",
    pokemons: ["victini"],
  },

  // ==================== KALOS ====================
  {
    id: "ultimate-weapon",
    name: "Máquina Definitiva",
    regionId: "kalos",
    kind: "marco",
    wiki: "Ultimate weapon",
    summary:
      "Arma construída por AZ há três mil anos para ressuscitar seu Floette morto na guerra. Funcionou — e então ele a virou contra o mundo, encerrando a guerra matando todos. A flor de aço fica soterrada sob Geosenge; Lysandre a reativa.",
    pokemons: ["xerneas", "yveltal", "floette"],
  },
  {
    id: "geosenge-town",
    name: "Geosenge",
    regionId: "kalos",
    kind: "marco",
    wiki: "Geosenge Town",
    summary:
      "Vila cercada por pedras erguidas em memória dos mortos da guerra de AZ. Sob ela está a Máquina Definitiva e o QG da Team Flare. Os moradores vivem em cima do próprio monumento fúnebre sem saber.",
    pokemons: ["xerneas", "yveltal"],
  },
  {
    id: "terminus-cave",
    name: "Caverna Terminus",
    regionId: "kalos",
    kind: "caverna",
    wiki: "Terminus Cave",
    summary:
      "Mina abandonada de trilhos de minério, com uma câmara final onde repousa Zygarde na Forma 50%. As galerias mais fundas foram fechadas porque quem descia não voltava — e a explicação, no fim do corredor, é uma serpente verde de cem metros.",
    pokemons: ["zygarde", "onix", "graveler"],
  },
  {
    id: "diamond-domain",
    name: "Domínio de Diamante",
    regionId: "kalos",
    kind: "caverna",
    wiki: "Diamond Domain",
    summary:
      "Caverna subterrânea de Kalos habitada por Carbink, com um Diancie no centro produzindo diamantes que sustentam o ecossistema. Aparece no filme Diancie and the Cocoon of Destruction — o coração de diamante está morrendo e precisa ser substituído.",
    pokemons: ["diancie", "carbink"],
  },
  {
    id: "pokemon-village",
    name: "Vila Pokémon",
    regionId: "kalos",
    kind: "floresta",
    wiki: "Pokémon Village",
    summary:
      "Clareira escondida atrás do Winding Woods onde vivem pokémon abandonados por seus treinadores. Eles atacam humanos por desconfiança. É o lugar mais melancólico de Kalos e o único ponto do mapa em que se encontra Ditto em grupo.",
    pokemons: ["ditto", "amoonguss", "sudowoodo"],
  },
  {
    id: "sea-spirits-den",
    name: "Covil dos Espíritos do Mar",
    regionId: "kalos",
    kind: "caverna",
    wiki: "Sea Spirit's Den",
    summary:
      "Gruta marinha ao fim da Azure Bay onde Lugia aparece — em Kalos, e não em Johto. Só acessível depois de completar a Pokédex regional, e só quando o tempo abre. Um dos poucos cameos legendários fora da região de origem.",
    pokemons: ["lugia"],
  },
  {
    id: "lost-hotel",
    name: "Hotel Perdido",
    regionId: "kalos",
    kind: "marco",
    wiki: "Lost Hotel",
    summary:
      "Hotel de luxo em ruínas na Route 15, ocupado por punks e por Trubbish e Garbodor que se alimentam do lixo acumulado. Os corredores destruídos são o retrato mais direto do tema de Kalos: beleza que envelheceu mal.",
    pokemons: ["trubbish", "garbodor", "rotom"],
  },

  // ==================== ALOLA ====================
  {
    id: "melemele-island",
    name: "Ilha Melemele",
    regionId: "alola",
    kind: "ilha",
    wiki: "Melemele Island",
    summary:
      "A primeira das quatro ilhas de Alola, guardada por Tapu Koko e liderada pelo Kahuna Hala. É onde o jogador chega, recebe o inicial das mãos de Kukui e faz sua primeira Trial — o sistema que Alola usa em lugar de ginásios.",
    pokemons: ["tapu-koko", "rowlet", "litten", "popplio"],
  },
  {
    id: "akala-island",
    name: "Ilha Akala",
    regionId: "alola",
    kind: "ilha",
    wiki: "Akala Island",
    summary:
      "Segunda ilha, de Tapu Lele e da Kahuna Olivia. Concentra o Wela Volcano, o Lush Jungle e a Aether Paradise ao largo da costa. É aqui que a fachada filantrópica da Aether Foundation começa a rachar.",
    pokemons: ["tapu-lele", "wishiwashi", "salandit"],
  },
  {
    id: "ulaula-island",
    name: "Ilha Ula'ula",
    regionId: "alola",
    kind: "ilha",
    wiki: "Ula'ula Island",
    summary:
      "Maior ilha de Alola, de Tapu Bulu e do Kahuna Nanu — que é, ao mesmo tempo, policial e ex-membro da Team Skull. Tem o Po Town tomado pela gangue e o Aether House, o orfanato de pokémon abandonados.",
    pokemons: ["tapu-bulu", "mimikyu", "sandygast"],
  },
  {
    id: "poni-island",
    name: "Ilha Poni",
    regionId: "alola",
    kind: "ilha",
    wiki: "Poni Island",
    summary:
      "A ilha menos povoada e mais selvagem, de Tapu Fini e da Kahuna Hapu. Guarda o Vast Poni Canyon e, no fim dele, o Altar of the Sunne and Moone — a porta para o Ultra Espaço.",
    pokemons: ["tapu-fini", "kommo-o", "solgaleo", "lunala"],
  },
  {
    id: "altar-sunne-moone",
    name: "Altar do Sol e da Lua",
    regionId: "alola",
    kind: "ruina",
    wiki: "Altar of the Sunne",
    summary:
      "Altar de pedra no alto do Vast Poni Canyon, que muda de forma conforme a hora do dia. Tocando as duas flautas ali, abre-se o buraco de verme por onde Solgaleo ou Lunala atravessa — e por onde Lusamine desapareceu atrás dos Ultra Beasts.",
    pokemons: ["solgaleo", "lunala", "cosmog", "necrozma"],
  },
  {
    id: "ruins-of-conflict",
    name: "Ruínas dos Tapus",
    regionId: "alola",
    kind: "ruina",
    wiki: "Ruins of Conflict",
    summary:
      "Quatro santuários, um por ilha, cada um abrigando seu Tapu. Os quatro guardiões brigaram entre si no passado — o nome do primeiro santuário registra isso. Hoje protegem suas ilhas separadamente e não se falam.",
    pokemons: ["tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini"],
  },
  {
    id: "aether-paradise",
    name: "Paraíso Aether",
    regionId: "alola",
    kind: "laboratorio",
    wiki: "Aether Paradise",
    summary:
      "Ilha artificial da Aether Foundation, apresentada como santuário de pokémon feridos. Nos andares subterrâneos ficam os laboratórios onde Lusamine mantém Ultra Beasts congelados e abre buracos de verme com Cosmog cativo.",
    pokemons: ["nihilego", "cosmog", "type-null"],
  },
  {
    id: "mount-lanakila",
    name: "Monte Lanakila",
    regionId: "alola",
    kind: "montanha",
    wiki: "Mount Lanakila",
    summary:
      "Ponto mais alto de Alola, coberto de neve, onde foi construída a primeira Liga Pokémon da região — que até então não tinha uma. Necrozma aparece aqui em Ultra Sun & Ultra Moon, depois de ser expulso do Ultra Megalopolis.",
    pokemons: ["necrozma", "sneasel", "absol"],
  },
  {
    id: "exeggutor-island",
    name: "Ilha Exeggutor",
    regionId: "alola",
    kind: "ilha",
    wiki: "Exeggutor Island",
    summary:
      "Ilhota ao largo de Akala coberta de Alolan Exeggutor — a forma regional de pescoço absurdamente longo que existe porque o sol de Alola nunca para. É uma piada visual do jogo levada a sério como bioma.",
    pokemons: ["exeggutor", "exeggcute", "pinsir"],
  },
  {
    id: "ultra-space",
    name: "Ultra Espaço",
    regionId: "alola",
    kind: "marco",
    wiki: "Ultra Space",
    summary:
      "Conjunto de dimensões ligadas à nossa por buracos de verme, cada uma com física e clima próprios — Ultra Jungle, Ultra Desert, Ultra Ruin, Ultra Megalopolis. Os Ultra Beasts vêm de lá, e o Ultra Recon Squad atravessa para avisar sobre Necrozma.",
    pokemons: ["nihilego", "buzzwole", "celesteela", "necrozma"],
  },

  // ==================== GALAR ====================
  {
    id: "slumbering-weald",
    name: "Bosque Adormecido",
    regionId: "galar",
    kind: "floresta",
    wiki: "Slumbering Weald",
    summary:
      "Floresta permanentemente enevoada perto de Postwick, onde o jogador e Hop encontram, no primeiro dia, duas silhuetas que ninguém acredita que existiram. São Zacian e Zamazenta — e o jogo espera vinte horas para confirmar isso.",
    pokemons: ["zacian", "zamazenta", "galarian-weezing"],
  },
  {
    id: "energy-plant",
    name: "Usina de Energia",
    regionId: "galar",
    kind: "laboratorio",
    wiki: "Energy Plant",
    summary:
      "Instalação que o Chairman Rose construiu sob Hammerlocke para extrair energia infinita da fonte do Darkest Day. Ele a liga mil anos antes da hora por medo de uma crise energética futura — e desperta Eternatus no meio da final do campeonato.",
    pokemons: ["eternatus", "zacian", "zamazenta"],
  },
  {
    id: "hammerlocke",
    name: "Hammerlocke",
    regionId: "galar",
    kind: "marco",
    wiki: "Hammerlocke",
    summary:
      "Cidade fortificada em torno de um castelo medieval, sede da Macro Cosmos e do maior estádio de Galar. No museu do castelo ficam expostas a Rusted Sword e a Rusted Shield, tratadas como decoração até deixarem de ser.",
    pokemons: ["duraludon", "dragapult"],
  },
  {
    id: "isle-of-armor",
    name: "Ilha da Armadura",
    regionId: "galar",
    kind: "ilha",
    wiki: "Isle of Armor",
    summary:
      "Ilha ao sul de Galar com o dojo do mestre Mustard, ex-Champion. Treinar lá rende Kubfu, que se torna Urshifu de estilo Single Strike ou Rapid Strike — a escolha é definitiva e feita em uma de duas torres.",
    pokemons: ["kubfu", "urshifu", "slowpoke"],
  },
  {
    id: "crown-tundra",
    name: "Tundra da Coroa",
    regionId: "galar",
    kind: "montanha",
    wiki: "Crown Tundra",
    summary:
      "Região ártica ao norte, dirigida por Peony como uma expedição amadora. Reúne os Regis, os pássaros lendários em forma galariana e a lenda do Rei Corcel — Calyrex, que perdeu seu cavalo e seu reino, e quer os dois de volta.",
    pokemons: ["calyrex", "glastrier", "spectrier", "regieleki"],
  },
  {
    id: "freezington",
    name: "Freezington",
    regionId: "galar",
    kind: "marco",
    wiki: "Freezington",
    summary:
      "Vila minúscula na Crown Tundra que cultua Calyrex como o rei que fez a colheita prosperar. A estátua na praça mostra o rei montado — e falta o cavalo. Restaurar Calyrex é, literalmente, remontar a estátua.",
    pokemons: ["calyrex", "glastrier", "spectrier"],
  },

  // ==================== PALDEA ====================
  {
    id: "area-zero",
    name: "Área Zero",
    regionId: "paldea",
    kind: "caverna",
    wiki: "Area Zero",
    summary:
      "Cratera gigantesca no centro de Paldea, cercada por muralhas e quatro postos de observação abandonados. No fundo há um bioma que não corresponde a nenhuma era — porque tem espécies do passado remoto e do futuro distante convivendo.",
    pokemons: ["koraidon", "miraidon", "great-tusk", "iron-treads"],
  },
  {
    id: "zero-lab",
    name: "Laboratório Zero",
    regionId: "paldea",
    kind: "laboratorio",
    wiki: "Zero Lab",
    summary:
      "Instalação no fundo da Área Zero onde Sada ou Turo construiu a máquina do tempo e a IA que assumiu sua identidade. O confronto final é contra o holograma de um cientista morto que não aceita ter sido desligado.",
    pokemons: ["koraidon", "miraidon"],
  },
  {
    id: "glaseado-mountain",
    name: "Montanha Glaseado",
    regionId: "paldea",
    kind: "montanha",
    wiki: "Glaseado Mountain",
    summary:
      "Cordilheira nevada que atravessa o norte de Paldea, com o Ginásio de Gelo de Grusha no topo. É o único ponto do mapa aberto em que a altitude muda a fauna de forma abrupta — e onde o Titan Orthworm cava.",
    pokemons: ["cetitan", "frigibax", "cryogonal"],
  },
  {
    id: "kitakami",
    name: "Kitakami",
    regionId: "paldea",
    kind: "marco",
    wiki: "Kitakami",
    summary:
      "Terra rural visitada em excursão escolar, com festival anual que celebra os Loyal Three como heróis que derrotaram um ogro. A versão oficial está invertida: o ogro era Ogerpon, e os heróis eram os ladrões.",
    pokemons: ["ogerpon", "okidogi", "munkidori", "fezandipiti"],
  },
  {
    id: "blueberry-academy",
    name: "Academia Blueberry",
    regionId: "paldea",
    kind: "laboratorio",
    wiki: "Blueberry Academy",
    summary:
      "Escola dentro de uma cúpula submarina em Unova, com quatro biomas artificiais construídos para treino de campo. É onde Terapagos é encontrado — e onde a irmandade acadêmica de Paldea ganha um espelho estrangeiro.",
    pokemons: ["terapagos", "archaludon"],
  },
];
