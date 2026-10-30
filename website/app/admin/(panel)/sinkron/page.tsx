import { headers } from 'next/headers';
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolSalin from '@/components/admin/TombolSalin';
import TombolYakin from '@/components/admin/TombolYakin';
import { gantiTautanSambungan, hapusSambungan, hapusSambunganLama, putusDampier, sambungDampier, sinkronkanSekarang, tambahSambungan, ubahSambungan } from '@/app/admin/aksi';
import { apiDariTautan, statusDampier, tautanSatuKamarDampier, type StatusDampier } from '@/lib/dampier';
import { daftarKamar } from '@/lib/data';
import type { Kamar } from '@/lib/jenis';
import { alamatSitus } from '@/lib/env';
import { rentangTanggal, waktu } from '@/lib/format';
import { rentang2 } from '@/lib/kisi';
import { cariBentrok, daftarSambungan, pastikanSegar, type Sambungan } from '@/lib/sinkron';
import { hariIni, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Channel manager' };

const SARAN = ['Booking.com', 'Airbnb', 'Agoda', 'Expedia', 'Traveloka', 'Tiket.com', 'Google Calendar', 'Agen perjalanan'];

async function asalSitus() {
  const env = alamatSitus();
  if (env) return env;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function Status({ s }: { s: Sambungan }) {
  const [kelas, teks] = !s.url
    ? ['bg-panel-lembut text-panel-utama', 'Hanya mengirim']
    : s.galat
      ? ['bg-[#fde3dc] text-merah', 'Gagal dibaca']
      : s.berhasil
        ? ['bg-[#dff5e6] text-[#1f7a3d]', 'Tersambung']
        : ['bg-pasir text-laut', 'Belum dibaca'];
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${kelas}`}>{teks}</span>;
}

function Sambung({ s, asal, baru }: { s: Sambungan; asal: string; baru: boolean }) {
  const ekspor = `${asal}/ical/${s.token}.ics`;
  return (
    <li id={`sambungan-${s.id}`} className={`scroll-mt-28 rounded-2xl p-4 sm:p-5 ${baru ? 'bg-panel-lembut ring-2 ring-panel-aksen/40' : 'bg-panel-latar'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-panel-utama">{s.nama}</p>
        <Status s={s} />
      </div>
      {s.url && (
        <p className="mt-1 text-sm text-abu">
          {s.berhasil ? `${s.jumlah} pemesanan atau blokir terbaca, terakhir ${waktu(s.berhasil)}.` : 'Kalender dari situs itu belum pernah terbaca.'}
        </p>
      )}
      {s.galat && <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-merah">{s.galat}</p>}

      <p className="mt-4 text-sm font-semibold text-panel-utama">Tautan untuk ditempel di {s.nama}</p>
      <p className="mb-2 text-xs text-abu">Situs itu membaca malam yang sudah terisi di unit ini dari tautan ini.</p>
      <TombolSalin teks={ekspor} label={`Tautan kalender untuk ${s.nama}`} />

      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-white">
          Ubah sambungan <Ikon nama="bawah" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <form action={ubahSambungan} className="mt-3 grid gap-3">
          <input type="hidden" name="id" value={s.id} />
          <label className="block">
            <span className="label-isian">Nama situs</span>
            <input name="nama" defaultValue={s.nama} required maxLength={80} list="saran-situs" className="isian" />
          </label>
          <label className="block">
            <span className="label-isian">Tautan dari {s.nama}</span>
            <input name="url" defaultValue={s.url} inputMode="url" placeholder="https://..." className="isian" />
            <span className="bantuan block">Kosongkan bila situs itu hanya membaca kalender kita.</span>
          </label>
          <button className="tombol tombol-kecil justify-self-start">Simpan</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={gantiTautanSambungan}>
            <input type="hidden" name="id" value={s.id} />
            <TombolYakin tanya={`Buat tautan baru? Tautan lama berhenti bekerja dan tautan baru harus ditempel ulang di ${s.nama}.`} className="tombol tombol-putih tombol-kecil">
              Buat tautan baru
            </TombolYakin>
          </form>
          <form action={hapusSambungan}>
            <input type="hidden" name="id" value={s.id} />
            <TombolYakin tanya={`Hapus sambungan ${s.nama}? Malam yang terbaca dari situs itu tidak lagi ditutup di sini.`}>
              <Ikon nama="sampah" className="size-4" /> Hapus
            </TombolYakin>
          </form>
        </div>
      </details>
    </li>
  );
}

// Times kept as ISO strings, shown like the other sync times.
const jamIso = (iso: string) => waktu(iso.slice(0, 19).replace('T', ' '));

function FormDampier({ kamar, tombol, d }: { kamar: Kamar[]; tombol: string; d: StatusDampier | null }) {
  const pilihan = kamar.filter((k) => k.aktif || k.id === d?.kamarId);
  return (
    <form action={sambungDampier} className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label className="block">
        <span className="label-isian">Alamat API dari DAMPIER</span>
        <input name="api" required inputMode="url" autoComplete="off" spellCheck={false} placeholder="https://thedampier.com/api/kamar/..." className="isian font-mono text-sm" />
      </label>
      {pilihan.length > 1 && (
        <label className="block sm:col-span-2 sm:row-start-2">
          <span className="label-isian">Bungalow yang dijual di DAMPIER</span>
          <select name="kamar_id" defaultValue={d?.kamarId} className="isian">
            {pilihan.map((k) => <option key={k.id} value={k.id}>{k.nama}, {k.jumlah_unit} unit</option>)}
          </select>
        </label>
      )}
      <button className="tombol tombol-kecil justify-self-start"><Ikon nama="sinkron" className="size-4" /> {tombol}</button>
      <p className="bantuan sm:col-span-2">Alamat ini memuat kunci kalender Mambetron di DAMPIER. Simpan hanya di sini dan jangan dibagikan. Panel hanya menampilkan ujungnya.</p>
    </form>
  );
}

function KartuDampier({ d, kamar, lama, satuKamar }: { d: StatusDampier | null; kamar: Kamar[]; lama: number; satuKamar: Sambungan[] }) {
  if (!d) {
    return (
      <section id="dampier" className="kartu mb-6 scroll-mt-28 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-kecil">Kalender mitra DAMPIER</p>
            <h2 className="mt-1 text-[1.6rem] text-panel-utama">Sambungkan dengan kalender DAMPIER</h2>
          </div>
          <span className="inline-flex rounded-full bg-panel-lembut px-3 py-1 text-xs font-bold whitespace-nowrap text-panel-utama">Belum tersambung</span>
        </div>
        <p className="mt-2 max-w-3xl text-[0.9375rem] text-abu">Kalender mitra di DAMPIER memuat semua kamar Mambetron, pesanan Booking.com, tamu DAMPIER, dan pesanan yang dicatat sendiri. Setelah tersambung, kamar yang terisi di sana ikut tertutup di situs ini, dan pesanan serta tanggal tutup dari situs ini ikut menutup kamar di DAMPIER dan Booking.com. Tamu tetap memesan dan membayar di situs ini.</p>
        <ol className="mt-4 grid gap-2 text-[0.9375rem] text-panel-utama/85">
          <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-panel-lembut text-sm font-bold">1</span>Buka kalender mitra Mambetron di DAMPIER, lalu ketuk Sambungkan website di kartu Sambungkan OTA.</li>
          <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-panel-lembut text-sm font-bold">2</span>Di kotak Untuk programmer website, ketuk Salin di samping alamat API.</li>
          <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-panel-lembut text-sm font-bold">3</span>Tempel alamatnya di bawah, lalu ketuk Sambungkan.</li>
        </ol>
        {satuKamar.map((x) => (
          <p key={x.id} className="mt-4 rounded-xl bg-pasir px-4 py-3 text-sm text-laut">Sambungan {x.nama} di unit {x.unit} memakai tautan satu kamar dari DAMPIER, jadi hanya unit itu yang terbaca dan malam yang penuh di DAMPIER belum tampil penuh di sini. Tempel alamat API di bawah supaya semua kamar terbaca sekaligus.</p>
        ))}
        <FormDampier kamar={kamar} tombol="Sambungkan" d={d} />
      </section>
    );
  }
  const km = kamar.find((k) => k.id === d.kamarId);
  const [kelas, label] = d.galat
    ? ['bg-[#fde3dc] text-merah', 'Gagal dibaca']
    : d.berhasil
      ? ['bg-[#dff5e6] text-[#1f7a3d]', 'Tersambung']
      : ['bg-pasir text-laut', 'Belum dibaca'];
  const nDampier = d.kamar?.length ?? 0;
  return (
    <section id="dampier" className="kartu mb-6 scroll-mt-28 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-kecil">Kalender mitra DAMPIER</p>
          <h2 className="mt-1 text-[1.6rem] text-panel-utama">{d.nama || 'Kalender DAMPIER'}</h2>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${kelas}`}>{label}</span>
      </div>
      <p className="mt-2 max-w-3xl text-[0.9375rem] text-abu">
        Kamar yang terisi di DAMPIER ikut tertutup di {km?.nama ?? 'bungalow ini'}, dan pesanan serta tanggal tutup dari situs ini dikirim ke DAMPIER sebagai pesanan Website sendiri.
        {d.berhasil ? ` Terakhir dibaca ${jamIso(d.berhasil)}.` : ''}
        {d.kirim ? ` ${d.kirim.jumlah} pesanan dan tanggal tutup terkirim ${jamIso(d.kirim.waktu)}.` : ''}
      </p>
      {d.galat && <p className="mt-3 rounded-xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">{d.galat}</p>}

      {(d.bentrok?.length ?? 0) > 0 && (
        <div className="mt-4 rounded-2xl bg-[#fde3dc] p-4" role="alert">
          <p className="font-semibold text-merah">Pesanan ini bertemu pesanan lain di DAMPIER pada malam yang sama</p>
          <p className="mt-1 text-sm text-laut">Pindahkan pesanan lain ke kamar yang kosong di kalender DAMPIER, atau hubungi tamunya.</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {d.bentrok!.map((b) => (
              <li key={`${b.id}-${b.mulai}`} className="rounded-xl bg-white px-3 py-2">
                {b.id.startsWith('TUTUP-')
                  ? <span className="block font-semibold text-laut">Tanggal tutup</span>
                  : <Link href={`/admin/pesanan?q=${encodeURIComponent(b.id)}`} className="block font-semibold text-laut hover:underline">{b.id}</Link>}
                <span className="block text-sm text-abu">{rentangTanggal(b.mulai, b.selesai)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {km && nDampier > 0 && nDampier !== km.jumlah_unit && (
        <p className="mt-4 rounded-xl bg-pasir px-4 py-3 text-sm text-laut">DAMPIER mencatat {nDampier} kamar, sedangkan {km.nama} di sini {km.jumlah_unit} unit. Samakan jumlahnya supaya hitungan kamar kosong cocok.</p>
      )}
      {lama > 0 && (
        <div className="mt-4 rounded-xl bg-panel-latar px-4 py-3 text-sm text-panel-utama/85">
          <p>Ada {lama} sambungan iCal lama dari sebelum DAMPIER. Sambungan itu tidak dibaca lagi, dan OTA yang membaca tautannya tidak lagi mendapat malam dari sini, jadi tidak ada pesanan yang terhitung dua kali. Bila OTA itu belum tersambung di DAMPIER, sambungkan di sana.</p>
          <form action={hapusSambunganLama} className="mt-2">
            <TombolYakin tanya="Hapus semua sambungan iCal lama di situs ini? OTA tetap tersambung lewat DAMPIER." className="tombol tombol-putih tombol-kecil">
              <Ikon nama="sampah" className="size-4" /> Hapus sambungan lama
            </TombolYakin>
          </form>
        </div>
      )}

      {nDampier > 0 && (
        <>
          <p className="mt-5 text-sm font-semibold text-panel-utama">Kamar di DAMPIER</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {d.kamar!.map((k) => <li key={k.nomor} className="rounded-full bg-panel-latar px-3 py-1 text-sm text-panel-utama">{k.nama}</li>)}
          </ul>
        </>
      )}
      <p className="mt-4 text-sm text-abu">Alamat API <span className="font-mono">{d.host}/api/kamar/…{d.akhiran}</span></p>

      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar">
          Ganti alamat <Ikon nama="bawah" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <p className="mt-3 text-sm text-abu">Pakai ini bila kunci diganti di DAMPIER, atau untuk memindahkan sambungan ke bungalow lain.</p>
        <FormDampier kamar={kamar} tombol="Simpan alamat baru" d={d} />
        <form action={putusDampier} className="mt-4">
          <TombolYakin tanya="Putuskan kalender DAMPIER? Kamar yang terisi di DAMPIER tidak lagi ditutup di sini, dan tautan kamar DAMPIER yang tersimpan di sini ikut dihapus. Pesanan yang sudah terkirim tetap ada di DAMPIER sampai dihapus di sana.">
            <Ikon nama="sampah" className="size-4" /> Putuskan
          </TombolYakin>
        </form>
      </details>
    </section>
  );
}

export default async function HalamanSinkron({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  pastikanSegar().catch(() => {});
  const hari = hariIni();
  const [kamar, sambungan, bentrok, asal, dampier] = await Promise.all([
    daftarKamar(true),
    daftarSambungan().catch(() => [] as Sambungan[]),
    cariBentrok(hari, tambahHari(hari, 365)).catch(() => []),
    asalSitus(),
    statusDampier().catch(() => null),
  ]);
  const baru = Number(sp.baru) || 0;
  const unit = kamar.flatMap((k) => Array.from({ length: k.jumlah_unit }, (_, i) => ({ k, u: i + 1 })));
  const yatim = sambungan.filter((s) => !kamar.some((k) => k.id === s.kamar_id && s.unit <= k.jumlah_unit));
  const terakhir = sambungan.map((s) => s.berhasil ?? '').sort().pop();
  const satuJenis = kamar.length === 1;

  return (
    <>
      <JudulAdmin judul="Channel manager" teks="DAMPIER mengatur Booking.com, Airbnb, Agoda, Traveloka, tiket.com, dan website ini dari satu kalender, supaya satu malam tidak terjual dua kali.">
        <form action={sinkronkanSekarang}>
          <button className="tombol tombol-kecil"><Ikon nama="sinkron" className="size-4" /> Sinkronkan sekarang</button>
        </form>
      </JudulAdmin>
      <Kabar ok={sp.ok} galat={sp.galat} pesan={{
        'ok:tambah': 'Sambungan ditambahkan. Salin tautannya lalu tempel di situs itu.',
        'ok:ubah': 'Sambungan disimpan.',
        'ok:hapus': 'Sambungan dihapus.',
        'ok:token': 'Tautan baru dibuat. Tempel tautan ini di situs itu, tautan lama sudah tidak bekerja.',
        'ok:sinkron': 'Semua kalender sudah dibaca ulang.',
        'galat:unit': 'Pilih unit bungalow dulu.',
        'galat:nama': 'Tulis nama situsnya, misalnya Booking.com.',
        'galat:url-baca': 'Tautan kalender tidak terbaca. Salin ulang tautan iCal dari situs itu.',
        'galat:url-https': 'Tautan kalender harus diawali https.',
        'galat:url-umum': 'Tautan kalender harus alamat internet umum.',
        'galat:url-panjang': 'Tautan kalender terlalu panjang.',
        'ok:dampier': 'Kalender DAMPIER tersambung. Pesanan dan tanggal tutup situs ini sudah dikirim ke DAMPIER.',
        'ok:dampier-putus': 'Kalender DAMPIER diputus.',
        'galat:dampier-alamat': 'Alamat itu bukan alamat API DAMPIER. Salin alamat dari kotak Untuk programmer website, yang diawali https://thedampier.com/api/kamar/.',
        'galat:dampier-kamar': 'Pilih bungalow yang dijual di DAMPIER.',
        'galat:dampier-kunci': 'DAMPIER tidak mengenal alamat ini. Kuncinya mungkin sudah diganti. Salin alamat API yang terbaru dari DAMPIER.',
        'galat:dampier-jaringan': 'DAMPIER tidak bisa dihubungi dari server situs ini. Coba lagi sebentar lagi.',
        'galat:dampier-sering': 'DAMPIER meminta jeda karena terlalu sering dihubungi. Coba lagi beberapa menit lagi.',
        'galat:dampier-bentuk': 'Jawaban DAMPIER tidak dikenali. Pastikan yang disalin alamat API, bukan tautan kalender mitra.',
        'galat:dampier-jawab': 'DAMPIER menolak sambungan ini. Coba salin ulang alamat API-nya.',
        'ok:lama': 'Sambungan iCal lama dihapus. OTA tetap tersambung lewat DAMPIER.',
        'ok:dampier-dikenali': 'Tautan itu dari DAMPIER. Semua kamar langsung tersambung lewat kalender DAMPIER, tanpa tautan per unit.',
      }} />

      <datalist id="saran-situs">{SARAN.map((x) => <option key={x} value={x} />)}</datalist>

      <KartuDampier
        d={dampier}
        kamar={kamar}
        // DAMPIER's own room links stay as they are, the others are from before DAMPIER
        lama={dampier ? sambungan.filter((x) => !apiDariTautan(x.url) && !tautanSatuKamarDampier(x.url)).length : 0}
        satuKamar={sambungan.filter((x) => tautanSatuKamarDampier(x.url))}
      />

      {bentrok.length > 0 && (
        <section className="mb-6 rounded-[1.5rem] bg-[#fde3dc] p-5 sm:p-6" role="alert">
          <p className="label-kecil !text-merah">Perlu ditangani</p>
          <h2 className="mt-1 text-[1.5rem] text-merah">Ada malam yang terjual lebih dari jumlah unit</h2>
          <p className="mt-1 text-[0.9375rem] text-laut">Pemesanan di situs ini dan di situs lain bertemu di malam yang sama. Hubungi salah satu tamu atau situs itu.</p>
          <ul className="mt-3 grid gap-2">
            {bentrok.map((b) => (
              <li key={`${b.kamar_id}-${b.mulai}`} className="rounded-xl bg-white px-4 py-3">
                <span className="block font-semibold text-laut">{b.nama}, {rentangTanggal(b.mulai, b.selesai)}</span>
                <span className="block text-sm text-abu">{b.terpakai} pemesanan untuk {b.unit} unit</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dampier ? (
        <section className="rounded-[1.5rem] bg-panel-lembut p-5 sm:p-7">
          <p className="label-kecil">OTA</p>
          <h2 className="mt-1 text-[1.6rem] text-panel-utama">Booking.com dan OTA lain diatur di DAMPIER</h2>
          <p className="mt-2 max-w-3xl text-[0.9375rem] text-panel-utama/85">Booking.com, Airbnb, Agoda, Traveloka, tiket.com, atau channel manager lain disambungkan per kamar di kalender mitra DAMPIER, kartu Sambungkan OTA. Website ini tersambung ke kalender yang sama, jadi tidak ada lagi yang perlu disambung di sini.</p>
          <p className="mt-2 max-w-3xl text-[0.9375rem] text-panel-utama/85">Tautan per kamar di lembar Sambungkan website DAMPIER tidak perlu ditempel, di sini maupun di sana. Sambungan ini sudah membaca semua kamar dan mengirim pesanan website ke DAMPIER.</p>
        </section>
      ) : (<>
      <div className="mt-10 mb-4">
        <p className="label-kecil">Tanpa DAMPIER</p>
        <h2 className="mt-1 text-[1.75rem] text-panel-utama">Sambungan iCal langsung per unit</h2>
        <p className="mt-1 max-w-3xl text-[0.9375rem] text-abu">Hanya untuk homestay yang tidak memakai DAMPIER. Begitu DAMPIER tersambung, bagian ini tidak dipakai lagi.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="kartu p-5 sm:p-7">
          <p className="label-kecil">Sambungan baru</p>
          <h2 className="mt-1 text-[1.6rem] text-panel-utama">Tambah sambungan</h2>
          <p className="mt-1 text-[0.9375rem] text-abu">Satu sambungan untuk satu unit di satu situs. Unit yang dijual di dua situs mendapat dua sambungan.</p>
          {unit.length ? (
            <form action={tambahSambungan} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label-isian">Unit</span>
                <select name="unit" required className="isian">
                  {unit.map(({ k, u }) => (
                    <option key={`${k.id}-${u}`} value={`${k.id}-${u}`}>
                      {satuJenis ? `Unit ${u}` : `${k.nama} unit ${u}`}
                      {sambungan.some((s) => s.kamar_id === k.id && s.unit === u) ? '' : ', belum tersambung'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-isian">Nama situs</span>
                <input name="nama" required maxLength={80} list="saran-situs" placeholder="Booking.com" className="isian" />
              </label>
              <label className="block sm:col-span-2">
                <span className="label-isian">Tautan kalender dari situs itu</span>
                <input name="url" inputMode="url" placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..." className="isian" />
                <span className="bantuan block">Tautan ekspor iCal dari situs itu. Kosongkan untuk agen perjalanan atau Google Calendar yang hanya perlu membaca kalender kita.</span>
              </label>
              <button className="tombol tombol-kecil justify-self-start"><Ikon nama="tambah" className="size-4" /> Tambah sambungan</button>
            </form>
          ) : (
            <p className="mt-4 rounded-2xl bg-panel-latar px-4 py-3 text-abu">Belum ada bungalow. Tambahkan bungalow dulu di menu Bungalow.</p>
          )}
        </section>

        <section className="rounded-[1.5rem] bg-panel-lembut p-5 sm:p-7">
          <p className="label-kecil">Cara kerja</p>
          <h2 className="mt-1 text-[1.6rem] text-panel-utama">Dua tautan untuk tiap sambungan</h2>
          <p className="mt-2 text-[0.9375rem] text-panel-utama/85">Setiap sambungan menukar dua tautan dengan situs itu.</p>
          <ol className="mt-3 grid gap-2 text-[0.9375rem] text-panel-utama/85">
            <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold">1</span>Salin tautan dari sambungan di halaman ini, lalu tempel di menu sinkron kalender situs itu.</li>
            <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold">2</span>Salin tautan ekspor iCal dari situs itu, lalu tempel di kolom tautan kalender di sini.</li>
            <li className="flex gap-3"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold">3</span>Coba tutup satu tanggal di salah satu sisi, lalu lihat tanggal itu ikut tertutup di sisi lain.</li>
          </ol>
          <p className="mt-4 text-sm text-panel-utama/75">
            Kalender situs lain dibaca setiap 15 menit, dan sekali lagi sebelum pemesanan baru disimpan. Situs pemesanan membaca kalender kita sesuai jadwal mereka sendiri, biasanya tiap 30 menit sampai beberapa jam.
            {terakhir ? ` Terakhir terbaca ${waktu(terakhir)}.` : ''}
          </p>
        </section>
      </div>

      {yatim.length > 0 && (
        <section className="mt-6 rounded-[1.5rem] bg-pasir/60 p-5 sm:p-6">
          <h2 className="text-[1.4rem] text-panel-utama">Sambungan untuk unit yang sudah tidak ada</h2>
          <p className="mt-1 text-[0.9375rem] text-laut">Jumlah unit bungalow dikurangi atau bungalownya dihapus. Situs lain melihat unit ini selalu penuh sampai sambungannya dihapus.</p>
          <ul className="mt-3 grid gap-3">{yatim.map((s) => <Sambung key={s.id} s={s} asal={asal} baru={s.id === baru} />)}</ul>
        </section>
      )}

      <h2 className="mt-10 mb-4 text-[1.75rem] text-panel-utama">Kalender per unit</h2>
      <div className="grid items-start gap-4 md:grid-cols-2">
        {unit.map(({ k, u }, i) => {
          const milik = sambungan.filter((s) => s.kamar_id === k.id && s.unit === u);
          return (
            <section key={`${k.id}-${u}`} className={`kartu p-5 sm:p-6 ${rentang2(unit.length, i)}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[1.4rem] text-panel-utama">{satuJenis ? `Unit ${u}` : `${k.nama} unit ${u}`}</h3>
                <span className="text-sm text-abu">{milik.length ? `${milik.length} situs tersambung` : 'Belum tersambung'}</span>
              </div>
              {milik.length > 0 && <ul className="mt-4 grid gap-3">{milik.map((s) => <Sambung key={s.id} s={s} asal={asal} baru={s.id === baru} />)}</ul>}
            </section>
          );
        })}
      </div>

      <section className="mt-10 rounded-[1.5rem] bg-panel-latar p-5 sm:p-7">
        <p className="label-kecil">Sebelum menyambung</p>
        <h2 className="mt-1 text-[1.6rem] text-panel-utama">Yang perlu diketahui tentang tiap situs</h2>
        <p className="mt-2 text-[0.9375rem] text-abu">Sinkron lewat iCal hanya membawa malam yang terisi, bukan harga, nama tamu, atau jumlah unit.</p>
        <ul className="mt-4 grid gap-3 text-[0.9375rem] md:grid-cols-2">
          <li className="rounded-2xl bg-white px-4 py-3"><span className="block font-semibold text-panel-utama">Booking.com</span>Sinkron kalender di Booking.com hanya untuk tipe kamar yang berisi satu unit. Bila ketujuh bungalow dijual sebagai satu tipe berisi tujuh, Booking.com perlu mengubahnya menjadi tujuh tipe satu unit, atau pakai channel manager. Tanyakan ke tim Booking.com sebelum mengubah iklan.</li>
          <li className="rounded-2xl bg-white px-4 py-3"><span className="block font-semibold text-panel-utama">Airbnb</span>Satu iklan Airbnb punya satu kalender. Sambungkan satu iklan ke satu unit di sini.</li>
          <li className="rounded-2xl bg-white px-4 py-3"><span className="block font-semibold text-panel-utama">Agoda</span>Agoda Homes punya impor dan ekspor iCal. Untuk iklan hotel di Agoda YCS, tanyakan ke Agoda apakah iCal tersedia.</li>
          <li className="rounded-2xl bg-white px-4 py-3"><span className="block font-semibold text-panel-utama">Traveloka dan Tiket.com</span>Keduanya tidak memakai tautan iCal. Tutup tanggalnya manual di sana, atau pakai channel manager.</li>
          <li className="rounded-2xl bg-white px-4 py-3 md:col-span-2"><span className="block font-semibold text-panel-utama">Agen perjalanan</span>Buat sambungan tanpa tautan masuk, lalu kirim tautan sambungan itu ke agen. Agen bisa membukanya di Google Calendar untuk melihat unit yang masih kosong. Pemesanan dari agen dicatat lewat Pesanan, Tambah pesanan manual.</li>
        </ul>
      </section>
      </>)}
    </>
  );
}
