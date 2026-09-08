import type { WikiSourced } from "../lib/wiki";

export interface ItemLore extends WikiSourced {
  id: string;
  name: string;
  category: "pokebola" | "sagrado" | "chave" | "cristal" | "livro";
  summary: string;
  pokemons: string[];
  /**
   * Slug do item na PokeAPI. O sprite local sai daqui:
   * `public/sprites/items/<apiSlug>.png`. Itens sem entrada ou sem arquivo no
   * CDN (GS Ball, Mystery Box, N-Solarizer, as mascaras, os livros) ficam sem
   * slug e caem no emblema desenhado.
   */
  apiSlug?: string;
  /** Nome oficial em ingles, quando o nome exibido e traduzido ou agrupado. */
  officialName?: string;
  /** Jogo de estreia. */
  debut?: string;
}

export const ITEMS: ItemLore[] = [
  // ==================== POKÉBOLAS ====================
  {
    id: "master-ball",
    name: "Master Ball",
    category: "pokebola",
    apiSlug: "master-ball",
    debut: "Red & Green (1996)",
    wiki: "Master Ball",
    summary:
      "A pokébola perfeita — captura qualquer pokémon sem falhar. Desenvolvida pela Silph Co. em Saffron City, é o produto mais caro e mais raro do mundo: o jogador recebe exatamente uma por região, das mãos do presidente da empresa ou de um líder. A Team Rocket ocupou a sede da Silph justamente para tomar o protótipo.",
    pokemons: ["mewtwo", "arceus"],
  },
  {
    id: "gs-ball",
    name: "GS Ball",
    category: "pokebola",
    debut: "Pokémon Crystal / anime (2000)",
    wiki: "GS Ball",
    summary:
      "Pokébola dourada com padrão prateado. Nos jogos, era o item de um evento japonês nunca lançado no ocidente: entregue a Kurt em Azalea Town, faria Celebi aparecer em Ilex Forest. No anime, Ash a carregou por uma temporada inteira sem nunca conseguir abri-la — o arco foi abandonado sem explicação.",
    pokemons: ["celebi"],
  },
  {
    id: "poke-flute",
    name: "Poké Flute",
    category: "pokebola",
    apiSlug: "poke-flute",
    debut: "Red & Green (1996)",
    wiki: "Poké Flute",
    summary:
      "Flauta cuja melodia acorda qualquer pokémon adormecido. Necessária para tirar os Snorlax que bloqueiam as rotas 12 e 16 de Kanto. É obtida do Sr. Fuji em Lavender Town, depois que o jogador expulsa a Team Rocket da Pokémon Tower.",
    pokemons: ["snorlax"],
  },

  // ==================== ITENS SAGRADOS ====================
  {
    id: "rainbow-wing",
    name: "Rainbow Wing",
    category: "sagrado",
    apiSlug: "rainbow-wing",
    officialName: "Rainbow Feather",
    debut: "Gold & Silver (1999)",
    wiki: "Rainbow Feather",
    summary:
      "Pena arco-íris de Ho-Oh, deixada quando ela sobrevoa uma alma pura. Levada ao topo da Bell Tower em Ecruteak City, faz Ho-Oh descer para ser desafiado. No anime, Ash a encontra no primeiríssimo episódio — Ho-Oh voa sobre ele antes de o garoto ter sequer capturado um pokémon.",
    pokemons: ["ho-oh"],
  },
  {
    id: "silver-wing",
    name: "Silver Wing",
    category: "sagrado",
    apiSlug: "silver-wing",
    officialName: "Silver Feather",
    debut: "Gold & Silver (1999)",
    wiki: "Silver Feather",
    summary:
      "Pena prateada de Lugia, obtida em Pewter City. Dá acesso ao fundo das Whirl Islands, onde Lugia se esconde. Se a Rainbow Wing é sinal de bênção vinda do céu, a Silver Wing é o convite para descer ao abismo marinho.",
    pokemons: ["lugia"],
  },
  {
    id: "clear-bell",
    name: "Clear Bell",
    category: "sagrado",
    apiSlug: "clear-bell",
    debut: "Gold & Silver (1999)",
    wiki: "Clear Bell",
    summary:
      "Sino de cristal guardado pelos Kimono Girls de Ecruteak. Seu toque ecoa na Bell Tower e chama Ho-Oh. Em HeartGold & SoulSilver foi substituído pela Rainbow Wing, mas segue sendo o item canônico da versão Gold.",
    pokemons: ["ho-oh"],
  },
  {
    id: "tidal-bell",
    name: "Tidal Bell",
    category: "sagrado",
    apiSlug: "tidal-bell",
    debut: "Silver (1999)",
    wiki: "Tidal Bell",
    summary:
      "Par marítimo do Clear Bell. Seu som atravessa a água e alcança Lugia nas profundezas das Whirl Islands. Os dois sinos formam a dupla ritual de Johto: um chama do alto, o outro do fundo.",
    pokemons: ["lugia"],
  },
  {
    id: "light-stone",
    name: "Light Stone",
    category: "sagrado",
    apiSlug: "light-stone",
    debut: "Black & White (2010)",
    wiki: "Light Stone",
    summary:
      "Pedra branca em que Reshiram adormeceu depois que a guerra entre os dois irmãos de Unova partiu o Dragão Original. Fica exposta no museu de Nacrene City por séculos, sem ninguém saber o que é — até despertar diante do herói que busca a verdade.",
    pokemons: ["reshiram"],
  },
  {
    id: "dark-stone",
    name: "Dark Stone",
    category: "sagrado",
    apiSlug: "dark-stone",
    debut: "Black & White (2010)",
    wiki: "Dark Stone",
    summary:
      "Contraparte negra da Light Stone, onde Zekrom dormiu. Desperta para quem busca ideais em vez de verdade. Em Black, é o herói que recebe Reshiram e N que acorda Zekrom; em White, os papéis se invertem.",
    pokemons: ["zekrom"],
  },
  {
    id: "magma-stone",
    name: "Magma Stone",
    category: "sagrado",
    apiSlug: "magma-stone",
    debut: "Platinum (2008)",
    wiki: "Magma Stone",
    summary:
      "Pedra incandescente encravada no coração da Stark Mountain, o vulcão de Sinnoh. Enquanto está no lugar, Heatran habita a montanha; retirada, o pokémon vai embora e o vulcão começa a se agitar. Buck a arranca — e depois precisa devolvê-la.",
    pokemons: ["heatran"],
  },
  {
    id: "lunar-wing",
    name: "Lunar Wing",
    category: "sagrado",
    apiSlug: "lunar-wing",
    officialName: "Lunar Feather",
    debut: "Diamond & Pearl (2006)",
    wiki: "Lunar Feather",
    summary:
      "Pena de Cresselia, a única coisa capaz de acordar quem caiu no pesadelo eterno de Darkrai. Um garoto de Canalave City adormece com terrores; a cura está na Fullmoon Island, e leva o jogador direto ao encontro com Darkrai na Newmoon Island.",
    pokemons: ["cresselia", "darkrai"],
  },
  {
    id: "enigma-stone",
    name: "Enigma Stone",
    category: "sagrado",
    apiSlug: "enigma-stone",
    debut: "HeartGold & SoulSilver (2009)",
    wiki: "Enigma Stone",
    summary:
      "Fragmento de Soul Dew trazido de evento. Levado ao Pewter Museum, revela-se um par de olhos que chama Latias ou Latios para a Southern Island — a ilha que, em Ruby & Sapphire, só existia em cartão de evento.",
    pokemons: ["latias", "latios"],
  },
  {
    id: "sun-flute",
    name: "Sun Flute",
    category: "sagrado",
    apiSlug: "sun-flute",
    debut: "Sun & Moon (2016)",
    wiki: "Sun Flute",
    summary:
      "Uma das duas flautas do Altar of the Sunne, em Poni Island. Tocada no altar sob o sol, abre o portal por onde Solgaleo atravessa — e por onde Lusamine escapou para o Ultra Espaço.",
    pokemons: ["solgaleo", "cosmog"],
  },
  {
    id: "moon-flute",
    name: "Moon Flute",
    category: "sagrado",
    apiSlug: "moon-flute",
    debut: "Sun & Moon (2016)",
    wiki: "Moon Flute",
    summary:
      "Par noturno da Sun Flute, no Altar of the Moone. Chama Lunala. As duas flautas juntas são a chave do buraco de verme que liga Alola ao Ultra Espaço — a mesma tecnologia que a Aether Foundation tentou industrializar.",
    pokemons: ["lunala", "cosmog"],
  },
  {
    id: "azure-flute",
    name: "Azure Flute",
    category: "sagrado",
    apiSlug: "azure-flute",
    debut: "Diamond & Pearl (2006) — nunca distribuída",
    wiki: "Azure Flute",
    summary:
      "Flauta azul que, tocada no topo do Mount Coronet, faz surgir uma escadaria de luz até o Hall of Origin, onde Arceus repousa. Está programada nos jogos, com música própria e cutscene completa — mas a Nintendo nunca a distribuiu oficialmente. É o item mais famoso que nenhum jogador legítimo obteve.",
    pokemons: ["arceus"],
  },
  {
    id: "prison-bottle",
    name: "Prison Bottle",
    category: "sagrado",
    apiSlug: "prison-bottle",
    debut: "Omega Ruby & Alpha Sapphire (2014)",
    wiki: "Prison Bottle",
    summary:
      "Garrafa antiga que aprisiona o poder verdadeiro de Hoopa. Contido, Hoopa é infantil e travesso (Confined); solto, vira o gigante de seis braços que arrasou uma cidade inteira há cem anos — e que os anciãos selaram de volta no gargalo da garrafa.",
    pokemons: ["hoopa"],
  },

  // ==================== ITENS-CHAVE (transformações) ====================
  {
    id: "adamant-orb",
    name: "Adamant Orb",
    category: "chave",
    apiSlug: "adamant-orb",
    debut: "Diamond & Pearl (2006)",
    wiki: "Adamant Orb",
    summary:
      "Esfera antiga que amplifica os golpes Dragão e Aço de Dialga. Guardada como oferenda pelos antigos sinnohanos. Em Legends: Arceus, é uma das peças que Volo precisa para invocar o senhor do tempo.",
    pokemons: ["dialga"],
  },
  {
    id: "lustrous-orb",
    name: "Lustrous Orb",
    category: "chave",
    apiSlug: "lustrous-orb",
    debut: "Diamond & Pearl (2006)",
    wiki: "Lustrous Orb",
    summary:
      "Esfera perolada de Palkia, que reforça seus golpes Dragão e Água. Forma par com a Adamant no altar do Spear Pillar — as duas juntas são o que a Team Galactic precisava para forçar tempo e espaço a obedecer.",
    pokemons: ["palkia"],
  },
  {
    id: "griseous-orb",
    name: "Griseous Orb",
    category: "chave",
    apiSlug: "griseous-orb",
    debut: "Platinum (2008)",
    wiki: "Griseous Orb",
    summary:
      "Esfera de platina que mantém Giratina na forma Origin fora do Mundo Distorcido. Sem ela, o corpo de Giratina se reajusta às leis físicas do nosso mundo e volta à forma Altered. Amplifica Fantasma e Dragão.",
    pokemons: ["giratina"],
  },
  {
    id: "red-orb",
    name: "Red Orb",
    category: "chave",
    apiSlug: "red-orb",
    debut: "Ruby (2002)",
    wiki: "Red Orb",
    summary:
      "Relíquia guardada no Mt. Pyre que desperta Groudon. A Team Magma a roubou para provocar a seca que expandiria os continentes. Em Omega Ruby, o orbe vai além: aciona a Primal Reversion, que devolve a Groudon a forma que ele tinha no nascimento do mundo.",
    pokemons: ["groudon"],
  },
  {
    id: "blue-orb",
    name: "Blue Orb",
    category: "chave",
    apiSlug: "blue-orb",
    debut: "Sapphire (2002)",
    wiki: "Blue Orb",
    summary:
      "Par do Red Orb, ligado a Kyogre. Roubado pela Team Aqua para afundar as terras sob o mar. Os dois orbes ficavam lado a lado no cume do Mt. Pyre justamente para que nenhuma das duas forças fosse acordada sozinha.",
    pokemons: ["kyogre"],
  },
  {
    id: "jade-orb",
    name: "Jade Orb",
    category: "chave",
    apiSlug: "jade-orb",
    debut: "Emerald (2004)",
    wiki: "Jade Orb",
    summary:
      "Terceiro orbe de Hoenn, ligado a Rayquaza — o árbitro que interrompe a briga entre Groudon e Kyogre. Aparece em Emerald como recompensa depois que o jogador impede o cataclismo, fechando o trio de esferas.",
    pokemons: ["rayquaza"],
  },
  {
    id: "red-chain",
    name: "Red Chain",
    category: "chave",
    apiSlug: "red-chain",
    debut: "Diamond & Pearl (2006)",
    wiki: "Red Chain",
    summary:
      "Corrente forjada com os Red Shards dos três lagos de Sinnoh. Para fazê-la, Cyrus extraiu à força as memórias de Uxie, Mesprit e Azelf. Com ela, acorrentou Dialga e Palkia no Spear Pillar — até Giratina abrir um portal e arrastá-lo para o Mundo Distorcido.",
    pokemons: ["dialga", "palkia", "uxie", "mesprit", "azelf"],
  },
  {
    id: "dna-splicers",
    name: "DNA Splicers",
    category: "chave",
    apiSlug: "dna-splicers",
    debut: "Black 2 & White 2 (2012)",
    wiki: "DNA Splicers",
    summary:
      "Aparelho da Team Plasma projetado por Colress. Funde Kyurem com Reshiram (Kyurem Branco) ou Zekrom (Kyurem Preto), reconstituindo em parte o Dragão Original. A fusão nunca é perfeita — Kyurem é a carcaça que sobrou da divisão, e absorver o irmão só cria uma quimera instável.",
    pokemons: ["kyurem", "reshiram", "zekrom"],
  },
  {
    id: "reveal-glass",
    name: "Reveal Glass",
    category: "chave",
    apiSlug: "reveal-glass",
    debut: "Black 2 & White 2 (2012)",
    wiki: "Reveal Glass",
    summary:
      "Espelho que mostra a verdadeira forma dos Kami de Unova. Tornandus, Thundurus e Landorus vivem em forma Incarnate, humanoide; diante do espelho, revelam a forma Therian — bestial, e a que aparece nas lendas dos camponeses.",
    pokemons: ["tornadus", "thundurus", "landorus"],
  },
  {
    id: "zygarde-cube",
    name: "Zygarde Cube",
    category: "chave",
    apiSlug: "zygarde-cube",
    debut: "Sun & Moon (2016)",
    wiki: "Zygarde Cube",
    summary:
      "Cubo científico que armazena as Zygarde Cells e Cores espalhadas por Alola. Zygarde não é um indivíduo: é um enxame. 10 células formam a Forma 10%; 50, a Forma 50%; com 100 células e o Core, a Forma Complete — o guardião do equilíbrio ecológico em corpo inteiro.",
    pokemons: ["zygarde"],
  },
  {
    id: "rusted-sword",
    name: "Rusted Sword / Rusted Shield",
    category: "chave",
    officialName: "Rusted Sword, Rusted Shield",
    debut: "Sword & Shield (2019)",
    wiki: "Rusted Sword",
    summary:
      "As duas armas ancestrais com que os heróis de Galar detiveram Eternatus no Darkest Day. Passados três mil anos, enferrujadas e expostas como relíquia em Hammerlocke, ainda transformam Zacian em Crowned Sword e Zamazenta em Crowned Shield.",
    pokemons: ["zacian", "zamazenta"],
  },
  {
    id: "ogerpon-masks",
    name: "Máscaras de Ogerpon",
    category: "chave",
    officialName: "Teal / Wellspring / Hearthflame / Cornerstone Mask",
    debut: "The Teal Mask (2023)",
    wiki: "Teal Mask",
    summary:
      "Quatro máscaras cerimoniais de Kitakami. Cada uma troca o tipo secundário de Ogerpon: Água, Fogo ou Rocha. A lenda oficial da vila conta que os Loyal Three eram heróis que recuperaram as máscaras roubadas por Ogerpon — a verdade é o inverso, e o jogo leva o DLC inteiro para admitir isso.",
    pokemons: ["ogerpon"],
  },
  {
    id: "meltan-box",
    name: "Mystery Box",
    category: "chave",
    debut: "Pokémon GO / Let's Go (2018)",
    wiki: "Mystery Box",
    summary:
      "Caixa dourada liberada ao transferir um pokémon para Let's Go ou Pokémon HOME. Ativada, atrai Meltan por meia hora no Pokémon GO. É o único caminho para Melmetal: o Meltan que vem do HOME não evolui — só o capturado no GO e transferido.",
    pokemons: ["meltan", "melmetal"],
  },
  {
    id: "gracidea",
    name: "Gracidea",
    category: "chave",
    apiSlug: "gracidea",
    debut: "Diamond & Pearl (2006)",
    wiki: "Gracidea",
    summary:
      "Buquê de flores que transforma Shaymin na Sky Forme. Só funciona de dia e enquanto Shaymin não estiver congelado ou adormecido — de noite, ele reverte para a Land Forme sozinho. As flores são o agradecimento de uma florista de Floaroma.",
    pokemons: ["shaymin"],
  },
  {
    id: "member-card",
    name: "Member Card",
    category: "chave",
    apiSlug: "member-card",
    debut: "Diamond & Pearl (2006)",
    wiki: "Member Card",
    summary:
      "Cartão de evento que abre a porta de uma hospedaria em Canalave City. Dormindo lá, o jogador sonha com a Newmoon Island — e acorda nela, de frente para Darkrai. Sem o cartão, a ilha não existe no mapa.",
    pokemons: ["darkrai"],
  },
  {
    id: "oaks-letter",
    name: "Oak's Letter",
    category: "chave",
    apiSlug: "oaks-letter",
    debut: "Diamond & Pearl (2006)",
    wiki: "Oak's Letter",
    summary:
      "Carta do Professor Oak pedindo que o jogador investigue Route 224. No fim da trilha está o Flower Paradise, onde vivem os Shaymin. É o par narrativo do Member Card: um leva ao pokémon dos pesadelos, o outro ao das flores.",
    pokemons: ["shaymin"],
  },
  {
    id: "secret-key",
    name: "Secret Key",
    category: "chave",
    apiSlug: "secret-key",
    debut: "Platinum (2008)",
    wiki: "Secret Key",
    summary:
      "Chave de evento que destranca uma sala nos fundos do Team Galactic HQ em Eterna. Lá dentro há eletrodomésticos que permitem a Rotom possuir cada um deles — as cinco formas alternativas do pokémon-fantasma elétrico.",
    pokemons: ["rotom"],
  },
  {
    id: "silph-scope",
    name: "Silph Scope",
    category: "chave",
    apiSlug: "silph-scope",
    debut: "Red & Green (1996)",
    wiki: "Silph Scope",
    summary:
      "Aparelho da Silph Co. que revela a identidade de pokémon fantasmas. Sem ele, os andares da Pokémon Tower são intransponíveis. Com ele, o vulto do último andar se revela: o Marowak que a Team Rocket matou defendendo seu filhote.",
    pokemons: ["marowak", "cubone", "gastly"],
  },
  {
    id: "dowsing-machine",
    name: "Dowsing Machine",
    category: "chave",
    apiSlug: "dowsing-machine",
    debut: "Red & Green (1996)",
    wiki: "Dowsing Machine",
    summary:
      "Detector de itens enterrados, chamado Itemfinder nas primeiras gerações. É a ferramenta que sustenta metade da arqueologia amadora do mundo pokémon — dos fósseis do Mt. Moon às Zygarde Cells de Alola.",
    pokemons: ["baltoy", "claydol"],
  },

  // ==================== CRISTAIS ====================
  {
    id: "plates",
    name: "Plates de Arceus",
    category: "cristal",
    apiSlug: "draco-plate",
    officialName: "Plate (17 variantes)",
    debut: "Diamond & Pearl (2006)",
    wiki: "Plate",
    summary:
      "Dezessete tabuletas de pedra espalhadas por Sinnoh, uma para cada tipo além do Normal. Seguradas por Arceus, mudam seu tipo — porque são fragmentos da própria substância com que ele moldou o mundo. Reunidas, são o inventário completo da criação.",
    pokemons: ["arceus"],
  },
  {
    id: "mega-stones",
    name: "Mega Stones",
    category: "cristal",
    apiSlug: "charizardite-x",
    officialName: "Mega Stone (48 variantes)",
    debut: "X & Y (2013)",
    wiki: "Mega Stone",
    summary:
      "Cristais formados quando a Máquina Definitiva de AZ detonou há três mil anos e a energia de Xerneas se condensou na rocha de Kalos. Combinados a uma Key Stone empunhada por um treinador com laço forte o bastante, produzem a Mega Evolução.",
    pokemons: ["xerneas", "charizard", "gyarados", "lucario"],
  },
  {
    id: "key-stone",
    name: "Key Stone",
    category: "cristal",
    apiSlug: "key-stone",
    debut: "X & Y (2013)",
    wiki: "Key Stone",
    summary:
      "A metade humana da Mega Evolução. Fica engastada em luva, broche ou pulseira do treinador e ressoa com a Mega Stone do pokémon. Sem vínculo afetivo real entre os dois, a pedra não responde — é o único item da série que exige uma condição emocional.",
    pokemons: ["lucario", "gardevoir"],
  },
  {
    id: "z-crystals",
    name: "Z-Crystals",
    category: "cristal",
    apiSlug: "z-power-ring",
    officialName: "Z-Crystal / Z-Power Ring",
    debut: "Sun & Moon (2016)",
    wiki: "Z-Crystal",
    summary:
      "Cristais elementais guardados pelos Kahunas e entregues a cada Trial vencido. Encaixados no Z-Power Ring, liberam um Z-Move por batalha. Alguns são exclusivos de uma espécie — Pikanium Z só serve a Pikachu, e o Alolan Meowth tem o seu próprio.",
    pokemons: ["pikachu", "tapu-koko"],
  },
  {
    id: "soul-dew",
    name: "Soul Dew",
    category: "cristal",
    apiSlug: "soul-dew",
    debut: "Ruby & Sapphire (2002)",
    wiki: "Soul Dew",
    summary:
      "Gota cristalizada encontrada na Southern Island, ligada à alma de Latias e Latios. Segurada por um dos dois, reforça seus golpes Psíquico e Dragão. A descrição do item diz que é a alma de um dos irmãos — o que torna equipá-la desconfortavelmente literal.",
    pokemons: ["latias", "latios"],
  },

  // ==================== LIVROS / DIÁRIOS ====================
  {
    id: "scarlet-violet-book",
    name: "Scarlet Book / Violet Book",
    category: "livro",
    officialName: "Scarlet Book, Violet Book",
    debut: "Scarlet & Violet (2022)",
    wiki: "Scarlet Book",
    summary:
      "Diários de campo dos professores Sada (Scarlet) e Turo (Violet) sobre a Área Zero. Descrevem os Paradox Pokémon e o funcionamento do portal temporal, entremeados a anotações pessoais cada vez mais instáveis. O jogador os lê sabendo, desde o começo, que os autores não estão vivos.",
    pokemons: ["koraidon", "miraidon"],
  },
  {
    id: "sinnoh-lore-books",
    name: "Livros da Biblioteca de Canalave",
    category: "livro",
    debut: "Diamond & Pearl (2006)",
    wiki: "Canalave Library",
    summary:
      "Coleção de mitos no segundo andar da biblioteca de Canalave. Contam a criação de Dialga, Palkia e Giratina e a origem de Uxie, Mesprit e Azelf. O terceiro volume afirma que 'humanos e pokémon eram um só' — a frase que Cyrus leu como licença para desmontar o universo.",
    pokemons: ["arceus", "dialga", "palkia", "giratina"],
  },
];
