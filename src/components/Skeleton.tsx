interface Props {
  count?: number;
}

export const CardSkeleton = ({ count = 12 }: Props) => (
  <div className="card-grid">
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
