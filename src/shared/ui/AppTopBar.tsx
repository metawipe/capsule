import { AnimatePresence, motion } from 'framer-motion'
import { Skeleton } from '@/shared/ui/Skeleton'
import './app-topbar.css'

function GramIcon({ className }: { className?: string }) {
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

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g style={{ mixBlendMode: 'plus-lighter' }}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.14286 4C0.511674 4 0 4.51168 0 5.14286C0 5.77403 0.511674 6.28571 1.14286 6.28571H14.8571C15.4883 6.28571 16 5.77403 16 5.14286C16 4.51168 15.4883 4 14.8571 4H1.14286ZM1.14286 9.71429C0.511674 9.71429 0 10.226 0 10.8571C0 11.4883 0.511674 12 1.14286 12H14.8571C15.4883 12 16 11.4883 16 10.8571C16 10.226 15.4883 9.71429 14.8571 9.71429H1.14286Z"
          fill="white"
          fillOpacity="0.4"
        />
      </g>
    </svg>
  )
}

const leftFade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const },
}

interface AppTopBarProps {
  variant: 'profile' | 'market'
  balance: number
  balanceLoading?: boolean
  onBalanceClick: () => void
  onMenuClick?: () => void
  onProfileClick?: () => void
  username?: string
  avatarUrl?: string
}

export function AppTopBar({
  variant,
  balance,
  balanceLoading = false,
  onBalanceClick,
  onMenuClick,
  onProfileClick,
  username = 'Capsule',
  avatarUrl,
}: AppTopBarProps) {
  const displayBalance = balance.toFixed(2)

  return (
    <div className="app-topbar">
      <div className="app-topbar__left">
        <AnimatePresence initial={false}>
          {variant === 'profile' ? (
            <motion.div key="menu" className="app-topbar__left-slot" {...leftFade}>
              <button
                type="button"
                className="app-topbar__menu-btn glass-shadow"
                aria-label="Menu"
                onClick={onMenuClick}
              >
                <MenuIcon />
              </button>
            </motion.div>
          ) : balanceLoading ? (
            <motion.div key="skeleton" className="app-topbar__left-slot" {...leftFade}>
              <div className="app-topbar__profile-skeleton">
                <Skeleton className="app-topbar__avatar-skeleton" />
                <Skeleton className="app-topbar__name-skeleton" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="profile" className="app-topbar__left-slot" {...leftFade}>
              <button
                type="button"
                className="app-topbar__profile-link glass-shadow"
                aria-label="Open profile"
                onClick={onProfileClick}
              >
                {avatarUrl && (
                  <span className="app-topbar__avatar-wrap">
                    <img className="app-topbar__avatar" src={avatarUrl} alt="" />
                  </span>
                )}
                <span className="app-topbar__username">{username}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        className="app-topbar__balance-btn glass-shadow"
        aria-label="Balance"
        onClick={onBalanceClick}
      >
        <GramIcon className="app-topbar__balance-icon" />
        {balanceLoading ? (
          <Skeleton className="app-topbar__balance-skeleton" />
        ) : (
          <span>{displayBalance} GRAM</span>
        )}
      </button>
    </div>
  )
}
