// Language of the public site. English is the default for every first
// visit, whatever the browser's language, and the address never carries a
// language (no /en): the owner's request, November 2026, "untuk bahasa
// default bahasa inggris yaa tanpa tambahan en dibelakang url karena itu
// yang default". A guest who picks Indonesian on the language switch gets
// it from the cookie on every page after that.
import { cookies } from 'next/headers';
import type { Bahasa } from './jenis';

export const KUKI_BAHASA = 'bahasa';

export async function bahasaAktif(): Promise<Bahasa> {
  return (await cookies()).get(KUKI_BAHASA)?.value === 'id' ? 'id' : 'en';
}
