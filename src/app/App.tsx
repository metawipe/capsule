import './App.css'

import type { BottomTab } from '@/features/navigation/BottomNav'

import { startTransition, useCallback, useState } from 'react'

import { BottomNav } from '@/features/navigation/BottomNav'

import { BalanceModal } from '@/features/profile/components/BalanceModal'

import { TermsModal } from '@/features/profile/components/TermsModal'

import { MarketProvider } from '@/features/market/model/MarketContext'

import { UserProvider, useUserContext } from '@/features/profile/model/UserContext'

import { hapticLight } from '@/integrations/telegram/twa'

import { useTelegramUser } from '@/shared/hooks/useTelegramUser'

import defaultAvatar from '@/shared/assets/Capsule.jpg'

import { AppTopBar } from '@/shared/ui/AppTopBar'

import { AnimatePresence } from 'framer-motion'

import { MarketTabPanel, MyGiftsTabPanel, ProfileTabPanel } from './TabPanels'



function AppShell() {

  const [navTab, setNavTab] = useState<BottomTab>('market')

  const [contentTab, setContentTab] = useState<BottomTab>('market')

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

  const { balance, refreshBalance, isLoading } = useUserContext()

  const user = useTelegramUser()



  const username = user?.username ?? user?.first_name ?? 'Capsule'

  const avatarUrl = user?.photo_url || defaultAvatar



  const handleTabChange = useCallback((tab: BottomTab) => {

    setNavTab(tab)

    if (tab === 'profile') {

      setContentTab(tab)

      return

    }

    startTransition(() => {

      setContentTab(tab)

    })

  }, [])



  const handleBalanceClick = () => {

    hapticLight()

    void refreshBalance()

    setIsBalanceModalOpen(true)

  }



  return (

    <div className="tma-root">

      <div className="app-shell-top">

        <AppTopBar

          variant={navTab === 'profile' ? 'profile' : 'market'}

          balance={balance}

          balanceLoading={isLoading}

          username={username}

          avatarUrl={avatarUrl}

          onBalanceClick={handleBalanceClick}

          onMenuClick={() => setIsTermsModalOpen(true)}

          onProfileClick={() => handleTabChange('profile')}

        />

      </div>



      <div className="tma-container">

        <div className="tab-content">

          <AnimatePresence initial={false}>

            {contentTab === 'market' && (

              <MarketTabPanel activeTab={navTab} onTabChange={handleTabChange} />

            )}



            {contentTab === 'my-gifts' && (

              <MyGiftsTabPanel activeTab={navTab} onTabChange={handleTabChange} />

            )}



            {contentTab === 'profile' && (

              <ProfileTabPanel onTabChange={handleTabChange} />

            )}

          </AnimatePresence>

        </div>

      </div>



      <BottomNav active={navTab} onChange={handleTabChange} />



      <TermsModal

        isOpen={isTermsModalOpen}

        onClose={() => setIsTermsModalOpen(false)}

      />



      <BalanceModal

        isOpen={isBalanceModalOpen}

        onClose={() => setIsBalanceModalOpen(false)}

        balance={balance}

      />

      <div id="app-modal-portal" className="app-modal-portal" />

    </div>

  )

}



function App() {

  return (

    <UserProvider>

      <MarketProvider>

        <AppShell />

      </MarketProvider>

    </UserProvider>

  )

}



export default App


