/**
 * Identifica o jogo pelo cabeçalho do cartucho.
 *
 * Até aqui o site só olhava a extensão do arquivo — `consoleOf` em `types.ts`
 * responde "Game Boy Advance" e para por aí, sem saber se é Emerald, Tetris ou
 * um homebrew. Enquanto isso `src/data/versionGroups.ts` já carrega os ids de
 * todos os jogos que o core roda, e nada em `src/emulator/` os usava.
 *
 * Este módulo é puro: recebe bytes, devolve dados. Não conhece o core, não toca
 * no FS e não depende de React — dá para testá-lo com buffers montados à mão.
 *
 * ## O que ele NÃO faz, e por quê
 *
 * **Não distingue romhack de jogo oficial, e isso não tem conserto.** Medido
 * nas quatro ROMs de `roms/`: `Pokemon Rocket - b3.0.gba` e
 * `Pokemon Unbound (v2.1.1.1).gba` têm o bloco `0xA0..0xBF` **byte a byte
 * idêntico** ao de uma FireRed oficial — mesmo título, mesmo game code, mesma
 * versão, mesmo checksum de cabeçalho. Não existe campo anti-hack: a BIOS
 * valida o logo Nintendo no boot, então todo hack o preserva intacto. Nem o
 * tamanho separa — Rocket tem os mesmos 16 MB de uma FireRed.
 *
 * Então o que sai daqui é a **base** do cartucho, nunca "este é o jogo". Quem
 * manda na linha principal da tela é o nome do arquivo; isto aqui vira
 * subtítulo.
 *
 * **Nunca use `codigo` como chave de persistência.** Rocket e Unbound geram a
 * mesma chave: virando chave de save, de cache ou de índice de biblioteca, os
 * dois jogos passariam a compartilhar o mesmo save e o progresso corromperia.
 * A chave tem que sair do nome do arquivo.
 *
 * **GB e GBC ficam de fora.** Não há `.gb` nem `.gbc` no repositório para
 * conferir, e os offsets desses cabeçalhos só existiriam aqui de memória. Um
 * cartucho desses cai no `null` e a tela usa `consoleOf` como antes.
 */

/** Quantos bytes bastam para identificar um cartucho GBA. */
export const GBA_HEADER_BYTES = 0xc0;

const TITULO_OFFSET = 0xa0;
const TITULO_TAMANHO = 12;
const CODIGO_OFFSET = 0xac;
const CODIGO_TAMANHO = 4;
/** Byte fixo do formato GBA. Ausente, não é cartucho de GBA. */
const MARCA_FIXA_OFFSET = 0xb2;
const MARCA_FIXA = 0x96;
const VERSAO_OFFSET = 0xbc;

export interface RomId {
  /** Os 12 bytes do título, aparados. Ex.: `POKEMON EMER`. */
  titulo: string;
  /** Game code completo: 3 bytes de jogo + 1 de região. Ex.: `BPEE`. */
  codigo: string;
  console: "Game Boy Advance";
  /** Nome do jogo em inglês, como ele é vendido e citado. */
  jogo: string;
  /** Id de `src/data/versionGroups.ts`. */
  versionGroupId: string;
  /** Número da geração, como em `src/data/generations.ts`. */
  geracao: number;
  /** Id de `src/data/regions.ts`. */
  regiaoId: string;
  /** Região do cartucho, do quarto byte do game code. */
  regiaoDoCartucho?: string;
  /** Revisão do software (byte 0xBC). */
  versao: number;
}

interface Jogo {
  jogo: string;
  versionGroupId: string;
  geracao: number;
  regiaoId: string;
}

/**
 * Jogos por prefixo de três letras do game code — o quarto byte é a região.
 *
 * Os três primeiros foram lidos das ROMs de `roms/` e são dado medido. Ruby e
 * Sapphire **não** têm ROM aqui para conferir: os códigos vêm da convenção
 * documentada do GBA, e errá-los custa pouco — o cartucho simplesmente não é
 * reconhecido e a tela volta a `consoleOf`.
 */
const JOGOS: Record<string, Jogo> = {
  // medidos em roms/
  BPE: {
    jogo: "Emerald",
    versionGroupId: "emerald",
    geracao: 3,
    regiaoId: "hoenn",
  },
  BPG: {
    jogo: "LeafGreen",
    versionGroupId: "firered-leafgreen",
    geracao: 3,
    regiaoId: "kanto",
  },
  BPR: {
    jogo: "FireRed",
    versionGroupId: "firered-leafgreen",
    geracao: 3,
    regiaoId: "kanto",
  },
  // não conferidos contra ROM local
  AXV: {
    jogo: "Ruby",
    versionGroupId: "ruby-sapphire",
    geracao: 3,
    regiaoId: "hoenn",
  },
  AXP: {
    jogo: "Sapphire",
    versionGroupId: "ruby-sapphire",
    geracao: 3,
    regiaoId: "hoenn",
  },
};

/** Quarto byte do game code. */
const REGIOES: Record<string, string> = {
  E: "Estados Unidos",
  J: "Japão",
  P: "Europa",
  D: "Alemanha",
  F: "França",
  I: "Itália",
  S: "Espanha",
  K: "Coreia",
};

/**
 * Bytes para texto, em latin1.
 *
 * `TextDecoder("utf-8", { fatal: true })` explode em título com byte ≥ 0x80, e
 * o não-fatal troca por U+FFFD. Aqui cada byte é um code point, que é o que o
 * cabeçalho realmente guarda.
 */
function latin1(bytes: Uint8Array): string {
  let texto = "";
  for (const byte of bytes) texto += String.fromCharCode(byte);
  return texto;
}

export function identifyRom(bytes: Uint8Array | undefined | null): RomId | null {
  if (!bytes || bytes.length < GBA_HEADER_BYTES) return null;
  if (bytes[MARCA_FIXA_OFFSET] !== MARCA_FIXA) return null;

  // Corte de tamanho fixo, e só depois a aparagem: o título de 12 caracteres
  // não tem terminador, e procurar NUL leria direto no game code.
  const titulo = latin1(
    bytes.subarray(TITULO_OFFSET, TITULO_OFFSET + TITULO_TAMANHO)
  )
    .replace(/[\0\s]+$/, "");
  const codigo = latin1(
    bytes.subarray(CODIGO_OFFSET, CODIGO_OFFSET + CODIGO_TAMANHO)
  ).replace(/[\0\s]+$/, "");

  const jogo = JOGOS[codigo.slice(0, 3)];
  if (!jogo) return null;

  return {
    titulo,
    codigo,
    console: "Game Boy Advance",
    ...jogo,
    regiaoDoCartucho: REGIOES[codigo.charAt(3)],
    versao: bytes[VERSAO_OFFSET] ?? 0,
  };
}
