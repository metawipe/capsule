import type { VercelRequest, VercelResponse } from '@vercel/node'
import { proxyChangesApi } from './_lib/changesProxy'

export default function handler(req: VercelRequest, res: VercelResponse) {
  return proxyChangesApi(req, res)
}
