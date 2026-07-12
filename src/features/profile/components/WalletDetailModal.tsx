import { Modal } from '@/shared/ui/Modal'
import { hapticLight, hapticSuccess } from '@/integrations/telegram/twa'
import { useTonConnectUI } from '@tonconnect/ui-react'
import './wallet-detail-modal.css'

interface WalletDetailModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  walletBalance: number
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <g clipPath="url(#wallet-detail-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 4.35474C0 2.42174 1.567 0.854736 3.5 0.854736H10C10.2761 0.854736 10.5 1.07859 10.5 1.35474V2.75269H3.35547C3.01029 2.75269 2.73047 3.03251 2.73047 3.37769C2.73047 3.72286 3.01029 4.00269 3.35547 4.00269H10.9396C10.9594 4.00269 10.979 4.00176 10.9983 3.99996H11.2121C11.6099 3.99996 11.9914 4.15799 12.2727 4.4393C12.554 4.7206 12.7121 5.10213 12.7121 5.49996V6.41614H9.76276C8.93828 6.41614 8.01276 7.0409 8.01276 8.11074V9.88917C8.01276 10.959 8.93828 11.5838 9.76276 11.5838H12.7121V12.4999C12.7121 12.8978 12.554 13.2793 12.2727 13.5606C11.9914 13.8419 11.6099 13.9999 11.2121 13.9999L1.5 14C1.10217 14 0.720644 13.8419 0.43934 13.5606C0.158035 13.2793 0 12.8978 0 12.5V4.35474ZM9.76276 7.66614H13.2628C13.5389 7.66614 13.7628 7.86519 13.7628 8.11074V9.88917C13.7628 10.1347 13.5389 10.3338 13.2628 10.3338H9.76276C9.48661 10.3338 9.26276 10.1347 9.26276 9.88917V8.11074C9.26276 7.86519 9.48661 7.66614 9.76276 7.66614Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="wallet-detail-clip">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function GramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="wallet-detail-modal__gramIcon">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6382 1.4856C11.3423 1.4856 11.6948 1.48526 12.0132 1.58381C12.295 1.67098 12.5565 1.81462 12.7822 2.00457C13.037 2.2191 13.2275 2.51509 13.6081 3.10725L15.2889 5.72109C15.5404 6.11245 15.6665 6.30869 15.7007 6.51461C15.7308 6.69622 15.7107 6.88261 15.6427 7.05368C15.5656 7.24758 15.4012 7.41229 15.0724 7.74118L8.82682 13.9867C8.53577 14.2779 8.38979 14.4233 8.2219 14.4778C8.07406 14.5258 7.91439 14.5258 7.76655 14.4778C7.59876 14.4231 7.4527 14.2776 7.16164 13.9867L0.917217 7.74118C0.588097 7.41222 0.422908 7.2476 0.345788 7.05368C0.277835 6.88264 0.257651 6.69618 0.287753 6.51461C0.321993 6.30885 0.448063 6.11245 0.699583 5.72109L2.38039 3.10725C2.76117 2.51495 2.95125 2.21801 3.20628 2.00345C3.43204 1.81343 3.69444 1.67097 3.97637 1.58381C4.29476 1.48539 4.64667 1.4856 5.35025 1.4856H10.6382ZM10.1371 3.5481C10.0513 3.3161 9.723 3.3161 9.63708 3.5481L9.04333 5.15189C9.02572 5.19951 8.99776 5.24322 8.96186 5.27912C8.92603 5.31485 8.8832 5.34304 8.83574 5.3606L7.23083 5.95323C6.99903 6.03926 6.99905 6.36829 7.23083 6.45435L8.83574 7.04698C8.88317 7.06453 8.92604 7.09276 8.96186 7.12845C8.99776 7.16436 9.02572 7.20807 9.04333 7.25569L9.63708 8.85948C9.72284 9.09164 10.0512 9.09164 10.1371 8.85948L10.7308 7.25569C10.7485 7.20807 10.7764 7.16436 10.8123 7.12845C10.8482 7.09264 10.892 7.06457 10.9395 7.04698L12.5433 6.45435C12.7755 6.36859 12.7755 6.03915 12.5433 5.95323L10.9395 5.3606C10.892 5.343 10.8482 5.31496 10.8123 5.27912C10.7764 5.24322 10.7485 5.19951 10.7308 5.15189L10.1371 3.5481Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.67857 0C1.61345 0 0.75 0.863451 0.75 1.92857V12.2143C0.75 13.2794 1.61345 14.1429 2.67857 14.1429H12.9643C14.0294 14.1429 14.8929 13.2794 14.8929 12.2143V1.92857C14.8929 0.863451 14.0294 0 12.9643 0H2.67857ZM18.75 5.46429C18.75 4.93173 18.3183 4.5 17.7857 4.5C17.2532 4.5 16.8214 4.93173 16.8214 5.46429V15.1071C16.8214 15.6397 16.3897 16.0714 15.8571 16.0714H6.21429C5.68173 16.0714 5.25 16.5032 5.25 17.0357C5.25 17.5683 5.68173 18 6.21429 18H15.8571C17.4548 18 18.75 16.7048 18.75 15.1071V5.46429Z"
        fill="currentColor"
      />
    </svg>
  )
}

function formatAddress(address: string) {
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-5)}`
}

export function WalletDetailModal({ isOpen, onClose, address, walletBalance }: WalletDetailModalProps) {
  const [tonConnectUI] = useTonConnectUI()

  const handleCopy = async () => {
    hapticLight()
    try {
      await navigator.clipboard.writeText(address)
      hapticSuccess()
    } catch (error) {
      console.error('Failed to copy address', error)
    }
  }

  const handleReconnect = () => {
    hapticLight()
    tonConnectUI.openModal()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your wallet"
      className="wallet-detail-modal__sheet"
      bodyClassName="wallet-detail-modal__body"
    >
      <div className="wallet-detail-modal">
        <div className="wallet-detail-modal__balanceBlock">
          <div className="wallet-detail-modal__balanceLabel">Balance</div>
          <div className="wallet-detail-modal__balanceAmount">
            {walletBalance.toFixed(2)}
            <GramIcon />
          </div>
        </div>

        <div className="wallet-detail-modal__addressCard">
          <div className="wallet-detail-modal__addressInfo">
            <span className="wallet-detail-modal__addressIcon"><WalletIcon /></span>
            <div className="wallet-detail-modal__addressText">
              <span className="wallet-detail-modal__addressCaption">Address</span>
              <span className="wallet-detail-modal__addressValue">{formatAddress(address)}</span>
            </div>
          </div>
          <button type="button" className="wallet-detail-modal__copyBtn" onClick={handleCopy} aria-label="Copy address">
            <CopyIcon />
          </button>
        </div>

        <button type="button" className="wallet-detail-modal__reconnectBtn glass-shadow" onClick={handleReconnect}>
          Reconnect
        </button>
      </div>
    </Modal>
  )
}
