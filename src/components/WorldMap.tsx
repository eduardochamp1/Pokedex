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
        aria-label="Mapa mundi do universo Pokémon"
      >
        <defs>
          <radialGradient id="ocean-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#5aa8d6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1e4a7a" stopOpacity="0.45" />
          </radialGradient>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
          <filter id="landshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ocean */}
        <rect width="1000" height="600" fill="url(#ocean-grad)" />
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Bioluminescent particles */}
        <ParticleField count={20} />

        {/* Compass */}
        <g className="worldmap-compass" transform="translate(920, 60)">
          <circle r="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" />
          <text y="-10" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700">N</text>
          <text y="18" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">S</text>
          <text x="-16" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">O</text>
          <text x="16" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">L</text>
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(s.id);
                }
              }}
              aria-label={`Selecionar ${region.name}`}
              style={{ ["--region-color" as string]: s.color }}
            >
              <path d={s.path} filter="url(#landshadow)" />
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
