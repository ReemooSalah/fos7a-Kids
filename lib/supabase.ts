import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** true عندما تكون مفاتيح Supabase موجودة. بدونها يعمل التطبيق على localStorage كما كان. */
export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const AUDIO_BUCKET = 'audio'

/** يرفع ملفاً صوتياً إلى Supabase Storage ويعيد الرابط العام */
export async function uploadAudio(file: File | Blob, folder: string, name: string): Promise<string> {
  if (!supabase) throw new Error('Supabase غير مُعدّ')
  const ext = (file instanceof File ? file.name.split('.').pop() : 'mp3') || 'mp3'
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'file'
  const path = `${folder}/${safe}-${Date.now()}.${ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp3'}`
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, file, {
    contentType: file.type || 'audio/mpeg',
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw new Error(error.message)
  return supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl
}

/** مدة ملف صوتي بصيغة د:ث، أو null إن تعذّر القراءة */
export function audioDuration(url: string): Promise<string | null> {
  return new Promise(resolve => {
    const a = new Audio()
    const done = (v: string | null) => { a.onloadedmetadata = null; a.onerror = null; resolve(v) }
    a.preload = 'metadata'
    a.onloadedmetadata = () => {
      if (!isFinite(a.duration)) return done(null)
      const s = Math.round(a.duration)
      done(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
    }
    a.onerror = () => done(null)
    setTimeout(() => done(null), 8000)
    a.src = url
  })
}
