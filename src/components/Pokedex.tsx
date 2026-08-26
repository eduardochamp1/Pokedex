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
}

const Pokedex = ({ pokemons, loading, page, setPage, totalPages }: Props) => {
  const onLeftClickHandler = () => {
    if (page > 0) setPage(page - 1);
  };
  const onRightClickHandler = () => {
    if (page + 1 !== totalPages) setPage(page + 1);
  };

  return (
    <div>
      <div className="pokedex-header">
        <h1>Pokédex</h1>
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
        <div className="card-grid">
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
