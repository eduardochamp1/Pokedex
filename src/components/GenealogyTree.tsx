import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { GenealogyNode } from "../data/genealogy";
import { pixelSpriteUrl } from "../lib/sprites";

interface Props {
  node: GenealogyNode;
  /** Resolvedor nome -> id da Pokedex (ja normaliza apelidos). */
  idOf: (name: string) => number | undefined;
  depth?: number;
}

const GenealogyTree = ({ node, idOf, depth = 0 }: Props) => {
  const sprite = pixelSpriteUrl(idOf(node.name));
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<
    Array<{ d: string; box: { w: number; h: number; ox: number; oy: number } }>
  >([]);

  useEffect(() => {
    if (!node.children || !rootRef.current || !wrapRef.current) return;
    const compute = () => {
      const rootRect = rootRef.current!.getBoundingClientRect();
      const wrapRect = wrapRef.current!.getBoundingClientRect();
      const parentBottom = {
        x: rootRect.left + rootRect.width / 2 - wrapRect.left,
        y: rootRect.bottom - wrapRect.top,
      };
      const childEls = wrapRef.current!.querySelectorAll<HTMLElement>(
        ":scope > .genealogy-children > .genealogy-node > .genealogy-card"
      );
      const paths: typeof connectors = [];
      childEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - wrapRect.left;
        const cy = r.top - wrapRect.top;
        const midY = (parentBottom.y + cy) / 2;
        paths.push({
          d: `M ${parentBottom.x} ${parentBottom.y} C ${parentBottom.x} ${midY}, ${cx} ${midY}, ${cx} ${cy}`,
          box: { w: wrapRect.width, h: wrapRect.height, ox: 0, oy: 0 },
        });
      });
      setConnectors(paths);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [node.children]);

  return (
    <div className={"genealogy-node depth-" + depth} ref={wrapRef}>
      <div ref={rootRef} className="genealogy-card">
        <Link to={`/pokemon/${node.name}`} className="genealogy-portrait">
          {sprite ? (
            <img
              src={sprite}
              alt={node.name}
              loading="lazy"
              decoding="async"
            />
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
        {depth === 0 && <span className="genealogy-pulse" aria-hidden="true" />}
      </div>
      {node.children && (
        <>
          {connectors.length > 0 && (
            <svg
              className="genealogy-connectors"
              width={connectors[0]?.box.w}
              height={connectors[0]?.box.h}
              aria-hidden="true"
            >
              {connectors.map((c, i) => (
                <path
                  key={i}
                  d={c.d}
                  stroke="var(--accent-alt)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.4"
                />
              ))}
            </svg>
          )}
          <div className="genealogy-children">
            {node.children.map((c) => (
              <GenealogyTree
                key={c.name}
                node={c}
                idOf={idOf}
                depth={depth + 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GenealogyTree;
