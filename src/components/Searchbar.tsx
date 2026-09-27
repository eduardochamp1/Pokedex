import { FormEvent } from "react";
import { useT } from "../i18n/lang";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const Searchbar = ({ value, onChange }: Props) => {
  const t = useT();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="searchbar-container" onSubmit={onSubmit} role="search">
      <div className="searchbar">
        <input
          type="search"
          value={value}
          placeholder={t("Buscar pokémon…", "Search Pokémon…")}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t("Buscar pokémon por nome ou id", "Search Pokémon by name or number")}
        />
      </div>
    </form>
  );
};

export default Searchbar;
