import { NextRequest, NextResponse } from 'next/server';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_REPORTS_ID = process.env.NOTION_REPORTS_ID; // Reports database ID

export async function POST(req: NextRequest) {
  try {
    if (!NOTION_TOKEN || !NOTION_REPORTS_ID) {
      console.error('Missing NOTION_TOKEN or NOTION_REPORTS_ID');
      return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { nickname, photo, latitude, longitude } = body;

    if (!nickname) {
      return NextResponse.json({ error: 'nickname required' }, { status: 400 });
    }

    // 寫入 Notion Reports database
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_REPORTS_ID },
        properties: {
          report_id: {
            title: [
              {
                text: {
                  content: `RPT-${Date.now()}`,
                },
              },
            ],
          },
          user_nickname: {
            rich_text: [
              {
                text: {
                  content: nickname,
                },
              },
            ],
          },
          photo: {
            url: photo ?? null,
          },
          latitude: {
            number: latitude ?? null,
          },
          longitude: {
            number: longitude ?? null,
          },
        },
      }),
    });

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      console.error('Notion write error:', errText);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    const notionData = await notionRes.json();
    console.log('Report saved to Notion:', notionData.id);
    return NextResponse.json({ success: true, id: notionData.id });
  } catch (err: any) {
    console.error('Reports error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

// GET: 讀取所有 reports（可選）
export async function GET() {
  if (!NOTION_TOKEN || !NOTION_REPORTS_ID) {
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_REPORTS_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100 }),
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
