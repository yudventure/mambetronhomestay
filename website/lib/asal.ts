// The public address of the site for links in e-mails and payment returns:
// SITE_URL when set, otherwise the host the request came in on.
import { alamatSitus } from './env';

export function asalPermintaan(req: Request) {
  const tetap = alamatSitus();
  if (tetap) return tetap;
  const h = req.headers;
  const proto = (h.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '')).split(',')[0].trim();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? new URL(req.url).host).split(',')[0].trim();
  return `${proto}://${host}`;
}
