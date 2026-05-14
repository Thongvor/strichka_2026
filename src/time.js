export const HOUR_PX = 76;

const KYIV_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Kyiv',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

const PERF_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
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

export function setNowSource(fn) {
  nowSource = fn || (() => new Date());
}

export function nowInstant() {
  return nowSource();
}

export function kyivClockText(date = nowInstant()) {
  return KYIV_FORMATTER.format(date);
}

export function formatKyivTime(date) {
  return PERF_TIME_FORMATTER.format(date);
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
