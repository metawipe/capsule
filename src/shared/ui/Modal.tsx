import { createPortal } from 'react-dom'

import { AnimatePresence, motion, type PanInfo } from 'framer-motion'

import cn from 'classnames'

import { hapticLight } from '@/integrations/telegram/twa'

import type { ReactNode } from 'react'

import { useState, useEffect } from 'react'

import './modal.css'



const drawerEase = [0.32, 0.72, 0, 1] as const

const drawerTransition = { duration: 0.5, ease: drawerEase }



interface ModalProps {

  isOpen: boolean

  onClose: () => void

  title?: string

  children: ReactNode

  className?: string

  bodyClassName?: string

  hideHandle?: boolean

  hideCloseButton?: boolean

  closeOnBackdrop?: boolean

}



function CloseIcon() {

  return (

    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">

      <path

        d="M11.0002 13.1093L5.67784 18.4314C5.39411 18.7153 5.04263 18.8573 4.62339 18.8573C4.20416 18.8573 3.85267 18.7153 3.56894 18.4314C3.28503 18.1477 3.14307 17.7962 3.14307 17.377C3.14307 16.9577 3.28503 16.6062 3.56894 16.3225L8.89099 11.0002L3.56894 5.67784C3.28503 5.39411 3.14307 5.04263 3.14307 4.62339C3.14307 4.20416 3.28503 3.85267 3.56894 3.56894C3.85267 3.28503 4.20416 3.14307 4.62339 3.14307C5.04263 3.14307 5.39411 3.28503 5.67784 3.56894L11.0002 8.89099L16.3225 3.56894C16.6062 3.28503 16.9577 3.14307 17.377 3.14307C17.7962 3.14307 18.1477 3.28503 18.4314 3.56894C18.7153 3.85267 18.8573 4.20416 18.8573 4.62339C18.8573 5.04263 18.7153 5.39411 18.4314 5.67784L13.1093 11.0002L18.4314 16.3225C18.7153 16.6062 18.8573 16.9577 18.8573 17.377C18.8573 17.7962 18.7153 18.1477 18.4314 18.4314C18.1477 18.7153 17.7962 18.8573 17.377 18.8573C16.9577 18.8573 16.6062 18.7153 16.3225 18.4314L11.0002 13.1093Z"

        fill="currentColor"

      />

    </svg>

  )

}



export function Modal({

  isOpen,

  onClose,

  title,

  children,

  className,

  bodyClassName,

  hideHandle = false,

  hideCloseButton = false,

  closeOnBackdrop = true,

}: ModalProps) {

  const [isDragging, setIsDragging] = useState(false)



  const handleOverlayClick = () => {

    if (!closeOnBackdrop) return

    hapticLight()

    onClose()

  }



  const handleCloseClick = () => {

    hapticLight()

    onClose()

  }



  const handleDragEnd = (_event: unknown, info: PanInfo) => {

    setIsDragging(false)



    if (info.offset.y > 100 || info.velocity.y > 500) {

      hapticLight()

      onClose()

    }

  }



  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setPortalTarget(document.getElementById('app-modal-portal') ?? document.body)
    return () => setMounted(false)
  }, [])

  if (!mounted || !portalTarget) return null



  const showHeader = Boolean(title) || !hideCloseButton



  return createPortal(

    <AnimatePresence>

      {isOpen && (

        <div className="modal__root">

          <motion.button

            type="button"

            className="modal__overlay"

            aria-label="Close modal"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={drawerTransition}

            onClick={handleOverlayClick}

          />



          <motion.div

            className={cn('modal__content', className)}

            initial={{ y: '100%' }}

            animate={{ y: 0 }}

            exit={{ y: '100%' }}

            transition={drawerTransition}

            drag="y"

            dragConstraints={{ top: 0, bottom: 0 }}

            dragElastic={{ top: 0, bottom: 0.5 }}

            onDragStart={() => {

              setIsDragging(true)

              hapticLight()

            }}

            onDragEnd={handleDragEnd}

            style={{

              cursor: isDragging ? 'grabbing' : 'grab',

            }}

          >

            <div className="modal__content-bg" aria-hidden="true" />



            {!hideHandle && (

              <div className="modal__handle-wrap">

                <motion.div

                  className="modal__handle"

                  animate={{

                    opacity: isDragging ? 1 : 0.7,

                    scale: isDragging ? 0.95 : 1,

                  }}

                  transition={{ duration: 0.2 }}

                />

              </div>

            )}



            <div className="modal__inner">

              {showHeader && (

                <div className="modal__header">

                  {title && <h2 className="modal__title">{title}</h2>}

                  {!hideCloseButton && (

                    <button

                      type="button"

                      className="modal__close-btn glass-shadow"

                      aria-label="Close"

                      onClick={handleCloseClick}

                    >

                      <CloseIcon />

                    </button>

                  )}

                </div>

              )}



              <div className={cn('modal__body', bodyClassName)}>{children}</div>

            </div>

          </motion.div>

        </div>

      )}

    </AnimatePresence>,

    portalTarget,
  )
}

