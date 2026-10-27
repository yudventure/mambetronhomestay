// Long text from the panel. A blank line starts a new paragraph, a block whose
// first line starts with "## " opens with a subheading, and **words** are bold.
import { paragraf } from '@/lib/format';

function Baris({ teks }: { teks: string }) {
  return teks.split(/\*\*(.+?)\*\*/g).map((x, i) => (i % 2 ? <strong key={i} className="font-semibold text-laut">{x}</strong> : x));
}

export default function TeksPanjang({ teks }: { teks: string }) {
  return paragraf(teks).map((blok, i) => {
    if (!blok.startsWith('## ')) return <p key={i}><Baris teks={blok} /></p>;
    const [kepala, ...isi] = blok.split('\n');
    return (
      <div key={i}>
        <h3 className="mt-2 text-[1.35rem] text-laut">{kepala.slice(3).trim()}</h3>
        {isi.join(' ').trim() && <p className="mt-2"><Baris teks={isi.join(' ').trim()} /></p>}
      </div>
    );
  });
}
