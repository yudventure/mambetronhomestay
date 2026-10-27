// The stay a visitor picked, kept in this browser only so the next page can
// show the same dates. Never sent anywhere, never used to count visitors.
const KUNCI = 'mambetron-rencana';
const UMUR = 14 * 864e5;

export type Rencana = { masuk: string; keluar: string; tamu: number };

const tgl = (s: unknown) => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '');

export function bacaRencana(): Rencana | null {
  try {
    const r = JSON.parse(localStorage.getItem(KUNCI) ?? 'null');
    if (!r || Date.now() - Number(r.waktu) > UMUR) return null;
    const masuk = tgl(r.masuk);
    if (!masuk) return null;
    const keluar = tgl(r.keluar) > masuk ? tgl(r.keluar) : '';
    return { masuk, keluar, tamu: Math.min(20, Math.max(1, Number(r.tamu) || 2)) };
  } catch {
    return null;
  }
}

export function simpanRencana(r: Partial<Rencana>) {
  try {
    const lama = bacaRencana();
    const baru = { masuk: '', keluar: '', tamu: 2, ...lama, ...r };
    if (!tgl(baru.masuk)) localStorage.removeItem(KUNCI);
    else localStorage.setItem(KUNCI, JSON.stringify({ ...baru, waktu: Date.now() }));
  } catch {
    // private window or blocked storage, the page works without it
  }
}
