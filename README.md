# Festival Schedule

Lightweight, mobile-first, data-driven festival timetable. Vanilla HTML + CSS + ES modules. Currently configured for **Strichka 2026** (16–17 May, Kyiv, 09:00–23:00 due to curfew).

## Run locally

ES modules need to be served over HTTP (not `file://`).

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Switch the active festival

Edit `src/config.js`:

```js
export const ACTIVE_FESTIVAL = 'strichka-2026';
```

Add a new festival by dropping a `data/<id>.json` and pointing `ACTIVE_FESTIVAL` at it.

## Data schema (`data/<id>.json`)

```json
{
  "id": "strichka-2026",
  "name": "Strichka 2026",
  "timezone": "Europe/Kyiv",
  "stages": [{ "id": "closer", "name": "Closer" }],
  "days":   [{ "id": "day1", "label": "Day 1 — Sat 16 May", "date": "2026-05-16", "startHour": 9, "endHour": 23 }],
  "performances": [
    {
      "id": "p-001",
      "artist": "Artist Name",
      "stageId": "closer",
      "dayId": "day1",
      "start": "2026-05-16T18:00:00+03:00",
      "end":   "2026-05-16T19:30:00+03:00",
      "bio":   "Optional short blurb."
    }
  ]
}
```

- `start` / `end` are full ISO strings with explicit offset (e.g. `+03:00` for Kyiv summer time). The grid uses Kyiv wall-clock time regardless of viewer timezone.
- `bio` is optional; omit it and the details sheet hides the field.
- `startHour` / `endHour` define the visible window for that day; for Strichka 2026 the festival window is 09:00–23:00.

## Deploy to GitHub Pages

1. Push `main` to GitHub.
2. Repo → **Settings → Pages** → *Source: Deploy from a branch* → branch `main`, folder `/ (root)`.
3. Wait for the action to finish. The site will be at `https://<your-handle>.github.io/<repo>/`.

## File layout

```
/
├── index.html
├── styles.css
├── src/
│   ├── main.js       boot: load data, mount UI, start now-loop
│   ├── config.js     active festival id
│   ├── data.js       fetch + validate festival JSON
│   ├── time.js       Kyiv-time helpers, grid math
│   ├── render.js     day tabs, grid, stage columns, blocks
│   ├── now.js        now-line, glow on currently-playing, "Now" chip
│   └── details.js    artist details dialog
└── data/
    └── strichka-2026.json
```
