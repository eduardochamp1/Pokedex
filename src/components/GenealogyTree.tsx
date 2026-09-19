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

interface CardProps {
  node: GenealogyNode;
  idOf: (name: string) => number | undefined;
  variant?: "root" | "member";
}

const GenealogyCard = ({ node, idOf, variant = "member" }: CardProps) => {
  const sprite = pixelSpriteUrl(idOf(node.name));
  return (
    <div className={"genealogy-card" + (variant === "root" ? " is-root" : "")}>
      <Link to={`/pokemon/${node.name}`} className="genealogy-portrait">
        {sprite ? (
          <img src={sprite} alt={node.name} loading="lazy" decoding="async" />
        ) : (
          <span>?</span>
        )}
      </Link>
      <div className="genealogy-info">
        <Link to={`/pokemon/${node.name}`} className="genealogy-name">
          {node.name}
        </Link>
        <div className="genealogy-role">{node.role}</div>
        {node.note && <p className="genealogy-note">{node.note}</p>}
      </div>
    </div>
  );
};

/** Um membro do clã e, se tiver, a descendência dele logo abaixo. */
const GenealogyMember = ({ node, idOf }: CardProps) => (
  <li className="genealogy-member">
    <GenealogyCard node={node} idOf={idOf} />
    {node.children && (
      <ul className="genealogy-descent">
        {node.children.map((c) => (
          <GenealogyMember key={c.name} node={c} idOf={idOf} />
        ))}
      </ul>
    )}
  </li>
);

/**
 * A árvore é desenhada como registro de linhagem, não como organograma: um
 * trilho desce pela esquerda e cada clã se pendura nele.
 *
 * A versão anterior punha os doze descendentes diretos de Arceus num flex que
 * quebrava linha, e mandava doze curvas de Bézier — medidas no DOM a cada
 * resize — atravessarem as seis fileiras resultantes. O trilho resolve as
 * duas coisas: a hierarquia fica legível em qualquer largura e as ligações
 * são CSS, sem medição nenhuma.
 */
const GenealogyTree = ({ idOf }: Props) => (
  <div className="genealogy">
    <GenealogyCard node={GENEALOGY_ROOT} idOf={idOf} variant="root" />

    <ol className="genealogy-branches">
      {GENEALOGY_BRANCHES.map((branch) => (
        <li key={branch.id} className="genealogy-branch">
          <h3 className="genealogy-branch-title">{branch.title}</h3>
          <p className="genealogy-branch-note">{branch.note}</p>
          <ul className="genealogy-row">
            {branch.members.map((m) => (
              <GenealogyMember key={m.name} node={m} idOf={idOf} />
            ))}
          </ul>
        </li>
      ))}
    </ol>
  </div>
);

export default GenealogyTree;
