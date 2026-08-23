// 実在する英語のことわざ・慣用表現集（AIが生成したものではなく、固定リスト）。
// 日替わりで1つ表示する（同じ日にリロードしても変わらないよう日付から決定的に選ぶ）。
// ※日本語は直訳ではなく、意味が近い日本語のことわざ・表現を添えている場合があります。
const PHRASES = [
  { en: 'Practice makes perfect.', ja: '習うより慣れよ' },
  { en: "Rome wasn't built in a day.", ja: 'ローマは一日にして成らず' },
  { en: 'Slow and steady wins the race.', ja: '急がば回れ' },
  { en: "Where there's a will, there's a way.", ja: '精神一到何事か成らざらん' },
  { en: 'Actions speak louder than words.', ja: '行動は言葉よりも雄弁' },
  { en: 'The early bird catches the worm.', ja: '早起きは三文の徳' },
  { en: 'No pain, no gain.', ja: '苦は楽の種' },
  { en: 'Better late than never.', ja: '遅くともしないよりはまし' },
  { en: 'A journey of a thousand miles begins with a single step.', ja: '千里の道も一歩から' },
  { en: "You can't make an omelette without breaking eggs.", ja: '卵を割らずにオムレツは作れない' },
  { en: 'When in Rome, do as the Romans do.', ja: '郷に入っては郷に従え' },
  { en: "It's never too late to learn.", ja: '学ぶのに遅すぎるということはない' },
  { en: 'Knowledge is power.', ja: '知は力なり' },
  { en: 'Little strokes fell great oaks.', ja: '塵も積もれば山となる' },
  { en: 'Every cloud has a silver lining.', ja: '苦あれば楽あり' },
  { en: "Don't count your chickens before they hatch.", ja: '捕らぬ狸の皮算用' },
  { en: 'The pen is mightier than the sword.', ja: '文は武より強し' },
  { en: 'Time flies when you are having fun.', ja: '楽しい時間はあっという間に過ぎる' },
  { en: 'Practice what you preach.', ja: '言行一致' },
  { en: "Two heads are better than one.", ja: '三人寄れば文殊の知恵' },
  { en: 'Failure teaches success.', ja: '失敗は成功のもと' },
  { en: 'While there is life, there is hope.', ja: '命あっての物種' },
  { en: 'Well begun is half done.', ja: '始めが肝心' },
  { en: 'Look before you leap.', ja: '転ばぬ先の杖' }
];

export function getTodaysPhrase(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return PHRASES[dayIndex % PHRASES.length];
}
