import { NextRequest, NextResponse } from 'next/server';
import { getUserByNickname, createUser } from '@/services/notionService';

// GET /api/users?nickname=xxx  → 查詢使用者
export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get('nickname');
  if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

  const page = await getUserByNickname(nickname);
  if (!page) return NextResponse.json({ exists: false });

  return NextResponse.json({
    exists: true,
    pageId: page.id,
    nickname: page.properties.nickname.title[0]?.plain_text,
    email: page.properties.email.email,
    totalXp: page.properties.total_xp.number ?? 0,
  });
}

// POST /api/users  → 建立新使用者
export async function POST(req: NextRequest) {
  const { nickname, email } = await req.json();
  if (!nickname || !email) return NextResponse.json({ error: 'nickname and email required' }, { status: 400 });

  // 先查是否已存在
  const existing = await getUserByNickname(nickname);
  if (existing) {
    return NextResponse.json({
      pageId: existing.id,
      nickname: existing.properties.nickname.title[0]?.plain_text,
      email: existing.properties.email.email,
      totalXp: existing.properties.total_xp.number ?? 0,
    });
  }

  const page = await createUser(nickname, email);
  return NextResponse.json({ pageId: page.id, nickname, email, totalXp: 0 });
}
