// Coordenadas SVG estilizadas — 1000x600 viewbox.
// Cada região é um "continente" organico com sua cor tema.

export interface RegionShape {
  id: string;
  color: string;
  path: string;      // SVG path d
  labelX: number;
  labelY: number;
  centerX: number;   // para o marcador
  centerY: number;
}

export const REGION_SHAPES: RegionShape[] = [
  // ==== Unova — extrema esquerda (NYC) ====
  {
    id: "unova",
    color: "#3a3a4a",
    path: "M 140,180 Q 175,170 195,190 Q 215,220 205,255 Q 200,290 210,320 Q 200,345 175,350 Q 145,345 130,320 Q 115,290 120,260 Q 118,220 140,180 Z",
    labelX: 165, labelY: 265,
    centerX: 165, centerY: 265,
  },

  // ==== Sinnoh — norte-central ====
  {
    id: "sinnoh",
    color: "#3a6cb0",
    path: "M 400,80 Q 445,70 475,90 Q 500,115 490,150 Q 470,170 435,165 Q 400,160 385,140 Q 380,110 400,80 Z",
    labelX: 435, labelY: 125,
    centerX: 435, centerY: 125,
  },

  // ==== Johto — centro-esquerda ====
  {
    id: "johto",
    color: "#c48d3a",
    path: "M 340,240 Q 380,225 405,245 Q 420,275 410,305 Q 395,325 370,325 Q 340,320 328,295 Q 322,265 340,240 Z",
    labelX: 370, labelY: 280,
    centerX: 370, centerY: 280,
  },

  // ==== Kanto — centro (colado no Johto) ====
  {
    id: "kanto",
    color: "#dc0a2d",
    path: "M 420,235 Q 465,220 495,245 Q 515,275 505,310 Q 490,335 460,335 Q 425,335 410,310 Q 400,275 420,235 Z",
    labelX: 460, labelY: 285,
    centerX: 460, centerY: 285,
  },

  // ==== Hoenn — sul, ilha ====
  {
    id: "hoenn",
    color: "#a83a2c",
    path: "M 380,395 Q 425,380 460,400 Q 480,425 470,455 Q 455,480 420,485 Q 385,485 368,460 Q 358,425 380,395 Z",
    labelX: 420, labelY: 435,
    centerX: 420, centerY: 435,
  },

  // ==== Alola — sul-oeste, 4 ilhas ====
  {
    id: "alola",
    color: "#f7b32b",
    path:
      "M 220,470 Q 235,460 250,470 Q 255,485 245,495 Q 230,500 220,490 Q 213,478 220,470 Z " +
      "M 260,490 Q 275,478 292,490 Q 300,505 288,518 Q 273,525 260,515 Q 252,502 260,490 Z " +
      "M 195,510 Q 210,502 225,512 Q 232,525 220,535 Q 205,540 195,528 Q 188,518 195,510 Z " +
      "M 245,525 Q 260,518 273,530 Q 278,542 268,552 Q 253,555 243,545 Q 238,532 245,525 Z",
    labelX: 240, labelY: 570,
    centerX: 245, centerY: 510,
  },

  // ==== Galar — nordeste (UK) ====
  {
    id: "galar",
    color: "#3d5a80",
    path: "M 660,90 Q 690,80 705,105 Q 715,140 700,170 Q 705,200 695,225 Q 680,245 660,235 Q 645,215 650,190 Q 640,155 655,120 Q 655,100 660,90 Z",
    labelX: 680, labelY: 165,
    centerX: 680, centerY: 165,
  },

  // ==== Kalos — leste (França/hexágono) ====
  {
    id: "kalos",
    color: "#c8ab74",
    path: "M 700,290 L 745,275 L 780,300 L 780,345 L 745,370 L 700,355 Z",
    labelX: 740, labelY: 325,
    centerX: 740, centerY: 322,
  },

  // ==== Paldea — sudeste (península) ====
  {
    id: "paldea",
    color: "#e63946",
    path: "M 655,395 Q 705,380 750,395 Q 785,410 790,445 Q 780,480 745,490 Q 705,495 670,485 Q 640,470 640,435 Q 645,410 655,395 Z",
    labelX: 715, labelY: 440,
    centerX: 715, centerY: 440,
  },
];
