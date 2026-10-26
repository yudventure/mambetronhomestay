// Language switch. Sets the cookie and returns to the page the visitor came from.
import type { NextRequest } from 'next/server';
import { KUKI_BAHASA } from '@/lib/bahasa';
import { kembaliKeAsal } from '@/lib/kembali';

export function GET(req: NextRequest) {
  const ke = req.nextUrl.searchParams.get('ke') === 'en' ? 'en' : 'id';
  const res = kembaliKeAsal(req);
  res.cookies.set(KUKI_BAHASA, ke, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  return res;
}
