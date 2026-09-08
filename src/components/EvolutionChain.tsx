import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { searchPokemon } from "../api";
import Card from "./Card";
import type { EvolutionStep } from "../hooks/usePokemon";
import type { Pokemon } from "../types/pokemon";

interface Props {
  steps: EvolutionStep[];
  currentName?: string;
}

const EvolutionChain = ({ steps, currentName }: Props) => {
  const queries = useQueries({
    queries: steps.map((s) => ({
      queryKey: ["pokemon-detail", s.name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        searchPokemon(s.name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (steps.length <= 1)
    return <p className="detail-muted">Esse pokémon não evolui.</p>;

  return (
    <div className="evo-chain">
      {queries.map((q, i) => {
        const data = q.data as Pokemon | null | undefined;
        const step = steps[i];
        const isCurrent =
          step.name.toLowerCase() === currentName?.toLowerCase();
        return (
          <div key={step.name} className="evo-step">
            {i > 0 && (
              <span className="evo-arrow-group" aria-hidden="true">
                <span className="evo-arrow">→</span>
                {step.condition && (
                  <span className="evo-condition">{step.condition}</span>
                )}
              </span>
            )}
            <div className={"evo-card-wrap" + (isCurrent ? " active" : "")}>
              {data ? (
                <Card
                  pokemon={data}
                  variant="mini"
                  linkTo={`/pokemon/${step.name}`}
                  showActions={false}
                />
              ) : (
                <Link to={`/pokemon/${step.name}`} className="variety-fallback" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EvolutionChain;
