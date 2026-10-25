// Environment values with safe defaults. Everything here is read at request
// time, so values filled in later in hPanel take effect after a restart
// without a new build.

const baca = (k: string, cadangan = '') => (process.env[k] ?? '').trim() || cadangan;

export function envDb() {
  return {
    host: baca('DB_HOST', 'localhost'),
    port: Number(baca('DB_PORT', '3306')) || 3306,
    user: baca('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: baca('DB_NAME'),
  };
}

export const dbDiatur = () => Boolean(baca('DB_USER') && baca('DB_NAME'));

export const sandiAdmin = () => process.env.ADMIN_PASSWORD ?? '';

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
    password: process.env.SMTP_PASSWORD ?? '',
    dari: baca('EMAIL_FROM') || baca('SMTP_USER'),
    admin: baca('EMAIL_ADMIN'),
  };
}

export const surelDiatur = () => {
  const s = envSurel();
  return Boolean(s.host && s.user && s.password && s.dari);
};
