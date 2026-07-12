import { Modal } from '@/shared/ui/Modal'
import './promocode-modal.css'
import { hapticSuccess, hapticLight } from '@/integrations/telegram/twa'
import { useState, useMemo } from 'react'
import { Toast } from '@/shared/ui/Toast'
import { getTelegramUserSafe } from '@/integrations/telegram/twa'
import { useUserContext } from '@/features/profile/model/UserContext'
import { activatePromo } from '@/shared/api/promo'

interface PromocodeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PromocodeModal({ isOpen, onClose }: PromocodeModalProps) {
  const [promocode, setPromocode] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(false)
  const { refreshBalance } = useUserContext()

  const parsedPromocode = useMemo(() => {
    const trimmed = promocode.trim().toUpperCase()
    if (trimmed.length < 9) return null
    
    // Проверяем первые 8 символов - должны быть большие английские буквы
    const codePart = trimmed.slice(0, 8)
    const amountPart = trimmed.slice(8)
    
    if (!/^[A-Z]{8}$/.test(codePart)) return null
    
    const amount = Number(amountPart)
    if (!Number.isFinite(amount) || amount <= 0) return null
    
    return {
      code: trimmed, // Используем полный код (8 букв + цифры)
      amount: amount
    }
  }, [promocode])

  const handleSubmit = async () => {
    if (!parsedPromocode) return
    
    const user = getTelegramUserSafe()
    if (!user?.id) {
      hapticLight()
      setToastMessage('User ID not found')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    setIsLoading(true)
    
    try {
      const data = await activatePromo(parsedPromocode.code, user.id)
      hapticSuccess()
      
      // Обновляем баланс
      await refreshBalance()
      
      // Показываем уведомление
      setToastMessage(`Successfully activated! You received ${data.amount.toFixed(2)} GRAM`)
      setToastType('success')
      setShowToast(true)
      
      // Закрываем модалку и очищаем поле
      setTimeout(() => {
        onClose()
        setPromocode('')
      }, 2000)
    } catch (error: unknown) {
      hapticLight()
      setToastMessage(error instanceof Error ? error.message : 'Failed to activate promo code')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = !!parsedPromocode

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Promocode">
        <div className="promocode-modal__panel">
          <div className="promocode-modal__input-wrap">
            <label className="promocode-modal__label">
              Enter promocode
            </label>
            <input
              type="text"
              value={promocode}
              onChange={(e) => setPromocode(e.target.value)}
              className="promocode-modal__input"
              placeholder="Enter promocode"
              autoFocus
            />
          </div>
          <button
            className="promocode-modal__submit-btn"
            disabled={!canSubmit || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Activating...' : 'Apply'}
          </button>
        </div>
      </Modal>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />
    </>
  )
}

