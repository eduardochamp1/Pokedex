import { useState } from "react";
import { REGION_SHAPES } from "../data/regionMap";
import { REGIONS } from "../data/regions";
import ParticleField from "./ParticleField";

interface Props {
  onSelect: (regionId: string) => void;
  selectedId?: string;
}

const WorldMap = ({ onSelect, selectedId }: Props) => {
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [tip, setTip] = useState<{ x: number; y: number } | undefined>();

  const regionById = new Map(REGIONS.map((r) => [r.id, r]));
  const hovered = hoverId ? regionById.get(hoverId) : undefined;

  const onMove = (e: React.MouseEvent<SVGGElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="worldmap-wrap">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="worldmap-svg"
        role="img"
        aria-label="Mapa mundi do universo Pokémon: nove regiões distribuídas em três continentes"
      >
        <defs>
          {/* Ocean gradient — profundidade */}
          <radialGradient id="ocean-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="55%" stopColor="#0f2540" />
            <stop offset="100%" stopColor="#081525" />
          </radialGradient>

          {/* Parallels grid (lat/lon style) */}
          <pattern id="latlon" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(120,180,220,0.08)" strokeWidth="1" />
          </pattern>

          {/* Coastline glow por região */}
          <filter id="landshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
          </filter>

          {/* Textura sutil de solo */}
          <pattern id="landTexture" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="rgba(0,0,0,0)" />
            <circle cx="3" cy="3" r="0.5" fill="rgba(0,0,0,0.15)" />
          </pattern>

          {/* Bathymetry / iso curves */}
          <pattern id="bathy" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(120,180,220,0.05)" strokeWidth="0.5" />
            <circle cx="30" cy="30" r="16" fill="none" stroke="rgba(120,180,220,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Ocean layers */}
        <rect width="1000" height="600" fill="url(#ocean-grad)" />
        <rect width="1000" height="600" fill="url(#bathy)" />
        <rect width="1000" height="600" fill="url(#latlon)" />

        {/* Latitude/longitude reference lines destacadas */}
        <g className="worldmap-refs" fill="none" stroke="rgba(120,180,220,0.18)" strokeWidth="0.75" strokeDasharray="3 4">
          <line x1="0" y1="200" x2="1000" y2="200" />
          <line x1="0" y1="400" x2="1000" y2="400" />
          <line x1="250" y1="0" x2="250" y2="600" />
          <line x1="500" y1="0" x2="500" y2="600" />
          <line x1="750" y1="0" x2="750" y2="600" />
        </g>

        {/* Latitude labels */}
        <g className="worldmap-latlabels" fill="rgba(180,210,230,0.4)" fontSize="9" fontFamily="monospace">
          <text x="6" y="204">40°N</text>
          <text x="6" y="404">20°N</text>
          <text x="252" y="596">90°O</text>
          <text x="502" y="596">0°</text>
          <text x="752" y="596">90°L</text>
        </g>

        {/* Small archipelagos / rochedos decorativos no oceano */}
        <g className="worldmap-islets" fill="rgba(160,140,110,0.28)">
          <circle cx="440" cy="120" r="3" />
          <circle cx="450" cy="127" r="2" />
          <circle cx="600" cy="380" r="2.5" />
          <circle cx="710" cy="380" r="2" />
          <circle cx="695" cy="390" r="1.8" />
          <circle cx="150" cy="530" r="3" />
          <circle cx="920" cy="235" r="2.5" />
          <circle cx="945" cy="245" r="1.8" />
          <circle cx="80" cy="80" r="2" />
          <circle cx="60" cy="360" r="2.2" />
        </g>

        {/* Bioluminescent particles */}
        <ParticleField count={20} />

        {/* Compass rose */}
        <g className="worldmap-compass" transform="translate(925, 65)">
          <circle r="30" fill="rgba(20,30,50,0.7)" stroke="rgba(255,203,5,0.4)" strokeWidth="1" />
          <path d="M 0,-24 L 4,0 L 0,24 L -4,0 Z" fill="rgba(255,255,255,0.7)" />
          <path d="M -24,0 L 0,-4 L 24,0 L 0,4 Z" fill="rgba(255,255,255,0.35)" />
          <text y="-14" textAnchor="middle" fill="#ffcb05" fontSize="9" fontWeight="700" fontFamily="monospace">N</text>
          <text y="22" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">S</text>
          <text x="-20" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">O</text>
          <text x="20" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">L</text>
        </g>

        {/* Escala */}
        <g className="worldmap-scale" transform="translate(35, 555)">
          <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(180,210,230,0.6)" strokeWidth="1.5" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(180,210,230,0.6)" strokeWidth="1.5" />
          <line x1="60" y1="-2" x2="60" y2="2" stroke="rgba(180,210,230,0.6)" strokeWidth="1.5" />
          <line x1="120" y1="-3" x2="120" y2="3" stroke="rgba(180,210,230,0.6)" strokeWidth="1.5" />
          <text x="0" y="16" fontSize="9" fill="rgba(180,210,230,0.7)" fontFamily="monospace">0</text>
          <text x="55" y="16" fontSize="9" fill="rgba(180,210,230,0.7)" fontFamily="monospace">500</text>
          <text x="105" y="16" fontSize="9" fill="rgba(180,210,230,0.7)" fontFamily="monospace">1000km</text>
        </g>

        {/* Título do mapa */}
        <g className="worldmap-title" transform="translate(35, 60)">
          <rect x="-10" y="-30" width="220" height="52" rx="4" fill="rgba(20,30,50,0.75)" stroke="rgba(255,203,5,0.3)" strokeWidth="1" />
          <text x="0" y="-10" fontSize="16" fontWeight="700" fill="#ffcb05" fontFamily="monospace" letterSpacing="0.05em">PLANETA POKÉMON</text>
          <text x="0" y="8" fontSize="9" fill="rgba(180,210,230,0.7)" fontFamily="monospace">Projeção equidistante</text>
          <text x="0" y="18" fontSize="9" fill="rgba(180,210,230,0.7)" fontFamily="monospace">Escala 1 : 350 000 000</text>
        </g>

        {/* Continent name labels — muito discretos */}
        <g className="worldmap-continents" fill="rgba(200,220,240,0.15)" fontSize="20" fontFamily="serif" fontStyle="italic" letterSpacing="0.3em">
          <text x="120" y="80" transform="rotate(-6 120 80)">CONTINENTE ORIENTAL</text>
          <text x="640" y="90" transform="rotate(-4 640 90)">AMÉRICAS</text>
          <text x="770" y="80" transform="rotate(-2 770 80)">CONTINENTE OCIDENTAL</text>
          <text x="450" y="405" transform="rotate(-3 450 405)">MAR TRANQUILO</text>
        </g>

        {/* Regions */}
        {REGION_SHAPES.map((s) => {
          const region = regionById.get(s.id);
          if (!region) return null;
          const isHover = hoverId === s.id;
          const isSelected = selectedId === s.id;
          return (
            <g
              key={s.id}
              className={
                "worldmap-region" +
                (isHover ? " is-hover" : "") +
                (isSelected ? " is-selected" : "")
              }
              onMouseEnter={(e) => { setHoverId(s.id); onMove(e); }}
              onMouseMove={onMove}
              onMouseLeave={() => { setHoverId(undefined); setTip(undefined); }}
              onClick={() => onSelect(s.id)}
              aria-hidden="true"
              style={{ ["--region-color" as string]: s.color }}
            >
              {/* Halo — segunda cópia mais grossa e translúcida atrás */}
              <path
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth="6"
                opacity="0.15"
                filter="url(#landshadow)"
              />
              {/* Sombra terrestre (drop shadow) */}
              <path d={s.path} filter="url(#landshadow)" />
              {/* Textura de solo por cima */}
              <path d={s.path} fill="url(#landTexture)" style={{ pointerEvents: "none" }} />

              {/* Nome + geração */}
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                className="worldmap-label"
              >
                {region.name}
              </text>
              <text
                x={s.labelX}
                y={s.labelY + 14}
                textAnchor="middle"
                className="worldmap-sub"
              >
                Gen {region.generation}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="worldmap-legend">
        {REGION_SHAPES.map((s) => {
          const region = regionById.get(s.id);
          if (!region) return null;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={
                  "worldmap-legend-btn" +
                  (selectedId === s.id ? " is-selected" : "")
                }
                style={{ ["--region-color" as string]: s.color }}
                onClick={() => onSelect(s.id)}
                onMouseEnter={() => setHoverId(s.id)}
                onMouseLeave={() => setHoverId(undefined)}
                aria-pressed={selectedId === s.id}
              >
                <span className="worldmap-legend-dot" aria-hidden="true" />
                {region.name}
                <span className="worldmap-legend-gen">Gen {region.generation}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {hovered && tip && (
        <div
          className="worldmap-tooltip"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
          role="tooltip"
        >
          <div className="worldmap-tooltip-name">{hovered.name}</div>
          <div className="worldmap-tooltip-info">{hovered.inspiration}</div>
          <div className="worldmap-tooltip-hint">Clique para explorar</div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
