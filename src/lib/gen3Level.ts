/**
 * Nível a partir da experiência, com as seis curvas de crescimento.
 *
 * O registro de pokémon na caixa do PC não guarda o nível — só a experiência;
 * o jogo recalcula ao tirar da caixa. A curva é da espécie; a tabela abaixo
 * cobre as 386 da 3ª geração e foi gerada da PokéAPI (`/growth-rate/1..6`),
 * para o PC mostrar níveis sem buscar espécie por espécie.
 */

export type GrowthRate =
  | "slow"
  | "medium"
  | "fast"
  | "medium-slow"
  | "slow-then-very-fast"
  | "fast-then-very-slow";

const CODIGO: Record<string, GrowthRate> = {
  S: "slow",
  M: "medium",
  F: "fast",
  P: "medium-slow",
  E: "slow-then-very-fast",
  L: "fast-then-very-slow",
};

/** Um caractere por espécie, do #1 ao #386. */
const TABELA =
  "PPPPPPPPPMMMMMMPPPMMMMMMMMMMPPPPPPFFMMFFMMPPPMMMMMMMMMMMMSSPPPPPPPPPPPPSSPPPMMMMMMMMMMMMMSSPPPMMMMMMMSSMMMMMMMSSFMMMMMMSSMMMMMSSSSSMMMMMMMMMMSSSSSSSSSPPPPPPPPPPMMMMFFFFMSSMFFFFMMPPPPFFMPPPPFPPMMMMMPMFMMMMMMPMFFMMPSPMMMMSSFMMFSSSSMMMMSFMMMMMSFSSSSSSSSPPPPPPPPPPMMMMMMMMMPPPPPPPPMMSSSMMLLSSSEEEPPPLLFMFFPFSSSMMSSMMELPLLSSLLMMMFFFPPPPPEEELFFMMLLMMEEEEEEMPFFFFSFPMMMPPPEEESFSSSSSSSSSSSSSSSS";

export function growthRateOf(national: number): GrowthRate | undefined {
  return CODIGO[TABELA[national - 1] ?? ""];
}

/** Experiência mínima para estar no nível `n`. Nível 1 é sempre 0, como no jogo. */
export function expForLevel(rate: GrowthRate, n: number): number {
  if (n <= 1) return 0;
  const c = n * n * n;
  switch (rate) {
    case "fast":
      return Math.floor((4 * c) / 5);
    case "medium":
      return c;
    case "slow":
      return Math.floor((5 * c) / 4);
    case "medium-slow":
      return Math.floor((6 * c) / 5) - 15 * n * n + 100 * n - 140;
    case "slow-then-very-fast":
      if (n <= 50) return Math.floor((c * (100 - n)) / 50);
      if (n <= 68) return Math.floor((c * (150 - n)) / 100);
      if (n <= 98) return Math.floor((c * Math.floor((1911 - 10 * n) / 3)) / 500);
      return Math.floor((c * (160 - n)) / 100);
    case "fast-then-very-slow":
      if (n <= 15) return Math.floor((c * (Math.floor((n + 1) / 3) + 24)) / 50);
      if (n <= 36) return Math.floor((c * (n + 14)) / 50);
      return Math.floor((c * (Math.floor(n / 2) + 32)) / 50);
  }
}

export function levelFromExp(rate: GrowthRate, exp: number): number {
  let n = 1;
  while (n < 100 && expForLevel(rate, n + 1) <= exp) n++;
  return n;
}
