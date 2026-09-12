const MAX = 6;

export function parseTamanhosParams(params: URLSearchParams): string[] {
  const raw = params.get("p");
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const clean = part.trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= MAX) break;
  }
  return out;
}

export function toSearchParams(names: string[]): URLSearchParams {
  const out = new URLSearchParams();
  if (names.length > 0) out.set("p", names.slice(0, MAX).join(","));
  return out;
}
