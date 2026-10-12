import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import FavoriteContext from "../../contexts/favoritesContext";
import { openSearch } from "../../lib/searchEvents";
import { sectionOf } from "../../lib/deviceNav";
import { useT } from "../../i18n/lang";
import { InstallButton } from "../AppStatus";
import LangToggle from "../LangToggle";
import ScanlineToggle from "../ScanlineToggle";
import {
  DeviceContext,
  type DeviceContextValue,
  type DeviceHandlers,
  type DevicePageConfig,
  type PaneSide,
} from "./DeviceContext";
import "../../styles/device.css";
import "../../styles/pages.css";

const digitando = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

const SETAS: Record<string, keyof DeviceHandlers> = {
  ArrowUp: "onUp",
  ArrowDown: "onDown",
  ArrowLeft: "onLeft",
  ArrowRight: "onRight",
};

/**
 * O aparelho: carcaça, barra de abas, as telas (que a página preenche) e o
 * rodapé com D-pad e A/B.
 *
 * A página fala com ele por `useDevicePage`; ele não conhece página nenhuma.
 */
const Device = ({ children }: { children: ReactNode }) => {
  const t = useT();
  const { favoritePokemons } = useContext(FavoriteContext);
  const { pathname } = useLocation();
  const section = sectionOf(pathname);

  const [pane, setPane] = useState<PaneSide>("left");
  const [config, setConfig] = useState<DevicePageConfig | null>(null);
  const handlersRef = useRef<DeviceHandlers>({});

  // Trocar de aba volta para a tela da esquerda; andar dentro da mesma aba
  // (lista → ficha) não mexe em nada. Feito durante o render, e não num
  // efeito: o efeito do aparelho roda DEPOIS dos da página, e desfaria o
  // "abrir a ficha" de quem chega por link direto em /pokemon/x.
  const [paneSection, setPaneSection] = useState(section);
  if (paneSection !== section) {
    setPaneSection(section);
    setPane("left");
  }

  const register = useCallback((c: DevicePageConfig | null) => setConfig(c), []);
  const ctx = useMemo<DeviceContextValue>(
    () => ({ pane, setPane, register, handlersRef }),
    [pane, register]
  );

  // As setas do teclado fazem o mesmo que o D-pad, fora de campos de texto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || digitando(e.target)) return;
      if (e.key === "Escape") {
        setPane("left");
        return;
      }
      const nome = SETAS[e.key];
      const handler = nome && handlersRef.current[nome];
      if (!handler) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const abas: { to: string; label: string; end?: boolean; count?: number }[] = [
    { to: "/", label: "POKEDEX", end: true },
    { to: "/comparar", label: t("COMPARAR", "COMPARE") },
    { to: "/time", label: t("TIME", "TEAM") },
    { to: "/mapa", label: t("MAPA", "MAP") },
    { to: "/lore", label: "LORE" },
    { to: "/quiz", label: "QUIZ" },
    { to: "/tamanhos", label: t("TAMANHOS", "SIZES") },
    { to: "/favoritos", label: t("FAVORITOS", "FAVORITES"), count: favoritePokemons.length },
  ];

  const seta = (nome: keyof DeviceHandlers, glifo: string, classe: string, rotulo: string) => (
    <button
      type="button"
      className={classe}
      aria-label={rotulo}
      // A página pode não ter o que fazer com esta seta; aí ela só não responde.
      onClick={() => handlersRef.current[nome]?.()}
    >
      {glifo}
    </button>
  );

  return (
    <DeviceContext.Provider value={ctx}>
      <div className="dev">
        <div className="dev-shell">
          <header className="dev-top">
            <Link to="/" className="dev-brand" aria-label={t("Ir para a Pokédex", "Go to the Pokédex")}>
              <span className="dev-lens" aria-hidden="true" />
              <span className="dev-lights" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="dev-title">POKEDEX</span>
            </Link>
            <nav className="dev-tabs" aria-label={t("Seções", "Sections")}>
              {abas.map((a) => (
                <NavLink
                  key={a.to}
                  to={a.to}
                  end={a.end}
                  className={({ isActive }) =>
                    "dev-tab" + (isActive || (a.to === "/" && section === "") ? " is-active" : "")
                  }
                >
                  {a.label}
                  {a.count ? <span>{a.count}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="dev-tools">
              <button
                type="button"
                onClick={openSearch}
                aria-label={t("Buscar no site (Ctrl+K)", "Search the site (Ctrl+K)")}
                title={t("Buscar no site (Ctrl+K)", "Search the site (Ctrl+K)")}
              >
                CTRL K
              </button>
              <LangToggle />
              <InstallButton />
              <ScanlineToggle />
            </div>
          </header>

          {config && (
            <div className="dev-mtabs" role="group" aria-label={t("Tela", "Screen")}>
              <button type="button" className="dev-mtab" aria-pressed={pane === "left"} onClick={() => setPane("left")}>
                {config.labels[0]}
              </button>
              <button type="button" className="dev-mtab" aria-pressed={pane === "right"} onClick={() => setPane("right")}>
                {config.labels[1]}
              </button>
            </div>
          )}

          {/* O único <main> do site: é o landmark que leitor de tela procura, e
              o destino do link "pular para o conteúdo". */}
          <main id="conteudo" tabIndex={-1} className="dev-body">
            {children}
          </main>

          <footer className="dev-foot">
            <div className="dev-dpad">
              <span />
              {seta("onUp", "▲", "dev-dpad-up", t("Anterior", "Previous"))}
              <span />
              {seta("onLeft", "◀", "dev-dpad-left", t("Página anterior", "Previous page"))}
              <span className="dev-dpad-mid" aria-hidden="true" />
              {seta("onRight", "▶", "dev-dpad-right", t("Próxima página", "Next page"))}
              <span />
              {seta("onDown", "▼", "dev-dpad-down", t("Próximo", "Next"))}
              <span />
            </div>
            <div className="dev-foot-label" aria-hidden="true">
              {config?.footer}
              {config?.hint && <small>{config.hint}</small>}
            </div>
            <div className="dev-ab">
              <button
                type="button"
                className="dev-ab-b"
                aria-label={t("B: voltar para a tela da esquerda", "B: back to the left screen")}
                onClick={() => setPane("left")}
              >
                B
              </button>
              <button
                type="button"
                className="dev-ab-a"
                aria-label={t("A: abrir a tela da direita", "A: open the right screen")}
                onClick={() => setPane("right")}
              >
                A
              </button>
            </div>
          </footer>
        </div>
      </div>
    </DeviceContext.Provider>
  );
};

export default Device;
