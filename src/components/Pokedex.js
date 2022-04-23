import React from "react";
import Pokemon from "./Pokemon";
import Pagination from "./Pagination";

const Pokedex = (props) => {
    const { pokemons, loading, page, totalPages} = props;
    const onLeftClickHandler = () => {
      console.log("volta")
    }
    const onRightClickHandler = () => {
      console.log("avança")
    }
    return (
        <div>
            <div className="pokedex-header">
                <h1>Pokedex</h1>
                <Pagination
                  page={page+1}
                  totalPages={totalPages}
                  onLeftClick={onLeftClickHandler}
                  onRightClick={onRightClickHandler}r
                />
            </div>
            {loading ? (<div>Carregando, segura fera...</div>) : (
                <div className="pokedex-grid">
                    {pokemons && pokemons.map((pokemon, index) => {
                        return (
                            <Pokemon key={index} pokemon={pokemon} />
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default Pokedex;