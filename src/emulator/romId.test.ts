import { describe, it, expect } from "vitest";
import { identifyRom, GBA_HEADER_BYTES } from "./romId";

/**
 * Monta um cabeçalho GBA sintético.
 *
 * Os offsets vieram da leitura byte a byte das quatro ROMs de `roms/` e batem
 * com o cabeçalho documentado: título em 0xA0 (12 bytes), game code em 0xAC
 * (4 bytes), maker em 0xB0 (2 bytes), a marca fixa 0x96 em 0xB2 e a versão do
 * software em 0xBC.
 */
function cabecalhoGba(opts: {
  titulo: string;
  codigo: string;
  versao?: number;
  marcaFixa?: number;
}): Uint8Array {
  const bytes = new Uint8Array(GBA_HEADER_BYTES);
  const escrever = (offset: number, texto: string, tamanho: number) => {
    for (let i = 0; i < tamanho; i++) {
      bytes[offset + i] = i < texto.length ? texto.charCodeAt(i) : 0x00;
    }
  };
  escrever(0xa0, opts.titulo, 12);
  escrever(0xac, opts.codigo, 4);
  escrever(0xb0, "01", 2);
  bytes[0xb2] = opts.marcaFixa ?? 0x96;
  bytes[0xbc] = opts.versao ?? 0;
  return bytes;
}

describe("identifyRom — cabeçalho GBA", () => {
  it("reconhece Emerald pelo game code BPEE", () => {
    const id = identifyRom(cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEE" }));
    expect(id).not.toBeNull();
    expect(id?.jogo).toBe("Emerald");
    expect(id?.versionGroupId).toBe("emerald");
    expect(id?.geracao).toBe(3);
    expect(id?.regiaoId).toBe("hoenn");
    expect(id?.console).toBe("Game Boy Advance");
  });

  it("reconhece LeafGreen pelo game code BPGE", () => {
    const id = identifyRom(
      cabecalhoGba({ titulo: "POKEMON LEAF", codigo: "BPGE", versao: 1 })
    );
    expect(id?.jogo).toBe("LeafGreen");
    expect(id?.versionGroupId).toBe("firered-leafgreen");
    expect(id?.geracao).toBe(3);
    expect(id?.regiaoId).toBe("kanto");
    expect(id?.versao).toBe(1);
  });

  it("reconhece FireRed pelo game code BPRE", () => {
    const id = identifyRom(cabecalhoGba({ titulo: "POKEMON FIRE", codigo: "BPRE" }));
    expect(id?.jogo).toBe("FireRed");
    expect(id?.versionGroupId).toBe("firered-leafgreen");
    expect(id?.regiaoId).toBe("kanto");
  });

  /**
   * O título ocupa os 12 bytes inteiros, sem terminador: `POKEMON EMER` são
   * exatos 12 caracteres e não há `0x00` depois. Quem procura NUL para achar o
   * fim lê direto no game code e devolve "POKEMON EMERBPEE".
   */
  it("não deixa o título vazar para dentro do game code", () => {
    const id = identifyRom(cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEE" }));
    expect(id?.titulo).toBe("POKEMON EMER");
    expect(id?.codigo).toBe("BPEE");
  });

  it("apara NUL e espaços à direita do título", () => {
    const id = identifyRom(cabecalhoGba({ titulo: "POKEMON", codigo: "BPEE" }));
    expect(id?.titulo).toBe("POKEMON");
  });

  /** latin1, não UTF-8: um decodificador estrito explodiria em byte ≥ 0x80. */
  it("não estoura com byte alto no título", () => {
    const bytes = cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEE" });
    bytes[0xa0] = 0xff;
    expect(() => identifyRom(bytes)).not.toThrow();
    expect(identifyRom(bytes)?.jogo).toBe("Emerald");
  });

  it("lê a região do cartucho do quarto byte do game code", () => {
    expect(
      identifyRom(cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEE" }))
        ?.regiaoDoCartucho
    ).toBe("Estados Unidos");
    expect(
      identifyRom(cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEJ" }))
        ?.regiaoDoCartucho
    ).toBe("Japão");
  });

  it("devolve null para game code desconhecido, sem estourar", () => {
    const id = identifyRom(cabecalhoGba({ titulo: "TETRIS", codigo: "AZZZ" }));
    expect(id).toBeNull();
  });

  it("devolve null quando falta a marca fixa 0x96", () => {
    const id = identifyRom(
      cabecalhoGba({ titulo: "POKEMON EMER", codigo: "BPEE", marcaFixa: 0x00 })
    );
    expect(id).toBeNull();
  });

  it("devolve null para buffer curto demais", () => {
    expect(identifyRom(new Uint8Array(0))).toBeNull();
    expect(identifyRom(new Uint8Array(100))).toBeNull();
  });
});

/**
 * Rocket e Unbound têm cabeçalho **byte a byte idêntico** ao de uma FireRed
 * oficial — mesmo título, mesmo game code, mesma versão, mesmo checksum. Não
 * existe campo anti-hack, e a BIOS valida o logo Nintendo no boot, então os
 * hacks o preservam. Medido nas quatro ROMs de `roms/`.
 *
 * Por isso o módulo devolve a **base** do cartucho, nunca "este é o jogo": quem
 * manda na linha principal da tela é o nome do arquivo.
 */
describe("identifyRom — romhack", () => {
  it("um hack de FireRed se apresenta como FireRed, e isso é esperado", () => {
    const oficial = identifyRom(
      cabecalhoGba({ titulo: "POKEMON FIRE", codigo: "BPRE" })
    );
    const hack = identifyRom(
      cabecalhoGba({ titulo: "POKEMON FIRE", codigo: "BPRE" })
    );
    expect(hack).toEqual(oficial);
  });
});
