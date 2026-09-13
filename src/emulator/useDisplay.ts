import { useCallback, useEffect, useState, type RefObject } from "react";
import {
  canvasSizeFor,
  describeScale,
  nativeSizeOf,
  type ScaleMode,
  type Size,
} from "./display";
import { loadPref, savePref } from "./prefs";

const SCALE_PREF = "scale-mode";

function isScaleMode(value: unknown): value is ScaleMode {
  return (
    value === "auto" ||
    value === "integer" ||
    value === "fit" ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4
  );
}

/**
 * Dimensiona o canvas do emulador e controla a tela cheia.
 *
 * O canvas vive fora do React (e singleton da sessao, amarrado ao core), entao
 * o tamanho e aplicado por estilo direto em vez de props. O ResizeObserver e o
 * que mantem a escala correta quando a janela muda, quando a sidebar some em
 * tela cheia e quando o jogo troca de console — o core reajusta a resolucao do
 * canvas ao carregar uma ROM de GB/GBC (160x144) depois de uma de GBA.
 */
export function useDisplay(
  stageRef: RefObject<HTMLElement | null>,
  canvas: HTMLCanvasElement | null,
  /** Como avisar quem joga quando algo nao pode ser feito. */
  onNotice?: (message: string) => void
) {
  const [scaleMode, setScaleModeState] = useState<ScaleMode>(
    () => loadPref(SCALE_PREF, isScaleMode) ?? "auto"
  );
  const [applied, setApplied] = useState<{ size: Size; native: Size } | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setScaleMode = useCallback((mode: ScaleMode) => {
    setScaleModeState(mode);
    savePref(SCALE_PREF, mode);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !canvas) return;

    const apply = () => {
      const native = nativeSizeOf(canvas);
      const box = stage.getBoundingClientRect();
      // Antes do primeiro layout a caixa vem zerada; nao vale escrever 0 no
      // canvas, que deixaria a tela sumir ate o proximo evento.
      if (box.width <= 0 || box.height <= 0) return;
      const size = canvasSizeFor(scaleMode, box, native);
      canvas.style.width = `${size.width}px`;
      canvas.style.height = `${size.height}px`;
      setApplied({ size, native });
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(stage);

    // A resolucao nativa muda quando o core carrega uma ROM de outro console.
    // Nao ha evento para isso, entao conferimos junto com o resto do layout.
    const canvasObserver = new ResizeObserver(apply);
    canvasObserver.observe(canvas);

    return () => {
      observer.disconnect();
      canvasObserver.disconnect();
    };
  }, [stageRef, canvas, scaleMode]);

  // A tela cheia tambem sai por Esc e pelo F11 do navegador: o estado tem que
  // vir do evento, nunca do nosso proprio clique.
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch (error) {
      // O navegador pode negar — iOS Safari não tem tela cheia de elemento, e
      // uma página embutida sem `allow="fullscreen"` também recusa. Um clique
      // que não faz nada e não explica nada é pior que a falta do recurso:
      // aqui a negativa aparece, com o motivo que o navegador deu.
      onNotice?.(
        `O navegador não permitiu a tela cheia (${
          error instanceof Error ? error.message : String(error)
        }). Use a escala fixa, ou o F11 do navegador.`
      );
    }
  }, [stageRef, onNotice]);

  return {
    scaleMode,
    setScaleMode,
    isFullscreen,
    toggleFullscreen,
    fullscreenSupported:
      typeof document !== "undefined" && document.fullscreenEnabled,
    /** "3× · 720×480" do que esta valendo, ou undefined antes do primeiro layout. */
    scaleLabel: applied ? describeScale(applied.size, applied.native) : undefined,
  };
}
