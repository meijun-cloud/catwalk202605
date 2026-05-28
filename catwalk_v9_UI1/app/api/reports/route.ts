import { NextRequest, NextResponse } from 'next/server';

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const REPORTS_DB    = process.env.NOTION_REPORTS_ID!;
const DEX_DB        = process.env.NOTION_DEX_DB_ID!;
const USERS_DB      = process.env.NOTION_USERS_DB_ID!;

const H = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// ── 常數（與 xpService / constants 一致）────────────────
const CAT_COLORS: Record<string, { rarity: string; xpBonus: number }> = {
  black_white:    { rarity: 'common',   xpBonus: 0  },
  orange:         { rarity: 'common',   xpBonus: 0  },
  white:          { rarity: 'common',   xpBonus: 0  },
  gray:           { rarity: 'uncommon', xpBonus: 20 },
  black:          { rarity: 'common',   xpBonus: 0  },
  calico:         { rarity: 'common',   xpBonus: 0  },
  tortoiseshell:  { rarity: 'uncommon', xpBonus: 20 },
  tabby:          { rarity: 'common',   xpBonus: 0  },
  siamese:        { rarity: 'rare',     xpBonus: 50 },
  white_tabby:    { rarity: 'uncommon', xpBonus: 20 },
  orange_white:   { rarity: 'uncommon', xpBonus: 20 },
  brown_white:    { rarity: 'rare',     xpBonus: 50 },
};

const LEVELS = [
  { level: 1,  title: '巷口新貓友',  requiredTotalXp: 0    },
  { level: 2,  title: '騎樓觀察員',  requiredTotalXp: 30   },
  { level: 3,  title: '街頭巡禮人',  requiredTotalXp: 90   },
  { level: 4,  title: '市場識途者',  requiredTotalXp: 180  },
  { level: 5,  title: '巷貓鄰里長',  requiredTotalXp: 300  },
  { level: 6,  title: '巷弄追風者',  requiredTotalXp: 450  },
  { level: 7,  title: '矮牆望遠師',  requiredTotalXp: 600  },
  { level: 8,  title: '夜路尋蹤師',  requiredTotalXp: 780  },
  { level: 9,  title: '城市貓師',    requiredTotalXp: 975  },
  { level: 10, title: '貓部宗師',    requiredTotalXp: 1170 },
];

const POSE_LABELS: Record<string, string> = {
  basking:        '曬太陽',
  curled_sleep:   '蜷縮睡覺',
  walking:        '走動中',
  grooming:       '理毛',
  alert_standing: '警覺站立',
  sitting:        '坐著發呆',
  eating:         '吃飯',
};

const ENV_LABELS: Record<string, string> = {
  alley:   '巷弄',   parking: '停車場', park:    '公園',
  mountain:'山區',   temple:  '廟',     arcade:  '騎樓下',
  market:  '傳統市場', wall:  '矮牆／圍牆上', shop: '店面', station: '車站',
};

const COUNT_LABELS: Record<string, string> = {
  one: '1 隻', two_three: '2–3 隻', four_plus: '4 隻以上',
};

function getLevelFromXp(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.requiredTotalXp) ?? LEVELS[0];
}

// Notion select 寫入：若該 DB 欄位是 select 就用 select，失敗才 fallback
// 為了安全，pose / environment / cat_count 全部改用 rich_text
function rt(value: string) {
  return { rich_text: [{ text: { content: value ?? '' } }] };
}

// ── Reverse Geocoding ─────────────────────────────────────
async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-TW`,
      { headers: { 'User-Agent': 'catwalk202605/1.0' }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return '台灣';
    const data = await res.json();
    const addr = data.address ?? {};
    const district = addr.city_district ?? addr.suburb ?? addr.quarter ?? '';
    const city     = addr.city ?? addr.county ?? addr.state ?? '';
    if (city && district) return `${city}${district}`;
    return city || '台灣';
  } catch { return '台灣'; }
}

// ── POST：送出回報 ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !REPORTS_DB) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      nickname, photoUrl, colorKey, poseKey, environmentKey, catCount,
      latitude, longitude, existingDexUnlocks, currentTotalXp, userPageId,
    } = body;

    if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

    const lat = typeof latitude  === 'number' ? latitude  : 25.0478;
    const lng = typeof longitude === 'number' ? longitude : 121.5170;

    // XP 計算
    const colorInfo   = CAT_COLORS[colorKey] ?? { rarity: 'common', xpBonus: 0 };
    const isNewDex    = !Array.isArray(existingDexUnlocks) ||
      !existingDexUnlocks.some((d: any) => d.colorKey === colorKey && d.poseKey === poseKey);
    const xpEarned    = 10 + (isNewDex ? 30 : 0) + colorInfo.xpBonus;
    const newTotalXp  = (currentTotalXp ?? 0) + xpEarned;
    const levelInfo   = getLevelFromXp(newTotalXp);

    // 地點名稱（parallel with report write）
    const [locationName] = await Promise.all([getLocationName(lat, lng)]);

    // Report ID
    const now     = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const reportId = `R-${dateStr}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    // ── 寫入 Notion Reports ──────────────────────────────
    // pose / environment / cat_count 用 rich_text 避開 select 選項不存在問題
    const reportProps: Record<string, any> = {
      report_id:     { title: [{ text: { content: reportId } }] },
      user_nickname: rt(nickname),
      latitude:      { number: lat },
      longitude:     { number: lng },
      color_key:     rt(colorKey ?? ''),
      pose:          rt(POSE_LABELS[poseKey]    ?? poseKey    ?? ''),
      environment:   rt(ENV_LABELS[environmentKey] ?? environmentKey ?? ''),
      cat_count:     rt(COUNT_LABELS[catCount]  ?? catCount   ?? ''),
      xp_earned:     { number: xpEarned },
    };

    // photo 只有在是合法 URL 時才加（否則 Notion 會報錯）
    if (typeof photoUrl === 'string' && photoUrl.startsWith('https://')) {
      reportProps.photo = { url: photoUrl };
    }

    const reportRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST', headers: H,
      body: JSON.stringify({ parent: { database_id: REPORTS_DB }, properties: reportProps }),
    });

    if (!reportRes.ok) {
      const errBody = await reportRes.json();
      console.error('[reports] Notion Reports write error:', JSON.stringify(errBody));
      return NextResponse.json(
        { error: 'Failed to save report', detail: errBody?.message ?? errBody },
        { status: 500 }
      );
    }

    // ── 新圖鑑解鎖 → DexUnlocks ──────────────────────────
    if (isNewDex && DEX_DB) {
      fetch('https://api.notion.com/v1/pages', {
        method: 'POST', headers: H,
        body: JSON.stringify({
          parent: { database_id: DEX_DB },
          properties: {
            unlock_id:     { title: [{ text: { content: `${nickname}-${colorKey}-${poseKey}` } }] },
            user_nickname: rt(nickname),
            color_key:     rt(colorKey),
            pose:          { select: { name: POSE_LABELS[poseKey] ?? poseKey } },
            unlocked_at:   { date: { start: now.toISOString() } },
          },
        }),
      }).catch(e => console.warn('[reports] DexUnlock warn:', e.message));
    }

    // ── 更新 Users XP ─────────────────────────────────────
    if (userPageId && USERS_DB) {
      fetch(`https://api.notion.com/v1/pages/${userPageId}`, {
        method: 'PATCH', headers: H,
        body: JSON.stringify({ properties: { total_xp: { number: newTotalXp } } }),
      }).catch(e => console.warn('[reports] XP update warn:', e.message));
    }

    return NextResponse.json({
      success: true, reportId, xpEarned,
      rarity: colorInfo.rarity, isNewDexUnlock: isNewDex,
      newTotalXp, newLevel: levelInfo.level, newTitle: levelInfo.title,
      locationName,
    });

  } catch (err: any) {
    console.error('[reports POST] Unexpected error:', err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}

// ── GET：讀取回報列表 ──────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!NOTION_API_KEY || !REPORTS_DB) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }
  const nickname = new URL(req.url).searchParams.get('nickname');
  if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${REPORTS_DB}/query`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        page_size: 100,
        filter: { property: 'user_nickname', rich_text: { equals: nickname } },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      }),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: 'Notion fetch failed' }, { status: 500 });

    const data = await res.json();
    const reports = data.results.map((page: any) => {
      const p = page.properties;
      return {
        reportId:       p['report_id']?.title?.[0]?.plain_text ?? '',
        photo:          p['photo']?.url ?? null,
        colorKey:       p['color_key']?.rich_text?.[0]?.plain_text ?? '',
        poseKey:        p['pose']?.rich_text?.[0]?.plain_text ?? p['pose']?.select?.name ?? '',
        environmentKey: p['environment']?.rich_text?.[0]?.plain_text ?? p['environment']?.select?.name ?? '',
        catCount:       p['cat_count']?.rich_text?.[0]?.plain_text ?? p['cat_count']?.select?.name ?? '',
        xpEarned:       p['xp_earned']?.number ?? 0,
        latitude:       p['latitude']?.number ?? null,
        longitude:      p['longitude']?.number ?? null,
        submittedAt:    page.created_time,
      };
    });
    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
