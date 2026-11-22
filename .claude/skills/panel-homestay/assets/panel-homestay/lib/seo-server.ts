// Server checks for the Search Console guide in the panel (app/admin/(panel)/google).
import { Resolver } from 'node:dns/promises';

export type CekDns = { keadaan: 'ada' | 'kosong' | 'galat'; kode: string[] };

// The google-site-verification TXT record of the domain, for the Domain
// property. Null for a local or bare address, where there is nothing to look up.
export async function txtGoogle(domain: string): Promise<CekDns | null> {
  if (!domain || !domain.includes('.') || /^(localhost|[\d.]+|\[.*\])$/i.test(domain)) return null;
  const r = new Resolver({ timeout: 3000, tries: 1 });
  try {
    const txt = (await r.resolveTxt(domain)).map((x) => x.join(''));
    const kode = txt.filter((x) => x.startsWith('google-site-verification=')).map((x) => x.slice('google-site-verification='.length));
    return { keadaan: kode.length ? 'ada' : 'kosong', kode };
  } catch (e) {
    const k = (e as { code?: string }).code;
    // no TXT record at all, or no such name: simply not there yet
    return { keadaan: k === 'ENODATA' || k === 'ENOTFOUND' ? 'kosong' : 'galat', kode: [] };
  }
}

// The domain for the Domain property, without www.
export const domainUtama = (dasar: string) => {
  try {
    return new URL(dasar).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
};
