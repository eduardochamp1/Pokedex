import { useMemo, useState } from "react";
import { REGION_SHAPES } from "../data/regionMap";
import { REGIONS } from "../data/regions";
import { roughenPath } from "../lib/roughenPath";

interface Props {
  onSelect: (regionId: string) => void;
  selectedId?: string;
}

/**
 * A folha tem 1000x640 e três faixas: a de cima (até y=100) é do cartucho e
 * da rosa dos ventos, a de baixo (a partir de y=576) é da escala, e só a do
 * meio recebe terra. Os paths do regionMap vivem no sistema antigo de
 * 1000x600 e entram aqui por uma transformação única, que é o que mantém a
 * moldura e a geografia independentes uma da outra — antes o cartucho
 * pousava em cima de Sinnoh e o rótulo de Alola encostava na borda.
 */
const LAND = "translate(-24, 22) scale(0.97)";

/** Emenda Johto/Kanto: os dois dividem Honshu, então a divisa é desenhada. */
const SEAM = "M 275,245 C 272,262 276,282 288,300 C 296,314 300,330 298,344";

const WorldMap = ({ onSelect, selectedId }: Props) => {
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [tip, setTip] = useState<
    { x: number; y: number; flipX: boolean; flipY: boolean } | undefined
  >();

  // A costa recortada sai de uma conta pura e determinística; calcular uma
  // vez basta para a vida inteira do componente.
  const coasts = useMemo(
    () =>
      new Map(
        REGION_SHAPES.map((s, i) => [
          s.id,
          roughenPath(s.path, { seed: i + 1, step: 7, amplitude: 3.2 }),
        ]),
      ),
    [],
  );

  const regionById = new Map(REGIONS.map((r) => [r.id, r]));
  const hovered = hoverId ? regionById.get(hoverId) : undefined;

  const onMove = (e: React.MouseEvent<SVGGElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // A folha tem overflow: hidden, então o balão precisa virar para dentro
    // antes de encostar na borda — do contrário ele é cortado no meio.
    setTip({ x, y, flipX: x > rect.width - 270, flipY: y > rect.height - 130 });
  };

  return (
    <div className="worldmap-wrap">
      <svg
        viewBox="0 0 1000 640"
        preserveAspectRatio="xMidYMid meet"
        className="worldmap-svg"
        role="img"
        aria-label="Mapa do mundo Pokémon em papel: nove regiões distribuídas em três continentes"
      >
        <defs>
          {/* Papel: o mar é a própria folha, riscada de linha d'água. */}
          <pattern id="wm-sea" width="10" height="7" patternUnits="userSpaceOnUse">
            <rect width="10" height="7" fill="#ede2c2" />
            <line x1="0" y1="6.5" x2="10" y2="6.5" stroke="#6b4e2e" strokeOpacity="0.09" strokeWidth="1" />
          </pattern>
          <pattern id="wm-grain" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.4" fill="#6b4e2e" fillOpacity="0.09" />
            <circle cx="3" cy="3" r="0.3" fill="#6b4e2e" fillOpacity="0.06" />
          </pattern>
        </defs>

        <rect width="1000" height="640" fill="url(#wm-sea)" />
        <rect width="1000" height="640" fill="url(#wm-grain)" />

        {/* Moldura dupla da folha */}
        <rect x="10" y="10" width="980" height="620" fill="none" stroke="#b8892b" strokeWidth="2" rx="6" />
        <rect x="17" y="17" width="966" height="606" fill="none" stroke="#6b4e2e" strokeOpacity="0.5" strokeWidth="0.8" rx="4" />

        {/* Meridianos de referência, bem apagados */}
        <g stroke="#6b4e2e" strokeOpacity="0.13" strokeWidth="0.7" fill="none">
          <line x1="20" y1="230" x2="980" y2="230" />
          <line x1="20" y1="430" x2="980" y2="430" />
          <line x1="250" y1="20" x2="250" y2="620" />
          <line x1="500" y1="20" x2="500" y2="620" />
          <line x1="750" y1="20" x2="750" y2="620" />
        </g>

        {/* Nomes de mar, só onde há água de verdade */}
        <g
          className="worldmap-sea-label"
          fontFamily="var(--font-display)"
          fontSize="15"
          letterSpacing="0.42em"
          fill="#6b4e2e"
          fillOpacity="0.3"
          textAnchor="middle"
        >
          <text x="444" y="152">MAR TRANQUILO</text>
          <text x="706" y="556">MAR DO SUL</text>
        </g>

        <g transform={LAND}>
          {/* Rochedos soltos: dão escala ao oceano sem pedir rótulo. */}
          <g fill="#8a6f42" fillOpacity="0.5">
            <circle cx="408" cy="196" r="3" />
            <circle cx="418" cy="203" r="2" />
            <circle cx="600" cy="380" r="2.5" />
            <circle cx="710" cy="380" r="2" />
            <circle cx="695" cy="390" r="1.8" />
            <circle cx="150" cy="530" r="3" />
            <circle cx="920" cy="235" r="2.5" />
            <circle cx="945" cy="245" r="1.8" />
          </g>

          {/* Faixa de espuma: uma cópia mais grossa e clara sob toda a terra.
              É ela que faz a costa parecer recortada da água, e por isso
              precisa vir antes de qualquer preenchimento. */}
          <g className="worldmap-foam" fill="none" stroke="#d9c39a" strokeWidth="9" strokeLinejoin="round">
            {REGION_SHAPES.map((s) => (
              <path key={s.id} d={coasts.get(s.id)} />
            ))}
          </g>

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
                onMouseEnter={(e) => {
                  setHoverId(s.id);
                  onMove(e);
                }}
                onMouseMove={onMove}
                onMouseLeave={() => {
                  setHoverId(undefined);
                  setTip(undefined);
                }}
                onClick={() => onSelect(s.id)}
                aria-hidden="true"
                style={{ ["--region-color" as string]: s.color }}
              >
                <path d={coasts.get(s.id)} />
                <text x={s.labelX} y={s.labelY} textAnchor="middle" className="worldmap-label">
                  {region.name}
                </text>
              </g>
            );
          })}

          {/* A divisa Johto/Kanto por cima dos dois: sem ela os dois blocos
              encostados pareciam falha de render. */}
          <path
            d={SEAM}
            fill="none"
            stroke="#6b4e2e"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.8"
            pointerEvents="none"
          />
        </g>

        {/* Faixa de cima: cartucho e rosa dos ventos. Nenhuma terra chega aqui. */}
        <g className="worldmap-cartouche" transform="translate(34, 24)">
          <rect x="0" y="0" width="250" height="62" fill="#f6eed6" stroke="#b8892b" strokeWidth="2" rx="4" />
          <rect x="5" y="5" width="240" height="52" fill="none" stroke="#6b4e2e" strokeOpacity="0.6" strokeWidth="0.8" rx="2" />
          <text x="16" y="28" className="worldmap-cartouche-title">MAPA DO MUNDO</text>
          <text x="16" y="47" className="worldmap-cartouche-sub">NOVE REGIOES &#183; NOVE GERACOES</text>
        </g>

        <g className="worldmap-compass" transform="translate(928, 56)">
          <circle r="27" fill="#f6eed6" stroke="#6b4e2e" strokeWidth="1.5" />
          <circle r="20" fill="none" stroke="#6b4e2e" strokeOpacity="0.5" strokeWidth="0.7" />
          <path d="M 0,-20 L 5,0 L 0,20 L -5,0 Z" fill="#b8892b" stroke="#6b4e2e" strokeWidth="1" />
          <path d="M -20,0 L 0,-5 L 20,0 L 0,5 Z" fill="#f6eed6" stroke="#6b4e2e" strokeWidth="1" />
          <text y="-9" textAnchor="middle" className="worldmap-compass-n">N</text>
        </g>

        {/* Faixa de baixo: escala. */}
        <g transform="translate(40, 598)">
          <rect x="0" y="-5" width="45" height="7" fill="#6b4e2e" />
          <rect x="45" y="-5" width="45" height="7" fill="#f6eed6" stroke="#6b4e2e" strokeWidth="1" />
          <rect x="90" y="-5" width="45" height="7" fill="#6b4e2e" />
          <text x="0" y="17" className="worldmap-scale-label">0</text>
          <text x="112" y="17" className="worldmap-scale-label">1500 KM</text>
        </g>
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
                  "worldmap-legend-btn" + (selectedId === s.id ? " is-selected" : "")
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
          className={
            "worldmap-tooltip" +
            (tip.flipX ? " is-flip-x" : "") +
            (tip.flipY ? " is-flip-y" : "")
          }
          style={{
            left: tip.flipX ? tip.x - 14 : tip.x + 14,
            top: tip.flipY ? tip.y - 14 : tip.y + 14,
          }}
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
