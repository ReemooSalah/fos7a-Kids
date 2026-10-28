'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { arabicLetters } from '@/lib/letters'
import { englishLetters } from '@/lib/english'
import { countries } from '@/lib/countries'
import { getLearn, getLetterProgress, type LearnProgress } from '@/lib/store'

export default function LearnPage() {
  const [ar, setAr] = useState(0)
  const [lp, setLp] = useState<LearnProgress | null>(null)

  useEffect(() => { setAr(getLetterProgress().learned.length); setLp(getLearn()) }, [])

  const sections = [
    { href: '/letters', title: 'الحروف العربية', sub: 'من الألف إلى الياء', emoji: '🔤', bg: 'linear-gradient(135deg, #7C3AED, #4F46E5)', done: ar, total: arabicLetters.length },
    { href: '/english', title: 'English Letters', sub: 'A to Z', emoji: '🔠', bg: 'linear-gradient(135deg, #2563EB, #0891B2)', done: lp?.english.learned.length ?? 0, total: englishLetters.length },
    { href: '/numbers', title: 'الأرقام', sub: 'من 0 إلى 100', emoji: '🔢', bg: 'linear-gradient(135deg, #DB2777, #E11D48)', done: lp?.numbers.length ?? 0, total: 21 },
    { href: '/math', title: 'الحساب', sub: 'جمع وطرح وضرب وقسمة', emoji: '🧮', bg: 'linear-gradient(135deg, #059669, #0D9488)', done: lp?.math.correct ?? 0, total: 50, unit: 'مسألة' },
    { href: '/world', title: 'الدول والعواصم', sub: 'أعلام ومعلومات عن العالم', emoji: '🌍', bg: 'linear-gradient(135deg, #0EA5E9, #2563EB)', done: lp?.countries.length ?? 0, total: countries.length },
    { href: '/prophets', title: 'قصص الأنبياء', sub: '16 قصة بالترتيب', emoji: '🌟', bg: 'linear-gradient(135deg, #F59E0B, #EA580C)' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
        <h1 className="text-2xl font-black text-white">هيا نتعلّم 📚</h1>
        <p className="text-white/60 text-sm">اختر ما تريد أن تتعلمه اليوم</p>
      </div>
      <div className="px-5 py-5 space-y-3">
        {sections.map(s => (
          <Link key={s.href} href={s.href} className="block rounded-3xl p-4 shadow-md btn-press text-white" style={{ background: s.bg }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">{s.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-lg">{s.title}</p>
                <p className="text-white/70 text-xs">{s.sub}</p>
                {s.total !== undefined && (
                  <>
                    <div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden"><div className="h-full bg-amber-300 rounded-full" style={{ width: `${Math.min(100, ((s.done || 0) / s.total) * 100)}%` }} /></div>
                    <p className="text-[11px] text-white/70 mt-1">{s.done} / {s.total} {s.unit || ''}</p>
                  </>
                )}
              </div>
              <span className="text-2xl">←</span>
            </div>
          </Link>
        ))}
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
