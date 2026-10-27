// node --test lib/*.test.mjs  (npm run uji)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bacaIcal, buatIcal, rangkai } from './ical.mjs';

const kal = (...isi) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...isi, 'END:VCALENDAR'].join('\r\n');

test('Booking.com style all-day block', () => {
  const a = bacaIcal(kal('BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261102', 'DTEND;VALUE=DATE:20261104', 'UID:abc@booking.com', 'SUMMARY:CLOSED - Not available', 'END:VEVENT'));
  assert.deepEqual(a, [{ uid: 'abc@booking.com', mulai: '2026-11-02', selesai: '2026-11-04', ringkas: 'CLOSED - Not available' }]);
});

test('folded lines, LF endings and escaped text', () => {
  const t = 'BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:20261201\nDTEND;VALUE=DATE:2026\n 1205\nSUMMARY:Reserved\\, Airbnb\nUID:1418fb94e984-ab\n cd@airbnb.com\nEND:VEVENT\nEND:VCALENDAR\n';
  assert.deepEqual(bacaIcal(t), [{ uid: '1418fb94e984-abcd@airbnb.com', mulai: '2026-12-01', selesai: '2026-12-05', ringkas: 'Reserved, Airbnb' }]);
});

test('UTC time is read in the site time zone', () => {
  // 20:00 UTC on 1 Nov is 05:00 on 2 Nov in Raja Ampat
  const [a] = bacaIcal(kal('BEGIN:VEVENT', 'DTSTART:20261101T200000Z', 'DTEND:20261103T020000Z', 'END:VEVENT'));
  assert.equal(a.mulai, '2026-11-02');
  assert.equal(a.selesai, '2026-11-03');
});

test('local time with TZID keeps its date', () => {
  const [a] = bacaIcal(kal('BEGIN:VEVENT', 'DTSTART;TZID=Asia/Jakarta:20261110T140000', 'DTEND;TZID=Asia/Jakarta:20261112T120000', 'END:VEVENT'));
  assert.deepEqual([a.mulai, a.selesai], ['2026-11-10', '2026-11-12']);
});

test('cancelled events are skipped, a missing end covers one night', () => {
  const a = bacaIcal(kal(
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261102', 'DTEND;VALUE=DATE:20261104', 'STATUS:CANCELLED', 'END:VEVENT',
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261107', 'END:VEVENT',
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261109', 'DTEND;VALUE=DATE:20261109', 'END:VEVENT',
  ));
  assert.deepEqual(a.map((x) => [x.mulai, x.selesai]), [['2026-11-07', '2026-11-08'], ['2026-11-09', '2026-11-10']]);
});

test('a page that is not a calendar is refused', () => {
  assert.throws(() => bacaIcal('<!doctype html><title>Login</title>'), /bukan-ical/);
  assert.deepEqual(bacaIcal(kal()), []);
});

test('nights are joined into stays', () => {
  assert.deepEqual(rangkai(['2026-11-05', '2026-11-02', '2026-11-03', '2026-11-03', '2026-11-30', '2026-12-01']), [
    { mulai: '2026-11-02', selesai: '2026-11-04' },
    { mulai: '2026-11-05', selesai: '2026-11-06' },
    { mulai: '2026-11-30', selesai: '2026-12-02' },
  ]);
  assert.deepEqual(rangkai([]), []);
});

test('written calendar reads back and keeps lines short', () => {
  const nama = 'Mambetron Homestay, Pondok Tepi Pantai unit 3; tautan untuk agen perjalanan yang panjang sekali';
  const t = buatIcal({ nama, prodid: '-//Mambetron//Kalender//ID', cap: new Date('2026-10-27T00:00:00Z'), acara: [
    { uid: '5-2026-11-02@mambetronhomestay.com', mulai: '2026-11-02', selesai: '2026-11-04', ringkas: 'Tidak tersedia' },
  ] });
  assert.match(t, /^BEGIN:VCALENDAR\r\n/);
  assert.match(t, /DTSTART;VALUE=DATE:20261102\r\n/);
  assert.match(t, /DTSTAMP:20261027T000000Z\r\n/);
  for (const b of t.split('\r\n')) assert.ok(new TextEncoder().encode(b).length <= 75, b);
  assert.deepEqual(bacaIcal(t), [{ uid: '5-2026-11-02@mambetronhomestay.com', mulai: '2026-11-02', selesai: '2026-11-04', ringkas: 'Tidak tersedia' }]);
  assert.match(t.replace(/\r\n /g, ''), /X-WR-CALNAME:Mambetron Homestay\\, Pondok Tepi Pantai unit 3\\; tautan/);
});
