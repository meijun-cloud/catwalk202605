const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const USERS_DB = process.env.NOTION_USERS_DB_ID!;
const REPORTS_DB = process.env.NOTION_REPORTS_ID!;
const DEX_DB = process.env.NOTION_DEX_DB_ID!;

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// ── 以 email 查詢所有對應的 Users 筆數（一個 email 可能有多個 nickname）
export async function getUsersByEmail(email: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${USERS_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({
      filter: { property: 'email', email: { equals: email } },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
  });
  const data = await res.json();
  return data.results ?? [];
}

// 取最新一筆（最後改名的那個）
export async function getUserByEmail(email: string) {
  const results = await getUsersByEmail(email);
  return results[0] ?? null;
}

// 舊方法保留相容性
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

// 以「所有 nickname 清單」查 Reports（OR 條件），最多取 100 筆
export async function getReportsByNicknames(nicknames: string[]) {
  if (nicknames.length === 0) return [];
  // Notion OR filter
  const filter = nicknames.length === 1
    ? { property: 'user_nickname', rich_text: { equals: nicknames[0] } }
    : { or: nicknames.map(n => ({ property: 'user_nickname', rich_text: { equals: n } })) };

  const res = await fetch(`https://api.notion.com/v1/databases/${REPORTS_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({
      page_size: 100,
      filter,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
    cache: 'no-store',
  } as any);
  const data = await res.json();
  return data.results ?? [];
}

// 舊方法保留相容性
export async function getReportsByNickname(nickname: string) {
  return getReportsByNicknames([nickname]);
}

// 以「所有 nickname 清單」查 DexUnlocks
export async function getDexByNicknames(nicknames: string[]) {
  if (nicknames.length === 0) return [];
  const filter = nicknames.length === 1
    ? { property: 'user_nickname', rich_text: { equals: nicknames[0] } }
    : { or: nicknames.map(n => ({ property: 'user_nickname', rich_text: { equals: n } })) };

  const res = await fetch(`https://api.notion.com/v1/databases/${DEX_DB}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({ filter }),
  });
  const data = await res.json();
  return data.results ?? [];
}

// 舊方法保留相容性
export async function getDexByNickname(nickname: string) {
  return getDexByNicknames([nickname]);
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
