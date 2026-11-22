// Long text from the panel. A blank line starts a new paragraph, a block whose
// first line starts with "## " opens with a subheading, lines that start with
// "- " become a list, and **words** are bold.
import { paragraf } from '@/lib/format';

function Baris({ teks }: { teks: string }) {
  return teks.split(/\*\*(.+?)\*\*/g).map((x, i) => (i % 2 ? <strong key={i} className="font-semibold text-laut">{x}</strong> : x));
}

// The lines of one block: running text as paragraphs, "- " lines as a list.
function Isi({ baris }: { baris: string[] }) {
  const potong: { daftar: boolean; isi: string[] }[] = [];
  for (const b of baris.map((x) => x.trim()).filter(Boolean)) {
    const daftar = /^-\s+/.test(b);
    const akhir = potong[potong.length - 1];
    if (akhir && akhir.daftar === daftar) akhir.isi.push(daftar ? b.replace(/^-\s+/, '') : b);
    else potong.push({ daftar, isi: [daftar ? b.replace(/^-\s+/, '') : b] });
  }
  return potong.map((x, i) => (x.daftar
    ? <ul key={i} className="ml-5 list-disc space-y-1.5 marker:text-biru">{x.isi.map((y, j) => <li key={j}><Baris teks={y} /></li>)}</ul>
    : <p key={i}><Baris teks={x.isi.join(' ')} /></p>));
}

export default function TeksPanjang({ teks }: { teks: string }) {
  return paragraf(teks).map((blok, i) => {
    const baris = blok.split('\n');
    if (!blok.startsWith('## ')) return <Isi key={i} baris={baris} />;
    const [kepala, ...isi] = baris;
    return (
      <div key={i} className="grid gap-2">
        <h3 className="mt-2 text-[1.35rem] text-laut">{kepala.slice(3).trim()}</h3>
        <Isi baris={isi} />
      </div>
    );
  });
}
