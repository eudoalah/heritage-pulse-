# Heritage Pulse — Interactive Prototype

A clickable, browser-based prototype of the Heritage Pulse app, framed as iPhone 16 mockups. Pure HTML/CSS/JS — no build step, no backend, no npm install. Works as a static site, so it can be hosted directly on GitHub Pages.

**Live features (not just static images):**
- Full screen-to-screen navigation (login → permissions → home → monument → report → submitted, etc.)
- A **real interactive map** (Leaflet + OpenStreetMap) with real Porto coordinates for each monument — tap a pin to open that monument's page
- A **real camera feed** on the Scan screen (via `getUserMedia`) with an animated scanning overlay and simulated AI-match result
- A draggable before/after **reconstruction slider** ("time machine" view)
- A media carousel on the monument page (photos + video) with arrows and dots
- Working toggles, chip selectors, severity picker, character counter, and a missions bottom-sheet
- A second phone showing the **Authority Dashboard** with a live report feed

---
