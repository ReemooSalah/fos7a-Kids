'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TracingCanvas from '@/components/TracingCanvas'
import Pic from '@/components/Pic'
import { englishLetters, englishById, englishIndex } from '@/lib/english'
import { getColorFromGradient, getCoverColors } from '@/lib/data'
import { speak, speakEn, stopSpeaking } from '@/lib/speech'
import { addStars, markEnglish } from '@/lib/store'

type Tab = 'learn' | 'write' | 'quiz'

export default function EnglishLetterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const letter = englishById(id)
  const idx = englishIndex(id)
  const [tab, setTab] = useState<Tab>('learn')
  const [caseMode, setCaseMode] = useState<'upper' | 'lower'>('upper')
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizOptions, setQuizOptions] = useState<{ word: string; ar: string; emoji: string; correct: boolean }[]>([])

  useEffect(() => {
    if (!letter) return
    markEnglish(letter.id, 'learned')
    const others = englishLetters.filter(l => l.id !== letter.id).sort(() => Math.random() - 0.5).slice(0, 3)
    setQuizOptions([{ ...letter.words[Math.floor(Math.random() * letter.words.length)], correct: true }, ...others.map(o => ({ ...o.words[0], correct: false }))].sort(() => Math.random() - 0.5))
    setQuizAnswer(null); setTab('learn'); setCaseMode('upper')
    return () => stopSpeaking()
  }, [letter])

  if (!letter) return <div className="min-h-screen flex items-center justify-center"><Link href="/english" className="text-purple-600 font-semibold">الحرف غير موجود — رجوع</Link></div>

  const colors = getCoverColors(letter.color)
  const bg = getColorFromGradient(letter.color)
  const prev = englishLetters[idx - 1], next = englishLetters[idx + 1]
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800) }
  const say = (key: string, text: string, lang: 'en' | 'ar' = 'en') => { setSpeaking(key); (lang === 'en' ? speakEn : speak)(text, { onEnd: () => setSpeaking(null) }) }

  const onWritten = () => {
    const first = markEnglish(letter.id, 'written')
    addStars(first ? 15 : 3); showToast(first ? '+15 ⭐ Great job!' : '+3 ⭐ أحسنت!')
    speakEn(`Great job! Letter ${letter.upper}`)
  }
  const answerQuiz = (o: { word: string; correct: boolean }) => {
    if (quizAnswer) return
    setQuizAnswer(o.word)
    if (o.correct) { addStars(5); showToast('+5 ⭐ Correct!'); speakEn(`Yes! ${o.word} starts with ${letter.upper}`) } else speakEn('Try again')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="pt-12 pb-6 px-5" style={{ background: bg }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/english')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center btn-press"><span className="text-white">→</span></button>
          <p className="text-white/80 text-sm font-bold">Letter {idx + 1} of 26</p>
          <div className="w-9" />
        </div>
        <div className="flex flex-col items-center">
          <button onClick={() => say('main', letter.name)} className="btn-press">
            <div className="w-40 h-40 rounded-[40px] bg-white/20 flex items-center justify-center shadow-xl gap-1">
              <span className="text-white font-black leading-none" style={{ fontSize: 96 }}>{letter.upper}</span>
              <span className="text-white/80 font-bold leading-none" style={{ fontSize: 64 }}>{letter.lower}</span>
            </div>
          </button>
          <h1 className="text-white text-3xl font-black mt-4">Letter {letter.upper}</h1>
          <p className="text-white/70 text-sm">يُنطق «{letter.arName}» · اضغط عليه لسماعه 🔊</p>
        </div>
      </div>

      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl p-1.5 shadow-md flex">
          {([['learn', '🎧 Learn'], ['write', '✏️ Write'], ['quiz', '🧠 Quiz']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-press" style={{ background: tab === t ? bg : 'transparent', color: tab === t ? 'white' : '#6B7280' }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {tab === 'learn' && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Big and small · كبير وصغير</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <button onClick={() => say('up', `Capital ${letter.upper}`)} className="bg-gray-50 rounded-xl py-4 btn-press"><p className="text-5xl font-black" style={{ color: colors.to }}>{letter.upper}</p><p className="text-[11px] text-gray-400 mt-1">Capital · كبير</p></button>
                <button onClick={() => say('low', `Small ${letter.lower}`)} className="bg-gray-50 rounded-xl py-4 btn-press"><p className="text-5xl font-black" style={{ color: colors.to }}>{letter.lower}</p><p className="text-[11px] text-gray-400 mt-1">Small · صغير</p></button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Words with {letter.upper}</h3>
              <div className="space-y-2">
                {letter.words.map(w => (
                  <div key={w.word} role="button" tabIndex={0} onClick={() => say('w-' + w.word, w.word)} className="w-full flex items-center gap-3 p-3 rounded-xl btn-press cursor-pointer" style={{ background: speaking === 'w-' + w.word ? `${colors.from}22` : '#F9FAFB' }}>
                    <Pic imageKey={`en:${w.word.toLowerCase()}`} emoji={w.emoji} size={52} rounded="rounded-xl" />
                    <div className="flex-1" dir="ltr"><p className="text-xl font-black text-gray-800"><span style={{ color: colors.to }}>{w.word[0]}</span>{w.word.slice(1)}</p><p className="text-xs text-gray-400 text-left">{w.ar}</p></div>
                    <button onClick={e => { e.stopPropagation(); say('ar-' + w.word, w.ar, 'ar') }} className="w-8 h-8 rounded-full bg-gray-100 text-xs flex items-center justify-center btn-press">ع</button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setTab('write')} className="w-full py-4 rounded-2xl text-white font-black text-lg btn-press shadow-lg" style={{ background: bg }}>✏️ Let&apos;s write {letter.upper}</button>
          </>
        )}

        {tab === 'write' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <div className="flex gap-2 mb-3">
              {(['upper', 'lower'] as const).map(m => (
                <button key={m} onClick={() => setCaseMode(m)} className="px-4 py-1.5 rounded-full text-sm font-bold btn-press" style={{ background: caseMode === m ? bg : '#F3F4F6', color: caseMode === m ? 'white' : '#6B7280' }}>{m === 'upper' ? letter.upper + ' كبير' : letter.lower + ' صغير'}</button>
              ))}
            </div>
            <TracingCanvas char={caseMode === 'upper' ? letter.upper : letter.lower} color={colors.to} onComplete={onWritten} />
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={() => say('main', letter.name)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold btn-press">🔊 Listen</button>
              <button onClick={() => setTab('quiz')} className="flex-1 py-3 rounded-xl text-white text-sm font-bold btn-press" style={{ background: bg }}>🧠 Quiz</button>
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1 text-center">Which word starts with <span style={{ color: colors.to }}>{letter.upper}</span>?</h3>
            <p className="text-center text-xs text-gray-400 mb-2">أي كلمة تبدأ بحرف {letter.upper}؟</p>
            <div className="grid grid-cols-2 gap-3">
              {quizOptions.map(o => {
                const chosen = quizAnswer === o.word, reveal = quizAnswer !== null
                return (
                  <button key={o.word} onClick={() => answerQuiz(o)} className={`rounded-2xl p-3 flex flex-col items-center gap-2 btn-press border-2 ${chosen && !o.correct ? 'shake' : ''}`}
                    style={{ borderColor: reveal && o.correct ? '#4ADE80' : chosen ? '#F87171' : '#F3F4F6', background: reveal && o.correct ? '#F0FDF4' : chosen ? '#FEF2F2' : '#F9FAFB' }}>
                    <Pic imageKey={`en:${o.word.toLowerCase()}`} emoji={o.emoji} size={56} rounded="rounded-xl" />
                    <span className="font-bold text-gray-800" dir="ltr">{o.word}</span>
                  </button>
                )
              })}
            </div>
            {quizAnswer && <button onClick={() => { setQuizAnswer(null); setQuizOptions(q => [...q].sort(() => Math.random() - 0.5)) }} className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm btn-press">🔄 Again</button>}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {prev ? <Link href={`/english/${prev.id}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press"><span className="text-gray-400">→</span><span className="text-2xl font-black" style={{ color: getCoverColors(prev.color).to }}>{prev.upper}</span><span className="text-xs text-gray-500">Previous</span></Link> : <div className="flex-1" />}
          {next ? <Link href={`/english/${next.id}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center justify-end gap-2 btn-press"><span className="text-xs text-gray-500">Next</span><span className="text-2xl font-black" style={{ color: getCoverColors(next.color).to }}>{next.upper}</span><span className="text-gray-400">←</span></Link>
            : <Link href="/english" className="flex-1 rounded-2xl p-3 shadow-sm flex items-center justify-center btn-press text-white font-bold" style={{ background: bg }}>🏆 You finished A–Z!</Link>}
        </div>
      </div>
      {toast && <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up">{toast}</div>}
    </div>
  )
}
