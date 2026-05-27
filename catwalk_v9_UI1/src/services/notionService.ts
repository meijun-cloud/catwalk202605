const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const USERS_DB = process.env.NOTION_USERS_DB_ID!;
const REPORTS_DB = process.env.NOTION_REPORTS_ID!;   // 你的實際變數名稱
const DEX_DB = process.env.NOTION_DEX_DB_ID!;

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export async function getUserByNickname(nickname: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${USERS_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({ filter: { property: 'nickname', title: { equals: nickname } } }),
  });
  const data = await res.json();
  return data.results?.[0] ?? null;
}

export async function createUser(nickname: string, email: string) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST', headers,
    body: JSON.stringify({
      parent: { database_id: USERS_DB },
      properties: {
        nickname: { title: [{ text: { content: nickname } }] },
        email: { email },
        total_xp: { number: 0 },
        gps_permission: { checkbox: false },
      },
    }),
  });
  return await res.json();
}

export async function updateGpsPermission(pageId: string, granted: boolean) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ properties: { gps_permission: { checkbox: granted } } }),
  });
}

export async function updateUserXp(pageId: string, totalXp: number) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ properties: { total_xp: { number: totalXp } } }),
  });
}

export async function createReport(data: {
  reportId: string; userNickname: string; photoUrl: string;
  latitude: number; longitude: number; colorKey: string;
  pose: string; environment: string; catCount: string; xpEarned: number;
}) {
  const properties: Record<string, any> = {
    report_id: { title: [{ text: { content: data.reportId } }] },
    user_nickname: { rich_text: [{ text: { content: data.userNickname } }] },
    latitude: { number: data.latitude },
    longitude: { number: data.longitude },
    color_key: { rich_text: [{ text: { content: data.colorKey } }] },
    pose: { select: { name: data.pose } },
    environment: { select: { name: data.environment } },
    cat_count: { select: { name: data.catCount } },
    xp_earned: { number: data.xpEarned },
  };
  if (data.photoUrl && data.photoUrl.startsWith('http')) {
    properties.photo = { url: data.photoUrl };
  }
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST', headers,
    body: JSON.stringify({ parent: { database_id: REPORTS_DB }, properties }),
  });
  const json = await res.json();
  if (!res.ok) console.error('Notion createReport error:', JSON.stringify(json));
  return json;
}

export async function getReportsByNickname(nickname: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${REPORTS_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({
      filter: { property: 'user_nickname', rich_text: { equals: nickname } },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
  });
  const data = await res.json();
  return data.results ?? [];
}

export async function getDexByNickname(nickname: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DEX_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({ filter: { property: 'user_nickname', rich_text: { equals: nickname } } }),
  });
  const data = await res.json();
  return data.results ?? [];
}

export async function createDexUnlock(data: {
  unlockId: string; userNickname: string; colorKey: string; pose: string; unlockedAt: string;
}) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST', headers,
    body: JSON.stringify({
      parent: { database_id: DEX_DB },
      properties: {
        unlock_id: { title: [{ text: { content: data.unlockId } }] },
        user_nickname: { rich_text: [{ text: { content: data.userNickname } }] },
        color_key: { rich_text: [{ text: { content: data.colorKey } }] },
        pose: { select: { name: data.pose } },
        unlocked_at: { date: { start: data.unlockedAt } },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error('Notion createDexUnlock error:', JSON.stringify(err));
  }
}
