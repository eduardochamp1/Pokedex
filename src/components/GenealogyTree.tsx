import { Link } from "react-router-dom";
import type { GenealogyNode } from "../data/genealogy";
import type { Pokemon } from "../types/pokemon";

interface Props {
  node: GenealogyNode;
  byName: Map<string, Pokemon>;
  depth?: number;
}

const GenealogyTree = ({ node, byName, depth = 0 }: Props) => {
  const p = byName.get(node.name);
  const sprite =
    p?.sprites.other?.["official-artwork"]?.front_default ??
    p?.sprites.front_default ??
    "";

  return (
    <div className={"genealogy-node depth-" + depth}>
      <div className="genealogy-card">
        <Link to={`/pokemon/${node.name}`} className="genealogy-portrait">
          {sprite ? (
            <img src={sprite} alt={node.name} />
          ) : (
            <span className="lore-pokemon-placeholder">?</span>
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
      {node.children && node.children.length > 0 && (
        <div className="genealogy-children">
          {node.children.map((child) => (
            <GenealogyTree
              key={child.name}
              node={child}
              byName={byName}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenealogyTree;
