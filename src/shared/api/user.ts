import type { GiftPreview } from './types'
import { request } from './client'

interface ApiGift {
  gift_id: string
  gift_name: string
  gift_price: number
  gift_preview?: string | null
}

interface BalanceResponse {
  balance_ton: number | string
}

interface TelegramUserPayload {
  user_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  is_premium: boolean
}

export function upsertUser(user: TelegramUserPayload) {
  return request<void>('/user', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}

export async function getBalance(userId: number) {
  const { balance_ton } = await request<BalanceResponse>(`/user/${userId}/balance`)
  return Number(balance_ton) || 0
}

export async function getUserGifts(userId: number): Promise<GiftPreview[]> {
  const gifts = await request<ApiGift[]>(`/user/${userId}/gifts`)
  return gifts.map((gift) => ({
    id: gift.gift_id,
    name: gift.gift_name,
    price: gift.gift_price,
    preview: gift.gift_preview || undefined,
    models_count: 0,
    in_stock: true,
    rating: 0,
    tags: [],
  }))
}

export function purchaseGift(userId: number, gift: GiftPreview) {
  return request<void>(`/user/${userId}/purchase`, {
    method: 'POST',
    body: JSON.stringify({
      gift_id: gift.id,
      gift_name: gift.name,
      gift_preview: gift.preview || null,
      gift_price: gift.price,
    }),
  })
}
