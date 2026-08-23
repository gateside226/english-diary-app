// 英語学習のモチベーションにつながる英語フレーズ集。
// 日替わりで1つ表示する（同じ日にリロードしても変わらないよう日付から決定的に選ぶ）。
const PHRASES = [
  { en: 'A little progress each day adds up to big results.', ja: '毎日の小さな積み重ねが大きな結果につながる' },
  { en: 'The only way to learn a language is to use it.', ja: '言語を学ぶ唯一の方法は、それを使うこと' },
  { en: "Mistakes are proof that you are trying.", ja: '間違いは挑戦している証' },
  { en: 'Practice makes progress, not perfection.', ja: '練習は完璧ではなく上達をもたらす' },
  { en: 'Every word you learn today is a tool for tomorrow.', ja: '今日覚えた単語は明日の道具になる' },
  { en: "Don't watch the clock; do what it does. Keep going.", ja: '時計を見るな。時計がすることをしろ。進み続けろ' },
  { en: 'Fluency is built one sentence at a time.', ja: '流暢さは一文ずつ積み上げていくもの' },
  { en: 'Small steps every day lead to big changes.', ja: '毎日の小さな一歩が大きな変化につながる' },
  { en: 'You are one habit away from real fluency.', ja: '本当の流暢さまで、あと一つの習慣だけ' },
  { en: 'Consistency beats intensity.', ja: '継続は集中に勝る' },
  { en: 'Speak, even if you are afraid of mistakes.', ja: '間違いを恐れずに話そう' },
  { en: 'Your only limit is the one you set for yourself.', ja: '限界は自分自身が決めるもの' },
  { en: 'Learning a language is a journey, not a race.', ja: '言語学習はレースではなく旅' },
  { en: 'Today’s effort is tomorrow’s confidence.', ja: '今日の努力は明日の自信' },
  { en: 'Keep going. Everything you need will come to you.', ja: '進み続けよう。必要なものは全て後からついてくる' },
  { en: 'The expert in anything was once a beginner.', ja: 'どんな達人も最初は初心者だった' },
  { en: 'Write a little every day; it adds up faster than you think.', ja: '毎日少しずつ書けば、思うより早く積み上がる' },
  { en: 'Progress, not perfection.', ja: '大切なのは完璧さではなく進歩' },
  { en: 'One sentence a day keeps stagnation away.', ja: '一日一文が停滞を防ぐ' },
  { en: 'Your future self will thank you for today’s effort.', ja: '未来の自分が今日の努力に感謝する' }
];

export function getTodaysPhrase(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return PHRASES[dayIndex % PHRASES.length];
}
