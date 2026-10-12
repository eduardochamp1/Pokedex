/**
 * O duelo do Comparar mora na URL (`?a=charizard&b=blastoise`), como o time
 * e os filtros da Pokédex: o link leva a comparação junto.
 */
export interface CompareParams {
  a: string;
  b: string;
}

export const COMPARE_DEFAULTS: CompareParams = { a: "bulbasaur", b: "charmander" };

/** Nome ou número como a PokéAPI aceita: minúsculas, dígitos e hífen. */
const VALIDO = /^[a-z0-9-]+$/;

const limpo = (bruto: string | null, padrao: string) => {
  const s = bruto?.trim().toLowerCase() ?? "";
  return VALIDO.test(s) ? s : padrao;
};

export function parseCompareParams(params: URLSearchParams): CompareParams {
  return {
    a: limpo(params.get("a"), COMPARE_DEFAULTS.a),
    b: limpo(params.get("b"), COMPARE_DEFAULTS.b),
  };
}

/** Escreve o duelo sobre os parâmetros atuais, omitindo o que está no padrão. */
export function toCompareSearch(atual: URLSearchParams, p: CompareParams): URLSearchParams {
  const out = new URLSearchParams(atual);
  for (const lado of ["a", "b"] as const) {
    if (p[lado] === COMPARE_DEFAULTS[lado]) out.delete(lado);
    else out.set(lado, p[lado]);
  }
  return out;
}
