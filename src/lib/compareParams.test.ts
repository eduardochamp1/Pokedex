import { describe, expect, it } from "vitest";
import { COMPARE_DEFAULTS, parseCompareParams, toCompareSearch } from "./compareParams";

const ler = (busca: string) => parseCompareParams(new URLSearchParams(busca));

describe("parâmetros do Comparar", () => {
  it("lê os dois lados do endereço", () => {
    expect(ler("a=charizard&b=blastoise")).toEqual({ a: "charizard", b: "blastoise" });
  });

  it("sem parâmetro, vale o duelo padrão", () => {
    expect(ler("")).toEqual(COMPARE_DEFAULTS);
    expect(ler("a=gengar")).toEqual({ a: "gengar", b: COMPARE_DEFAULTS.b });
  });

  it("aceita maiúsculas, espaços em volta, número e nome com hífen", () => {
    expect(ler("a=%20Pikachu%20&b=25")).toEqual({ a: "pikachu", b: "25" });
    expect(ler("a=mr-mime&b=charizard-mega-x")).toEqual({ a: "mr-mime", b: "charizard-mega-x" });
  });

  it("valor que não é nome nem número cai no padrão", () => {
    expect(ler("a=<script>&b=../x")).toEqual(COMPARE_DEFAULTS);
    expect(ler("a=&b=")).toEqual(COMPARE_DEFAULTS);
  });

  it("escreve só o que foge do padrão e preserva os outros parâmetros", () => {
    const atual = new URLSearchParams("q=pika&a=gengar");
    expect(toCompareSearch(atual, { a: "bulbasaur", b: "mew" }).toString()).toBe("q=pika&b=mew");
    expect(toCompareSearch(new URLSearchParams(), COMPARE_DEFAULTS).toString()).toBe("");
    // Não mexe no objeto recebido.
    expect(atual.toString()).toBe("q=pika&a=gengar");
  });
});
