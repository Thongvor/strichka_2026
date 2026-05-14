export const HOUR_PX = 96;

const KYIV_HHMM = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Kyiv',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

let nowSource = () => new Date();

const debugNow = new URLSearchParams(window.location.search).get('now');
if (debugNow) {
  let normalized = debugNow.replace(/ /g, '+');
  if (!/Z$|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized += '+03:00';
  const fixed = new Date(normalized);
  if (!isNaN(fixed.valueOf())) nowSource = () => fixed;
}

export function nowInstant() {
  return nowSource();
}

export function kyivClockText(date = nowInstant()) {
  return KYIV_HHMM.format(date);
}

export function formatKyivTime(date) {
  return KYIV_HHMM.format(date);
}

export function kyivHourMinute(date) {
  const parts = KYIV_HHMM.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  return { hour, minute };
}

function offsetFromIso(iso) {
  const m = iso.match(/(Z|[+-]\d{2}:\d{2})$/);
  if (!m) return '+00:00';
  return m[1] === 'Z' ? '+00:00' : m[1];
}

function dayOffset(festival, day) {
  const perf = festival.performances.find((p) => p.dayId === day.id);
  return perf ? offsetFromIso(perf.start) : '+03:00';
}

export function dayStartInstant(festival, day) {
  const hh = String(day.startHour).padStart(2, '0');
  return new Date(`${day.date}T${hh}:00:00${dayOffset(festival, day)}`);
}

export function dayEndInstant(festival, day) {
  const hh = String(day.endHour).padStart(2, '0');
  return new Date(`${day.date}T${hh}:00:00${dayOffset(festival, day)}`);
}

export function minutesSinceDayStart(festival, day, instant) {
  const start = dayStartInstant(festival, day);
  const end = dayEndInstant(festival, day);
  if (instant < start || instant > end) return null;
  return (instant - start) / 60_000;
}

export function pxFromMinutes(minutes) {
  return (minutes / 60) * HOUR_PX;
}
