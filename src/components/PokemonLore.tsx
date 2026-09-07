import { Link } from "react-router-dom";
import type { PokemonSpecies } from "../types/pokemon";
import { tGenus, tHabitat } from "../data/i18n";

interface Props {
  species: PokemonSpecies;
}

// Prioridade: PT primeiro; se não houver, fallback direto para EN.
const LANGS = ["pt-br", "pt", "en"];

function pickBest<T extends { language: { name: string } }>(
  entries: T[]
): T | undefined {
  for (const l of LANGS) {
    const f = entries.find((e) => e.language.name === l);
    if (f) return f;
  }
  return entries[0];
}

const PokemonLore = ({ species }: Props) => {
  const flavor = pickBest(species.flavor_text_entries);
  const genus = pickBest(species.genera);
  const rarity: string[] = [];
  if (species.is_mythical) rarity.push("Mítico ✨");
  else if (species.is_legendary) rarity.push("Lendário 👑");
  if (species.is_baby) rarity.push("Bebê 🍼");
  const cleanFlavor = flavor?.flavor_text
    .replace(/[\f\n\r\v]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="lore-block">
      <div className="lore-tags">
        {genus && (
          <span className="lore-tag lore-genus">{tGenus(genus.genus)}</span>
        )}
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
        <Link
          to={`/mapa?region=${encodeURIComponent(species.name)}`}
          className="lore-tag lore-region"
        >
          ver no mapa →
        </Link>
      </div>
      {cleanFlavor && <blockquote className="lore-quote">"{cleanFlavor}"</blockquote>}
    </div>
  );
};

export default PokemonLore;
