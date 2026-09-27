import { loadPref, savePref } from "./prefs";
import { labelForSdlKey } from "./keyNames";
import type { mGBAEmulator } from "./types";

/**
 * Mapa de teclas do emulador.
 *
 * O core traz bindings default dentro do wasm, que nao dao para inspecionar do
 * JS. Em vez de exibir uma legenda que pode estar errada, definimos as teclas
 * aqui e aplicamos com `bindKey` — a legenda da UI le desta mesma lista, entao
 * o que esta na tela e o que esta valendo.
 *
 * `sdlKey` usa o nome SDL da tecla fisica; `button` e a acao do console.
 */
export interface KeyBinding {
  sdlKey: string;
  button: string;
  /** Como mostrar a tecla na legenda. */
  label: string;
  group: "direcional" | "acao" | "ombro" | "sistema";
}

/** As dez acoes do console, na ordem em que a legenda as agrupa. */
export const DEFAULT_BINDINGS: KeyBinding[] = [
  { sdlKey: "Up", button: "Up", label: "↑", group: "direcional" },
  { sdlKey: "Down", button: "Down", label: "↓", group: "direcional" },
  { sdlKey: "Left", button: "Left", label: "←", group: "direcional" },
  { sdlKey: "Right", button: "Right", label: "→", group: "direcional" },
  { sdlKey: "Z", button: "A", label: "Z", group: "acao" },
  { sdlKey: "X", button: "B", label: "X", group: "acao" },
  { sdlKey: "A", button: "L", label: "A", group: "ombro" },
  { sdlKey: "S", button: "R", label: "S", group: "ombro" },
  { sdlKey: "Return", button: "Start", label: "Enter", group: "sistema" },
  { sdlKey: "Backspace", button: "Select", label: "Backspace", group: "sistema" },
];

/** As acoes que o core reconhece, minusculas, como em `keyBindings` no mgba.js. */
const VALID_BUTTONS = new Set(
  DEFAULT_BINDINGS.map((b) => b.button.toLowerCase())
);

export const GROUP_LABELS: Record<KeyBinding["group"], string> = {
  direcional: "Direcional",
  acao: "Ação",
  ombro: "Ombro",
  sistema: "Sistema",
};

export const GROUP_LABELS_EN: Record<KeyBinding["group"], string> = {
  direcional: "D-pad",
  acao: "Action",
  ombro: "Shoulder",
  sistema: "System",
};

/** Botões do gamepad virtual (toque), na ordem em que aparecem na tela. */
export const TOUCH_BUTTONS = [
  { button: "Up", label: "↑", area: "up" },
  { button: "Left", label: "←", area: "left" },
  { button: "Right", label: "→", area: "right" },
  { button: "Down", label: "↓", area: "down" },
  { button: "B", label: "B", area: "b" },
  { button: "A", label: "A", area: "a" },
  { button: "L", label: "L", area: "l" },
  { button: "R", label: "R", area: "r" },
  { button: "Select", label: "Select", area: "select" },
  { button: "Start", label: "Start", area: "start" },
] as const;

const BINDINGS_PREF = "key-bindings";

/** O que vai para o localStorage: acao -> tecla SDL. O resto se deriva. */
export type StoredBindings = Record<string, string>;

function isStoredBindings(value: unknown): value is StoredBindings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.entries(value).every(
    ([button, key]) =>
      typeof key === "string" &&
      key.length > 0 &&
      VALID_BUTTONS.has(button.toLowerCase())
  );
}

/**
 * Aplica as teclas gravadas sobre os defaults.
 *
 * Guardamos so o que difere do padrao: assim um default que mude numa versao
 * futura chega a quem nunca remapeou aquela acao, em vez de ficar congelado
 * pelo que o localStorage guardou.
 */
export function mergeBindings(
  stored: StoredBindings | undefined
): KeyBinding[] {
  if (!stored) return DEFAULT_BINDINGS.map((b) => ({ ...b }));
  return DEFAULT_BINDINGS.map((binding) => {
    const custom = stored[binding.button];
    if (!custom || custom === binding.sdlKey) return { ...binding };
    return { ...binding, sdlKey: custom, label: labelForSdlKey(custom) };
  });
}

/** So o que difere do padrao, para gravar. */
export function diffFromDefaults(bindings: KeyBinding[]): StoredBindings {
  const diff: StoredBindings = {};
  for (const binding of bindings) {
    const original = DEFAULT_BINDINGS.find((d) => d.button === binding.button);
    if (original && original.sdlKey !== binding.sdlKey) {
      diff[binding.button] = binding.sdlKey;
    }
  }
  return diff;
}

export function loadBindings(): KeyBinding[] {
  return mergeBindings(loadPref(BINDINGS_PREF, isStoredBindings));
}

export function saveBindings(bindings: KeyBinding[]): void {
  savePref(BINDINGS_PREF, diffFromDefaults(bindings));
}

export function resetBindings(): KeyBinding[] {
  savePref(BINDINGS_PREF, {});
  return DEFAULT_BINDINGS.map((b) => ({ ...b }));
}

/**
 * Troca a tecla de uma acao.
 *
 * Se a tecla ja pertencia a outra acao, as duas TROCAM em vez de a antiga
 * ficar sem tecla nenhuma: duas acoes na mesma tecla fariam o core disparar as
 * duas ao mesmo tempo, e uma acao sem techa e um controle quebrado que a tela
 * nao teria como explicar.
 */
export function rebind(
  bindings: KeyBinding[],
  button: string,
  sdlKey: string
): KeyBinding[] {
  const target = bindings.find((b) => b.button === button);
  if (!target || target.sdlKey === sdlKey) return bindings;
  const conflict = bindings.find(
    (b) => b.sdlKey === sdlKey && b.button !== button
  );
  return bindings.map((b) => {
    if (b.button === button) {
      return { ...b, sdlKey, label: labelForSdlKey(sdlKey) };
    }
    if (conflict && b.button === conflict.button) {
      return {
        ...b,
        sdlKey: target.sdlKey,
        label: labelForSdlKey(target.sdlKey),
      };
    }
    return b;
  });
}

/**
 * Escreve o mapa no core.
 *
 * `previous` existe porque o core guarda tecla -> acao e nao tem "desvincular"
 * na API publica: sem soltar as teclas que sairam do mapa, a antiga continuaria
 * disparando a acao junto com a nova. Desvincular e `bindKey(tecla, -1)` pelo
 * cwrap cru — o indice negativo nao casa com nenhuma acao.
 */
export function applyKeyBindings(
  core: mGBAEmulator,
  bindings: KeyBinding[] = DEFAULT_BINDINGS,
  previous?: KeyBinding[]
): void {
  if (previous) {
    const stillUsed = new Set(bindings.map((b) => b.sdlKey));
    for (const old of previous) {
      if (!stillUsed.has(old.sdlKey)) unbindKey(core, old.sdlKey);
    }
  }
  for (const { sdlKey, button } of bindings) {
    core.bindKey(sdlKey, button);
  }
}

/**
 * `cwrap` existe no modulo em runtime (e Emscripten), mas a tipagem publicada
 * do core nao o declara. O acesso fica isolado aqui, com o formato que usamos.
 */
interface CwrapCapable {
  cwrap?: (
    name: string,
    returnType: null,
    argTypes: string[]
  ) => (key: string, input: number) => void;
}

/** Solta uma tecla fisica. Silencioso: nao vale derrubar o jogo por isso. */
function unbindKey(core: mGBAEmulator, sdlKey: string): void {
  try {
    const cwrap = (core as unknown as CwrapCapable).cwrap;
    if (!cwrap) return;
    cwrap("bindKey", null, ["string", "number"])(sdlKey, -1);
  } catch {
    // Sem cwrap (versao futura do core): a tecla antiga segue valendo ate
    // recarregar a pagina. Melhor do que impedir o remapeamento.
  }
}
