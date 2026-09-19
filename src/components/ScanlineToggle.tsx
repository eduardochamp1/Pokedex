import { useState } from "react";
import { applyScanline, readScanline } from "../lib/scanline";

/**
 * Liga e desliga a scanline. Fica na navbar porque e a unica barra presente
 * em toda rota — o site nao tem rodape.
 */
const ScanlineToggle = () => {
  const [on, setOn] = useState(readScanline);

  return (
    <button
      type="button"
      className={"scanline-toggle" + (on ? " is-on" : "")}
      aria-pressed={on}
      title={on ? "Desligar a scanline" : "Ligar a scanline"}
      aria-label={on ? "Desligar a scanline" : "Ligar a scanline"}
      onClick={() => {
        const next = !on;
        setOn(next);
        applyScanline(next);
      }}
    >
      <span className="scanline-toggle-glyph" aria-hidden="true" />
    </button>
  );
};

export default ScanlineToggle;
