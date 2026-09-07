import { POKEMON_TYPES } from "../hooks/usePokemon";
import { tType } from "../data/i18n";

interface Props {
  value: string | undefined;
  onChange: (type: string | undefined) => void;
}

const TypeFilter = ({ value, onChange }: Props) => {
  return (
    <div className="type-filter">
      <label htmlFor="type-select">Filtrar por tipo:</label>
      <select
        id="type-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">Todos</option>
        {POKEMON_TYPES.map((t) => (
          <option key={t} value={t}>
            {tType(t)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeFilter;
