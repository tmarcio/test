import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { requireAdmin } from '@/lib/api-guard';
import { ALLOWED_TYPES, MAX_UPLOAD_SIZE, UPLOADS_DIR } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Envia um ficheiro de imagem.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'Formato não suportado. Usa PNG, JPG, WEBP, GIF ou SVG.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'A imagem não pode exceder 5 MB.' }, { status: 400 });
    }
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ALLOWED_TYPES[file.type]}`;
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    return NextResponse.json({ url: `/api/files/${filename}` }, { status: 201 });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Falha ao fazer upload.' }, { status: 500 });
  }
}
