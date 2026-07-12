import type { BottomTab } from '@/features/navigation/BottomNav'

import { FilterModalOrchestrator, useFilterModalOrchestration } from '@/features/market/components/FilterModalOrchestrator'

import { MarketToolbar } from '@/features/market/components/MarketToolbar'

import { MyGiftsHeader } from '@/features/market/components/MyGiftsHeader'

import './profile-header.css'
import '@/shared/ui/search-field.css'



interface ProfileHeaderProps {

  activeTab: BottomTab

  onTabChange?: (tab: BottomTab) => void

  layout?: 'fixed' | 'scroll'

}



export function ProfileHeader({ activeTab, layout = 'fixed' }: ProfileHeaderProps) {

  const filterModals = useFilterModalOrchestration()



  return (

    <>

      {activeTab === 'my-gifts' && <MyGiftsHeader />}

      <MarketToolbar

        activeTab={activeTab}

        onOpenModal={filterModals.openModal}

        sticky={layout === 'scroll'}

      />

      <FilterModalOrchestrator {...filterModals} />

    </>

  )

}


