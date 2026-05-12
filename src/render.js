import { HOUR_PX, pxFromMinutes, formatKyivTime } from './time.js';

export function renderDayTabs(host, festival, activeDayId, onChange) {
  host.innerHTML = '';
  for (const day of festival.days) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'daytab';
    btn.role = 'tab';
    btn.textContent = day.label;
    btn.dataset.dayId = day.id;
    btn.setAttribute('aria-selected', String(day.id === activeDayId));
    btn.addEventListener('click', () => onChange(day.id));
    host.appendChild(btn);
  }
}

export function renderGrid(host, festival, dayId, { onBlockClick, favorites }) {
  const day = festival.days.find((d) => d.id === dayId);
  if (!day) {
    host.innerHTML = '';
    return;
  }
  const hours = day.endHour - day.startHour;
  const bodyHeight = hours * HOUR_PX;
  const dayStages = resolveDayStages(festival, day);

  host.innerHTML = '';
  host.style.setProperty('--body-height', `${bodyHeight}px`);
  host.style.setProperty('--stage-count', String(dayStages.length));

  host.appendChild(buildCorner());
  for (const stage of dayStages) {
    host.appendChild(buildStageHeader(stage));
  }
  host.appendChild(buildTimeCol(day));

  const perfsByStage = groupBy(
    festival.performances.filter((p) => p.dayId === dayId),
    (p) => p.stageId,
  );
  for (const stage of dayStages) {
    host.appendChild(
      buildStageCol(stage, day, perfsByStage.get(stage.id) || [], onBlockClick, favorites),
    );
  }

  host.appendChild(buildNowLine());
}

function resolveDayStages(festival, day) {
  const ids = Array.isArray(day.stages) && day.stages.length
    ? day.stages
    : festival.stages.map((s) => s.id);
  const byId = new Map(festival.stages.map((s) => [s.id, s]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

function buildCorner() {
  const el = document.createElement('div');
  el.className = 'grid__corner';
  return el;
}

function buildStageHeader(stage) {
  const el = document.createElement('div');
  el.className = 'grid__stage-header';
  el.textContent = stage.name;
  el.dataset.stageId = stage.id;
  return el;
}

function buildTimeCol(day) {
  const col = document.createElement('div');
  col.className = 'grid__time-col';
  for (let h = day.startHour; h <= day.endHour; h++) {
    const tick = document.createElement('div');
    tick.className = 'time-tick';
    tick.style.top = `${(h - day.startHour) * HOUR_PX}px`;
    tick.textContent = `${String(h).padStart(2, '0')}:00`;
    col.appendChild(tick);
  }
  return col;
}

function buildStageCol(stage, day, perfs, onBlockClick, favorites) {
  const col = document.createElement('div');
  col.className = 'grid__stage-col';
  col.dataset.stageId = stage.id;

  for (let h = day.startHour; h <= day.endHour; h++) {
    const line = document.createElement('div');
    line.className = 'hour-line';
    line.style.top = `${(h - day.startHour) * HOUR_PX}px`;
    col.appendChild(line);
  }

  for (const perf of perfs) {
    col.appendChild(buildBlock(perf, day, onBlockClick, favorites));
  }
  return col;
}

function buildBlock(perf, day, onBlockClick, favorites) {
  const start = new Date(perf.start);
  const end = new Date(perf.end);
  const dayStartMin = day.startHour * 60;

  const startMinFromMidnight = startMinutesInKyiv(start);
  const endMinFromMidnight = startMinutesInKyiv(end);

  const top = pxFromMinutes(startMinFromMidnight - dayStartMin);
  const height = Math.max(24, pxFromMinutes(endMinFromMidnight - startMinFromMidnight));

  const block = document.createElement('button');
  block.type = 'button';
  block.className = 'block';
  if (favorites?.has(perf.id)) block.classList.add('block--starred');
  block.style.top = `${top}px`;
  block.style.height = `${height}px`;
  block.dataset.performanceId = perf.id;

  const head = document.createElement('div');
  head.className = 'block__head';
  const name = document.createElement('div');
  name.className = 'block__name';
  name.textContent = perf.artist;
  head.appendChild(name);
  const star = document.createElement('span');
  star.className = 'block__star';
  star.textContent = '★';
  star.setAttribute('aria-hidden', 'true');
  head.appendChild(star);
  block.appendChild(head);

  if (perf.live || perf.country) {
    const tags = document.createElement('div');
    tags.className = 'block__tags';
    if (perf.live) {
      const live = document.createElement('span');
      live.className = 'block__tag block__tag--live';
      live.textContent = 'LIVE';
      tags.appendChild(live);
    }
    if (perf.country) {
      const country = document.createElement('span');
      country.className = 'block__tag block__tag--country';
      country.textContent = perf.country;
      tags.appendChild(country);
    }
    block.appendChild(tags);
  }

  const time = document.createElement('div');
  time.className = 'block__time';
  time.textContent = `${formatKyivTime(start)} – ${formatKyivTime(end)}`;
  block.appendChild(time);

  block.addEventListener('click', () => onBlockClick(perf));
  return block;
}

function startMinutesInKyiv(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour').value);
  const m = Number(parts.find((p) => p.type === 'minute').value);
  return h * 60 + m;
}

function buildNowLine() {
  const line = document.createElement('div');
  line.className = 'now-line';
  line.id = 'now-line';
  line.hidden = true;
  const dot = document.createElement('span');
  dot.className = 'now-line__dot';
  line.appendChild(dot);
  return line;
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}
