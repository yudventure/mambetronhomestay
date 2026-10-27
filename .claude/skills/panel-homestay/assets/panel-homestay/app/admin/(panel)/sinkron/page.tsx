import { headers } from 'next/headers';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolSalin from '@/components/admin/TombolSalin';
import TombolYakin from '@/components/admin/TombolYakin';
import { gantiTautanSambungan, hapusSambungan, sinkronkanSekarang, tambahSambungan, ubahSambungan } from '@/app/admin/aksi';
import { daftarKamar } from '@/lib/data';
import { alamatSitus } from '@/lib/env';
import { rentangTanggal, waktu } from '@/lib/format';
import { rentang2 } from '@/lib/kisi';
import { cariBentrok, daftarSambungan, pastikanSegar, type Sambungan } from '@/lib/sinkron';
import { hariIni, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Sinkron OTA' };

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

export default async function HalamanSinkron({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  pastikanSegar().catch(() => {});
  const hari = hariIni();
  const [kamar, sambungan, bentrok, asal] = await Promise.all([
    daftarKamar(true),
    daftarSambungan().catch(() => [] as Sambungan[]),
    cariBentrok(hari, tambahHari(hari, 365)).catch(() => []),
    asalSitus(),
  ]);
  const baru = Number(sp.baru) || 0;
  const unit = kamar.flatMap((k) => Array.from({ length: k.jumlah_unit }, (_, i) => ({ k, u: i + 1 })));
  const yatim = sambungan.filter((s) => !kamar.some((k) => k.id === s.kamar_id && s.unit <= k.jumlah_unit));
  const terakhir = sambungan.map((s) => s.berhasil ?? '').sort().pop();
  const satuJenis = kamar.length === 1;

  return (
    <>
      <JudulAdmin judul="Sinkron OTA" teks="Hubungkan kalender setiap unit dengan Booking.com, Airbnb, Agoda, atau agen perjalanan, supaya satu malam tidak terjual dua kali.">
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
      }} />

      <datalist id="saran-situs">{SARAN.map((x) => <option key={x} value={x} />)}</datalist>

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
    </>
  );
}
