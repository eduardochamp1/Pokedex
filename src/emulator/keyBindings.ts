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

export const KEY_BINDINGS: KeyBinding[] = [
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

export const GROUP_LABELS: Record<KeyBinding["group"], string> = {
  direcional: "Direcional",
  acao: "Ação",
  ombro: "Ombro",
  sistema: "Sistema",
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

export function applyKeyBindings(core: mGBAEmulator): void {
  for (const { sdlKey, button } of KEY_BINDINGS) {
    core.bindKey(sdlKey, button);
  }
}
