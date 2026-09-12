import Card from "./Card";
import Pagination from "./Pagination";
import { CardSkeleton } from "./Skeleton";
import type { Pokemon as PokemonT } from "../types/pokemon";

interface Props {
  pokemons: PokemonT[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  /** Total de resultados da selecao atual, quando ha filtro/busca ativos. */
  total?: number;
}

const Pokedex = ({
  pokemons,
  loading,
  page,
  setPage,
  totalPages,
  total,
}: Props) => {
  const onLeftClickHandler = () => {
    if (page > 0) setPage(page - 1);
  };
  const onRightClickHandler = () => {
    if (page + 1 < totalPages) setPage(page + 1);
  };

  return (
    <div>
      <div className="pokedex-header">
        <h1>Pokédex</h1>
        {total !== undefined && (
          <span className="pokedex-count">
            {total} {total === 1 ? "resultado" : "resultados"}
          </span>
        )}
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          onLeftClick={onLeftClickHandler}
          onRightClick={onRightClickHandler}
        />
      </div>
      {loading ? (
        <CardSkeleton count={10} />
      ) : (
        <div className="pokedex-grid">
          {pokemons.map((pokemon) => (
            <Card
              key={pokemon.id}
              pokemon={pokemon}
              linkTo={`/pokemon/${pokemon.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Pokedex;
