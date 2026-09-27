import { Link } from "react-router-dom";
import type { PokemonSpecies } from "../types/pokemon";
import { tGenus, tHabitat } from "../data/i18n";
import { pickLocalized } from "../lib/localize";
import { regionIdForPokemon } from "../lib/regionForPokemon";
import { useTypewriter } from "../hooks/useTypewriter";
import { useT } from "../i18n/lang";

interface Props {
  species: PokemonSpecies;
}

const PokemonLore = ({ species }: Props) => {
  const t = useT();
  const flavor = pickLocalized(species.flavor_text_entries, (e) => e.flavor_text);
  const genus = pickLocalized(species.genera, (g) => g.genus);
  const rarity: string[] = [];
  if (species.is_mythical) rarity.push(t("Mítico ✦", "Mythical ✦"));
  else if (species.is_legendary) rarity.push(t("Lendário ★", "Legendary ★"));
  if (species.is_baby) rarity.push(t("Bebê", "Baby"));

  // O verbete se escreve sozinho na primeira visita — depois abre pronto.
  const typed = useTypewriter(flavor ?? "", species.name);

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
            {t("Habitat", "Habitat")}: <b>{tHabitat(species.habitat.name)}</b>
          </span>
        )}
        {regionId && (
          <Link
            to={`/mapa?region=${encodeURIComponent(regionId)}`}
            className="lore-tag lore-region"
          >
            {t("ver no mapa →", "see on the map →")}
          </Link>
        )}
      </div>
      {flavor && (
        // O clique completa na hora. Quem le por leitor de tela recebe o
        // texto inteiro desde o primeiro quadro, na copia escondida.
        <blockquote className="lore-quote" onClick={typed.skip}>
          <span aria-hidden="true">"{typed.shown}"</span>
          <span className="visually-hidden">"{flavor}"</span>
          {!typed.done && (
            <span className="lore-quote-caret" aria-hidden="true">
              ▾
            </span>
          )}
        </blockquote>
      )}
    </div>
  );
};

export default PokemonLore;
