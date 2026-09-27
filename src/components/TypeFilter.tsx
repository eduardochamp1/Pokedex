import { POKEMON_TYPES } from "../hooks/usePokemon";
import { tType } from "../data/i18n";
import { useT } from "../i18n/lang";

interface Props {
  value: string | undefined;
  onChange: (type: string | undefined) => void;
}

const TypeFilter = ({ value, onChange }: Props) => {
  const t = useT();
  return (
    <div className="type-filter">
      <label htmlFor="type-select">{t("Filtrar por tipo:", "Filter by type:")}</label>
      <select
        id="type-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">{t("Todos", "All")}</option>
        {POKEMON_TYPES.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tType(tipo)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeFilter;
