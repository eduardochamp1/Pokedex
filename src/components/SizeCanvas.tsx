import { getLang, tr } from "../i18n/lang";
import { computeScale, HUMAN_HEIGHT_DM } from "../lib/sizeScale";
import type { Slot } from "../lib/comparatorStore";

interface Props {
  items: Slot[];
  height?: number;
}

/** Respiro acima da regua. */
const TOP_PAD = 20;
/**
 * Faixa abaixo do chao: nome, altura e a nota de escala, cada um na sua linha.
 * Antes eram 20 px para tres linhas — a altura caia fora do viewBox e a nota
 * passava por cima da ultima coluna.
 */
const LABEL_BAND = 44;
/** Largura minima de uma coluna, para o nome caber sem encostar no vizinho. */
const MIN_CELL = 110;
const CELL_GAP = 16;

const SizeCanvas = ({ items, height = 420 }: Props) => {
  const scale = computeScale(
    items.map((i) => ({ name: i.name, height: i.height })),
    { canvasHeight: height - TOP_PAD - LABEL_BAND }
  );
  const humanW = 60;
  const rulerX = 40;
  const baseline = height - LABEL_BAND;
  const meters = Math.ceil(scale.maxHeightDm / 10);

  /**
   * Cada coluna tem a largura do proprio sprite.
   *
   * A arte oficial e quadrada, entao um sprite com a altura certa e igualmente
   * largo — com coluna fixa, a caixa da imagem ficava mais estreita do que alta
   * e o `preserveAspectRatio` encolhia pela largura: Wailord, de 14,5 m, era
   * desenhado na altura de uns 3,8 m. A altura e o dado que esta pagina existe
   * para mostrar, entao e ela que manda.
   */
  const cells = scale.sizes.map((s) => Math.max(MIN_CELL, s.px));
  const cellsWidth = cells.reduce((sum, w) => sum + w + CELL_GAP, 0);
  const width = rulerX + humanW + cellsWidth + 20;
  /** Centro horizontal de cada coluna. */
  const centers = cells.map((w, idx) => {
    const before = cells
      .slice(0, idx)
      .reduce((sum, prev) => sum + prev + CELL_GAP, 0);
    return rulerX + humanW + before + w / 2;
  });

  return (
    /* Comparar varios pokemons grandes e inerentemente largo: com a arte
       quadrada, um sprite alto e igualmente largo. Espremer tudo na largura da
       pagina deixaria a regua ilegivel, entao a altura fica fixa e o excesso
       rola na horizontal. */
    <div className="size-canvas-scroll">
      <svg
        className="size-canvas"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={tr(getLang(), "Comparação de tamanho", "Size comparison")}
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
        {/* O humano e a referencia da comparacao: com o preenchimento escuro
            sobre fundo escuro ele praticamente sumia. O contorno o separa do
            fundo sem competir com os sprites. */}
        <rect
          x={0}
          y={0}
          width={humanW * 0.4}
          height={scale.humanPx}
          fill="var(--surface-3, #333)"
          stroke="var(--border-strong)"
          strokeWidth={1}
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
        const cx = centers[idx];
        const item = items[idx];
        return (
          <g key={s.name}>
            {/* Caixa quadrada do tamanho da altura: e a altura que define a
                escala, e a arte oficial e quadrada. */}
            <image
              href={item.sprite}
              x={cx - s.px / 2}
              y={baseline - s.px}
              width={s.px}
              height={s.px}
              preserveAspectRatio="xMidYMax meet"
              crossOrigin="anonymous"
            />
            <text
              x={cx}
              y={baseline + 15}
              fill="var(--text, #eee)"
              fontSize={11}
              textAnchor="middle"
            >
              {item.name}
            </text>
            <text
              x={cx}
              y={baseline + 28}
              fill="var(--text-dim)"
              fontSize={9}
              textAnchor="middle"
            >
              {(s.heightDm / 10).toFixed(1)}m
            </text>
          </g>
        );
      })}

      {/* Linha propria, abaixo dos rotulos das colunas, e alinhada a esquerda:
          no canto direito o botao flutuante do comparador cobria a nota. */}
      {scale.maxHeightDm > HUMAN_HEIGHT_DM * 3 && (
        <text
          x={rulerX}
          y={height - 4}
          fill="var(--text-dim)"
          fontSize={9}
          textAnchor="start"
        >
          {tr(getLang(), "escala não linear abaixo de 30cm", "non-linear scale below 30cm")}
        </text>
      )}
      </svg>
    </div>
  );
};

export default SizeCanvas;
