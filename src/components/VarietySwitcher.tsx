import { useNavigate } from "react-router-dom";
import type { PokemonVariety } from "../types/pokemon";

interface Props {
  varieties: PokemonVariety[];
  currentName: string;
}


// Human-friendly label — turns "charizard-mega-x" → "Mega X"
function labelFor(name: string, isDefault: boolean): string {
  const parts = name.split("-").slice(1);
  if (parts.length === 0) return isDefault ? "Padrão" : name;
  return parts
    .map((w) => {
      if (w === "mega") return "Mega";
      if (w === "gmax") return "Gigantamax";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const NOTABLE_FORM_RE =
  /-(mega|gmax|primal|origin|alola|galar|hisui|paldea|therian|zen|complete|blade|shield|attack|defense|speed|dawn|dusk|midnight|midday|ultra|black|white|resolute|pirouette|sky|sunshine|rainy|snowy|sunny|overcast|10|50|100)/;

const VarietySwitcher = ({ varieties, currentName }: Props) => {
  const navigate = useNavigate();

  const notable = varieties.filter(
    (v) => v.is_default || NOTABLE_FORM_RE.test(v.pokemon.name)
  );

  if (notable.length <= 1) return null;

  return (
    <div className="variety-switcher" role="tablist" aria-label="Formas alternativas">
      {notable.map((v) => (
        <button
          key={v.pokemon.name}
          type="button"
          role="tab"
          aria-selected={v.pokemon.name === currentName}
          className={
            "variety-btn" +
            (v.pokemon.name === currentName ? " variety-btn-active" : "")
          }
          onClick={() => navigate(`/pokemon/${v.pokemon.name}`)}
        >
          {labelFor(v.pokemon.name, v.is_default)}
        </button>
      ))}
    </div>
  );
};

export default VarietySwitcher;
