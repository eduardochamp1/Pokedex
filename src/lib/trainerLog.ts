/**
 * A ficha do treinador e a linha do tempo da partida, guardadas por ROM.
 *
 * `saves/` guarda um backup por jogo, sobrescrito a cada gravação — não há
 * histórico em disco. Então o histórico nasce aqui: a cada leitura do save, o
 * instantâneo novo é comparado com o anterior, e o que mudou vira evento
 * ("capturou", "subiu de nível", "ganhou insígnia"). O instantâneo antigo é
 * descartado; só os eventos ficam. A linha do tempo começa no primeiro save
 * lido depois que isto existe — o que veio antes não tem como ser recuperado.
 *
 * Mesmo molde de `playerDex`: `localStorage`, `useSyncExternalStore`, entrada
 * de forma errada descartada na leitura.
 */
import { useSyncExternalStore } from "react";
import type { Gen3Game, Gen3PartyMember, Gen3Save, Gen3Trainer } from "../emulator/saveParse/gen3";
import type { StoredBox } from "./pcBoxes";
import { newlyDone } from "./achievements";

export interface SnapshotMon {
  personality: number;
  national: number;
  nickname: string;
  level: number;
  /** Ausente nas fichas gravadas antes das conquistas. */
  shiny?: boolean;
}

export interface Snapshot {
  at: number;
  playSeconds: number;
  owned: number[];
  seenCount: number;
  /** Vazio onde o jogo não foi medido: sem insígnias, nenhum evento delas. */
  badges: boolean[];
  /** Só Emerald registra cidades; nos outros fica vazio. */
  towns: number[];
  party: SnapshotMon[];
}

interface Base {
  /** Relógio real, ms. */
  at: number;
  /** Tempo de jogo no save que gerou o evento, em segundos. */
  playSeconds: number;
}

export type TrainerEvent = Base &
  (
    | { kind: "start"; owned: number; seen: number }
    | { kind: "captured"; national: number }
    | { kind: "badge"; index: number }
    | { kind: "town"; index: number }
    | { kind: "level"; national: number; nickname: string; from: number; to: number }
    | { kind: "evolved"; nickname: string; from: number; to: number }
    | { kind: "rewind" }
    | { kind: "achievement"; id: string }
  );

export interface TrainerEntry {
  rom: string;
  /** Ausente nas entradas gravadas antes de FR/LG e R/S serem lidos: eram Emerald. */
  game?: Gen3Game;
  updatedAt: number;
  playerName: string;
  trainer: Gen3Trainer;
  party: SnapshotMon[];
  /** O time inteiro, com os status gravados. Ausente nas fichas anteriores à calculadora. */
  team?: Gen3PartyMember[];
  boxes: StoredBox[];
  owned: number[];
  seen: number[];
  last: Snapshot;
  events: TrainerEvent[];
}

export const MAX_EVENTS = 500;
const KEY = "pokedex:trainer-log";

const segundos = (t: Gen3Trainer) =>
  t.playTime.hours * 3600 + t.playTime.minutes * 60 + t.playTime.seconds;

export function snapshotOf(save: Gen3Save, at: number): Snapshot | null {
  if (!save.trainer) return null;
  return {
    at,
    playSeconds: segundos(save.trainer),
    owned: [...(save.pokedex?.owned ?? [])],
    seenCount: save.pokedex?.seen.length ?? 0,
    badges: [...(save.trainer.badges ?? [])],
    towns: [...(save.trainer.visitedTowns ?? [])],
    party: save.party.map((m) => ({
      personality: m.personality,
      national: m.national,
      nickname: m.nickname,
      level: m.level,
      shiny: m.shiny,
    })),
  };
}

/**
 * O que aconteceu entre dois saves. Pura: não lê nem grava nada.
 *
 * O pokémon é identificado pelo PV, que não muda ao evoluir — é o que permite
 * dizer "Mudkip evoluiu" em vez de "saiu um Mudkip e entrou um Marshtomp".
 */
export function diffSnapshots(prev: Snapshot, next: Snapshot): TrainerEvent[] {
  const base = { at: next.at, playSeconds: next.playSeconds };
  const doTime: TrainerEvent[] = [];
  const evoluidos = new Set<number>();

  const antes = new Map(prev.party.map((m) => [m.personality, m]));
  for (const m of next.party) {
    const a = antes.get(m.personality);
    if (!a) continue;
    // Nível antes da evolução: é subir de nível que faz evoluir.
    if (m.level > a.level) {
      doTime.push({
        ...base,
        kind: "level",
        national: m.national,
        nickname: m.nickname,
        from: a.level,
        to: m.level,
      });
    }
    if (a.national !== m.national) {
      evoluidos.add(m.national);
      doTime.push({ ...base, kind: "evolved", nickname: m.nickname, from: a.national, to: m.national });
    }
  }

  const events: TrainerEvent[] = [];
  // Evoluir também marca a espécie nova como capturada na dex — mas não é uma
  // captura, e a evolução já tem o seu evento.
  const tinha = new Set(prev.owned);
  for (const n of next.owned) {
    if (!tinha.has(n) && !evoluidos.has(n)) events.push({ ...base, kind: "captured", national: n });
  }

  next.badges.forEach((tem, i) => {
    if (tem && !prev.badges[i]) events.push({ ...base, kind: "badge", index: i });
  });

  const visitadas = new Set(prev.towns);
  for (const i of next.towns) if (!visitadas.has(i)) events.push({ ...base, kind: "town", index: i });

  return [...events, ...doTime];
}

function isEntry(v: unknown): v is TrainerEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.rom === "string" &&
    typeof e.updatedAt === "number" &&
    typeof e.playerName === "string" &&
    !!e.trainer &&
    typeof e.trainer === "object" &&
    Array.isArray(e.party) &&
    Array.isArray(e.boxes) &&
    Array.isArray(e.owned) &&
    Array.isArray(e.seen) &&
    !!e.last &&
    typeof e.last === "object" &&
    Array.isArray(e.events)
  );
}

function load(): Record<string, TrainerEntry> {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return {};
  }
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, TrainerEntry> = {};
    for (const [rom, e] of Object.entries(parsed)) if (isEntry(e) && e.rom === rom) out[rom] = e;
    return out;
  } catch {
    return {};
  }
}

let entradas: Record<string, TrainerEntry> = {};
let latest: TrainerEntry | null = null;
let todas: TrainerEntry[] = [];
const listeners = new Set<() => void>();

function atualizar() {
  latest = null;
  for (const e of Object.values(entradas)) if (!latest || e.updatedAt > latest.updatedAt) latest = e;
  todas = Object.values(entradas).sort((a, b) => b.updatedAt - a.updatedAt);
  listeners.forEach((l) => l());
}

export function reloadTrainerLog(): void {
  entradas = load();
  atualizar();
}

reloadTrainerLog();

/**
 * A ficha de um save, sem histórico. É o que `recordTrainerSave` grava e o
 * que o comparador monta de um `.sav` avulso, que não entra no registro.
 */
export function entryFromSave(rom: string, save: Gen3Save, now: number = Date.now()): TrainerEntry | null {
  const snap = snapshotOf(save, now);
  if (!snap || !save.trainer) return null;
  return {
    rom,
    game: save.game,
    updatedAt: now,
    playerName: save.playerName,
    trainer: save.trainer,
    party: snap.party,
    team: save.party,
    boxes: (save.boxes?.boxes ?? []).map((c) => ({ name: c.name, pokemon: c.pokemon })),
    owned: snap.owned,
    seen: [...(save.pokedex?.seen ?? [])],
    last: snap,
    events: [],
  };
}

/**
 * Registra um save lido. Save sem ficha de treinador (sem chave de
 * segurança lida) não entra: sem tempo de jogo não há como ordenar a linha do
 * tempo.
 */
export function recordTrainerSave(rom: string, save: Gen3Save, now: number = Date.now()): void {
  const nova = entryFromSave(rom, save, now);
  if (!nova) return;
  const snap = nova.last;

  const anterior = entradas[rom];
  let novos: TrainerEvent[];
  let comparar = false;
  if (!anterior) {
    novos = [
      { at: now, playSeconds: snap.playSeconds, kind: "start", owned: snap.owned.length, seen: snap.seenCount },
    ];
  } else if (snap.playSeconds < anterior.last.playSeconds) {
    // Um backup antigo foi restaurado: comparar daria "perdeu insígnia".
    novos = [{ at: now, playSeconds: snap.playSeconds, kind: "rewind" }];
  } else {
    novos = diffSnapshots(anterior.last, snap);
    comparar = true;
  }

  const entry: TrainerEntry = { ...nova, events: [...(anterior?.events ?? []), ...novos].slice(-MAX_EVENTS) };
  // Conquista destravada vira evento — mas não na primeira leitura (despejaria
  // tudo o que já estava feito) nem ao voltar para um save antigo.
  if (anterior && comparar) {
    const base = { at: now, playSeconds: snap.playSeconds };
    const feitas = newlyDone(anterior, entry).map((id): TrainerEvent => ({ ...base, kind: "achievement", id }));
    if (feitas.length) entry.events = [...entry.events, ...feitas].slice(-MAX_EVENTS);
  }
  entradas = { ...entradas, [rom]: entry };
  try {
    localStorage.setItem(KEY, JSON.stringify(entradas));
  } catch {
    // sem localStorage: vale só nesta aba
  }
  atualizar();
}

export function latestTrainerEntry(): TrainerEntry | null {
  return latest;
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) reloadTrainerLog();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Todas as fichas, a mais recente primeiro. A referência só muda quando alguma muda. */
export function allTrainerEntries(): TrainerEntry[] {
  return todas;
}

export function useTrainerEntries(): TrainerEntry[] {
  return useSyncExternalStore(subscribe, allTrainerEntries, () => todas);
}

export function useTrainerEntry(): TrainerEntry | null {
  return useSyncExternalStore(subscribe, latestTrainerEntry, () => null);
}
