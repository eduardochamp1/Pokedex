interface Props {
  count?: number;
}

export const CardSkeleton = ({ count = 8 }: Props) => (
  <div className="pokedex-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="pokemon-card skeleton-card" aria-hidden="true">
        <div className="pokemon-image-container">
          <div className="skeleton skeleton-image" />
        </div>
        <div className="card-body">
          <div className="card-top">
            <div className="skeleton skeleton-line skeleton-line-lg" />
            <div className="skeleton skeleton-line skeleton-line-xs" />
          </div>
          <div className="card-bottom">
            <div className="skeleton skeleton-pill" />
            <div className="skeleton skeleton-pill" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="detail-container" aria-hidden="true">
    <div className="skeleton skeleton-hero" />
    <div className="detail-section">
      <div className="skeleton skeleton-line skeleton-line-md" />
      <div className="skeleton skeleton-line" style={{ marginTop: 12 }} />
      <div className="skeleton skeleton-line" style={{ marginTop: 8 }} />
    </div>
  </div>
);
