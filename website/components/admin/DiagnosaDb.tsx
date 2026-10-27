// Shown in the panel while the database cannot be reached. Lists what the
// app actually reads from the environment, so a missing or misspelled
// variable in hPanel is easy to spot. The password itself is never shown.
import { dbDiatur, diagnosaDb } from '@/lib/env';

// What a database reply means for the owner, in plain words.
export function saranDb(pesan: string) {
  const p = pesan.toLowerCase();
  const saran: string[] = [];
  if (p.includes('access denied')) saran.push('Sambungan ke server database sudah sampai, tetapi kata sandi untuk pengguna database ini ditolak. Kata sandi di DB_PASSWORD belum sama dengan kata sandi pengguna database di hPanel.');
  if (p.includes('unknown database')) saran.push('Nama database tidak ditemukan. Periksa DB_NAME, harus sama persis dengan nama di menu Databases.');
  if (/econnrefused|enoent|etimedout|enotfound|ehostunreach|can't connect/.test(p)) saran.push('Ada alamat yang tidak bisa dijangkau. Bila semua alamat gagal, buka menu Databases di hPanel, lihat host MySQL yang tertulis di sana, lalu isi DB_HOST dengan host itu.');
  return saran;
}

export default function DiagnosaDb({ pesan }: { pesan: string }) {
  const d = diagnosaDb();
  const diatur = dbDiatur();
  const saran = saranDb(pesan);
  return (
    <div className="kartu max-w-3xl p-6 sm:p-8">
      <h1 className="text-3xl">Database belum terhubung</h1>
      <p className="mt-3 text-abu [overflow-wrap:anywhere]">{pesan}</p>
      {saran.length > 0 && (
        <div className="mt-4 grid gap-2">
          {saran.map((x) => <p key={x} className="rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah">{x}</p>)}
        </div>
      )}

      <h2 className="mt-6 text-xl">Yang terbaca dari environment variables</h2>
      <ul className="mt-3 grid gap-2">
        {d.baris.map((x) => {
          const kosong = !x.asal;
          const wajib = !x.bawaan;
          return (
            <li key={x.nama} className={`rounded-2xl px-4 py-3 ${kosong && wajib ? 'bg-[#fbe4df]' : 'bg-buih'}`}>
              <span className="block font-mono text-sm font-bold text-laut">{x.nama}</span>
              <span className={`block text-sm ${kosong && wajib ? 'font-semibold text-merah' : 'text-laut/80'}`}>
                {kosong
                  ? wajib ? 'Kosong atau tidak terbaca' : `Kosong, memakai bawaan ${x.bawaan}`
                  : `${x.nama === 'DB_PASSWORD' ? `Terisi, ${d.sandi.panjang} karakter` : x.nilai}${x.asal !== x.nama ? `, dibaca dari ${x.asal}` : ''}`}
              </span>
              {x.nama === 'DB_PASSWORD' && !kosong && (
                <span className="mt-1 block text-xs text-laut/70">
                  Cocokkan jumlah karakternya dengan kata sandi database kamu.
                  {d.sandi.spasi && ' Ada spasi atau baris baru di awal atau akhir, sudah dibuang otomatis.'}
                  {d.sandi.kutip && ' Nilainya diapit tanda kutip, tanda kutipnya sudah dibuang otomatis.'}
                  {d.sandi.simbol && ' Kata sandi ini memuat simbol seperti $, #, tanda kutip, atau garis miring terbalik. Simbol seperti itu kadang berubah saat disimpan sebagai environment variable.'}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {d.akun && (
        <div className={`mt-3 rounded-2xl px-4 py-3 text-sm ${d.beda ? 'bg-[#fbe4df] text-merah' : 'bg-buih text-laut'}`}>
          <span className="block font-mono font-bold">Akun hosting aplikasi</span>
          <span className="block">{d.akun} di server {d.server}</span>
          {d.beda && (
            <span className="mt-1 block font-semibold">
              Pengguna database berawalan {d.baris.find((b) => b.nama === 'DB_USER')?.nilai.split('_')[0]}, sedangkan aplikasi berjalan di akun {d.akun}. Database ini milik akun hosting lain, jadi tidak bisa dipakai dari sini. Buat database baru dari menu Database milik website ini di hPanel, lalu isi DB_NAME, DB_USER, dan DB_PASSWORD dengan yang baru.
            </span>
          )}
        </div>
      )}
      {d.berkas.length > 0 && (
        <p className="mt-3 rounded-2xl bg-pasir px-4 py-3 text-sm text-laut">
          Di folder aplikasi ada berkas {d.berkas.join(', ')}. Nilai di hPanel tetap didahulukan, tetapi pastikan berkas itu tidak berisi kata sandi lama.
        </p>
      )}
      {d.mirip.length > 0 && (
        <p className="mt-3 rounded-2xl bg-pasir px-4 py-3 text-sm text-laut">
          Ada variabel lain yang mirip pengaturan database, mungkin salah tulis. Namanya {d.mirip.join(', ')}.
        </p>
      )}

      <h2 className="mt-6 text-xl">Cara memperbaiki</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        {!diatur && <li>Di hPanel Hostinger buka Websites, mambetronhomestay.com, Node.js, lalu Environment variables. Isi DB_NAME, DB_USER, dan DB_PASSWORD persis seperti di menu Databases, dengan huruf besar dan garis bawah yang sama.</li>}
        {diatur && saran.some((x) => x.startsWith('Sambungan ke server database sudah sampai')) && (
          <li>Kata sandi pengguna database di hPanel tidak bisa dilihat, hanya bisa disimpan ulang. Buka Databases, tekan titik tiga di baris pengguna {d.baris.find((b) => b.nama === 'DB_USER')?.nilai}, pilih ubah kata sandi, lalu simpan kata sandi pilihanmu sendiri. Isi DB_PASSWORD dengan kata sandi yang sama persis. Setelah keduanya sama, cukup muat ulang halaman ini, tidak perlu Redeploy bila DB_PASSWORD tidak berubah.</li>
        )}
        {diatur && saran.some((x) => x.startsWith('Sambungan ke server database sudah sampai')) && (
          <li>Bila kata sandinya sudah sama tetapi tetap ditolak, server database ini tidak mengenal pengguna itu. Biasanya karena database dibuat dari menu website lain di hPanel. Buat database baru dari website mambetronhomestay.com, menu Database, lalu isi DB_NAME, DB_USER, dan DB_PASSWORD dengan yang baru dan jalankan Redeploy.</li>
        )}
        {diatur && !saran.some((x) => x.startsWith('Sambungan ke server database sudah sampai')) && <li>Periksa lagi DB_PASSWORD dan DB_HOST. Pesan di atas adalah jawaban server database.</li>}
        <li>Simpan, lalu jalankan Redeploy atau mulai ulang aplikasi. Nilai yang baru disimpan terbaca setelah aplikasi berjalan ulang.</li>
        <li>Muat ulang halaman ini. Tabel dan isi awal dibuat sendiri saat situs pertama kali terhubung.</li>
      </ol>
    </div>
  );
}
