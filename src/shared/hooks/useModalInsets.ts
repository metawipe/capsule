import { useSyncExternalStore } from 'react'
import { getModalInsets } from '@/integrations/telegram/twa'

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener('viewportChanged', handler)
  window.addEventListener('safeAreaChanged', handler)
  window.addEventListener('resize', handler)
  return () => {
    window.removeEventListener('viewportChanged', handler)
    window.removeEventListener('safeAreaChanged', handler)
    window.removeEventListener('resize', handler)
  }
}

export function useModalInsets() {
  return useSyncExternalStore(subscribe, getModalInsets, getModalInsets)
}
