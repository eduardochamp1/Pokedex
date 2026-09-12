/**
 * Tradução entre a tecla que o navegador reporta e o nome que o core aceita.
 *
 * `bindKey(nome, acao)` entrega o nome para o lado C, que o resolve com a
 * tabela do SDL — os nomes que ja estavam no projeto ("Up", "Z", "Return",
 * "Backspace") sao exatamente o que `SDL_GetKeyName` produz.
 *
 * Partimos de `KeyboardEvent.code`, e nao de `.key`: `code` e a tecla FISICA,
 * independente de layout e de modificador. Num teclado ABNT2 ou AZERTY, `.key`
 * de uma mesma tecla muda; `code` nao. Como o que o jogador memoriza e a
 * posicao da tecla, `code` e o que corresponde ao que ele sente.
 */

const LETTERS = /^Key([A-Z])$/;
const DIGITS = /^Digit([0-9])$/;
const NUMPAD = /^Numpad([0-9])$/;
const FUNCTION = /^F([1-9]|1[0-2])$/;

/** Teclas nomeadas, de `code` para o nome SDL. */
const NAMED: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Return",
  NumpadEnter: "Keypad Enter",
  Backspace: "Backspace",
  Space: "Space",
  Tab: "Tab",
  Escape: "Escape",
  ShiftLeft: "Left Shift",
  ShiftRight: "Right Shift",
  ControlLeft: "Left Ctrl",
  ControlRight: "Right Ctrl",
  AltLeft: "Left Alt",
  AltRight: "Right Alt",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  Delete: "Delete",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
};

/**
 * Nome SDL para um `KeyboardEvent.code`, ou null se for uma tecla que nao vale
 * a pena vincular (teclas mortas, midia, Meta/Win — que o sistema costuma
 * interceptar antes da pagina ver).
 */
export function sdlKeyFromCode(code: string): string | null {
  const letter = LETTERS.exec(code);
  if (letter) return letter[1];

  const digit = DIGITS.exec(code);
  if (digit) return digit[1];

  const numpad = NUMPAD.exec(code);
  if (numpad) return `Keypad ${numpad[1]}`;

  if (FUNCTION.test(code)) return code;

  return NAMED[code] ?? null;
}

/** `KeyboardEvent.key` nomeia as teclas especiais diferente de `code`. */
const FROM_KEY: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Return",
  " ": "Space",
  Spacebar: "Space",
  Backspace: "Backspace",
  Tab: "Tab",
  Escape: "Escape",
  Shift: "Left Shift",
  Control: "Left Ctrl",
  Alt: "Left Alt",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  Delete: "Delete",
};

/**
 * Nome SDL a partir de um evento de teclado.
 *
 * `code` e a fonte preferida por ser fisica e independente de layout, mas nem
 * sempre vem: teclado virtual de sistema, alguns IMEs e certas ferramentas de
 * automacao entregam `code` vazio. Nesses casos `key` e o que sobra — perde a
 * independencia de layout, e ainda assim vincula a tecla certa para quem esta
 * escolhendo naquele teclado.
 */
export function sdlKeyFromEvent(event: {
  code?: string;
  key?: string;
}): string | null {
  const fromCode = event.code ? sdlKeyFromCode(event.code) : null;
  if (fromCode) return fromCode;

  const key = event.key;
  if (!key) return null;
  if (FROM_KEY[key]) return FROM_KEY[key];
  if (/^[a-zA-Z]$/.test(key)) return key.toUpperCase();
  if (/^[0-9]$/.test(key)) return key;
  if (FUNCTION.test(key)) return key;
  // Pontuacao que o SDL nomeia pelo proprio caractere.
  if (key.length === 1 && "-=[]\\;',./`".includes(key)) return key;
  return null;
}

/** Como mostrar a tecla na legenda — curto, porque vai num `<kbd>`. */
const LABELS: Record<string, string> = {
  Up: "↑",
  Down: "↓",
  Left: "←",
  Right: "→",
  Return: "Enter",
  "Keypad Enter": "Num Enter",
  Backspace: "Backspace",
  Space: "Espaço",
  Escape: "Esc",
  "Left Shift": "Shift ⇦",
  "Right Shift": "Shift ⇨",
  "Left Ctrl": "Ctrl ⇦",
  "Right Ctrl": "Ctrl ⇨",
  "Left Alt": "Alt ⇦",
  "Right Alt": "Alt ⇨",
  PageUp: "PgUp",
  PageDown: "PgDn",
  Delete: "Del",
  Insert: "Ins",
};

export function labelForSdlKey(sdlKey: string): string {
  return LABELS[sdlKey] ?? sdlKey;
}
