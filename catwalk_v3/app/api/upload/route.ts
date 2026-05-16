import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  try {
    // 確認環境變數存在
    const endpoint = process.env.R2_ENDPOINT;
    const bucket = process.env.R2_BUCKET;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicBase = process.env.R2_PUBLIC_BASE_URL;

    if (!endpoint || !bucket || !accessKey || !secretKey || !publicBase) {
      console.error('Missing R2 env vars:', { endpoint: !!endpoint, bucket: !!bucket, accessKey: !!accessKey, secretKey: !!secretKey, publicBase: !!publicBase });
      return NextResponse.json({ error: 'R2 not configured' }, { status: 500 });
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name?.split('.').pop()) || 'jpg';
    const filename = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    console.log(`Uploading to R2: ${bucket}/${filename}, size: ${buffer.length}`);

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    }));

    const publicUrl = `${publicBase}/${filename}`;
    console.log('Upload success:', publicUrl);
    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
