import Link from 'next/link';
import FormSandi from '@/components/admin/FormSandi';
import { dbDiatur, surelDiatur } from '@/lib/env';
import { sandiDiatur, sesiAkun } from '@/lib/sesi';

export const metadata = { title: 'Ganti kata sandi' };

export default async function GantiSandi() {
  const akun = await sesiAkun();
  const masuk = Boolean(akun);
  const siap = sandiDiatur() && dbDiatur() && surelDiatur();
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="kartu w-full max-w-md p-6 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/logo-utama.svg" alt="Mambetron Homestay" width={134} height={112} className="mx-auto h-24 w-auto" />
        <h1 className="mt-6 text-center text-2xl">Ganti kata sandi panel</h1>
        <p className="mt-2 text-center text-sm text-abu">Bisa dipakai saat lupa kata sandi atau ingin menggantinya.</p>
        <div className="mt-6">
          {siap ? <FormSandi awal={akun} /> : (
            <div className="grid gap-3 rounded-2xl bg-buih px-4 py-4 text-laut">
              <p className="font-semibold">Ganti kata sandi lewat surel belum bisa dipakai.</p>
              <p className="text-sm">
                {!sandiDiatur() ? 'ADMIN_PASSWORD masih kosong.' : !dbDiatur() ? 'Database belum diatur.' : 'Pengiriman surel belum diatur.'}{' '}
                Isi environment variables yang dibutuhkan di hPanel Hostinger, lalu mulai ulang aplikasi. Daftarnya ada di README.
              </p>
              <p className="text-sm">Sementara itu, kata sandi tetap bisa diganti dengan mengubah ADMIN_PASSWORD di hPanel lalu memulai ulang aplikasi.</p>
            </div>
          )}
        </div>
        <Link href={masuk ? '/admin' : '/admin/masuk'} className="mt-6 block text-center text-sm font-bold text-biru-tua hover:underline">
          {masuk ? 'Kembali ke panel' : 'Kembali ke halaman masuk'}
        </Link>
      </div>
    </main>
  );
}
