import type { ReactNode } from "react";
import { useDevice } from "./DeviceContext";

interface Props {
  left: ReactNode;
  right: ReactNode;
  /** Nomes acessíveis das duas telas. */
  leftLabel?: string;
  rightLabel?: string;
}

/**
 * As duas telas do aparelho, com a dobradiça no meio.
 *
 * No celular só uma aparece (`pane`, no contexto); a outra continua montada,
 * para não perder rolagem nem estado ao alternar.
 */
export const Panes = ({ left, right, leftLabel, rightLabel }: Props) => {
  const { pane } = useDevice();
  return (
    <>
      <section className="dev-pane dev-pane-left" data-hidden={pane !== "left"} aria-label={leftLabel}>
        {left}
      </section>
      <div className="dev-hinge" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <section className="dev-pane dev-pane-right" data-hidden={pane !== "right"} aria-label={rightLabel}>
        {right}
      </section>
    </>
  );
};

/** Tela única, para a página que ainda não se dividiu em dois painéis. */
export const SinglePane = ({ children }: { children: ReactNode }) => (
  <div className="dev-pane dev-pane-single">{children}</div>
);
