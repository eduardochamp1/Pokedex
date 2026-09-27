import { useState } from "react";
import { applyScanline, readScanline } from "../lib/scanline";
import { useT } from "../i18n/lang";

/**
 * Liga e desliga a scanline. Fica na navbar porque e a unica barra presente
 * em toda rota — o site nao tem rodape.
 */
const ScanlineToggle = () => {
  const [on, setOn] = useState(readScanline);
  const t = useT();
  const rotulo = on ? t("Desligar a scanline", "Turn scanlines off") : t("Ligar a scanline", "Turn scanlines on");

  return (
    <button
      type="button"
      className={"scanline-toggle" + (on ? " is-on" : "")}
      aria-pressed={on}
      title={rotulo}
      aria-label={rotulo}
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
