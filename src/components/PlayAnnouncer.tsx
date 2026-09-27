import { useEffect, useRef, useState } from "react";
import type { EmulatorStatus } from "../emulator/types";
import { statusAnnouncement } from "../emulator/announce";
import { useLang } from "../i18n/lang";

interface Props {
  status: EmulatorStatus;
  notice: string | null;
}

/**
 * Uma região viva que existe desde o começo, vazia, e só muda de texto.
 *
 * Região viva criada já com a mensagem dentro costuma passar em silêncio no
 * leitor de tela — é o caso do aviso de `/jogar`, que só aparece quando há
 * aviso. Aqui a região está sempre montada e recebe o estado do jogo
 * (carregou, pausou, continuou, fechou) e os avisos.
 */
const PlayAnnouncer = ({ status, notice }: Props) => {
  const lang = useLang();
  const anterior = useRef<EmulatorStatus | null>(null);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const m = statusAnnouncement(anterior.current, status, lang);
    anterior.current = status;
    if (m) setTexto(m);
  }, [status, lang]);

  useEffect(() => {
    if (notice) setTexto(notice);
  }, [notice]);

  return (
    <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {texto}
    </div>
  );
};

export default PlayAnnouncer;
