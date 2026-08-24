import { FormEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const Searchbar = ({ value, onChange }: Props) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="searchbar-container" onSubmit={onSubmit} role="search">
      <div className="searchbar">
        <input
          type="search"
          value={value}
          placeholder="Buscar pokémon…"
          onChange={(e) => onChange(e.target.value)}
          aria-label="Buscar pokémon por nome ou id"
        />
      </div>
    </form>
  );
};

export default Searchbar;
