'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import PageHeader from '@/components/PageHeader'
import { makeProblem, mathLevels, type MathLevel, type Problem } from '@/lib/mathGen'
import { toArabicDigits } from '@/lib/numbers'
import { speak } from '@/lib/speech'
import { addStars, getLearn, getProfile, recordGameWin, recordMath } from '@/lib/store'

const OBJ = ['🍎', '⭐', '🐝', '🌸', '🚀', '🎈', '🍪', '🐠']
const ROUNDS = 10

export default function MathPage() {
  const [level, setLevel] = useState<MathLevel | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [emoji, setEmoji] = useState('🍎')
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState(getLearn().math)
  const [age, setAge] = useState(0)

  useEffect(() => { setStats(getLearn().math); setAge(getProfile()?.age || 0) }, [])

  const start = (l: MathLevel) => { setLevel(l); setRound(0); setScore(0); setStreak(0); setDone(false); nextProblem(l) }
  const nextProblem = (l: MathLevel) => { const p = makeProblem(l); setProblem(p); setChosen(null); setEmoji(OBJ[Math.floor(Math.random() * OBJ.length)]); speak(p.spoken) }

  const answer = (v: number) => {
    if (!problem || !level || chosen !== null) return
    setChosen(v)
    const ok = v === problem.answer
    recordMath(level.id, ok)
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); addStars(streak >= 2 ? 4 : 2); speak('أحسنت!') }
    else { setStreak(0); speak(`الجواب الصحيح ${problem.answer}`) }
    setTimeout(() => {
      if (round + 1 >= ROUNDS) { setDone(true); if (score + (ok ? 1 : 0) >= 7) recordGameWin(); setStats(getLearn().math) }
      else { setRound(r => r + 1); nextProblem(level) }
    }, ok ? 900 : 1600)
  }

  if (!level) return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <PageHeader title="الحساب 🧮" subtitle={`حللت ${stats.correct} مسألة صحيحة من ${stats.solved}`} />
      <div className="px-5 py-5 space-y-3">
        {mathLevels.map(l => {
          const s = stats.byLevel[l.id]
          const suggested = age > 0 && l.ageMin <= age && (mathLevels.find(x => x.ageMin > age)?.ageMin ?? 99) > l.ageMin
          return (
            <button key={l.id} onClick={() => start(l)} className="w-full bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4 btn-press text-right relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: '#5C35BF20' }}>{l.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-bold text-gray-800">{l.name}</p>{suggested && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">مناسب لعمرك</span>}</div>
                <p className="text-gray-400 text-xs mt-0.5">{l.desc} · من {l.ageMin} سنوات</p>
                {s && <p className="text-[11px] mt-1" style={{ color: '#5C35BF' }}>✓ {s.correct} صحيحة من {s.solved}</p>}
              </div>
              <span className="text-gray-300 text-xl">←</span>
            </button>
          )
        })}
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-50 px-5 pt-12 pb-36">
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm bounce-in">
        <div className="text-7xl mb-3">{score >= 9 ? '🏆' : score >= 7 ? '🌟' : score >= 5 ? '👍' : '💪'}</div>
        <p className="font-black text-gray-800 text-2xl mb-1">{score} / {ROUNDS}</p>
        <p className="text-gray-500 text-sm mb-6">{score >= 9 ? 'ممتاز! أنت عبقري الحساب' : score >= 7 ? 'رائع! استمر' : score >= 5 ? 'جيد، تدرّب أكثر' : 'لا بأس، حاول مرة أخرى'}</p>
        <div className="flex gap-2">
          <button onClick={() => setLevel(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold btn-press">المستويات</button>
          <button onClick={() => start(level)} className="flex-1 py-3 rounded-2xl text-white font-bold btn-press" style={{ background: '#5C35BF' }}>العب مجدداً</button>
        </div>
      </div>
      <MiniPlayer /><BottomNav />
    </div>
  )

  if (!problem) return null
  const showVisual = level.visual && problem.a <= 10 && problem.b <= 10
  const Objects = ({ n }: { n: number }) => <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">{Array.from({ length: n }).map((_, i) => <span key={i} className="text-2xl">{emoji}</span>)}</div>

  return (
    <div className="min-h-screen bg-gray-50 px-5 pt-12 pb-36">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setLevel(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
        <div className="text-center"><p className="font-black text-gray-800">{level.name}</p><p className="text-xs text-gray-400">مسألة {round + 1} من {ROUNDS}</p></div>
        <div className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">⭐ {score}{streak >= 3 ? ' 🔥' : ''}</div>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(round / ROUNDS) * 100}%`, background: '#5C35BF' }} /></div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-5">
        {showVisual && (
          <div className="flex items-center justify-center gap-3 mb-4" dir="ltr">
            <Objects n={problem.a} /><span className="text-3xl font-black text-gray-400">{problem.op}</span>
            <div className={problem.op === '-' ? 'opacity-40 line-through' : ''}><Objects n={problem.b} /></div>
          </div>
        )}
        <button onClick={() => speak(problem.spoken)} className="w-full flex items-center justify-center gap-4 text-5xl font-black text-gray-800 btn-press" dir="ltr">
          <span>{problem.a}</span><span style={{ color: '#5C35BF' }}>{problem.op}</span><span>{problem.b}</span><span className="text-gray-300">=</span><span className="text-gray-300">?</span>
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">{toArabicDigits(problem.a)} {problem.op} {toArabicDigits(problem.b)} · اضغط لسماع المسألة 🔊</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {problem.options.map(v => (
          <button key={v} onClick={() => answer(v)} className={`py-6 rounded-2xl text-4xl font-black btn-press transition-colors ${chosen === null ? 'bg-white text-gray-800 shadow-sm' : v === problem.answer ? 'bg-green-400 text-white' : chosen === v ? 'bg-red-300 text-white shake' : 'bg-gray-100 text-gray-300'}`}>{v}</button>
        ))}
      </div>
      <MiniPlayer /><BottomNav />
    </div>
  )
}
