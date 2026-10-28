import { supabase } from './supabase'

/**
 * خريطة الصور الحقيقية: مفتاح → رابط صورة.
 * المفاتيح:  word:<كلمة عربية>  en:<english word>  country:<code>  number:<n>  content:<id>
 * الصور تُرفع من الداشبورد إلى Supabase Storage وتُخزَّن في جدول images.
 * عندما لا توجد صورة لمفتاح ما يُعرض الإيموجي بدلاً منها.
 */
export type ImageMap = Record<string, string>

const KEY = 'fos7a_images'
let memory: ImageMap | null = null

export function getImages(): ImageMap {
  if (memory) return memory
  if (typeof window === 'undefined') return {}
  try { memory = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { memory = {} }
  return memory!
}

export const imageFor = (key: string): string | undefined => getImages()[key]

function persist(map: ImageMap) {
  memory = map
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {}
}

let inflight: Promise<ImageMap> | null = null
/** يجلب كل الصور من القاعدة ويحدّث الذاكرة (مرة واحدة لكل تحميل صفحة) */
export function loadImages(): Promise<ImageMap> {
  if (!supabase) return Promise.resolve(getImages())
  if (inflight) return inflight
  const sb = supabase
  inflight = (async () => {
    try {
      const { data, error } = await sb.from('images').select('key, url')
      if (error || !data) return getImages()
      const map: ImageMap = {}
      for (const r of data as { key: string; url: string }[]) map[r.key] = r.url
      persist(map)
      return map
    } catch { return getImages() }
  })()
  return inflight
}

export async function setImage(key: string, url: string | null): Promise<void> {
  const map = { ...getImages() }
  if (url) map[key] = url; else delete map[key]
  persist(map)
  if (!supabase) return
  if (url) {
    const { error } = await supabase.from('images').upsert({ key, url, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('images').delete().eq('key', key)
    if (error) throw new Error(error.message)
  }
}

export async function uploadImage(file: File, key: string): Promise<string> {
  if (!supabase) throw new Error('Supabase غير مُعدّ')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60)
  const path = `${safe}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file, { contentType: file.type || 'image/jpeg', cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
}
