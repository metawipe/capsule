import type { BottomTab } from '@/features/navigation/BottomNav'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { ProfileContent } from '@/features/profile/components/ProfileContent'
import { MarketContent } from '@/features/market/components/MarketContent'
import { MyGiftsContent } from '@/features/market/components/MyGiftsContent'
import { useMarketContext } from '@/features/market/model/MarketContext'
import { MyGiftsTabProvider } from '@/features/market/model/MyGiftsTabContext'
import { PullToRefresh } from '@/shared/ui/PullToRefresh'
import { motion } from 'framer-motion'

const tabFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

interface MarketTabPanelProps {
  activeTab: BottomTab
  onTabChange: (tab: BottomTab) => void
}

export function MarketTabPanel({ activeTab, onTabChange }: MarketTabPanelProps) {
  const { refreshGifts } = useMarketContext()

  return (
    <PullToRefresh
      key="market"
      onRefresh={refreshGifts}
      className="tab-panel market-scroll-container"
      {...tabFade}
    >
      <ProfileHeader activeTab={activeTab} onTabChange={onTabChange} layout="scroll" />
      <MarketContent />
    </PullToRefresh>
  )
}

export function MyGiftsTabPanel({ activeTab, onTabChange }: MarketTabPanelProps) {
  const { refreshGifts } = useMarketContext()

  return (
    <MyGiftsTabProvider>
      <PullToRefresh
        key="my-gifts"
        onRefresh={refreshGifts}
        className="tab-panel my-gifts-scroll-container"
        {...tabFade}
      >
        <ProfileHeader activeTab={activeTab} onTabChange={onTabChange} layout="scroll" />
        <MyGiftsContent onGoToMarket={() => onTabChange('market')} />
      </PullToRefresh>
    </MyGiftsTabProvider>
  )
}

export function ProfileTabPanel({
  onTabChange,
}: {
  onTabChange: (tab: BottomTab) => void
}) {
  return (
    <motion.div
      key="profile"
      data-tab="profile"
      className="tab-panel profile-tab-container"
      {...tabFade}
    >
      <ProfileContent onTabChange={onTabChange} />
    </motion.div>
  )
}
