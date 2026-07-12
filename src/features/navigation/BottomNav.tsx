import { useLayoutEffect, useRef } from 'react'
import { hapticLight } from '@/integrations/telegram/twa'
import { useTelegramUser } from '@/shared/hooks/useTelegramUser'
import defaultAvatar from '@/shared/assets/Capsule.jpg'
import './bottom-nav.css'

export type BottomTab = 'market' | 'my-gifts' | 'profile'

interface BottomNavProps {
  active: BottomTab
  onChange: (tab: BottomTab) => void
}

const mainTabs: Array<{ key: Extract<BottomTab, 'market' | 'my-gifts'>; label: string }> = [
  { key: 'market', label: 'Market' },
  { key: 'my-gifts', label: 'My Gifts' },
]

function MarketIcon() {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9271 0.0177576C12.5652 -0.0200706 13.1113 0.00148512 13.7579 0.0925703C14.487 0.194053 15.0341 0.322001 15.6759 0.538726C16.8581 0.936048 17.8818 1.51191 18.8588 2.32879C19.1344 2.55933 19.7248 3.15016 19.966 3.43738C20.8984 4.54829 21.5587 5.7951 21.9642 7.21202C22.2209 8.10637 22.2622 8.4405 22.2485 9.44824C22.2434 9.81633 22.2346 10.8469 22.2295 11.7362C22.2243 12.6253 22.2183 13.7672 22.2131 14.273C22.2084 14.7379 22.2018 15.6493 22.1968 16.3813L22.1955 16.5691C22.1629 21.7014 22.1538 22.5 22.1247 22.6738C22.0922 22.8698 22.0299 23.0644 21.9615 23.1866C21.7322 23.5873 21.3323 23.8432 20.7591 23.9619C20.5917 23.9945 20.5179 24 20.1333 24C19.6713 24 19.4862 23.983 19.0207 23.8953C18.5624 23.8093 18.1946 23.684 17.8577 23.4967C17.5616 23.3316 17.0231 23.0139 16.8742 22.9159C16.7306 22.8214 16.5421 22.7048 16.0948 22.4303C15.8229 22.2636 15.3182 22.0072 14.9998 21.8712C14.548 21.6803 14.0405 21.5422 13.5185 21.47C13.2595 21.4339 12.0572 21.4163 11.7244 21.4455C11.1562 21.4936 10.5192 21.6511 10.0023 21.8712C9.68062 22.0088 9.17773 22.2652 8.90735 22.4303C8.45926 22.7053 8.2703 22.8213 8.12658 22.9159C7.9777 23.0139 7.44055 23.3316 7.14449 23.4967C6.80739 23.6842 6.43873 23.8093 5.98014 23.8953C5.51518 23.9829 5.33027 24 4.86883 24C4.48378 24 4.40947 23.9946 4.24176 23.9619C3.66862 23.8432 3.26999 23.5872 3.04068 23.1866C2.97222 23.0645 2.9086 22.8699 2.87609 22.6738C2.84701 22.4998 2.83786 21.7005 2.80536 16.5691V16.3827C2.8004 15.6505 2.79375 14.7381 2.78903 14.273C2.7839 13.7672 2.77648 12.6253 2.77135 11.7362C2.76622 10.8469 2.75744 9.81633 2.75231 9.44824C2.73863 8.44051 2.77992 8.10636 3.0366 7.21202C3.44217 5.79487 4.10358 4.54842 5.03614 3.43738C5.27743 3.15013 5.86784 2.55928 6.14336 2.32879C7.43874 1.24535 8.89885 0.544284 10.5587 0.20547C10.9197 0.131542 11.6223 0.0350062 11.9271 0.0177576ZM12.9962 7.00663C12.4504 6.9723 11.7795 6.99297 11.4904 7.05015C11.0155 7.14629 10.5889 7.52473 10.4077 8.01456C10.3344 8.21837 10.3176 8.59752 10.2907 10.6929C10.2344 15.3402 10.2314 16.1855 10.273 16.3392C10.4003 16.797 10.8199 17.218 11.3218 17.392C11.5419 17.4697 11.7745 17.4899 12.4494 17.4899C13.1662 17.4899 13.4557 17.4678 13.6614 17.3947C14.1681 17.2185 14.5868 16.7992 14.7142 16.3392C14.7485 16.211 14.7506 16.0164 14.7359 14.4349C14.7066 11.0399 14.6734 8.71255 14.6489 8.42671C14.6146 7.98732 14.4896 7.71194 14.2082 7.4419C13.8949 7.14439 13.6276 7.04784 12.9962 7.00663Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GiftsIcon() {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" aria-hidden="true">
      <g clipPath="url(#bottom-nav-gifts-clip)">
        <path d="M8.48261 1.07292C7.88291 0.692664 7.08851 0.870545 6.70827 1.47023C6.32801 2.06991 6.50588 2.86431 7.10557 3.24457L8.74748 4.28569H3.07143C1.83356 4.28569 0.5 5.12404 0.5 6.52388V8.95273C0.5 10.2588 1.66097 11.0761 2.82193 11.1797C2.81206 11.1827 2.80225 11.1859 2.79253 11.1892H11.4286V6.65879H13.5714V11.1892H22.2075C22.1977 11.1859 22.1879 11.1827 22.178 11.1797C23.3391 11.0761 24.5 10.2588 24.5 8.95273V6.52388C24.5 5.12404 23.1665 4.28569 21.9286 4.28569H16.2526L17.8945 3.24457C18.4942 2.86431 18.6721 2.06991 18.2919 1.47023C17.9115 0.870545 17.1172 0.692664 16.5175 1.07292L12.5 3.62036L8.48261 1.07292Z" fill="currentColor" />
        <path d="M22.7857 13.3321H13.5714V24H20.2143C20.8962 24 21.5504 23.729 22.0326 23.2468C22.5149 22.7645 22.7857 22.1105 22.7857 21.4286V13.3321Z" fill="currentColor" />
        <path d="M11.4286 13.3321H2.21429V21.4286C2.21429 22.1105 2.48522 22.7645 2.96745 23.2468C3.44968 23.729 4.10373 24 4.78572 24H11.4286V13.3321Z" fill="currentColor" />
        <path d="M16.2666 5.79474H8.55304" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="bottom-nav-gifts-clip">
          <rect width="24" height="24" fill="currentColor" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

function getActiveIndex(tab: BottomTab): number {
  if (tab === 'market') return 0
  if (tab === 'my-gifts') return 1
  return -1
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const user = useTelegramUser()
  const avatarUrl = user?.photo_url || defaultAvatar
  const activeIndex = getActiveIndex(active)
  const previousActiveRef = useRef(activeIndex)
  const previousIndex = previousActiveRef.current

  useLayoutEffect(() => {
    previousActiveRef.current = activeIndex
  }, [activeIndex])

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom Navigation">
      <div className="bottom-nav__shell">
        <div className="bottom-nav__container">
          <div
            className="bottom-nav__switcher"
            data-active={activeIndex}
            data-previous={previousIndex !== activeIndex ? previousIndex : undefined}
            data-tabs={2}
          >
            {mainTabs.map(({ key, label }, index) => {
              const isActive = active === key
              return (
                <div key={key} className="bottom-nav__optionWrap">
                  <button
                    type="button"
                    className={`bottom-nav__option ${isActive ? 'bottom-nav__option--active' : ''}`}
                    data-option={index}
                    onClick={() => {
                      hapticLight()
                      onChange(key)
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="bottom-nav__icon">
                      {key === 'market' ? <MarketIcon /> : <GiftsIcon />}
                    </div>
                    <div className="bottom-nav__title">{label}</div>
                  </button>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="bottom-nav__profile"
            onClick={() => {
              hapticLight()
              onChange('profile')
            }}
            aria-label="Profile"
            aria-current={active === 'profile' ? 'page' : undefined}
          >
            <div className={`bottom-nav__profileIcon ${active === 'profile' ? 'bottom-nav__profileIcon--active' : ''}`}>
              <img className="bottom-nav__profileAvatar" src={avatarUrl} alt="" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  )
}
