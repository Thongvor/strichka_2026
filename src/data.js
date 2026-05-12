export async function loadFestival(id) {
  const url = `./data/${id}.json`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Could not fetch ${url}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Festival "${id}" not found at ${url} (HTTP ${res.status}).`);
  }
  const data = await res.json();
  validate(data);
  return data;
}

function validate(data) {
  const required = ['id', 'name', 'stages', 'days', 'performances'];
  for (const key of required) {
    if (!(key in data)) throw new Error(`Festival JSON is missing "${key}".`);
  }
  if (!Array.isArray(data.stages) || data.stages.length === 0) {
    throw new Error('Festival JSON has no stages.');
  }
  if (!Array.isArray(data.days) || data.days.length === 0) {
    throw new Error('Festival JSON has no days.');
  }
  if (!Array.isArray(data.performances)) {
    throw new Error('Festival JSON has no performances array.');
  }
  const stageIds = new Set(data.stages.map((s) => s.id));
  const dayIds = new Set(data.days.map((d) => d.id));
  for (const day of data.days) {
    if (Array.isArray(day.stages)) {
      for (const id of day.stages) {
        if (!stageIds.has(id)) {
          throw new Error(`Day "${day.id}" references unknown stage "${id}".`);
        }
      }
    }
  }
  for (const p of data.performances) {
    if (!stageIds.has(p.stageId)) {
      throw new Error(`Performance ${p.id} references unknown stage "${p.stageId}".`);
    }
    if (!dayIds.has(p.dayId)) {
      throw new Error(`Performance ${p.id} references unknown day "${p.dayId}".`);
    }
  }
}
