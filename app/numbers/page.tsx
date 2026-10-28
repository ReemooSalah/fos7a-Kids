'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { numbers } from '@/lib/numbers'
import { getColorFromGradient } from '@/lib/data'
import { getLearn } from '@/lib/store'
import { speak } from '@/lib/speech'

export default function NumbersPage() {
  const router = useRouter()
  const [learned, setLearned] = useState<string[]>([])
  useEffect(() => setLearned(getLearn().numbers), [])

  const basic = numbers.filter(n => n.n <= 20)
  const tens = numbers.filter(n => n.n > 20)
  const next = basic.find(n => !learned.includes(String(n.n))) || basic[1]

  return (
    <div className="pb-36 min-h-screen bg-gray-50">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #9D174D, #DB2777)' }}>
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-black text-white">الأرقام 🔢</h1><p className="text-white/60 text-sm">عدّ، اسمع، واكتب الأرقام</p></div>
          <button onClick={() => speak('واحد، اثنان، ثلاثة، أربعة، خمسة، ستة، سبعة، ثمانية، تسعة، عشرة')} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center btn-press"><span className="text-xl">🔊</span></button>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between text-white text-sm mb-2"><span className="font-bold">تقدّمك</span><span>{learned.filter(k => +k <= 20).length} / 21</span></div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(learned.filter(k => +k <= 20).length / 21) * 100}%`, background: '#F5A623' }} /></div>
        </div>
      </div>

      <div className="px-5 -mt-3">
        <Link href={`/numbers/${next.n}`}>
          <div className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 btn-press">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-4xl font-black" style={{ background: getColorFromGradient(next.color) }}>{next.n}</div>
            <div className="flex-1"><p className="text-xs text-gray-400">{learned.length ? 'أكمل التعلم' : 'ابدأ من هنا'}</p><p className="font-black text-gray-800 text-lg">الرقم {next.ar}</p><p className="text-xs text-gray-500">{next.arabic} · {next.en}</p></div>
            <span className="text-2xl" style={{ color: '#DB2777' }}>←</span>
          </div>
        </Link>
      </div>

      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/games?game=count')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right"><span className="text-2xl">🔢</span><div><p className="font-bold text-gray-800 text-sm">عدّ واختر</p><p className="text-gray-400 text-[11px]">عدّ الأشياء</p></div></button>
        <button onClick={() => router.push('/math')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right"><span className="text-2xl">🧮</span><div><p className="font-bold text-gray-800 text-sm">الحساب</p><p className="text-gray-400 text-[11px]">جمع وطرح</p></div></button>
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-lg font-black text-gray-800 mb-3">من 0 إلى 20</h2>
        <div className="grid grid-cols-4 gap-3">
          {basic.map(n => (
            <Link key={n.n} href={`/numbers/${n.n}`} className="btn-press">
              <div className="relative aspect-square rounded-2xl flex flex-col items-center justify-center shadow-sm text-white" style={{ background: getColorFromGradient(n.color) }}>
                <span className="text-3xl font-black leading-none">{n.n}</span>
                <span className="text-sm font-bold opacity-80 mt-0.5">{n.arabic}</span>
                {learned.includes(String(n.n)) && <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white text-[10px] flex items-center justify-center shadow">✓</span>}
              </div>
            </Link>
          ))}
        </div>
        <h2 className="text-lg font-black text-gray-800 mb-3 mt-6">العشرات حتى 100</h2>
        <div className="grid grid-cols-4 gap-3">
          {tens.map(n => (
            <Link key={n.n} href={`/numbers/${n.n}`} className="btn-press">
              <div className="aspect-square rounded-2xl flex flex-col items-center justify-center shadow-sm text-white" style={{ background: getColorFromGradient(n.color) }}>
                <span className="text-2xl font-black leading-none">{n.n}</span><span className="text-xs font-bold opacity-80 mt-0.5">{n.arabic}</span>
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
