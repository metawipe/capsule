import type { VercelRequest, VercelResponse } from '@vercel/node'

export async function proxyChangesApi(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    const original = String(req.headers['x-vercel-original-path'] || req.url || '/')
    let path = original.split('?')[0].replace(/^\/api\/api-changes/, '').replace(/^\/api-changes/, '') || '/'
    if ((path === '/' || path === '') && req.query.path) {
      const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path]
      path = `/${segments.filter(Boolean).join('/')}`
    }
    const query = new URLSearchParams()
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) (Array.isArray(value) ? value : [value]).forEach((item) => query.append(key, String(item)))
    })
    const url = `https://api.changes.tg${path}${query.size ? `?${query}` : ''}`
    const response = await fetch(url, { method: req.method, headers: { 'Content-Type': 'application/json' } })
    if (!response.ok) return res.status(response.status).json({ error: 'API request failed', status: response.status, statusText: response.statusText })
    const data = await response.text()
    if (data.trim().startsWith('<!')) return res.status(502).json({ error: 'Proxy error: received HTML instead of JSON' })
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json')
    return res.status(response.status).send(data)
  } catch (error) {
    console.error('Changes API proxy error', error)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
