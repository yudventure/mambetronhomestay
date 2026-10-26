import type { Foto } from '@/lib/jenis';

// Background picture of the hero and of the closed page. Phones narrower than
// the md breakpoint get the upright photo, wider screens the landscape one.
// Photos uploaded in Foto situs win. Without an upright upload, phones use the
// uploaded landscape photo, and only with no upload at all the photos shipped
// in public/foto.
const HP = '(max-width: 767px)';

export default function LatarPahlawan({ foto, fotoHp }: { foto?: Foto; fotoHp?: Foto }) {
  const hp = fotoHp ?? foto;
  return (
    <picture>
      {hp
        ? <source media={HP} srcSet={hp.url} width={hp.lebar} height={hp.tinggi} />
        : <source media={HP} srcSet="/foto/beranda-hp-720.jpg 720w, /foto/beranda-hp.jpg 1125w" sizes="100vw" width={1125} height={2000} />}
      {foto
        ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto.url} alt={foto.keterangan} width={foto.lebar} height={foto.tinggi} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/foto/beranda.jpg" srcSet="/foto/beranda-1000.jpg 1000w, /foto/beranda.jpg 1890w" sizes="100vw" alt="" aria-hidden
            width={1890} height={906} fetchPriority="high"
            className="absolute inset-0 -z-10 size-full object-cover md:object-[50%_55%]" />
        )}
    </picture>
  );
}
