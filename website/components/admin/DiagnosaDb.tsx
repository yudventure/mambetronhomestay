// Shown in the panel while the database cannot be reached. Lists what the
// app actually reads from the environment, so a missing or misspelled
// variable in hPanel is easy to spot. The password itself is never shown.
import { dbDiatur, diagnosaDb } from '@/lib/env';

// What a database reply means for the owner, in plain words.
export function saranDb(pesan: string) {
  const p = pesan.toLowerCase();
  const saran: string[] = [];
  if (p.includes('access denied')) saran.push('Server database menolak nama pengguna atau kata sandinya. Samakan DB_PASSWORD dengan kata sandi database di hPanel, menu Databases, tombol titik tiga, ubah kata sandi. Lalu jalankan Redeploy.');
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
                  : `${x.nama === 'DB_PASSWORD' ? 'Terisi' : x.nilai}${x.asal !== x.nama ? `, dibaca dari ${x.asal}` : ''}`}
              </span>
            </li>
          );
        })}
      </ul>
      {d.mirip.length > 0 && (
        <p className="mt-3 rounded-2xl bg-pasir px-4 py-3 text-sm text-laut">
          Ada variabel lain yang mirip pengaturan database, mungkin salah tulis. Namanya {d.mirip.join(', ')}.
        </p>
      )}

      <h2 className="mt-6 text-xl">Cara memperbaiki</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        {!diatur && <li>Di hPanel Hostinger buka Websites, mambetronhomestay.com, Node.js, lalu Environment variables. Isi DB_NAME, DB_USER, dan DB_PASSWORD persis seperti di menu Databases, dengan huruf besar dan garis bawah yang sama.</li>}
        {diatur && <li>Periksa lagi DB_PASSWORD dan DB_HOST. Pesan di atas adalah jawaban server database.</li>}
        <li>Simpan, lalu jalankan Redeploy atau mulai ulang aplikasi. Nilai yang baru disimpan terbaca setelah aplikasi berjalan ulang.</li>
        <li>Muat ulang halaman ini. Tabel dan isi awal dibuat sendiri saat situs pertama kali terhubung.</li>
      </ol>
    </div>
  );
}
