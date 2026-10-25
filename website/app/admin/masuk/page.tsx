import { redirect } from 'next/navigation';
import FormMasuk from '@/components/admin/FormMasuk';
import { sandiDiatur, sesiSah } from '@/lib/sesi';

export const metadata = { title: 'Masuk' };

export default async function Masuk() {
  if (await sesiSah()) redirect('/admin');
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="kartu w-full max-w-sm p-6 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/logo-utama.svg" alt="Mambetron Homestay" width={220} height={120} className="mx-auto h-24 w-auto" />
        <h1 className="mt-6 text-center text-2xl">Panel pengelola</h1>
        {sandiDiatur() ? (
          <div className="mt-6"><FormMasuk /></div>
        ) : (
          <p className="mt-4 rounded-2xl bg-pasir px-4 py-3 text-laut">
            Panel belum bisa dipakai karena ADMIN_PASSWORD masih kosong. Isi di hPanel Hostinger pada Environment variables aplikasi Node.js, lalu mulai ulang aplikasi.
          </p>
        )}
      </div>
    </main>
  );
}
