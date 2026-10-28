'use client'

import { useEffect, useMemo, useState } from 'react'
import { englishLetters, englishSpelling } from '@/lib/english'
import { countries, flagUrl } from '@/lib/countries'
import { makeProblem, mathLevels, type Problem } from '@/lib/mathGen'
import { speak, speakEn } from '@/lib/speech'
import { addStars, recordGameWin, recordMath } from '@/lib/store'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

export function WinScreen({ emoji, title, sub, stars, onReplay }: { emoji: string; title: string; sub: string; stars: number; onReplay: () => void }) {
  useEffect(() => { addStars(stars); recordGameWin(); speak(title) }, [stars, title])
  return (
    <div className="text-center py-10 bounce-in">
      <div className="text-7xl mb-3">{emoji}</div>
      <p className="font-black text-gray-800 text-xl mb-1">{title}</p>
      <p className="text-gray-500 text-sm mb-2">{sub}</p>
      <p className="text-amber-500 font-bold text-lg mb-5">+{stars} ⭐</p>
      <button onClick={onReplay} className="text-white px-8 py-3 rounded-2xl font-bold btn-press" style={{ background: '#5C35BF' }}>العب مجدداً</button>
    </div>
  )
}

export function GameHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
      <h2 className="font-black text-gray-800">{title}</h2>
      <div className="text-xs text-gray-400 min-w-[40px] text-left">{right}</div>
    </div>
  )
}

// ── Which English letter do you hear? ─────────────────────
export function EnglishListenGame({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => Array.from({ length: 6 }, () => { const opts = shuffle(englishLetters).slice(0, 4); return { answer: opts[Math.floor(Math.random() * 4)], opts } }), [])
  const [qi, setQi] = useState(0); const [score, setScore] = useState(0); const [chosen, setChosen] = useState<string | null>(null); const [done, setDone] = useState(false)
  const r = rounds[qi]
  useEffect(() => { if (r) setTimeout(() => speakEn(r.answer.name), 300) }, [r])
  const pick = (id: string) => {
    if (chosen) return
    setChosen(id); if (id === r.answer.id) setScore(s => s + 1)
    setTimeout(() => { if (qi + 1 >= rounds.length) setDone(true); else { setQi(qi + 1); setChosen(null) } }, 900)
  }
  return (
    <div>
      <GameHeader title="Which letter?" onBack={onBack} right={`${qi + 1}/${rounds.length}`} />
      {done ? <WinScreen emoji="👂" title={`${score}/${rounds.length} correct`} sub="Great listening!" stars={score * 4} onReplay={() => { setQi(0); setScore(0); setChosen(null); setDone(false) }} /> : (
        <>
          <button onClick={() => speakEn(r.answer.name)} className="mx-auto block w-28 h-28 rounded-full text-5xl btn-press shadow-lg mb-8 text-white" style={{ background: '#2563EB' }}>🔊</button>
          <div className="grid grid-cols-2 gap-3" dir="ltr">
            {r.opts.map(o => (
              <button key={o.id} onClick={() => pick(o.id)} className={`h-24 rounded-2xl text-5xl font-black btn-press transition-colors ${chosen === null ? 'bg-white text-gray-800 shadow-sm' : o.id === r.answer.id ? 'bg-green-400 text-white' : chosen === o.id ? 'bg-red-300 text-white' : 'bg-gray-100 text-gray-300'}`}>{o.upper}<span className="text-3xl opacity-60">{o.lower}</span></button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Spell the English word ─────────────────────────────────
export function EnglishSpellGame({ onBack }: { onBack: () => void }) {
  const [words] = useState(() => shuffle(englishSpelling).slice(0, 6))
  const [qi, setQi] = useState(0); const [pool, setPool] = useState<{ ch: string; id: number }[]>([]); const [placed, setPlaced] = useState<string[]>([]); const [wrong, setWrong] = useState<number | null>(null); const [done, setDone] = useState(false)
  const w = words[qi]
  useEffect(() => { if (!w) return; setPool(shuffle(w.word.split('').map((ch, id) => ({ ch, id })))); setPlaced([]); speakEn(w.word) }, [qi, w])
  const pick = (p: { ch: string; id: number }) => {
    if (p.ch === w.word[placed.length]) {
      const next = [...placed, p.ch]; setPlaced(next); setPool(pl => pl.filter(x => x.id !== p.id))
      if (next.length === w.word.length) { speakEn(`Great! ${w.word}`); setTimeout(() => (qi + 1 >= words.length ? setDone(true) : setQi(qi + 1)), 1100) }
    } else { setWrong(p.id); setTimeout(() => setWrong(null), 400) }
  }
  return (
    <div>
      <GameHeader title="Spell it!" onBack={onBack} right={`${qi + 1}/${words.length}`} />
      {done ? <WinScreen emoji="🧩" title="You spelled them all!" sub="أنت قارئ ممتاز" stars={30} onReplay={() => { setQi(0); setDone(false) }} /> : (
        <>
          <button onClick={() => speakEn(w.word)} className="mx-auto block bg-blue-50 rounded-3xl p-5 mb-5 text-center btn-press w-full"><div className="text-7xl mb-2">{w.emoji}</div><p className="text-gray-500 text-sm">{w.ar} · 🔊 اضغط لسماع الكلمة</p></button>
          <div className="flex justify-center gap-2 mb-8" dir="ltr">
            {w.word.split('').map((_, i) => <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-dashed" style={{ borderColor: placed[i] ? '#2563EB' : '#D1D5DB', background: placed[i] ? '#2563EB' : 'white', color: 'white' }}>{placed[i] || ''}</div>)}
          </div>
          <div className="flex justify-center gap-3 flex-wrap" dir="ltr">
            {pool.map(p => <button key={p.id} onClick={() => pick(p)} className={`w-16 h-16 rounded-2xl text-3xl font-black btn-press shadow-sm ${wrong === p.id ? 'shake bg-red-100 text-red-500' : 'bg-white text-gray-800'}`}>{p.ch}</button>)}
          </div>
        </>
      )}
    </div>
  )
}

// ── Math race ──────────────────────────────────────────────
export function MathRaceGame({ onBack }: { onBack: () => void }) {
  const level = mathLevels[1]
  const TOTAL = 8
  const [p, setP] = useState<Problem>(() => makeProblem(level)); const [i, setI] = useState(0); const [score, setScore] = useState(0); const [chosen, setChosen] = useState<number | null>(null); const [done, setDone] = useState(false)
  const [secs, setSecs] = useState(0)
  useEffect(() => { if (done) return; const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t) }, [done])
  const pick = (v: number) => {
    if (chosen !== null) return
    setChosen(v); const ok = v === p.answer; recordMath(level.id, ok); if (ok) setScore(s => s + 1)
    setTimeout(() => { if (i + 1 >= TOTAL) setDone(true); else { setI(i + 1); setP(makeProblem(level)); setChosen(null) } }, ok ? 500 : 1100)
  }
  return (
    <div>
      <GameHeader title="سباق الحساب" onBack={onBack} right={`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} · ${i + 1}/${TOTAL}`} />
      {done ? <WinScreen emoji="🏎️" title={`${score}/${TOTAL} في ${secs} ثانية`} sub={score === TOTAL ? 'سرعة البرق!' : 'استمر بالتدريب'} stars={score * 3} onReplay={() => { setI(0); setScore(0); setSecs(0); setChosen(null); setDone(false); setP(makeProblem(level)) }} /> : (
        <>
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-5 text-center text-5xl font-black text-gray-800" dir="ltr">{p.a} <span style={{ color: '#5C35BF' }}>{p.op}</span> {p.b} <span className="text-gray-300">= ?</span></div>
          <div className="grid grid-cols-2 gap-3">
            {p.options.map(v => <button key={v} onClick={() => pick(v)} className={`py-6 rounded-2xl text-4xl font-black btn-press ${chosen === null ? 'bg-white text-gray-800 shadow-sm' : v === p.answer ? 'bg-green-400 text-white' : chosen === v ? 'bg-red-300 text-white shake' : 'bg-gray-100 text-gray-300'}`}>{v}</button>)}
          </div>
        </>
      )}
    </div>
  )
}

// ── Capitals quiz ──────────────────────────────────────────
export function CapitalsGame({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(countries).slice(0, 8).map(c => ({ c, opts: shuffle([c.capital, ...shuffle(countries.filter(x => x.code !== c.code)).slice(0, 3).map(x => x.capital)]) })), [])
  const [qi, setQi] = useState(0); const [score, setScore] = useState(0); const [chosen, setChosen] = useState<string | null>(null); const [done, setDone] = useState(false)
  const r = rounds[qi]
  useEffect(() => { if (r) speak(`ما عاصمة ${r.c.name}؟`) }, [r])
  const pick = (v: string) => {
    if (chosen) return
    setChosen(v); const ok = v === r.c.capital; if (ok) setScore(s => s + 1)
    speak(ok ? 'صحيح!' : `عاصمة ${r.c.name} هي ${r.c.capital}`)
    setTimeout(() => { if (qi + 1 >= rounds.length) setDone(true); else { setQi(qi + 1); setChosen(null) } }, ok ? 900 : 1800)
  }
  return (
    <div>
      <GameHeader title="ما العاصمة؟" onBack={onBack} right={`${qi + 1}/${rounds.length}`} />
      {done ? <WinScreen emoji="🏛️" title={`${score}/${rounds.length} صحيحة`} sub="أنت رحّالة ماهر" stars={score * 4} onReplay={() => { setQi(0); setScore(0); setChosen(null); setDone(false) }} /> : (
        <>
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5 flex flex-col items-center">
            <img src={flagUrl(r.c.code, 320)} alt="" className="h-20 rounded-xl shadow-md mb-3" />
            <p className="font-black text-gray-800 text-xl">ما عاصمة {r.c.name}؟</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {r.opts.map(o => <button key={o} onClick={() => pick(o)} className={`py-4 rounded-2xl font-bold btn-press ${chosen === null ? 'bg-white text-gray-800 shadow-sm' : o === r.c.capital ? 'bg-green-400 text-white' : chosen === o ? 'bg-red-300 text-white shake' : 'bg-gray-100 text-gray-300'}`}>{o}</button>)}
          </div>
        </>
      )}
    </div>
  )
}

// ── Flags quiz ─────────────────────────────────────────────
export function FlagsGame({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(countries).slice(0, 8).map(c => ({ c, opts: shuffle([c, ...shuffle(countries.filter(x => x.code !== c.code)).slice(0, 3)]) })), [])
  const [qi, setQi] = useState(0); const [score, setScore] = useState(0); const [chosen, setChosen] = useState<string | null>(null); const [done, setDone] = useState(false)
  const r = rounds[qi]
  useEffect(() => { if (r) speak(`أي علم هو علم ${r.c.name}؟`) }, [r])
  const pick = (code: string) => {
    if (chosen) return
    setChosen(code); const ok = code === r.c.code; if (ok) setScore(s => s + 1)
    setTimeout(() => { if (qi + 1 >= rounds.length) setDone(true); else { setQi(qi + 1); setChosen(null) } }, ok ? 800 : 1500)
  }
  return (
    <div>
      <GameHeader title="علم مَن؟" onBack={onBack} right={`${qi + 1}/${rounds.length}`} />
      {done ? <WinScreen emoji="🚩" title={`${score}/${rounds.length} صحيحة`} sub="تعرف الأعلام جيداً" stars={score * 4} onReplay={() => { setQi(0); setScore(0); setChosen(null); setDone(false) }} /> : (
        <>
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5 text-center"><p className="font-black text-gray-800 text-xl">أي علم هو علم <span style={{ color: '#0EA5E9' }}>{r.c.name}</span>؟</p></div>
          <div className="grid grid-cols-2 gap-3">
            {r.opts.map(o => (
              <button key={o.code} onClick={() => pick(o.code)} className={`p-3 rounded-2xl btn-press border-4 ${chosen === null ? 'bg-white border-white shadow-sm' : o.code === r.c.code ? 'border-green-400 bg-green-50' : chosen === o.code ? 'border-red-300 bg-red-50 shake' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                <img src={flagUrl(o.code, 160)} alt="" className="w-full rounded-lg" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
