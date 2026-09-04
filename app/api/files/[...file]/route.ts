import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR, contentTypeFor } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { file: string[] } }) {
  // Apenas um segmento (nome do ficheiro) — nunca caminhos aninhados.
  if (!params.file || params.file.length !== 1) {
    return new Response('Não encontrado', { status: 404 });
  }
  const name = path.basename(String(params.file[0]));
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || !name.includes('.')) {
    return new Response('Não encontrado', { status: 404 });
  }
  const full = path.join(UPLOADS_DIR, name);
  if (!full.startsWith(UPLOADS_DIR) || !fs.existsSync(full)) {
    return new Response('Não encontrado', { status: 404 });
  }
  const data = fs.readFileSync(full);
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': contentTypeFor(name),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
