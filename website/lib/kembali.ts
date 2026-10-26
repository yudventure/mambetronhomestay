// Redirect back to the page on this site the visitor came from, used after
// switching language or currency.
import { NextResponse, type NextRequest } from 'next/server';

export function kembaliKeAsal(req: NextRequest) {
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
  return new NextResponse(null, { status: 303, headers: { Location: tujuan } });
}
