import { useCallback, useEffect, useRef, useState } from 'react'
import lottie from 'lottie-web'

const animationCache = new Map<string, unknown>()

export function isLottiePreview(preview?: string) {
  return Boolean(
    preview?.endsWith('.lottie.json') ||
    preview?.endsWith('.tgs') ||
    preview?.includes('lottie'),
  )
}

export function useLottie(
  preview: string | undefined,
  enabled: boolean,
  autoplay = false,
) {
  const animationRef = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
  }, [])

  useEffect(() => {
    if (!enabled || !preview || !container) return
    let active = true

    void (async () => {
      try {
        let animationData = animationCache.get(preview)
        if (!animationData) {
          const response = await fetch(preview)
          if (!response.ok) throw new Error(`Failed to load animation: ${response.status}`)
          animationData = await response.json()
          animationCache.set(preview, animationData)
        }
        if (!active || !container) return

        animationRef.current?.destroy()
        animationRef.current = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay,
          animationData,
        })
        setIsPlaying(autoplay)
      } catch (error) {
        console.error('Failed to load Lottie animation', error)
      }
    })()

    return () => {
      active = false
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [preview, enabled, autoplay, container])

  const toggle = () => {
    if (!animationRef.current) return
    if (isPlaying) animationRef.current.pause()
    else animationRef.current.play()
    setIsPlaying((playing) => !playing)
  }

  return { containerRef, toggle }
}
