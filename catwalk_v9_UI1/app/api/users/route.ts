import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUsersByEmail, createUser, updateGpsPermission } from '@/services/notionService';

// GET /api/users?email=xxx  → 以 email 查詢使用者
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const page = await getUserByEmail(email);
  if (!page) return NextResponse.json({ exists: false });

  return NextResponse.json({
    exists: true,
    pageId: page.id,
    nickname: page.properties.nickname.title[0]?.plain_text,
    email: page.properties.email.email,
    totalXp: page.properties.total_xp.number ?? 0,
  });
}

// POST /api/users  → 以 email 為主鍵登入
// 若 email 已存在且 nickname 相同 → 直接回傳（已登入狀態）
// 若 email 已存在但 nickname 不同 → 建立新筆數（記錄改名），並繼承最高 XP
// 若 email 不存在 → 建立新使用者
export async function POST(req: NextRequest) {
  const { nickname, email, gpsPermission } = await req.json();
  if (!nickname || !email) return NextResponse.json({ error: 'nickname and email required' }, { status: 400 });

  // 查 email 的所有歷史筆數
  const allByEmail = await getUsersByEmail(email);

  if (allByEmail.length > 0) {
    const latestPage = allByEmail[0]; // 最新一筆
    const latestNickname = latestPage.properties.nickname.title[0]?.plain_text;

    // 取所有筆數中最高的 total_xp
    const maxXp = Math.max(...allByEmail.map((p: any) => p.properties.total_xp.number ?? 0));

    if (latestNickname === nickname) {
      // 名稱沒變 → 直接回傳最新筆，不新增
      if (typeof gpsPermission === 'boolean') {
        await updateGpsPermission(latestPage.id, gpsPermission);
      }
      return NextResponse.json({
        pageId: latestPage.id,
        nickname,
        email,
        totalXp: maxXp,
      });
    } else {
      // 名稱改變了 → 建立新筆數記錄改名，繼承最高 XP
      const newPage = await createUser(nickname, email);
      // 將最高 XP 同步寫入新筆數
      if (maxXp > 0) {
        const { updateUserXp } = await import('@/services/notionService');
        await updateUserXp(newPage.id, maxXp);
      }
      if (typeof gpsPermission === 'boolean') {
        await updateGpsPermission(newPage.id, gpsPermission);
      }
      return NextResponse.json({
        pageId: newPage.id,
        nickname,
        email,
        totalXp: maxXp,
      });
    }
  }

  // email 不存在 → 全新使用者
  const page = await createUser(nickname, email);
  if (typeof gpsPermission === 'boolean') {
    await updateGpsPermission(page.id, gpsPermission);
  }
  return NextResponse.json({ pageId: page.id, nickname, email, totalXp: 0 });
}
