import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="notfound-shell">
    <div className="notfound-code" aria-hidden="true">
      404
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
