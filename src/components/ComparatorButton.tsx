import { useState } from "react";
import { Link } from "react-router-dom";
import { remove, clear, useComparator } from "../lib/comparatorStore";

const ComparatorButton = () => {
  const cart = useComparator();
  const [open, setOpen] = useState(false);
  if (cart.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className="comparator-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Comparador (${cart.length})`}
      >
        📏 <span className="comparator-fab-count">{cart.length}</span>
      </button>
      {open && (
        <div
          className="comparator-modal"
          role="dialog"
          aria-label="Carrinho de comparação"
          onClick={() => setOpen(false)}
        >
          <div
            className="comparator-modal-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>No comparador ({cart.length}/6)</h3>
            <ul>
              {cart.map((c) => (
                <li key={c.name}>
                  <img src={c.sprite} alt="" width={32} height={32} />
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => remove(c.name)}
                    aria-label={`Remover ${c.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="comparator-modal-actions">
              <button type="button" onClick={clear}>
                Limpar
              </button>
              <Link to="/tamanhos" onClick={() => setOpen(false)}>
                Abrir página
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComparatorButton;
