import { CAT_COLORS, LEVELS } from '../constants';
import { DexUnlock } from '../types';

export function calculateXp(
  colorKey: string,
  poseKey: string,
  catCount: string,
  existingDexUnlocks: DexUnlock[]
) {
  const color = CAT_COLORS.find(c => c.key === colorKey);
  const isNewDexUnlock = !existingDexUnlocks.some(
    d => d.colorKey === colorKey && d.poseKey === poseKey
  );

  const base = 10;
  const newDexBonus = isNewDexUnlock ? 30 : 0;
  const rarityBonus = color?.xpBonus ?? 0;
  const groupBonus = catCount === 'four_plus' ? 20 : 0;
  const totalXp = base + newDexBonus + rarityBonus + groupBonus;

  return {
    totalXp,
    isNewDexUnlock,
    rarity: color?.rarity ?? 'common',
    breakdown: { base, newDexBonus, rarityBonus, groupBonus },
  };
}

export function getLevelFromXp(totalXp: number) {
  const level = [...LEVELS].reverse().find(l => totalXp >= l.requiredTotalXp)!;
  return level;
}
