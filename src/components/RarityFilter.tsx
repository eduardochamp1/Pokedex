import { RARITIES, type RarityId } from "../data/rarity";

interface Props {
  value: RarityId | undefined;
  onChange: (v: RarityId | undefined) => void;
}

const RarityFilter = ({ value, onChange }: Props) => {
  return (
    <div className="type-filter">
      <label htmlFor="rarity-select">Raridade:</label>
      <select
        id="rarity-select"
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as RarityId) || undefined)}
      >
        <option value="">Todas</option>
        {RARITIES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label} ({r.names.length})
          </option>
        ))}
      </select>
    </div>
  );
};

export default RarityFilter;
