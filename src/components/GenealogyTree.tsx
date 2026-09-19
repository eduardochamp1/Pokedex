import { Link } from "react-router-dom";
import {
  GENEALOGY_BRANCHES,
  GENEALOGY_ROOT,
  type GenealogyNode,
} from "../data/genealogy";
import { pixelSpriteUrl } from "../lib/sprites";

interface Props {
  /** Resolvedor nome -> id da Pokedex (ja normaliza apelidos). */
  idOf: (name: string) => number | undefined;
}

type IdOf = Props["idOf"];

/**
 * Descendencia direta de um membro: ficha pequena, nao carta inteira.
 *
 * Os tres Regis como cartas do mesmo tamanho do Regigigas empilhavam uma
 * coluna torta debaixo do pai, com cotovelos que nao encostavam em nada. Como
 * ficha, eles cabem lado a lado dentro da carta de quem os criou, que e onde
 * a informacao pertence.
 */
const Heirs = ({ nodes, idOf }: { nodes: GenealogyNode[]; idOf: IdOf }) => (
  <ul className="genealogy-heirs">
    {nodes.map((n) => {
      const sprite = pixelSpriteUrl(idOf(n.name));
      return (
        <li key={n.name} className="genealogy-heir">
          <Link to={`/pokemon/${n.name}`} className="genealogy-chip">
            <span className="genealogy-chip-portrait">
              {sprite ? (
                <img src={sprite} alt="" loading="lazy" decoding="async" />
              ) : (
                <span aria-hidden="true">?</span>
              )}
            </span>
            <span className="genealogy-chip-text">
              <span className="genealogy-chip-name">{n.name}</span>
              <span className="genealogy-chip-role">{n.role}</span>
            </span>
          </Link>
          {n.children && <Heirs nodes={n.children} idOf={idOf} />}
        </li>
      );
    })}
  </ul>
);

const Member = ({ node, idOf }: { node: GenealogyNode; idOf: IdOf }) => {
  const sprite = pixelSpriteUrl(idOf(node.name));
  return (
    <li className="genealogy-member">
      <Link to={`/pokemon/${node.name}`} className="genealogy-portrait">
        {sprite ? (
          <img src={sprite} alt={node.name} loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden="true">?</span>
        )}
      </Link>
      <Link to={`/pokemon/${node.name}`} className="genealogy-name">
        {node.name}
      </Link>
      <span className="genealogy-role">{node.role}</span>
      {node.note && <p className="genealogy-note">{node.note}</p>}
      {node.children && <Heirs nodes={node.children} idOf={idOf} />}
    </li>
  );
};

/**
 * A genealogia e uma coluna: Arceus no alto, e abaixo dele uma pilha de
 * paineis de cla ligados por um fio central.
 *
 * Duas versoes anteriores erraram aqui. A primeira punha os doze descendentes
 * diretos num flex que quebrava linha e mandava doze curvas medidas no DOM
 * atravessarem as seis fileiras resultantes. A segunda agrupou por cla, o que
 * resolveu a leitura, mas pendurou os clas num trilho lateral: o trilho nao
 * encostava em Arceus, a carta dele cobria o primeiro titulo, e sobrava uma
 * faixa morta na direita. Painel de largura cheia com fio no meio nao tem
 * nenhum dos dois problemas — e o fio so aparece no vao entre paineis, entao
 * nunca passa por cima de texto.
 */
const GenealogyTree = ({ idOf }: Props) => {
  const rootSprite = pixelSpriteUrl(idOf(GENEALOGY_ROOT.name));
  return (
    <div className="genealogy">
      <div className="genealogy-root">
        <Link to={`/pokemon/${GENEALOGY_ROOT.name}`} className="genealogy-root-portrait">
          {rootSprite ? (
            <img src={rootSprite} alt={GENEALOGY_ROOT.name} decoding="async" />
          ) : (
            <span aria-hidden="true">?</span>
          )}
        </Link>
        <Link to={`/pokemon/${GENEALOGY_ROOT.name}`} className="genealogy-root-name">
          {GENEALOGY_ROOT.name}
        </Link>
        <span className="genealogy-root-role">{GENEALOGY_ROOT.role}</span>
        <p className="genealogy-root-note">{GENEALOGY_ROOT.note}</p>
      </div>

      <ol className="genealogy-branches">
        {GENEALOGY_BRANCHES.map((branch) => (
          <li key={branch.id} className="genealogy-branch">
            <div className="genealogy-branch-head">
              <h3 className="genealogy-branch-title">{branch.title}</h3>
              <p className="genealogy-branch-note">{branch.note}</p>
            </div>
            <ul className="genealogy-row">
              {branch.members.map((m) => (
                <Member key={m.name} node={m} idOf={idOf} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default GenealogyTree;
