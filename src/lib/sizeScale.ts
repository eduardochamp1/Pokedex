export const HUMAN_HEIGHT_DM = 17;
export const MIN_SPRITE_PX = 12;

export interface Input {
  name: string;
  height: number;
}

export interface ScaledSize {
  name: string;
  heightDm: number;
  px: number;
}

export interface Scale {
  maxHeightDm: number;
  pxPerDm: number;
  humanPx: number;
  sizes: ScaledSize[];
}

export function computeScale(
  inputs: Input[],
  { canvasHeight }: { canvasHeight: number }
): Scale {
  const maxHeightDm = Math.max(
    HUMAN_HEIGHT_DM,
    ...inputs.map((i) => i.height)
  );
  const pxPerDm = canvasHeight / maxHeightDm;
  const humanPx = HUMAN_HEIGHT_DM * pxPerDm;
  const sizes: ScaledSize[] = inputs.map((i) => ({
    name: i.name,
    heightDm: i.height,
    px: Math.max(MIN_SPRITE_PX, i.height * pxPerDm),
  }));
  return { maxHeightDm, pxPerDm, humanPx, sizes };
}
