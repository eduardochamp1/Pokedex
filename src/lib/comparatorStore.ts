import { useSyncExternalStore } from "react";

export interface Slot {
  name: string;
  height: number;
  sprite: string;
}

export const MAX = 6;
const KEY = "comparator-cart";

function load(): Slot[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Slot =>
        x &&
        typeof x.name === "string" &&
        typeof x.height === "number" &&
        typeof x.sprite === "string"
    );
  } catch {
    return [];
  }
}

let state: Slot[] = load();
const listeners = new Set<() => void>();

function save() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignora quota
  }
}

function emit() {
  save();
  listeners.forEach((l) => l());
}

export function snapshot(): Slot[] {
  return state;
}

export function add(slot: Slot) {
  if (state.some((s) => s.name === slot.name)) return;
  if (state.length >= MAX) return;
  state = [...state, slot];
  emit();
}

export function remove(name: string) {
  const next = state.filter((s) => s.name !== name);
  if (next.length === state.length) return;
  state = next;
  emit();
}

export function clear() {
  if (state.length === 0) {
    // Ainda persiste vazio, para nao ressuscitar itens antigos no proximo mount.
    save();
    return;
  }
  state = [];
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useComparator(): Slot[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
