/**
 * O que a sessao lembra de uma visita para a outra.
 *
 * Navegar para outra pagina e voltar ja preservava o jogo, porque o core e o
 * canvas sao singletons fora do React. Recarregar a pagina (F5) nao: o core
 * morre junto. A ROM continua no IndexedDB, mas era preciso ir na biblioteca e
 * clicar de novo.
 *
 * Aqui guardamos o suficiente para refazer isso sozinho — e so isso. O
 * progresso do jogo continua vindo do IDBFS do core, nao daqui.
 */
import { clearPref, loadPref, savePref } from "./prefs";

const LAST_ROM = "last-rom";
const VOLUME = "volume";

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/** Volume em 0..100. */
const isVolume = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;

/**
 * Ultima ROM jogada.
 *
 * "Fechar jogo" limpa: fechar e dizer que nao quer aquilo de volta na proxima
 * visita. Sem esse par, retomar automatico viraria uma decisao que o usuario
 * nao tem como desfazer.
 */
export function rememberLastRom(fileName: string): void {
  savePref(LAST_ROM, fileName);
}

export function forgetLastRom(): void {
  clearPref(LAST_ROM);
}

export function getLastRom(): string | undefined {
  return loadPref(LAST_ROM, isString);
}

export function rememberVolume(percent: number): void {
  savePref(VOLUME, percent);
}

export function getVolume(): number {
  return loadPref(VOLUME, isVolume) ?? 100;
}

