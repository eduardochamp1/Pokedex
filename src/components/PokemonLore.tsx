import type { PokemonSpecies } from "../types/pokemon";

interface Props {
  species: PokemonSpecies;
}

// Prefer PT-BR, fall back to English.
const PREFERRED_LANGS = ["pt-br", "pt", "en"];

function pickBest<T extends { language: { name: string } }>(
  entries: T[]
): T | undefined {
  for (const lang of PREFERRED_LANGS) {
    const found = entries.find((e) => e.language.name === lang);
    if (found) return found;
  }
  return entries[0];
}

const PokemonLore = ({ species }: Props) => {
  const flavor = pickBest(species.flavor_text_entries);
  const genus = pickBest(species.genera);

  const rarityLabels: string[] = [];
  if (species.is_mythical) rarityLabels.push("Mítico ✨");
  else if (species.is_legendary) rarityLabels.push("Lendário 👑");
  if (species.is_baby) rarityLabels.push("Bebê 🍼");

  const cleanFlavor = flavor?.flavor_text
    .replace(/[\f\n\r\v]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="lore-block">
      <div className="lore-badges">
        {genus && <span className="lore-genus">{genus.genus}</span>}
        {rarityLabels.map((l) => (
          <span key={l} className="lore-rarity">
            {l}
          </span>
        ))}
        {species.habitat && (
          <span className="lore-habitat">
            Habitat: <b>{species.habitat.name}</b>
          </span>
        )}
      </div>
      {cleanFlavor && <p className="lore-text">{cleanFlavor}</p>}
    </div>
  );
};

export default PokemonLore;
