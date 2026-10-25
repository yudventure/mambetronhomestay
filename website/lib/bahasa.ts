// Language of the public site. A cookie set by the language switch wins,
// otherwise the browser language decides, with Indonesian as the default.
import { cookies, headers } from 'next/headers';
import type { Bahasa } from './jenis';

export const KUKI_BAHASA = 'bahasa';

export async function bahasaAktif(): Promise<Bahasa> {
  const k = (await cookies()).get(KUKI_BAHASA)?.value;
  if (k === 'id' || k === 'en') return k;
  const terima = ((await headers()).get('accept-language') ?? '').toLowerCase();
  const pertama = terima.split(',')[0]?.trim() ?? '';
  if (!pertama || pertama.startsWith('id') || pertama.startsWith('ms') || pertama.startsWith('in')) return 'id';
  return 'en';
}
