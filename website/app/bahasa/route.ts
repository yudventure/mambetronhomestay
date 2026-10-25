// Language switch. Sets the cookie and returns to the page the visitor came from.
import { NextResponse, type NextRequest } from 'next/server';
import { KUKI_BAHASA } from '@/lib/bahasa';

export function GET(req: NextRequest) {
  const ke = req.nextUrl.searchParams.get('ke') === 'en' ? 'en' : 'id';
  let tujuan = '/';
  const asal = req.headers.get('referer');
  if (asal) {
    try {
      const u = new URL(asal);
      const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
      if (u.host === host) tujuan = `${u.pathname}${u.search}${u.hash}`;
    } catch {
      tujuan = '/';
    }
  }
  const res = new NextResponse(null, { status: 303, headers: { Location: tujuan } });
  res.cookies.set(KUKI_BAHASA, ke, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  return res;
}
