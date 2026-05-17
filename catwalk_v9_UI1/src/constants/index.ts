import { CatColor, CatPose, Environment, CatCount, Level } from '../types';

export const CAT_COLORS: CatColor[] = [
  { key: 'black_white', label: '黑白貓', rarity: 'common', xpBonus: 0 },
  { key: 'orange', label: '橘貓', rarity: 'common', xpBonus: 0 },
  { key: 'white', label: '白貓', rarity: 'common', xpBonus: 0 },
  { key: 'gray', label: '灰貓', rarity: 'uncommon', xpBonus: 20 },
  { key: 'black', label: '黑貓', rarity: 'common', xpBonus: 0 },
  { key: 'calico', label: '三花貓', rarity: 'common', xpBonus: 0 },
  { key: 'tortoiseshell', label: '玳瑁貓', rarity: 'uncommon', xpBonus: 20 },
  { key: 'tabby', label: '虎斑貓', rarity: 'common', xpBonus: 0 },
  { key: 'siamese', label: '暹羅貓', rarity: 'rare', xpBonus: 50 },
  { key: 'white_tabby', label: '白底虎斑', rarity: 'uncommon', xpBonus: 20 },
  { key: 'orange_white', label: '橘白貓', rarity: 'uncommon', xpBonus: 20 },
  { key: 'brown_white', label: '咖白', rarity: 'rare', xpBonus: 50 },
];

export const CAT_POSES: CatPose[] = [
  { key: 'basking', label: '曬太陽' },
  { key: 'curled_sleep', label: '蜷縮睡覺' },
  { key: 'walking', label: '走動中' },
  { key: 'grooming', label: '理毛' },
  { key: 'alert_standing', label: '警覺站立' },
  { key: 'sitting', label: '坐著發呆' },
  { key: 'eating', label: '吃飯' },
];

export const ENVIRONMENTS: Environment[] = [
  { key: 'alley', label: '巷弄' },
  { key: 'parking', label: '停車場' },
  { key: 'park', label: '公園' },
  { key: 'mountain', label: '山區' },
  { key: 'temple', label: '廟' },
  { key: 'arcade', label: '騎樓下' },
  { key: 'market', label: '傳統市場' },
  { key: 'wall', label: '矮牆／圍牆上' },
  { key: 'shop', label: '店面' },
  { key: 'station', label: '車站' },
];

export const CAT_COUNTS: CatCount[] = [
  { key: 'one', label: '1 隻' },
  { key: 'two_three', label: '2–3 隻' },
  { key: 'four_plus', label: '4 隻以上' },
];

export const LEVELS: Level[] = [
  { level: 1, title: '巷口新貓友', requiredTotalXp: 0 },
  { level: 2, title: '騎樓觀察員', requiredTotalXp: 30 },
  { level: 3, title: '街頭巡禮人', requiredTotalXp: 90 },
  { level: 4, title: '市場識途者', requiredTotalXp: 180 },
  { level: 5, title: '巷貓鄰里長', requiredTotalXp: 300 },
  { level: 6, title: '巷弄追風者', requiredTotalXp: 450 },
  { level: 7, title: '矮牆望遠師', requiredTotalXp: 600 },
  { level: 8, title: '夜路尋蹤師', requiredTotalXp: 780 },
  { level: 9, title: '城市貓師', requiredTotalXp: 975 },
  { level: 10, title: '貓部宗師', requiredTotalXp: 1170 },
];
