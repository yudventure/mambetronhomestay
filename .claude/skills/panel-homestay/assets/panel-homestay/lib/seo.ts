// Google Search Console and search results, the owner's request, November
// 2026: "okee sekarang siapkan googlesearch consolenya".
//
// - The verification code from Isi situs, Identitas, as the meta tag
//   Search Console asks for (HTML tag method). It is on every page,
//   also the closed page of developer mode, so the site can be verified
//   before it opens.
// - The lodging as structured data (schema.org LodgingBusiness) on the home
//   page, from the panel's fields, so Google reads the name, place, phone,
//   check-in times, price range and facilities.
// sitemap.xml and robots.txt are app/sitemap.ts and app/robots.ts.
import { hargaIsiPondok, hargaSendiri } from './harga';
import { dwi } from './format';
import type { Bahasa, Foto, Kamar, Situs } from './jenis';

// The content of the tag, from the whole <meta …> pasted from Search Console
// or the code alone. Anything else gives nothing.
export function kodeVerifikasiGoogle(v: string | undefined | null): string {
  const s = String(v ?? '').trim();
  const isi = s.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? s;
  const kode = isi.replace(/^google-site-verification\s*[:=]\s*/i, '').trim();
  return /^[A-Za-z0-9_-]{10,100}$/.test(kode) ? kode : '';
}

const mutlak = (dasar: string, url: string) => (/^https?:\/\//i.test(url) ? url : dasar ? `${dasar}${url.startsWith('/') ? '' : '/'}${url}` : '');

// "Rp 850.000–1.800.000" per bungalow per night, or per person.
function rentangHarga(kamar: Kamar[]) {
  const harga: number[] = [];
  for (const k of kamar) {
    if (!(k.harga > 0)) continue;
    if (k.skema_harga === 'kamar') harga.push(hargaSendiri(k), hargaIsiPondok(k, Math.max(1, k.kapasitas)));
    else harga.push(k.harga);
  }
  if (!harga.length) return '';
  const f = (n: number) => new Intl.NumberFormat('id-ID').format(n);
  const min = Math.min(...harga), maks = Math.max(...harga);
  return min === maks ? `Rp ${f(min)}` : `Rp ${f(min)}–${f(maks)}`;
}

export function dataPenginapan(o: { situs: Situs; b: Bahasa; dasar: string; kamar: Kamar[]; foto: Foto[]; fasilitas: string[]; titik: { lat: number; lng: number } | null }) {
  const { situs: s, b, dasar, kamar } = o;
  const media = [
    s.instagram ? `https://www.instagram.com/${s.instagram.replace(/^@/, '')}` : '',
    // the field's untouched default opens Facebook's front page, not the homestay
    s.facebook && !/^https?:\/\/(www\.)?facebook\.com\/?$/i.test(s.facebook) ? s.facebook : '',
    s.tiktok, s.youtube,
  ].filter((x, i, semua) => /^https?:\/\//i.test(x) && semua.indexOf(x) === i);
  const gambar = [...o.foto.map((f) => mutlak(dasar, f.url)), mutlak(dasar, '/merek/og.png')].filter(Boolean).slice(0, 6);
  const alamat = dwi(s.alamat, b).trim();
  const harga = rentangHarga(kamar);
  const unit = kamar.reduce((n, k) => n + (k.jumlah_unit || 0), 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: s.nama,
    ...(dwi(s.seoDeskripsi, b) ? { description: dwi(s.seoDeskripsi, b) } : {}),
    ...(dasar ? { url: `${dasar}/` } : {}),
    ...(gambar.length ? { image: gambar } : {}),
    ...(s.whatsapp ? { telephone: `+${s.whatsapp.replace(/[^\d]/g, '')}` } : {}),
    ...(s.email ? { email: s.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(alamat ? { streetAddress: alamat } : {}),
      addressLocality: dwi(s.lokasi, b),
      addressCountry: 'ID',
    },
    ...(o.titik ? { geo: { '@type': 'GeoCoordinates', latitude: o.titik.lat, longitude: o.titik.lng } } : {}),
    ...(s.petaTautan ? { hasMap: s.petaTautan } : {}),
    ...(s.checkIn ? { checkinTime: s.checkIn } : {}),
    ...(s.checkOut ? { checkoutTime: s.checkOut } : {}),
    ...(harga ? { priceRange: harga, currenciesAccepted: 'IDR' } : {}),
    ...(unit ? { numberOfRooms: unit } : {}),
    ...(o.fasilitas.length ? { amenityFeature: o.fasilitas.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })) } : {}),
    ...(media.length ? { sameAs: media } : {}),
  };
}

// JSON inside <script>, with "<" escaped so text from the panel cannot close the tag.
export const jsonSkrip = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');
