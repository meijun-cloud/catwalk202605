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

// ── 常數 ────────────────────────────────────────────────
const CAT_COLORS: Record<string, { rarity: string; xpBonus: number }> = {
  black_white:   { rarity: 'common',   xpBonus: 0  },
  orange:        { rarity: 'common',   xpBonus: 0  },
  white:         { rarity: 'common',   xpBonus: 0  },
  gray:          { rarity: 'uncommon', xpBonus: 20 },
  black:         { rarity: 'common',   xpBonus: 0  },
  calico:        { rarity: 'common',   xpBonus: 0  },
  tortoiseshell: { rarity: 'uncommon', xpBonus: 20 },
  tabby:         { rarity: 'common',   xpBonus: 0  },
  siamese:       { rarity: 'rare',     xpBonus: 50 },
  white_tabby:   { rarity: 'uncommon', xpBonus: 20 },
  orange_white:  { rarity: 'uncommon', xpBonus: 20 },
  brown_white:   { rarity: 'rare',     xpBonus: 50 },
};

const LEVELS = [
  { level: 1,  title: '巷口新貓友', requiredTotalXp: 0    },
  { level: 2,  title: '騎樓觀察員', requiredTotalXp: 30   },
  { level: 3,  title: '街頭巡禮人', requiredTotalXp: 90   },
  { level: 4,  title: '市場識途者', requiredTotalXp: 180  },
  { level: 5,  title: '巷貓鄰里長', requiredTotalXp: 300  },
  { level: 6,  title: '巷弄追風者', requiredTotalXp: 450  },
  { level: 7,  title: '矮牆望遠師', requiredTotalXp: 600  },
  { level: 8,  title: '夜路尋蹤師', requiredTotalXp: 780  },
  { level: 9,  title: '城市貓師',   requiredTotalXp: 975  },
  { level: 10, title: '貓部宗師',   requiredTotalXp: 1170 },
];

// pose 用中文 select（與 Notion 一致）
const POSE_LABELS: Record<string, string> = {
  basking:        '曬太陽',
  curled_sleep:   '蜷縮睡覺',
  walking:        '走動中',
  grooming:       '理毛',
  alert_standing: '警覺站立',
  sitting:        '坐著發呆',
  eating:         '吃飯',
};

// environment 用中文 select
const ENV_LABELS: Record<string, string> = {
  alley:   '巷弄',   parking: '停車場', park:   '公園',
  mountain:'山區',   temple:  '廟',     arcade: '騎樓下',
  market:  '傳統市場', wall: '矮牆／圍牆上', shop: '店面', station: '車站',
};

// cat_count 用中文 select
const COUNT_LABELS: Record<string, string> = {
  one: '1 隻', two_three: '2–3 隻', four_plus: '4 隻以上',
};

function getLevelFromXp(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.requiredTotalXp) ?? LEVELS[0];
}

function rt(value: string) {
  return { rich_text: [{ text: { content: value ?? '' } }] };
}

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
    const city = addr.city ?? addr.county ?? addr.state ?? '';
    if (city && district) return `${city}${district}`;
    return city || '台灣';
  } catch { return '台灣'; }
}

// ── POST ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !REPORTS_DB) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      nickname, photoUrl, colorKey, poseKey, poseNote, environmentKey, environmentNote, catCount,
      latitude, longitude, existingDexUnlocks, currentTotalXp, userPageId,
    } = body;

    if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 });

    const lat = typeof latitude  === 'number' ? latitude  : 25.0478;
    const lng = typeof longitude === 'number' ? longitude : 121.5170;

    // XP
    const colorInfo  = CAT_COLORS[colorKey] ?? { rarity: 'common', xpBonus: 0 };
    const isNewDex   = !Array.isArray(existingDexUnlocks) ||
      !existingDexUnlocks.some((d: any) => d.colorKey === colorKey && d.poseKey === poseKey);
    const xpEarned   = 10 + (isNewDex ? 30 : 0) + colorInfo.xpBonus;
    const newTotalXp = (currentTotalXp ?? 0) + xpEarned;
    const levelInfo  = getLevelFromXp(newTotalXp);

    const locationName = await getLocationName(lat, lng);

    const now    = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const reportId = `R-${dateStr}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    // ── 欄位對應（完全符合你的 Notion database schema）──────
    // submitted_at = Created time → 自動產生，不寫
    // color_key    = rich_text（≡）
    // pose         = select（⊙）→ 中文值
    // cat_count    = select（⊙）→ 中文值
    // environment  = select（⊙）→ 中文值（若欄位存在）
    // weather      = select → 不寫（optional）
    // temperature  = number → 不寫（optional）

    const poseName  = POSE_LABELS[poseKey]        ?? poseKey        ?? '';
    const countName = COUNT_LABELS[catCount]      ?? catCount       ?? '';

    const reportProps: Record<string, any> = {
      report_id:     { title: [{ text: { content: reportId } }] },
      user_nickname: rt(nickname),
      latitude:      { number: lat },
      longitude:     { number: lng },
      color_key:     rt(colorKey ?? ''),
      xp_earned:     { number: xpEarned },
    };

    // photo：只有合法 https URL 才加，否則 Notion 會報錯
    if (typeof photoUrl === 'string' && photoUrl.startsWith('https://')) {
      reportProps.photo = { url: photoUrl };
    }

    // pose / cat_count / environment → select 類型
    // Notion API 會自動建立新 select 選項，不需預先設定
    if (poseName)  reportProps.pose      = { select: { name: poseName  } };
    if (countName) reportProps.cat_count = { select: { name: countName } };

    // environment：存在於此 DB，中文值；若 other 則寫入「其他」
    const envName = environmentKey === 'other' ? '其他' : (ENV_LABELS[environmentKey] ?? environmentKey ?? '');
    if (envName) reportProps.environment = { multi_select: [{ name: envName }] };

    // pose_note：使用者自填（poseKey === 'other' 時才有值）
    if (poseKey === 'other' && poseNote) {
      reportProps.pose_note = { rich_text: [{ text: { content: String(poseNote) } }] };
    }

    // environment_note：使用者自填（environmentKey === 'other' 時才有值）
    if (environmentKey === 'other' && environmentNote) {
      reportProps.environment_note = { rich_text: [{ text: { content: String(environmentNote) } }] };
    }

    // Location：GPS 逆地理編碼取得的地區名稱
    if (locationName) {
      reportProps['Location'] = { rich_text: [{ text: { content: locationName } }] };
    }

    const reportRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST', headers: H,
      body: JSON.stringify({ parent: { database_id: REPORTS_DB }, properties: reportProps }),
    });

    if (!reportRes.ok) {
      const errBody = await reportRes.json().catch(() => ({}));
      console.error('[reports] Notion Reports write error:', JSON.stringify(errBody));
      return NextResponse.json(
        { error: 'Failed to save report', detail: errBody?.message ?? JSON.stringify(errBody) },
        { status: 500 }
      );
    }

    // DexUnlocks（pose 欄位同樣用 select）
    if (isNewDex && DEX_DB) {
      fetch('https://api.notion.com/v1/pages', {
        method: 'POST', headers: H,
        body: JSON.stringify({
          parent: { database_id: DEX_DB },
          properties: {
            unlock_id:     { title: [{ text: { content: `${nickname}-${colorKey}-${poseKey}` } }] },
            user_nickname: rt(nickname),
            color_key:     rt(colorKey ?? ''),
            pose:          { select: { name: poseName } },
            unlocked_at:   { date: { start: now.toISOString() } },
          },
        }),
      }).catch(e => console.warn('[reports] DexUnlock warn:', e.message));
    }

    // Users XP
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

// ── GET ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!NOTION_API_KEY || !REPORTS_DB) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  const nickname = url.searchParams.get('nickname');

  // 取得所有 nickname（以 email 查 Users，取所有歷史筆數）
  let nicknames: string[] = [];
  if (email) {
    try {
      const usersRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_USERS_DB_ID}/query`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ filter: { property: 'email', email: { equals: email } } }),
      });
      const usersData = await usersRes.json();
      nicknames = (usersData.results ?? [])
        .map((p: any) => p.properties.nickname.title[0]?.plain_text)
        .filter(Boolean);
    } catch { /* fallback 到 nickname */ }
  }
  if (nicknames.length === 0 && nickname) nicknames = [nickname];
  if (nicknames.length === 0) return NextResponse.json({ error: 'email or nickname required' }, { status: 400 });

  // OR filter（涵蓋所有 nickname）
  const filter = nicknames.length === 1
    ? { property: 'user_nickname', rich_text: { equals: nicknames[0] } }
    : { or: nicknames.map(n => ({ property: 'user_nickname', rich_text: { equals: n } })) };

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${REPORTS_DB}/query`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        page_size: 100,
        filter,
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
        poseKey:        p['pose']?.select?.name ?? '',
        poseNote:       p['pose_note']?.rich_text?.[0]?.plain_text ?? undefined,
        environmentKey: p['environment']?.multi_select?.[0]?.name ?? '',
        environmentNote:p['environment_note']?.rich_text?.[0]?.plain_text ?? undefined,
        catCount:       p['cat_count']?.select?.name ?? '',
        locationName:   p['Location']?.rich_text?.[0]?.plain_text ?? '',
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
