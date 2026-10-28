// Video links ready for the page. TikTok share links (vm.tiktok.com) are
// followed to the full address, and TikTok covers come from its public
// oEmbed reply. Both are kept for six hours. YouTube covers need no request,
// Instagram offers none without a key, so the page uses a site photo there.
import { bacaVideo, type Video } from './video';

const UMUR = 6 * 3600e3;
const simpanan = new Map<string, { v: Video | null; waktu: number }>();
const ambil = (url: string, init: RequestInit = {}) => fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(3000) });

async function satu(tautan: string): Promise<Video | null> {
  const lama = simpanan.get(tautan);
  if (lama && Date.now() - lama.waktu < UMUR) return lama.v;
  let v = bacaVideo(tautan);
  if (!v && /^https?:\/\/((vm|vt)\.tiktok\.com\/|(www\.)?tiktok\.com\/t\/)/i.test(tautan)) {
    try {
      const r = await ambil(tautan, { redirect: 'manual' });
      const ke = r.headers.get('location');
      if (ke) v = bacaVideo(new URL(ke, tautan).toString());
    } catch {
      // the link stays unknown and is left out
    }
  }
  if (v?.jenis === 'tiktok') {
    try {
      const r = await ambil(`https://www.tiktok.com/oembed?url=${encodeURIComponent(v.url)}`);
      const j = r.ok ? await r.json() : null;
      if (typeof j?.thumbnail_url === 'string' && j.thumbnail_url.startsWith('https://')) v = { ...v, sampul: j.thumbnail_url };
    } catch {
      // no cover, the site photo stands in
    }
  }
  if (simpanan.size > 200) simpanan.clear();
  simpanan.set(tautan, { v, waktu: Date.now() });
  return v;
}

export async function siapkanVideo(daftar: { url: string; judul: string }[]): Promise<Video[]> {
  const hasil = await Promise.all(daftar.filter((x) => x.url.trim()).map(async (x) => {
    const v = await satu(x.url.trim());
    return v ? { ...v, judul: x.judul.trim() } : null;
  }));
  return hasil.filter((v): v is Video => v !== null);
}
