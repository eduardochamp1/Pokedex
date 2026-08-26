interface Props {
  count?: number;
}

const ParticleField = ({ count = 20 }: Props) => {
  const seed = 42;
  const particles = Array.from({ length: count }).map((_, i) => {
    const x = (seed * (i + 1) * 37) % 1000;
    const y = (seed * (i + 1) * 71) % 600;
    const r = ((i * 13) % 3) + 1;
    const delay = (i * 0.3).toFixed(2);
    return { x, y, r, delay };
  });
  return (
    <g className="particle-field" aria-hidden="true">
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="white"
          className="particle"
          style={{ animationDelay: `${p.delay}s` }}
        />
      ))}
    </g>
  );
};

export default ParticleField;
