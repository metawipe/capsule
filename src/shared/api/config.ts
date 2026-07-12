export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL
    || (import.meta.env.PROD
      ? 'https://capsule-market-production.up.railway.app/api'
      : '/api'),
  timeout: 30_000,
} as const

