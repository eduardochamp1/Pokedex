import { useState } from "react";
import { Link } from "react-router-dom";
import { TIMELINE_GAMES } from "../data/gameTimeline";
import { REGIONS } from "../data/regions";
import { versionGroupOf } from "../data/versions";
import { byYear, filterGames, type TimelineFilter } from "../lib/gameTimeline";
import { isPlayable } from "../emulator/playable";
import { useTrainerEntry } from "../lib/trainerLog";
import { saveVersion } from "../lib/gen3Game";
import { generationLabel } from "../i18n/common";
import { useLang, tr } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/games.css";

const COM_MAPA = new Set(REGIONS.map((r) => r.id));
const nomeDaRegiao = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? id.charAt(0).toUpperCase() + id.slice(1);

/**
 * Os jogos principais de 1996 até hoje, por ano, cada um ligado à região no
 * mapa, à lore das gerações e — quando o emulador roda — a `/jogar`.
 */
const GamesPage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [f, setF] = useState<TimelineFilter>({ playableOnly: false, remakes: "all", generation: "all" });
  const entry = useTrainerEntry();
  const grupoDoSave = entry ? versionGroupOf(saveVersion(entry.game ?? "emerald", entry.rom)) : undefined;
  const anos = byYear(filterGames(TIMELINE_GAMES, f));
  const geracoes = [...new Set(TIMELINE_GAMES.map((g) => g.generation))];

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Jogos", "Games")}</h1>
        <span className="trainer-de">
          1996 → {new Date().getFullYear()}
        </span>
      </header>

      <div className="jogos-filtros">
        <label>
          {t("Geração", "Generation")}{" "}
          <select
            value={String(f.generation)}
            onChange={(e) => setF({ ...f, generation: e.target.value === "all" ? "all" : Number(e.target.value) })}
          >
            <option value="all">{t("Todas", "All")}</option>
            {geracoes.map((g) => (
              <option key={g} value={g}>
                {generationLabel(g, lang)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Remakes", "Remakes")}{" "}
          <select value={f.remakes} onChange={(e) => setF({ ...f, remakes: e.target.value as TimelineFilter["remakes"] })}>
            <option value="all">{t("Com", "Include")}</option>
            <option value="none">{t("Sem", "Exclude")}</option>
            <option value="only">{t("Só remakes", "Remakes only")}</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={f.playableOnly} onChange={(e) => setF({ ...f, playableOnly: e.target.checked })} />{" "}
          {t("Só os que rodam em Jogar", "Only those that run in Play")}
        </label>
      </div>

      {anos.length === 0 ? (
        <p className="trainer-vazio">{t("Nenhum jogo com esse filtro.", "No game matches this filter.")}</p>
      ) : (
        <ol className="jogos-linha">
          {anos.map(({ year, games }) => (
            <li key={year} className="jogos-ano">
              <h2 className="jogos-ano-numero">{year}</h2>
              <ul className="jogos-cartoes">
                {games.map((g) => {
                  const jogavel = isPlayable(g.versionGroup);
                  return (
                    <li key={g.versionGroup} className={`jogos-cartao${g.versionGroup === grupoDoSave ? " jogos-seu" : ""}`}>
                      <div className="jogos-titulo">
                        <strong>Pokémon {g.title}</strong>
                        {g.remake && <span className="jogos-tag">remake</span>}
                        {g.versionGroup === grupoDoSave && <span className="jogos-tag jogos-tag-seu">{t("seu save", "your save")}</span>}
                      </div>
                      <p className="trainer-sub">
                        {g.platform} · {generationLabel(g.generation, lang)} · {nomeDaRegiao(g.region)}
                      </p>
                      {g.note && <p className="jogos-nota">{lang === "en" ? g.note[1] : g.note[0]}</p>}
                      <p className="jogos-links">
                        {COM_MAPA.has(g.region) && (
                          <Link to={`/mapa?region=${g.region}`}>{t("região no mapa", "region on the map")}</Link>
                        )}
                        <Link to="/lore?aba=generations">{t("a geração na lore", "the generation in the lore")}</Link>
                        {jogavel && (
                          <Link to={`/jogar?jogo=${g.versionGroup}`} className="jogos-jogar">
                            ▶ {t("jogar", "play")}
                          </Link>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
      <p className="trainer-sub">
        {t(
          "O ano é o do lançamento no Japão. \"Jogar\" abre o emulador com a ROM desse jogo destacada, se ela estiver na sua biblioteca — o site não distribui ROMs.",
          "The year is the Japanese release. \"Play\" opens the emulator with that game's ROM highlighted, if it's in your library — the site doesn't distribute ROMs."
        )}
      </p>
    </div>
  );
};

export default GamesPage;
