// Column spans for card grids. A card left alone on the last row spreads
// over the full width, and two cards left in a three column row share it.
// Grid classes on the parent are grid-cols-1 md:grid-cols-2 lg:grid-cols-6.
export const KISI = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6';

export function rentang(n: number, i: number) {
  const k: string[] = [];
  k.push(n % 2 === 1 && i === n - 1 ? 'md:col-span-2' : 'md:col-span-1');
  const sisa = n % 3;
  if (sisa === 1 && i === n - 1) k.push('lg:col-span-6');
  else if (sisa === 2 && i >= n - 2) k.push('lg:col-span-3');
  else k.push('lg:col-span-2');
  return k.join(' ');
}

// Two-column variant for short lists like highlights or bank accounts.
export const KISI2 = 'grid grid-cols-1 md:grid-cols-2';
export const rentang2 = (n: number, i: number) => (n % 2 === 1 && i === n - 1 ? 'md:col-span-2' : '');

// Highlights sit four across when they divide evenly, otherwise they use
// the same three column rules as the cards.
export function kisiSorotan(n: number) {
  if (n % 4 === 0) return { induk: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4', anak: () => '' };
  return { induk: KISI, anak: (i: number) => rentang(n, i) };
}
