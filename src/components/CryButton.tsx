import { useRef, useState } from "react";

interface Props {
  /** URL do .ogg vindo de pokemon.cries.latest. */
  src: string | null | undefined;
  name: string;
}

/**
 * Toca o cry do pokemon.
 *
 * A URL e cross-origin (raw.githubusercontent). A pagina roda cross-origin
 * isolated (COEP require-corp), entao o crossOrigin="anonymous" e obrigatorio
 * — sem ele o audio e bloqueado sem erro visivel.
 */
const CryButton = ({ src, name }: Props) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <>
      <button
        type="button"
        className="cry-button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          el.currentTime = 0;
          void el.play().catch(() => setFailed(true));
        }}
        aria-label={`Ouvir o som de ${name}`}
        title={`Ouvir o som de ${name}`}
      >
        🔊
      </button>
      <audio
        ref={ref}
        src={src}
        crossOrigin="anonymous"
        preload="none"
        onError={() => setFailed(true)}
      />
    </>
  );
};

export default CryButton;
