import { computeScale, HUMAN_HEIGHT_DM } from "../lib/sizeScale";
import type { Slot } from "../lib/comparatorStore";

interface Props {
  items: Slot[];
  height?: number;
}

const SizeCanvas = ({ items, height = 420 }: Props) => {
  const scale = computeScale(
    items.map((i) => ({ name: i.name, height: i.height })),
    { canvasHeight: height - 40 }
  );
  const cellW = 120;
  const humanW = 60;
  const rulerX = 40;
  const width = rulerX + humanW + items.length * cellW + 40;
  const baseline = height - 20;
  const meters = Math.ceil(scale.maxHeightDm / 10);

  return (
    <svg
      className="size-canvas"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Comparação de tamanho"
    >
      {/* Régua vertical */}
      <line
        x1={rulerX}
        y1={20}
        x2={rulerX}
        y2={baseline}
        stroke="var(--text-dim)"
        strokeWidth={1}
      />
      {Array.from({ length: meters + 1 }, (_, m) => {
        const y = baseline - m * 10 * scale.pxPerDm;
        return (
          <g key={m}>
            <line
              x1={rulerX - 5}
              y1={y}
              x2={rulerX + 5}
              y2={y}
              stroke="var(--text-dim)"
            />
            <text
              x={rulerX - 8}
              y={y + 4}
              fill="var(--text-dim)"
              fontSize={10}
              textAnchor="end"
            >
              {m}m
            </text>
          </g>
        );
      })}

      {/* Baseline chão */}
      <line
        x1={rulerX}
        y1={baseline}
        x2={width - 10}
        y2={baseline}
        stroke="var(--text-dim)"
        strokeWidth={1}
      />

      {/* Humano 1.70m */}
      <g transform={`translate(${rulerX + 20}, ${baseline - scale.humanPx})`}>
        <rect
          x={0}
          y={0}
          width={humanW * 0.4}
          height={scale.humanPx}
          fill="var(--surface-2, #333)"
          rx={4}
        />
        <text
          x={humanW * 0.2}
          y={scale.humanPx + 14}
          fill="var(--text-dim)"
          fontSize={9}
          textAnchor="middle"
        >
          humano 1.70m
        </text>
      </g>

      {/* Pokémons */}
      {scale.sizes.map((s, idx) => {
        const cx = rulerX + humanW + idx * cellW + cellW / 2;
        const item = items[idx];
        const spriteSize = Math.min(cellW - 20, s.px);
        return (
          <g key={s.name}>
            <image
              href={item.sprite}
              x={cx - spriteSize / 2}
              y={baseline - s.px}
              width={spriteSize}
              height={s.px}
              preserveAspectRatio="xMidYMax meet"
              crossOrigin="anonymous"
            />
            <text
              x={cx}
              y={baseline + 14}
              fill="var(--text, #eee)"
              fontSize={11}
              textAnchor="middle"
            >
              {item.name}
            </text>
            <text
              x={cx}
              y={baseline + 26}
              fill="var(--text-dim)"
              fontSize={9}
              textAnchor="middle"
            >
              {(s.heightDm / 10).toFixed(1)}m
            </text>
          </g>
        );
      })}

      {scale.maxHeightDm > HUMAN_HEIGHT_DM * 3 && (
        <text
          x={width - 10}
          y={height - 4}
          fill="var(--text-dim)"
          fontSize={9}
          textAnchor="end"
        >
          escala não linear abaixo de 30cm
        </text>
      )}
    </svg>
  );
};

export default SizeCanvas;
