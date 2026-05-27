import { NextRequest, NextResponse } from 'next/server';
import {
  createReport,
  createDexUnlock,
  updateUserXp,
  getReportsByNickname,
} from '@/services/notionService';
import { getLevelFromXp } from '@/services/xpService';

// ── XP 計算規則 ──────────────────────────────────────
const BASE_XP = 30;
const RARITY_BONUS: Record<string, number> = { common: 0, uncommon: 20, rare: 50 };
const COLOR_RARITY: Record<string, string> = {
  black_white: 'common', orange: 'common', white: 'common', gray: 'uncommon',
  black: 'common', calico: 'common', tortoiseshell: 'uncommon', tabby: 'common',
  siamese: 'rare', white_tabby: 'uncommon', orange_white: 'uncommon', brown_white: 'rare',
};
// 姿勢中文對應
const POSE_LABELS: Record<string, string> = {
  basking: '曬太陽', curled_sleep: '蜷縮睡覺', walking: '走動中',
  grooming: '理毛', alert_standing: '警覺站立', sitting: '坐著發呆', eating: '吃飯',
};
// 環境中文對應
const ENV_LABELS: Record<string, string> = {
  alley: '巷弄', parking: '停車場', park: '公園', mountain: '山區',
  temple: '廟', arcade: '騎樓下', market: '傳統市場', wall: '矮牆／圍牆上',
  shop: '店面', station: '車站',
};
// 數量中文對應
const COUNT_LABELS: Record<string, string> = {
  one: '1 隻', two_three: '2–3 隻', four_plus: '4 隻以上',
};

// ── POST：送出回報 ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nickname, photoUrl, colorKey, poseKey, environmentKey, catCount,
      latitude, longitude, existingDexUnlocks, currentTotalXp, userPageId,
    } = body;

    if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

    // 計算 XP 與稀有度
    const rarity = COLOR_RARITY[colorKey] ?? 'common';
    const xpEarned = BASE_XP + (RARITY_BONUS[rarity] ?? 0);
    const newTotalXp = (currentTotalXp ?? 0) + xpEarned;

    // 等級計算
    const { level: newLevel, title: newTitle } = getLevelFromXp(newTotalXp);

    // 圖鑑是否為新解鎖
    const isNewDexUnlock = !Array.isArray(existingDexUnlocks) ||
      !existingDexUnlocks.some((d: any) => d.colorKey === colorKey && d.poseKey === poseKey);

    // 產生 reportId
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    const reportId = `R-${dateStr}-${rand}`;

    // 寫入 Notion Reports
    await createReport({
      reportId,
      userNickname: nickname,
      photoUrl: photoUrl ?? '',
      latitude: latitude ?? 25.0478,
      longitude: longitude ?? 121.5170,
      colorKey,
      pose: POSE_LABELS[poseKey] ?? poseKey,
      environment: ENV_LABELS[environmentKey] ?? environmentKey,
      catCount: COUNT_LABELS[catCount] ?? catCount,
      xpEarned,
    });

    // 新圖鑑解鎖 → 寫入 DexUnlocks
    if (isNewDexUnlock) {
      await createDexUnlock({
        unlockId: `${nickname}-${colorKey}-${poseKey}`,
        userNickname: nickname,
        colorKey,
        pose: POSE_LABELS[poseKey] ?? poseKey,
        unlockedAt: now.toISOString(),
      });
    }

    // 更新 Users XP
    if (userPageId) {
      await updateUserXp(userPageId, newTotalXp);
    }

    return NextResponse.json({
      success: true,
      reportId,
      xpEarned,
      rarity,
      isNewDexUnlock,
      newTotalXp,
      newLevel,
      newTitle,
    });
  } catch (err: any) {
    console.error('[reports POST] Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

// ── GET：讀取回報列表 ──────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get('nickname');

  // 地圖藍點（現在改由 /api/catdata 負責，這裡不再處理）
  if (!nickname) {
    return NextResponse.json({ error: 'nickname required' }, { status: 400 });
  }

  try {
    const pages = await getReportsByNickname(nickname);
    const reports = pages.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        reportId: props['report_id']?.title?.[0]?.plain_text ?? '',
        userNickname: props['user_nickname']?.rich_text?.[0]?.plain_text ?? '',
        photo: props['photo']?.url ?? null,
        latitude: props['latitude']?.number ?? null,
        longitude: props['longitude']?.number ?? null,
        colorKey: props['color_key']?.rich_text?.[0]?.plain_text ?? '',
        pose: props['pose']?.select?.name ?? '',
        environment: props['environment']?.select?.name ?? '',
        catCount: props['cat_count']?.select?.name ?? '',
        xpEarned: props['xp_earned']?.number ?? 0,
        submittedAt: page.created_time,
      };
    });
    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
