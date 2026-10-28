'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addContent, deleteContent, fileToDataUrl, loadContent, loadLetterAudio, resetContent, saveAllContent, saveLetterAudioRemote, seedDefaults, updateContent } from '@/lib/contentStore'
import { categoryLabels, getColorFromGradient, type Category, type ContentItem } from '@/lib/data'
import { arabicLetters } from '@/lib/letters'
import { getLetterAudio, setLetterAudio, speak } from '@/lib/speech'
import { audioDuration, isSupabaseConfigured, supabase, uploadAudio } from '@/lib/supabase'

const ADMIN_PIN = '4444' // يُستخدم فقط عندما لا يكون Supabase مُعدّاً (وضع محلي)
const LOCAL_MAX_MB = 4
const CLOUD_MAX_MB = 50

const COVER_COLORS = [
  'from-green-400 to-emerald-600', 'from-blue-400 to-cyan-600', 'from-yellow-400 to-orange-500', 'from-pink-400 to-rose-600',
  'from-purple-500 to-indigo-600', 'from-teal-400 to-cyan-600', 'from-orange-400 to-red-500', 'from-amber-400 to-yellow-600',
  'from-violet-500 to-purple-700', 'from-rose-400 to-pink-600', 'from-emerald-500 to-teal-600', 'from-sky-400 to-blue-600',
]
const CATEGORIES = (Object.keys(categoryLabels) as Category[]).filter(c => c !== 'letters').map(value => ({ value, label: categoryLabels[value] }))

const EMPTY: Omit<ContentItem, 'id'> = {
  title: '', subtitle: '', category: 'prophets', duration: '5:00', ageMin: 3, ageMax: 12,
  isPremium: false, emoji: '🎧', coverColor: 'from-purple-500 to-indigo-600', description: '', body: '', audioUrl: '', voiceId: '', isNew: true, isTrending: false,
}

type View = 'list' | 'form' | 'letters'
type Auth = 'loading' | 'out' | 'in' | 'notadmin'
interface Voice { id: string; name: string; category: string; meta: string; preview: string }

export default function AdminPage() {
  const router = useRouter()
  const [auth, setAuth] = useState<Auth>('loading')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [items, setItems] = useState<ContentItem[]>([])
  const [dbEmpty, setDbEmpty] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [view, setView] = useState<View>('list')
  const [editItem, setEditItem] = useState<ContentItem | null>(null)
  const [form, setForm] = useState<Omit<ContentItem, 'id'>>(EMPTY)
  const [busy, setBusy] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [letterAudio, setLetterAudioMap] = useState<Record<string, string>>({})
  const [uploadingLetter, setUploadingLetter] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [voicesError, setVoicesError] = useState('')
  const [bulkVoice, setBulkVoice] = useState('')
  const [bulk, setBulk] = useState<{ kind: string; done: number; total: number; current: string; errors: string[]; finished: boolean } | null>(null)
  const stopRef = useRef(false)
  const audioRef = useRef<HTMLInputElement>(null)
  const letterFileRef = useRef<HTMLInputElement>(null)

  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(null), 3200) }, [])
  const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'خطأ غير معروف')

  // ── المصادقة ────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setAuth(sessionStorage.getItem('fos7a_admin_auth') === 'true' ? 'in' : 'out')
      return
    }
    const sb = supabase
    const check = async (session: { access_token: string; user: { id: string } } | null) => {
      if (!session) { setAuth('out'); setToken(''); return }
      setToken(session.access_token)
      const { data } = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      setAuth(data ? 'in' : 'notadmin')
    }
    sb.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { check(session) })
    return () => sub.subscription.unsubscribe()
  }, [])

  const reload = useCallback(async () => {
    const list = await loadContent()
    setItems(list)
    if (supabase) {
      const { count } = await supabase.from('content').select('id', { count: 'exact', head: true })
      setDbEmpty((count ?? 0) === 0)
    }
  }, [])

  /** يضمن أن القاعدة فيها المحتوى الافتراضي قبل أي حفظ، وإلا لاختفى باقي المحتوى */
  const ensureSeeded = useCallback(async () => {
    if (!supabase) return
    const { count } = await supabase.from('content').select('id', { count: 'exact', head: true })
    if ((count ?? 0) === 0) { await seedDefaults(); setDbEmpty(false) }
  }, [])

  const ttsCall = useCallback(async (text: string, voiceId: string, contentId: string): Promise<string> => {
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId, contentId }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { const e = new Error(j.detail ? `${j.error} — ${j.detail}` : j.error || 'فشل التوليد') as Error & { status?: number }; e.status = r.status; throw e }
    return j.url as string
  }, [token])

  useEffect(() => {
    if (auth !== 'in') return
    reload()
    loadLetterAudio().then(() => setLetterAudioMap(getLetterAudio()))
  }, [auth, reload])

  const login = async () => {
    setLoginError('')
    if (!supabase) {
      if (pin === ADMIN_PIN) { sessionStorage.setItem('fos7a_admin_auth', 'true'); setAuth('in') }
      else { setLoginError('رمز خاطئ'); setTimeout(() => setLoginError(''), 1500) }
      return
    }
    setBusy('login')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(null)
    if (error) setLoginError('البريد أو كلمة المرور غير صحيحة')
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut(); else sessionStorage.removeItem('fos7a_admin_auth')
    setAuth('out'); router.push('/home')
  }

  // ── المحتوى ─────────────────────────────────────────────
  const openAdd = () => { setEditItem(null); setForm(EMPTY); setView('form') }
  const openEdit = (it: ContentItem) => { setEditItem(it); setForm({ ...EMPTY, ...it }); setView('form') }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setBusy('save')
    try {
      await ensureSeeded()
      if (editItem) await updateContent(editItem.id, form); else await addContent(form)
      await reload(); setView('list'); notify(editItem ? '✅ تم التعديل' : '✅ تمت الإضافة')
    } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
    setBusy(null)
  }

  const handleDelete = async (id: string) => {
    try { await deleteContent(id); await reload(); notify('🗑️ تم الحذف') } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
    setDeleteConfirm(null)
  }

  const handleSeed = async () => {
    setBusy('seed')
    try { const n = await seedDefaults(); await reload(); notify(`✅ رُفع ${n} عنصراً إلى قاعدة البيانات`) } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
    setBusy(null)
  }

  const setAudio = async (url: string) => {
    setForm(f => ({ ...f, audioUrl: url }))
    const d = await audioDuration(url)
    if (d) setForm(f => ({ ...f, duration: d }))
  }

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const max = supabase ? CLOUD_MAX_MB : LOCAL_MAX_MB
    if (file.size > max * 1024 * 1024) { notify(`⚠️ الملف أكبر من ${max}MB`); return }
    setBusy('upload')
    try {
      const url = supabase ? await uploadAudio(file, 'content', editItem?.id || form.title || 'new') : await fileToDataUrl(file)
      await setAudio(url); notify('🎵 تم رفع الملف الصوتي')
    } catch (er) { notify(`⚠️ ${errMsg(er)}`) }
    setBusy(null)
  }

  // ── ElevenLabs ──────────────────────────────────────────
  const loadVoicesList = async () => {
    setVoicesError(''); setBusy('voices')
    try {
      const r = await fetch('/api/voices', { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'فشل التحميل')
      setVoices(j.voices); if (!j.voices.length) setVoicesError('لا توجد أصوات في حسابك')
    } catch (e) { setVoicesError(errMsg(e)) }
    setBusy(null)
  }

  const generateVoice = async () => {
    if (!form.body?.trim() || !form.voiceId) return
    if (form.audioUrl && !confirm('يوجد صوت لهذه القصة. التوليد من جديد يستهلك رصيد ElevenLabs. هل تريد المتابعة؟')) return
    setBusy('tts')
    try {
      const url = await ttsCall(form.body!, form.voiceId!, editItem?.id || 'new')
      await setAudio(url); notify(`🎙️ تم توليد الصوت (${form.body!.length} حرفاً). اضغط حفظ لتثبيته`)
    } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
    setBusy(null)
  }

  // ── أصوات الحروف ────────────────────────────────────────
  const handleLetterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; const id = uploadingLetter
    e.target.value = ''
    if (!file || !id) return
    if (file.size > 2 * 1024 * 1024) { notify('⚠️ ملف صوت الحرف يجب أن يكون أقل من 2MB'); return }
    setBusy('letter')
    try {
      const url = supabase ? await uploadAudio(file, 'letters', id) : await fileToDataUrl(file)
      await saveLetterAudioRemote(id, url); setLetterAudio(id, url); setLetterAudioMap(getLetterAudio()); notify('✅ تم حفظ صوت الحرف')
    } catch (er) { notify(`⚠️ ${errMsg(er)}`) }
    setUploadingLetter(null); setBusy(null)
  }

  const removeLetter = async (id: string) => {
    try { await saveLetterAudioRemote(id, null); setLetterAudio(id, null); setLetterAudioMap(getLetterAudio()) } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
  }

  // ── التوليد الجماعي ─────────────────────────────────────
  // القرآن مستثنى عمداً: التلاوة تُرفع بصوت قارئ حقيقي وليس بصوت اصطناعي.
  const todoStories = items.filter(i => i.category !== 'quran' && i.body?.trim() && !i.audioUrl)
  const todoStoryChars = todoStories.reduce((a, i) => a + (i.body?.length || 0), 0)
  const todoLetters = arabicLetters.filter(l => !letterAudio[l.id])

  const runBulk = async (kind: 'stories' | 'letters') => {
    if (!bulkVoice) { notify('اختاري الصوت أولاً'); return }
    const total = kind === 'stories' ? todoStories.length : todoLetters.length
    if (!total) return
    const chars = kind === 'stories' ? todoStoryChars : todoLetters.reduce((a, l) => a + l.name.length, 0)
    if (!confirm(`سيتم توليد ${total} ملفاً صوتياً (حوالي ${chars.toLocaleString('ar-EG')} حرفاً) وسيُخصم من رصيد ElevenLabs. المتابعة؟`)) return
    stopRef.current = false
    const st = { kind, done: 0, total, current: '', errors: [] as string[], finished: false }
    setBulk({ ...st })
    try { if (kind === 'stories') await ensureSeeded() } catch (e) { notify(`⚠️ ${errMsg(e)}`); setBulk(null); return }

    const jobs = kind === 'stories'
      ? todoStories.map(i => ({ id: i.id, label: i.title, run: async () => {
          const url = await ttsCall(i.body!, bulkVoice, i.id)
          const dur = await audioDuration(url)
          await updateContent(i.id, { audioUrl: url, voiceId: bulkVoice, ...(dur ? { duration: dur } : {}) })
        } }))
      : todoLetters.map(l => ({ id: l.id, label: `حرف ${l.name}`, run: async () => {
          const url = await ttsCall(l.name, bulkVoice, `letter-${l.id}`)
          await saveLetterAudioRemote(l.id, url); setLetterAudio(l.id, url)
        } }))

    for (const job of jobs) {
      if (stopRef.current) break
      st.current = job.label; setBulk({ ...st })
      try { await job.run(); st.done++ }
      catch (e) {
        const err = e as Error & { status?: number }
        st.errors.push(`${job.label}: ${err.message.slice(0, 120)}`)
        // رصيد منتهٍ أو مفتاح خاطئ أو ضغط زائد: لا فائدة من المتابعة
        if (err.status === 401 || err.status === 402 || err.status === 429 || err.status === 502) { setBulk({ ...st, finished: true }); break }
      }
      setBulk({ ...st })
    }
    st.current = ''; setBulk({ ...st, finished: true })
    setLetterAudioMap(getLetterAudio()); await reload()
  }

  // ── تصدير/استيراد ───────────────────────────────────────
  const handleExport = () => {
    const data = JSON.stringify({ content: items, letterAudio: getLetterAudio() }, null, 2)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    a.download = `fos7a-content-${new Date().toISOString().slice(0, 10)}.json`; a.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        const list = Array.isArray(data) ? data : data.content
        if (!Array.isArray(list)) throw new Error('ملف غير صالح')
        await saveAllContent(list); await reload(); notify('📥 تم الاستيراد')
      } catch (er) { notify(`⚠️ ${errMsg(er)}`) }
    }
    reader.readAsText(file)
  }

  const handleReset = async () => {
    if (!confirm(supabase ? 'سيُحذف كل المحتوى من قاعدة البيانات ويعود المحتوى الافتراضي المضمّن. متأكد؟' : 'إعادة المحتوى الافتراضي؟ ستُحذف التعديلات.')) return
    try { await resetContent(); await reload(); notify('🔄 تمت الإعادة') } catch (e) { notify(`⚠️ ${errMsg(e)}`) }
  }

  const filtered = items.filter(i => (catFilter === 'all' || i.category === catFilter) && (!search || (i.title + i.subtitle).includes(search)))
  const stats = { total: items.length, premium: items.filter(i => i.isPremium).length, audio: items.filter(i => i.audioUrl).length, text: items.filter(i => i.body).length }

  // ── شاشات الدخول ────────────────────────────────────────
  if (auth === 'loading') return <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E0A4A' }}><div className="text-4xl animate-spin">🎧</div></div>

  if (auth === 'notadmin') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
      <div className="text-6xl mb-4">⛔</div>
      <h1 className="text-white font-bold text-xl mb-2">هذا الحساب ليس مشرفاً</h1>
      <p className="text-white/70 text-sm mb-6 max-w-xs">سجّلتِ الدخول بنجاح، لكن الحساب غير مضاف في جدول المشرفين. شغّلي ملف <b>supabase/make-admin.sql</b> في Supabase.</p>
      <button onClick={logout} className="px-6 py-3 rounded-2xl bg-white text-gray-800 font-bold btn-press">تسجيل الخروج</button>
    </div>
  )

  if (auth === 'out') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
      <div className="text-6xl mb-4">🔐</div>
      <h1 className="text-white font-bold text-2xl mb-2">لوحة التحكم</h1>
      <p className="text-white/60 text-sm mb-8">{isSupabaseConfigured ? 'سجّل دخول المشرف' : 'أدخل رمز ولي الأمر للدخول'}</p>
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl">
        {isSupabaseConfigured ? (
          <div className="space-y-3 mb-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" dir="ltr" autoComplete="email"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-left outline-none focus:border-purple-400" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="كلمة المرور" autoComplete="current-password"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400" />
          </div>
        ) : (
          <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} maxLength={6} autoFocus dir="ltr"
            className={`w-full text-center text-3xl font-bold border-2 rounded-2xl py-4 outline-none mb-4 ${loginError ? 'border-red-400 bg-red-50 shake' : 'border-gray-200'}`} style={{ letterSpacing: 8 }} placeholder="••••" />
        )}
        {loginError && <p className="text-red-500 text-sm text-center mb-3">{loginError}</p>}
        <button onClick={login} disabled={busy === 'login'} className="w-full py-3 rounded-2xl text-white font-bold btn-press" style={{ background: busy === 'login' ? '#9CA3AF' : '#5C35BF' }}>{busy === 'login' ? '...' : 'دخول'}</button>
        {!isSupabaseConfigured && <p className="text-center text-gray-400 text-xs mt-3">وضع محلي — الرمز الافتراضي: 4444</p>}
        <button onClick={() => router.back()} className="w-full mt-2 py-2 text-gray-400 text-xs btn-press">رجوع</button>
      </div>
    </div>
  )

  const Input = ({ label, value, onChange, placeholder, ltr, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; placeholder?: string; ltr?: boolean; type?: string }) => (
    <div>
      <label className="text-xs text-gray-500 font-semibold mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={ltr ? 'ltr' : 'rtl'}
        className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 ${ltr ? 'text-left' : ''}`} />
    </div>
  )

  // ── نموذج الإضافة/التعديل ───────────────────────────────
  if (view === 'form') return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
        <h1 className="font-bold text-gray-900 text-lg flex-1">{editItem ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</h1>
        <button onClick={handleSave} disabled={!!busy || !form.title.trim()} className="btn-press px-5 py-2 rounded-xl text-white font-bold text-sm" style={{ background: busy || !form.title.trim() ? '#9CA3AF' : '#5C35BF' }}>
          {busy === 'save' ? '...' : 'حفظ'}
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl shadow-lg" style={{ background: getColorFromGradient(form.coverColor) }}>{form.emoji || '🎧'}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400">المعلومات الأساسية</p>
          <Input label="العنوان *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="مثال: قصة سيدنا نوح" />
          <Input label="العنوان الفرعي" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="مثال: والسفينة العظيمة" />
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">الوصف المختصر</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-1">📜 نص القصة الكامل</p>
          <p className="text-[11px] text-gray-400 mb-2">يُقرأ بالصوت الآلي عند عدم وجود ملف صوتي، ويُستخدم لتوليد الصوت بـ ElevenLabs.</p>
          <textarea value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={7} placeholder="اكتب القصة هنا... افصل الجمل بنقطة."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-purple-400 resize-y" />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-gray-400">{(form.body || '').length} حرفاً</span>
            {form.body && <button onClick={() => speak(form.body!.split('.')[0])} className="text-xs font-semibold btn-press" style={{ color: '#5C35BF' }}>🔊 اسمع أول جملة</button>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-3">🎙️ الصوت</p>

          {isSupabaseConfigured && (
            <div className="rounded-xl bg-purple-50 p-3 mb-4">
              <p className="text-xs font-bold text-purple-800 mb-2">توليد بـ ElevenLabs</p>
              {voices.length === 0 ? (
                <button onClick={loadVoicesList} disabled={busy === 'voices'} className="w-full py-2.5 rounded-xl bg-white text-purple-700 text-sm font-bold btn-press">
                  {busy === 'voices' ? '⏳ جاري التحميل...' : '📥 تحميل أصواتي من ElevenLabs'}
                </button>
              ) : (
                <>
                  <select value={form.voiceId || ''} onChange={e => setForm(f => ({ ...f, voiceId: e.target.value }))} className="w-full border border-purple-200 bg-white rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none">
                    <option value="">— اختر الصوت —</option>
                    {voices.map(v => <option key={v.id} value={v.id}>{v.name}{v.meta ? ` (${v.meta})` : ''}</option>)}
                  </select>
                  {form.voiceId && voices.find(v => v.id === form.voiceId)?.preview && (
                    <audio controls src={voices.find(v => v.id === form.voiceId)!.preview} className="w-full h-8 mb-2" />
                  )}
                  <button onClick={generateVoice} disabled={busy === 'tts' || !form.voiceId || !form.body?.trim()}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold btn-press" style={{ background: busy === 'tts' || !form.voiceId || !form.body?.trim() ? '#9CA3AF' : '#5C35BF' }}>
                    {busy === 'tts' ? '⏳ جاري التوليد (قد يستغرق دقيقة)...' : '🎙️ ولّد الصوت من النص'}
                  </button>
                </>
              )}
              {voicesError && <p className="text-xs text-red-500 mt-2">{voicesError}</p>}
            </div>
          )}

          <Input label="رابط الصوت (mp3 / m4a)" value={form.audioUrl || ''} onChange={v => setForm(f => ({ ...f, audioUrl: v }))} placeholder="https://..." ltr />
          <p className="text-center text-gray-400 text-xs my-2">أو</p>
          <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudioFile} className="hidden" />
          <button onClick={() => audioRef.current?.click()} disabled={busy === 'upload'} className="btn-press w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium">
            {busy === 'upload' ? '⏳ جاري الرفع...' : `📂 رفع ملف صوتي (حتى ${supabase ? CLOUD_MAX_MB : LOCAL_MAX_MB}MB)`}
          </button>
          {form.audioUrl && (
            <div className="mt-3 p-2 bg-green-50 rounded-xl flex items-center gap-2">
              <audio controls src={form.audioUrl} className="flex-1 h-9" />
              <button onClick={() => setForm(f => ({ ...f, audioUrl: '' }))} className="text-red-400 text-sm px-2 btn-press">✕</button>
            </div>
          )}
          {!form.audioUrl && !form.body && <p className="text-[11px] text-amber-600 mt-2">⚠️ بدون صوت ولا نص سيُشغَّل المحتوى بشكل صامت</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400">التصنيف</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">الفئة</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input label="المدة (د:ث)" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="5:30" ltr />
            <Input label="العمر من" type="number" value={form.ageMin} onChange={v => setForm(f => ({ ...f, ageMin: +v }))} />
            <Input label="العمر إلى" type="number" value={form.ageMax} onChange={v => setForm(f => ({ ...f, ageMax: +v }))} />
            {form.category === 'prophets' && <Input label="الترتيب الزمني" type="number" value={form.order ?? ''} onChange={v => setForm(f => ({ ...f, order: v ? +v : undefined }))} placeholder="1" />}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {([['isPremium', '👑 مدفوع'], ['isNew', '✨ جديد'], ['isTrending', '🔥 رائج']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))} className="py-2 rounded-xl text-xs font-bold btn-press border-2"
                style={{ background: form[key] ? '#5C35BF' : 'white', color: form[key] ? 'white' : '#6B7280', borderColor: form[key] ? '#5C35BF' : '#E5E7EB' }}>{label}</button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400">{form.isPremium ? '👑 هذا المحتوى للمشتركين فقط' : '🆓 هذا المحتوى مجاني للجميع'}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-3">الشكل</p>
          <Input label="الإيموجي" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} placeholder="🎧" />
          <label className="text-xs text-gray-500 font-semibold mb-2 mt-3 block">لون الغلاف</label>
          <div className="grid grid-cols-6 gap-2">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, coverColor: c }))} className="w-10 h-10 rounded-xl btn-press relative"
                style={{ background: getColorFromGradient(c), outline: form.coverColor === c ? '3px solid #5C35BF' : 'none', outlineOffset: 2 }}>
                {form.coverColor === c && <span className="absolute inset-0 flex items-center justify-center text-white font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </div>
  )

  // ── أصوات الحروف ────────────────────────────────────────
  if (view === 'letters') return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
        <div className="flex-1"><h1 className="font-bold text-gray-900 text-lg">أصوات الحروف</h1><p className="text-xs text-gray-400">{Object.keys(letterAudio).length}/28 حرفاً بصوت مسجّل</p></div>
      </div>
      <input ref={letterFileRef} type="file" accept="audio/*" onChange={handleLetterFile} className="hidden" />
      <div className="px-5 py-4">
        <p className="text-xs text-gray-500 bg-blue-50 rounded-xl p-3 mb-4">💡 ارفع تسجيلاً قصيراً لكل حرف (أقل من 2MB). الحروف بدون تسجيل تُقرأ بالصوت الآلي. يمكنك توليدها من ElevenLabs وتنزيلها ثم رفعها هنا.</p>
        <div className="space-y-2">
          {arabicLetters.map(l => {
            const url = letterAudio[l.id]
            return (
              <div key={l.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0" style={{ background: getColorFromGradient(l.color) }}>{l.char}</div>
                <div className="flex-1 min-w-0"><p className="font-bold text-gray-800 text-sm">{l.name}</p><p className="text-[11px] text-gray-400">{url ? '🎙️ صوت مسجّل' : '🗣️ صوت آلي'}</p></div>
                {url && <button onClick={() => new Audio(url).play()} className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center btn-press">▶</button>}
                <button onClick={() => { setUploadingLetter(l.id); letterFileRef.current?.click() }} disabled={busy === 'letter'} className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center btn-press text-sm">📂</button>
                {url && <button onClick={() => removeLetter(l.id)} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center btn-press text-sm">🗑️</button>}
              </div>
            )
          })}
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </div>
  )

  // ── القائمة ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-xl font-bold text-gray-900">لوحة التحكم 🎛️</h1><p className="text-gray-400 text-xs">{isSupabaseConfigured ? '☁️ متصل بقاعدة البيانات — المحتوى مشترك بين كل الأجهزة' : '📱 وضع محلي — المحتوى على هذا الجهاز فقط'}</p></div>
          <button onClick={logout} className="text-gray-400 text-xs border border-gray-200 px-3 py-1.5 rounded-xl btn-press">خروج</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'المحتوى', v: stats.total, e: '📚' }, { l: 'مدفوع', v: stats.premium, e: '👑' }, { l: 'بصوت', v: stats.audio, e: '🎙️' }, { l: 'بنص', v: stats.text, e: '📜' }].map(s => (
            <div key={s.l} className="bg-gray-50 rounded-2xl p-2 text-center"><div className="text-lg">{s.e}</div><div className="font-bold text-gray-800">{s.v}</div><div className="text-gray-400 text-[10px]">{s.l}</div></div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <span className="text-gray-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن محتوى..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none" />
        </div>
      </div>

      {isSupabaseConfigured && dbEmpty && (
        <div className="mx-5 mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="font-bold text-amber-900 text-sm mb-1">قاعدة البيانات فارغة</p>
          <p className="text-amber-800 text-xs mb-3">المعروض الآن هو المحتوى المضمّن في التطبيق. ارفعه مرة واحدة إلى القاعدة لتتمكن من تعديله وإضافة الأصوات.</p>
          <button onClick={handleSeed} disabled={busy === 'seed'} className="w-full py-2.5 rounded-xl text-white text-sm font-bold btn-press" style={{ background: busy === 'seed' ? '#9CA3AF' : '#D97706' }}>
            {busy === 'seed' ? '⏳ جاري الرفع...' : '⬆️ رفع المحتوى الافتراضي إلى القاعدة'}
          </button>
        </div>
      )}

      <div className="px-5 py-3 flex gap-2 overflow-x-auto">
        {[{ value: 'all', label: 'الكل' }, ...CATEGORIES].map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold btn-press" style={{ background: catFilter === c.value ? '#5C35BF' : '#F3F4F6', color: catFilter === c.value ? 'white' : '#6B7280' }}>{c.label}</button>
        ))}
      </div>

      <div className="px-5 flex gap-2 mb-3">
        <button onClick={openAdd} className="flex-1 btn-press py-3 rounded-2xl text-white font-bold text-sm shadow-lg" style={{ background: 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>+ إضافة محتوى</button>
        <button onClick={() => setView('letters')} className="btn-press px-4 py-3 rounded-2xl bg-white text-gray-700 text-sm shadow-sm font-bold">🔤 أصوات الحروف</button>
      </div>
      <div className="px-5 flex gap-2 mb-4">
        <button onClick={handleExport} className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-600 text-xs shadow-sm">📥 تصدير JSON</button>
        <label className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-600 text-xs shadow-sm text-center cursor-pointer">📤 استيراد<input type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
        <button onClick={handleReset} className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-400 text-xs shadow-sm">🔄 افتراضي</button>
      </div>

      {isSupabaseConfigured && (
        <div className="mx-5 mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-sm mb-1">🎙️ توليد جماعي بصوت ElevenLabs</p>
          <p className="text-[11px] text-gray-400 mb-3">يولّد صوتاً لكل قصة ليس لها ملف صوتي، فيحل محل القراءة الآلية. القرآن مستثنى.</p>
          {voices.length === 0 ? (
            <button onClick={loadVoicesList} disabled={busy === 'voices'} className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold btn-press">{busy === 'voices' ? '⏳ جاري التحميل...' : '📥 تحميل أصواتي من ElevenLabs'}</button>
          ) : (
            <>
              <select value={bulkVoice} onChange={e => setBulkVoice(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none">
                <option value="">— اختاري الصوت —</option>
                {voices.map(v => <option key={v.id} value={v.id}>{v.name}{v.meta ? ` (${v.meta})` : ''}</option>)}
              </select>
              {bulkVoice && voices.find(v => v.id === bulkVoice)?.preview && <audio controls src={voices.find(v => v.id === bulkVoice)!.preview} className="w-full h-8 mb-2" />}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => runBulk('stories')} disabled={!!bulk && !bulk.finished || !bulkVoice || todoStories.length === 0}
                  className="py-2.5 rounded-xl text-white text-xs font-bold btn-press" style={{ background: !bulkVoice || todoStories.length === 0 || (!!bulk && !bulk.finished) ? '#9CA3AF' : '#5C35BF' }}>
                  📚 القصص ({todoStories.length})
                </button>
                <button onClick={() => runBulk('letters')} disabled={!!bulk && !bulk.finished || !bulkVoice || todoLetters.length === 0}
                  className="py-2.5 rounded-xl text-white text-xs font-bold btn-press" style={{ background: !bulkVoice || todoLetters.length === 0 || (!!bulk && !bulk.finished) ? '#9CA3AF' : '#7C3AED' }}>
                  🔤 الحروف ({todoLetters.length})
                </button>
              </div>
              {todoStories.length > 0 && <p className="text-[11px] text-gray-400 mt-2">القصص: حوالي {todoStoryChars.toLocaleString('ar-EG')} حرفاً</p>}
            </>
          )}
          {voicesError && <p className="text-xs text-red-500 mt-2">{voicesError}</p>}
          {bulk && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{bulk.finished ? (bulk.errors.length ? 'انتهى مع أخطاء' : '✅ اكتمل') : `⏳ ${bulk.current}`}</span><span>{bulk.done}/{bulk.total}</span></div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(bulk.done / Math.max(bulk.total, 1)) * 100}%`, background: bulk.errors.length ? '#F59E0B' : '#5C35BF' }} /></div>
              {!bulk.finished && <button onClick={() => { stopRef.current = true }} className="mt-2 text-xs text-red-500 font-semibold btn-press">⏹ إيقاف بعد الملف الحالي</button>}
              {bulk.errors.length > 0 && <div className="mt-2 rounded-lg bg-red-50 p-2 max-h-28 overflow-y-auto">{bulk.errors.map((e, i) => <p key={i} className="text-[11px] text-red-600">{e}</p>)}</div>}
            </div>
          )}
        </div>
      )}

      <div className="px-5 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-3">📭</div><p className="text-gray-400 text-sm">لا يوجد محتوى</p></div>
        ) : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative" style={{ background: getColorFromGradient(item.coverColor) }}>
              {item.emoji}
              {item.audioUrl && <span className="absolute -bottom-1 -right-1 text-[9px] bg-green-400 text-white rounded-full w-4 h-4 flex items-center justify-center">▶</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                {item.isPremium ? <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">مدفوع</span> : <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">مجاني</span>}
                {item.body && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">نص</span>}
              </div>
              <p className="text-gray-400 text-xs">{categoryLabels[item.category]} · {item.duration} · {item.ageMin}-{item.ageMax} سنة</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center btn-press text-sm">✏️</button>
              <button onClick={() => setDeleteConfirm(item.id)} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center btn-press text-sm">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="font-bold text-gray-800 text-center mb-1">حذف المحتوى؟</h3>
            <p className="text-gray-400 text-sm text-center mb-5">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm btn-press">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm btn-press">حذف</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast} />}
    </div>
  )
}

function Toast({ msg }: { msg: string }) {
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up max-w-[340px] text-center">{msg}</div>
}
