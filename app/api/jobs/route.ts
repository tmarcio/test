import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendMail, jobEmailHtml, jobEmailText } from '@/lib/mailer';
import { BRAND, type JobApplication } from '@/lib/types';
import { sanitizeText } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<JobApplication>;
    const name = sanitizeText(body.name || '');
    const phone = sanitizeText(body.phone || '');
    const position = sanitizeText(body.position || '');
    if (!name || !phone || !position) {
      return NextResponse.json(
        { error: 'Preenche o nome, o telefone e a função pretendida.' },
        { status: 400 },
      );
    }
    const job: JobApplication = {
      id: 0,
      name,
      phone,
      email: sanitizeText(body.email || ''),
      position,
      message: sanitizeText(body.message || ''),
      status: 'nova',
      createdAt: new Date().toISOString(),
    };
    const result = getDb()
      .prepare('INSERT INTO jobs (name, phone, email, position, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(job.name, job.phone, job.email, job.position, job.message, job.status, job.createdAt);
    job.id = Number(result.lastInsertRowid);
    await sendMail({
      to: BRAND.email,
      subject: `Candidatura — ${job.position} | ${job.name}`,
      html: jobEmailHtml(job),
      text: jobEmailText(job),
    });
    return NextResponse.json({ ok: true, id: job.id }, { status: 201 });
  } catch (err) {
    console.error('[jobs]', err);
    return NextResponse.json({ error: 'Erro ao registar a candidatura.' }, { status: 500 });
  }
}
