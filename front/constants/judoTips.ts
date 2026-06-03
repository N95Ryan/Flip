export type JudoTip = {
  quote: string;
  author: string;
};

export const JUDO_TIPS: JudoTip[] = [
  { quote: 'Maximum efficiency, minimum effort.', author: 'Jigoro Kano' },
  { quote: 'The flexible wins over the stiff.', author: 'Judo proverb' },
  { quote: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { quote: 'Mutual welfare and benefit.', author: 'Jigoro Kano' },
  { quote: 'In judo, the best attack is one that never needs force.', author: 'Jigoro Kano' },
  { quote: 'Victory is reserved for those willing to pay its price.', author: 'Japanese proverb' },
  { quote: 'The pine fought the storm and broke; the willow bent and survived.', author: 'Japanese proverb' },
  { quote: 'Spirit is more important than technique.', author: 'Jigoro Kano' },
  { quote: 'Before the mat, bow. After the mat, bow.', author: 'Judo proverb' },
  { quote: 'He who is afraid of falling will never learn to throw.', author: 'Judo proverb' },
  { quote: 'The purpose of judo is to perfect the self.', author: 'Jigoro Kano' },
  { quote: 'Softness overcomes hardness.', author: 'Japanese proverb' },
  { quote: 'Do not think of attack and defense separately.', author: 'Jigoro Kano' },
  { quote: 'A single blow can end a fight; a single lesson can change a life.', author: 'Judo proverb' },
  { quote: 'The way of judo is the way of humanity.', author: 'Jigoro Kano' },
  { quote: 'Practice with your heart, not only your body.', author: 'Judo proverb' },
  { quote: 'Respect your partner as you respect yourself.', author: 'Jigoro Kano' },
  { quote: 'Balance is not standing still; it is constant adjustment.', author: 'Judo proverb' },
  { quote: 'The harder you resist, the easier you fall.', author: 'Judo proverb' },
  { quote: 'Seek perfection of character through training.', author: 'Jigoro Kano' },
];

export function getDailyTip(): JudoTip {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return JUDO_TIPS[dayOfYear % JUDO_TIPS.length] ?? JUDO_TIPS[0];
}
