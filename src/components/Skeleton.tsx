interface Props {
  count?: number;
}

export const CardSkeleton = ({ count = 12 }: Props) => (
  <div className="pokedex-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card-skeleton" aria-hidden="true">
        <div className="skeleton skeleton-line skeleton-line-lg" />
        <div className="skeleton skeleton-artwork" />
        <div className="skeleton skeleton-line skeleton-line-sm" />
        <div className="skeleton skeleton-line" />
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="detail-skeleton" aria-hidden="true">
    <div className="skeleton skeleton-hero" />
  </div>
);

/** Placeholder enquanto o chunk de uma rota lazy chega. */
export const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <span className="route-fallback-ball" aria-hidden="true" />
    <span className="route-fallback-text">Carregando…</span>
  </div>
);
