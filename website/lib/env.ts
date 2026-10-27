import fs from 'fs';
import path from 'path';

// Environment values with safe defaults. Everything here is read at request
// time, so values filled in later in hPanel take effect after a restart
// without a new build.

const baca = (k: string, cadangan = '') => (process.env[k] ?? '').trim() || cadangan;

// A password as typed in hPanel, without spaces or a line break copied along
// at either end and without one pair of quotes around it.
export function rapiSandi(v: string) {
  const s = v.trim();
  return s.match(/^(['"])([\s\S]*)\1$/)?.[2] ?? s;
}
const sandiEnv = (k: string) => rapiSandi(process.env[k] ?? '');

// Database names. DB_* is what the README asks for, the others are names
// other guides use. The first filled one wins, then DATABASE_URL.
export const NAMA_DB = {
  host: ['DB_HOST', 'DB_HOSTNAME', 'MYSQL_HOST', 'DATABASE_HOST'],
  port: ['DB_PORT', 'MYSQL_PORT', 'DATABASE_PORT'],
  database: ['DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE', 'DATABASE_NAME'],
  user: ['DB_USER', 'DB_USERNAME', 'MYSQL_USER', 'DATABASE_USER'],
  password: ['DB_PASSWORD', 'DB_PASS', 'MYSQL_PASSWORD', 'DATABASE_PASSWORD'],
} as const;

const pertama = (nama: readonly string[]) => nama.map((k) => baca(k)).find(Boolean) ?? '';

// mysql://user:password@host:3306/name
function dariUrl() {
  const u = baca('DATABASE_URL');
  if (!u) return null;
  try {
    const x = new URL(u);
    if (!x.protocol.startsWith('mysql')) return null;
    return {
      host: x.hostname,
      port: x.port,
      user: decodeURIComponent(x.username),
      password: decodeURIComponent(x.password),
      database: decodeURIComponent(x.pathname.replace(/^\//, '')),
    };
  } catch {
    return null;
  }
}

export function envDb() {
  const u = dariUrl();
  const sandi = NAMA_DB.password.map(sandiEnv).find((v) => v !== '');
  return {
    host: pertama(NAMA_DB.host) || u?.host || 'localhost',
    port: Number(pertama(NAMA_DB.port) || u?.port || '3306') || 3306,
    user: pertama(NAMA_DB.user) || u?.user || '',
    password: sandi ?? u?.password ?? '',
    database: pertama(NAMA_DB.database) || u?.database || '',
    socket: baca('DB_SOCKET'),
  };
}

export const dbDiatur = () => {
  const d = envDb();
  return Boolean(d.user && d.database);
};

// What the admin page shows while the database is not reachable. Which name
// each value came from, the values except the password, and other variable
// names that look like database settings, to catch typos.
export function diagnosaDb() {
  const u = Boolean(dariUrl());
  const d = envDb();
  const asal = (nama: readonly string[], dariUrlJuga: boolean) =>
    nama.find((k) => (process.env[k] ?? '').trim() !== '') ?? (u && dariUrlJuga ? 'DATABASE_URL' : '');
  const dikenal = new Set<string>([...Object.values(NAMA_DB).flat(), 'DATABASE_URL']);
  const mentah = NAMA_DB.password.map((k) => process.env[k] ?? '').find((v) => v.trim() !== '') ?? '';
  const sandi = {
    panjang: rapiSandi(mentah).length,
    spasi: mentah !== mentah.trim(),
    kutip: rapiSandi(mentah) !== mentah.trim(),
    simbol: /[$#\\`'"]/.test(rapiSandi(mentah)),
  };
  const berkas = ['.env', '.env.local', '.env.production', '.env.production.local'].filter((f) => {
    try {
      return fs.statSync(path.join(process.cwd(), f)).isFile();
    } catch {
      return false;
    }
  });
  return {
    sandi,
    berkas,
    baris: [
      { nama: 'DB_HOST', asal: asal(NAMA_DB.host, true), nilai: d.host, bawaan: 'localhost' },
      { nama: 'DB_PORT', asal: asal(NAMA_DB.port, true), nilai: String(d.port), bawaan: '3306' },
      { nama: 'DB_NAME', asal: asal(NAMA_DB.database, true), nilai: d.database, bawaan: '' },
      { nama: 'DB_USER', asal: asal(NAMA_DB.user, true), nilai: d.user, bawaan: '' },
      { nama: 'DB_PASSWORD', asal: asal(NAMA_DB.password, true), nilai: d.password ? 'terisi' : '', bawaan: '' },
    ],
    mirip: Object.keys(process.env).filter((k) => /^\s*(db|database|mysql)/i.test(k) && !dikenal.has(k)).sort(),
  };
}

export const sandiAdmin = () => sandiEnv('ADMIN_PASSWORD');

export function rahasiaSesi() {
  const s = baca('SESSION_SECRET');
  if (s) return s;
  // without SESSION_SECRET sessions are signed with a key derived from the
  // admin password and database login, so changing either signs everyone out
  const d = envDb();
  return `mambetron|${sandiAdmin()}|${d.user}|${d.password}|${d.database}`;
}

export const alamatSitus = () => baca('SITE_URL').replace(/\/+$/, '');

export function envSurel() {
  const port = Number(baca('SMTP_PORT', '465')) || 465;
  return {
    host: baca('SMTP_HOST'),
    port,
    user: baca('SMTP_USER'),
    password: sandiEnv('SMTP_PASSWORD'),
    dari: baca('EMAIL_FROM') || baca('SMTP_USER'),
    admin: baca('EMAIL_ADMIN'),
  };
}

export const surelDiatur = () => {
  const s = envSurel();
  return Boolean(s.host && s.user && s.password && s.dari);
};
