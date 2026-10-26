import type { Foto } from '@/lib/jenis';

// Background picture of the hero and of the closed page. A photo uploaded in
// Foto situs wins, otherwise the homestay photo shipped in public/foto.
export default function LatarPahlawan({ foto }: { foto?: Foto }) {
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={foto.url} alt={foto.keterangan} width={foto.lebar} height={foto.tinggi} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/foto/beranda.jpg" srcSet="/foto/beranda-1000.jpg 1000w, /foto/beranda.jpg 2000w" sizes="100vw" alt="" aria-hidden
      width={2000} height={1125} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover object-[62%_50%]" />
  );
}
