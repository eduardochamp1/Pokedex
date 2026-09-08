import { describe, expect, it } from "vitest";
import { bulbapediaUrl, fandomPtUrl } from "./wiki";
import { buildNameIndex } from "./filters";
import { resolveName } from "../api";
import { itemSpriteUrl, pixelSpriteUrl } from "./sprites";

describe("bulbapediaUrl", () => {
  it("troca espaço por underscore", () => {
    expect(bulbapediaUrl("Master Ball")).toBe(
      "https://bulbapedia.bulbagarden.net/wiki/Master_Ball"
    );
  });

  it("escapa acentos", () => {
    expect(bulbapediaUrl("Pokémon Tower")).toBe(
      "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Tower"
    );
  });

  it("deixa o apóstrofo passar — o MediaWiki aceita cru", () => {
    expect(bulbapediaUrl("Oak's Letter")).toBe(
      "https://bulbapedia.bulbagarden.net/wiki/Oak's_Letter"
    );
  });

  it("não duplica o prefixo quando o título já tem underscore", () => {
    expect(bulbapediaUrl("Sky_Pillar")).toBe(
      "https://bulbapedia.bulbagarden.net/wiki/Sky_Pillar"
    );
  });
});

describe("fandomPtUrl", () => {
  it("aponta para a wiki pt-br", () => {
    expect(fandomPtUrl("Pikachu")).toBe(
      "https://pokemon.fandom.com/pt-br/wiki/Pikachu"
    );
  });
});

describe("sprites locais", () => {
  it("pokémon sai de /sprites/pokemon, por id", () => {
    expect(pixelSpriteUrl(25)).toBe("/sprites/pokemon/25.png");
  });

  it("item sai de /sprites/items, por slug", () => {
    expect(itemSpriteUrl("master-ball")).toBe("/sprites/items/master-ball.png");
  });

  it("id ou slug ausente devolve string vazia, para cair no placeholder", () => {
    expect(pixelSpriteUrl(undefined)).toBe("");
    expect(itemSpriteUrl(undefined)).toBe("");
  });

  it("nenhuma URL de sprite aponta para fora do projeto", () => {
    for (const url of [pixelSpriteUrl(1), itemSpriteUrl("red-orb")]) {
      expect(url.startsWith("/")).toBe(true);
      expect(url).not.toMatch(/^https?:/);
    }
  });
});

// Regressao: os chips da lore usam nomes amigaveis ("giratina") e o indice
// guarda o slug da API ("giratina-altered"). Sem passar por resolveName, oito
// chips ficavam sem sprite.
describe("nome curado -> id do índice", () => {
  const index = buildNameIndex([
    { name: "giratina-altered", url: "/pokemon/487/" },
    { name: "deoxys-normal", url: "/pokemon/386/" },
    { name: "zygarde-50", url: "/pokemon/718/" },
    { name: "urshifu-single-strike", url: "/pokemon/892/" },
    { name: "meloetta-aria", url: "/pokemon/648/" },
    { name: "pikachu", url: "/pokemon/25/" },
  ]);
  const idOf = (name: string) => index.get(resolveName(name));

  it.each(["giratina", "deoxys", "zygarde", "urshifu", "meloetta"])(
    "resolve o apelido %s",
    (name) => {
      expect(idOf(name)).toBeDefined();
    }
  );

  it("mantém funcionando quem não precisa de apelido", () => {
    expect(idOf("pikachu")).toBe(25);
  });

  it("devolve undefined para nome inexistente", () => {
    expect(idOf("naoexiste")).toBeUndefined();
  });
});
