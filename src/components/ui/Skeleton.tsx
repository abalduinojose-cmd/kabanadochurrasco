/** Esqueleto cinza com shimmer; some quando o conteúdo chega. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`esqueleto rounded-lg ${className}`} />;
}
