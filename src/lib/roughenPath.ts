/**
 * Ruído de costa: transforma um path de curvas suaves numa linha recortada.
 *
 * Os contornos do regionMap são feitos de seis a oito curvas de Bézier, o que
 * desenha uma silhueta correta e uma costa que não existe na natureza — o
 * olho lê mancha, não ilha. Em vez de reescrever os nove paths à mão (e
 * perder a legibilidade do arquivo de dados), a silhueta continua lisa na
 * fonte e ganha o recorte aqui, uma vez, de forma determinística.
 *
 * Determinístico é a palavra importante: a mesma entrada devolve sempre a
 * mesma saída, então a costa não "ferve" entre renders nem muda entre uma
 * visita e outra.
 */

interface Pt {
  x: number;
  y: number;
}

/** PRNG de 32 bits com semente — previsível de propósito. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Lê um path e devolve uma lista de subpaths já em pontos. Suporta só os
 * comandos que o regionMap usa: M, C, L e Z, todos absolutos.
 */
function samplePath(d: string, step: number): Pt[][] {
  const tokens = d.match(/[MCLZmclz]|-?\d*\.?\d+/g) ?? [];
  const subpaths: Pt[][] = [];
  let current: Pt[] = [];
  let cursor: Pt = { x: 0, y: 0 };
  let i = 0;

  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case "M":
      case "m": {
        if (current.length) subpaths.push(current);
        cursor = { x: num(), y: num() };
        current = [cursor];
        break;
      }
      case "L":
      case "l": {
        const p = { x: num(), y: num() };
        current.push(p);
        cursor = p;
        break;
      }
      case "C":
      case "c": {
        const p1 = { x: num(), y: num() };
        const p2 = { x: num(), y: num() };
        const p3 = { x: num(), y: num() };
        // O comprimento do polígono de controle serve de estimativa boa o
        // bastante para decidir quantas amostras a curva merece.
        const approx = dist(cursor, p1) + dist(p1, p2) + dist(p2, p3);
        const n = Math.max(3, Math.round(approx / step));
        for (let k = 1; k <= n; k++) current.push(cubicAt(cursor, p1, p2, p3, k / n));
        cursor = p3;
        break;
      }
      case "Z":
      case "z": {
        if (current.length) subpaths.push(current);
        current = [];
        break;
      }
      default:
        // Comando não suportado: para aqui em vez de cuspir lixo.
        i = tokens.length;
    }
  }
  if (current.length) subpaths.push(current);
  return subpaths;
}

export interface RoughenOptions {
  /** Distância aproximada entre pontos amostrados, nas unidades do path. */
  step?: number;
  /** Amplitude máxima do deslocamento perpendicular. */
  amplitude?: number;
  /** Semente: o mesmo valor devolve sempre a mesma costa. */
  seed?: number;
}

/**
 * Recorta a costa de `d`. Cada ponto amostrado anda na perpendicular à
 * própria curva, por uma soma de duas ondas (as enseadas) com um pouco de
 * ruído por cima (as pedras).
 */
export function roughenPath(d: string, options: RoughenOptions = {}): string {
  const { step = 9, amplitude = 2.6, seed = 1 } = options;
  const subpaths = samplePath(d, step);
  if (!subpaths.length) return d;

  const out: string[] = [];

  subpaths.forEach((pts, subIndex) => {
    // Amostrar fecha a curva repetindo o ponto inicial; um só basta.
    if (pts.length > 2 && dist(pts[0], pts[pts.length - 1]) < 0.01) pts.pop();
    if (pts.length < 3) return;

    const rand = mulberry32(seed * 7919 + subIndex * 104729);
    const f1 = 0.55 + rand() * 0.5;
    const f2 = 1.7 + rand() * 1.1;
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;

    const moved = pts.map((p, k) => {
      const prev = pts[(k - 1 + pts.length) % pts.length];
      const next = pts[(k + 1) % pts.length];
      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      // Normal apontando para fora (sentido horário nos paths do regionMap).
      const nx = ty / len;
      const ny = -tx / len;
      const wave = Math.sin(k * f1 + p1) * 0.55 + Math.sin(k * f2 + p2) * 0.3;
      const grit = (rand() - 0.5) * 0.7;
      const off = (wave + grit) * amplitude;
      return { x: p.x + nx * off, y: p.y + ny * off };
    });

    const r = (n: number) => Math.round(n * 10) / 10;
    out.push(
      "M " +
        moved.map((p) => `${r(p.x)},${r(p.y)}`).join(" L ") +
        " Z",
    );
  });

  return out.join(" ");
}
