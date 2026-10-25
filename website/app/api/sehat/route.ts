// Health check for after a deploy. Says whether the database and e-mail are
// configured without revealing any values.
import { cekDb } from '@/lib/db';
import { surelDiatur } from '@/lib/env';
import { sandiDiatur } from '@/lib/sesi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await cekDb();
  return Response.json({
    situs: 'ok',
    database: db.ok ? 'terhubung' : 'belum',
    pesanDatabase: db.ok ? undefined : db.pesan.replace(/\b(user|password|host)\b.*$/i, '').trim(),
    panelPengelola: sandiDiatur() ? 'siap' : 'ADMIN_PASSWORD belum diisi',
    surel: surelDiatur() ? 'siap' : 'tidak dipakai',
    waktu: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
