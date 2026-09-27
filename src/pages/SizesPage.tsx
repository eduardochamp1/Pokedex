import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchPokemon } from "../api";
import SizeCanvas from "../components/SizeCanvas";
import { add, clear, useComparator } from "../lib/comparatorStore";
import { parseTamanhosParams, toSearchParams } from "../lib/tamanhosParams";
import { useT } from "../i18n/lang";

const PRESETS: { title: [string, string]; names: string[] }[] = [
  { title: ["Wailord vs Joltik", "Wailord vs Joltik"], names: ["wailord", "joltik"] },
  {
    title: ["Lendários de Kanto", "Kanto legendaries"],
    names: ["articuno", "zapdos", "moltres", "mewtwo"],
  },
  {
    title: ["Do menor ao maior", "Smallest to largest"],
    names: ["joltik", "pikachu", "charizard", "onix", "wailord"],
  },
];

async function loadNames(names: string[]) {
  for (const n of names) {
    try {
      const p = await searchPokemon(n);
      if (!p) continue;
      const sprite =
        p.sprites.other?.["official-artwork"]?.front_default ??
        p.sprites.front_default ??
        "";
      add({ name: p.name, height: p.height, sprite });
    } catch {
      // pula nomes que não existem
    }
  }
}

const SizesPage = () => {
  const [params, setParams] = useSearchParams();
  const cart = useComparator();
  const hydrated = useRef(false);
  const t = useT();

  // Sincroniza URL -> cart no mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const namesFromUrl = parseTamanhosParams(params);
    if (namesFromUrl.length === 0 || cart.length > 0) return;
    void loadNames(namesFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza cart -> URL
  useEffect(() => {
    const next = toSearchParams(cart.map((c) => c.name));
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [cart, params, setParams]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // ignora
    }
  };

  const loadPreset = async (names: string[]) => {
    clear();
    await loadNames(names);
  };

  return (
    <div className="sizes-page">
      <h1 className="sizes-titulo">{t("Comparador de tamanho", "Size comparison")}</h1>
      {cart.length === 0 ? (
        <div className="sizes-empty">
          <p>{t("Escolha uma comparação pra começar:", "Pick a comparison to start:")}</p>
          <div className="sizes-presets">
            {PRESETS.map((p) => (
              <button
                key={p.title[0]}
                type="button"
                onClick={() => loadPreset(p.names)}
              >
                {t(...p.title)}
              </button>
            ))}
          </div>
          <p className="sizes-hint">
            {t(
              "Ou adicione pokémons a partir da listagem clicando no botão 📏 de cada card.",
              "Or add Pokémon from the list by clicking the 📏 button on each card."
            )}
          </p>
        </div>
      ) : (
        <>
          <SizeCanvas items={cart} />
          <div className="sizes-actions">
            <button type="button" onClick={share}>{t("Copiar link", "Copy link")}</button>
            <button type="button" onClick={clear}>{t("Limpar", "Clear")}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SizesPage;
