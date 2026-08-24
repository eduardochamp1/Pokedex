import Pokemon from "./Pokemon";
import Pagination from "./Pagination";
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
        <h1>Pokedex</h1>
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          onLeftClick={onLeftClickHandler}
          onRightClick={onRightClickHandler}
        />
      </div>
      {loading ? (
        <div>Carregando…</div>
      ) : (
        <div className="pokedex-grid">
          {pokemons.map((pokemon) => (
            <Pokemon key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Pokedex;
