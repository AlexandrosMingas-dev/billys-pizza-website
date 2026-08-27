# Billy's Pizza — Ierapetra

Static website for **Billy's Pizza** at Theotokopoulou 5, Ierapetra, Crete. Visitors can read the menu in Greek or English, check hours, open the map, and tap to call.

The site is plain HTML5, CSS3, and vanilla JavaScript. There is no build step.

## Open it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 43123 --bind 0.0.0.0
```

Then visit billys-pizza.gr.

## Pages

- **Home** (`#home`) — hero slider, welcome, house favourites, hours and address
- **Menu** (`#menu`) — 30cm pizza, calzone, peinirli, baked breads, garlic and cheese breads
- **Visit** (`#visit`) — address, hours, phone, Facebook, map

Tap **EN / ΕΛ** in the header to switch language. The choice is stored in the browser. On small screens, the three-dot button opens the menu.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home, menu, and visit in one page |
| `styles.css` | Layout, colours, and typography |
| `script.js` | Language switch, page navigation, mobile drawer, slider |
| `photos/` | Logo and food photos |

Phone: **+30 28420 26074**. Evenings Monday–Saturday 18:00–23:30; Sunday, call to confirm.
