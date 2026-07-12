import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { GiftPreview } from '@/shared/api/types'
import { getTelegramUserSafe } from '@/integrations/telegram/twa'
import { getBalance, getUserGifts, purchaseGift, upsertUser } from '@/shared/api/user'

interface UserContextType {
  balance: number
  myGifts: GiftPreview[]
  setBalance: (balance: number) => void
  addGift: (gift: GiftPreview) => Promise<void>
  refreshBalance: () => Promise<void>
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState<number>(0.00)
  const [myGifts, setMyGifts] = useState<GiftPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  // Получаем user_id из Telegram при монтировании
  useEffect(() => {
    const user = getTelegramUserSafe()
    if (user?.id) {
      setUserId(user.id)
    }
  }, [])

  // Загружаем баланс и подарки при изменении userId
  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const loadUserData = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      
      const telegramUser = getTelegramUserSafe()
      if (telegramUser) {
        try {
          await upsertUser({
            user_id: userId,
            username: telegramUser.username || null,
            first_name: telegramUser.first_name || null,
            last_name: telegramUser.last_name || null,
            is_premium: telegramUser.is_premium || false,
          })
        } catch (error) {
          console.error('Error creating/updating user:', error)
        }
      }

      const [newBalance, gifts] = await Promise.all([getBalance(userId), getUserGifts(userId)])
      setBalanceState(newBalance)
      setMyGifts(gifts)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance)
  }

  const addGift = async (gift: GiftPreview): Promise<void> => {
    if (!userId) {
      throw new Error('User ID not available')
    }

    try {
      await purchaseGift(userId, gift)

      // Обновляем локальное состояние
      setMyGifts(prev => {
        if (prev.some(g => g.id === gift.id)) {
          return prev
        }
        return [...prev, gift]
      })

      // Обновляем баланс (списываем цену)
      setBalanceState(prev => prev - gift.price)
    } catch (error) {
      console.error('Error purchasing gift:', error)
      throw error
    }
  }

  const refreshBalance = async () => {
    if (!userId) return

    try {
      setBalanceState(await getBalance(userId))
    } catch (error) {
      console.error('[UserContext] Error refreshing balance:', error)
    }
  }

  // Автоматически обновляем баланс каждые 5 секунд
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      refreshBalance()
    }, 5000) // Обновляем каждые 5 секунд

    return () => clearInterval(interval)
  }, [userId])

  return (
    <UserContext.Provider
      value={{
        balance,
        myGifts,
        setBalance,
        addGift,
        refreshBalance,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}

