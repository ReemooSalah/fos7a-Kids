'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { englishLetters } from '@/lib/english'
import { getColorFromGradient } from '@/lib/data'
import { getLearn } from '@/lib/store'
import { speakEn } from '@/lib/speech'

export default function EnglishPage() {
  const router = useRouter()
  const [learned, setLearned] = useState<string[]>([])
  const [written, setWritten] = useState<string[]>([])

  useEffect(() => { const p = getLearn().english; setLearned(p.learned); setWritten(p.written) }, [])

  const next = englishLetters.find(l => !learned.includes(l.id)) || englishLetters[0]
  const pct = Math.round((learned.length / 26) * 100)

  return (
    <div className="pb-36 min-h-screen bg-gray-50">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white">English Letters 🔠</h1>
            <p className="text-white/60 text-sm">الحروف الإنجليزية من A إلى Z</p>
          </div>
          <button onClick={() => speakEn('A B C D E F G H I J K L M N O P Q R S T U V W X Y Z')} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center btn-press"><span className="text-xl">🔊</span></button>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between text-white text-sm mb-2"><span className="font-bold">تقدّمك</span><span>{learned.length} / 26</span></div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F5A623' }} /></div>
          <div className="flex gap-4 mt-3 text-white/80 text-xs"><span>🎧 استمعت: {learned.length}</span><span>✏️ كتبت: {written.length}</span></div>
        </div>
      </div>

      <div className="px-5 -mt-3">
        <Link href={`/english/${next.id}`}>
          <div className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 btn-press">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: getColorFromGradient(next.color) }}>
              <span className="text-3xl font-black">{next.upper}</span><span className="text-xl font-bold opacity-80">{next.lower}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{learned.length ? 'أكمل التعلم' : 'ابدأ من هنا'}</p>
              <p className="font-black text-gray-800 text-lg">Letter {next.upper}</p>
              <p className="text-xs text-gray-500">{next.words[0].emoji} {next.words[0].word} — {next.words[0].ar}</p>
            </div>
            <span className="text-2xl" style={{ color: '#2563EB' }}>←</span>
          </div>
        </Link>
      </div>

      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/games?game=enlisten')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right">
          <span className="text-2xl">👂</span><div><p className="font-bold text-gray-800 text-sm">Which letter?</p><p className="text-gray-400 text-[11px]">استمع واختر الحرف</p></div>
        </button>
        <button onClick={() => router.push('/games?game=enspell')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right">
          <span className="text-2xl">🧩</span><div><p className="font-bold text-gray-800 text-sm">Spell it!</p><p className="text-gray-400 text-[11px]">كوّن الكلمة الإنجليزية</p></div>
        </button>
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-lg font-black text-gray-800 mb-3">All letters</h2>
        <div className="grid grid-cols-4 gap-3" dir="ltr">
          {englishLetters.map((l, i) => (
            <Link key={l.id} href={`/english/${l.id}`} className="btn-press">
              <div className="relative aspect-square rounded-2xl flex flex-col items-center justify-center shadow-sm" style={{ background: getColorFromGradient(l.color) }}>
                <div className="flex items-baseline gap-0.5 text-white"><span className="text-3xl font-black">{l.upper}</span><span className="text-xl font-bold opacity-80">{l.lower}</span></div>
                <span className="absolute top-1 left-1.5 text-white/50 text-[9px] font-bold">{i + 1}</span>
                {(learned.includes(l.id) || written.includes(l.id)) && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                    {learned.includes(l.id) && <span className="w-5 h-5 rounded-full bg-white text-[10px] flex items-center justify-center shadow">🎧</span>}
                    {written.includes(l.id) && <span className="w-5 h-5 rounded-full bg-white text-[10px] flex items-center justify-center shadow">✏️</span>}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
