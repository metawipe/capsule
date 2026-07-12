import './skeleton.css'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />
}

export function GiftGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="gift-grid-skeleton" aria-label="Loading gifts" aria-busy="true">
    {Array.from({ length: count }, (_, index) => (
      <div className="gift-grid-skeleton__card" key={index}>
        <Skeleton className="gift-grid-skeleton__image" />
        <div className="gift-grid-skeleton__content">
          <Skeleton className="gift-grid-skeleton__title" />
          <Skeleton className="gift-grid-skeleton__meta" />
          <div className="gift-grid-skeleton__actions">
            <Skeleton className="gift-grid-skeleton__button" />
            <Skeleton className="gift-grid-skeleton__cart" />
          </div>
        </div>
      </div>
    ))}
  </div>
}
