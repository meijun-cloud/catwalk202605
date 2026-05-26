import { NextResponse } from 'next/server';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_CatData_ID = process.env.NOTION_CatData_ID;

export async function GET() {
  if (!NOTION_TOKEN || !NOTION_CatData_ID) {
    console.error('Missing NOTION_TOKEN or NOTION_CatData_ID');
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_CatData_ID}/query`,
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
      console.error('Notion error:', errText);
      return NextResponse.json({ error: 'Notion fetch failed' }, { status: 500 });
    }

    const data = await res.json();

    // 讀取6個欄位: 名稱, district, latitude, longitude, color_key, environment
    const spots = data.results
      .map((page: any) => {
        const props = page.properties;
        return {
          id: page.id,
          name: props['名稱']?.title?.[0]?.plain_text ?? '',
          district: props['district']?.select?.name ?? '',
          latitude: props['latitude']?.number ?? null,
          longitude: props['longitude']?.number ?? null,
          color_key: props['color_key']?.select?.name ?? '',
          environment: props['environment']?.select?.name ?? '',
        };
      })
      // 過濾掉沒有座標的資料
      .filter((s: any) => s.latitude !== null && s.longitude !== null);

    return NextResponse.json({ spots });
  } catch (err: any) {
    console.error('CatData fetch error:', err?.message || err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
