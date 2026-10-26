// Currency switch. Sets the cookie and returns to the page the visitor came from.
import type { NextRequest } from 'next/server';
import { kembaliKeAsal } from '@/lib/kembali';
import { KUKI_UANG, sahUang } from '@/lib/uang';

export function GET(req: NextRequest) {
  const ke = req.nextUrl.searchParams.get('ke')?.toUpperCase();
  const res = kembaliKeAsal(req);
  res.cookies.set(KUKI_UANG, sahUang(ke) ? ke : 'IDR', { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  return res;
}
