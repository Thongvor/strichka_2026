import { formatKyivTime } from './time.js';

export function setupDetails({
  dialog,
  artistEl,
  stageEl,
  timeEl,
  countryRow,
  countryEl,
  liveRow,
  starBtn,
  starLabel,
  festival,
  favorites,
}) {
  let currentPerf = null;

  function refreshStar() {
    if (!currentPerf) return;
    const on = favorites.has(currentPerf.id);
    starBtn.classList.toggle('details__star--on', on);
    starBtn.setAttribute('aria-pressed', String(on));
    starLabel.textContent = on ? 'Saved — want to listen' : 'Want to listen';
  }

  function open(perf) {
    currentPerf = perf;
    const stage = festival.stages.find((s) => s.id === perf.stageId);
    const day = festival.days.find((d) => d.id === perf.dayId);
    const start = new Date(perf.start);
    const end = new Date(perf.end);

    artistEl.textContent = perf.artist;
    stageEl.textContent = stage ? stage.name : perf.stageId;
    timeEl.textContent = `${day ? day.label : ''} · ${formatKyivTime(start)} – ${formatKyivTime(end)}`;

    if (perf.country) {
      countryEl.textContent = perf.country;
      countryRow.hidden = false;
    } else {
      countryRow.hidden = true;
    }

    liveRow.hidden = !perf.live;

    refreshStar();
    if (!dialog.open) dialog.showModal();
  }

  starBtn.addEventListener('click', () => {
    if (!currentPerf) return;
    favorites.toggle(currentPerf.id);
    refreshStar();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return { open };
}
