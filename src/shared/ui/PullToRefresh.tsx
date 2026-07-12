import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { hapticLight } from '@/integrations/telegram/twa'
import './pull-to-refresh.css'

const PULL_THRESHOLD = 72
const MAX_PULL = 112
const INTERACTIVE_PULL_SELECTOR = 'button, a, input, textarea, select, label, [role="tab"], [data-no-pull], .gift-card__shell, .gift-list-item'

function isInteractivePullTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_PULL_SELECTOR))
}

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
  disabled?: boolean
} & HTMLMotionProps<'div'>

export function PullToRefresh({
  onRefresh,
  children,
  className = '',
  disabled = false,
  ...motionProps
}: PullToRefreshProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerStartY = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const isTracking = useRef(false)
  const pullRef = useRef(0)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  pullRef.current = pull

  const resetPull = useCallback(() => {
    setPull(0)
    isTracking.current = false
    pointerIdRef.current = null
  }, [])

  const runRefresh = useCallback(async () => {
    if (refreshing || disabled) return

    setRefreshing(true)
    hapticLight()

    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
      resetPull()
    }
  }, [disabled, onRefresh, refreshing, resetPull])

  const canStartPull = useCallback(() => {
    if (disabled || refreshing) return false
    const scrollTop = scrollRef.current?.scrollTop ?? 0
    return scrollTop <= 0
  }, [disabled, refreshing])

  const handlePointerMove = useCallback((clientY: number) => {
    if (!isTracking.current || disabled || refreshing) return

    const scrollTop = scrollRef.current?.scrollTop ?? 0
    if (scrollTop > 0) {
      resetPull()
      return
    }

    const delta = clientY - pointerStartY.current
    if (delta <= 0) {
      setPull(0)
      return
    }

    setPull(Math.min(delta * 0.55, MAX_PULL))
  }, [disabled, refreshing, resetPull])

  const handlePointerEnd = useCallback(async () => {
    if (!isTracking.current || disabled) return

    const shouldRefresh = pullRef.current >= PULL_THRESHOLD
    isTracking.current = false
    pointerIdRef.current = null

    if (shouldRefresh) {
      await runRefresh()
      return
    }

    resetPull()
  }, [disabled, resetPull, runRefresh])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const onNativeTouchMove = (event: globalThis.TouchEvent) => {
      if (!isTracking.current || disabled || refreshing) return
      if ((node.scrollTop ?? 0) > 0) return

      const currentY = event.touches[0]?.clientY ?? pointerStartY.current
      const delta = currentY - pointerStartY.current
      if (delta > 0) {
        event.preventDefault()
      }
    }

    node.addEventListener('touchmove', onNativeTouchMove, { passive: false })
    return () => node.removeEventListener('touchmove', onNativeTouchMove)
  }, [disabled, refreshing])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canStartPull()) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (isInteractivePullTarget(event.target)) return

    pointerStartY.current = event.clientY
    pointerIdRef.current = event.pointerId
    isTracking.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    handlePointerMove(event.clientY)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    void handlePointerEnd()
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    resetPull()
  }

  const progress = Math.min(pull / PULL_THRESHOLD, 1)
  const ready = pull >= PULL_THRESHOLD
  const visible = refreshing || pull > 6
  const indicatorOpacity = refreshing ? 1 : Math.min(progress * 1.15, 1)
  const indicatorScale = refreshing ? 1 : 0.72 + progress * 0.28

  return (
    <motion.div
      ref={scrollRef}
      className={`pull-to-refresh${pull > 0 ? ' pull-to-refresh--pulling' : ''} ${className}`.trim()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      {...motionProps}
    >
      <div className="pull-to-refresh__content">
        {children}
      </div>

      <div
        className={`pull-to-refresh__indicator ${refreshing ? 'pull-to-refresh__indicator--refreshing' : ''} ${ready ? 'pull-to-refresh__indicator--ready' : ''} ${visible ? 'pull-to-refresh__indicator--visible' : ''}`}
        style={{
          opacity: indicatorOpacity,
          transform: `translateX(-50%) scale(${indicatorScale})`,
        }}
        aria-hidden="true"
      >
        <div
          className="pull-to-refresh__spinner"
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 180}deg)`,
          }}
        >
          <span className="material-icons-round pull-to-refresh__icon">refresh</span>
        </div>
      </div>
    </motion.div>
  )
}
