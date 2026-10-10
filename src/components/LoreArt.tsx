import type { ReactElement } from "react";
import { REGION_SHAPES } from "../data/regionMap";

/* ============ Villain emblems ============ */

interface VillainProps {
  teamId: string;
  color: string;
}

export const VillainEmblem = ({ teamId, color }: VillainProps) => {
  return (
    <svg viewBox="0 0 100 100" className="lore-art-emblem" aria-hidden="true">
      <defs>
        <radialGradient id={`vg-${teamId}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#vg-${teamId})`} stroke={color} strokeWidth="2" />
      <g fill="white" stroke={color} strokeWidth="1">
        {villainSymbol(teamId)}
      </g>
    </svg>
  );
};

function villainSymbol(id: string) {
  switch (id) {
    case "rocket":
      // Big R
      return (
        <text x="50" y="66" fontSize="52" fontWeight="900" textAnchor="middle" fontFamily="serif">R</text>
      );
    case "magma":
      // Flame
      return (
        <path
          d="M50 22 C42 34, 42 42, 46 50 C40 52, 38 60, 42 68 C46 74, 54 74, 58 68 C62 60, 60 52, 54 50 C58 42, 58 34, 50 22 Z"
          strokeWidth="2"
        />
      );
    case "aqua":
      // Wave
      return (
        <path
          d="M22 60 Q35 45, 50 60 T78 60 L78 74 Q65 62, 50 74 T22 74 Z"
          strokeWidth="2"
        />
      );
    case "galactic":
      // Astral G
      return (
        <>
          <circle cx="50" cy="50" r="20" fill="none" strokeWidth="3" stroke="white" />
          <text x="50" y="60" fontSize="26" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">G</text>
        </>
      );
    case "plasma":
      // Diamond P
      return (
        <>
          <polygon points="50,20 80,50 50,80 20,50" fill="none" strokeWidth="3" stroke="white" />
          <text x="50" y="60" fontSize="26" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">P</text>
        </>
      );
    case "flare":
      // F with sparks
      return (
        <>
          <text x="50" y="62" fontSize="44" fontWeight="900" textAnchor="middle" fontFamily="serif">F</text>
          <circle cx="28" cy="30" r="3" strokeWidth="0" />
          <circle cx="76" cy="35" r="2" strokeWidth="0" />
          <circle cx="78" cy="72" r="2.5" strokeWidth="0" />
        </>
      );
    case "skull":
      // Skull silhouette
      return (
        <>
          <path
            d="M50 20 C36 20, 26 32, 26 46 C26 56, 30 62, 34 66 L36 76 C36 79, 39 80, 42 78 L44 74 L56 74 L58 78 C61 80, 64 79, 64 76 L66 66 C70 62, 74 56, 74 46 C74 32, 64 20, 50 20 Z"
            fill="white"
            strokeWidth="2"
          />
          <circle cx="40" cy="46" r="4" fill="#000" strokeWidth="0" />
          <circle cx="60" cy="46" r="4" fill="#000" strokeWidth="0" />
          <path d="M46 58 L50 66 L54 58" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      );
    case "aether":
      // Aether hex
      return (
        <>
          <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="none" strokeWidth="3" stroke="white" />
          <circle cx="50" cy="50" r="8" fill="white" strokeWidth="0" />
        </>
      );
    case "macro":
      // Gear MC
      return (
        <>
          <circle cx="50" cy="50" r="22" fill="none" strokeWidth="3" stroke="white" />
          <circle cx="50" cy="50" r="8" fill="white" strokeWidth="0" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <rect
              key={deg}
              x="47" y="20" width="6" height="10"
              fill="white"
              strokeWidth="0"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </>
      );
    case "star":
      // 5-pointed star
      return (
        <polygon
          points="50,20 58,42 82,42 62,56 70,80 50,64 30,80 38,56 18,42 42,42"
          fill="white"
          strokeWidth="2"
        />
      );
    default:
      return (
        <text x="50" y="64" fontSize="36" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">?</text>
      );
  }
}

/* ============ Region mini-map ============ */

interface RegionIconProps {
  regionId: string;
  color: string;
}

export const RegionMapIcon = ({ regionId, color }: RegionIconProps) => {
  const shape = REGION_SHAPES.find((s) => s.id === regionId);
  if (!shape) return null;
  return (
    <svg viewBox="0 0 1000 600" className="lore-art-region" aria-hidden="true">
      <defs>
        <radialGradient id={`rg-${regionId}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0d1f38" />
          <stop offset="100%" stopColor="#0b1729" />
        </radialGradient>
      </defs>
      <rect width="1000" height="600" fill={`url(#rg-${regionId})`} />
      <path
        d={shape.path}
        fill={color}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
    </svg>
  );
};

/* ============ Dimension portal ============ */

interface DimensionProps {
  dimId: string;
  color: string;
  /**
   * Sprite local (public/sprites) do habitante que assina a dimensão. A arte
   * da Lore é desenhada aqui de propósito — a arte dos jogos é da Nintendo e
   * o Bulbapedia bloqueia hotlink, então a wiki entra como fonte citada e a
   * ilustração é SVG próprio. O sprite que o projeto já serve é a única
   * figura real da cena, e entra como habitante, não como ilustração.
   */
  spriteUrl?: string;
}

/**
 * Levanta a cor da dimensão até ela ter presença sobre o fundo quase preto
 * da cena.
 *
 * A mesma armadilha da tinta dos verbetes, agora em desenho: #3a3a4a do
 * Reverse World e #4a3663 do Mundo Distorcido rendem 1,7:1 contra #080910 —
 * a montanha, a racha e o anel simplesmente não apareciam. Cores que já têm
 * presença passam intactas, então só os tons escuros são tocados.
 */
function litFor(hex: string): string {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  if (rgb.some(Number.isNaN)) return hex;
  const lum = (c: number[]) =>
    c
      .map((v) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
      })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const fundo = lum([8, 9, 16]);
  const razao = (c: number[]) => (lum(c) + 0.05) / (fundo + 0.05);
  let p = 0;
  let atual = rgb;
  while (razao(atual) < 3 && p < 0.6) {
    p += 0.05;
    atual = rgb.map((v) => Math.round(v * (1 - p) + 255 * p));
  }
  return "#" + atual.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Onde o habitante pousa na cena, em coordenadas do viewBox 320x180. */
const DIM_SPRITE: Record<string, { x: number; y: number; size: number }> = {
  distortion: { x: 118, y: 40, size: 84 },
  ultraspace: { x: 46, y: 56, size: 62 },
  dreamworld: { x: 124, y: 48, size: 72 },
  sinjoh: { x: 122, y: 16, size: 76 },
  hisui: { x: 180, y: 98, size: 66 },
  terastal: { x: 128, y: 74, size: 64 },
  shadow: { x: 120, y: 34, size: 82 },
};

export const DimensionPortal = ({ dimId, color, spriteUrl }: DimensionProps) => {
  const box = DIM_SPRITE[dimId] ?? { x: 124, y: 54, size: 72 };
  const lit = litFor(color);
  const scene = dimensionScene(dimId, lit);
  return (
    <svg viewBox="0 0 320 180" className="lore-art-portal" aria-hidden="true">
      <defs>
        <radialGradient id={`dp-${dimId}`} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor={lit} stopOpacity="0.5" />
          <stop offset="55%" stopColor={lit} stopOpacity="0.16" />
          <stop offset="100%" stopColor={lit} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`dv-${dimId}`} cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <filter id={`db-${dimId}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <rect width="320" height="180" fill="#080910" />
      <rect width="320" height="180" fill={`url(#dp-${dimId})`} />
      {scene.back}

      {spriteUrl && (
        <image
          href={spriteUrl}
          x={box.x}
          y={box.y}
          width={box.size}
          height={box.size}
          style={{ imageRendering: "pixelated" }}
        />
      )}

      {scene.front}
      <rect width="320" height="180" fill={`url(#dv-${dimId})`} />
    </svg>
  );
};

interface Scene {
  back: ReactElement;
  front?: ReactElement;
}

function dimensionScene(id: string, color: string): Scene {
  switch (id) {
    // Mundo Distorcido: lajes soltas e o mesmo mundo repetido de cabeça para
    // baixo. A gravidade quebrada é o assunto, então o espelho é a cena.
    case "distortion": {
      const lajes = [
        { x: 14, y: 68, w: 82, r: -13 },
        { x: 206, y: 54, w: 96, r: 10 },
        { x: 96, y: 132, w: 112, r: -4 },
        { x: 236, y: 118, w: 62, r: -8 },
      ];
      const slab = (s: (typeof lajes)[number], i: number) => (
        <g key={i} transform={`rotate(${s.r} ${s.x + s.w / 2} ${s.y})`}>
          <rect x={s.x} y={s.y} width={s.w} height="6" fill={color} />
          <rect x={s.x + 7} y={s.y + 6} width={s.w - 14} height="4" fill="#000" opacity="0.45" />
        </g>
      );
      return {
        back: (
          <>
            <g stroke={color} strokeWidth="0.6" opacity="0.22" fill="none">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <path key={i} d={`M ${i * 46} 0 C ${i * 46 + 26} 60, ${i * 46 - 26} 120, ${i * 46} 180`} />
              ))}
            </g>
            <g opacity="0.16" transform="translate(0 180) scale(1 -1)">{lajes.map(slab)}</g>
            <g opacity="0.75">{lajes.map(slab)}</g>
          </>
        ),
      };
    }

    // Ultra Espaço: o buraco de minhoca visto de dentro — anéis que afunilam
    // para um ponto de luz, com Nihilego à deriva na boca do túnel.
    case "ultraspace":
      return {
        back: (
          <>
            <g fill="#fff">
              {Array.from({ length: 26 }).map((_, i) => (
                <circle
                  key={i}
                  cx={(i * 97) % 320}
                  cy={(i * 53) % 180}
                  r={0.5 + (i % 3) * 0.35}
                  opacity={0.25 + (i % 5) * 0.12}
                />
              ))}
            </g>
            <g fill="none" stroke={color} strokeLinecap="round">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <ellipse
                  key={i}
                  cx={214 - i * 4}
                  cy="90"
                  rx={86 - i * 12}
                  ry={70 - i * 10}
                  strokeWidth={2.2 - i * 0.22}
                  opacity={0.16 + i * 0.11}
                  transform={`rotate(${-12 + i * 2} 214 90)`}
                />
              ))}
            </g>
            <circle cx="190" cy="90" r="11" fill="#fff" opacity="0.85" filter={`url(#db-${id})`} />
            <circle cx="190" cy="90" r="4" fill="#fff" />
          </>
        ),
      };

    // Mundo dos Sonhos: a mente vaga, o corpo dorme. Névoa, lua e brilhos.
    case "dreamworld":
      return {
        back: (
          <>
            <g opacity="0.9">
              <circle cx="262" cy="40" r="17" fill={color} opacity="0.55" />
              <circle cx="255" cy="36" r="15" fill="#080910" />
            </g>
            <g filter={`url(#db-${id})`} opacity="0.5">
              <ellipse cx="120" cy="128" rx="92" ry="26" fill={color} />
              <ellipse cx="206" cy="140" rx="70" ry="20" fill={color} opacity="0.7" />
            </g>
          </>
        ),
        front: (
          <g fill={color} opacity="0.9">
            {[
              { x: 56, y: 44 }, { x: 236, y: 92 }, { x: 88, y: 96 },
              { x: 268, y: 130 }, { x: 150, y: 28 }, { x: 40, y: 122 },
            ].map((p, i) => (
              <path
                key={i}
                d={`M ${p.x} ${p.y - 6} L ${p.x + 1.6} ${p.y - 1.6} L ${p.x + 6} ${p.y} L ${p.x + 1.6} ${p.y + 1.6} L ${p.x} ${p.y + 6} L ${p.x - 1.6} ${p.y + 1.6} L ${p.x - 6} ${p.y} L ${p.x - 1.6} ${p.y - 1.6} Z`}
              />
            ))}
          </g>
        ),
      };

    // Ruínas de Sinjoh: o altar onde a criação pode ser reencenada. Pilares,
    // círculo de runas e o Ovo no centro.
    case "sinjoh":
      return {
        back: (
          <>
            <g stroke={color} fill="none" opacity="0.5">
              <ellipse cx="160" cy="138" rx="104" ry="26" strokeWidth="1.2" />
              <ellipse cx="160" cy="138" rx="78" ry="19" strokeWidth="0.8" strokeDasharray="5 5" />
              <ellipse cx="160" cy="138" rx="48" ry="12" strokeWidth="0.8" />
            </g>
            {[56, 160, 264].map((x, i) => (
              <g key={x} opacity={i === 1 ? 0.5 : 0.8}>
                <rect x={x - 7} y={92 - i * 0} width="14" height="50" fill={color} opacity="0.35" />
                <rect x={x - 10} y="88" width="20" height="6" fill={color} opacity="0.6" />
              </g>
            ))}
          </>
        ),
        front: (
          <g>
            <ellipse cx="160" cy="132" rx="13" ry="16" fill={color} opacity="0.9" filter={`url(#db-${id})`} />
            <ellipse cx="160" cy="132" rx="9" ry="12" fill="#fff" opacity="0.85" />
          </g>
        ),
      };

    // Hisui: Sinnoh antes dos humanos. Monte Coronet ao fundo, pinheiros e
    // neve — nada de construção, que é o ponto da era.
    case "hisui":
      return {
        back: (
          <>
            <path d="M 0 120 L 62 66 L 104 108 L 150 58 L 210 118 L 264 84 L 320 124 L 320 180 L 0 180 Z" fill={color} opacity="0.32" />
            <path d="M 0 140 L 48 106 L 96 136 L 160 98 L 226 138 L 282 114 L 320 142 L 320 180 L 0 180 Z" fill={color} opacity="0.5" />
            <path d="M 150 58 L 168 76 L 150 72 L 136 80 Z" fill="#fff" opacity="0.55" />
            <rect y="146" width="320" height="34" fill="#dfe6ee" opacity="0.12" />
            <g fill={color} opacity="0.75">
              {[22, 46, 274, 300].map((x, i) => (
                <g key={x}>
                  <path d={`M ${x} ${116 + i % 2 * 6} L ${x + 11} ${142 + i % 2 * 6} L ${x - 11} ${142 + i % 2 * 6} Z`} />
                  <rect x={x - 1.5} y={142 + (i % 2) * 6} width="3" height="8" />
                </g>
              ))}
            </g>
          </>
        ),
      };

    // Área Zero: a cratera em corte. As paredes descem para o fundo cristalino
    // onde a energia Terastal brota do chão.
    case "terastal":
      return {
        back: (
          <>
            <path d="M 0 0 L 96 132 L 0 180 Z" fill={color} opacity="0.22" />
            <path d="M 320 0 L 224 132 L 320 180 Z" fill={color} opacity="0.22" />
            <path d="M 0 0 L 74 138 L 0 180 Z" fill="#080910" opacity="0.75" />
            <path d="M 320 0 L 246 138 L 320 180 Z" fill="#080910" opacity="0.75" />
            <ellipse cx="160" cy="150" rx="96" ry="22" fill={color} opacity="0.45" filter={`url(#db-${id})`} />
          </>
        ),
        front: (
          <g>
            {[
              { x: 92, h: 40, w: 11 }, { x: 116, h: 26, w: 8 },
              { x: 208, h: 46, w: 12 }, { x: 232, h: 30, w: 9 },
              { x: 68, h: 22, w: 7 }, { x: 252, h: 20, w: 7 },
            ].map((c, i) => (
              <g key={i}>
                <polygon
                  points={`${c.x},${152 - c.h} ${c.x + c.w},${152 - c.h * 0.55} ${c.x + c.w * 0.6},152 ${c.x - c.w * 0.4},152`}
                  fill={color}
                  opacity="0.75"
                />
                <polygon
                  points={`${c.x},${152 - c.h} ${c.x + c.w * 0.6},152 ${c.x - c.w * 0.4},152`}
                  fill="#fff"
                  opacity="0.22"
                />
              </g>
            ))}
          </g>
        ),
      };

    // Orre: a região sem grama alta. Chão rachado, mesas ao longe e a aura
    // escura que a Cipher fechava no coração dos pokémon.
    case "shadow":
      return {
        back: (
          <>
            {/* Mesas ao longe, em duas profundidades: a de tras mais apagada
                da o ar rarefeito do deserto de Orre. */}
            <path d="M 0 100 L 44 100 L 58 78 L 104 78 L 116 100 L 176 100 L 192 70 L 232 70 L 246 100 L 320 100 L 320 122 L 0 122 Z" fill={color} opacity="0.3" />
            <path d="M 0 118 L 62 118 L 76 100 L 122 100 L 134 118 L 206 118 L 222 96 L 258 96 L 270 118 L 320 118 L 320 136 L 0 136 Z" fill={color} opacity="0.55" />
            {/* Chao arido: areia quente sob o ceu frio, e a linha do horizonte
                marcada, que e o que faltava para a cena ter fundo e frente. */}
            <rect y="132" width="320" height="48" fill="#c89a62" opacity="0.14" />
            <line x1="0" y1="132" x2="320" y2="132" stroke={color} strokeWidth="1.2" opacity="0.7" />
            <g stroke="#c89a62" strokeWidth="1" opacity="0.5" fill="none" strokeLinecap="round">
              {[
                "M 18 146 L 58 154 L 44 172", "M 96 140 L 138 158 L 126 176",
                "M 196 144 L 240 152 L 232 174", "M 262 162 L 306 152",
                "M 70 166 L 104 172",
              ].map((d, i) => <path key={i} d={d} />)}
            </g>
            {/* A aura que a Cipher fechava no coracao: roxa, com halo, nao uma
                mancha preta sem forma. */}
            <ellipse cx="160" cy="80" rx="58" ry="50" fill="#2a1038" opacity="0.85" filter={`url(#db-${id})`} />
            <ellipse cx="160" cy="80" rx="46" ry="40" fill="none" stroke="#9a4fd0" strokeWidth="1.4" opacity="0.5" />
            <ellipse cx="160" cy="80" rx="34" ry="29" fill="none" stroke="#9a4fd0" strokeWidth="0.8" opacity="0.3" />
          </>
        ),
      };

    default:
      return { back: <g /> };
  }
}

/* ============ Human badge ============ */

