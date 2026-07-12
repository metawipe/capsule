import { Modal } from '@/shared/ui/Modal'

import './balance-modal.css'

import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

import { hapticLight } from '@/integrations/telegram/twa'

import { useEffect, useMemo, useRef, useState } from 'react'

import { WalletDetailModal } from './WalletDetailModal'

import { DepositModal } from './DepositModal'

import { WithdrawModal } from './WithdrawModal'



const MODAL_SWAP_MS = 400



interface BalanceModalProps {

  isOpen: boolean

  onClose: () => void

  balance: number

}



function WalletIcon() {

  return (

    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">

      <g clipPath="url(#balance-wallet-clip)">

        <path

          fillRule="evenodd"

          clipRule="evenodd"

          d="M0 4.35474C0 2.42174 1.567 0.854736 3.5 0.854736H10C10.2761 0.854736 10.5 1.07859 10.5 1.35474V2.75269H3.35547C3.01029 2.75269 2.73047 3.03251 2.73047 3.37769C2.73047 3.72286 3.01029 4.00269 3.35547 4.00269H10.9396C10.9594 4.00269 10.979 4.00176 10.9983 3.99996H11.2121C11.6099 3.99996 11.9914 4.15799 12.2727 4.4393C12.554 4.7206 12.7121 5.10213 12.7121 5.49996V6.41614H9.76276C8.93828 6.41614 8.01276 7.0409 8.01276 8.11074V9.88917C8.01276 10.959 8.93828 11.5838 9.76276 11.5838H12.7121V12.4999C12.7121 12.8978 12.554 13.2793 12.2727 13.5606C11.9914 13.8419 11.6099 13.9999 11.2121 13.9999L1.5 14C1.10217 14 0.720644 13.8419 0.43934 13.5606C0.158035 13.2793 0 12.8978 0 12.5V4.35474ZM9.76276 7.66614H13.2628C13.5389 7.66614 13.7628 7.86519 13.7628 8.11074V9.88917C13.7628 10.1347 13.5389 10.3338 13.2628 10.3338H9.76276C9.48661 10.3338 9.26276 10.1347 9.26276 9.88917V8.11074C9.26276 7.86519 9.48661 7.66614 9.76276 7.66614Z"

          fill="currentColor"

        />

      </g>

      <defs>

        <clipPath id="balance-wallet-clip">

          <rect width="14" height="14" fill="white" />

        </clipPath>

      </defs>

    </svg>

  )

}



function PlusCircleIcon() {

  return (

    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">

      <g clipPath="url(#balance-plus-clip)">

        <path

          fillRule="evenodd"

          clipRule="evenodd"

          d="M13 6.5C13 10.0899 10.0899 13 6.5 13C2.91015 13 0 10.0899 0 6.5C0 2.91015 2.91015 0 6.5 0C10.0899 0 13 2.91015 13 6.5ZM6.5 3.01786C6.88462 3.01786 7.19643 3.32966 7.19643 3.71429V5.80357H9.28571C9.67033 5.80357 9.98214 6.11538 9.98214 6.5C9.98214 6.88462 9.67033 7.19643 9.28571 7.19643H7.19643V9.28571C7.19643 9.67033 6.88462 9.98214 6.5 9.98214C6.11538 9.98214 5.80357 9.67033 5.80357 9.28571V7.19643H3.71429C3.32966 7.19643 3.01786 6.88462 3.01786 6.5C3.01786 6.11538 3.32966 5.80357 3.71429 5.80357H5.80357V3.71429C5.80357 3.32966 6.11538 3.01786 6.5 3.01786Z"

          fill="currentColor"

        />

      </g>

      <defs>

        <clipPath id="balance-plus-clip">

          <rect width="13" height="13" fill="white" />

        </clipPath>

      </defs>

    </svg>

  )

}



function ChevronRightIcon() {

  return (

    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true" className="balance-modal__walletChevron">

      <path

        d="M3.99993 2.23324L1.43326 4.7999C1.29993 4.93324 1.14437 4.99712 0.966593 4.99157C0.788815 4.98601 0.63326 4.92212 0.499926 4.7999C0.366593 4.66657 0.297149 4.50824 0.291593 4.3249C0.286038 4.14157 0.349926 3.98324 0.48326 3.8499L3.04993 1.28324C3.30548 1.02768 3.62215 0.899902 3.99993 0.899902C4.3777 0.899902 4.69437 1.02768 4.94993 1.28324L7.51659 3.8499C7.64993 3.98324 7.71382 4.14157 7.70826 4.3249C7.7027 4.50824 7.63326 4.66657 7.49993 4.7999C7.36659 4.92212 7.21104 4.98601 7.03326 4.99157C6.85548 4.99712 6.69993 4.93324 6.56659 4.7999L3.99993 2.23324Z"

        fill="currentColor"

      />

    </svg>

  )

}



function ArrowUpIcon() {

  return (

    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" aria-hidden="true">

      <g clipPath="url(#balance-arrow-clip)">

        <path

          fillRule="evenodd"

          clipRule="evenodd"

          d="M9.74488 0.20921C10.0238 -0.0697366 10.4761 -0.0697366 10.755 0.20921L15.7551 5.20921C15.9594 5.4135 16.0204 5.72071 15.9098 5.98763C15.7992 6.25454 15.5388 6.42857 15.2499 6.42857H11.6785V18.5714C11.6785 19.3604 11.0389 20 10.2499 20C9.46096 20 8.82138 19.3604 8.82138 18.5714V6.42857H5.24995C4.96105 6.42857 4.70059 6.25454 4.59004 5.98763C4.47948 5.72071 4.54059 5.4135 4.74488 5.20921L9.74488 0.20921Z"

          fill="currentColor"

        />

      </g>

      <defs>

        <clipPath id="balance-arrow-clip">

          <rect width="20" height="20" fill="white" transform="translate(0.25)" />

        </clipPath>

      </defs>

    </svg>

  )

}



function BalanceCardArt() {

  return (

    <svg

      className="balance-modal__cardArt"

      viewBox="0 0 335 140"

      fill="none"

      xmlns="http://www.w3.org/2000/svg"

      aria-hidden="true"

      preserveAspectRatio="xMidYMid slice"

    >

      <g filter="url(#balance-card-blur)">

        <circle cx="327" cy="147" r="147" fill="#1689FF" />

      </g>

      <path

        opacity="0.12"

        d="M270.355 7.1238C268.152 7.24492 263.066 7.92318 260.455 8.444C248.452 10.83 237.897 15.7717 228.53 23.4022C226.538 25.0252 222.269 29.1796 220.524 31.2023C213.78 39.0265 209.004 47.8077 206.071 57.7879C204.215 64.0861 203.918 66.4358 204.017 73.5333C204.054 76.1253 204.116 83.3803 204.153 89.6422C204.19 95.904 204.239 103.946 204.277 107.507C204.314 111.068 204.363 118.347 204.4 123.677C204.635 159.818 204.697 165.438 204.908 166.662C205.143 168.042 205.601 169.411 206.096 170.271C207.754 173.093 210.637 174.898 214.782 175.734C215.995 175.964 216.527 176 219.311 176C222.652 176 223.989 175.879 227.354 175.261C230.671 174.656 233.331 173.771 235.769 172.451C237.91 171.288 241.795 169.06 242.872 168.369C243.911 167.703 245.272 166.88 248.514 164.942C250.469 163.779 254.107 161.974 256.434 161.005C260.171 159.455 264.774 158.353 268.882 158.014C271.283 157.808 279.994 157.929 281.863 158.183C285.637 158.692 289.3 159.661 292.566 161.005C294.868 161.962 298.518 163.767 300.486 164.942C303.728 166.88 305.089 167.703 306.128 168.369C307.205 169.06 311.09 171.288 313.231 172.451C315.669 173.771 318.329 174.656 321.646 175.261C325.011 175.879 326.348 176 329.689 176C332.473 176 333.005 175.964 334.218 175.734C338.363 174.898 341.246 173.093 342.904 170.271C343.399 169.411 343.857 168.042 344.092 166.662C344.303 165.438 344.365 159.818 344.6 123.677C344.637 118.347 344.686 111.068 344.723 107.507C344.761 103.946 344.81 95.904 344.847 89.6422C344.884 83.3803 344.946 76.1253 344.983 73.5333C345.082 66.4358 344.785 64.0861 342.929 57.7879C339.996 47.8077 335.22 39.0265 328.476 31.2023C326.731 29.1796 322.462 25.0252 320.47 23.4022C313.404 17.649 306.005 13.5916 297.454 10.7937C292.814 9.2676 288.866 8.37132 283.595 7.65672C278.918 7.01479 274.97 6.85734 270.355 7.1238Z"

        fill="white"

      />

      <defs>

        <filter id="balance-card-blur" x="80" y="-100" width="494" height="494" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">

          <feFlood floodOpacity="0" result="BackgroundImageFix" />

          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />

          <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />

        </filter>

      </defs>

    </svg>

  )

}



export function BalanceModal({ isOpen, onClose, balance }: BalanceModalProps) {

  const [tonConnectUI] = useTonConnectUI()

  const wallet = useTonWallet()

  const [showBalance, setShowBalance] = useState(false)

  const [showWallet, setShowWallet] = useState(false)

  const [showDeposit, setShowDeposit] = useState(false)

  const [showWithdraw, setShowWithdraw] = useState(false)

  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)



  useEffect(() => {

    if (isOpen) {

      setShowBalance(true)

      setShowWallet(false)

      setShowDeposit(false)

      setShowWithdraw(false)

    } else {

      setShowBalance(false)

      setShowWallet(false)

      setShowDeposit(false)

      setShowWithdraw(false)

    }

  }, [isOpen])



  useEffect(() => {

    return () => {

      if (swapTimerRef.current) clearTimeout(swapTimerRef.current)

    }

  }, [])



  const walletAddress = wallet?.account?.address ?? ''



  const truncatedAddress = useMemo(() => {

    if (!walletAddress) return ''

    if (walletAddress.length <= 13) return walletAddress

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-5)}`

  }, [walletAddress])



  const openChildModal = (open: () => void) => {

    setShowBalance(false)

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current)

    swapTimerRef.current = setTimeout(open, MODAL_SWAP_MS)

  }



  const handleConnect = () => {

    hapticLight()

    tonConnectUI.openModal()

  }



  const handleDepositOpen = () => {

    hapticLight()

    openChildModal(() => setShowDeposit(true))

  }



  const handleWithdrawOpen = () => {

    hapticLight()

    openChildModal(() => setShowWithdraw(true))

  }



  const handleBalanceClose = () => {

    setShowBalance(false)

    onClose()

  }



  const handleWalletOpen = () => {

    hapticLight()

    openChildModal(() => setShowWallet(true))

  }



  const handleChildClose = () => {

    setShowWallet(false)

    setShowDeposit(false)

    setShowWithdraw(false)

    onClose()

  }



  const displayBalance = balance.toFixed(2)



  return (

    <>

      <Modal

        isOpen={showBalance}

        onClose={handleBalanceClose}

        title="Balance"

        className="balance-modal__sheet"

        bodyClassName="balance-modal__body"

      >

        <div className="balance-modal">

          <div className="balance-modal__shell">

            <div className="balance-modal__walletBar">

              {wallet ? (

                <>

                  <div className="balance-modal__walletStatus">

                    <WalletIcon />

                    <span className="balance-modal__walletLabel">Your wallet</span>

                    <span className="balance-modal__walletAddress">{truncatedAddress}</span>

                  </div>

                  <button

                    type="button"

                    className="balance-modal__walletBalanceBtn glass-shadow"

                    onClick={handleWalletOpen}

                  >

                    <span className="balance-modal__walletBalanceValue">{displayBalance}</span>

                    <span className="balance-modal__walletBalanceUnit">GRAM</span>

                    <ChevronRightIcon />

                  </button>

                </>

              ) : (

                <>

                  <div className="balance-modal__walletStatus">

                    <WalletIcon />

                    <span>Wallet not connected</span>

                  </div>

                  <button type="button" className="balance-modal__connectBtn glass-shadow" onClick={handleConnect}>

                    Connect

                    <PlusCircleIcon />

                  </button>

                </>

              )}

            </div>



            <div className="balance-modal__card">

              <BalanceCardArt />

              <div className="balance-modal__cardContent">

                <div className="balance-modal__balanceBlock">

                  <div className="balance-modal__balanceLabel">Capsule wallet balance</div>

                  <div className="balance-modal__balanceAmount">

                    {displayBalance} <span className="balance-modal__balanceUnit">GRAM</span>

                  </div>

                </div>



                <div className="balance-modal__actions">

                  <button type="button" className="balance-modal__actionBtn balance-modal__actionBtn--deposit glass-shadow" onClick={handleDepositOpen}>

                    Deposit

                    <PlusCircleIcon />

                  </button>

                  <button type="button" className="balance-modal__actionBtn balance-modal__actionBtn--withdraw glass-shadow" onClick={handleWithdrawOpen}>

                    Withdraw

                    <ArrowUpIcon />

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </Modal>



      <WalletDetailModal

        isOpen={showWallet}

        onClose={handleChildClose}

        address={walletAddress}

        walletBalance={balance}

      />



      <DepositModal

        isOpen={showDeposit}

        onClose={handleChildClose}

        address={walletAddress}

        walletConnected={!!wallet}

        walletBalance={balance}

      />



      <WithdrawModal

        isOpen={showWithdraw}

        onClose={handleChildClose}

        address={walletAddress}

        walletConnected={!!wallet}

        balance={balance}

      />

    </>

  )

}


