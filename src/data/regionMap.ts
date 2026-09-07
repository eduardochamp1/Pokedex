// Coordenadas SVG do mapa mundi Pokémon — 1000x600 viewbox.
// Paths desenhados para lembrar as geografias reais que cada região representa:
//   Continente Japão: Sinnoh (Hokkaido), Johto+Kanto (Honshu), Hoenn (Kyushu)
//   Pacífico: Alola (Hawaii, 4 ilhas)
//   Continente America: Unova (Manhattan/NYC)
//   Continente Europa: Galar (UK), Kalos (França hexagonal), Paldea (Ibéria)

export interface RegionShape {
  id: string;
  color: string;
  path: string;
  labelX: number;
  labelY: number;
  centerX: number;
  centerY: number;
}

export const REGION_SHAPES: RegionShape[] = [
  // ==== CONTINENTE JAPÃO (esquerda-centro) ====

  // Sinnoh — Hokkaido: massa arredondada ao norte
  {
    id: "sinnoh",
    color: "#3a6cb0",
    path:
      "M 205,105 C 235,95 275,100 305,115 C 330,130 340,155 335,180 " +
      "C 325,200 300,210 275,208 C 250,205 220,195 205,175 C 195,155 195,125 205,105 Z",
    labelX: 270, labelY: 160,
    centerX: 270, centerY: 155,
  },

  // Johto — Kansai: península oeste conectada ao Kanto
  {
    id: "johto",
    color: "#c48d3a",
    path:
      "M 190,255 C 210,235 240,232 265,240 " +
      "C 275,245 280,258 275,270 " +
      "C 285,275 290,290 280,305 " +
      "C 265,320 235,325 210,315 " +
      "C 190,305 180,285 185,270 C 187,262 188,258 190,255 Z",
    labelX: 235, labelY: 280,
    centerX: 235, centerY: 278,
  },

  // Kanto — Honshu leste (encostado no Johto)
  {
    id: "kanto",
    color: "#dc0a2d",
    path:
      "M 270,240 C 300,232 330,240 355,255 " +
      "C 380,270 395,290 400,315 " +
      "C 400,335 385,345 365,345 " +
      "C 335,345 305,340 285,325 " +
      "C 268,310 260,285 270,270 C 275,258 272,250 270,240 Z",
    labelX: 335, labelY: 292,
    centerX: 335, centerY: 292,
  },

  // Hoenn — Kyushu: ilha sul com formato irregular
  {
    id: "hoenn",
    color: "#a83a2c",
    path:
      "M 190,395 C 215,385 245,388 270,400 " +
      "C 290,410 300,430 295,450 " +
      "C 285,470 265,480 240,478 " +
      "C 215,475 195,462 185,442 " +
      "C 180,425 182,408 190,395 Z " +
      "M 260,465 C 270,462 278,468 276,478 C 273,485 262,485 258,478 C 255,472 256,467 260,465 Z",
    labelX: 240, labelY: 430,
    centerX: 240, centerY: 435,
  },

  // ==== PACÍFICO — Alola (Hawaii, 4 ilhas) ====
  {
    id: "alola",
    color: "#f7b32b",
    path:
      // Melemele (NW)
      "M 460,430 C 475,425 490,432 493,445 C 490,455 478,458 465,455 C 456,450 455,438 460,430 Z " +
      // Akala (N)
      "M 505,455 C 520,450 538,458 542,472 C 538,485 522,487 508,482 C 498,477 498,464 505,455 Z " +
      // Ula'ula (mid) — maior
      "M 545,485 C 570,478 595,488 602,505 C 605,522 588,532 565,530 C 545,527 535,512 540,498 C 541,492 542,488 545,485 Z " +
      // Poni (SE)
      "M 510,530 C 528,527 542,538 540,552 C 535,563 518,565 508,558 C 502,550 502,538 510,530 Z",
    labelX: 530, labelY: 585,
    centerX: 530, centerY: 495,
  },

  // ==== AMÉRICAS — Unova (NYC) ====
  {
    id: "unova",
    color: "#3a3a4a",
    path:
      // Manhattan-esque: forma vertical longa com peninsulas
      "M 640,155 C 660,148 675,155 682,170 " +
      "C 688,185 685,205 680,220 " +
      "C 683,238 680,258 672,275 " +
      "C 675,295 668,315 655,320 " +
      "C 638,318 628,300 632,283 " +
      "C 625,265 628,242 636,225 " +
      "C 632,205 632,185 640,168 " +
      "C 640,163 640,158 640,155 Z",
    labelX: 655, labelY: 240,
    centerX: 655, centerY: 240,
  },

  // ==== EUROPA (direita) ====

  // Galar — Great Britain (comprimento norte-sul, com "Scotland" apontando NW)
  {
    id: "galar",
    color: "#3d5a80",
    path:
      "M 758,120 C 770,110 785,113 795,125 " +
      "C 800,140 800,155 795,170 " +
      // Cornualha bulge
      "C 810,175 815,185 810,198 " +
      "C 800,215 782,220 770,215 " +
      "C 760,210 755,195 755,180 " +
      "C 748,165 745,148 750,135 C 752,128 755,123 758,120 Z",
    labelX: 780, labelY: 165,
    centerX: 780, centerY: 165,
  },

  // Kalos — França: hexágono clássico
  {
    id: "kalos",
    color: "#c8ab74",
    path:
      "M 810,290 L 852,275 L 892,300 L 895,345 L 855,368 L 812,352 Z",
    labelX: 852, labelY: 325,
    centerX: 852, centerY: 322,
  },

  // Paldea — Península Ibérica: retângulo com contorno costeiro
  {
    id: "paldea",
    color: "#e63946",
    path:
      "M 760,400 C 785,392 815,395 845,398 " +
      "C 875,402 895,415 900,435 " +
      "C 900,458 880,475 855,478 " +
      "C 820,485 785,482 762,472 " +
      "C 745,462 743,445 748,425 C 750,415 754,405 760,400 Z",
    labelX: 825, labelY: 438,
    centerX: 825, centerY: 438,
  },
];
