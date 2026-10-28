export interface EnglishWord {
  word: string
  /** المعنى بالعربية */
  ar: string
  emoji: string
}

export interface EnglishLetter {
  id: string
  upper: string
  lower: string
  /** اسم الحرف كما يُنطق (للقراءة الآلية) */
  name: string
  /** صوت الحرف في الكلمات */
  sound: string
  /** نطق تقريبي بالعربية */
  arName: string
  color: string
  words: EnglishWord[]
}

const C = [
  'from-red-400 to-rose-600', 'from-blue-400 to-cyan-600', 'from-green-400 to-emerald-600', 'from-yellow-400 to-amber-600',
  'from-purple-400 to-indigo-600', 'from-pink-400 to-rose-600', 'from-teal-400 to-cyan-600', 'from-orange-400 to-red-500',
  'from-lime-400 to-green-600', 'from-sky-400 to-blue-600', 'from-violet-400 to-purple-600', 'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
]

const raw: [string, string, string, [string, string, string][]][] = [
  ['A', 'ay', 'إيه', [['Apple', 'تفاحة', '🍎'], ['Ant', 'نملة', '🐜'], ['Airplane', 'طائرة', '✈️']]],
  ['B', 'bee', 'بي', [['Ball', 'كرة', '⚽'], ['Banana', 'موزة', '🍌'], ['Bear', 'دب', '🐻']]],
  ['C', 'see', 'سي', [['Cat', 'قطة', '🐱'], ['Car', 'سيارة', '🚗'], ['Cake', 'كعكة', '🎂']]],
  ['D', 'dee', 'دي', [['Dog', 'كلب', '🐶'], ['Duck', 'بطة', '🦆'], ['Door', 'باب', '🚪']]],
  ['E', 'ee', 'إي', [['Elephant', 'فيل', '🐘'], ['Egg', 'بيضة', '🥚'], ['Eye', 'عين', '👁️']]],
  ['F', 'ef', 'إف', [['Fish', 'سمكة', '🐟'], ['Flower', 'زهرة', '🌸'], ['Frog', 'ضفدع', '🐸']]],
  ['G', 'jee', 'جي', [['Goat', 'ماعز', '🐐'], ['Grapes', 'عنب', '🍇'], ['Gift', 'هدية', '🎁']]],
  ['H', 'aitch', 'إتش', [['Horse', 'حصان', '🐴'], ['House', 'بيت', '🏠'], ['Hat', 'قبعة', '🎩']]],
  ['I', 'eye', 'آي', [['Ice cream', 'آيس كريم', '🍦'], ['Island', 'جزيرة', '🏝️'], ['Insect', 'حشرة', '🐞']]],
  ['J', 'jay', 'جيه', [['Juice', 'عصير', '🧃'], ['Jellyfish', 'قنديل البحر', '🪼'], ['Jacket', 'سترة', '🧥']]],
  ['K', 'kay', 'كيه', [['Kite', 'طائرة ورقية', '🪁'], ['Key', 'مفتاح', '🔑'], ['Kangaroo', 'كنغر', '🦘']]],
  ['L', 'el', 'إل', [['Lion', 'أسد', '🦁'], ['Lemon', 'ليمون', '🍋'], ['Leaf', 'ورقة شجر', '🍃']]],
  ['M', 'em', 'إم', [['Moon', 'قمر', '🌙'], ['Monkey', 'قرد', '🐵'], ['Milk', 'حليب', '🥛']]],
  ['N', 'en', 'إن', [['Nose', 'أنف', '👃'], ['Nest', 'عش', '🪺'], ['Nut', 'جوزة', '🌰']]],
  ['O', 'oh', 'أو', [['Orange', 'برتقالة', '🍊'], ['Owl', 'بومة', '🦉'], ['Octopus', 'أخطبوط', '🐙']]],
  ['P', 'pee', 'بي', [['Pizza', 'بيتزا', '🍕'], ['Penguin', 'بطريق', '🐧'], ['Pencil', 'قلم رصاص', '✏️']]],
  ['Q', 'cue', 'كيو', [['Queen', 'ملكة', '👸'], ['Question', 'سؤال', '❓'], ['Quilt', 'لحاف', '🛏️']]],
  ['R', 'ar', 'آر', [['Rabbit', 'أرنب', '🐰'], ['Rainbow', 'قوس قزح', '🌈'], ['Rocket', 'صاروخ', '🚀']]],
  ['S', 'ess', 'إس', [['Sun', 'شمس', '☀️'], ['Star', 'نجمة', '⭐'], ['Snake', 'ثعبان', '🐍']]],
  ['T', 'tee', 'تي', [['Tree', 'شجرة', '🌳'], ['Tiger', 'نمر', '🐯'], ['Train', 'قطار', '🚂']]],
  ['U', 'you', 'يو', [['Umbrella', 'مظلة', '☂️'], ['Unicorn', 'وحيد القرن', '🦄'], ['Up', 'فوق', '⬆️']]],
  ['V', 'vee', 'في', [['Violin', 'كمان', '🎻'], ['Volcano', 'بركان', '🌋'], ['Van', 'شاحنة صغيرة', '🚐']]],
  ['W', 'double-you', 'دبليو', [['Water', 'ماء', '💧'], ['Whale', 'حوت', '🐋'], ['Watch', 'ساعة', '⌚']]],
  ['X', 'ex', 'إكس', [['Xylophone', 'إكسيليفون', '🎼'], ['X-ray', 'أشعة', '🩻'], ['Box', 'صندوق', '📦']]],
  ['Y', 'why', 'واي', [['Yellow', 'أصفر', '💛'], ['Yogurt', 'زبادي', '🥣'], ['Yo-yo', 'يويو', '🪀']]],
  ['Z', 'zee', 'زد', [['Zebra', 'حمار وحشي', '🦓'], ['Zoo', 'حديقة حيوان', '🦒'], ['Zipper', 'سحّاب', '🤐']]],
]

export const englishLetters: EnglishLetter[] = raw.map(([u, name, arName, words], i) => ({
  id: u.toLowerCase(),
  upper: u,
  lower: u.toLowerCase(),
  name,
  sound: u.toLowerCase(),
  arName,
  color: C[i % C.length],
  words: words.map(([word, ar, emoji]) => ({ word, ar, emoji })),
}))

export const englishById = (id: string) => englishLetters.find(l => l.id === id.toLowerCase())
export const englishIndex = (id: string) => englishLetters.findIndex(l => l.id === id.toLowerCase())

/** كلمات قصيرة للعبة التهجئة الإنجليزية */
export const englishSpelling: { word: string; ar: string; emoji: string }[] = [
  { word: 'CAT', ar: 'قطة', emoji: '🐱' }, { word: 'DOG', ar: 'كلب', emoji: '🐶' }, { word: 'SUN', ar: 'شمس', emoji: '☀️' },
  { word: 'BALL', ar: 'كرة', emoji: '⚽' }, { word: 'FISH', ar: 'سمكة', emoji: '🐟' }, { word: 'MOON', ar: 'قمر', emoji: '🌙' },
  { word: 'STAR', ar: 'نجمة', emoji: '⭐' }, { word: 'TREE', ar: 'شجرة', emoji: '🌳' }, { word: 'BOOK', ar: 'كتاب', emoji: '📖' },
  { word: 'EGG', ar: 'بيضة', emoji: '🥚' }, { word: 'CAR', ar: 'سيارة', emoji: '🚗' }, { word: 'HAT', ar: 'قبعة', emoji: '🎩' },
  { word: 'LION', ar: 'أسد', emoji: '🦁' }, { word: 'MILK', ar: 'حليب', emoji: '🥛' }, { word: 'KEY', ar: 'مفتاح', emoji: '🔑' },
]
