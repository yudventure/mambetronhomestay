// Page section with the standard width and vertical rhythm. Sections are
// told apart by background colour, never by divider lines.
const LATAR = {
  putih: 'bg-white',
  buih: 'bg-buih',
  laut: 'bg-laut text-white',
} as const;

export type Latar = keyof typeof LATAR;

export default function Bagian({ id, latar = 'putih', className = '', lebar = 'max-w-6xl', children }: {
  id?: string; latar?: Latar; className?: string; lebar?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${LATAR[latar]} py-16 md:py-24 ${className}`}>
      <div className={`mx-auto ${lebar} px-4 sm:px-6`}>{children}</div>
    </section>
  );
}

export function JudulBagian({ label, judul, teks, terang = false, tengah = false }: {
  label?: string; judul: string; teks?: string; terang?: boolean; tengah?: boolean;
}) {
  return (
    <div className={`mb-10 max-w-2xl ${tengah ? 'mx-auto text-center' : ''}`}>
      {label && <p className={`label-kecil ${terang ? '!text-pasir' : ''}`}>{label}</p>}
      <h2 className={`mt-2 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)] ${terang ? '!text-white' : ''}`}>{judul}</h2>
      {teks && <p className={`mt-3 text-lg ${terang ? 'text-white/80' : 'text-abu'}`}>{teks}</p>}
    </div>
  );
}
