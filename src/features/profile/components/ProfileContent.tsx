import { useMemo } from 'react'
import type { BottomTab } from '@/features/navigation/BottomNav'
import { hapticLight } from '@/integrations/telegram/twa'
import { useTelegramUser } from '@/shared/hooks/useTelegramUser'
import { useUserContext } from '@/features/profile/model/UserContext'
import defaultAvatar from '@/shared/assets/Capsule.jpg'
import './profile-content.css'

interface ProfileContentProps {
  onTabChange?: (tab: BottomTab) => void
}

function TonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6382 1.4856C11.3423 1.4856 11.6948 1.48526 12.0132 1.58381C12.295 1.67098 12.5565 1.81462 12.7822 2.00457C13.037 2.2191 13.2275 2.51509 13.6081 3.10725L15.2889 5.72109C15.5404 6.11245 15.6665 6.30869 15.7007 6.51461C15.7308 6.69622 15.7107 6.88261 15.6427 7.05368C15.5656 7.24758 15.4012 7.41229 15.0724 7.74118L8.82682 13.9867C8.53577 14.2779 8.38979 14.4233 8.2219 14.4778C8.07406 14.5258 7.91439 14.5258 7.76655 14.4778C7.59876 14.4231 7.4527 14.2776 7.16164 13.9867L0.917217 7.74118C0.588097 7.41222 0.422908 7.2476 0.345788 7.05368C0.277835 6.88264 0.257651 6.69618 0.287753 6.51461C0.321993 6.30885 0.448063 6.11245 0.699583 5.72109L2.38039 3.10725C2.76117 2.51495 2.95125 2.21801 3.20628 2.00345C3.43204 1.81343 3.69444 1.67097 3.97637 1.58381C4.29476 1.48539 4.64667 1.4856 5.35025 1.4856H10.6382ZM10.1371 3.5481C10.0513 3.3161 9.723 3.3161 9.63708 3.5481L9.04333 5.15189C9.02572 5.19951 8.99776 5.24322 8.96186 5.27912C8.92603 5.31485 8.8832 5.34304 8.83574 5.3606L7.23083 5.95323C6.99903 6.03926 6.99905 6.36829 7.23083 6.45435L8.83574 7.04698C8.88317 7.06453 8.92604 7.09276 8.96186 7.12845C8.99776 7.16436 9.02572 7.20807 9.04333 7.25569L9.63708 8.85948C9.72284 9.09164 10.0512 9.09164 10.1371 8.85948L10.7308 7.25569C10.7485 7.20807 10.7764 7.16436 10.8123 7.12845C10.8482 7.09264 10.892 7.06457 10.9395 7.04698L12.5433 6.45435C12.7755 6.36859 12.7755 6.03915 12.5433 5.95323L10.9395 5.3606C10.892 5.343 10.8482 5.31496 10.8123 5.27912C10.7764 5.24322 10.7485 5.19951 10.7308 5.15189L10.1371 3.5481Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g clipPath="url(#profile-gift-clip)">
        <path
          d="M4.65652 0.121104C4.3067 -0.109084 3.8433 -0.0014035 3.62149 0.361614C3.39967 0.724628 3.50343 1.20552 3.85325 1.43571L4.81103 2.06595H1.5C0.77791 2.06595 0 2.57345 0 3.42083V4.89114C0 5.68178 0.677231 6.17653 1.35446 6.23925C1.3487 6.24106 1.34298 6.24298 1.33731 6.245H6.375V3.5025H7.625V6.245H12.6627C12.657 6.24298 12.6513 6.24106 12.6455 6.23925C13.3228 6.17653 14 5.68178 14 4.89114V3.42083C14 2.57345 13.2221 2.06595 12.5 2.06595H9.18901L10.1468 1.43571C10.4966 1.20552 10.6004 0.724628 10.3786 0.361614C10.1567 -0.0014035 9.69335 -0.109084 9.34353 0.121104L7.00002 1.66319L4.65652 0.121104Z"
          fill="currentColor"
        />
        <path
          d="M13 7.54224H7.625V14.0001H11.5C11.8978 14.0001 12.2794 13.836 12.5607 13.5441C12.842 13.2522 13 12.8563 13 12.4434V7.54224Z"
          fill="currentColor"
        />
        <path
          d="M6.375 7.54224H1V12.4434C1 12.8563 1.15804 13.2522 1.43934 13.5441C1.72064 13.836 2.10217 14.0001 2.5 14.0001H6.375V7.54224Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="profile-gift-clip">
          <rect width="14" height="14" fill="white" fillOpacity="0.4" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M7.62628 6.75L4.49593 3.61964C4.34877 3.47249 4.2752 3.2852 4.2752 3.05779C4.2752 2.83037 4.34877 2.64308 4.49593 2.49593C4.64308 2.34877 4.83037 2.2752 5.05779 2.2752C5.2852 2.2752 5.47249 2.34877 5.61964 2.49593L9.31186 6.18814C9.39212 6.26841 9.44898 6.35536 9.48242 6.449C9.51587 6.54265 9.53259 6.64298 9.53259 6.75C9.53259 6.85702 9.51587 6.95735 9.48242 7.051C9.44898 7.14464 9.39212 7.23159 9.31186 7.31186L5.61964 11.0041C5.47249 11.1512 5.2852 11.2248 5.05779 11.2248C4.83037 11.2248 4.64308 11.1512 4.49593 11.0041C4.34877 10.8569 4.2752 10.6696 4.2752 10.4422C4.2752 10.2148 4.34877 10.0275 4.49593 9.88036L7.62628 6.75Z"
        fill="#6D6D71"
      />
    </svg>
  )
}

function ReferralIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="21" height="21" rx="8" fill="url(#profile-referral-gradient)" />
      <g clipPath="url(#profile-referral-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.2267 5.02314C9.9813 4.40928 11.0631 4.40928 11.8177 5.02314L11.9541 5.13404L12.1276 5.10616C13.088 4.95185 14.025 5.49276 14.3715 6.40168L14.4341 6.56589L14.5983 6.62851C15.5072 6.97509 16.0482 7.91198 15.8939 8.87241L15.8659 9.04593L15.9768 9.18226C16.5907 9.93687 16.5907 11.0187 15.9768 11.7733L15.8659 11.9096L15.8939 12.0832C16.0482 13.0436 15.5072 13.9805 14.5983 14.327L14.4341 14.3897L14.3715 14.5539C14.025 15.4628 13.088 16.0037 12.1276 15.8494L11.9541 15.8215L11.8177 15.9325C11.0631 16.5463 9.9813 16.5463 9.2267 15.9325L9.09036 15.8215L8.91685 15.8494C7.95641 16.0037 7.01952 15.4628 6.67294 14.5539L6.61033 14.3897L6.44612 14.327C5.5372 13.9805 4.99628 13.0436 5.1506 12.0832L5.17848 11.9096L5.06757 11.7733C4.45371 11.0187 4.45371 9.93687 5.06757 9.18226L5.17848 9.04593L5.1506 8.87241C4.99628 7.91198 5.5372 6.97509 6.44612 6.62851L6.61033 6.56589L6.67294 6.40168C7.01952 5.49276 7.95641 4.95185 8.91685 5.10616L9.09037 5.13404L9.2267 5.02314ZM13.0439 7.95612C12.8347 7.74691 12.4955 7.74691 12.2863 7.95612L8.00056 12.2418C7.79134 12.451 7.79134 12.7902 8.00056 12.9994C8.20976 13.2086 8.54896 13.2086 8.75817 12.9994L13.0439 8.71373C13.2531 8.50453 13.2531 8.16533 13.0439 7.95612ZM8.80793 7.90635C8.33454 7.90635 7.95079 8.29011 7.95079 8.7635C7.95079 9.23689 8.33454 9.62064 8.80793 9.62064C9.28132 9.62064 9.66508 9.23689 9.66508 8.7635C9.66508 8.29011 9.28132 7.90635 8.80793 7.90635ZM12.2365 11.3349C11.7631 11.3349 11.3794 11.7187 11.3794 12.1921C11.3794 12.6655 11.7631 13.0492 12.2365 13.0492C12.7099 13.0492 13.0937 12.6655 13.0937 12.1921C13.0937 11.7187 12.7099 11.3349 12.2365 11.3349Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient id="profile-referral-gradient" x1="10.5" y1="0" x2="10.5" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#49DF64" />
          <stop offset="1" stopColor="#2EA945" />
        </linearGradient>
        <clipPath id="profile-referral-clip">
          <rect width="12" height="12" fill="white" transform="translate(4.5 4.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function ProfileContent({ onTabChange }: ProfileContentProps) {
  const user = useTelegramUser()
  const { myGifts } = useUserContext()

  const username = user?.username ?? user?.first_name ?? 'Capsule'
  const avatarUrl = user?.photo_url || defaultAvatar
  const giftCount = myGifts.length

  const inventoryValue = useMemo(
    () => myGifts.reduce((sum, gift) => sum + gift.price, 0),
    [myGifts],
  )

  const displayInventoryValue = inventoryValue.toFixed(2)
  const displayTotalVolume = inventoryValue.toFixed(2)

  const handleInventoryClick = () => {
    hapticLight()
    onTabChange?.('my-gifts')
  }

  const handleInviteClick = () => {
    hapticLight()
    if (!user?.id) return

    const inviteLink = `https://t.me/CapsuleMarketBot?start=ref_${user.id}`

    if (window.Telegram?.WebApp?.openTelegramLink) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}`
      window.Telegram.WebApp.openTelegramLink(shareUrl)
    }
  }

  return (
    <div className="profile-content">
      <div className="profile-content__body">
          <div className="profile-content__card">
            <div className="profile-content__card-header glass-shadow">
              <div className="profile-content__user">
                <div className="profile-content__avatar-wrap">
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="profile-content__avatar"
                  />
                </div>
                <div className="profile-content__user-meta">
                  <span className="profile-content__username">{username}</span>
                  {user?.username ? (
                    <span className="profile-content__handle">@{user.username}</span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="profile-content__inventory-btn"
                onClick={handleInventoryClick}
              >
                <div className="profile-content__inventory-meta">
                  <span className="profile-content__inventory-label">Inventory</span>
                  <div className="profile-content__inventory-count">
                    <span>{giftCount}</span>
                    <GiftIcon />
                  </div>
                </div>
                <ChevronRightIcon />
              </button>
            </div>

            <div className="profile-content__stats">
              <div className="profile-content__stat">
                <span className="profile-content__stat-value">
                  {displayInventoryValue}
                  <span className="profile-content__stat-unit">GRAM</span>
                </span>
                <span className="profile-content__stat-label">Inventory value</span>
              </div>
              <div className="profile-content__stat">
                <span className="profile-content__stat-value">0/0</span>
                <span className="profile-content__stat-label">Bought/Sold</span>
              </div>
              <div className="profile-content__stat">
                <span className="profile-content__stat-value">
                  {displayTotalVolume}
                  <span className="profile-content__stat-unit">GRAM</span>
                </span>
                <span className="profile-content__stat-label">Total volume</span>
              </div>
            </div>
          </div>

          <section className="profile-content__referral">
            <p className="profile-content__referral-title">
              INVITE FRIENDS AND EARN GRAM <TonIcon className="profile-content__referral-title-icon" />
            </p>

            <div className="profile-content__referral-card glass-shadow">
              <ReferralIcon />
              <div className="profile-content__referral-text">
                <div className="profile-content__referral-heading">Referral program on pause</div>
                <p className="profile-content__referral-desc">
                  You can still invite friends and earn 10% of their deposits.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="profile-content__invite-btn glass-shadow"
              onClick={handleInviteClick}
            >
              Invite friends
            </button>
          </section>
      </div>
    </div>
  )
}
