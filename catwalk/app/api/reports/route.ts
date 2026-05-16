import { NextRequest, NextResponse } from 'next/server';
import { createReport, getReportsByNickname, getAllReportsForMap, updateUserXp, getUserByNickname } from '@/services/notionService';
import { createDexUnlock } from '@/services/notionService';
import { calculateXp, getLevelFromXp } from '@/services/xpService';
import { CAT_POSES } from '@/constants';

// GET /api/reports?nickname=xxx&map=true
export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get('nickname');
  const forMap = req.nextUrl.searchParams.get('map') === 'true';

  if (forMap) {
    const pages = await getAllReportsForMap();
    const points = pages.map((p: any) => {
      const lat = p.properties.latitude.number;
      const lng = p.properties.longitude.number;
      const nick = p.properties.user_nickname.rich_text[0]?.plain_text;
      // 100m 模糊化
      const fuzzedLat = Math.round(lat / 0.0009) * 0.0009;
      const fuzzedLng = Math.round(lng / 0.0009) * 0.0009;
      return { lat: fuzzedLat, lng: fuzzedLng, nickname: nick };
    }).filter((p: any) => p.lat && p.lng);
    return NextResponse.json({ points });
  }

  if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });
  const pages = await getReportsByNickname(nickname);
  const reports = pages.map((p: any) => ({
    reportId: p.properties.report_id.title[0]?.plain_text,
    photo: p.properties.photo.url,
    latitude: p.properties.latitude.number,
    longitude: p.properties.longitude.number,
    colorKey: p.properties.color_key.rich_text[0]?.plain_text,
    poseKey: p.properties.pose.select?.name,
    environmentKey: p.properties.environment.select?.name,
    catCount: p.properties.cat_count.select?.name,
    xpEarned: p.properties.xp_earned.number,
    submittedAt: p.properties.submitted_at.created_time,
  }));
  return NextResponse.json({ reports });
}

// POST /api/reports  → 送出回報（含 XP 計算 + Dex 解鎖 + Notion 寫入）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname, photoUrl, colorKey, poseKey, environmentKey, catCount, latitude, longitude, existingDexUnlocks, currentTotalXp, userPageId } = body;

    // 計算 XP
    const xpResult = calculateXp(colorKey, poseKey, catCount, existingDexUnlocks ?? []);

    // 產生 report_id
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const reportId = `R-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;

    // 取得姿勢的英文 key（Notion Select 儲存英文 key）
    const poseLabel = CAT_POSES.find(p => p.key === poseKey)?.key ?? poseKey;

    // 寫入 Report
    await createReport({
      reportId,
      userNickname: nickname,
      photoUrl,
      latitude: latitude ?? 25.0478,
      longitude: longitude ?? 121.5170,
      colorKey,
      pose: poseLabel,
      environment: environmentKey,
      catCount,
      xpEarned: xpResult.totalXp,
    });

    // 若是新圖鑑解鎖，寫入 DexUnlocks
    if (xpResult.isNewDexUnlock) {
      await createDexUnlock({
        unlockId: `${nickname}-${colorKey}-${poseKey}`,
        userNickname: nickname,
        colorKey,
        pose: poseKey,
        unlockedAt: now.toISOString(),
      });
    }

    // 更新使用者 XP
    const newTotalXp = (currentTotalXp ?? 0) + xpResult.totalXp;
    if (userPageId) await updateUserXp(userPageId, newTotalXp);

    // 計算等級
    const newLevelInfo = getLevelFromXp(newTotalXp);

    return NextResponse.json({
      reportId,
      xpEarned: xpResult.totalXp,
      isNewDexUnlock: xpResult.isNewDexUnlock,
      rarity: xpResult.rarity,
      newTotalXp,
      newLevel: newLevelInfo.level,
      newTitle: newLevelInfo.title,
    });
  } catch (err) {
    console.error('Report error:', err);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
