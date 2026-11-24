# Weight & Rings

A mobile-first conference companion for the ACM CHI 2027 Digital Experience Competition. [Open the live demo](https://qizix09-del.github.io/weight-and-rings-chi2027/#/today).

## Project overview and design philosophy

Weight & Rings helps attendees pace a conference day. Its terrace sculpture draws on Fallingwater’s stacked sandstone and cantilevers in western Pennsylvania. Each planned session adds a terrace. As the day fills, the gaps narrow. Adding a break opens space in the sculpture and lowers the load estimate.

The rings show how a session connects to earlier CHI work. When the day feels full, attendees can move a session to **Slow Shelf** and read the bundled preview later. **List** offers the same planning and reading tasks in a high-contrast, static interface.

## Run locally

Use Node.js 22.12 or later and npm. From the directory containing this README, run:

```sh
npm install && npm run dev
```

Open the address Vite prints. Use the production build to test offline behaviour:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4327
```

Open [Today](http://127.0.0.1:4327/#/today) or go directly to the [static schedule](http://127.0.0.1:4327/#/list). The service worker runs in the production build on HTTPS and localhost.

## Feature boundaries

| Area | Implemented in prototype | Simulated / mocked data |
| --- | --- | --- |
| Schedule and load | Switch between five separately saved days (May 10–14). Overlaps offer archiving or an atomic swap that saves every displaced session. Full days offer archiving. | The bundled 2027 CHI JSON includes 12 sample sessions. The same 12 example slots are available for planning each day. The five sample plans, times, rooms and load weights are illustrative. No live occupancy sensor or crowd feed is connected. |
| Terrace sculpture | Every scheduled session and break adds a selectable layer. Spacing and scale respond to the plan. | The model reflects the prototype’s load points. All room capacities in the sample JSON are unspecified. |
| Research rings | Select or rotate the 2023–2027 dial to read a linked record or the current session preview. | The static index curates real DOI-linked research from 2023–2026. The 2027 sessions and topical links are editorial demo content. |
| Offline Slow Shelf | Archive sessions, read bundled previews after one online visit, and restore or remove saved sessions. | Full papers open on their publishers’ sites and require internet access. |
| Solar Sky | Five daylight palettes follow the device’s local clock and can be previewed with a slider. | The palette times and gradients are designed presets. |
| Accessible List | High-contrast, static scheduling and reading, with keyboard controls and reduced-motion support. See the WCAG 2.1 AA checks below. | Uses the same sample programme and static link index. |
| Official programme reference | Open Schedule → Official programme reference to search contributions, expand authors, inspect room metadata and follow DOI links. The adapter reads schemeVersion: 7 and refreshes the selected edition once per minute while the reader is open. | CHI 2026 is the frozen historical feed. Sandbox is synthetic. The 2027 planning catalogue is bundled separately. |

## Demo walkthrough

| View | What you can do |
| --- | --- |
| Vessel | Use plus to add a session and the wave button to add a 15-minute break. Every plan item has one selectable clay terrace. Higher load packs the layers closer. A break adds a thin warm sandstone terrace and opens space around it. The stone core rises with the terraces, and the model scales to stay in view. Select a terrace to preview it, open Rings or remove it. |
| Rings | Drag the outer scale against the groove on the cedar cross-section, tap an engraved ring, or use a year button or arrow key to select 2023–2027. Read the authors, short takeaway and DOI of a linked publication. Read the current session preview at 2027. Save for later removes that session from today and opens Slow Shelf. |
| Pause | Choose Bear Run Pause, Allegheny Riverwalk or Sensory Landing. Each adds an individually removable break. |
| Saved | Read cached previews, reopen any linked year, restore a session to today, or remove it from the shelf. Three architectural miniatures combine familiar session objects with Pittsburgh landmarks. Year buttons correspond to linked records. |
| List | Switch between Today and Explore. Combine a type filter with a keyword search across titles, abstracts, rooms, times or types. The timeline shows actual sample session times and flexible breaks. Expand a row for planning actions or open its static reader with Rings. |

Today and Pause show the device’s local time. The sky changes at 05:30, 09:00, 11:30, 14:30 and 17:30. Evening continues through midnight to 05:29. Open the time capsule to preview a phase or drag the slider. Reset resumes local time. The static Schedule offers the same controls in Demo settings. Reset Demo Data restores Monday’s 68% load, all five initial plans and the two saved examples.

## Data and load calculation

| Item | What the demo contains |
| --- | --- |
| 2027 programme | Twelve authored examples, four of each type. Session titles, descriptions, rooms, times and load weights are sample data. The 2027 planner uses authored examples and illustrative load points. |
| Historical reading | Six distinct DOI-linked CHI or CHI Extended Abstracts publications from 2023–2026. Several demo sessions link to the same work. The 15-second takeaways are editorial summaries. A ring means a curated topical connection, not an author-verified citation chain. An empty year only describes this local collection. |
| Room capacity | All twelve sample entries have `roomCapacity: null`. The UI displays `ROOM CAP: UNSPECIFIED · CHI JSON`. Here “CHI JSON” is the prototype’s bundled programme schema. |
| Load and breaks | The weights are illustrative planning points. A break credits 12 points. Session additions cap the running total at 100 and the display has a floor of zero. A day at 95% or more offers archiving when another session is attempted. Breaks have durations and no assigned start times. |
| Place and daylight | Breaks are location-inspired suggestions. The Riverwalk walking time is illustrative. Five gradients follow the device clock. The app does not request location or fetch routes, weather or sunrise data. |

The complete schedule samples and publication metadata are in [chiSessions.json](src/data/chiSessions.json).

## Privacy and data protection

The app requires no login and sends no tracking events. It has no app backend, and all app assets are bundled locally. The current browser stores schedule entries, break IDs, saved IDs and the selected session in `localStorage` under `weight-and-rings.schedule.v4`. Existing single-day plans migrate to Monday. A shared Slow Shelf holds sessions from all days. The app collects no personal data. Tabs on the same origin receive storage updates. Search, filters and manual sky choices last for the current session or view. If storage is unavailable, a visible message explains that changes last for the visit.

After the first production load, the service worker caches the app shell, programme, publication takeaways and artwork. **OFFLINE READY** appears on Slow Shelf when a worker controls the page and plan storage is available. To check, wait for the badge, disconnect, refresh and open a saved session. Publisher pages behind DOI links require a connection and are subject to the publisher's access policy. Reset restores sample content. Clearing the browser’s site data removes both the plan and the offline cache.

Opening the official reference reader requests `version.json?t=<timestamp>` with `cache: no-store`. A changed revision triggers a fetch of the edition’s immutable `revision_url`. A successful parse replaces that edition’s offline snapshot in browser Cache Storage. Failed updates retain the last readable copy. The app sends no account credentials, referrer or schedule in these requests. First-time reference access needs internet. [Official programme protocol](https://chidigitalexperience.org/programme-data/)

## Keyboard walkthrough

1. On **Vessel**, Tab to “Preview Physical & Tangible Visualizations”. Enter or Space selects the terrace. Tab to **Explore rings** and press Enter.
2. Tab to **2024** and press Enter. Arrow Right moves to 2025, then 2026. Home and End jump to the first and last years. Tab to **Save for later** and press Enter.
3. On **Slow Shelf**, the saved card identifies its linked years. Tab to **List** in the dock and press Enter. With the initial plan, saving this paper reduces the load from 68% to 42%.
4. In **Explore**, type a keyword and use the arrow keys in the type filters. Enter on a card title expands its actions. **Rings** opens the plain-text preview, where the arrow keys select a research year. Esc dismisses the dialog and returns focus to its caller. If archiving removes the caller, focus returns to **Today** in the segmented switch.
5. **+ Break** opens a dialog with a place and duration. Choose a place and activate its duration button. Shift+Tab moves backwards throughout. Keyboard skip links at the start of the page reach List or the dock directly.

## Inclusion and accessibility checklist

The WCAG 2.1 AA checks covered keyboard operation, visible focus, dialog names and dismissal, state announcements, text contrast, reflow and reduced motion. The phone responds immediately to a change in the operating system’s reduced-motion preference. On an initial visit without an explicit route, that preference opens List. Water movement, sheet motion, transitions and drag feedback are suppressed. List stays static even with the system preference off. [WCAG 2.1](https://www.w3.org/TR/WCAG21/) · [W3C text-resizing criterion](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)

| Check | Observed in Chrome 158 on macOS |
| --- | --- |
| Keyboard only | Completed Vessel → Rings → Slow Shelf → List, including backwards navigation. Independently searched, filtered, scheduled, read, archived and managed breaks in List. Verified Esc and focus recovery when a planned row disappears. |
| Resizing | Checked all five views at actual browser zoom of 150% and 200%. Also checked 150% and 200% root text size at a 320 CSS-pixel viewport. Inspected horizontal overflow, collisions among year labels, title controls and dock labels, and access to the static reader. |
| Screen-reader semantics | Inspected the Chromium accessibility tree for landmark names, heading levels, the named modal, session-specific button names, selected years and labelled native radio groups. Audible VoiceOver and NVDA walkthroughs remain unverified. |
| Motion and status | List is static. `prefers-reduced-motion` suppresses app motion, including the water and sheet transitions. Load states expose a percentage and text label, with a warning symbol for a full day. A polite live region announces load changes. |
| Contrast and automatic rules | The stage 4 baseline with axe-core 4.10.3 returned zero violations under the WCAG 2/2.1 A and AA rule tags in ten tested states, including both session pickers/readers and the capacity dialog. For backgrounds the scanner could not fully evaluate, 355 foreground/background samples across the five skies had a lowest observed ratio of 4.81:1. These measurements cover the sampled text and states. |
| Offline | Reloaded the production static schedule offline and read a saved preview. The full-day dialog could be dismissed or used to archive while staying in List. |

For the current palette, the conservative lower bound for pine text on each full gradient is 9.11:1 at dawn, 8.88:1 in the morning, 9.52:1 at noon, 8.69:1 in the afternoon and 7.92:1 in the evening (rounded). This calculation uses the darker endpoint for each RGB channel independently. The evening phase starts at 17:30 and covers 20:45 and midnight.

To repeat the keyboard and resizing checks, start the production preview above. Install Python 3, the Python `playwright` package and Google Chrome, then run:

```sh
python3 tests/accessibility.py --url http://127.0.0.1:4327/
python3 tests/submission.py --url http://127.0.0.1:4327/
```

The test uses a temporary Chrome profile and changes zoom only in that profile.

## Deploy and share

Run `npm ci` followed by `npm run build` to build the locked production dependencies. Publish `dist/` over HTTPS. The same build supports a domain root and a project subdirectory because asset URLs are relative and app views use hash routes.

| Host | Repository setup | Demo path |
| --- | --- | --- |
| Vercel | Import the repository with the Vite preset. [vercel.json](vercel.json) specifies the install command, build command, output directory and `/today` rewrite. | `https://<project>.vercel.app/#/today` |
| GitHub Pages | In **Settings → Pages**, set **Source** to **GitHub Actions**. [The Pages workflow](.github/workflows/pages.yml) builds and deploys on pushes to `main` and supports manual runs. | `https://<owner>.github.io/<repo>/#/today` |

Use the [512 × 512 application PNG](https://qizix09-del.github.io/weight-and-rings-chi2027/assets/app-icon.png) for the entry form. The [editable SVG](public/assets/app-icon.svg) and [favicon](public/favicon.svg) ship alongside it.

## Attribution and independence

Programme data © ACM CHI 2027, licensed under CC BY-NC-SA 4.0. Historical reference data and its cached transformations retain this licence. The 2027 planner contains authored examples. [Competition data licence](https://chidigitalexperience.org/data/LICENCE)

Independent student prototype inspired by Western Pennsylvania cantilevered architecture; not affiliated with any landmark or foundation.

Slow Shelf miniatures pair a paper figure with the Three Sisters suspension bridges, a workshop table with crossed steel trusses, and a poster display with a curved Phipps glasshouse roof.

## Architectural reference

The [terrace sculpture](src/components/TerraceVessel.tsx) combines the project’s original clay-style architectural render layers with dynamic SVG positioning. Masonry, windows, creek and trees share one view box. Each selectable cantilever represents a plan item.

## License

The project software and documentation are released under the [MIT License](LICENSE). Dependencies retain their own license notices. The cited research papers remain available under their respective publishers’ terms.
