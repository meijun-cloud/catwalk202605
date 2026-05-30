import { NextRequest, NextResponse } from 'next/server';

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const DEX_DB = process.env.NOTION_DEX_DB_ID!;
const USERS_DB = process.env.NOTION_USERS_DB_ID!;

const H = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// GET /api/dex?email=xxx 或 ?nickname=xxx
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const email = url.searchParams.get('email');
  const nickname = url.searchParams.get('nickname');

  // 取得所有 nickname（同 email 的歷史筆數）
  let nicknames: string[] = [];
  if (email) {
    try {
      const usersRes = await fetch(`https://api.notion.com/v1/databases/${USERS_DB}/query`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ filter: { property: 'email', email: { equals: email } } }),
      });
      const usersData = await usersRes.json();
      nicknames = (usersData.results ?? [])
        .map((p: any) => p.properties.nickname.title[0]?.plain_text)
        .filter(Boolean);
    } catch { /* fallback */ }
  }
  if (nicknames.length === 0 && nickname) nicknames = [nickname];
  if (nicknames.length === 0) return NextResponse.json({ error: 'email or nickname required' }, { status: 400 });

  const filter = nicknames.length === 1
    ? { property: 'user_nickname', rich_text: { equals: nicknames[0] } }
    : { or: nicknames.map(n => ({ property: 'user_nickname', rich_text: { equals: n } })) };

  const res = await fetch(`https://api.notion.com/v1/databases/${DEX_DB}/query`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ filter }),
  });
  const data = await res.json();
  const unlocks = (data.results ?? []).map((p: any) => ({
    colorKey: p.properties.color_key.rich_text[0]?.plain_text,
    poseKey: p.properties.pose.select?.name,
    poseNote: p.properties.pose_note?.rich_text?.[0]?.plain_text ?? undefined,
    unlockedAt: p.properties.unlocked_at.date?.start,
  }));
  return NextResponse.json({ unlocks });
}
