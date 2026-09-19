import { GENERATIONS, REGIONAL_DEXES } from "../hooks/usePokemon";

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
  const value = generation ? `ger:${generation}` : pokedex ? `dex:${pokedex}` : "";

  return (
    <div className="type-filter">
      <label htmlFor="dex-select">Geração ou região:</label>
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
        <option value="">Todas</option>
        <optgroup label="Geração — espécies que estrearam nela">
          {GENERATIONS.map((g) => (
            <option key={g.id} value={`ger:${g.id}`}>
              {g.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Pokédex regional — tudo que aparece na região">
          {REGIONAL_DEXES.map((d) => (
            <option key={d.id} value={`dex:${d.id}`}>
              {d.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default DexFilter;
