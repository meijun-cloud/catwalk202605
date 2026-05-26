import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_REPORTS_ID = process.env.NOTION_REPORTS_ID;

  if (!NOTION_API_KEY || !NOTION_REPORTS_ID) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { nickname, photo, latitude, longitude } = body;

    if (!nickname) {
      return NextResponse.json({ error: 'nickname required' }, { status: 400 });
    }

    const reportId = `RPT-${Date.now()}`;

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_REPORTS_ID },
        properties: {
          report_id: {
            title: [{ text: { content: reportId } }],
          },
          user_nickname: {
            rich_text: [{ text: { content: nickname ?? '' } }],
          },
          ...(photo ? { photo: { url: photo } } : {}),
          ...(latitude != null ? { latitude: { number: latitude } } : {}),
          ...(longitude != null ? { longitude: { number: longitude } } : {}),
        },
      }),
    });

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      console.error('[reports POST] Notion error:', errText);
      return NextResponse.json({ error: 'Failed to save report', detail: errText }, { status: 500 });
    }

    const notionData = await notionRes.json();
    return NextResponse.json({ success: true, id: notionData.id, report_id: reportId });
  } catch (err: any) {
    console.error('[reports POST] Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_REPORTS_ID = process.env.NOTION_REPORTS_ID;

  if (!NOTION_API_KEY || !NOTION_REPORTS_ID) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get('nickname');
  if (!nickname) {
    return NextResponse.json({ error: 'nickname required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_REPORTS_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
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
