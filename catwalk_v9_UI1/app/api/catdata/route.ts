import { NextResponse } from 'next/server';

export async function GET() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = process.env.NOTION_CatData_ID;

  if (!NOTION_TOKEN || !DB_ID) {
    console.error('[catdata] Missing env vars:', {
      hasToken: !!NOTION_TOKEN,
      hasDbId: !!DB_ID,
    });
    return NextResponse.json(
      { error: 'Notion not configured', hasToken: !!NOTION_TOKEN, hasDbId: !!DB_ID },
      { status: 500 }
    );
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
        body: JSON.stringify({ page_size: 100 }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[catdata] Notion error:', errText);
      return NextResponse.json({ error: 'Notion fetch failed', detail: errText }, { status: 500 });
    }

    const data = await res.json();

    const spots = data.results
      .map((page: any) => {
        const props = page.properties;
        return {
          id: page.id,
          // 名稱欄位（title 類型）
          name: props['名稱']?.title?.[0]?.plain_text ?? '',
          // district 欄位（select 類型）
          district: props['district']?.select?.name ?? '',
          // latitude / longitude（number 類型）
          latitude: props['latitude']?.number ?? null,
          longitude: props['longitude']?.number ?? null,
          // color_key（select 類型）
          color_key: props['color_key']?.select?.name ?? '',
          // environment（select 類型）
          environment: props['environment']?.select?.name ?? '',
        };
      })
      .filter((s: any) => s.latitude !== null && s.longitude !== null);

    return NextResponse.json({ spots });
  } catch (err: any) {
    console.error('[catdata] Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
