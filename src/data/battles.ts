import type { WikiSourced } from "../lib/wiki";

export interface Battle extends WikiSourced {
  id: string;
  title: string;
  location: string;
  era: string;
  contenders: [string, string];
  outcome: string;
  summary: string;
  pokemons: string[];
  color: string;
}

export const BATTLES: Battle[] = [
  {
    id: "red-vs-blue",
    wiki: "Indigo Plateau",
    title: "Red vs Blue — Champion's Hall",
    location: "Indigo Plateau · Kanto",
    era: "Era moderna",
    contenders: ["Red", "Blue Oak"],
    outcome: "Red vence, Blue perde o título de Champion em menos de 24 horas.",
    summary:
      "Blue derrotou a Elite Four minutos antes de Red chegar. Aos 11 anos, Red venceu o então Champion com um Pikachu, Charizard, Venusaur, Blastoise, Snorlax e Espeon. A partida mais rápida entre coroação e destronamento da história.",
    pokemons: ["pikachu", "charizard", "venusaur", "blastoise", "snorlax", "espeon"],
    color: "#dc0a2d",
  },
  {
    id: "gold-vs-red",
    wiki: "Mt. Silver",
    title: "Gold vs Red — no topo do Mount Silver",
    location: "Mount Silver · Fronteira Kanto/Johto",
    era: "Era moderna",
    contenders: ["Gold", "Red"],
    outcome: "Gold vence — a única derrota registrada de Red.",
    summary:
      "Três anos após a coroação, Red vive em silêncio no topo mais frio da fronteira. Gold, o novo Champion de Johto, escala a montanha para desafiá-lo. A batalha acontece sem uma única palavra — apenas seis pokémons versus seis pokémons no vento gelado.",
    pokemons: ["pikachu", "typhlosion", "meganium", "feraligatr"],
    color: "#c48d3a",
  },
  {
    id: "silver-vs-champion",
    wiki: "Lance",
    title: "Silver vs Lance — a redenção",
    location: "Indigo Plateau · Kanto",
    era: "Era moderna",
    contenders: ["Silver", "Lance"],
    outcome: "Silver perde — mas ganha um novo sentido para batalhar.",
    summary:
      "Filho abandonado de Giovanni, Silver treinou apenas com ódio até enfrentar Lance. A derrota o fez perceber que sem laços com seus pokémon, jamais seria forte. Voltou para casa reformado — décadas depois, seria mentor de novos treinadores.",
    pokemons: ["feraligatr", "typhlosion", "meganium", "sneasel"],
    color: "#a1a1a6",
  },
  {
    id: "steven-vs-wallace",
    wiki: "Wallace",
    title: "Steven Stone vs Wallace — sucessão de Hoenn",
    location: "Sootopolis City · Hoenn",
    era: "Era moderna",
    contenders: ["Steven Stone", "Wallace"],
    outcome: "Wallace assume; Steven retorna às pesquisas geológicas.",
    summary:
      "Depois da Delta Episode, Steven abre mão do título para dedicar-se ao estudo das Mega Pedras. Wallace, então Líder de Ginásio, é o sucessor natural. A cerimônia envolveu Metagross vs Milotic em um duelo tranquilo e elegante.",
    pokemons: ["metagross", "milotic"],
    color: "#3a6cb0",
  },
  {
    id: "cynthia-vs-cyrus",
    wiki: "Spear Pillar",
    title: "Cynthia vs Cyrus — Spear Pillar",
    location: "Mount Coronet · Sinnoh",
    era: "Era moderna",
    contenders: ["Cynthia", "Cyrus"],
    outcome: "Cyrus é derrotado; Giratina o arrasta ao Mundo Distorcido.",
    summary:
      "No topo do Mount Coronet, Cyrus invoca Dialga e Palkia para reformar o universo sem emoções. Cynthia, especialista na mitologia sinnohana, o confronta ao lado do protagonista. Giratina emerge do Mundo Distorcido para punir a heresia — e leva Cyrus consigo.",
    pokemons: ["garchomp", "dialga", "palkia", "giratina"],
    color: "#6b4a9b",
  },
  {
    id: "n-vs-alder",
    wiki: "Alder",
    title: "N vs Alder — o discurso dos dragões",
    location: "Rota 10 · Unova",
    era: "Era moderna",
    contenders: ["N", "Alder"],
    outcome: "Alder é derrotado; retira-se em desalento.",
    summary:
      "Alder é o Champion errante de Unova. N o confronta em uma rota deserta com Zoroark projetando ilusões. A derrota de Alder desestabiliza toda a Liga — o discurso da Team Plasma passa a ser tomado a sério pela primeira vez.",
    pokemons: ["zoroark", "volcarona", "bouffalant"],
    color: "#3d5a80",
  },
  {
    id: "champion-vs-n",
    wiki: "N's Castle",
    title: "Champion vs N — o Castelo de Vidro",
    location: "N's Castle · Unova",
    era: "Era moderna",
    contenders: ["Protagonista", "N"],
    outcome: "N é convencido — sua filosofia estava incompleta.",
    summary:
      "N ergue um castelo colossal em torno da Liga durante a noite. Se o protagonista perder, todos os pokémon serão libertados; se vencer, N reconhecerá que treinador e pokémon podem ser parceiros. Reshiram e Zekrom decidem a batalha das eras.",
    pokemons: ["reshiram", "zekrom"],
    color: "#3a3a4a",
  },
  {
    id: "ghetsis-vs-champion",
    wiki: "Giant Chasm",
    title: "Ghetsis e Kyurem Absoluto",
    location: "Giant Chasm · Unova",
    era: "Era moderna",
    contenders: ["Ghetsis", "Protagonista (BW2)"],
    outcome: "Ghetsis é derrotado; a Team Plasma se dissolve em definitivo.",
    summary:
      "Anos após a saída de N, Ghetsis retorna com Kyurem — capaz de fundir-se com Reshiram (Kyurem Branco) ou Zekrom (Kyurem Preto). Sua ambição era congelar Unova e governar do trono. O protagonista o derrota; Ghetsis é preso, mas nunca julgado.",
    pokemons: ["kyurem", "hydreigon"],
    color: "#3a3a4a",
  },
  {
    id: "az-vs-world",
    wiki: "Ultimate weapon",
    title: "AZ vs o mundo — a Máquina Definitiva",
    location: "Geosenge Town · Kalos",
    era: "Reinos humanos (3000 anos atrás)",
    contenders: ["AZ", "O mundo conhecido"],
    outcome: "Kalos devastado. AZ amaldiçoado com imortalidade.",
    summary:
      "Após perder seu Floette na Guerra de Kalos, o rei AZ construiu a Máquina Definitiva alimentada por Xerneas capturado. A arma erradicou exércitos inteiros mas custou a vida do seu próprio Floette. Xerneas o puniu com vida eterna — para sofrer.",
    pokemons: ["xerneas", "yveltal", "floette"],
    color: "#7ac74c",
  },
  {
    id: "lysandre-final",
    wiki: "Team Flare",
    title: "Lysandre e a reativação da Arma",
    location: "Team Flare HQ · Kalos",
    era: "Era moderna",
    contenders: ["Lysandre", "Protagonista"],
    outcome: "Lysandre é enterrado sob as ruínas do laboratório.",
    summary:
      "Lysandre reativou a Máquina Definitiva de AZ para exterminar o resto do mundo. Só os belos sobreviveriam. Xerneas ou Yveltal foi despertado para deter o processo. Lysandre desaba junto do laboratório subterrâneo, seu corpo nunca encontrado.",
    pokemons: ["xerneas", "yveltal", "gyarados-mega"],
    color: "#e63946",
  },
  {
    id: "lusamine-final",
    wiki: "Ultra Space",
    title: "Lusamine fundida com Nihilego",
    location: "Ultra Space · Alola",
    era: "Era moderna",
    contenders: ["Lusamine + Nihilego", "Gladion, Lillie e Protagonista"],
    outcome: "Lusamine é salva por seus próprios filhos.",
    summary:
      "Obcecada pelos Ultra Beasts, Lusamine se funde com Nihilego. Seus filhos Gladion e Lillie a perseguem através do Ultra Wormhole até a arrancarem da fusão. Ela é levada a Kanto para tratamento; Aether volta a funcionar sem a mãe.",
    pokemons: ["nihilego", "silvally", "solgaleo", "lunala"],
    color: "#f7d02c",
  },
  {
    id: "eternatus-galar",
    wiki: "Darkest Day",
    title: "Eternatus e o Darkest Day",
    location: "Hammerlocke Stadium · Galar",
    era: "Era moderna",
    contenders: ["Eternatus", "Zacian, Zamazenta e Protagonista"],
    outcome: "Eternatus é selado (novamente) e capturado.",
    summary:
      "Chairman Rose precipita o Darkest Day para resolver o problema energético mil anos antes da hora. Eternatus emerge do meteoro. Hop empunha Zamazenta enquanto o protagonista maneja Zacian. As espadas se cravam no dragão espacial.",
    pokemons: ["eternatus", "zacian", "zamazenta"],
    color: "#6f35fc",
  },
  {
    id: "leon-champion-cup",
    wiki: "Wyndon",
    title: "Leon vs Protagonista — Champion Cup",
    location: "Wyndon Stadium · Galar",
    era: "Era moderna",
    contenders: ["Leon", "Protagonista"],
    outcome: "Leon perde pela primeira vez em cadeia nacional.",
    summary:
      "Leon nunca perdeu. Sua imagem estava em todos os outdoors de Galar. Charizard Gigantamax era invencível — até o protagonista, um novato promovido por Sonia, quebrar a sequência. Leon se aposenta em paz, torna-se mentor da Battle Tower.",
    pokemons: ["charizard", "dragapult", "aegislash"],
    color: "#dc0a2d",
  },
  {
    id: "volo-vs-arceus",
    wiki: "Volo",
    title: "Volo confronta Arceus",
    location: "Spear Pillar (Hisui) · Sinnoh ancestral",
    era: "Hisui (Sinnoh ancestral)",
    contenders: ["Volo (com Giratina)", "Protagonista (com Arceus)"],
    outcome: "Volo derrotado; sua obsessão eterniza no Mundo Distorcido.",
    summary:
      "Descendente do clã de Cyrus, Volo tenta forçar Arceus a descer e recriar o mundo destruindo-o com Giratina. O protagonista de Hisui, tendo capturado Arceus, o detém em uma batalha épica sobre o Spear Pillar de séculos atrás.",
    pokemons: ["arceus", "giratina", "spiritomb", "togekiss"],
    color: "#735797",
  },
  {
    id: "nemona-final",
    wiki: "Nemona",
    title: "Nemona vs Protagonista — Grand Finale",
    location: "Naranja/Uva Academy · Paldea",
    era: "Era moderna",
    contenders: ["Nemona", "Protagonista"],
    outcome: "Nemona finalmente enfrenta um adversário à altura.",
    summary:
      "Nemona era tão forte que se conteve toda a jornada para não humilhar o protagonista. Só depois que o protagonista se tornou Champion de Paldea (Path of Victory), Nemona pôde soltar sua força total — no telhado da Academia, sob o pôr do sol.",
    pokemons: ["meowscarada", "skeledirge", "quaquaval", "pawmot", "goodra-hisui"],
    color: "#7ac74c",
  },
  {
    id: "ia-sada-turo",
    wiki: "Area Zero",
    title: "IA de Sada/Turo — Área Zero",
    location: "Área Zero · Paldea",
    era: "Era moderna",
    contenders: ["IA Sada/Turo + Paradox Pokémon", "Arven, Nemona, Penny e Protagonista"],
    outcome: "A IA é destruída; Koraidon/Miraidon liberto de sua submissão.",
    summary:
      "Após a morte real dos professores, uma IA continuou os planos. Passou anos alimentando Paradox Pokémon vindos do passado/futuro. Arven, filho do professor, teve que destruir a IA — literalmente matando a memória digital de seu pai — para fechar o portal temporal.",
    pokemons: ["koraidon", "miraidon"],
    color: "#e63946",
  },
];
