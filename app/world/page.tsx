'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { continents, countries, flagUrl, type Continent } from '@/lib/countries'
import { getColorFromGradient } from '@/lib/data'
import { getLearn } from '@/lib/store'

export default function WorldPage() {
  const router = useRouter()
  const [learned, setLearned] = useState<string[]>([])
  const [filter, setFilter] = useState<'arab' | Continent | 'all'>('arab')
  useEffect(() => setLearned(getLearn().countries), [])

  const list = filter === 'all' ? countries : filter === 'arab' ? countries.filter(c => c.arab) : countries.filter(c => c.continent === filter)
  const tabs: { id: typeof filter; label: string }[] = [{ id: 'arab', label: '🕌 العربية' }, ...(Object.keys(continents) as Continent[]).map(k => ({ id: k, label: `${continents[k].emoji} ${continents[k].name}` })), { id: 'all', label: '🌐 الكل' }]

  return (
    <div className="pb-36 min-h-screen bg-gray-50">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #0C4A6E, #0EA5E9)' }}>
        <h1 className="text-2xl font-black text-white">الدول والعواصم 🌍</h1>
        <p className="text-white/60 text-sm">{countries.length} دولة · تعرّفت على {learned.length}</p>
        <div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(learned.length / countries.length) * 100}%`, background: '#F5A623' }} /></div>
      </div>

      <div className="px-5 -mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/games?game=capitals')} className="bg-white rounded-2xl p-3 shadow-md flex items-center gap-2 btn-press text-right"><span className="text-2xl">🏛️</span><div><p className="font-bold text-gray-800 text-sm">ما عاصمة؟</p><p className="text-gray-400 text-[11px]">اختبار العواصم</p></div></button>
        <button onClick={() => router.push('/games?game=flags')} className="bg-white rounded-2xl p-3 shadow-md flex items-center gap-2 btn-press text-right"><span className="text-2xl">🚩</span><div><p className="font-bold text-gray-800 text-sm">علم مَن؟</p><p className="text-gray-400 text-[11px]">اختبار الأعلام</p></div></button>
      </div>

      <div className="px-5 py-4 flex gap-2 overflow-x-auto">
        {tabs.map(t => <button key={t.id} onClick={() => setFilter(t.id)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold btn-press" style={{ background: filter === t.id ? '#0EA5E9' : 'white', color: filter === t.id ? 'white' : '#6B7280' }}>{t.label}</button>)}
      </div>

      <div className="px-5 grid grid-cols-2 gap-3">
        {list.map(c => (
          <Link key={c.code} href={`/world/${c.code}`} className="bg-white rounded-2xl overflow-hidden shadow-sm btn-press relative">
            <div className="h-24 flex items-center justify-center" style={{ background: getColorFromGradient(continents[c.continent].color) }}>
              <img src={flagUrl(c.code, 160)} alt={c.name} className="h-14 rounded-lg shadow-lg object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <p className="font-bold text-gray-800 text-sm">{c.name}</p>
              <p className="text-gray-400 text-xs">🏛️ {c.capital}</p>
            </div>
            {learned.includes(c.code) && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center shadow">✓</span>}
          </Link>
        ))}
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
