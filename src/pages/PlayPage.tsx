import { useEffect, useRef, useState, type DragEvent } from "react";
import "../styles/play.css";
import { useEmulator } from "../emulator/useEmulator";
import {
  GROUP_LABELS,
  TOUCH_BUTTONS,
  type KeyBinding,
} from "../emulator/keyBindings";
import { sdlKeyFromEvent } from "../emulator/keyNames";
import { SHORTCUT_HELP, isTypingTarget, shortcutFor } from "../emulator/shortcuts";
import {
  AV_TOGGLES,
  formatLogLine,
  isProblem,
} from "../emulator/diagnostics";
import { useGamepad } from "../emulator/useGamepad";
import { SUPPORTED_LABEL, consoleOf, type SaveStateSlot } from "../emulator/types";
import { GAME_GENERATIONS } from "../data/generations";
import { describeAge } from "../emulator/saveStates";
import { SCALE_MODES } from "../emulator/display";
import { rewindSeconds } from "../emulator/capture";
import { useDisplay } from "../emulator/useDisplay";
import { formatBytes } from "../emulator/storage";

const GROUPS: KeyBinding["group"][] = [
  "direcional",
  "acao",
  "ombro",
  "sistema",
];

/**
 * Algarismo romano da geracao, tirado do mesmo dado que a Lore publica.
 *
 * Reusar em vez de converter numero para romano aqui: se um dia a tabela
 * mudar, as duas telas mudam juntas.
 */
function romano(geracao: number): string {
  return (
    GAME_GENERATIONS.find((g) => g.id === geracao)?.roman ?? String(geracao)
  );
}

const PlayPage = () => {
  const emu = useEmulator();
  const romInputRef = useRef<HTMLInputElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // A tela cheia e a escala medem a moldura, não o host do canvas: é a moldura
  // que vira o elemento de tela cheia e que define o espaço disponível.
  const screenRef = useRef<HTMLDivElement>(null);
  const display = useDisplay(screenRef, emu.canvas, emu.notify);
  // A idade dos slots é relativa a este instante. Sem timer próprio: o painel
  // já re-renderiza a cada captura automática (30 s) e a cada ação de estado.
  const now = Date.now();

  const currentRom =
    emu.status.kind === "running" || emu.status.kind === "paused"
      ? emu.status.rom
      : undefined;
  const playing = currentRom !== undefined;

  /** Ação esperando uma tecla nova, ou null. */
  const [capturing, setCapturing] = useState<string | null>(null);
  /** ROM com a remoção pendente de confirmação, ou null. */
  const [removing, setRemoving] = useState<string | null>(null);
  const gamepadName = useGamepad(emu.gamepadApi, playing);
  // Avulsas para o efeito dos atalhos: cada uma é estável por si, ao contrário
  // do objeto `emu`, que é novo a cada render.
  const { bindings, setTurbo, saveState, loadState } = emu;

  // Enquanto captura, o core não pode receber o teclado: a tecla que está
  // sendo escolhida iria para o jogo junto. `toggleInput(false)` desliga a
  // entrada no core, e o listener em fase de captura impede que o evento
  // chegue aos handlers que o SDL registrou.
  useEffect(() => {
    if (!capturing) return;
    emu.setInputEnabled(false);

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Escape") {
        setCapturing(null);
        return;
      }
      const sdlKey = sdlKeyFromEvent(e);
      if (!sdlKey) {
        const shown = e.key || e.code;
        emu.notify(
          shown
            ? `"${shown}" não serve como tecla de jogo. Escolha outra.`
            : "Não deu para identificar essa tecla. Escolha outra."
        );
        return;
      }
      emu.rebindKey(capturing, sdlKey);
      setCapturing(null);
    };

    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true });
      emu.setInputEnabled(true);
    };
  }, [capturing, emu]);

  /**
   * Atalhos de teclado. Só com jogo carregado, e nunca enquanto a tela espera
   * uma tecla nova — ali a próxima tecla é a escolha, não um comando.
   */
  useEffect(() => {
    if (!playing || capturing) return;
    const boundKeys = new Set(bindings.map((b) => b.sdlKey));

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const shortcut = shortcutFor(e, boundKeys);
      if (!shortcut) return;
      e.preventDefault();
      if (shortcut.kind === "turbo") {
        // Direto no core: o turbo é momentâneo e não pode mexer na barra de
        // velocidade, que é a preferência de quem joga.
        if (!e.repeat) setTurbo(true);
        return;
      }
      const slot = shortcut.slot as SaveStateSlot;
      if (shortcut.kind === "save") void saveState(slot);
      else loadState(slot);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (shortcutFor(e, boundKeys)?.kind === "turbo") setTurbo(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      // Soltar a tecla fora da janela deixaria o turbo preso para sempre.
      setTurbo(false);
    };
    // Dependências avulsas, e não o objeto `emu`: ele é recriado a cada render,
    // e com ele na lista a limpeza rodava toda renderização — o turbo ligava e
    // era desligado no mesmo instante pelo próprio efeito.
  }, [playing, capturing, bindings, setTurbo, saveState, loadState]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void emu.playFile(file);
  };

  return (
    <div className="play-shell">
      <header className="play-header">
        <div>
          <h1>Jogar</h1>
          <p className="play-sub">
            Emulador {SUPPORTED_LABEL} rodando no navegador.
            {emu.version && <span className="play-core"> {emu.version}</span>}
          </p>
        </div>
        {playing && (
          <div className="play-now">
            <span className="play-now-label">Rodando</span>
            {/* O nome do arquivo manda na linha principal, e isso é regra, não
                estilo: romhack tem o cabeçalho byte a byte igual ao do jogo
                original, então o detectado só pode vir como base. Escrever
                "FireRed" em cima de um Unbound seria mentir. */}
            <strong>{currentRom}</strong>
            <span className="play-now-console">
              {emu.romId
                ? `${emu.romId.console} · base: ${emu.romId.jogo} · Geração ${romano(emu.romId.geracao)}`
                : consoleOf(currentRom)}
            </span>
          </div>
        )}
      </header>

      {emu.status.kind === "unsupported" && (
        <section className="play-diag" role="alert">
          <h2>{emu.status.reason}</h2>
          <p>{emu.status.detail}</p>
          <p className="play-diag-fix">
            Em <code>npm run dev</code> e <code>npm run preview</code> os headers
            já vão configurados no <code>vite.config.ts</code>. Se você abriu o{" "}
            <code>dist/</code> por outro servidor, ele precisa mandar os mesmos
            dois headers — veja <code>public/_headers</code>.
          </p>
        </section>
      )}

      {emu.status.kind === "error" && (
        <section className="play-diag play-diag-error" role="alert">
          <h2>Falhou</h2>
          <p>{emu.status.message}</p>
        </section>
      )}

      {emu.notice && (
        <div className="play-notice" role="status">
          {emu.notice}
          <button type="button" onClick={emu.dismissNotice} aria-label="Fechar">
            ✕
          </button>
        </div>
      )}

      <div className="play-layout">
        <main className="play-stage">
          {/* Carcaca: lente, LEDs e grelha em volta da tela. E moldura —
              nada aqui recebe foco nem cobre o canvas. */}
          <div className="play-deck" aria-hidden="true">
            <span className="play-deck-lens" />
            <span className="play-deck-leds">
              <span />
              <span />
              <span />
            </span>
            <span className="play-deck-grille" />
          </div>
          <div
            ref={screenRef}
            className={
              "play-screen" +
              (dragging ? " is-dragging" : "") +
              (display.isFullscreen ? " is-fullscreen" : "")
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {/* O canvas é criado fora do React e adotado aqui pelo hook: o
                core é amarrado a ele na criação e retido pela sessão. */}
            <div ref={emu.stageRef} className="play-canvas-host" />

            {!playing && (
              <div className="play-screen-overlay">
                {emu.status.kind === "loading" ? (
                  <p>Carregando…</p>
                ) : emu.status.kind === "ready" ? (
                  <>
                    <p className="play-overlay-title">Nenhum jogo carregado</p>
                    <p className="play-overlay-hint">
                      Arraste uma ROM aqui, escolha um arquivo ou pegue da sua
                      biblioteca ao lado.
                    </p>
                  </>
                ) : emu.status.kind === "checking" ? (
                  <p>Verificando o navegador…</p>
                ) : null}
              </div>
            )}

            {/* Em tela cheia os controles da página somem junto com ela: a
                saída precisa estar dita aqui dentro. */}
            {display.isFullscreen && (
              <p className="play-fs-hint">Esc para sair da tela cheia</p>
            )}
          </div>

          {playing && (
            <>
              <div className="play-controls">
                {emu.status.kind === "running" ? (
                  <button type="button" onClick={emu.pause}>
                    ⏸ Pausar
                  </button>
                ) : (
                  <button type="button" onClick={emu.resume}>
                    ▶ Continuar
                  </button>
                )}
                {/* Segurar, não alternar: rebobinar é correção de curso —
                    você volta olhando a tela e solta no ponto certo. */}
                <button
                  type="button"
                  className={
                    "play-rewind" + (emu.rewinding ? " is-rewinding" : "")
                  }
                  title={`Segure para voltar no tempo (até ${rewindSeconds()} s)`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    emu.setRewinding(true);
                  }}
                  onPointerUp={() => emu.setRewinding(false)}
                  onPointerLeave={() => emu.setRewinding(false)}
                  onPointerCancel={() => emu.setRewinding(false)}
                >
                  ⏪ Rebobinar
                </button>
                <button
                  type="button"
                  onClick={() => currentRom && void emu.takeScreenshot(currentRom)}
                >
                  📷 Capturar
                </button>
                <button type="button" onClick={emu.reset}>
                  ↺ Reiniciar
                </button>
                <button type="button" onClick={emu.stop}>
                  ⏹ Fechar jogo
                </button>
                <button type="button" onClick={() => void emu.sync()}>
                  💾 Sincronizar
                </button>
                {display.fullscreenSupported && (
                  <button
                    type="button"
                    onClick={() => void display.toggleFullscreen()}
                  >
                    {display.isFullscreen ? "⤡ Sair da tela cheia" : "⛶ Tela cheia"}
                  </button>
                )}

                <div
                  className="play-scale"
                  role="group"
                  aria-label="Escala da tela"
                >
                  <span className="play-scale-label">Escala</span>
                  {SCALE_MODES.map((mode) => (
                    <button
                      key={String(mode.id)}
                      type="button"
                      className={
                        "play-scale-btn" +
                        (display.scaleMode === mode.id ? " is-active" : "")
                      }
                      aria-pressed={display.scaleMode === mode.id}
                      title={mode.title}
                      onClick={() => display.setScaleMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                  {display.scaleLabel && (
                    <span className="play-scale-now">{display.scaleLabel}</span>
                  )}
                </div>

                <label className="play-slider">
                  Volume
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={emu.volume}
                    onChange={(e) => emu.setVolume(Number(e.target.value))}
                  />
                  <span>{emu.volume}%</span>
                </label>

                <label className="play-slider">
                  Velocidade
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={emu.fastForward}
                    onChange={(e) => emu.setFastForward(Number(e.target.value))}
                  />
                  <span>
                    {emu.turboActive ? `${emu.fastForward}× → turbo` : `${emu.fastForward}×`}
                  </span>
                </label>
              </div>

              {/* Gamepad virtual: sem ele o jogo é injogável no toque. */}
              <div className="play-gamepad" aria-label="Controle virtual">
                {TOUCH_BUTTONS.map((b) => (
                  <button
                    key={b.button}
                    type="button"
                    className={"play-pad play-pad-" + b.area}
                    aria-label={b.button}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      emu.pressButton(b.button);
                    }}
                    onPointerUp={() => emu.releaseButton(b.button)}
                    onPointerLeave={() => emu.releaseButton(b.button)}
                    onPointerCancel={() => emu.releaseButton(b.button)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </main>

        <aside className="play-sidebar">
          <section className="play-panel">
            <h2>Carregar</h2>
            <button
              type="button"
              className="play-primary"
              onClick={() => romInputRef.current?.click()}
              disabled={emu.status.kind === "unsupported"}
            >
              Escolher arquivo…
            </button>
            <input
              ref={romInputRef}
              type="file"
              accept=".gb,.gbc,.gba"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void emu.playFile(file);
                e.target.value = "";
              }}
            />
            <p className="play-panel-hint">
              O arquivo fica guardado no navegador — na próxima visita ele
              aparece em “Na sua biblioteca”.
            </p>
          </section>

          <section className="play-panel">
            <div className="play-panel-head">
              <h2>Pasta roms/</h2>
              {/* Reler não faz sentido onde a pasta não existe (produção). */}
              {emu.localRoms !== null && (
                <button
                  type="button"
                  className="play-refresh"
                  onClick={() => void emu.refreshLocalRoms()}
                  title="Reler a pasta roms/"
                >
                  ↻ atualizar
                </button>
              )}
            </div>
            {emu.localRoms === null ? (
              <p className="play-empty-folder">
                Disponível só rodando o projeto localmente. Aqui, use{" "}
                <strong>Escolher arquivo…</strong> — a ROM fica guardada neste
                navegador e reaparece em “Na sua biblioteca” nas próximas
                visitas.
              </p>
            ) : emu.localRoms.length > 0 ? (
              <ul className="play-rom-list">
                {emu.localRoms.map((rom) => (
                  <li key={rom.fileName}>
                    <button
                      type="button"
                      className={rom.fileName === currentRom ? "is-current" : ""}
                      onClick={() => void emu.playLocal(rom.fileName)}
                    >
                      <span className="play-rom-name">{rom.fileName}</span>
                      <span className="play-rom-meta">
                        {consoleOf(rom.fileName)} · {formatBytes(rom.size)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="play-empty-folder">
                Vazia. Largue seus <code>.gb</code>, <code>.gbc</code> ou{" "}
                <code>.gba</code> em <code>roms/</code> na raiz do projeto — em
                subpastas também — e eles aparecem aqui, prontos para um clique.
              </p>
            )}
            <p className="play-panel-hint">
              Fora do git e fora do build: os arquivos ficam só na sua máquina.
            </p>
          </section>

          {emu.roms.length > 0 && (
            <section className="play-panel">
              <h2>Na sua biblioteca</h2>
              <ul className="play-rom-list">
                {emu.roms.map((rom) => (
                  <li key={rom.fileName} className="play-rom-row">
                    <button
                      type="button"
                      className={rom.fileName === currentRom ? "is-current" : ""}
                      onClick={() => emu.playStored(rom.fileName)}
                    >
                      <span className="play-rom-name">{rom.fileName}</span>
                      <span className="play-rom-meta">
                        {consoleOf(rom.fileName)}
                        {rom.base && ` · base: ${rom.base}`}
                        {rom.size !== undefined && ` · ${formatBytes(rom.size)}`}
                      </span>
                    </button>
                    {/* Dois passos em vez de um confirm() do navegador: são
                        dezenas de MB que não voltam, e um diálogo modal para
                        isso é pesado demais. */}
                    {removing === rom.fileName ? (
                      <span className="play-rom-confirm">
                        <button
                          type="button"
                          className="play-rom-confirm-yes"
                          onClick={() => {
                            void emu.deleteRom(rom.fileName);
                            setRemoving(null);
                          }}
                        >
                          remover
                        </button>
                        <button type="button" onClick={() => setRemoving(null)}>
                          cancelar
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="play-rom-remove"
                        title={`Remover ${rom.fileName} da biblioteca`}
                        aria-label={`Remover ${rom.fileName} da biblioteca`}
                        onClick={() => setRemoving(rom.fileName)}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <p className="play-panel-hint">
                Remover libera espaço no navegador e <strong>mantém o save</strong>
                : se a mesma ROM voltar, o progresso volta com ela.
              </p>
            </section>
          )}

          <section className="play-panel">
            <h2>Save states</h2>

            {/* O core vinha capturando um estado a cada 30 s e nunca o
                oferecia. Aqui ele vira o caminho de volta ao jogo. */}
            <div className="play-auto-state">
              <button
                type="button"
                className="play-primary play-resume"
                disabled={!playing || !emu.autoState}
                onClick={emu.loadAutoState}
              >
                ⏱ Continuar de onde parou
              </button>
              <p className="play-panel-hint">
                {!playing
                  ? "Carregue um jogo para ver o ponto automático."
                  : emu.autoState
                    ? `Ponto automático de ${formatBytes(emu.autoState.size)}, atualizado a cada 30 s.`
                    : "Nenhum ponto automático ainda — o primeiro sai em até 30 s."}
                {playing && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="play-linkish"
                      onClick={() => void emu.captureAutoState()}
                    >
                      capturar agora
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="play-slots">
              {emu.slots.map((info) => (
                <div
                  key={info.slot}
                  className={"play-slot" + (info.exists ? " is-filled" : "")}
                >
                  <span className="play-slot-num">{info.slot}</span>
                  {info.thumbnail ? (
                    <img
                      className="play-slot-thumb"
                      src={info.thumbnail}
                      alt={`Tela gravada no slot ${info.slot}`}
                    />
                  ) : (
                    <span className="play-slot-thumb is-empty" aria-hidden="true" />
                  )}
                  <span className="play-slot-state">
                    {info.exists ? describeAge(info.modified, now) : "vazio"}
                  </span>
                  <button
                    type="button"
                    disabled={!playing}
                    onClick={() => void emu.saveState(info.slot)}
                    title={
                      info.exists
                        ? `Sobrescrever o slot ${info.slot}`
                        : `Gravar no slot ${info.slot}`
                    }
                  >
                    {info.exists ? "regravar" : "gravar"}
                  </button>
                  <button
                    type="button"
                    disabled={!playing || !info.exists}
                    onClick={() => emu.loadState(info.slot)}
                    title={
                      info.exists
                        ? `Carregar do slot ${info.slot}`
                        : `Slot ${info.slot} está vazio`
                    }
                  >
                    carregar
                  </button>
                  <button
                    type="button"
                    className="play-slot-clear"
                    disabled={!playing || !info.exists}
                    onClick={() => void emu.clearState(info.slot)}
                    title={`Apagar o slot ${info.slot}`}
                    aria-label={`Apagar o slot ${info.slot}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="play-panel-hint">
              Os estados são por jogo: os seis slots acima são
              {playing ? ` de ${currentRom}` : " do jogo que estiver carregado"}.
            </p>
          </section>

          <section className="play-panel">
            <h2>Saves</h2>
            <div className="play-save-actions">
              <button
                type="button"
                disabled={!playing}
                onClick={() => currentRom && emu.exportSave(currentRom)}
              >
                Exportar .sav
              </button>
              <button
                type="button"
                onClick={() => saveInputRef.current?.click()}
                disabled={emu.status.kind === "unsupported"}
              >
                Importar…
              </button>
              <input
                ref={saveInputRef}
                type="file"
                accept=".sav,.ss1,.ss2,.ss3,.ss4,.ss5,.ss6"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void emu.importSave(file);
                  e.target.value = "";
                }}
              />
            </div>
            {emu.saves.length > 0 && (
              <ul className="play-save-list">
                {emu.saves.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            <p className="play-panel-hint">
              Saves e estados ficam no IndexedDB deste navegador. Exporte se
              quiser levar para outra máquina.
            </p>
          </section>

          <section className="play-panel">
            <h2>Onde ficam seus saves</h2>
            <ul className="play-storage">
              <li>
                <span
                  className={
                    "play-dot " +
                    (emu.localSaves !== null ? "is-good" : "is-warn")
                  }
                  aria-hidden="true"
                />
                <div>
                  <strong>Pasta {"saves/"} no disco</strong>
                  <p>
                    {emu.localSaves !== null
                      ? "Backup automático a cada gravação do jogo. Esta é a cópia que não depende do navegador."
                      : "Indisponível — só existe em dev e preview. Aqui vale só o IndexedDB; exporte o .sav para ter cópia."}
                  </p>
                </div>
              </li>
              <li>
                <span
                  className={
                    "play-dot " +
                    (emu.storage?.persistent ? "is-good" : "is-warn")
                  }
                  aria-hidden="true"
                />
                <div>
                  <strong>
                    IndexedDB do navegador
                    {emu.storage
                      ? emu.storage.persistent
                        ? " · persistente"
                        : " · descartável"
                      : ""}
                  </strong>
                  <p>
                    {emu.storage?.persistent
                      ? "O navegador prometeu não descartar."
                      : "Sobrevive a recarregar e a fechar o navegador, mas pode ser descartado sob pressão de disco, e “limpar dados do site” apaga."}
                    {emu.storage?.usageBytes !== undefined && (
                      <>
                        {" "}
                        Em uso: {formatBytes(emu.storage.usageBytes)} de{" "}
                        {formatBytes(emu.storage.quotaBytes)}.
                      </>
                    )}
                  </p>
                </div>
              </li>
            </ul>

            {emu.localSaves !== null && (
              <>
                <button
                  type="button"
                  className="play-backup-btn"
                  disabled={!playing}
                  onClick={() =>
                    currentRom && void emu.backupToDisk(currentRom, { force: true })
                  }
                >
                  Copiar para {"saves/"} agora
                </button>
                {emu.localSaves.length > 0 && (
                  <ul className="play-disk-saves">
                    {emu.localSaves.map((s) => (
                      <li key={s.fileName}>
                        <span className="play-disk-name">{s.fileName}</span>
                        <span className="play-disk-meta">
                          {formatBytes(s.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void emu.restoreFromDisk(s.fileName)}
                          title={`Restaurar ${s.fileName} para o emulador`}
                        >
                          restaurar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="play-panel">
            <h2>Áudio e vídeo</h2>
            <div className="play-av">
              {AV_TOGGLES.map((t) => (
                <label key={t.id} className="play-av-row" title={t.hint}>
                  <input
                    type="checkbox"
                    checked={emu.av[t.id]}
                    onChange={(e) => emu.setAv({ [t.id]: e.target.checked })}
                  />
                  <span>
                    <strong>{t.label}</strong>
                    <em>{t.hint}</em>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="play-panel">
            <div className="play-panel-head">
              <h2>Log do core</h2>
              {emu.log.length > 0 && (
                <button
                  type="button"
                  className="play-refresh"
                  onClick={emu.clearLog}
                  title="Limpar o log"
                >
                  limpar
                </button>
              )}
            </div>
            {emu.log.length === 0 ? (
              <p className="play-panel-hint">
                Nada registrado ainda. O core escreve aqui quando encontra algo
                fora do comum — é o primeiro lugar a olhar se um jogo se
                comportar mal.
              </p>
            ) : (
              <ol className="play-log">
                {emu.log.map((line, i) => (
                  <li
                    key={`${i}-${line.message}`}
                    className={isProblem(line.level) ? "is-problem" : ""}
                  >
                    {formatLogLine(line)}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="play-panel">
            <div className="play-panel-head">
              <h2>Teclas</h2>
              <button
                type="button"
                className="play-refresh"
                onClick={emu.resetKeyBindings}
                title="Voltar ao mapa padrão"
              >
                ↺ padrão
              </button>
            </div>
            <dl className="play-keys">
              {GROUPS.map((group) => (
                <div key={group} className="play-key-group">
                  <dt>{GROUP_LABELS[group]}</dt>
                  <dd>
                    {emu.bindings
                      .filter((b) => b.group === group)
                      .map((b) => (
                        <button
                          key={b.button}
                          type="button"
                          className={
                            "play-key" +
                            (capturing === b.button ? " is-capturing" : "")
                          }
                          onClick={() =>
                            setCapturing(
                              capturing === b.button ? null : b.button
                            )
                          }
                          title={`Clique e pressione a tecla nova para ${b.button}`}
                        >
                          <kbd>{capturing === b.button ? "…" : b.label}</kbd>
                          {b.button}
                        </button>
                      ))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="play-panel-hint">
              {capturing
                ? `Pressione a tecla para ${capturing} — Esc cancela.`
                : "Clique numa tecla para trocá-la. Se a nova já pertencer a outra ação, as duas trocam."}
            </p>
            <p className="play-panel-hint">
              {gamepadName
                ? `🎮 ${gamepadName}`
                : "Nenhum controle detectado — conecte um e aperte um botão."}
            </p>

            {/* Atalhos ficam fora da lista remapeável: não são ações do
                console, e remapeá-los é outra conversa. */}
            <dl className="play-keys play-shortcuts">
              <div className="play-key-group">
                <dt>Atalhos</dt>
                <dd>
                  {SHORTCUT_HELP.map((s) => (
                    <span key={s.keys} className="play-shortcut">
                      <kbd>{s.keys}</kbd>
                      {s.what}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PlayPage;
