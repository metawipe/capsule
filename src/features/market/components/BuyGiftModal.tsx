import { useMemo, useState } from 'react'
import { useTonWallet } from '@tonconnect/ui-react'
import { Modal } from '@/shared/ui/Modal'
import { hapticLight } from '@/integrations/telegram/twa'
import { isLottiePreview, useLottie } from '@/shared/hooks/useLottie'
import { useUserContext } from '@/features/profile/model/UserContext'
import type { GiftPreview } from '@/shared/api/types'
import { Toast } from '@/shared/ui/Toast'
import './buy-gift-modal.css'

interface BuyGiftModalProps {
  isOpen: boolean
  onClose: () => void
  gift: GiftPreview | null
  actionLabel?: string
  onAction?: (gift: GiftPreview) => void
}

function GramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6382 1.4856C11.3423 1.4856 11.6948 1.48526 12.0132 1.58381C12.295 1.67098 12.5565 1.81462 12.7822 2.00457C13.037 2.2191 13.2275 2.51509 13.6081 3.10725L15.2889 5.72109C15.5404 6.11245 15.6665 6.30869 15.7007 6.51461C15.7308 6.69622 15.7107 6.88261 15.6427 7.05368C15.5656 7.24758 15.4012 7.41229 15.0724 7.74118L8.82682 13.9867C8.53577 14.2779 8.38979 14.4233 8.2219 14.4778C8.07406 14.5258 7.91439 14.5258 7.76655 14.4778C7.59876 14.4231 7.4527 14.2776 7.16164 13.9867L0.917217 7.74118C0.588097 7.41222 0.422908 7.2476 0.345788 7.05368C0.277835 6.88264 0.257651 6.69618 0.287753 6.51461C0.321993 6.30885 0.448063 6.11245 0.699583 5.72109L2.38039 3.10725C2.76117 2.51495 2.95125 2.21801 3.20628 2.00345C3.43204 1.81343 3.69444 1.67097 3.97637 1.58381C4.29476 1.48539 4.64667 1.4856 5.35025 1.4856H10.6382ZM10.1371 3.5481C10.0513 3.3161 9.723 3.3161 9.63708 3.5481L9.04333 5.15189C9.02572 5.19951 8.99776 5.24322 8.96186 5.27912C8.92603 5.31485 8.8832 5.34304 8.83574 5.3606L7.23083 5.95323C6.99903 6.03926 6.99905 6.36829 7.23083 6.45435L8.83574 7.04698C8.88317 7.06453 8.92604 7.09276 8.96186 7.12845C8.99776 7.16436 9.02572 7.20807 9.04333 7.25569L9.63708 8.85948C9.72284 9.09164 10.0512 9.09164 10.1371 8.85948L10.7308 7.25569C10.7485 7.20807 10.7764 7.16436 10.8123 7.12845C10.8482 7.09264 10.892 7.06457 10.9395 7.04698L12.5433 6.45435C12.7755 6.36859 12.7755 6.03915 12.5433 5.95323L10.9395 5.3606C10.892 5.343 10.8482 5.31496 10.8123 5.27912C10.7764 5.24322 10.7485 5.19951 10.7308 5.15189L10.1371 3.5481Z"
        fill="currentColor"
      />
    </svg>
  )
}

function parseTrait(value?: string) {
  if (!value) return null
  const match = value.match(/^(.+?)\s+([\d.]+%)$/)
  if (match) {
    return { name: match[1].trim(), rarity: match[2] }
  }
  return { name: value.trim(), rarity: null }
}

function TraitRow({
  label,
  trait,
  floorPrice,
}: {
  label: string
  trait: { name: string; rarity: string | null }
  floorPrice: string
}) {
  return (
    <tr className="buy-gift-modal__traitRow">
      <td className="buy-gift-modal__traitLabel">{label}</td>
      <td className="buy-gift-modal__traitValue">
        <div className="buy-gift-modal__traitContent">
          <span className="buy-gift-modal__traitName">{trait.name}</span>
          {trait.rarity && <span className="buy-gift-modal__traitRarity">{trait.rarity}</span>}
          <span className="buy-gift-modal__traitSpacer" />
          <span className="buy-gift-modal__traitFloor">
            {floorPrice}
            <GramIcon />
          </span>
        </div>
      </td>
    </tr>
  )
}

export function BuyGiftModal({ isOpen, onClose, gift, actionLabel = 'Buy gift', onAction }: BuyGiftModalProps) {
  const wallet = useTonWallet()
  const { balance, addGift } = useUserContext()
  const [errorMessage, setErrorMessage] = useState('')

  const isLottie = isLottiePreview(gift?.preview)
  const { containerRef: lottieRef } = useLottie(gift?.preview, isOpen && isLottie, true)

  const floorPrice = gift ? gift.price.toFixed(2) : '0.00'
  const isBuyAction = actionLabel === 'Buy gift'

  const traits = useMemo(() => {
    if (!gift) return []
    const rows: Array<{ label: string; trait: { name: string; rarity: string | null } }> = []
    const model = parseTrait(gift.model)
    const backdrop = parseTrait(gift.backdrop)
    const symbol = parseTrait(gift.symbol)
    if (model) rows.push({ label: 'Model', trait: model })
    if (backdrop) rows.push({ label: 'Backdrop', trait: backdrop })
    if (symbol) rows.push({ label: 'Symbol', trait: symbol })
    return rows
  }, [gift])

  const insufficientBalance = useMemo(() => {
    if (!gift || !isBuyAction) return false
    return balance < gift.price
  }, [balance, gift, isBuyAction])

  const handleBuy = async () => {
    if (!gift) return
    hapticLight()

    if (onAction && !isBuyAction) {
      onAction(gift)
      onClose()
      return
    }

    if (!wallet || balance < gift.price) return

    try {
      await addGift(gift)
      onClose()
    } catch (error) {
      console.error('Error purchasing gift:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to purchase gift')
    }
  }

  const handleClose = () => {
    hapticLight()
    onClose()
  }

  if (!gift) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="buy-gift-modal__sheet"
        bodyClassName="buy-gift-modal__body"
        hideCloseButton
      >
        <div className="buy-gift-modal">
          <div className="buy-gift-modal__previewBlock">
            <div className="buy-gift-modal__previewMedia">
              {gift.preview ? (
                isLottie ? (
                  <div key={gift.id} ref={lottieRef} className="buy-gift-modal__previewLottie" />
                ) : (
                  <img src={gift.preview} alt={gift.name} />
                )
              ) : (
                <div className="buy-gift-modal__previewPlaceholder">
                  <span className="mdi mdi-gift" />
                </div>
              )}
            </div>
            <div className="buy-gift-modal__heading">
              <div className="buy-gift-modal__titleRow">
                <span className="buy-gift-modal__title">{gift.name}</span>
                <span className="material-icons-round buy-gift-modal__chevron" aria-hidden="true">chevron_right</span>
              </div>
              <div className="buy-gift-modal__id">#{gift.id}</div>
            </div>
          </div>

          <div className="buy-gift-modal__traitsCard">
            <table className="buy-gift-modal__traitsTable">
              <tbody>
                {traits.map((row) => (
                  <TraitRow key={row.label} label={row.label} trait={row.trait} floorPrice={floorPrice} />
                ))}
                <tr className="buy-gift-modal__traitRow">
                  <td className="buy-gift-modal__traitLabel">Min price</td>
                  <td className="buy-gift-modal__traitValue">
                    <div className="buy-gift-modal__traitContent">
                      <span className="buy-gift-modal__traitFloor">
                        {floorPrice}
                        <GramIcon />
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {insufficientBalance && (
            <div className="buy-gift-modal__error">Insufficient balance</div>
          )}

          <div className="buy-gift-modal__footer">
            <button
              type="button"
              className="buy-gift-modal__buyBtn"
              onClick={handleBuy}
              disabled={isBuyAction && (insufficientBalance || !wallet)}
            >
              <span>{actionLabel}</span>
              <span className="buy-gift-modal__buyBtnPrice">{floorPrice} GRAM</span>
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={errorMessage} type="error" isVisible={Boolean(errorMessage)} onClose={() => setErrorMessage('')} />
    </>
  )
}
