import { NextResponse } from 'next/server';

export async function GET() {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_CatData_ID = process.env.NOTION_CatData_ID;

  if (!NOTION_API_KEY || !NOTION_CatData_ID) {
    console.error('[catdata] Missing env vars');
    return NextResponse.json({ error: 'Notion not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_CatData_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
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
      return NextResponse.json({ error: 'Notion fetch failed' }, { status: 500 });
    }

    const data = await res.json();

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
      .filter((s: any) => s.latitude !== null && s.longitude !== null);

    return NextResponse.json({ spots });
  } catch (err: any) {
    console.error('[catdata] Error:', err?.message || err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
