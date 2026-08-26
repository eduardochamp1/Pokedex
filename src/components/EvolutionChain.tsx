import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { Pokemon } from "../types/pokemon";

interface Props {
  names: string[];
  currentName?: string;
}

const EvolutionChain = ({ names, currentName }: Props) => {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-detail", name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        searchPokemon(name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (names.length <= 1)
    return <p className="detail-muted">Esse pokémon não evolui.</p>;

  return (
    <div className="evo-chain">
      {queries.map((q, i) => {
        const data = q.data as Pokemon | null | undefined;
        const name = names[i];
        const isCurrent = name.toLowerCase() === currentName?.toLowerCase();
        return (
          <div key={name} className="evo-step">
            {i > 0 && (
              <span className="evo-arrow" aria-hidden="true">
                →
              </span>
            )}
            <div className={"evo-card-wrap" + (isCurrent ? " active" : "")}>
              {data ? (
                <Card
                  pokemon={data}
                  variant="mini"
                  linkTo={`/pokemon/${name}`}
                  showActions={false}
                />
              ) : (
                <Link
                  to={`/pokemon/${name}`}
                  className="variety-fallback"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EvolutionChain;
