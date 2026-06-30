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

## 1. Run it locally (optional, before pushing)

You don't need Node or any build tool. Any static file server works:

```bash
cd heritage-pulse
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or just double-click `index.html` — almost everything works directly from the filesystem, **except** the camera (browsers block camera access on `file://` for security — it'll show the "Enable camera" fallback, which is fine for local testing, but works correctly once hosted over `https://`).

---

## 2. Host it on GitHub Pages (this is the "app via a link" part)

### Step A — Create the repo
1. Go to [github.com/new](https://github.com/new)
2. Name it whatever you like, e.g. `heritage-pulse-prototype`
3. Keep it **Public** (required for free GitHub Pages)
4. Don't initialize with a README (we already have one) — or do, and just overwrite it

### Step B — Push your code
From inside the `heritage-pulse` folder:

```bash
cd heritage-pulse
git init
git add .
git commit -m "Heritage Pulse interactive prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step C — Turn on GitHub Pages
1. In your repo on GitHub, go to **Settings → Pages**
2. Under "Build and deployment" → **Source**, choose **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**
4. Wait ~1 minute. GitHub will show your live URL at the top of that Pages settings screen:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```
5. Open that link — your prototype is now live, on a real `https://` URL (important: this is what makes the camera work, since `getUserMedia` requires a secure context).

That's it — no build pipeline, no GitHub Actions needed, because this is a plain static site.

### Updating it later
Any time you make changes:
```bash
git add .
git commit -m "Update screens"
git push
```
GitHub Pages redeploys automatically within a minute or so.

---

## 3. Demoing it

- Use the **demo controls** strip above the phones on the page to jump straight to Offline Mode or the camera scan.
- On mobile (open the GitHub Pages link on your phone), the camera button will request real camera permission and show your actual live feed with the scanning animation — good for the "how do we demo it adapts" question, since you can show it live in front of people rather than faking it.
- The map is fully real — pinch/zoom/drag works, and tapping a pin on Torre dos Clérigos or Igreja do Carmo navigates into that monument's detail page.
- Light/noise-adaptive behavior: true ambient light/microphone-based UI switching needs native device APIs that browsers restrict for privacy (no raw light sensor or live decibel API in standard web browsers). The Permissions and Settings screens show these as toggles to communicate the *intent* of the feature; for a live demo of the adaptive behavior itself, the cleanest approach is a manual toggle/slider in a future build, or doing it in a native (Swift/Kotlin) build down the line.

---

## File structure

```
heritage-pulse/
├── index.html          ← everything lives here (all screens, both phones)
├── css/
│   ├── styles.css       ← design tokens, iPhone frame, shared components
│   └── screens.css      ← per-screen styles
├── js/
│   └── app.js            ← router, map, camera, all interactions
└── README.md
```

No dependencies are installed locally — Leaflet (map) and Google Fonts are loaded from a CDN via `<link>`/`<script>` tags in `index.html`, so an internet connection is needed when viewing (same as any normal website).
