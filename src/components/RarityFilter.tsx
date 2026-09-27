import { RARITIES, type RarityId } from "../data/rarity";
import { useLang, tr } from "../i18n/lang";

interface Props {
  value: RarityId | undefined;
  onChange: (v: RarityId | undefined) => void;
}

const RarityFilter = ({ value, onChange }: Props) => {
  const lang = useLang();
  return (
    <div className="type-filter">
      <label htmlFor="rarity-select">{tr(lang, "Raridade:", "Rarity:")}</label>
      <select
        id="rarity-select"
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as RarityId) || undefined)}
      >
        <option value="">{tr(lang, "Todas", "All")}</option>
        {RARITIES.map((r) => (
          <option key={r.id} value={r.id}>
            {lang === "en" ? r.labelEn : r.label} ({r.names.length})
          </option>
        ))}
      </select>
    </div>
  );
};

export default RarityFilter;
