import { useRef, useState, type DragEvent } from "react";
import { useEmulator } from "../emulator/useEmulator";
import {
  GROUP_LABELS,
  KEY_BINDINGS,
  TOUCH_BUTTONS,
  type KeyBinding,
} from "../emulator/keyBindings";
import {
  SAVE_STATE_SLOTS,
  SUPPORTED_LABEL,
  consoleOf,
  type SaveStateSlot,
} from "../emulator/types";
import { formatBytes } from "../emulator/storage";

const GROUPS: KeyBinding["group"][] = [
  "direcional",
  "acao",
  "ombro",
  "sistema",
];

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} kB`;
}

const PlayPage = () => {
  const emu = useEmulator();
  const romInputRef = useRef<HTMLInputElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const currentRom =
    emu.status.kind === "running" || emu.status.kind === "paused"
      ? emu.status.rom
      : undefined;
  const playing = currentRom !== undefined;

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
            <strong>{currentRom}</strong>
            <span className="play-now-console">{consoleOf(currentRom)}</span>
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
          <div
            className={"play-screen" + (dragging ? " is-dragging" : "")}
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
                <button type="button" onClick={emu.reset}>
                  ↺ Reiniciar
                </button>
                <button type="button" onClick={emu.stop}>
                  ⏹ Fechar jogo
                </button>
                <button type="button" onClick={() => void emu.sync()}>
                  💾 Sincronizar
                </button>

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
                  <span>{emu.fastForward}×</span>
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
                        {consoleOf(rom.fileName)} · {formatSize(rom.size)}
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
                  <li key={rom.fileName}>
                    <button
                      type="button"
                      className={rom.fileName === currentRom ? "is-current" : ""}
                      onClick={() => emu.playStored(rom.fileName)}
                    >
                      <span className="play-rom-name">{rom.fileName}</span>
                      <span className="play-rom-meta">
                        {consoleOf(rom.fileName)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="play-panel">
            <h2>Save states</h2>
            <div className="play-slots">
              {SAVE_STATE_SLOTS.map((slot) => (
                <div key={slot} className="play-slot">
                  <span className="play-slot-num">{slot}</span>
                  <button
                    type="button"
                    disabled={!playing}
                    onClick={() => void emu.saveState(slot as SaveStateSlot)}
                    title={`Gravar no slot ${slot}`}
                  >
                    gravar
                  </button>
                  <button
                    type="button"
                    disabled={!playing}
                    onClick={() => emu.loadState(slot as SaveStateSlot)}
                    title={`Carregar do slot ${slot}`}
                  >
                    carregar
                  </button>
                </div>
              ))}
            </div>
            <p className="play-panel-hint">
              O core também tira um estado automático a cada 30 s.
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
            <h2>Teclas</h2>
            <dl className="play-keys">
              {GROUPS.map((group) => (
                <div key={group} className="play-key-group">
                  <dt>{GROUP_LABELS[group]}</dt>
                  <dd>
                    {KEY_BINDINGS.filter((b) => b.group === group).map((b) => (
                      <span key={b.sdlKey} className="play-key">
                        <kbd>{b.label}</kbd>
                        {b.button}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PlayPage;
