import { Link } from "react-router-dom";
import { useT } from "../i18n/lang";
import { SinglePane } from "../components/device/Panes";

/** Endereço que não leva a lugar nenhum: a tela do aparelho fica sem sinal. */
const NotFoundPage = () => {
  const t = useT();
  return (
    <SinglePane>
      <header className="pane-band">
        <span className="px">404 · {t("SEM SINAL", "NO SIGNAL")}</span>
        <h1>{t("Esta rota não existe", "This route doesn't exist")}</h1>
      </header>
      <div className="pane-scroll pane-scroll-loose">
        <div className="pane-card">
          <p>
            {t(
              "O endereço que você abriu não corresponde a nenhuma página da Pokédex.",
              "The address you opened doesn't match any page of the Pokédex."
            )}
          </p>
        </div>
        <div className="pane-bar-row">
          <Link to="/" className="pane-btn page-link is-active">
            {t("IR PARA A POKEDEX →", "GO TO THE POKEDEX →")}
          </Link>
          <Link to="/lore" className="pane-btn page-link">
            {t("EXPLORAR A LORE", "EXPLORE THE LORE")}
          </Link>
          <Link to="/mapa" className="pane-btn page-link">
            {t("VER O MAPA", "SEE THE MAP")}
          </Link>
        </div>
      </div>
    </SinglePane>
  );
};

export default NotFoundPage;
