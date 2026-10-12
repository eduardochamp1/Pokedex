import { useEffect, useState } from "react";
import { isMusicPlaying, pauseForHiddenTab, readMusic, startMusic, stopMusic } from "../lib/ambientMusic";
import { useT } from "../i18n/lang";

/**
 * Liga e muta o som do aparelho: a trilha ambiente e os bipes das transições
 * (`lib/sfx.ts`). A trilha vem ligada, mas o navegador só
 * deixa tocar depois de um gesto: o primeiro clique ou tecla em qualquer
 * lugar da página é quem dá a partida.
 */
const MusicToggle = () => {
  const [on, setOn] = useState(readMusic);
  const t = useT();
  const rotulo = on ? t("Mutar o som", "Mute the sound") : t("Ligar o som", "Turn the sound on");

  useEffect(() => {
    if (!on || isMusicPlaying()) return;
    const partida = () => startMusic();
    window.addEventListener("pointerdown", partida, { once: true });
    window.addEventListener("keydown", partida, { once: true });
    return () => {
      window.removeEventListener("pointerdown", partida);
      window.removeEventListener("keydown", partida);
    };
  }, [on]);

  useEffect(() => {
    const aoMudar = () => pauseForHiddenTab(document.hidden);
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);

  return (
    <button
      type="button"
      className={"music-toggle" + (on ? " is-on" : "")}
      aria-pressed={on}
      title={rotulo}
      aria-label={rotulo}
      onClick={() => {
        const next = !on;
        setOn(next);
        if (next) startMusic();
        else stopMusic();
      }}
    >
      <span aria-hidden="true">♪</span>
    </button>
  );
};

export default MusicToggle;
