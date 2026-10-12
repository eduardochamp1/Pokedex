import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchPokemon } from "../api";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import RosterList from "../components/device/RosterList";
import SizeCanvas from "../components/SizeCanvas";
import { MAX, add, clear, remove, useComparator } from "../lib/comparatorStore";
import { parseTamanhosParams, toSearchParams } from "../lib/tamanhosParams";
import { useT } from "../i18n/lang";
import "../styles/sizes.css";

const PRESETS: { title: [string, string]; names: string[] }[] = [
  { title: ["WAILORD VS JOLTIK", "WAILORD VS JOLTIK"], names: ["wailord", "joltik"] },
  {
    title: ["LENDARIOS DE KANTO", "KANTO LEGENDARIES"],
    names: ["articuno", "zapdos", "moltres", "mewtwo"],
  },
  {
    title: ["DO MENOR AO MAIOR", "SMALLEST TO LARGEST"],
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

/**
 * Tamanhos: até seis pokémon em escala, lado a lado.
 *
 * À esquerda as comparações prontas e o elenco (tocar põe ou tira); à direita
 * o comparador. A seleção fica na URL, então dá para mandar o link.
 */
const SizesPage = () => {
  const [params, setParams] = useSearchParams();
  const cart = useComparator();
  const hydrated = useRef(false);
  const t = useT();
  const naLista = (n: string) => cart.some((c) => c.name === n);
  const cheio = cart.length >= MAX;

  useDevicePage({ labels: [t("ELENCO", "ROSTER"), t("COMPARAR", "COMPARE")], footer: `${cart.length} / ${MAX}` });

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

  const alternar = (name: string) => {
    if (naLista(name)) remove(name);
    else if (!cheio) void loadNames([name]);
  };

  return (
    <Panes
      leftLabel={t("Elenco", "Roster")}
      rightLabel={t("Comparador de tamanho", "Size comparison")}
      left={
        <>
          <div className="pane-bar">
            <h2 className="pane-h">{t("COMPARACOES PRONTAS", "READY-MADE COMPARISONS")}</h2>
            <div className="pane-bar-row">
              {PRESETS.map((p) => (
                <button key={p.title[0]} type="button" className="pane-btn sizes-preset" onClick={() => loadPreset(p.names)}>
                  {t(...p.title)}
                </button>
              ))}
            </div>
          </div>
          <RosterList onPick={alternar} isOn={naLista} mark={(n) => (naLista(n) ? "✓" : cheio ? "" : "+")} />
        </>
      }
      right={
        <>
          <header className="pane-band">
            <span className="px">{t("COMPARADOR DE TAMANHO", "SIZE COMPARISON")}</span>
            <h2>
              {cart.length} / {MAX}
            </h2>
          </header>
          <div className="pane-scroll pane-scroll-loose">
            {cart.length === 0 ? (
              <p className="pane-empty">
                {t("ESCOLHA UMA COMPARACAO PRONTA", "PICK A READY-MADE COMPARISON")}
                <br />
                {t("OU POKEMON DO ELENCO", "OR POKEMON FROM THE ROSTER")}
              </p>
            ) : (
              <>
                <div className="sizes-stage">
                  <SizeCanvas items={cart} />
                </div>
                <div className="pane-bar-row">
                  <button type="button" className="pane-btn" onClick={share}>
                    {t("COPIAR LINK", "COPY LINK")}
                  </button>
                  <button type="button" className="pane-btn" onClick={clear}>
                    {t("LIMPAR", "CLEAR")}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      }
    />
  );
};

export default SizesPage;
