export interface NumberItem {
  n: number
  /** الرقم بالأرقام العربية المشرقية ١٢٣ */
  arabic: string
  /** الاسم بالعربية */
  ar: string
  /** الاسم بالإنجليزية */
  en: string
  emoji: string
  color: string
}

const arNames = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر', 'عشرون']
const enNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const tensAr: Record<number, [string, string]> = { 30: ['ثلاثون', 'thirty'], 40: ['أربعون', 'forty'], 50: ['خمسون', 'fifty'], 60: ['ستون', 'sixty'], 70: ['سبعون', 'seventy'], 80: ['ثمانون', 'eighty'], 90: ['تسعون', 'ninety'], 100: ['مئة', 'one hundred'] }
const emojis = ['🫥', '🍎', '🍌', '🍓', '🍇', '⭐', '🐝', '🌸', '🐠', '🎈', '🍪', '🦋', '🚗', '🌟', '🐞', '🧁', '🍭', '🎁', '🐥', '🍉', '🌈']
const colors = ['from-gray-400 to-gray-600', 'from-red-400 to-rose-600', 'from-yellow-400 to-amber-600', 'from-pink-400 to-rose-600', 'from-purple-400 to-indigo-600',
  'from-amber-400 to-yellow-600', 'from-orange-400 to-red-500', 'from-pink-300 to-purple-400', 'from-cyan-400 to-blue-600', 'from-red-400 to-pink-600',
  'from-amber-500 to-orange-600', 'from-sky-400 to-blue-600', 'from-blue-400 to-indigo-600', 'from-yellow-300 to-amber-500', 'from-red-400 to-rose-600',
  'from-pink-400 to-fuchsia-600', 'from-fuchsia-400 to-pink-600', 'from-green-400 to-emerald-600', 'from-yellow-400 to-orange-500', 'from-green-400 to-teal-600', 'from-violet-400 to-purple-600']

export const toArabicDigits = (n: number | string) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])

export function numberName(n: number, lang: 'ar' | 'en' = 'ar'): string {
  if (n <= 20) return lang === 'ar' ? arNames[n] : enNames[n]
  if (n === 100) return tensAr[100][lang === 'ar' ? 0 : 1]
  const tens = Math.floor(n / 10) * 10, ones = n % 10
  const t = tensAr[tens]?.[lang === 'ar' ? 0 : 1] || ''
  if (ones === 0) return t
  return lang === 'ar' ? `${arNames[ones]} و${t}` : `${t}-${enNames[ones]}`
}

/** 0–20 ثم العشرات حتى 100 */
export const numbers: NumberItem[] = [
  ...Array.from({ length: 21 }, (_, n) => ({ n, arabic: toArabicDigits(n), ar: arNames[n], en: enNames[n], emoji: emojis[n], color: colors[n] })),
  ...[30, 40, 50, 60, 70, 80, 90, 100].map((n, i) => ({ n, arabic: toArabicDigits(n), ar: tensAr[n][0], en: tensAr[n][1], emoji: ['🎯', '🎪', '🎡', '🎢', '🏰', '🚀', '🌍', '🏆'][i], color: colors[(i + 3) % colors.length] })),
]

export const numberByN = (n: number) => numbers.find(x => x.n === n)
