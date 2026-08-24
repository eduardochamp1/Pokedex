import React from "react";

export interface FavoriteContextValue {
  favoritePokemons: string[];
  updateFavoritePokemons: (name: string) => void;
}

const FavoriteContext = React.createContext<FavoriteContextValue>({
  favoritePokemons: [],
  updateFavoritePokemons: () => undefined,
});

export const FavoriteProvider = FavoriteContext.Provider;

export default FavoriteContext;
