// "Online bookings managed by DAMPIER" under a book button, with the first
// word DAMPIER linked to DAMPIER's home page, as DAMPIER asks of partner sites.
export default function DikelolaDampier({ teks, beranda, className = '' }: { teks: string; beranda: string; className?: string }) {
  const i = teks.indexOf('DAMPIER');
  return (
    <p className={`text-sm text-abu ${className}`}>
      {i < 0 ? teks : (
        <>
          {teks.slice(0, i)}
          <a href={beranda} target="_blank" rel="noopener" className="font-bold text-biru-tua underline-offset-4 hover:underline">DAMPIER</a>
          {teks.slice(i + 7)}
        </>
      )}
    </p>
  );
}
