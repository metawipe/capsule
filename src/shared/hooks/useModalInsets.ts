import { useSyncExternalStore } from 'react'
import { getModalInsets } from '@/integrations/telegram/twa'

export type ModalInsets = ReturnType<typeof getModalInsets>

let cachedInsets: ModalInsets = { top: 12, bottom: 8, side: 8 }
let cachedKey = '12:8:8'

function readModalInsets(): ModalInsets {
  const next = getModalInsets()
  const key = `${next.top}:${next.bottom}:${next.side}`
  if (key !== cachedKey) {
    cachedInsets = next
    cachedKey = key
  }
  return cachedInsets
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener('modalInsetsChanged', handler)
  window.addEventListener('viewportChanged', handler)
  window.addEventListener('safeAreaChanged', handler)
  window.addEventListener('resize', handler)
  return () => {
    window.removeEventListener('modalInsetsChanged', handler)
    window.removeEventListener('viewportChanged', handler)
    window.removeEventListener('safeAreaChanged', handler)
    window.removeEventListener('resize', handler)
  }
}

export function useModalInsets() {
  return useSyncExternalStore(subscribe, readModalInsets, readModalInsets)
}
