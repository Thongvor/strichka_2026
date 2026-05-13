import { nowInstant, minutesSinceDayStart, pxFromMinutes, kyivClockText } from './time.js';

const TICK_MS = 30_000;

export function startNowLoop({ festival, getActiveDay, viewport, chip }) {
  let intersectionObserver = null;
  let chipScrollTarget = null;
  let lastLineId = null;

  function attachChipObserver(line) {
    if (intersectionObserver) intersectionObserver.disconnect();
    if (!line) return;
    chipScrollTarget = line;
    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        chip.hidden = entry.isIntersecting || line.hidden;
      },
      { root: viewport, threshold: 0.01 },
    );
    intersectionObserver.observe(line);
  }

  function tick() {
    const now = nowInstant();

    const day = getActiveDay();
    const line = document.getElementById('now-line');
    const pill = document.getElementById('now-time');
    if (line && line !== lastLineId) {
      attachChipObserver(line);
      lastLineId = line;
    }

    document.querySelectorAll('.block--now, .block--past').forEach((el) => {
      el.classList.remove('block--now', 'block--past');
    });

    if (day) {
      for (const perf of festival.performances) {
        if (perf.dayId !== day.id) continue;
        const start = new Date(perf.start);
        const end = new Date(perf.end);
        const el = document.querySelector(`[data-performance-id="${perf.id}"]`);
        if (!el) continue;
        if (now >= end) el.classList.add('block--past');
        else if (now >= start) el.classList.add('block--now');
      }
    }

    if (!day || !line) {
      if (line) line.hidden = true;
      if (pill) pill.hidden = true;
      chip.hidden = true;
      return;
    }

    const minutes = minutesSinceDayStart(festival, day, now);
    if (minutes == null) {
      line.hidden = true;
      if (pill) pill.hidden = true;
      chip.hidden = true;
      return;
    }

    const y = pxFromMinutes(minutes);
    line.hidden = false;
    line.style.transform = `translateY(${y}px)`;
    if (pill) {
      pill.textContent = kyivClockText(now);
      pill.style.transform = `translateY(calc(${y}px - 50%))`;
      pill.hidden = false;
    }
  }

  chip.addEventListener('click', () => {
    if (chipScrollTarget) {
      chipScrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  tick();
  const id = setInterval(tick, TICK_MS);
  return {
    refresh: tick,
    stop: () => {
      clearInterval(id);
      if (intersectionObserver) intersectionObserver.disconnect();
    },
  };
}
