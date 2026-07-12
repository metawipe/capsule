import { createContext, useContext, useState, type ReactNode } from 'react'

export type MyGiftsSubTab = 'unlisted' | 'listed'

interface MyGiftsTabContextType {
  subTab: MyGiftsSubTab
  setSubTab: (tab: MyGiftsSubTab) => void
}

const MyGiftsTabContext = createContext<MyGiftsTabContextType | undefined>(undefined)

export function MyGiftsTabProvider({ children }: { children: ReactNode }) {
  const [subTab, setSubTab] = useState<MyGiftsSubTab>('unlisted')

  return (
    <MyGiftsTabContext.Provider value={{ subTab, setSubTab }}>
      {children}
    </MyGiftsTabContext.Provider>
  )
}

export function useMyGiftsTab() {
  const context = useContext(MyGiftsTabContext)
  if (!context) {
    throw new Error('useMyGiftsTab must be used within MyGiftsTabProvider')
  }
  return context
}
