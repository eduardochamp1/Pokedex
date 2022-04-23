import React from "react";

const Pokemon = (props) => {
  const { pokemon } = props;
  const onHeartClick = () => {
    console.log("pode favoritar");
  };
  const heart = "❤️";
  return (
    <div className="pokemon-card">
      <div className="pokemon-image-container">
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="pokemon-image"
        />
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3>{pokemon.name}</h3>
          <div>#{pokemon.id}</div>
        </div>
        <div className="card-bottom">
          <div className="pokemon-type">
            {pokemon.types.map((type, index) => {
              return (
                <div key={index} className="pokemon-type-text">
                  {type.type.name}
                </div>
              );
            })}
            <buttom className="pokemon-heart-btn" onClick={onHeartClick}>
              {heart}
            </buttom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pokemon;
