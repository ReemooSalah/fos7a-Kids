import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

/**
 * للمسارات الخادمية فقط (app/api/*). يتحقق أن الطلب قادم من مشرف مسجّل.
 * يستخدم SUPABASE_SERVICE_ROLE_KEY وهو سري ولا يُرسَل للمتصفح أبداً.
 */
export async function requireAdmin(req: Request): Promise<{ admin: SupabaseClient; user: User } | null> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!token || !url || !service) return null

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null

  const { data: row } = await admin.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle()
  return row ? { admin, user: data.user } : null
}

export const ELEVEN_BASE = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io'
