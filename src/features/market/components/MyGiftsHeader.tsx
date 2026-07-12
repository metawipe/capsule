import { useMemo, useState } from 'react'
import { hapticLight } from '@/integrations/telegram/twa'
import { useMyGiftsTab, type MyGiftsSubTab } from '@/features/market/model/MyGiftsTabContext'
import { useUserContext } from '@/features/profile/model/UserContext'
import { AddGiftModal } from './AddGiftModal'
import './my-gifts-header.css'

function AddIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <g clipPath="url(#my-gifts-add-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 6.5C13 10.0899 10.0899 13 6.5 13C2.91015 13 0 10.0899 0 6.5C0 2.91015 2.91015 0 6.5 0C10.0899 0 13 2.91015 13 6.5ZM6.5 3.01786C6.88462 3.01786 7.19643 3.32966 7.19643 3.71429V5.80357H9.28571C9.67033 5.80357 9.98214 6.11538 9.98214 6.5C9.98214 6.88462 9.67033 7.19643 9.28571 7.19643H7.19643V9.28571C7.19643 9.67033 6.88462 9.98214 6.5 9.98214C6.11538 9.98214 5.80357 9.67033 5.80357 9.28571V7.19643H3.71429C3.32966 7.19643 3.01786 6.88462 3.01786 6.5C3.01786 6.11538 3.32966 5.80357 3.71429 5.80357H5.80357V3.71429C5.80357 3.32966 6.11538 3.01786 6.5 3.01786Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="my-gifts-add-clip">
          <rect width="13" height="13" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function WithdrawIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.54549 0.188289C8.79654 -0.0627629 9.20357 -0.0627629 9.45462 0.188289L13.9547 4.68829C14.1385 4.87215 14.1934 5.14864 14.0939 5.38887C13.9944 5.62909 13.76 5.78571 13.5001 5.78571H10.2858V16.7143C10.2858 17.4244 9.71013 18 9.00005 18C8.28997 18 7.71434 17.4244 7.71434 16.7143V5.78571H4.50005C4.24004 5.78571 4.00563 5.62909 3.90613 5.38887C3.80663 5.14864 3.86163 4.87215 4.04549 4.68829L8.54549 0.188289Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <g clipPath="url(#my-gifts-send-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.4454 0.251051C10.1106 -0.0836838 9.56793 -0.0836838 9.23319 0.251051C8.89846 0.585786 8.89846 1.1285 9.23319 1.46323L10.0557 2.28571H7.55357C7.23798 2.28571 6.98214 2.54155 6.98214 2.85714V8.57143C6.98214 8.88702 7.23798 9.14286 7.55357 9.14286H10.8393V4C10.8393 3.60551 11.1591 3.28571 11.5536 3.28571C11.9481 3.28571 12.2679 3.60551 12.2679 4V9.14286H15.5536C15.8691 9.14286 16.125 8.88702 16.125 8.57143V2.85714C16.125 2.54155 15.8691 2.28571 15.5536 2.28571H13.0515L13.8739 1.46323C14.2087 1.1285 14.2087 0.585786 13.8739 0.251051C13.5392 -0.0836838 12.9965 -0.0836838 12.6618 0.251051L11.5536 1.35925L10.4454 0.251051ZM2.23146 8H0.125V12.5714L2.21463 14.661C3.07194 15.5184 4.2347 16 5.44711 16H12.125C13.0717 16 13.8393 15.2325 13.8393 14.2857C13.8393 13.339 13.0717 12.5714 12.125 12.5714H8.95161C8.84134 12.9447 8.6389 13.2966 8.34429 13.5912C7.40261 14.5329 5.87585 14.5329 4.93417 13.5912L3.27701 11.9341C2.99806 11.6551 2.99806 11.2029 3.27701 10.9239C3.55596 10.645 4.00822 10.645 4.28716 10.9239L5.94433 12.581C6.32811 12.9649 6.95035 12.9649 7.33414 12.581C7.67987 12.2353 7.71415 11.6961 7.43699 11.312L5.46394 9.33894C4.60663 8.48163 3.44387 8 2.23146 8Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="my-gifts-send-clip">
          <rect width="16" height="16" fill="white" transform="translate(0.125)" />
        </clipPath>
      </defs>
    </svg>
  )
}

function SellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <g clipPath="url(#my-gifts-sell-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.00551 0.0887451C4.44574 0.0887451 4.81439 0.422231 4.85837 0.860254L5.18352 4.09857H13.8114C14.0799 4.08889 14.3466 4.14546 14.5881 4.26339C14.833 4.38299 15.0441 4.56187 15.2023 4.78378C15.3533 4.99297 15.4528 5.23493 15.4925 5.48993C15.5322 5.74582 15.5107 6.00751 15.4296 6.25347L15.4291 6.25481L14.0139 10.5109L14.0134 10.5127C13.8995 10.8512 13.6782 11.1432 13.3829 11.344C13.092 11.5417 12.7454 11.6404 12.3944 11.6256H5.70717C5.31402 11.6292 4.93269 11.491 4.63305 11.2363C4.33251 10.9809 4.13442 10.6254 4.07528 10.2354C4.07385 10.226 4.07265 10.2165 4.07169 10.207L3.52055 4.72717C3.51853 4.70706 3.51758 4.68695 3.51768 4.66693L3.23013 1.80303H1.34543C0.872038 1.80303 0.488281 1.41927 0.488281 0.945888C0.488281 0.472501 0.872038 0.0887451 1.34543 0.0887451H4.00551ZM12.1765 13.3078C12.9199 13.3078 13.5226 13.9104 13.5226 14.6538C13.5226 15.3973 12.9199 16 12.1765 16C11.433 16 10.8303 15.3973 10.8303 14.6538C10.8303 13.9104 11.433 13.3078 12.1765 13.3078ZM7.64145 14.6538C7.64145 13.9104 7.03878 13.3078 6.29533 13.3078C5.55189 13.3078 4.94921 13.9104 4.94921 14.6538C4.94921 15.3973 5.55189 16 6.29533 16C7.03878 16 7.64145 15.3973 7.64145 14.6538ZM10.9983 7.28573C11.3928 7.28573 11.7126 7.60553 11.7126 8.00002C11.7126 8.39451 11.3928 8.7143 10.9983 8.7143H7.99993C7.60545 8.7143 7.28565 8.39451 7.28565 8.00002C7.28565 7.60553 7.60545 7.28573 7.99993 7.28573H10.9983Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="my-gifts-sell-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function CancelListingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <g clipPath="url(#my-gifts-cancel-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 0C3.54535 0 3.1093 0.180611 2.78782 0.502103C2.46633 0.823593 2.28571 1.25963 2.28571 1.71429V9.42801H6.57146C7.83383 9.42801 8.85718 10.4514 8.85718 11.7137C8.85718 12.9761 7.83383 13.9994 6.57146 13.9994H2.28571V14.2857C2.28571 14.7403 2.46633 15.1765 2.78782 15.4979C3.1093 15.8194 3.54534 16 4 16H14.2857C14.7403 16 15.1765 15.8194 15.4979 15.4979C15.8194 15.1765 16 14.7403 16 14.2857V5.14286C16 4.9913 15.9398 4.84595 15.8327 4.7388L11.2612 0.167368C11.154 0.0602039 11.0087 0 10.8571 0H4ZM7.42857 11.7137C7.42857 11.2403 7.04481 10.8566 6.57143 10.8566H0.857143C0.383755 10.8566 0 11.2403 0 11.7137C0 12.1871 0.383755 12.5709 0.857143 12.5709H6.57143C7.04481 12.5709 7.42857 12.1871 7.42857 11.7137Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="my-gifts-cancel-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ChangePriceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="my-gifts-header__actionIcon">
      <g clipPath="url(#my-gifts-price-clip)">
        <path
          d="M12.2457 -0.000976562C12.0174 -0.000976562 11.7913 0.0446497 11.5808 0.133223C11.3716 0.221246 11.182 0.34992 11.023 0.511769L1.60837 9.8807C1.53847 9.95025 1.48776 10.0367 1.46118 10.1317L0.021177 15.2745C-0.0344859 15.4733 0.0214047 15.6867 0.167381 15.8327C0.313358 15.9787 0.52672 16.0345 0.725517 15.9789L5.86838 14.5389C5.96333 14.5123 6.04978 14.4615 6.11934 14.3917L15.4881 4.97717L15.4897 4.97563C15.6496 4.81657 15.7766 4.62752 15.8633 4.41929C15.9504 4.2104 15.9952 3.98633 15.9952 3.76003C15.9952 3.53372 15.9504 3.30965 15.8633 3.10075C15.7766 2.89252 15.6496 2.70345 15.4897 2.54441L15.4881 2.54288L13.4696 0.512964C13.3104 0.350552 13.1203 0.221462 12.9106 0.133223C12.7001 0.0446497 12.4741 -0.000976562 12.2457 -0.000976562Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="my-gifts-price-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function MyGiftsHeader() {
  const { subTab: giftsTab, setSubTab: setGiftsTab } = useMyGiftsTab()
  const { myGifts } = useUserContext()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { unlistedGifts, listedGifts, unlistedCount, listedCount } = useMemo(() => {
    const listed = myGifts.filter((gift) => gift.isListed)
    const unlisted = myGifts.filter((gift) => !gift.isListed)
    return {
      unlistedGifts: unlisted,
      listedGifts: listed,
      unlistedCount: unlisted.length,
      listedCount: listed.length,
    }
  }, [myGifts])

  const activeGifts = giftsTab === 'listed' ? listedGifts : unlistedGifts
  const hasActiveGifts = activeGifts.length > 0

  const handleTabChange = (tab: MyGiftsSubTab) => {
    if (giftsTab === tab) return
    hapticLight()
    setGiftsTab(tab)
  }
  const handleAdd = () => {
    hapticLight()
    setIsAddModalOpen(true)
  }

  const handleAction = (action: string) => {
    hapticLight()
    console.log(`My gifts action: ${action}`)
  }

  return (
    <>
      <div className="my-gifts-header" data-subtab={giftsTab}>
        <div
          className="my-gifts-header__tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <div
            className="my-gifts-header__tabsIndicator"
            data-active={giftsTab}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={giftsTab === 'unlisted'}
            className={`my-gifts-header__tab ${giftsTab === 'unlisted' ? 'my-gifts-header__tab--active' : ''}`}
            onClick={() => handleTabChange('unlisted')}
            onPointerDown={(event) => event.stopPropagation()}
          >            <span className="my-gifts-header__tabContent">
              <span className="my-gifts-header__tabLabel">Unlisted</span>
              <span className="my-gifts-header__tabBadge">{unlistedCount}</span>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={giftsTab === 'listed'}
            className={`my-gifts-header__tab ${giftsTab === 'listed' ? 'my-gifts-header__tab--active' : ''}`}
            onClick={() => handleTabChange('listed')}
            onPointerDown={(event) => event.stopPropagation()}
          >            <span className="my-gifts-header__tabContent">
              <span className="my-gifts-header__tabLabel">Listed</span>
              <span className="my-gifts-header__tabBadge">{listedCount}</span>
            </span>
          </button>
        </div>

        <div className="my-gifts-header__actionsShell" onPointerDown={(event) => event.stopPropagation()}>
          {giftsTab === 'unlisted' ? (
            <div className="my-gifts-header__actions">
              <button type="button" className="my-gifts-header__action" onClick={handleAdd}>
                <AddIcon />
                <span>Add</span>
              </button>
              <button
                type="button"
                className="my-gifts-header__action"
                onClick={() => handleAction('withdraw')}
                disabled={!hasActiveGifts}
              >
                <WithdrawIcon />
                <span>Withdraw</span>
              </button>
              <button
                type="button"
                className="my-gifts-header__action"
                onClick={() => handleAction('send')}
                disabled={!hasActiveGifts}
              >
                <SendIcon />
                <span>Send</span>
              </button>
              <button
                type="button"
                className="my-gifts-header__action"
                onClick={() => handleAction('sell')}
                disabled={!hasActiveGifts}
              >
                <SellIcon />
                <span>Sell</span>
              </button>
            </div>
          ) : (
            <div className="my-gifts-header__actions my-gifts-header__actions--listed">
              <button
                type="button"
                className="my-gifts-header__action my-gifts-header__action--listed"
                onClick={() => handleAction('cancel-listing')}
                disabled={!hasActiveGifts}
              >
                <CancelListingIcon />
                <span>Cancel listing</span>
              </button>
              <button
                type="button"
                className="my-gifts-header__action my-gifts-header__action--listed"
                onClick={() => handleAction('change-price')}
                disabled={!hasActiveGifts}
              >
                <ChangePriceIcon />
                <span>Change price</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AddGiftModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  )
}
