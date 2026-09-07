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
}

export const DimensionPortal = ({ dimId, color }: DimensionProps) => {
  return (
    <svg viewBox="0 0 200 120" className="lore-art-portal" aria-hidden="true">
      <defs>
        <radialGradient id={`dp-${dimId}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`db-${dimId}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <rect width="200" height="120" fill="#0b0c15" />
      {dimensionInner(dimId, color)}
      <ellipse
        cx="100" cy="60" rx="70" ry="45"
        fill={`url(#dp-${dimId})`}
        style={{ mixBlendMode: "screen" }}
      />
    </svg>
  );
};

function dimensionInner(id: string, color: string) {
  switch (id) {
    case "distortion":
      // Fractured mirror lines
      return (
        <g stroke={color} strokeWidth="0.5" opacity="0.6" fill="none">
          {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map((x) => (
            <line key={x} x1={x} y1="10" x2={x + 15} y2="110" />
          ))}
        </g>
      );
    case "ultraspace":
      // Swirling stars
      return (
        <g fill={color}>
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 4;
            const r = 15 + (i / 30) * 40;
            const x = 100 + Math.cos(angle) * r;
            const y = 60 + Math.sin(angle) * r * 0.6;
            return <circle key={i} cx={x} cy={y} r={0.5 + (i % 3) * 0.4} opacity={0.4 + (i / 30) * 0.6} />;
          })}
        </g>
      );
    case "dreamworld":
      // Soft cloud with sparkles
      return (
        <g>
          <ellipse cx="100" cy="70" rx="60" ry="20" fill={color} opacity="0.3" />
          <ellipse cx="100" cy="60" rx="45" ry="15" fill={color} opacity="0.4" />
          {[
            { x: 40, y: 30 }, { x: 160, y: 25 }, { x: 70, y: 90 },
            { x: 140, y: 90 }, { x: 100, y: 20 },
          ].map((p, i) => (
            <path
              key={i}
              d={`M ${p.x} ${p.y - 4} L ${p.x + 1} ${p.y - 1} L ${p.x + 4} ${p.y} L ${p.x + 1} ${p.y + 1} L ${p.x} ${p.y + 4} L ${p.x - 1} ${p.y + 1} L ${p.x - 4} ${p.y} L ${p.x - 1} ${p.y - 1} Z`}
              fill={color}
              opacity="0.8"
            />
          ))}
        </g>
      );
    case "sinjoh":
      // Rune circles
      return (
        <g stroke={color} strokeWidth="1" fill="none" opacity="0.7">
          <circle cx="100" cy="60" r="50" />
          <circle cx="100" cy="60" r="38" strokeDasharray="4 4" />
          <circle cx="100" cy="60" r="24" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="100" y1="10" x2="100" y2="20"
              transform={`rotate(${deg} 100 60)`}
            />
          ))}
        </g>
      );
    case "hisui":
      // Ancient scroll
      return (
        <g fill={color} opacity="0.6">
          <rect x="30" y="30" width="140" height="60" rx="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
          <line x1="50" y1="45" x2="150" y2="45" stroke={color} strokeWidth="0.5" />
          <line x1="50" y1="55" x2="140" y2="55" stroke={color} strokeWidth="0.5" />
          <line x1="50" y1="65" x2="150" y2="65" stroke={color} strokeWidth="0.5" />
          <line x1="50" y1="75" x2="130" y2="75" stroke={color} strokeWidth="0.5" />
        </g>
      );
    case "terastal":
      // Crystal facets
      return (
        <g stroke={color} fill={color} strokeWidth="1">
          <polygon points="100,20 130,50 115,90 85,90 70,50" fill={color} fillOpacity="0.3" />
          <polygon points="100,20 130,50 100,50" fill={color} fillOpacity="0.5" />
          <polygon points="100,20 70,50 100,50" fill={color} fillOpacity="0.6" />
          <polygon points="130,50 115,90 100,50" fill={color} fillOpacity="0.4" />
          <polygon points="70,50 85,90 100,50" fill={color} fillOpacity="0.5" />
        </g>
      );
    case "shadow":
      // Inverted grid
      return (
        <g stroke={color} strokeWidth="0.5" opacity="0.4" fill="none">
          {[15, 30, 45, 60, 75, 90, 105].map((y) => (
            <line key={y} x1="10" y1={y} x2="190" y2={y} />
          ))}
          {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x) => (
            <line key={x} x1={x} y1="10" x2={x} y2="110" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* ============ Human badge ============ */

interface HumanBadgeProps {
  name: string;
  color: string;
}

export const HumanBadge = ({ name, color }: HumanBadgeProps) => {
  // Extract initials (first + last words). "N (Natural..)": use "N".
  const cleaned = name.replace(/\(.+?\)/g, "").trim();
  const parts = cleaned.split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : parts[0][0] ?? "?";

  return (
    <svg viewBox="0 0 100 100" className="lore-art-human" aria-hidden="true">
      <defs>
        <radialGradient id={`hb-${initials}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#hb-${initials})`} stroke={color} strokeWidth="2" />
      <text
        x="50" y="64"
        fontSize="36"
        fontWeight="700"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, sans-serif"
        style={{ letterSpacing: "-0.02em" }}
      >
        {initials.toUpperCase()}
      </text>
    </svg>
  );
};
