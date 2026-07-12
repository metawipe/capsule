import { useEffect, useRef, useState } from 'react'
import type { GiftPreview } from '@/shared/api/types'
import './market-content.css'
import { useMarketContext } from '@/features/market/model/MarketContext'
import { BuyGiftModal } from './BuyGiftModal'
import { GiftCard } from './GiftCard'
import { GiftListItem } from './GiftListItem'
import { GiftGridSkeleton } from '@/shared/ui/Skeleton'

export function MarketContent() {
  const { 
    gifts, 
    isLoadingGifts, 
    giftsError,
    loadMoreGifts,
    hasMoreGifts,
    marketViewMode,
  } = useMarketContext()
  
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [selectedGift, setSelectedGift] = useState<GiftPreview | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  const handleGiftClick = (gift: GiftPreview) => {
    setSelectedGift(gift)
    setIsBuyModalOpen(true)
  }

  const handleCloseBuyModal = () => {
    setIsBuyModalOpen(false)
    // Очищаем selectedGift после завершения анимации закрытия
    setTimeout(() => {
      setSelectedGift(null)
    }, 300) // Время анимации закрытия
  }
  
  // `gifts` уже содержит текущую страницу отфильтрованных результатов.
  // Рендер `searchResults` здесь обходил пагинацию и создавал сразу все карточки.
  const displayGifts = gifts
  const displayLoading = isLoadingGifts
  const displayError = giftsError
  
  // Intersection Observer для загрузки следующей страницы результатов.
  useEffect(() => {
    if (!hasMoreGifts) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMoreGifts) {
            loadMoreGifts()
          }
        })
      },
      {
        rootMargin: '200px', // Начинаем загрузку за 200px до конца
        threshold: 0.1,
      }
    )
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    
    return () => {
      observer.disconnect()
    }
  }, [hasMoreGifts, loadMoreGifts])

  if (displayLoading) {
    return (
      <div className="market-content">
        <GiftGridSkeleton />
      </div>
    )
  }

  if (displayError) {
    return (
      <div className="market-content">
        <div className="market-content__error">
          <p>{displayError}</p>
          <button onClick={() => window.location.reload()} className="market-content__retry-btn">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (displayGifts.length === 0) {
    return (
      <div className="market-content">
        <div className="market-content__empty">
          <p>Gifts not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="market-content">
      {marketViewMode === 'list' ? (
        <div className="market-content__list">
          {displayGifts.map((gift, index) => (
            <GiftListItem key={`${gift.id}-${index}`} gift={gift} onCardClick={handleGiftClick} onBuy={handleGiftClick} />
          ))}
        </div>
      ) : (
        <div className="market-content__grid">
          {displayGifts.map((gift, index) => (
            <GiftCard
              key={`${gift.id}-${index}`}
              gift={gift}
              index={index}
              actionLabel="Buy"
              onCardClick={handleGiftClick}
              onAction={handleGiftClick}
            />
          ))}
        </div>
      )}
      <BuyGiftModal
        isOpen={isBuyModalOpen}
        onClose={handleCloseBuyModal}
        gift={selectedGift}
      />
      {/* Элемент для отслеживания скролла - загружаем следующую порцию */}
      {hasMoreGifts && (
        <div ref={loadMoreRef} className="market-content__load-more" style={{
          height: '10px', 
          width: '100%',
          marginTop: '20px'
        }} />
      )}
    </div>
  )
}

