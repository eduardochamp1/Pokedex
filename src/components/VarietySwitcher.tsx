import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import { pixelSpriteUrl } from "../lib/sprites";
import type { Pokemon, PokemonVariety } from "../types/pokemon";
import { getLang, tr } from "../i18n/lang";

interface Props {
  varieties: PokemonVariety[];
  currentName: string;
}

const NOTABLE_FORM_RE =
  /-(mega|gmax|primal|origin|alola|galar|hisui|paldea|therian|zen|complete|blade|shield|attack|defense|speed|dawn|dusk|midnight|midday|ultra|black|white|resolute|pirouette|sky|sunshine|rainy|snowy|sunny|overcast|10|50|100)/;

function labelFor(name: string, isDefault: boolean): string {
  const parts = name.split("-").slice(1);
  if (parts.length === 0) return isDefault ? tr(getLang(), "Padrão", "Default") : name;
  return parts
    .map((w) => {
      if (w === "mega") return "Mega";
      if (w === "gmax") return "Gigantamax";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const VarietySwitcher = ({ varieties, currentName }: Props) => {
  const notable = varieties.filter(
    (v) => v.is_default || NOTABLE_FORM_RE.test(v.pokemon.name)
  );
  const queries = useQueries({
    queries: notable.map((v) => ({
      queryKey: ["pokemon-detail", v.pokemon.name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        searchPokemon(v.pokemon.name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (notable.length <= 1)
    return <p className="detail-muted">{tr(getLang(), "Sem formas alternativas.", "No alternate forms.")}</p>;

  return (
    <ul className="variety-list">
      {notable.map((v, i) => {
        const data = queries[i].data as Pokemon | null | undefined;
        const isCurrent = v.pokemon.name === currentName;
        return (
          <li
            key={v.pokemon.name}
            className={"variety-item" + (isCurrent ? " active" : "")}
          >
            <Link
              to={`/pokemon/${v.pokemon.name}`}
              className="pane-row variety-link"
              aria-current={isCurrent ? "true" : undefined}
            >
              {data && (
                <img
                  className="pixelated"
                  // As formas têm sprite próprio na PokéAPI; o local cobre a espécie.
                  src={data.sprites.front_default ?? pixelSpriteUrl(data.id)}
                  width={72}
                  height={72}
                  alt=""
                  loading="lazy"
                />
              )}
              <span className="variety-label">{labelFor(v.pokemon.name, v.is_default)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default VarietySwitcher;
