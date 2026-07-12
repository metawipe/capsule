import { useMemo, useState } from 'react'
import { useMarketContext } from '@/features/market/model/MarketContext'
import { useMyGiftsTab } from '@/features/market/model/MyGiftsTabContext'
import { useUserContext } from '@/features/profile/model/UserContext'
import type { GiftPreview } from '@/shared/api/types'
import './my-gifts-content.css'
import { TgsPlayer } from '@/shared/ui/TgsPlayer'
import Esc from '@/shared/assets/Esc.tgs?url'
import { AddGiftModal } from './AddGiftModal'
import { BuyGiftModal } from './BuyGiftModal'
import { GiftCard } from './GiftCard'
import { GiftGridSkeleton } from '@/shared/ui/Skeleton'

interface MyGiftsContentProps {
  onGoToMarket?: () => void
}

export function MyGiftsContent({ onGoToMarket }: MyGiftsContentProps) {
  const { subTab: giftsTab } = useMyGiftsTab()
  const { searchQuery, searchResults, isSearching, searchError } = useMarketContext()
  const { myGifts } = useUserContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState<GiftPreview | null>(null)
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)

  const actionLabel = giftsTab === 'listed' ? 'Change price' : 'Withdraw'

  const handleGiftClick = (gift: GiftPreview) => {
    setSelectedGift(gift)
    setIsGiftModalOpen(true)
  }

  const handleGiftAction = (gift: GiftPreview) => {
    console.log(`${actionLabel} gift:`, gift)
    setIsGiftModalOpen(false)
  }

  const tabGifts = useMemo(
    () => myGifts.filter((gift) => (giftsTab === 'listed' ? gift.isListed : !gift.isListed)),
    [myGifts, giftsTab],
  )

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const ids = new Set(tabGifts.map((gift) => gift.id))
    return searchResults.filter((gift) => ids.has(gift.id))
  }, [searchQuery, searchResults, tabGifts])

  const displayGifts = searchQuery.trim() ? filteredSearchResults : tabGifts

  if (isSearching) {
    return <div className="my-gifts-content" data-subtab={giftsTab}><GiftGridSkeleton /></div>
  }

  if (searchError) {
    return (
      <div className="my-gifts-content" data-subtab={giftsTab}>
        <div className="market-content__error">
          <p>{searchError}</p>
          <button onClick={() => window.location.reload()} className="market-content__retry-btn">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!displayGifts.length) {
    const isListedTab = giftsTab === 'listed'

    return (
      <div className="my-gifts-content" data-subtab={giftsTab}>
        <div className="my-gifts-content__empty">
          <div className="my-gifts-content__empty-stack">
            <TgsPlayer src={Esc} autoplay loop className="my-gifts-content__empty-tgs" width={100} height={100} />
            <div className="my-gifts-content__empty-copy">
              <h3 className="my-gifts-content__empty-title">
                {isListedTab ? 'No listed gifts' : 'Any Telegram gifts?'}
              </h3>
              <p className="my-gifts-content__empty-subtitle">
                {isListedTab
                  ? 'List gifts from the Unlisted tab to sell them on the market'
                  : 'You can add them through our bot'}
              </p>
            </div>
            {isListedTab ? (
              onGoToMarket && (
                <button type="button" className="my-gifts-content__empty-btn" onClick={onGoToMarket}>
                  Go to Market
                </button>
              )
            ) : (
              <button type="button" className="my-gifts-content__empty-btn" onClick={() => setIsModalOpen(true)}>
                How do I add gifts?
              </button>
            )}
          </div>
        </div>
        <AddGiftModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="my-gifts-content" data-subtab={giftsTab} key={giftsTab}>
      <div className="market-content__grid">
        {displayGifts.map((gift, index) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            index={index}
            actionLabel={actionLabel}
            actionClassName="gift-card__withdraw-btn"
            onCardClick={handleGiftClick}
            onAction={handleGiftClick}
          />
        ))}
      </div>
      <BuyGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        gift={selectedGift}
        actionLabel={actionLabel}
        onAction={handleGiftAction}
      />
    </div>
  )
}
