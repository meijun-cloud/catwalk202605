import { NextRequest, NextResponse } from 'next/server';
import { getDexByNickname } from '@/services/notionService';

// GET /api/dex?nickname=xxx
export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get('nickname');
  if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

  const pages = await getDexByNickname(nickname);
  const unlocks = pages.map((p: any) => ({
    colorKey: p.properties.color_key.rich_text[0]?.plain_text,
    poseKey: p.properties.pose.select?.name,
    unlockedAt: p.properties.unlocked_at.date?.start,
  }));
  return NextResponse.json({ unlocks });
}
