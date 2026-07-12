import { useEffect, useState } from 'react'
import { getTelegramUserSafe, isTelegramWebApp } from '@/integrations/telegram/twa'

export function useTelegramUser() {
  const [user, setUser] = useState(() => getTelegramUserSafe())

  useEffect(() => {
    if (!isTelegramWebApp()) {
      return
    }

    const interval = setInterval(() => {
      const newUser = getTelegramUserSafe()
      if (newUser && JSON.stringify(newUser) !== JSON.stringify(user)) {
        setUser(newUser)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [user])

  return user
}
