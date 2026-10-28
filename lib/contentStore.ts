import { contentItems, type ContentItem } from './data'
import { isSupabaseConfigured, supabase } from './supabase'

/**
 * مصدر المحتوى:
 *  - عند إعداد Supabase: قاعدة البيانات هي المصدر، وlocalStorage مجرد ذاكرة مؤقتة للسرعة.
 *  - بدون Supabase: التعديلات تُحفظ في localStorage على الجهاز فقط (السلوك القديم).
 *  - إن كانت القاعدة فارغة أو لا يمكن الوصول إليها: يُعرض المحتوى الافتراضي المضمّن.
 */

const CACHE_KEY = 'fos7a_content_cache'
const LOCAL_KEY = 'fos7a_content'
const LETTER_KEY = 'fos7a_letter_audio'

interface Row {
  id: string; title: string; subtitle: string | null; category: ContentItem['category']
  duration: string | null; age_min: number | null; age_max: number | null
  is_premium: boolean | null; emoji: string | null; cover_color: string | null
  description: string | null; body: string | null; audio_url: string | null
  voice_id: string | null; sort_order: number | null; is_new: boolean | null; is_trending: boolean | null
  image_url?: string | null
}

const fromRow = (r: Row): ContentItem => ({
  id: r.id, title: r.title, subtitle: r.subtitle ?? '', category: r.category,
  duration: r.duration ?? '5:00', ageMin: r.age_min ?? 3, ageMax: r.age_max ?? 12,
  isPremium: !!r.is_premium, emoji: r.emoji ?? '🎧', coverColor: r.cover_color ?? 'from-purple-500 to-indigo-600',
  description: r.description ?? '', body: r.body ?? undefined, audioUrl: r.audio_url || undefined,
  voiceId: r.voice_id || undefined, imageUrl: r.image_url || undefined, order: r.sort_order ?? undefined,
  isNew: !!r.is_new, isTrending: !!r.is_trending,
})

const toRow = (i: ContentItem): Row => ({
  id: i.id, title: i.title, subtitle: i.subtitle || null, category: i.category,
  duration: i.duration || null, age_min: i.ageMin ?? null, age_max: i.ageMax ?? null,
  is_premium: !!i.isPremium, emoji: i.emoji || null, cover_color: i.coverColor || null,
  description: i.description || null, body: i.body || null, audio_url: i.audioUrl || null,
  voice_id: i.voiceId || null, image_url: i.imageUrl || null, sort_order: i.order ?? null, is_new: !!i.isNew, is_trending: !!i.isTrending,
})

function readJson<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null } catch { return null }
}

/** قراءة فورية (متزامنة) من الذاكرة المؤقتة أو المحتوى الافتراضي — للعرض الأول السريع */
export function getAllContent(): ContentItem[] {
  if (typeof window === 'undefined') return contentItems
  const stored = readJson<ContentItem[]>(isSupabaseConfigured ? CACHE_KEY : LOCAL_KEY)
  return Array.isArray(stored) && stored.length ? stored : contentItems
}

let inflight: Promise<ContentItem[]> | null = null

/** يجلب أحدث محتوى من Supabase (أو يعيد المحلي) ويحدّث الذاكرة المؤقتة */
export function loadContent(): Promise<ContentItem[]> {
  if (!supabase) return Promise.resolve(getAllContent())
  if (inflight) return inflight
  const sb = supabase
  inflight = (async () => {
    try {
      const { data, error } = await sb.from('content').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
      if (error) throw error
      if (!data || data.length === 0) return contentItems
      const items = (data as Row[]).map(fromRow)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)) } catch {}
      return items
    } catch {
      return getAllContent()
    } finally {
      setTimeout(() => { inflight = null }, 0)
    }
  })()
  return inflight
}

export async function getContentById(id: string): Promise<ContentItem | undefined> {
  return (await loadContent()).find(c => c.id === id)
}

const newId = () => 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

function writeLocal(items: ContentItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

export async function addContent(item: Omit<ContentItem, 'id'>): Promise<ContentItem> {
  const full: ContentItem = { ...item, id: newId() }
  if (supabase) {
    const { error } = await supabase.from('content').insert(toRow(full))
    if (error) throw new Error(error.message)
  } else writeLocal([full, ...getAllContent()])
  return full
}

/** يحفظ العنصر كاملاً (upsert) فيعمل حتى للعناصر الافتراضية التي لم تُرفع بعد */
export async function updateContent(id: string, updates: Partial<ContentItem>): Promise<void> {
  const base = getAllContent().find(c => c.id === id)
  const full = { ...(base || ({} as ContentItem)), ...updates, id } as ContentItem
  if (supabase) {
    const { error } = await supabase.from('content').upsert(toRow(full))
    if (error) throw new Error(error.message)
  } else writeLocal(getAllContent().map(i => (i.id === id ? full : i)))
}

export async function deleteContent(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('content').delete().eq('id', id)
    if (error) throw new Error(error.message)
  } else writeLocal(getAllContent().filter(i => i.id !== id))
}

/** استبدال/دمج مجموعة عناصر (للاستيراد) */
export async function saveAllContent(items: ContentItem[]): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('content').upsert(items.map(toRow))
    if (error) throw new Error(error.message)
  } else writeLocal(items)
}

/** يرفع المحتوى الافتراضي المضمّن (قصص الأنبياء وغيرها) إلى قاعدة البيانات */
export async function seedDefaults(): Promise<number> {
  if (!supabase) throw new Error('Supabase غير مُعدّ')
  const rows = contentItems.map(({ ...i }) => toRow({ ...i, progress: undefined } as ContentItem))
  const { error } = await supabase.from('content').upsert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}

/** يحذف كل محتوى القاعدة فيعود المحتوى الافتراضي المضمّن للظهور */
export async function resetContent(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('content').delete().neq('id', '')
    if (error) throw new Error(error.message)
    localStorage.removeItem(CACHE_KEY)
  } else localStorage.removeItem(LOCAL_KEY)
}

/** قراءة ملف كـ data URL (للوضع المحلي بدون Supabase فقط، ملفات صغيرة) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// ── أصوات الحروف ──────────────────────────────────────────
/** يجلب أصوات الحروف المرفوعة من القاعدة ويحدّث الذاكرة التي يقرؤها المشغّل */
export async function loadLetterAudio(): Promise<void> {
  if (!supabase) return
  try {
    const { data, error } = await supabase.from('letter_audio').select('letter_id, audio_url')
    if (error || !data) return
    const map: Record<string, string> = {}
    for (const r of data as { letter_id: string; audio_url: string }[]) map[r.letter_id] = r.audio_url
    localStorage.setItem(LETTER_KEY, JSON.stringify(map))
  } catch {}
}

export async function saveLetterAudioRemote(letterId: string, url: string | null): Promise<void> {
  if (!supabase) return
  if (url) {
    const { error } = await supabase.from('letter_audio').upsert({ letter_id: letterId, audio_url: url, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('letter_audio').delete().eq('letter_id', letterId)
    if (error) throw new Error(error.message)
  }
}
