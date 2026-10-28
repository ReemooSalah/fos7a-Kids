export type Op = '+' | '-' | '×' | '÷'

export interface MathLevel {
  id: string
  name: string
  desc: string
  emoji: string
  ops: Op[]
  max: number
  /** عدد الأشياء المصوّرة (إن كان صغيراً) */
  visual: boolean
  ageMin: number
}

export const mathLevels: MathLevel[] = [
  { id: 'l1', name: 'المستوى الأول', desc: 'جمع حتى 10 بالصور', emoji: '🍎', ops: ['+'], max: 10, visual: true, ageMin: 4 },
  { id: 'l2', name: 'المستوى الثاني', desc: 'جمع وطرح حتى 10', emoji: '🌟', ops: ['+', '-'], max: 10, visual: true, ageMin: 5 },
  { id: 'l3', name: 'المستوى الثالث', desc: 'جمع وطرح حتى 20', emoji: '🚀', ops: ['+', '-'], max: 20, visual: false, ageMin: 6 },
  { id: 'l4', name: 'المستوى الرابع', desc: 'جمع وطرح حتى 100', emoji: '🏆', ops: ['+', '-'], max: 100, visual: false, ageMin: 7 },
  { id: 'l5', name: 'جدول الضرب', desc: 'ضرب حتى 10 × 10', emoji: '✖️', ops: ['×'], max: 10, visual: false, ageMin: 8 },
  { id: 'l6', name: 'القسمة', desc: 'قسمة بسيطة بدون باقٍ', emoji: '➗', ops: ['÷'], max: 10, visual: false, ageMin: 9 },
]

export interface Problem {
  a: number
  b: number
  op: Op
  answer: number
  options: number[]
  /** قراءة المسألة بالعربية */
  spoken: string
}

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

const opWord: Record<Op, string> = { '+': 'زائد', '-': 'ناقص', '×': 'ضرب', '÷': 'تقسيم' }

export function makeProblem(level: MathLevel): Problem {
  const op = level.ops[Math.floor(Math.random() * level.ops.length)]
  let a = 0, b = 0, answer = 0
  if (op === '+') { a = rnd(level.visual ? 1 : 0, level.max - 1); b = rnd(1, level.max - a); answer = a + b }
  else if (op === '-') { a = rnd(1, level.max); b = rnd(0, a); answer = a - b }
  else if (op === '×') { a = rnd(1, level.max); b = rnd(1, level.max); answer = a * b }
  else { b = rnd(1, level.max); answer = rnd(1, level.max); a = b * answer }

  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 4 && guard++ < 50) {
    const spread = Math.max(2, Math.round(Math.max(answer, 4) * 0.4))
    const v = answer + rnd(-spread, spread)
    if (v >= 0 && v !== answer) opts.add(v)
  }
  while (opts.size < 4) opts.add(answer + opts.size + 1)
  const options = Array.from(opts).sort(() => Math.random() - 0.5)
  return { a, b, op, answer, options, spoken: `${a} ${opWord[op]} ${b} يساوي كم؟` }
}
