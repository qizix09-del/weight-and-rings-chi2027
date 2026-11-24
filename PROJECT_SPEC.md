# Weight & Rings — prototype design

## Conference planning

The prototype covers five separately saved days, May 10–14, 2027. Monday starts with three sessions and a load of 68%. The same twelve sample sessions are available on each day. Load is a pacing estimate based on the selected sessions. A break credits 12 points. When two sessions overlap, the attendee can save the new one for later or swap it into the day and keep the displaced sessions on the shared Slow Shelf. At 95% load or above, adding another session offers the option to save it for later.

## Five views

| View | Interaction |
| --- | --- |
| Today (Vessel) | Each session or break adds one selectable cantilever. The stone core grows upward, the model scales to fit, and breaks open a gap between floors. Select a floor to inspect or remove its entry. |
| Rings | Turn the scale around a top-down cedar cross-section or use the five year buttons. The 2023–2026 rings open curated links to earlier research. The 2027 ring opens the sample session preview. |
| Pause | Bear Run Pause and Allegheny Riverwalk add 15 minutes. Sensory Landing adds 20 minutes. |
| Saved (Slow Shelf) | Read saved previews and restore sessions. A paper carries a gold suspension-bridge figure, a workshop table has crossed steel supports, and a poster stand has a glasshouse roof. |
| List (Schedule) | Two segments show the selected day and the searchable catalogue. Sessions, breaks, summaries and saving are keyboard-accessible in this static view. |

## Appearance and data

The mobile canvas has a maximum width of 430 px. Layered clay-style artwork and SVG form the terrace miniature. CSS controls motion. The List view stays still, and the other views respect the device’s reduced-motion preference.

Solar Sky follows the device’s local clock. Dawn begins at 05:30, Morning at 09:00, Noon at 11:30, Afternoon at 14:30 and Dusk at 17:30. Dusk continues through midnight. The time control previews the five palettes and resets to local time.

The app stores plans and saved items in the browser. A production service worker caches the app and bundled previews for offline use. The twelve 2027 sessions are authored examples. The official CHI 2026 and synthetic Sandbox datasets can be opened separately in Schedule. [Data sources, accessibility checks and offline behaviour](README.md#feature-boundaries)
