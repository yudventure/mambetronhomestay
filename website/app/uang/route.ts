// Currency switch for the price estimates. Sets the cookie and returns to the page the visitor came from.
import type { NextRequest } from 'next/server';
import { kembaliKeAsal } from '@/lib/kembali';
import { sahUang } from '@/lib/uang';
import { KUKI_UANG } from '@/lib/uang-server';

export function GET(req: NextRequest) {
  const ke = req.nextUrl.searchParams.get('ke');
  const res = kembaliKeAsal(req);
  if (sahUang(ke)) res.cookies.set(KUKI_UANG, ke, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  return res;
}
