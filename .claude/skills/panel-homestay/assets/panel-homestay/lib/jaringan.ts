// Addresses the server must not be sent to: its own machine and the private
// networks around it. Calendar links and the DAMPIER address come from the
// panel, and are fetched by this server.
export function alamatDalam(hostname: string) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || (!h.includes('.') && !h.includes(':'))
    || /^(127|10|0)\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    || h === '::1' || /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h);
}

// Local test servers only, never set on Hostinger.
export const izinkanLokal = () => process.env.SINKRON_IZINKAN_LOKAL === '1';
