import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/play.css";
import { useEmulator } from "../emulator/useEmulator";
import {
  GROUP_LABELS,
  GROUP_LABELS_EN,
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
import {
  SUPPORTED_LABEL,
  SUPPORTED_LABEL_EN,
  consoleOf,
  type SaveStateSlot,
} from "../emulator/types";
import { GAME_GENERATIONS } from "../data/generations";
import { REGIONS } from "../data/regions";
import { describeAge } from "../emulator/saveStates";
import { SCALE_MODES } from "../emulator/display";
import { rewindSeconds } from "../emulator/capture";
import { useDisplay } from "../emulator/useDisplay";
import { formatBytes } from "../emulator/storage";
import ScreenshotThumb from "../components/ScreenshotThumb";
import PlayTeam from "../components/PlayTeam";
import { localeOf, useLang, tr } from "../i18n/lang";
import { generationLabel } from "../i18n/common";

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

/**
 * Como anunciar o turbo.
 *
 * O atalho e a barra de espaco, mas ele so existe se a barra de espaco nao
 * estiver mapeada para um botao do jogo — senao a tecla teria dois donos.
 * Ver `shortcutFor` em shortcuts.ts.
 */
function teclaDoTurbo(bindings: KeyBinding[]): string {
  return bindings.some((b) => b.sdlKey === "Space")
    ? "a tecla de turbo (hoje ocupada pelo jogo)"
    : "Espaço";
}

/** Nome da regiao como o resto do site a escreve. */
function nomeDaRegiao(id: string): string {
  return REGIONS.find((r) => r.id === id)?.name ?? id;
}

const PlayPage = () => {
  const emu = useEmulator();
  const lang = useLang();
  const en = lang === "en";
  // `t` já é usado nos laços desta página; a tradução se chama `tx`.
  const tx = (pt: string, enText: string) => tr(lang, pt, enText);
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

  /**
   * `?jogo=<versionGroupId>` — de onde a ficha e a lore apontam para ca.
   *
   * Destaca a ROM correspondente na biblioteca, se ela existir. Se nao existir,
   * fica calado de proposito: o site nao distribui ROM e nao pode prometer um
   * jogo que quem chegou aqui talvez nao tenha.
   */
  const [searchParams] = useSearchParams();
  const jogoPedido = searchParams.get("jogo") ?? undefined;
  const romPedida = jogoPedido
    ? emu.roms.find((r) => r.versionGroupId === jogoPedido)?.fileName
    : undefined;

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
   * Põe o foco no palco do emulador.
   *
   * O turbo não depende mais disto — `isTypingTarget` deixou de descartar
   * teclas vindas de botões —, mas devolver o teclado ao jogo depois de
   * acionar um controle continua sendo o comportamento certo.
   */
  const focarPalco = useCallback(() => {
    emu.stageRef.current?.focus({ preventScroll: true });
  }, [emu.stageRef]);

  /** Assim que o jogo passa a rodar, o teclado é dele. */
  useEffect(() => {
    if (playing && !capturing) focarPalco();
  }, [playing, capturing, focarPalco]);

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

    // Fase de **captura**, e na janela: assim estes dois rodam antes de
    // qualquer outro ouvinte da página. O core registra os próprios handlers
    // de teclado (é como o SDL entrega as teclas ao jogo) e, na fase de
    // borbulhamento, bastaria um deles parar a propagação para o Espaço nunca
    // chegar aqui — sem deixar rastro nenhum de que sumiu. Na captura isso não
    // pode acontecer. Só o `preventDefault` atravessa, e é o que queremos: ele
    // impede que o Espaço acione um botão focado.
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
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
          <h1>{tx("Jogar", "Play")}</h1>
          <p className="play-sub">
            {en
              ? `${SUPPORTED_LABEL_EN} emulator running in the browser.`
              : `Emulador ${SUPPORTED_LABEL} rodando no navegador.`}
            {emu.version && <span className="play-core"> {emu.version}</span>}
          </p>
        </div>
        {playing && (
          <div className="play-now">
            <span className="play-now-label">{tx("Rodando", "Running")}</span>
            {/* O nome do arquivo manda na linha principal, e isso é regra, não
                estilo: romhack tem o cabeçalho byte a byte igual ao do jogo
                original, então o detectado só pode vir como base. Escrever
                "FireRed" em cima de um Unbound seria mentir. */}
            <strong>{currentRom}</strong>
            <span className="play-now-console">
              {emu.romId
                ? `${emu.romId.console} · base: ${emu.romId.jogo} · ${generationLabel(emu.romId.geracao, lang)}`
                : consoleOf(currentRom)}
            </span>
            {/* A aba era uma ilha: 870 linhas sem um único Link, e só três
                arquivos do site inteiro citavam /jogar. Estas três páginas já
                existiam — faltava o vão do meio. */}
            {emu.romId && (
              <nav className="play-now-links" aria-label={tx("Sobre este jogo", "About this game")}>
                {/* "Geração III" é fato; "a dex de Emerald" seria aproximação:
                    FireRed e LeafGreen usam a dex de Kanto mas trazem espécies
                    de Johto no pós-jogo. */}
                <Link to={`/?ger=${emu.romId.geracao}`}>
                  {en
                    ? `Generation ${romano(emu.romId.geracao)} Pokémon`
                    : `Pokémon da Geração ${romano(emu.romId.geracao)}`}
                </Link>
                <Link to={`/mapa?region=${emu.romId.regiaoId}`}>
                  {nomeDaRegiao(emu.romId.regiaoId)} {tx("no mapa", "on the map")}
                </Link>
                <Link to="/lore?aba=generations">{tx("Geração na lore", "Generation in the lore")}</Link>
              </nav>
            )}
          </div>
        )}
      </header>

      {emu.status.kind === "unsupported" && (
        <section className="play-diag" role="alert">
          <h2>{emu.status.reason}</h2>
          <p>{emu.status.detail}</p>
          <p className="play-diag-fix">
            {en ? (
              <>
                With <code>npm run dev</code> and <code>npm run preview</code> the headers
                are already set in <code>vite.config.ts</code>. If you opened{" "}
                <code>dist/</code> through another server, it has to send the same two
                headers — see <code>public/_headers</code>.
              </>
            ) : (
              <>
                Em <code>npm run dev</code> e <code>npm run preview</code> os headers
                já vão configurados no <code>vite.config.ts</code>. Se você abriu o{" "}
                <code>dist/</code> por outro servidor, ele precisa mandar os mesmos
                dois headers — veja <code>public/_headers</code>.
              </>
            )}
          </p>
        </section>
      )}

      {emu.status.kind === "error" && (
        <section className="play-diag play-diag-error" role="alert">
          <h2>{tx("Falhou", "Failed")}</h2>
          <p>{emu.status.message}</p>
        </section>
      )}

      {emu.notice && (
        <div className="play-notice" role="status">
          {emu.notice}
          <button type="button" onClick={emu.dismissNotice} aria-label={tx("Fechar", "Close")}>
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
            {/* `tabIndex={-1}`: focável por código, fora da ordem do Tab —
                o palco não é um controle. Ver `focarPalco`. */}
            <div
              ref={emu.stageRef}
              className="play-canvas-host"
              tabIndex={-1}
              onMouseDown={focarPalco}
            />

            {!playing && (
              <div className="play-screen-overlay">
                {emu.status.kind === "loading" ? (
                  <p>{tx("Carregando…", "Loading…")}</p>
                ) : emu.status.kind === "ready" ? (
                  <>
                    <p className="play-overlay-title">{tx("Nenhum jogo carregado", "No game loaded")}</p>
                    <p className="play-overlay-hint">
                      {tx(
                        "Arraste uma ROM aqui, escolha um arquivo ou pegue da sua biblioteca ao lado.",
                        "Drag a ROM here, pick a file or take one from your library on the side."
                      )}
                    </p>
                  </>
                ) : emu.status.kind === "checking" ? (
                  <p>{tx("Verificando o navegador…", "Checking the browser…")}</p>
                ) : null}
              </div>
            )}

            {/* Em tela cheia os controles da página somem junto com ela: a
                saída precisa estar dita aqui dentro. */}
            {display.isFullscreen && (
              <p className="play-fs-hint">{tx("Esc para sair da tela cheia", "Esc to exit full screen")}</p>
            )}
          </div>

          {playing && (
            <>
              {/* Depois de acionar um controle o teclado volta para o jogo. */}
              <div className="play-controls" onClick={focarPalco}>
                {emu.status.kind === "running" ? (
                  <button type="button" onClick={emu.pause}>
                    ⏸ {tx("Pausar", "Pause")}
                  </button>
                ) : (
                  <button type="button" onClick={emu.resume}>
                    ▶ {tx("Continuar", "Resume")}
                  </button>
                )}
                {/* Segurar, não alternar: rebobinar é correção de curso —
                    você volta olhando a tela e solta no ponto certo. */}
                <button
                  type="button"
                  className={
                    "play-rewind" + (emu.rewinding ? " is-rewinding" : "")
                  }
                  title={tx(
                    `Segure para voltar no tempo (até ${rewindSeconds()} s)`,
                    `Hold to go back in time (up to ${rewindSeconds()} s)`
                  )}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    emu.setRewinding(true);
                  }}
                  onPointerUp={() => emu.setRewinding(false)}
                  onPointerLeave={() => emu.setRewinding(false)}
                  onPointerCancel={() => emu.setRewinding(false)}
                >
                  ⏪ {tx("Rebobinar", "Rewind")}
                </button>
                <button
                  type="button"
                  onClick={() => currentRom && void emu.takeScreenshot(currentRom)}
                >
                  📷 {tx("Capturar", "Screenshot")}
                </button>
                <button type="button" onClick={emu.reset}>
                  ↺ {tx("Reiniciar", "Reset")}
                </button>
                <button type="button" onClick={emu.stop}>
                  ⏹ {tx("Fechar jogo", "Close game")}
                </button>
                <button type="button" onClick={() => void emu.sync()}>
                  💾 {tx("Sincronizar", "Sync")}
                </button>
                {display.fullscreenSupported && (
                  <button
                    type="button"
                    onClick={() => void display.toggleFullscreen()}
                  >
                    {display.isFullscreen
                      ? tx("⤡ Sair da tela cheia", "⤡ Exit full screen")
                      : tx("⛶ Tela cheia", "⛶ Full screen")}
                  </button>
                )}

                <div
                  className="play-scale"
                  role="group"
                  aria-label={tx("Escala da tela", "Screen scale")}
                >
                  <span className="play-scale-label">{tx("Escala", "Scale")}</span>
                  {SCALE_MODES.map((mode) => (
                    <button
                      key={String(mode.id)}
                      type="button"
                      className={
                        "play-scale-btn" +
                        (display.scaleMode === mode.id ? " is-active" : "")
                      }
                      aria-pressed={display.scaleMode === mode.id}
                      title={en ? mode.titleEn : mode.title}
                      onClick={() => display.setScaleMode(mode.id)}
                    >
                      {en ? mode.labelEn : mode.label}
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

                {/* Sem régua de velocidade, como no mGBA de mesa: lá também
                    só existem velocidade normal e o turbo enquanto a tecla
                    está segurada. A régua que havia aqui mentia — o core não
                    honra o multiplicador, medido pedindo 5× e pedindo metade,
                    e os dois davam 1×. */}
                <span
                  className={
                    "play-turbo" + (emu.turboActive ? " is-on" : "")
                  }
                  role="status"
                >
                  {emu.turboActive
                    ? "Turbo"
                    : `Velocidade normal · segure ${teclaDoTurbo(emu.bindings)} para acelerar`}
                </span>
              </div>

              {/* Gamepad virtual: sem ele o jogo é injogável no toque. */}
              <div className="play-gamepad" aria-label={tx("Controle virtual", "Virtual gamepad")}>
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
            <h2>{tx("Carregar", "Load")}</h2>
            <button
              type="button"
              className="play-primary"
              onClick={() => romInputRef.current?.click()}
              disabled={emu.status.kind === "unsupported"}
            >
              {tx("Escolher arquivo…", "Choose file…")}
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
              {tx(
                "O arquivo fica guardado no navegador — na próxima visita ele aparece em “Na sua biblioteca”.",
                "The file is kept in the browser — next visit it shows up under “In your library”."
              )}
            </p>
          </section>

          <section className="play-panel">
            <div className="play-panel-head">
              <h2>{tx("Pasta roms/", "roms/ folder")}</h2>
              {/* Reler não faz sentido onde a pasta não existe (produção). */}
              {emu.localRoms !== null && (
                <button
                  type="button"
                  className="play-refresh"
                  onClick={() => void emu.refreshLocalRoms()}
                  title={tx("Reler a pasta roms/", "Re-read the roms/ folder")}
                >
                  ↻ {tx("atualizar", "refresh")}
                </button>
              )}
            </div>
            {emu.localRoms === null ? (
              <p className="play-empty-folder">
                {en ? (
                  <>
                    Only available when running the project locally. Here, use{" "}
                    <strong>Choose file…</strong> — the ROM is kept in this browser and
                    shows up again under “In your library” on later visits.
                  </>
                ) : (
                  <>
                    Disponível só rodando o projeto localmente. Aqui, use{" "}
                    <strong>Escolher arquivo…</strong> — a ROM fica guardada neste
                    navegador e reaparece em “Na sua biblioteca” nas próximas
                    visitas.
                  </>
                )}
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
                {en ? (
                  <>
                    Empty. Drop your <code>.gb</code>, <code>.gbc</code> or{" "}
                    <code>.gba</code> files into <code>roms/</code> at the project root — in
                    subfolders too — and they show up here, one click away.
                  </>
                ) : (
                  <>
                    Vazia. Largue seus <code>.gb</code>, <code>.gbc</code> ou{" "}
                    <code>.gba</code> em <code>roms/</code> na raiz do projeto — em
                    subpastas também — e eles aparecem aqui, prontos para um clique.
                  </>
                )}
              </p>
            )}
            <p className="play-panel-hint">
              {tx(
                "Fora do git e fora do build: os arquivos ficam só na sua máquina.",
                "Outside git and outside the build: the files stay on your machine only."
              )}
            </p>
          </section>

          {emu.roms.length > 0 && (
            <section className="play-panel">
              <h2>{tx("Na sua biblioteca", "In your library")}</h2>
              <ul className="play-rom-list">
                {emu.roms.map((rom) => (
                  <li key={rom.fileName} className="play-rom-row">
                    <button
                      type="button"
                      className={
                        rom.fileName === currentRom
                          ? "is-current"
                          : rom.fileName === romPedida
                            ? "is-pedida"
                            : ""
                      }
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
                          {tx("remover", "remove")}
                        </button>
                        <button type="button" onClick={() => setRemoving(null)}>
                          {tx("cancelar", "cancel")}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="play-rom-remove"
                        title={tx(`Remover ${rom.fileName} da biblioteca`, `Remove ${rom.fileName} from the library`)}
                        aria-label={tx(`Remover ${rom.fileName} da biblioteca`, `Remove ${rom.fileName} from the library`)}
                        onClick={() => setRemoving(rom.fileName)}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <p className="play-panel-hint">
                {en ? (
                  <>
                    Removing frees space in the browser and <strong>keeps the save</strong>: if
                    the same ROM comes back, the progress comes back with it.
                  </>
                ) : (
                  <>
                    Remover libera espaço no navegador e <strong>mantém o save</strong>
                    : se a mesma ROM voltar, o progresso volta com ela.
                  </>
                )}
              </p>
            </section>
          )}

          {/* O save vira fonte de dados do site: os ids nacionais saem
              dele e entram no mesmo hook que a grade usa. */}
          <PlayTeam team={emu.team} lido={emu.teamLido} />

          {/* A captura virava download e sumia — mas o PNG ficava no FS e nada
              nunca o apagava, então a cota crescia sozinha e invisível. Aqui
              elas aparecem, dá para baixar de novo, e dá para apagar. */}
          {emu.screenshots.length > 0 && (
            <section className="play-panel">
              <h2>{tx("Capturas", "Screenshots")}</h2>
              <ul className="play-shot-list">
                {emu.screenshots.map((shot) => (
                  <li key={shot.fileName} className="play-shot-row">
                    <ScreenshotThumb
                      fileName={shot.fileName}
                      read={emu.readScreenshot}
                    />
                    <div className="play-shot-info">
                      <span className="play-shot-when">
                        {shot.when.toLocaleString(localeOf(lang))}
                      </span>
                      {shot.size !== undefined && (
                        <span className="play-shot-size">
                          {formatBytes(shot.size)}
                        </span>
                      )}
                    </div>
                    <div className="play-shot-actions">
                      <button
                        type="button"
                        onClick={() => emu.downloadScreenshot(shot.fileName)}
                        title={tx(`Baixar ${shot.fileName}`, `Download ${shot.fileName}`)}
                      >
                        {tx("baixar", "download")}
                      </button>
                      <button
                        type="button"
                        className="play-shot-del"
                        onClick={() => void emu.deleteScreenshot(shot.fileName)}
                        title={tx(`Apagar ${shot.fileName}`, `Delete ${shot.fileName}`)}
                        aria-label={tx(
                          `Apagar captura de ${shot.when.toLocaleString(localeOf(lang))}`,
                          `Delete screenshot from ${shot.when.toLocaleString(localeOf(lang))}`
                        )}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
                ⏱ {tx("Continuar de onde parou", "Continue where you left off")}
              </button>
              <p className="play-panel-hint">
                {!playing
                  ? tx("Carregue um jogo para ver o ponto automático.", "Load a game to see the auto save point.")
                  : emu.autoState
                    ? tx(
                        `Ponto automático de ${formatBytes(emu.autoState.size)}, atualizado a cada 30 s.`,
                        `Auto save point of ${formatBytes(emu.autoState.size)}, updated every 30 s.`
                      )
                    : tx(
                        "Nenhum ponto automático ainda — o primeiro sai em até 30 s.",
                        "No auto save point yet — the first one comes within 30 s."
                      )}
                {playing && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="play-linkish"
                      onClick={() => void emu.captureAutoState()}
                    >
                      {tx("capturar agora", "capture now")}
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
                      alt={tx(`Tela gravada no slot ${info.slot}`, `Screen saved in slot ${info.slot}`)}
                    />
                  ) : (
                    <span className="play-slot-thumb is-empty" aria-hidden="true" />
                  )}
                  <span className="play-slot-state">
                    {info.exists ? describeAge(info.modified, now) : tx("vazio", "empty")}
                  </span>
                  <button
                    type="button"
                    disabled={!playing}
                    onClick={() => void emu.saveState(info.slot)}
                    title={
                      info.exists
                        ? tx(`Sobrescrever o slot ${info.slot}`, `Overwrite slot ${info.slot}`)
                        : tx(`Gravar no slot ${info.slot}`, `Save to slot ${info.slot}`)
                    }
                  >
                    {info.exists ? tx("regravar", "overwrite") : tx("gravar", "save")}
                  </button>
                  <button
                    type="button"
                    disabled={!playing || !info.exists}
                    onClick={() => emu.loadState(info.slot)}
                    title={
                      info.exists
                        ? tx(`Carregar do slot ${info.slot}`, `Load from slot ${info.slot}`)
                        : tx(`Slot ${info.slot} está vazio`, `Slot ${info.slot} is empty`)
                    }
                  >
                    {tx("carregar", "load")}
                  </button>
                  <button
                    type="button"
                    className="play-slot-clear"
                    disabled={!playing || !info.exists}
                    onClick={() => void emu.clearState(info.slot)}
                    title={tx(`Apagar o slot ${info.slot}`, `Clear slot ${info.slot}`)}
                    aria-label={tx(`Apagar o slot ${info.slot}`, `Clear slot ${info.slot}`)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="play-panel-hint">
              {en
                ? `States are per game: the six slots above belong to ${playing ? currentRom : "whatever game is loaded"}.`
                : `Os estados são por jogo: os seis slots acima são${playing ? ` de ${currentRom}` : " do jogo que estiver carregado"}.`}
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
                {tx("Exportar .sav", "Export .sav")}
              </button>
              <button
                type="button"
                onClick={() => saveInputRef.current?.click()}
                disabled={emu.status.kind === "unsupported"}
              >
                {tx("Importar…", "Import…")}
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
              {tx(
                "Saves e estados ficam no IndexedDB deste navegador. Exporte se quiser levar para outra máquina.",
                "Saves and states live in this browser's IndexedDB. Export them to take them to another machine."
              )}
            </p>
          </section>

          <section className="play-panel">
            <h2>{tx("Onde ficam seus saves", "Where your saves live")}</h2>
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
                  <strong>{tx("Pasta saves/ no disco", "saves/ folder on disk")}</strong>
                  <p>
                    {emu.localSaves !== null
                      ? tx(
                          "Backup automático a cada gravação do jogo. Esta é a cópia que não depende do navegador.",
                          "Automatic backup every time the game saves. This is the copy that doesn't depend on the browser."
                        )
                      : tx(
                          "Indisponível — só existe em dev e preview. Aqui vale só o IndexedDB; exporte o .sav para ter cópia.",
                          "Unavailable — it only exists in dev and preview. Here only IndexedDB counts; export the .sav to keep a copy."
                        )}
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
                    {tx("IndexedDB do navegador", "Browser IndexedDB")}
                    {emu.storage
                      ? emu.storage.persistent
                        ? tx(" · persistente", " · persistent")
                        : tx(" · descartável", " · evictable")
                      : ""}
                  </strong>
                  <p>
                    {emu.storage?.persistent
                      ? tx("O navegador prometeu não descartar.", "The browser promised not to evict it.")
                      : tx(
                          "Sobrevive a recarregar e a fechar o navegador, mas pode ser descartado sob pressão de disco, e “limpar dados do site” apaga.",
                          "It survives reloads and closing the browser, but it can be evicted under disk pressure, and “clear site data” deletes it."
                        )}
                    {emu.storage?.usageBytes !== undefined && (
                      <>
                        {" "}
                        {tx("Em uso:", "In use:")} {formatBytes(emu.storage.usageBytes)} {tx("de", "of")}{" "}
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
                  {tx("Copiar para saves/ agora", "Copy to saves/ now")}
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
                          title={tx(`Restaurar ${s.fileName} para o emulador`, `Restore ${s.fileName} to the emulator`)}
                        >
                          {tx("restaurar", "restore")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="play-panel">
            <h2>{tx("Áudio e vídeo", "Audio and video")}</h2>
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
              <h2>{tx("Log do core", "Core log")}</h2>
              {emu.log.length > 0 && (
                <button
                  type="button"
                  className="play-refresh"
                  onClick={emu.clearLog}
                  title={tx("Limpar o log", "Clear the log")}
                >
                  {tx("limpar", "clear")}
                </button>
              )}
            </div>
            {emu.log.length === 0 ? (
              <p className="play-panel-hint">
                {tx(
                  "Nada registrado ainda. O core escreve aqui quando encontra algo fora do comum — é o primeiro lugar a olhar se um jogo se comportar mal.",
                  "Nothing logged yet. The core writes here when it runs into something unusual — the first place to look if a game misbehaves."
                )}
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
              <h2>{tx("Teclas", "Keys")}</h2>
              <button
                type="button"
                className="play-refresh"
                onClick={emu.resetKeyBindings}
                title={tx("Voltar ao mapa padrão", "Back to the default mapping")}
              >
                ↺ {tx("padrão", "default")}
              </button>
            </div>
            <dl className="play-keys">
              {GROUPS.map((group) => (
                <div key={group} className="play-key-group">
                  <dt>{en ? GROUP_LABELS_EN[group] : GROUP_LABELS[group]}</dt>
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
                          title={tx(`Clique e pressione a tecla nova para ${b.button}`, `Click and press the new key for ${b.button}`)}
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
                ? tx(`Pressione a tecla para ${capturing} — Esc cancela.`, `Press the key for ${capturing} — Esc cancels.`)
                : tx(
                    "Clique numa tecla para trocá-la. Se a nova já pertencer a outra ação, as duas trocam.",
                    "Click a key to change it. If the new one already belongs to another action, the two swap."
                  )}
            </p>
            <p className="play-panel-hint">
              {gamepadName
                ? `🎮 ${gamepadName}`
                : tx(
                    "Nenhum controle detectado — conecte um e aperte um botão.",
                    "No gamepad detected — connect one and press a button."
                  )}
            </p>

            {/* Atalhos ficam fora da lista remapeável: não são ações do
                console, e remapeá-los é outra conversa. */}
            <dl className="play-keys play-shortcuts">
              <div className="play-key-group">
                <dt>{tx("Atalhos", "Shortcuts")}</dt>
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
