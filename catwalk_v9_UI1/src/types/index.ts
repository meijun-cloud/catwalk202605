export type Rarity = 'common' | 'uncommon' | 'rare';

export type CatColor = { key: string; label: string; rarity: Rarity; xpBonus: number };
export type CatPose = { key: string; label: string };
export type Environment = { key: string; label: string };
export type CatCount = { key: 'one' | 'two_three' | 'four_plus'; label: string };
export type Level = { level: number; title: string; requiredTotalXp: number };

export type UserState = {
  nickname: string;
  displayName: string;
  email?: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: string;
  avatarType: 'preset' | 'custom';
  avatarUrl: string;
  selectedPresetAvatarId: string | null;
};

export type Report = {
  reportId: string;
  photo: string;
  colorKey: string;
  poseKey: string;
  environmentKey: string;
  catCount: CatCount['key'];
  submittedAt: string;
  xpEarned: number;
  rarity: Rarity;
  isNewDexUnlock: boolean;
  isLevelUp: boolean;
  captureCount?: number;
  location?: { latitude: number; longitude: number; mapX?: number; mapY?: number };
};

export type DexUnlock = {
  colorKey: string;
  poseKey: string;
  unlockedAt: string;
  reportId?: string;
  photo?: string;
  xpEarned?: number;
  captureCount?: number;
  lastCapturedAt?: string;
};

export type ScreenName =
  | 'Login' | 'Map' | 'MockCamera' | 'Camera' | 'CatSelect'
  | 'Environment' | 'ConfirmReport' | 'Result' | 'Dex' | 'Profile';

export type ReportDraft = {
  photo: string;
  colorKey?: string;
  poseKey?: string;
  environmentKey?: string;
  catCount?: CatCount['key'];
  latitude?: number;
  longitude?: number;
};
