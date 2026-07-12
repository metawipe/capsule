import { API_CONFIG } from './config'

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), API_CONFIG.timeout)

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(body.detail || 'Request failed', response.status)
    }

    return response.json() as Promise<T>
  } finally {
    window.clearTimeout(timeout)
  }
}
