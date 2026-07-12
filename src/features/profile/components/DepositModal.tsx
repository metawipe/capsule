import { useMemo, useState } from 'react'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { Modal } from '@/shared/ui/Modal'
import { hapticLight } from '@/integrations/telegram/twa'
import './balance-flow-modal.css'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  walletConnected: boolean
  walletBalance?: number
}

const QUICK_AMOUNTS = [10, 50, 100] as const

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <g clipPath="url(#deposit-wallet-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 4.35474C0 2.42174 1.567 0.854736 3.5 0.854736H10C10.2761 0.854736 10.5 1.07859 10.5 1.35474V2.75269H3.35547C3.01029 2.75269 2.73047 3.03251 2.73047 3.37769C2.73047 3.72286 3.01029 4.00269 3.35547 4.00269H10.9396C10.9594 4.00269 10.979 4.00176 10.9983 3.99996H11.2121C11.6099 3.99996 11.9914 4.15799 12.2727 4.4393C12.554 4.7206 12.7121 5.10213 12.7121 5.49996V6.41614H9.76276C8.93828 6.41614 8.01276 7.0409 8.01276 8.11074V9.88917C8.01276 10.959 8.93828 11.5838 9.76276 11.5838H12.7121V12.4999C12.7121 12.8978 12.554 13.2793 12.2727 13.5606C11.9914 13.8419 11.6099 13.9999 11.2121 13.9999L1.5 14C1.10217 14 0.720644 13.8419 0.43934 13.5606C0.158035 13.2793 0 12.8978 0 12.5V4.35474ZM9.76276 7.66614H13.2628C13.5389 7.66614 13.7628 7.86519 13.7628 8.11074V9.88917C13.7628 10.1347 13.5389 10.3338 13.2628 10.3338H9.76276C9.48661 10.3338 9.26276 10.1347 9.26276 9.88917V8.11074C9.26276 7.86519 9.48661 7.66614 9.76276 7.66614Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="deposit-wallet-clip">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function GramChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect width="12" height="12" rx="6" fill="#30A1F5" />
      <path
        d="M7.4684 3.33936H4.97C4.6373 3.33936 4.4709 3.33936 4.3204 3.38592C4.1872 3.42709 4.0637 3.49454 3.957 3.58428C3.8364 3.6858 3.7466 3.82572 3.5666 4.10556L2.7724 5.34096C2.6536 5.52576 2.5941 5.61828 2.578 5.7156C2.5637 5.8014 2.5732 5.8896 2.6054 5.97036C2.6418 6.06204 2.7195 6.13968 2.875 6.2952L5.8258 9.246C5.9636 9.38376 6.0323 9.45263 6.1118 9.47831C6.1816 9.50111 6.2567 9.50111 6.3266 9.47831C6.4059 9.45263 6.4748 9.38376 6.6124 9.24612L9.5633 6.2952C9.7188 6.13968 9.7965 6.06204 9.833 5.97036C9.8651 5.88951 9.8746 5.80142 9.8603 5.7156C9.8442 5.6184 9.7847 5.52588 9.6659 5.34096L8.8718 4.10556C8.6918 3.82572 8.6018 3.6858 8.4813 3.58428C8.3746 3.49454 8.2511 3.42709 8.1179 3.38592C7.9673 3.33936 7.8012 3.33936 7.4684 3.33936Z"
        fill="white"
      />
      <path
        d="M6.9952 4.31371C7.0358 4.20403 7.191 4.20403 7.2316 4.31371L7.5121 5.07175C7.5289 5.11735 7.5649 5.15323 7.6104 5.17015L8.3684 5.45059C8.4781 5.49115 8.4781 5.64619 8.3684 5.68699L7.6104 5.96743C7.5648 5.98423 7.5289 6.02023 7.512 6.06559L7.2315 6.82363C7.191 6.93343 7.0358 6.93343 6.9951 6.82363L6.7147 6.06559C6.6979 6.02011 6.6619 5.98423 6.6164 5.96743L5.8585 5.68687C5.7487 5.64631 5.7487 5.49115 5.8585 5.45047L6.6164 5.17003C6.662 5.15323 6.6979 5.11723 6.7148 5.07175L6.9952 4.31371Z"
        fill="#30A1F5"
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

export function DepositModal({ isOpen, onClose, address, walletConnected, walletBalance = 0 }: DepositModalProps) {
  const [tonConnectUI] = useTonConnectUI()
  const [amount, setAmount] = useState('')

  const amountValue = useMemo(() => {
    const numeric = Number(amount)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
  }, [amount])

  const TON_DEPOSIT_ADDRESS = import.meta.env.VITE_TON_DEPOSIT_ADDRESS || 'UQDD9qBiVAP0eo55QoKtg90Pr5D_pw45j4iAccxZsXfbFH1W'
  const canDeposit = walletConnected && amountValue > 0 && !!TON_DEPOSIT_ADDRESS

  const handleConnect = () => {
    hapticLight()
    tonConnectUI.openModal()
  }

  const handleAmountChange = (value: string) => {
    setAmount(sanitizeAmount(value))
  }

  const handleQuickAmount = (value: number | 'all') => {
    hapticLight()
    if (value === 'all') {
      setAmount(walletBalance > 0 ? String(walletBalance) : '0')
      return
    }
    setAmount(String(value))
  }

  const handleDeposit = async () => {
    if (!canDeposit) return
    hapticLight()
    try {
      const nanoAmount = Math.round(amountValue * 1e9).toString()
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: TON_DEPOSIT_ADDRESS, amount: nanoAmount }],
      })
    } catch (error) {
      console.error('TON deposit error', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit"
      className="balance-flow-modal__sheet"
      bodyClassName="balance-flow-modal__body"
    >
      <div className="balance-flow-modal">
        <div className="balance-flow-modal__card">
          {!walletConnected ? (
            <div className="balance-flow-modal__connectBlock">
              <p>Connect your wallet to deposit funds.</p>
              <button type="button" className="balance-flow-modal__connectBtn" onClick={handleConnect}>
                Connect wallet
              </button>
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

              <div className="balance-flow-modal__amountWrap">
                <div className="balance-flow-modal__amountRow">
                  <input
                    inputMode="decimal"
                    className="balance-flow-modal__amountInput"
                    value={amount}
                    onChange={(event) => handleAmountChange(event.target.value)}
                    placeholder="0"
                    style={{ width: `${Math.max(amount.length || 1, 1)}ch` }}
                    aria-label="Deposit amount"
                  />
                  <span className="balance-flow-modal__amountUnit">GRAM</span>
                </div>
              </div>

              <div className="balance-flow-modal__chips">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="balance-flow-modal__chip"
                    onClick={() => handleQuickAmount(value)}
                  >
                    <GramChipIcon />
                    {value}
                  </button>
                ))}
                <button type="button" className="balance-flow-modal__chip" onClick={() => handleQuickAmount('all')}>
                  <GramChipIcon />
                  All
                </button>
              </div>

              <button
                type="button"
                className="balance-flow-modal__submitBtn"
                disabled={!canDeposit}
                onClick={handleDeposit}
              >
                Deposit
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
