import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { Pokemon, PokemonVariety } from "../types/pokemon";

interface Props {
  varieties: PokemonVariety[];
  currentName: string;
}

const NOTABLE_FORM_RE =
  /-(mega|gmax|primal|origin|alola|galar|hisui|paldea|therian|zen|complete|blade|shield|attack|defense|speed|dawn|dusk|midnight|midday|ultra|black|white|resolute|pirouette|sky|sunshine|rainy|snowy|sunny|overcast|10|50|100)/;

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
    return <p className="detail-muted">Sem formas alternativas.</p>;

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
            {data ? (
              <Card
                pokemon={data}
                variant="mini"
                linkTo={`/pokemon/${v.pokemon.name}`}
                showActions={false}
              />
            ) : (
              <Link
                to={`/pokemon/${v.pokemon.name}`}
                className="variety-fallback"
              />
            )}
            <span className="variety-label">
              {labelFor(v.pokemon.name, v.is_default)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default VarietySwitcher;
