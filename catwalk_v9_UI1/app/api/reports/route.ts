import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  // ⚠️ 請確認你在 Vercel 設的是哪個變數名稱，以下兩個都嘗試讀取
  const DB_ID =
    process.env.NOTION_REPORTS_ID ??
    process.env.NOTION_Reports_ID ??
    process.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN || !DB_ID) {
    console.error('[reports POST] Missing env vars:', {
      hasToken: !!NOTION_TOKEN,
      hasDbId: !!DB_ID,
      NOTION_REPORTS_ID: !!process.env.NOTION_REPORTS_ID,
      NOTION_Reports_ID: !!process.env.NOTION_Reports_ID,
      NOTION_DATABASE_ID: !!process.env.NOTION_DATABASE_ID,
    });
    return NextResponse.json(
      {
        error: 'Notion not configured',
        hint: '請確認 Vercel 環境變數有設定 NOTION_REPORTS_ID 或 NOTION_DATABASE_ID，並重新 Deploy',
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { nickname, photo, latitude, longitude } = body;

    if (!nickname) {
      return NextResponse.json({ error: 'nickname required' }, { status: 400 });
    }

    const reportId = `RPT-${Date.now()}`;

    // 寫入 Notion Reports database
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          report_id: {
            title: [{ text: { content: reportId } }],
          },
          user_nickname: {
            rich_text: [{ text: { content: nickname ?? '' } }],
          },
          ...(photo
            ? {
                photo: { url: photo },
              }
            : {}),
          ...(latitude !== undefined && latitude !== null
            ? { latitude: { number: latitude } }
            : {}),
          ...(longitude !== undefined && longitude !== null
            ? { longitude: { number: longitude } }
            : {}),
        },
      }),
    });

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      console.error('[reports POST] Notion write error:', errText);
      return NextResponse.json({ error: 'Failed to save report', detail: errText }, { status: 500 });
    }

    const notionData = await notionRes.json();
    console.log('[reports POST] Saved:', notionData.id);
    return NextResponse.json({ success: true, id: notionData.id, report_id: reportId });
  } catch (err: any) {
    console.error('[reports POST] Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DB_ID =
    process.env.NOTION_REPORTS_ID ??
    process.env.NOTION_Reports_ID ??
    process.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN || !DB_ID) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  // GET 時需要 nickname（維持原本行為）
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get('nickname');
  if (!nickname) {
    return NextResponse.json({ error: 'nickname required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_size: 100,
          filter: {
            property: 'user_nickname',
            rich_text: { contains: nickname },
          },
        }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Notion fetch failed' }, { status: 500 });
    }

    const data = await res.json();
    const reports = data.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        report_id: props['report_id']?.title?.[0]?.plain_text ?? '',
        user_nickname: props['user_nickname']?.rich_text?.[0]?.plain_text ?? '',
        photo: props['photo']?.url ?? null,
        latitude: props['latitude']?.number ?? null,
        longitude: props['longitude']?.number ?? null,
      };
    });

    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
