'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Pic from '@/components/Pic'
import { continents, countries, countryByCode, flagUrl } from '@/lib/countries'
import { getColorFromGradient, getCoverColors } from '@/lib/data'
import { speak, speakEn, stopSpeaking } from '@/lib/speech'
import { addStars, markCountry } from '@/lib/store'

export default function CountryPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const c = countryByCode(code)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<{ options: string[]; chosen: string | null }>({ options: [], chosen: null })

  useEffect(() => {
    if (!c) return
    if (markCountry(c.code)) { addStars(5); setToast('+5 ⭐ دولة جديدة!'); setTimeout(() => setToast(null), 1800) }
    const others = countries.filter(x => x.code !== c.code).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.capital)
    setQuiz({ options: [c.capital, ...others].sort(() => Math.random() - 0.5), chosen: null })
    return () => stopSpeaking()
  }, [c])

  if (!c) return <div className="min-h-screen flex items-center justify-center"><Link href="/world" className="text-purple-600 font-semibold">الدولة غير موجودة — رجوع</Link></div>

  const cont = continents[c.continent]
  const bg = getColorFromGradient(cont.color), colors = getCoverColors(cont.color)
  const say = (k: string, t: string) => { setSpeaking(k); speak(t, { onEnd: () => setSpeaking(null) }) }
  const intro = `${c.name}. عاصمتها ${c.capital}. تقع في قارة ${cont.name}. يتكلم أهلها ${c.language}. ومشهورة بـ ${c.famousFor}.`
  const idx = countries.findIndex(x => x.code === c.code)
  const prev = countries[idx - 1], next = countries[idx + 1]

  const answer = (v: string) => {
    if (quiz.chosen) return
    setQuiz(q => ({ ...q, chosen: v }))
    if (v === c.capital) { addStars(5); setToast('+5 ⭐ صحيح!'); setTimeout(() => setToast(null), 1800); speak(`صحيح! عاصمة ${c.name} هي ${c.capital}`) } else speak(`لا، عاصمة ${c.name} هي ${c.capital}`)
  }

  const Info = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <button onClick={() => say(label, `${label}: ${value}`)} className="bg-gray-50 rounded-xl p-3 text-right btn-press" style={{ background: speaking === label ? `${colors.from}22` : undefined }}>
      <p className="text-[11px] text-gray-400">{icon} {label}</p><p className="font-bold text-gray-800 text-sm mt-0.5">{value}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="pt-12 pb-6 px-5" style={{ background: bg }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/world')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center btn-press"><span className="text-white">→</span></button>
          <p className="text-white/80 text-sm font-bold">{cont.emoji} {cont.name}</p>
          <div className="w-9" />
        </div>
        <div className="flex flex-col items-center">
          <img src={flagUrl(c.code, 320)} alt={`علم ${c.name}`} className="w-48 rounded-2xl shadow-2xl border-4 border-white/30" />
          <h1 className="text-white text-3xl font-black mt-4">{c.name}</h1>
          <button onClick={() => speakEn(c.en)} className="text-white/80 text-sm btn-press" dir="ltr">🔊 {c.en}</button>
          <button onClick={() => say('intro', intro)} className="mt-3 px-5 py-2 rounded-full bg-white/20 text-white text-sm font-bold btn-press">{speaking === 'intro' ? '⏸ يتكلم...' : '🔊 حدّثني عن ' + c.name}</button>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <Pic imageKey={`country:${c.code}`} emoji={c.landmarkEmoji} size={64} rounded="rounded-xl" />
            <div className="flex-1"><p className="text-[11px] text-gray-400">🏛️ العاصمة</p><p className="font-black text-gray-800 text-2xl">{c.capital}</p></div>
            <button onClick={() => say('cap', `عاصمة ${c.name} هي ${c.capital}`)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center btn-press">🔊</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">بطاقة الدولة</h3>
          <div className="grid grid-cols-2 gap-2">
            <Info icon="🗣️" label="اللغة" value={c.language} />
            <Info icon="💰" label="العملة" value={c.currency} />
            <Info icon="👨‍👩‍👧" label="السكان" value={c.population >= 1 ? `${c.population} مليون تقريباً` : `${Math.round(c.population * 1000)} ألف تقريباً`} />
            <Info icon="⭐" label="مشهورة بـ" value={c.famousFor} />
            <Info icon={c.landmarkEmoji} label="أشهر معلم" value={c.landmark} />
            <Info icon="🗺️" label="القارة" value={cont.name} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">هل تعلم؟ 💡</h3>
          <div className="space-y-2">
            {c.facts.map((f, i) => (
              <button key={i} onClick={() => say('f' + i, f)} className="w-full text-right p-3 rounded-xl flex gap-3 btn-press" style={{ background: speaking === 'f' + i ? `${colors.from}22` : '#F9FAFB' }}>
                <span className="text-xl">{['1️⃣', '2️⃣', '3️⃣', '4️⃣'][i]}</span><p className="text-sm text-gray-700 leading-relaxed flex-1">{f}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-center">ما عاصمة {c.name}؟</h3>
          <div className="grid grid-cols-2 gap-2">
            {quiz.options.map(o => (
              <button key={o} onClick={() => answer(o)} className={`py-3 rounded-xl font-bold text-sm btn-press ${!quiz.chosen ? 'bg-gray-50 text-gray-800' : o === c.capital ? 'bg-green-400 text-white' : quiz.chosen === o ? 'bg-red-300 text-white shake' : 'bg-gray-100 text-gray-300'}`}>{o}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {prev ? <Link href={`/world/${prev.code}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press"><span className="text-gray-400">→</span><img src={flagUrl(prev.code, 160)} alt="" className="h-6 rounded" /><span className="text-xs text-gray-600 truncate">{prev.name}</span></Link> : <div className="flex-1" />}
          {next ? <Link href={`/world/${next.code}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center justify-end gap-2 btn-press"><span className="text-xs text-gray-600 truncate">{next.name}</span><img src={flagUrl(next.code, 160)} alt="" className="h-6 rounded" /><span className="text-gray-400">←</span></Link> : <div className="flex-1" />}
        </div>
      </div>
      {toast && <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up">{toast}</div>}
    </div>
  )
}
