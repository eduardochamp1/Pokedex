import { Link } from "react-router-dom";
import Card from "./Card";
import TeamMemberSheet from "./TeamMemberSheet";
import { usePokemonsByNames } from "../hooks/usePokemon";
import type { Gen3PartyMember } from "../emulator/saveParse/gen3";

interface Props {
  /** `null` = o save não abriu; `[]` = abriu e o time está vazio. */
  team: Gen3PartyMember[] | null;
  /** Já houve uma tentativa de leitura? Sem isto, "não abriu" apareceria antes. */
  lido: boolean;
}

/**
 * O time do jogador, lido do save, desenhado com as mesmas cartas da Pokédex.
 *
 * É aqui que o emulador deixa de ser ilha e vira **fonte de dados** do site: os
 * ids nacionais saem do save e entram em `usePokemonsByNames`, o mesmo hook que
 * a grade usa. Nenhum componente novo de carta — e `Card.tsx` fica intocado: o
 * apelido e o nível entram **em volta** da carta, não dentro dela.
 *
 * Os três estados são distintos de propósito, e nenhum deles é um carregando
 * eterno. Romhack não abrir é o esperado, não é falha — e a tela diz isso numa
 * frase em vez de girar para sempre.
 */
const PlayTeam = ({ team, lido }: Props) => {
  const ids = (team ?? []).map((m) => String(m.national));
  const { pokemons, isLoading, isError } = usePokemonsByNames(ids);

  if (!lido) return null;

  if (team === null) {
    return (
      <section className="play-panel">
        <h2>Seu time</h2>
        <p className="play-panel-hint">
          Não deu para ler o time deste save. O leitor entende save de bateria
          de Gen 3 (Ruby, Sapphire, Emerald, FireRed, LeafGreen); romhack e
          outras gerações guardam o progresso de outro jeito.
        </p>
      </section>
    );
  }

  if (team.length === 0) {
    return (
      <section className="play-panel">
        <h2>Seu time</h2>
        <p className="play-panel-hint">
          O save abriu, mas ainda não há pokémon no time.
        </p>
      </section>
    );
  }

  return (
    <section className="play-panel">
      <h2>Seu time</h2>
      {isError && (
        <p className="play-panel-hint">
          O time foi lido do save, mas não deu para buscar os dados na PokéAPI.
        </p>
      )}
      <ul className="play-team-list">
        {team.map((membro, i) => {
          const pokemon = pokemons[i];
          return (
            <li key={membro.slot} className="play-team-row">
              {pokemon ? (
                <Card
                  pokemon={pokemon}
                  variant="mini"
                  linkTo={`/pokemon/${pokemon.name}`}
                />
              ) : (
                <div className="play-team-vazio" aria-hidden="true" />
              )}
              <div className="play-team-info">
                <span className="play-team-apelido">{membro.nickname}</span>
                <span className="play-team-nivel">nível {membro.level}</span>
              </div>
              <TeamMemberSheet membro={membro} pokemon={pokemon} />
            </li>
          );
        })}
      </ul>
      <p className="play-panel-hint">
        <Link to="/treinador">Ficha do treinador e linha do tempo →</Link>
      </p>
      {isLoading && (
        <p className="play-panel-hint">Buscando os dados de cada um…</p>
      )}
    </section>
  );
};

export default PlayTeam;
