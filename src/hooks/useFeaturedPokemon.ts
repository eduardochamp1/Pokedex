import { useState } from "react";
import { usePokemonDetail } from "./usePokemon";
import { dailyPokemonId } from "../lib/daily";

/**
 * O destaque da Home é o pokémon do dia: o mesmo para todo mundo, o dia
 * inteiro. Antes era um lendário sorteado a cada F5, e voltar à Home não
 * mostrava o mesmo que a pessoa tinha visto.
 *
 * O id é lido no mount: quem deixa a aba aberta de um dia para o outro vê o
 * novo ao voltar à Home.
 */
export function useFeaturedPokemon() {
  const [id] = useState(() => dailyPokemonId());
  return usePokemonDetail(String(id));
}
