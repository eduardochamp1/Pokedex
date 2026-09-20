import { useLocation } from "react-router-dom";
import { getLoadedRom } from "./core";

/**
 * O jogo que está carregado e pausado agora, visto de fora de `/jogar`.
 *
 * Sair da aba pausa o jogo — a limpeza do efeito de inicialização faz
 * `pauseGame()` e `pauseAudio()` e guarda se ele estava rodando, para a próxima
 * montagem retomar. Mas `getLoadedRom()` era lido só de dentro de
 * `src/emulator/`: nenhuma tela do site sabia que havia jogo esperando.
 *
 * Relido a cada troca de rota, que é exatamente quando o estado muda. Em
 * `/jogar` devolve `null`: ali o jogo está à vista e um aviso seria ruído.
 *
 * Depois de um F5 o core morre junto com a página, então isto devolve `null`
 * até a aba ser visitada de novo — o que é honesto, porque nesse momento não há
 * nada pausado. Quem cuida do "você parou num jogo" entre sessões é
 * `getLastRom()`, no localStorage.
 */
export function usePausedGame(): string | null {
  const { pathname } = useLocation();
  if (pathname === "/jogar") return null;
  return getLoadedRom();
}
