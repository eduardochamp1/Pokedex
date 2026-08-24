import { GENERATIONS } from "../hooks/usePokemon";

interface Props {
  value: number | undefined;
  onChange: (gen: number | undefined) => void;
}

const GenerationFilter = ({ value, onChange }: Props) => {
  return (
    <div className="type-filter">
      <label htmlFor="gen-select">Geração:</label>
      <select
        id="gen-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Todas</option>
        {GENERATIONS.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenerationFilter;
