import { achievementsOf } from "../lib/achievements";
import type { TrainerEntry } from "../lib/trainerLog";
import { localeOf, useLang, tr } from "../i18n/lang";
import "../styles/achievements.css";

/** As conquistas da ficha: feitas primeiro, e o quanto falta nas outras. */
const Achievements = ({ entry }: { entry: TrainerEntry }) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const todas = achievementsOf(entry);
  const feitas = todas.filter((a) => a.done).length;
  const ordem = [...todas.filter((a) => a.done), ...todas.filter((a) => !a.done)];
  const numero = (n: number) => n.toLocaleString(localeOf(lang));

  return (
    <section aria-labelledby="conquistas-titulo">
      <h2 id="conquistas-titulo">
        {t("Conquistas", "Achievements")}{" "}
        <span className="trainer-de">
          {feitas} / {todas.length}
        </span>
      </h2>
      <ul className="conquistas">
        {ordem.map((a) => (
          <li key={a.id} className={a.done ? "conquista feita" : "conquista"}>
            <span className="conquista-marca" aria-hidden="true">
              {a.done ? "★" : "☆"}
            </span>
            <span className="conquista-texto">
              <strong>{lang === "en" ? a.title.en : a.title.pt}</strong>
              <span className="trainer-sub">{lang === "en" ? a.description.en : a.description.pt}</span>
              {!a.done && a.need > 1 && (
                <span className="conquista-progresso">
                  <progress max={a.need} value={a.have} aria-hidden="true" />
                  <span>
                    {numero(a.have)} / {numero(a.need)}
                  </span>
                </span>
              )}
            </span>
            <span className="visually-hidden">{a.done ? t("feita", "done") : t("pendente", "pending")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Achievements;
