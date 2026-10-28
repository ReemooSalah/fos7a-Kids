export type Continent = 'asia' | 'africa' | 'europe' | 'namerica' | 'samerica' | 'oceania'

export interface Country {
  /** رمز الدولة ISO (حروف صغيرة) — يُستخدم لصورة العلم */
  code: string
  name: string
  en: string
  capital: string
  continent: Continent
  /** عربية؟ */
  arab?: boolean
  language: string
  currency: string
  /** عدد السكان التقريبي بالملايين */
  population: number
  landmark: string
  landmarkEmoji: string
  famousFor: string
  facts: string[]
}

export const continents: Record<Continent, { name: string; emoji: string; color: string }> = {
  asia: { name: 'آسيا', emoji: '🏯', color: 'from-red-400 to-rose-600' },
  africa: { name: 'أفريقيا', emoji: '🦁', color: 'from-amber-400 to-orange-600' },
  europe: { name: 'أوروبا', emoji: '🏰', color: 'from-blue-400 to-indigo-600' },
  namerica: { name: 'أمريكا الشمالية', emoji: '🗽', color: 'from-green-400 to-emerald-600' },
  samerica: { name: 'أمريكا الجنوبية', emoji: '🌴', color: 'from-lime-400 to-green-600' },
  oceania: { name: 'أستراليا والمحيط', emoji: '🦘', color: 'from-cyan-400 to-blue-600' },
}

/** صورة علم حقيقية (ملكية عامة) من flagcdn.com */
export const flagUrl = (code: string, w: 160 | 320 | 640 = 320) => `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`

export const countries: Country[] = [
  // ── الدول العربية ──
  { code: 'sd', name: 'السودان', en: 'Sudan', capital: 'الخرطوم', continent: 'africa', arab: true, language: 'العربية', currency: 'الجنيه السوداني', population: 48, landmark: 'ملتقى النيلين', landmarkEmoji: '🌊', famousFor: 'أهرامات مروي والنيل',
    facts: ['في السودان أهرامات أكثر من مصر! أكثر من 200 هرم في مروي والبجراوية.', 'يلتقي النيل الأزرق بالنيل الأبيض في الخرطوم ليكوّنا نهر النيل العظيم.', 'السودان من أكبر دول أفريقيا مساحةً، وفيه صحارٍ وغابات وأنهار.'] },
  { code: 'eg', name: 'مصر', en: 'Egypt', capital: 'القاهرة', continent: 'africa', arab: true, language: 'العربية', currency: 'الجنيه المصري', population: 110, landmark: 'أهرامات الجيزة', landmarkEmoji: '🏜️', famousFor: 'الأهرامات والفراعنة',
    facts: ['هرم خوفو من عجائب الدنيا السبع القديمة، وظل أطول بناء في العالم لأكثر من 3800 سنة.', 'نهر النيل يمر بمصر وهو من أطول أنهار العالم.', 'الفراعنة القدماء اخترعوا الكتابة الهيروغليفية والورق من نبات البردي.'] },
  { code: 'sa', name: 'السعودية', en: 'Saudi Arabia', capital: 'الرياض', continent: 'asia', arab: true, language: 'العربية', currency: 'الريال السعودي', population: 36, landmark: 'الكعبة المشرفة', landmarkEmoji: '🕋', famousFor: 'مكة والمدينة',
    facts: ['فيها مكة المكرمة حيث الكعبة، يتجه إليها المسلمون في صلاتهم من كل العالم.', 'الربع الخالي فيها من أكبر الصحاري الرملية في العالم.', 'السعودية من أكبر منتجي النفط في العالم.'] },
  { code: 'ae', name: 'الإمارات', en: 'UAE', capital: 'أبوظبي', continent: 'asia', arab: true, language: 'العربية', currency: 'الدرهم', population: 10, landmark: 'برج خليفة', landmarkEmoji: '🏙️', famousFor: 'أطول برج في العالم',
    facts: ['برج خليفة في دبي أطول مبنى في العالم بارتفاع 828 متراً.', 'الإمارات اتحاد من سبع إمارات، أكبرها أبوظبي.', 'أرسلت الإمارات مسباراً إلى كوكب المريخ اسمه مسبار الأمل.'] },
  { code: 'qa', name: 'قطر', en: 'Qatar', capital: 'الدوحة', continent: 'asia', arab: true, language: 'العربية', currency: 'الريال القطري', population: 3, landmark: 'متحف الفن الإسلامي', landmarkEmoji: '🏟️', famousFor: 'كأس العالم 2022',
    facts: ['استضافت قطر كأس العالم لكرة القدم عام 2022، أول دولة عربية تفعل ذلك.', 'قطر شبه جزيرة صغيرة يحيط بها البحر من ثلاث جهات.', 'فيها مكتبة قطر الوطنية الضخمة بملايين الكتب.'] },
  { code: 'kw', name: 'الكويت', en: 'Kuwait', capital: 'مدينة الكويت', continent: 'asia', arab: true, language: 'العربية', currency: 'الدينار الكويتي', population: 4, landmark: 'أبراج الكويت', landmarkEmoji: '🗼', famousFor: 'أبراج الكويت',
    facts: ['أبراج الكويت الزرقاء الشهيرة بها مطعم يدور ليرى الزائر المدينة كلها.', 'الدينار الكويتي من أغلى العملات في العالم.', 'تقع الكويت على الخليج العربي ومناخها صحراوي حار.'] },
  { code: 'bh', name: 'البحرين', en: 'Bahrain', capital: 'المنامة', continent: 'asia', arab: true, language: 'العربية', currency: 'الدينار البحريني', population: 1.5, landmark: 'شجرة الحياة', landmarkEmoji: '🌳', famousFor: 'اللؤلؤ',
    facts: ['البحرين جزيرة في الخليج، ويربطها جسر بالسعودية طوله 25 كيلومتراً.', 'شجرة الحياة تعيش وحدها في الصحراء منذ 400 سنة بلا ماء ظاهر.', 'اشتهرت البحرين قديماً بصيد اللؤلؤ من البحر.'] },
  { code: 'om', name: 'عُمان', en: 'Oman', capital: 'مسقط', continent: 'asia', arab: true, language: 'العربية', currency: 'الريال العُماني', population: 5, landmark: 'جامع السلطان قابوس', landmarkEmoji: '🕌', famousFor: 'اللبان والجبال',
    facts: ['عُمان مشهورة باللبان، وهو صمغ شجرة له رائحة جميلة يُستخدم كبخور.', 'جبل شمس أعلى جبل في عُمان، وفيه وادٍ عميق يسمّونه الجراند كانيون العربي.', 'السلاحف البحرية تضع بيضها على شواطئ عُمان كل سنة.'] },
  { code: 'ye', name: 'اليمن', en: 'Yemen', capital: 'صنعاء', continent: 'asia', arab: true, language: 'العربية', currency: 'الريال اليمني', population: 34, landmark: 'صنعاء القديمة', landmarkEmoji: '🏘️', famousFor: 'البيوت الطينية العالية',
    facts: ['بيوت صنعاء القديمة مبنية من الطين منذ مئات السنين وبعضها بسبعة طوابق.', 'جزيرة سقطرى فيها شجرة دم الأخوين التي تشبه المظلة ولا تنمو إلا هناك.', 'اليمن من أقدم مناطق زراعة البن (القهوة) في العالم.'] },
  { code: 'jo', name: 'الأردن', en: 'Jordan', capital: 'عمّان', continent: 'asia', arab: true, language: 'العربية', currency: 'الدينار الأردني', population: 11, landmark: 'البتراء', landmarkEmoji: '🏛️', famousFor: 'المدينة الوردية',
    facts: ['البتراء مدينة منحوتة في الصخر الوردي، وهي من عجائب الدنيا السبع الجديدة.', 'البحر الميت أخفض نقطة على سطح الأرض، وماؤه مالح جداً فيطفو الإنسان عليه.', 'وادي رم صحراء حمراء صوّرت فيها أفلام عن كوكب المريخ.'] },
  { code: 'ps', name: 'فلسطين', en: 'Palestine', capital: 'القدس', continent: 'asia', arab: true, language: 'العربية', currency: 'الشيكل والدينار', population: 5.5, landmark: 'المسجد الأقصى', landmarkEmoji: '🕌', famousFor: 'القدس والزيتون',
    facts: ['المسجد الأقصى في القدس أولى القبلتين وثالث الحرمين.', 'شجر الزيتون في فلسطين عمره مئات السنين ويُصنع منه زيت الزيتون.', 'فيها مدينة أريحا من أقدم مدن العالم.'] },
  { code: 'lb', name: 'لبنان', en: 'Lebanon', capital: 'بيروت', continent: 'asia', arab: true, language: 'العربية', currency: 'الليرة اللبنانية', population: 5.5, landmark: 'أرز لبنان', landmarkEmoji: '🌲', famousFor: 'شجرة الأرز',
    facts: ['شجرة الأرز مرسومة على علم لبنان، وبعض أشجار الأرز عمرها أكثر من ألف سنة.', 'في لبنان يمكنك التزلج على الثلج في الجبل والسباحة في البحر في اليوم نفسه.', 'مغارة جعيتا كهف مذهل فيه أشكال صخرية عجيبة.'] },
  { code: 'sy', name: 'سوريا', en: 'Syria', capital: 'دمشق', continent: 'asia', arab: true, language: 'العربية', currency: 'الليرة السورية', population: 23, landmark: 'الجامع الأموي', landmarkEmoji: '🕌', famousFor: 'أقدم عاصمة مأهولة',
    facts: ['دمشق من أقدم المدن في العالم التي ما زال الناس يعيشون فيها.', 'الجامع الأموي في دمشق من أجمل وأقدم المساجد.', 'سوريا مشهورة بالياسمين وبالحلويات اللذيذة.'] },
  { code: 'iq', name: 'العراق', en: 'Iraq', capital: 'بغداد', continent: 'asia', arab: true, language: 'العربية', currency: 'الدينار العراقي', population: 45, landmark: 'زقورة أور', landmarkEmoji: '🏺', famousFor: 'مهد الحضارات',
    facts: ['في العراق ظهرت أول كتابة في التاريخ قبل 5000 سنة عند السومريين.', 'نهرا دجلة والفرات يمران بالعراق وسُمّيت الأرض بينهما بلاد الرافدين.', 'كانت بغداد قديماً أكبر مدينة في العالم وفيها بيت الحكمة للعلماء.'] },
  { code: 'ma', name: 'المغرب', en: 'Morocco', capital: 'الرباط', continent: 'africa', arab: true, language: 'العربية والأمازيغية', currency: 'الدرهم المغربي', population: 37, landmark: 'جامع الفنا', landmarkEmoji: '🎪', famousFor: 'مراكش والصحراء',
    facts: ['جامعة القرويين في فاس أقدم جامعة في العالم ما زالت تعمل، أسستها امرأة اسمها فاطمة الفهرية.', 'المغرب يطل على بحرين: البحر المتوسط والمحيط الأطلسي.', 'ساحة جامع الفنا في مراكش فيها حكواتيون ومروّضو أفاعٍ.'] },
  { code: 'dz', name: 'الجزائر', en: 'Algeria', capital: 'الجزائر', continent: 'africa', arab: true, language: 'العربية والأمازيغية', currency: 'الدينار الجزائري', population: 45, landmark: 'مقام الشهيد', landmarkEmoji: '🏔️', famousFor: 'أكبر دولة في أفريقيا',
    facts: ['الجزائر أكبر دولة في أفريقيا وفي الوطن العربي مساحةً.', 'أكثر من 80% من الجزائر صحراء كبرى، وفيها رسومات على الصخور عمرها آلاف السنين.', 'الفنك ثعلب صغير بأذنين كبيرتين يعيش في صحراء الجزائر.'] },
  { code: 'tn', name: 'تونس', en: 'Tunisia', capital: 'تونس', continent: 'africa', arab: true, language: 'العربية', currency: 'الدينار التونسي', population: 12, landmark: 'قرطاج', landmarkEmoji: '🏛️', famousFor: 'الياسمين والبحر',
    facts: ['قرطاج مدينة قديمة جداً خرج منها القائد حنبعل الذي عبر الجبال بالفيلة!', 'الياسمين زهرة تونس المحبوبة، ويبيعها الناس في عقود صغيرة.', 'مدينة سيدي بوسعيد كلها بيوت بيضاء وأبواب زرقاء.'] },
  { code: 'ly', name: 'ليبيا', en: 'Libya', capital: 'طرابلس', continent: 'africa', arab: true, language: 'العربية', currency: 'الدينار الليبي', population: 7, landmark: 'لبدة الكبرى', landmarkEmoji: '🏛️', famousFor: 'الآثار الرومانية',
    facts: ['لبدة الكبرى مدينة رومانية قديمة من أفضل الآثار المحفوظة في العالم.', 'معظم ليبيا صحراء، وفيها بحيرات مخفية وسط الرمال في واحة أوباري.', 'شواطئ ليبيا على البحر المتوسط طويلة جداً تمتد لحوالي 1800 كيلومتر.'] },
  { code: 'mr', name: 'موريتانيا', en: 'Mauritania', capital: 'نواكشوط', continent: 'africa', arab: true, language: 'العربية', currency: 'الأوقية', population: 5, landmark: 'عين الصحراء', landmarkEmoji: '🌀', famousFor: 'عين الصحراء',
    facts: ['عين الصحراء تكوين صخري دائري ضخم يراه رواد الفضاء من الأعلى.', 'مدينة شنقيط القديمة فيها مكتبات بمخطوطات عمرها مئات السنين.', 'في موريتانيا أطول قطار في العالم ينقل الحديد عبر الصحراء.'] },
  { code: 'so', name: 'الصومال', en: 'Somalia', capital: 'مقديشو', continent: 'africa', arab: true, language: 'الصومالية والعربية', currency: 'الشلن الصومالي', population: 18, landmark: 'شاطئ ليدو', landmarkEmoji: '🏖️', famousFor: 'أطول ساحل في أفريقيا',
    facts: ['للصومال أطول ساحل في قارة أفريقيا.', 'الجمال في الصومال أكثر من أي دولة أخرى في العالم.', 'كان الصوماليون قديماً تجاراً مهرة يبيعون البخور واللبان.'] },
  { code: 'dj', name: 'جيبوتي', en: 'Djibouti', capital: 'جيبوتي', continent: 'africa', arab: true, language: 'العربية والفرنسية', currency: 'الفرنك الجيبوتي', population: 1, landmark: 'بحيرة عسل', landmarkEmoji: '🧂', famousFor: 'بحيرة الملح',
    facts: ['بحيرة عسل أكثر البحيرات ملوحة في العالم وأخفض نقطة في أفريقيا.', 'تقع جيبوتي عند مضيق باب المندب، وهو ممر بحري مهم جداً.', 'في جيبوتي يمكن السباحة مع أسماك قرش الحوت الضخمة المسالمة.'] },
  { code: 'km', name: 'جزر القمر', en: 'Comoros', capital: 'موروني', continent: 'africa', arab: true, language: 'العربية والقمرية', currency: 'الفرنك القمري', population: 0.9, landmark: 'بركان كارتالا', landmarkEmoji: '🌋', famousFor: 'زهرة الإيلنغ',
    facts: ['جزر القمر مجموعة جزر بركانية في المحيط الهندي.', 'منها تأتي زهرة الإيلنغ التي تُصنع منها أشهر العطور.', 'سمكة السيلاكانث النادرة التي ظنّ العلماء أنها انقرضت وُجدت حية قربها.'] },
  // ── آسيا ──
  { code: 'tr', name: 'تركيا', en: 'Turkey', capital: 'أنقرة', continent: 'asia', language: 'التركية', currency: 'الليرة التركية', population: 85, landmark: 'آيا صوفيا', landmarkEmoji: '🕌', famousFor: 'إسطنبول',
    facts: ['إسطنبول المدينة الوحيدة في العالم التي تقع في قارتين: آسيا وأوروبا.', 'في كابادوكيا تطير المناطيد الملونة فوق مداخن صخرية عجيبة.', 'الشاي التركي يُقدَّم في أكواب صغيرة على شكل زهرة التوليب.'] },
  { code: 'jp', name: 'اليابان', en: 'Japan', capital: 'طوكيو', continent: 'asia', language: 'اليابانية', currency: 'الين', population: 124, landmark: 'جبل فوجي', landmarkEmoji: '🗻', famousFor: 'الساموراي والروبوتات',
    facts: ['اليابان بلد الشمس المشرقة، وجبل فوجي بركان جميل يعلوه الثلج.', 'القطارات اليابانية من أسرع قطارات العالم وتصل سرعتها 320 كم في الساعة.', 'أزهار الكرز الوردية تتفتح كل ربيع ويخرج الناس للتنزه تحتها.'] },
  { code: 'cn', name: 'الصين', en: 'China', capital: 'بكين', continent: 'asia', language: 'الصينية', currency: 'اليوان', population: 1410, landmark: 'سور الصين العظيم', landmarkEmoji: '🏯', famousFor: 'السور العظيم والباندا',
    facts: ['سور الصين العظيم طوله أكثر من 20 ألف كيلومتر، بُني ليحمي البلاد.', 'الباندا العملاقة لا تعيش في البرية إلا في الصين وتأكل الخيزران طوال اليوم.', 'الصينيون اخترعوا الورق والبوصلة والألعاب النارية.'] },
  { code: 'in', name: 'الهند', en: 'India', capital: 'نيودلهي', continent: 'asia', language: 'الهندية والإنجليزية', currency: 'الروبية', population: 1430, landmark: 'تاج محل', landmarkEmoji: '🕌', famousFor: 'تاج محل والتوابل',
    facts: ['تاج محل قصر من الرخام الأبيض بناه ملك حباً لزوجته.', 'الهند أكثر دول العالم سكاناً، وفيها أكثر من 20 لغة رسمية.', 'الأرقام التي نستخدمها اليوم جاءت أصلاً من الهند ونقلها العرب للعالم.'] },
  { code: 'id', name: 'إندونيسيا', en: 'Indonesia', capital: 'جاكرتا', continent: 'asia', language: 'الإندونيسية', currency: 'الروبية الإندونيسية', population: 278, landmark: 'بوروبودور', landmarkEmoji: '🏝️', famousFor: 'أكثر من 17 ألف جزيرة',
    facts: ['إندونيسيا مكوّنة من أكثر من 17 ألف جزيرة!', 'فيها أكبر عدد من المسلمين في العالم.', 'تنين كومودو أكبر سحلية في العالم يعيش في جزرها.'] },
  { code: 'my', name: 'ماليزيا', en: 'Malaysia', capital: 'كوالالمبور', continent: 'asia', language: 'الملايو', currency: 'الرينغيت', population: 34, landmark: 'برجا بتروناس', landmarkEmoji: '🏙️', famousFor: 'البرجان التوأم',
    facts: ['برجا بتروناس التوأمان بينهما جسر معلّق في الهواء.', 'في غابات ماليزيا تعيش قرود إنسان الغاب (الأورانغوتان) وأكبر زهرة في العالم رافليسيا.', 'ماليزيا مشهورة بالفاكهة ذات الرائحة القوية اسمها دوريان.'] },
  { code: 'pk', name: 'باكستان', en: 'Pakistan', capital: 'إسلام آباد', continent: 'asia', language: 'الأردية', currency: 'الروبية الباكستانية', population: 240, landmark: 'مسجد فيصل', landmarkEmoji: '🕌', famousFor: 'جبال كي 2',
    facts: ['جبل كي 2 في باكستان ثاني أعلى جبل في العالم بعد إيفرست.', 'مسجد فيصل في إسلام آباد شكله مثل خيمة بدوية ضخمة.', 'باكستان من أكبر منتجي كرات القدم المصنوعة يدوياً في العالم.'] },
  // ── أوروبا ──
  { code: 'fr', name: 'فرنسا', en: 'France', capital: 'باريس', continent: 'europe', language: 'الفرنسية', currency: 'اليورو', population: 68, landmark: 'برج إيفل', landmarkEmoji: '🗼', famousFor: 'برج إيفل',
    facts: ['برج إيفل بُني من الحديد عام 1889 وكان الناس يظنونه قبيحاً، ثم أحبوه!', 'فرنسا أكثر دولة يزورها السياح في العالم.', 'الفرنسيون يحبون الخبز الطويل الباغيت ويأكلون منه ملايين الأرغفة يومياً.'] },
  { code: 'gb', name: 'بريطانيا', en: 'United Kingdom', capital: 'لندن', continent: 'europe', language: 'الإنجليزية', currency: 'الجنيه الإسترليني', population: 67, landmark: 'بيغ بن', landmarkEmoji: '🕰️', famousFor: 'بيغ بن والملكة',
    facts: ['بيغ بن اسم الجرس الكبير داخل برج الساعة في لندن، وليس البرج نفسه.', 'في لندن أقدم قطار تحت الأرض في العالم، بدأ عام 1863.', 'المطر يهطل كثيراً في بريطانيا، لذلك يحمل الناس المظلات دائماً.'] },
  { code: 'de', name: 'ألمانيا', en: 'Germany', capital: 'برلين', continent: 'europe', language: 'الألمانية', currency: 'اليورو', population: 84, landmark: 'بوابة براندنبورغ', landmarkEmoji: '🏛️', famousFor: 'السيارات والقلاع',
    facts: ['في ألمانيا أكثر من 20 ألف قلعة، وقلعة نويشفانشتاين ألهمت قلعة ديزني.', 'الألمان اخترعوا السيارة الأولى والدراجة والطابعة.', 'الطرق السريعة الألمانية بعضها بلا حد أقصى للسرعة.'] },
  { code: 'it', name: 'إيطاليا', en: 'Italy', capital: 'روما', continent: 'europe', language: 'الإيطالية', currency: 'اليورو', population: 59, landmark: 'الكولوسيوم', landmarkEmoji: '🏟️', famousFor: 'البيتزا والمعكرونة',
    facts: ['شكل إيطاليا على الخريطة يشبه الحذاء الطويل!', 'البيتزا والمعكرونة والآيس كريم الجيلاتو كلها اخترعها الإيطاليون.', 'مدينة البندقية شوارعها قنوات مائية والناس يتنقلون بالقوارب.'] },
  { code: 'es', name: 'إسبانيا', en: 'Spain', capital: 'مدريد', continent: 'europe', language: 'الإسبانية', currency: 'اليورو', population: 48, landmark: 'قصر الحمراء', landmarkEmoji: '🏰', famousFor: 'الحمراء وكرة القدم',
    facts: ['قصر الحمراء في غرناطة بناه المسلمون في الأندلس وهو من أجمل القصور في العالم.', 'في إسبانيا مهرجان يرمي فيه الناس الطماطم على بعضهم للمرح!', 'الإسبانية ثاني أكثر لغة يتكلمها الناس كلغة أم في العالم.'] },
  { code: 'ru', name: 'روسيا', en: 'Russia', capital: 'موسكو', continent: 'europe', language: 'الروسية', currency: 'الروبل', population: 144, landmark: 'كاتدرائية القديس باسيل', landmarkEmoji: '🏰', famousFor: 'أكبر دولة في العالم',
    facts: ['روسيا أكبر دولة في العالم، وفيها 11 منطقة زمنية مختلفة!', 'بحيرة بايكال أعمق بحيرة في العالم وفيها خُمس الماء العذب على الأرض.', 'أول إنسان ذهب إلى الفضاء كان روسياً اسمه يوري غاغارين.'] },
  { code: 'nl', name: 'هولندا', en: 'Netherlands', capital: 'أمستردام', continent: 'europe', language: 'الهولندية', currency: 'اليورو', population: 18, landmark: 'طواحين الهواء', landmarkEmoji: '🌷', famousFor: 'التوليب والدراجات',
    facts: ['في هولندا دراجات أكثر من الناس!', 'ثلث هولندا تحت مستوى سطح البحر، ويحمونها بسدود وطواحين هواء.', 'حقول التوليب الملونة في الربيع تبدو كسجادة ضخمة.'] },
  // ── الأمريكتان ──
  { code: 'us', name: 'أمريكا', en: 'United States', capital: 'واشنطن', continent: 'namerica', language: 'الإنجليزية', currency: 'الدولار', population: 335, landmark: 'تمثال الحرية', landmarkEmoji: '🗽', famousFor: 'ناسا وهوليوود',
    facts: ['تمثال الحرية كان هدية من فرنسا لأمريكا.', 'وكالة ناسا الأمريكية أرسلت أول إنسان إلى القمر عام 1969.', 'فيها غراند كانيون، وادٍ ضخم حفره نهر عبر ملايين السنين.'] },
  { code: 'ca', name: 'كندا', en: 'Canada', capital: 'أوتاوا', continent: 'namerica', language: 'الإنجليزية والفرنسية', currency: 'الدولار الكندي', population: 40, landmark: 'شلالات نياغارا', landmarkEmoji: '🍁', famousFor: 'ورقة القيقب والثلج',
    facts: ['ورقة شجرة القيقب على علم كندا، ومن الشجرة يصنعون شراباً حلواً للفطائر.', 'في كندا بحيرات أكثر من كل دول العالم مجتمعة.', 'الدببة القطبية البيضاء تعيش في شمال كندا البارد.'] },
  { code: 'mx', name: 'المكسيك', en: 'Mexico', capital: 'مكسيكو سيتي', continent: 'namerica', language: 'الإسبانية', currency: 'البيزو', population: 128, landmark: 'هرم تشيتشن إيتزا', landmarkEmoji: '🌮', famousFor: 'التاكو والمايا',
    facts: ['حضارة المايا القديمة بنت أهرامات وعرفت الفلك والحساب.', 'الشوكولاتة جاءت أصلاً من المكسيك، وكانوا يشربونها مرّة بلا سكر!', 'المكسيك فيها أكبر عدد من المتكلمين بالإسبانية في العالم.'] },
  { code: 'br', name: 'البرازيل', en: 'Brazil', capital: 'برازيليا', continent: 'samerica', language: 'البرتغالية', currency: 'الريال البرازيلي', population: 216, landmark: 'تمثال المسيح الفادي', landmarkEmoji: '⚽', famousFor: 'الأمازون وكرة القدم',
    facts: ['غابات الأمازون في البرازيل أكبر غابة مطيرة في العالم، وتُسمّى رئة الأرض.', 'البرازيل فازت بكأس العالم لكرة القدم خمس مرات، أكثر من أي دولة.', 'نهر الأمازون فيه أسماك البيرانا ودلافين وردية اللون.'] },
  { code: 'ar', name: 'الأرجنتين', en: 'Argentina', capital: 'بوينس آيرس', continent: 'samerica', language: 'الإسبانية', currency: 'البيزو الأرجنتيني', population: 46, landmark: 'شلالات إغوازو', landmarkEmoji: '🐧', famousFor: 'ميسي والتانغو',
    facts: ['اسم الأرجنتين يعني أرض الفضة.', 'في جنوبها بطاريق وأنهار جليدية ضخمة.', 'منها لاعب كرة القدم الشهير ميسي، وفازت بكأس العالم 2022.'] },
  // ── أوقيانوسيا ──
  { code: 'au', name: 'أستراليا', en: 'Australia', capital: 'كانبرا', continent: 'oceania', language: 'الإنجليزية', currency: 'الدولار الأسترالي', population: 26, landmark: 'دار أوبرا سيدني', landmarkEmoji: '🦘', famousFor: 'الكنغر والكوالا',
    facts: ['الكنغر والكوالا لا يعيشان في البرية إلا في أستراليا.', 'الحاجز المرجاني العظيم أكبر كائن حي على الأرض ويُرى من الفضاء.', 'عاصمة أستراليا كانبرا وليست سيدني، وكثيرون يخطئون في ذلك!'] },
  { code: 'nz', name: 'نيوزيلندا', en: 'New Zealand', capital: 'ويلينغتون', continent: 'oceania', language: 'الإنجليزية والماورية', currency: 'الدولار النيوزيلندي', population: 5, landmark: 'جبال الألب الجنوبية', landmarkEmoji: '🐑', famousFor: 'الخراف والكيوي',
    facts: ['في نيوزيلندا خراف أكثر من الناس بخمس مرات!', 'طائر الكيوي لا يطير ويعيش فقط في نيوزيلندا، وبه سُمّي السكان.', 'صُوّرت فيها أفلام سيد الخواتم بسبب جبالها الخلابة.'] },
]

export const countryByCode = (code: string) => countries.find(c => c.code === code.toLowerCase())
export const arabCountries = countries.filter(c => c.arab)
