import { Link } from "react-router-dom";
import type { PokemonSpecies } from "../types/pokemon";
import { tGenus, tHabitat } from "../data/i18n";
import { pickLocalized } from "../lib/localize";
import { regionIdForPokemon } from "../lib/regionForPokemon";

interface Props {
  species: PokemonSpecies;
}

const PokemonLore = ({ species }: Props) => {
  const flavor = pickLocalized(species.flavor_text_entries, (e) => e.flavor_text);
  const genus = pickLocalized(species.genera, (g) => g.genus);
  const rarity: string[] = [];
  if (species.is_mythical) rarity.push("Mítico ✨");
  else if (species.is_legendary) rarity.push("Lendário 👑");
  if (species.is_baby) rarity.push("Bebê 🍼");

  // O mapa e indexado por id de regiao ("kanto"), nao por nome de pokemon.
  const regionId = regionIdForPokemon(species.name, species.generation?.name);

  return (
    <div className="lore-block">
      <div className="lore-tags">
        {genus && <span className="lore-tag lore-genus">{tGenus(genus)}</span>}
        {rarity.map((r) => (
          <span key={r} className="lore-tag lore-rarity">
            {r}
          </span>
        ))}
        {species.habitat && (
          <span className="lore-tag lore-habitat">
            Habitat: <b>{tHabitat(species.habitat.name)}</b>
          </span>
        )}
        {regionId && (
          <Link
            to={`/mapa?region=${encodeURIComponent(regionId)}`}
            className="lore-tag lore-region"
          >
            ver no mapa →
          </Link>
        )}
      </div>
      {flavor && <blockquote className="lore-quote">"{flavor}"</blockquote>}
    </div>
  );
};

export default PokemonLore;
