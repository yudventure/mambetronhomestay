// Photos are stored in MySQL so they survive redeploys on Hostinger. A photo
// never changes after upload, so browsers may keep it for a year.
import { satu } from '@/lib/db';
import { dbDiatur } from '@/lib/env';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!dbDiatur() || !Number.isInteger(id) || id < 1) return new Response('Tidak ditemukan', { status: 404 });
  try {
    const f = await satu<{ mime: string; data: Buffer }>('SELECT mime, data FROM foto WHERE id = ?', [id]);
    if (!f) return new Response('Tidak ditemukan', { status: 404 });
    return new Response(new Uint8Array(f.data), {
      headers: {
        'Content-Type': f.mime,
        'Content-Length': String(f.data.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    console.error('[mambetron] foto gagal dibaca', e);
    return new Response('Gangguan server', { status: 503 });
  }
}
