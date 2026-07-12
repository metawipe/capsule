import { useMemo, useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { hapticLight } from '@/integrations/telegram/twa'
import './balance-flow-modal.css'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  walletConnected: boolean
  balance: number
}

const MIN_WITHDRAW = 5

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <g clipPath="url(#withdraw-wallet-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 4.35474C0 2.42174 1.567 0.854736 3.5 0.854736H10C10.2761 0.854736 10.5 1.07859 10.5 1.35474V2.75269H3.35547C3.01029 2.75269 2.73047 3.03251 2.73047 3.37769C2.73047 3.72286 3.01029 4.00269 3.35547 4.00269H10.9396C10.9594 4.00269 10.979 4.00176 10.9983 3.99996H11.2121C11.6099 3.99996 11.9914 4.15799 12.2727 4.4393C12.554 4.7206 12.7121 5.10213 12.7121 5.49996V6.41614H9.76276C8.93828 6.41614 8.01276 7.0409 8.01276 8.11074V9.88917C8.01276 10.959 8.93828 11.5838 9.76276 11.5838H12.7121V12.4999C12.7121 12.8978 12.554 13.2793 12.2727 13.5606C11.9914 13.8419 11.6099 13.9999 11.2121 13.9999L1.5 14C1.10217 14 0.720644 13.8419 0.43934 13.5606C0.158035 13.2793 0 12.8978 0 12.5V4.35474ZM9.76276 7.66614H13.2628C13.5389 7.66614 13.7628 7.86519 13.7628 8.11074V9.88917C13.7628 10.1347 13.5389 10.3338 13.2628 10.3338H9.76276C9.48661 10.3338 9.26276 10.1347 9.26276 9.88917V8.11074C9.26276 7.86519 9.48661 7.66614 9.76276 7.66614Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="withdraw-wallet-clip">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
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

function formatAddress(address: string) {
  if (address.length <= 9) return address
  return `${address.slice(0, 3)}...${address.slice(-3)}`
}

function sanitizeAmount(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '')
  const parts = normalized.split('.')
  if (parts.length <= 1) return normalized
  return `${parts[0]}.${parts.slice(1).join('')}`
}

export function WithdrawModal({ isOpen, onClose, address, walletConnected, balance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')

  const amountValue = useMemo(() => {
    const numeric = Number(amount)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
  }, [amount])

  const canWithdraw = walletConnected && amountValue > 0 && balance >= MIN_WITHDRAW && amountValue <= balance

  const handleAmountChange = (value: string) => {
    setAmount(sanitizeAmount(value))
  }

  const handleMax = () => {
    hapticLight()
    setAmount(balance > 0 ? String(balance) : '0')
  }

  const handleWithdraw = () => {
    if (!canWithdraw) return
    hapticLight()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw"
      className="balance-flow-modal__sheet"
      bodyClassName="balance-flow-modal__body"
    >
      <div className="balance-flow-modal">
        <div className="balance-flow-modal__card">
          {!walletConnected ? (
            <div className="balance-flow-modal__connectBlock">
              <p>Connect your wallet to withdraw funds.</p>
            </div>
          ) : (
            <>
              <div className="balance-flow-modal__walletSection">
                <div className="balance-flow-modal__walletCaption">Connected wallet</div>
                <div className="balance-flow-modal__walletPill">
                  <WalletIcon />
                  <span>{formatAddress(address)}</span>
                </div>
              </div>

              <div className="balance-flow-modal__withdrawAmountWrap">
                <div className="balance-flow-modal__amountWrap">
                  <div className="balance-flow-modal__amountRow">
                    <input
                      inputMode="decimal"
                      className="balance-flow-modal__amountInput"
                      value={amount}
                      onChange={(event) => handleAmountChange(event.target.value)}
                      placeholder="0"
                      style={{ width: `${Math.max(amount.length || 1, 1)}ch` }}
                      aria-label="Withdraw amount"
                    />
                    <span className="balance-flow-modal__amountUnit">GRAM</span>
                  </div>
                  <button type="button" className="balance-flow-modal__maxBtn" onClick={handleMax}>
                    Max
                  </button>
                </div>
              </div>

              <div className="balance-flow-modal__limits">
                <div className="balance-flow-modal__limitCard">
                  <div className="balance-flow-modal__limitLabel">Transaction limit</div>
                  <div className="balance-flow-modal__limitValue">
                    <GramIcon />
                  </div>
                </div>
                <div className="balance-flow-modal__limitCard">
                  <div className="balance-flow-modal__limitLabel">Daily limit</div>
                  <div className="balance-flow-modal__limitValue">
                    <span>/</span>
                    <GramIcon />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="balance-flow-modal__submitBtn"
                disabled={!canWithdraw}
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
