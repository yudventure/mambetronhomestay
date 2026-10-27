// Runs once when the server starts. Reads the calendars of the booking
// sites every 15 minutes while the app is awake. Pages that show or take
// bookings also ask for a fresh read, for hosts that put an idle app to sleep.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { sinkronSemua } = await import('./lib/sinkron');
  const jalan = () => {
    sinkronSemua().catch(() => {});
  };
  setTimeout(jalan, 20_000).unref?.();
  setInterval(jalan, 15 * 60_000).unref?.();
}
