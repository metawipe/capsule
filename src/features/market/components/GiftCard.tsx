import { hapticLight } from '@/integrations/telegram/twa'
import { memo, useEffect, useId, useRef, useState } from 'react'
import type { GiftPreview } from '@/shared/api/types'
import { isLottiePreview, useLottie } from '@/shared/hooks/useLottie'
import './market-content.css'

interface GiftCardProps {
  gift: GiftPreview
  index: number
  actionLabel: string
  actionClassName?: string
  onCardClick: (gift: GiftPreview) => void
  onAction: (gift: GiftPreview) => void
}

function TonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="gift-card__tonIcon">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6382 1.4856C11.3423 1.4856 11.6948 1.48526 12.0132 1.58381C12.295 1.67098 12.5565 1.81462 12.7822 2.00457C13.037 2.2191 13.2275 2.51509 13.6081 3.10725L15.2889 5.72109C15.5404 6.11245 15.6665 6.30869 15.7007 6.51461C15.7308 6.69622 15.7107 6.88261 15.6427 7.05368C15.5656 7.24758 15.4012 7.41229 15.0724 7.74118L8.82682 13.9867C8.53577 14.2779 8.38979 14.4233 8.2219 14.4778C8.07406 14.5258 7.91439 14.5258 7.76655 14.4778C7.59876 14.4231 7.4527 14.2776 7.16164 13.9867L0.917217 7.74118C0.588097 7.41222 0.422908 7.2476 0.345788 7.05368C0.277835 6.88264 0.257651 6.69618 0.287753 6.51461C0.321993 6.30885 0.448063 6.11245 0.699583 5.72109L2.38039 3.10725C2.76117 2.51495 2.95125 2.21801 3.20628 2.00345C3.43204 1.81343 3.69444 1.67097 3.97637 1.58381C4.29476 1.48539 4.64667 1.4856 5.35025 1.4856H10.6382ZM10.1371 3.5481C10.0513 3.3161 9.723 3.3161 9.63708 3.5481L9.04333 5.15189C9.02572 5.19951 8.99776 5.24322 8.96186 5.27912C8.92603 5.31485 8.8832 5.34304 8.83574 5.3606L7.23083 5.95323C6.99903 6.03926 6.99905 6.36829 7.23083 6.45435L8.83574 7.04698C8.88317 7.06453 8.92604 7.09276 8.96186 7.12845C8.99776 7.16436 9.02572 7.20807 9.04333 7.25569L9.63708 8.85948C9.72284 9.09164 10.0512 9.09164 10.1371 8.85948L10.7308 7.25569C10.7485 7.20807 10.7764 7.16436 10.8123 7.12845C10.8482 7.09264 10.892 7.06457 10.9395 7.04698L12.5433 6.45435C12.7755 6.36859 12.7755 6.03915 12.5433 5.95323L10.9395 5.3606C10.892 5.343 10.8482 5.31496 10.8123 5.27912C10.7764 5.24322 10.7485 5.19951 10.7308 5.15189L10.1371 3.5481Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CartIcon({ clipId }: { clipId: string }) {
  return (
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" aria-hidden="true" className="gift-card__cartIcon">
      <g clipPath={`url(#${clipId})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.64155 1.16739C4.72811 0.940225 4.86212 0.731505 5.03734 0.556288C5.36382 0.229804 5.80663 0.0463867 6.26835 0.0463867H8.75017C9.21189 0.0463867 9.6547 0.229804 9.98118 0.556288C10.151 0.726078 10.2821 0.927329 10.3688 1.14634C10.9426 1.31718 11.4634 1.638 11.8756 2.07884C12.3787 2.61704 12.6926 3.3047 12.7695 4.03743L12.9315 5.51062C13.7709 5.57459 14.4099 6.34671 14.2989 7.19322L13.6059 12.4145C13.6037 12.4307 13.6015 12.4497 13.599 12.4711C13.5839 12.601 13.5586 12.818 13.477 13.0147C13.3013 13.4383 12.9315 13.7672 12.4931 13.8946C12.2847 13.9551 12.0727 13.9533 11.9429 13.9521L11.899 13.9519H3.16607C3.14849 13.9519 3.12793 13.9522 3.10486 13.9526C2.96323 13.955 2.72709 13.9589 2.50556 13.8946C2.06712 13.7672 1.69733 13.4383 1.52163 13.0147C1.42812 12.7892 1.40031 12.5209 1.38355 12.3592C1.37998 12.3247 1.37691 12.2951 1.37381 12.2718L0.713001 7.29308C0.697656 7.17746 0.674619 7.00248 0.699774 6.8113C0.781947 6.18679 1.25928 5.66628 1.8818 5.53697C1.94882 5.52305 2.01738 5.51371 2.0871 5.5093L2.24923 4.03545L2.24936 4.03421C2.3308 3.30499 2.64699 2.62196 3.15029 2.08802C3.55956 1.65384 4.07455 1.33735 4.64155 1.16739ZM4.79362 2.71249C4.58786 2.81188 4.40055 2.94849 4.2418 3.11691C3.96165 3.41411 3.78561 3.79425 3.74016 4.20013L3.59647 5.5064H11.422L11.2783 4.19948L11.2778 4.19523C11.2352 3.78672 11.0604 3.40329 10.7799 3.10327C10.6228 2.93526 10.4374 2.79856 10.2336 2.6985C10.1624 2.81435 10.0778 2.92173 9.98118 3.01831C9.81953 3.17997 9.62761 3.3082 9.41639 3.39569C9.20517 3.48318 8.97879 3.52821 8.75017 3.52821H6.26835C5.80663 3.52821 5.36382 3.34479 5.03734 3.01831C4.94413 2.9251 4.86257 2.8224 4.79362 2.71249ZM4.87055 8.48822C4.87055 8.14305 4.59073 7.86322 4.24555 7.86322C3.90038 7.86322 3.62055 8.14305 3.62055 8.48822V10.97C3.62055 11.3152 3.90038 11.595 4.24555 11.595C4.59073 11.595 4.87055 11.3152 4.87055 10.97V8.48822ZM7.50925 7.86322C7.85443 7.86322 8.13425 8.14305 8.13425 8.48822V10.97C8.13425 11.3152 7.85443 11.595 7.50925 11.595C7.16407 11.595 6.88425 11.3152 6.88425 10.97V8.48822C6.88425 8.14305 7.16407 7.86322 7.50925 7.86322ZM11.3979 8.48822C11.3979 8.14305 11.1181 7.86322 10.7729 7.86322C10.4278 7.86322 10.148 8.14305 10.148 8.48822V10.97C10.148 11.3152 10.4278 11.595 10.7729 11.595C11.1181 11.595 11.3979 11.3152 11.3979 10.97V8.48822Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="14" height="14" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const GiftCard = memo(function GiftCard({
  gift, index, actionLabel, actionClassName = 'gift-card__price-btn', onCardClick, onAction,
}: GiftCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!isLottiePreview(gift.preview))
  const isLottie = isLottiePreview(gift.preview)
  const { containerRef } = useLottie(gift.preview, visible && isLottie)

  useEffect(() => {
    if (!triggerRef.current || !isLottie) return
    const element = triggerRef.current
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
    }, { rootMargin: '250px 0px' })
    observer.observe(element)

    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
    }

    return () => observer.disconnect()
  }, [gift.id, isLottie])

  const animate = index < 8
  const isBuy = actionLabel === 'Buy'
  const cartClipId = useId().replace(/:/g, '')

  const handleCardClick = () => {
    hapticLight()
    onCardClick(gift)
  }

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation()
    onAction(gift)
  }

  return (
    <article
      className={`gift-card ${animate ? 'animate-in' : ''}`}
      style={{ animationDelay: animate ? `${Math.min(index * 0.05, 0.5)}s` : '0s' }}
    >
      <div className="gift-card__outer">
        <div className="gift-card__shell" onClick={handleCardClick}>
          <div className="gift-card__image" ref={triggerRef}>
            {gift.preview ? isLottie
              ? <div ref={containerRef} className="gift-card__lottie" />
              : <img src={gift.preview} alt={gift.name} loading="lazy" decoding="async" />
              : <div className="gift-card__image-placeholder"><span className="mdi mdi-gift" /></div>}
          </div>

          <div className="gift-card__meta">
            <h3 className="gift-card__title">{gift.name}</h3>
            <p className="gift-card__id">#{gift.id}</p>
          </div>

          <div className="gift-card__actions">
            {isBuy ? (
              <>
                <button
                  type="button"
                  className={actionClassName}
                  onClick={handleAction}
                >
                  <span className="gift-card__price">{gift.price.toFixed(2)}</span>
                  <TonIcon />
                </button>
                <button
                  type="button"
                  className="gift-card__cart-btn"
                  onClick={handleAction}
                  aria-label="Add to cart"
                >
                  <CartIcon clipId={cartClipId} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className={actionClassName}
                onClick={handleAction}
              >
                <span>{actionLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
})
