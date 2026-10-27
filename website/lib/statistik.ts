// Website visitor statistics, counted by the site itself. No cookie, no IP
// address stored. A visitor is a hash of the IP, the browser and the day,
// so the same person counts once a day and cannot be followed across days.
import crypto from 'crypto';
import { baris, jalankan } from './db';
import { dbDiatur, rahasiaSesi } from './env';
import { daftarMalam, hariIni, tambahHari } from './tanggal';

const ROBOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch/i;

// Country from a header the host may add, otherwise from the browser
// language, which is only a guess. en without a region stays unknown.
const BAHASA_NEGARA: Record<string, string> = {
  id: 'ID', ms: 'MY', nl: 'NL', de: 'DE', fr: 'FR', it: 'IT', es: 'ES', ja: 'JP', zh: 'CN', ko: 'KR', ru: 'RU', pl: 'PL',
  pt: 'PT', sv: 'SE', da: 'DK', nb: 'NO', no: 'NO', fi: 'FI', cs: 'CZ', he: 'IL', tr: 'TR', th: 'TH', vi: 'VN', uk: 'UA', hu: 'HU',
};
export function negaraDari(h: Headers) {
  for (const k of ['cf-ipcountry', 'x-vercel-ip-country', 'x-country-code', 'x-geo-country']) {
    const v = (h.get(k) ?? '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v) && v !== 'XX' && v !== 'T1') return v;
  }
  const bahasa = (h.get('accept-language') ?? '').split(',')[0].trim();
  const [lang, wilayah] = bahasa.split(/[-_]/);
  if (wilayah && /^[a-z]{2}$/i.test(wilayah)) return wilayah.toUpperCase();
  return BAHASA_NEGARA[(lang ?? '').toLowerCase()] ?? '';
}

const batas = new Map<string, { n: number; sampai: number }>();
function bolehCatat(ip: string) {
  const kini = Date.now();
  const b = batas.get(ip);
  if (!b || b.sampai < kini) {
    batas.set(ip, { n: 1, sampai: kini + 60_000 });
    if (batas.size > 5000) batas.clear();
    return true;
  }
  b.n += 1;
  return b.n <= 60;
}

export async function catatKunjungan(o: { ip: string; ua: string; jalur: string; negara: string }) {
  if (!dbDiatur() || !o.ua || ROBOT.test(o.ua) || !bolehCatat(o.ip)) return false;
  const tanggal = hariIni();
  const pengunjung = crypto.createHash('sha256').update(`${rahasiaSesi()}|${tanggal}|${o.ip}|${o.ua}`).digest('hex').slice(0, 16);
  const jalur = (o.jalur.startsWith('/') ? o.jalur : '/').split(/[?#]/)[0].slice(0, 190);
  await jalankan('INSERT INTO kunjungan (tanggal, waktu, pengunjung, jalur, negara) VALUES (?, UTC_TIMESTAMP(), ?, ?, ?)', [tanggal, pengunjung, jalur, o.negara]);
  // keep a little over a year
  if (Math.random() < 0.01) await jalankan('DELETE FROM kunjungan WHERE tanggal < ?', [tambahHari(tanggal, -400)]);
  return true;
}

export type Statistik = {
  aktif: number;
  hari: { pengunjung: number; tampilan: number };
  tujuh: { pengunjung: number; tampilan: number };
  tigaPuluh: { pengunjung: number; tampilan: number };
  perHari: { tanggal: string; pengunjung: number; tampilan: number }[];
  pilih: { tanggal: string; pengunjung: number; tampilan: number; negara: { kode: string; n: number }[]; halaman: { jalur: string; n: number }[] };
  negara: { kode: string; n: number }[];
  totalNegara: number;
};

type Hitung = { pengunjung: number | null; tampilan: number | null };
const angka = (r?: Hitung) => ({ pengunjung: Number(r?.pengunjung ?? 0), tampilan: Number(r?.tampilan ?? 0) });

// Visitors per day count once per day, so a week counts day-visitors.
export async function statistikSitus(hari: string, rentang: 7 | 30, pilih: string): Promise<Statistik> {
  const awal = tambahHari(hari, -(rentang - 1));
  const awal7 = tambahHari(hari, -6);
  const awal30 = tambahHari(hari, -29);
  const [[aktif], [h], [t7], [t30], harian, [p], negaraPilih, halaman, negara] = await Promise.all([
    baris<{ n: number }>('SELECT COUNT(DISTINCT pengunjung) AS n FROM kunjungan WHERE waktu >= UTC_TIMESTAMP() - INTERVAL 5 MINUTE'),
    baris<Hitung>('SELECT COUNT(DISTINCT pengunjung) AS pengunjung, COUNT(*) AS tampilan FROM kunjungan WHERE tanggal = ?', [hari]),
    baris<Hitung>("SELECT COUNT(DISTINCT CONCAT(tanggal, pengunjung)) AS pengunjung, COUNT(*) AS tampilan FROM kunjungan WHERE tanggal >= ?", [awal7]),
    baris<Hitung>("SELECT COUNT(DISTINCT CONCAT(tanggal, pengunjung)) AS pengunjung, COUNT(*) AS tampilan FROM kunjungan WHERE tanggal >= ?", [awal30]),
    baris<{ tanggal: string; pengunjung: number; tampilan: number }>(
      'SELECT tanggal, COUNT(DISTINCT pengunjung) AS pengunjung, COUNT(*) AS tampilan FROM kunjungan WHERE tanggal >= ? GROUP BY tanggal', [awal]),
    baris<Hitung>('SELECT COUNT(DISTINCT pengunjung) AS pengunjung, COUNT(*) AS tampilan FROM kunjungan WHERE tanggal = ?', [pilih]),
    baris<{ kode: string; n: number }>(
      "SELECT negara AS kode, COUNT(DISTINCT pengunjung) AS n FROM kunjungan WHERE tanggal = ? GROUP BY negara ORDER BY n DESC LIMIT 5", [pilih]),
    baris<{ jalur: string; n: number }>(
      'SELECT jalur, COUNT(*) AS n FROM kunjungan WHERE tanggal = ? GROUP BY jalur ORDER BY n DESC LIMIT 4', [pilih]),
    baris<{ kode: string; n: number }>(
      "SELECT negara AS kode, COUNT(DISTINCT CONCAT(tanggal, pengunjung)) AS n FROM kunjungan WHERE tanggal >= ? GROUP BY negara ORDER BY n DESC", [awal30]),
  ]);
  const peta = new Map(harian.map((x) => [String(x.tanggal).slice(0, 10), x]));
  return {
    aktif: Number(aktif?.n ?? 0),
    hari: angka(h),
    tujuh: angka(t7),
    tigaPuluh: angka(t30),
    perHari: daftarMalam(awal, tambahHari(hari, 1)).map((d) => ({ tanggal: d, pengunjung: Number(peta.get(d)?.pengunjung ?? 0), tampilan: Number(peta.get(d)?.tampilan ?? 0) })),
    pilih: { tanggal: pilih, ...angka(p), negara: negaraPilih.map((x) => ({ kode: x.kode, n: Number(x.n) })), halaman: halaman.map((x) => ({ jalur: x.jalur, n: Number(x.n) })) },
    negara: negara.slice(0, 8).map((x) => ({ kode: x.kode, n: Number(x.n) })),
    totalNegara: negara.reduce((a, x) => a + Number(x.n), 0),
  };
}
