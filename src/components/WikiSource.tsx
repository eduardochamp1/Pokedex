import { bulbapediaUrl } from "../lib/wiki";

interface Props {
  /** Titulo da pagina na Bulbapedia. Sem ele, nada e renderizado. */
  wiki: string | undefined;
  label?: string;
}

/**
 * Cita a fonte de um verbete curado. Serve de atribuicao e de porta de saida
 * para quem quer o texto completo — as imagens e o texto do site sao locais,
 * o link e so a referencia.
 */
const WikiSource = ({ wiki, label = "Bulbapedia" }: Props) => {
  if (!wiki) return null;
  return (
    <a
      className="wiki-source"
      href={bulbapediaUrl(wiki)}
      target="_blank"
      rel="noreferrer noopener"
      title={`Ler "${wiki}" na Bulbapedia (abre em nova aba)`}
    >
      <span className="wiki-source-icon" aria-hidden="true">
        ↗
      </span>
      fonte: {label}
    </a>
  );
};

export default WikiSource;
