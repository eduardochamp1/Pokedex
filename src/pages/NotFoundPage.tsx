import { Link } from "react-router-dom";

/**
 * A carcaça do aparelho aparece só aqui e em /jogar: são as duas telas em que
 * a moldura é o assunto, e não um enfeite em volta de dado que se consulta.
 */
const NotFoundPage = () => (
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
          SEM SINAL
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

    <h1>Esta rota não existe</h1>
    <p>
      O endereço que você abriu não corresponde a nenhuma página da Pokédex.
    </p>
    <div className="notfound-links">
      <Link to="/" className="notfound-cta">
        Ir para a Pokédex →
      </Link>
      <Link to="/lore">Explorar a lore</Link>
      <Link to="/mapa">Ver o mapa</Link>
      <Link to="/jogar">Jogar</Link>
    </div>
  </div>
);

export default NotFoundPage;
