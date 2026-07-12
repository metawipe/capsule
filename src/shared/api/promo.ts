import { request } from './client'

interface PromoActivationResponse {
  amount: number
}

export function activatePromo(code: string, userId: number) {
  const query = new URLSearchParams({ code, user_id: String(userId) })
  return request<PromoActivationResponse>(`/promo/activate?${query}`, {
    method: 'POST',
  })
}
