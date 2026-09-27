import { Link } from "react-router-dom";
import { useT } from "../i18n/lang";

/**
 * A carcaça do aparelho aparece só aqui e em /jogar: são as duas telas em que
 * a moldura é o assunto, e não um enfeite em volta de dado que se consulta.
 */
const NotFoundPage = () => {
  const t = useT();
  return (
  <div className="notfound-shell">
    <div className="notfound-device">
      <div className="notfound-deck" aria-hidden="true">
        <span className="notfound-lens" />
        <span className="notfound-leds">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="notfound-lcd">
        <span className="notfound-code" aria-hidden="true">
          404
        </span>
        <span className="notfound-lcd-line" aria-hidden="true">
          {t("SEM SINAL", "NO SIGNAL")}
        </span>
      </div>
      <div className="notfound-dpad" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>

    <h1>{t("Esta rota não existe", "This route doesn't exist")}</h1>
    <p>
      {t(
        "O endereço que você abriu não corresponde a nenhuma página da Pokédex.",
        "The address you opened doesn't match any page of the Pokédex."
      )}
    </p>
    <div className="notfound-links">
      <Link to="/" className="notfound-cta">
        {t("Ir para a Pokédex →", "Go to the Pokédex →")}
      </Link>
      <Link to="/lore">{t("Explorar a lore", "Explore the lore")}</Link>
      <Link to="/mapa">{t("Ver o mapa", "See the map")}</Link>
      <Link to="/jogar">{t("Jogar", "Play")}</Link>
    </div>
  </div>
  );
};

export default NotFoundPage;
