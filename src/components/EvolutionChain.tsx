import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
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

  const isLoading = queries.some((q) => q.isLoading);

  if (names.length <= 1) {
    return <p className="evolution-empty">Esse pokémon não evolui.</p>;
  }
  if (isLoading) {
    return <p>Carregando evoluções…</p>;
  }

  return (
    <div className="evolution-chain">
      {queries.map((q, i) => {
        const p = q.data as Pokemon | null | undefined;
        const name = names[i];
        const isCurrent = name.toLowerCase() === currentName?.toLowerCase();
        return (
          <div key={name} className="evolution-step">
            {i > 0 && <span className="evolution-arrow" aria-hidden="true">→</span>}
            <Link
              to={`/pokemon/${name}`}
              className={
                "evolution-card" + (isCurrent ? " evolution-card-current" : "")
              }
            >
              <img
                src={
                  p?.sprites.other?.["official-artwork"]?.front_default ??
                  p?.sprites.front_default ??
                  ""
                }
                alt={name}
                className="evolution-image"
              />
              <span className="evolution-name">{name}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default EvolutionChain;
