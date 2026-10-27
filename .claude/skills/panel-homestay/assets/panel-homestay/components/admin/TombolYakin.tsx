'use client';
// Submit button that asks before a destructive action.
export default function TombolYakin({ tanya, children, className = 'tombol tombol-merah tombol-kecil' }: { tanya: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(tanya)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
