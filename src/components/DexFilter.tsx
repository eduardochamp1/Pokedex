import { GENERATIONS, REGIONAL_DEXES } from "../hooks/usePokemon";
import { useLang, tr } from "../i18n/lang";

interface Props {
  generation: number | undefined;
  pokedex: string | undefined;
  onChange: (next: { generation?: number; pokedex?: string }) => void;
}

/**
 * Um controle, dois conceitos — e o rótulo de cada grupo é que faz o trabalho.
 *
 * Antes existia só "Geração", e a opção dizia "IX — Paldea". Quem lia isso
 * esperava a dex de Paldea, que tem 400 entradas, e recebia 120: o número de
 * espécies que ESTREARAM na geração IX. Os dois números estão certos; o
 * rótulo é que misturava as duas coisas.
 *
 * Os dois critérios são exclusivos entre si de propósito. Cruzar "geração IX"
 * com "dex de Paldea" devolveria as 120 novas de novo, que é a interseção — um
 * resultado tecnicamente correto e inútil como filtro.
 */
const DexFilter = ({ generation, pokedex, onChange }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const value = generation ? `ger:${generation}` : pokedex ? `dex:${pokedex}` : "";

  return (
    <div className="type-filter">
      <label htmlFor="dex-select">{t("Geração ou região:", "Generation or region:")}</label>
      <select
        id="dex-select"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return onChange({});
          const [tipo, id] = v.split(":");
          if (tipo === "ger") return onChange({ generation: Number(id) });
          return onChange({ pokedex: id });
        }}
      >
        <option value="">{t("Todas", "All")}</option>
        <optgroup label={t("Geração — espécies que estrearam nela", "Generation — species that debuted in it")}>
          {GENERATIONS.map((g) => (
            <option key={g.id} value={`ger:${g.id}`}>
              {g.label}
            </option>
          ))}
        </optgroup>
        <optgroup label={t("Pokédex regional — tudo que aparece na região", "Regional Pokédex — everything found in the region")}>
          {REGIONAL_DEXES.map((d) => (
            <option key={d.id} value={`dex:${d.id}`}>
              {lang === "en" ? d.labelEn : d.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default DexFilter;
