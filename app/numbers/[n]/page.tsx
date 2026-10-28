'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TracingCanvas from '@/components/TracingCanvas'
import { numbers, numberByN, numberName, toArabicDigits } from '@/lib/numbers'
import { getColorFromGradient, getCoverColors } from '@/lib/data'
import { speak, speakEn, stopSpeaking } from '@/lib/speech'
import { addStars, markNumber } from '@/lib/store'

type Tab = 'learn' | 'write' | 'quiz'

export default function NumberPage() {
  const { n: raw } = useParams<{ n: string }>()
  const n = parseInt(raw, 10)
  const router = useRouter()
  const item = numberByN(n)
  const [tab, setTab] = useState<Tab>('learn')
  const [digits, setDigits] = useState<'latin' | 'arabic'>('latin')
  const [counted, setCounted] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<{ count: number; options: number[]; emoji: string } | null>(null)
  const [chosen, setChosen] = useState<number | null>(null)

  useEffect(() => {
    if (!item) return
    markNumber(item.n)
    setTab('learn'); setCounted(0); setChosen(null)
    const count = item.n <= 10 ? item.n : Math.floor(Math.random() * 10) + 1
    const opts = new Set([count]); while (opts.size < 4) opts.add(Math.max(0, count + Math.floor(Math.random() * 7) - 3))
    setQuiz({ count, options: Array.from(opts).sort(() => Math.random() - 0.5), emoji: item.emoji })
    return () => stopSpeaking()
  }, [item])

  if (!item) return <div className="min-h-screen flex items-center justify-center"><Link href="/numbers" className="text-purple-600 font-semibold">الرقم غير موجود — رجوع</Link></div>

  const bg = getColorFromGradient(item.color), colors = getCoverColors(item.color)
  const idx = numbers.findIndex(x => x.n === item.n)
  const prev = numbers[idx - 1], next = numbers[idx + 1]
  const objects = Math.min(item.n, 20)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800) }

  const tapObject = (i: number) => {
    if (i !== counted) return
    const c = i + 1; setCounted(c); speak(numberName(c))
    if (c === objects) { addStars(5); showToast('+5 ⭐ عددت كل شيء!') }
  }
  const onWritten = () => { addStars(10); showToast('+10 ⭐ كتبت الرقم!'); speak(`أحسنت! كتبت الرقم ${item.ar}`) }
  const answer = (v: number) => {
    if (chosen !== null || !quiz) return
    setChosen(v)
    if (v === quiz.count) { addStars(5); showToast('+5 ⭐ صحيح!'); speak(`صحيح! ${numberName(v)}`) } else speak('حاول مرة أخرى')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="pt-12 pb-6 px-5" style={{ background: bg }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/numbers')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center btn-press"><span className="text-white">→</span></button>
          <div className="flex bg-black/20 rounded-full p-0.5">
            {(['latin', 'arabic'] as const).map(d => <button key={d} onClick={() => setDigits(d)} className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: digits === d ? 'white' : 'transparent', color: digits === d ? colors.to : 'white' }}>{d === 'latin' ? '123' : '١٢٣'}</button>)}
          </div>
          <div className="w-9" />
        </div>
        <div className="flex flex-col items-center">
          <button onClick={() => speak(item.ar)} className="btn-press">
            <div className="w-40 h-40 rounded-[40px] bg-white/20 flex items-center justify-center shadow-xl"><span className="text-white font-black leading-none" style={{ fontSize: item.n >= 100 ? 72 : 110 }}>{digits === 'latin' ? item.n : item.arabic}</span></div>
          </button>
          <h1 className="text-white text-3xl font-black mt-4">{item.ar}</h1>
          <button onClick={() => speakEn(item.en)} className="text-white/80 text-sm mt-1 btn-press" dir="ltr">🔊 {item.en}</button>
        </div>
      </div>

      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl p-1.5 shadow-md flex">
          {([['learn', '🔢 عدّ'], ['write', '✏️ اكتب'], ['quiz', '🧠 اختبر']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-press" style={{ background: tab === t ? bg : 'transparent', color: tab === t ? 'white' : '#6B7280' }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {tab === 'learn' && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1">عدّ معي</h3>
              <p className="text-xs text-gray-400 mb-3">{objects === 0 ? 'صفر يعني لا شيء!' : `اضغط على ${item.emoji} واحداً واحداً بالترتيب`}</p>
              {objects === 0 ? <div className="text-center text-6xl py-6">🫥</div> : (
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: objects }).map((_, i) => (
                    <button key={i} onClick={() => tapObject(i)} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl btn-press transition-all relative"
                      style={{ background: i < counted ? `${colors.from}33` : '#F9FAFB', opacity: i < counted ? 1 : 0.9, transform: i < counted ? 'scale(1.05)' : 'scale(1)' }}>
                      {item.emoji}
                      {i < counted && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{ background: colors.to }}>{i + 1}</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="text-center mt-3 text-2xl font-black" style={{ color: colors.to }}>{counted} / {objects}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">الرقم بثلاث طرق</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button onClick={() => speak(item.ar)} className="bg-gray-50 rounded-xl py-3 btn-press"><p className="text-3xl font-black" style={{ color: colors.to }}>{item.n}</p><p className="text-[11px] text-gray-400 mt-1">رقم</p></button>
                <button onClick={() => speak(item.ar)} className="bg-gray-50 rounded-xl py-3 btn-press"><p className="text-3xl font-black" style={{ color: colors.to }}>{item.arabic}</p><p className="text-[11px] text-gray-400 mt-1">عربي</p></button>
                <button onClick={() => speak(item.ar)} className="bg-gray-50 rounded-xl py-3 btn-press"><p className="text-lg font-black leading-tight pt-1" style={{ color: colors.to }}>{item.ar}</p><p className="text-[11px] text-gray-400 mt-1">كلمة</p></button>
              </div>
            </div>
            {item.n > 0 && item.n <= 20 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">جيران الرقم</h3>
                <div className="flex items-center justify-center gap-3 text-2xl font-black" dir="ltr">
                  <span className="text-gray-300">{item.n - 1}</span><span className="text-gray-300">←</span>
                  <span className="w-14 h-14 rounded-2xl text-white flex items-center justify-center" style={{ background: bg }}>{item.n}</span>
                  <span className="text-gray-300">→</span><span className="text-gray-300">{item.n + 1}</span>
                </div>
              </div>
            )}
            <button onClick={() => setTab('write')} className="w-full py-4 rounded-2xl text-white font-black text-lg btn-press shadow-lg" style={{ background: bg }}>✏️ هيا نكتب الرقم {item.n}</button>
          </>
        )}

        {tab === 'write' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-3">اكتب الرقم بإصبعك</h3>
            <TracingCanvas char={digits === 'latin' ? String(item.n) : toArabicDigits(item.n)} color={colors.to} onComplete={onWritten} />
          </div>
        )}

        {tab === 'quiz' && quiz && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-center">كم عدد {quiz.emoji}؟</h3>
            <div className="bg-amber-50 rounded-2xl p-4 flex flex-wrap justify-center gap-2 mb-4">{Array.from({ length: quiz.count }).map((_, i) => <span key={i} className="text-4xl">{quiz.emoji}</span>)}</div>
            <div className="grid grid-cols-4 gap-2">
              {quiz.options.map(v => (
                <button key={v} onClick={() => answer(v)} className={`py-4 rounded-2xl text-2xl font-black btn-press ${chosen === null ? 'bg-gray-50 text-gray-800' : v === quiz.count ? 'bg-green-400 text-white' : chosen === v ? 'bg-red-300 text-white shake' : 'bg-gray-100 text-gray-300'}`}>{digits === 'latin' ? v : toArabicDigits(v)}</button>
              ))}
            </div>
            {chosen !== null && <button onClick={() => { setChosen(null); setQuiz(q => q && { ...q, options: [...q.options].sort(() => Math.random() - 0.5) }) }} className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm btn-press">🔄 مرة أخرى</button>}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {prev ? <Link href={`/numbers/${prev.n}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press"><span className="text-gray-400">→</span><span className="text-2xl font-black" style={{ color: getCoverColors(prev.color).to }}>{prev.n}</span><span className="text-xs text-gray-500">السابق</span></Link> : <div className="flex-1" />}
          {next ? <Link href={`/numbers/${next.n}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center justify-end gap-2 btn-press"><span className="text-xs text-gray-500">التالي</span><span className="text-2xl font-black" style={{ color: getCoverColors(next.color).to }}>{next.n}</span><span className="text-gray-400">←</span></Link> : <div className="flex-1" />}
        </div>
      </div>
      {toast && <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up">{toast}</div>}
    </div>
  )
}
