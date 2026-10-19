# Billy's Pizza — Ierapetra

Static website for **Billy's Pizza** at Theotokopoulou 5, Ierapetra, Crete. Visitors can read the menu in Greek or English, see whether the shop is open right now, order through Wolt, open the map, and tap to call.

The site is plain HTML5, CSS3, and vanilla JavaScript. There is no build step.

## Open it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 43123 --bind 0.0.0.0
```

Then visit https://billys-pizza.gr/#home.

## Pages

- **Home** (`#home`) — full-bleed photo slider, live open/closed state, welcome, the favourites reel
- **Menu** (`#menu`) — 30cm pizza, calzone, peinirli, baked breads, garlic and cheese breads, salads, drinks
- **Visit** (`#visit`) — address, hours, phone, Facebook, map

Tap **EN / ΕΛ** in the header to switch language. The choice is stored in the browser. On small screens, the three-dot button opens the menu. **Παραγγείλτε τώρα / Order now** links out to the [Wolt shop](https://wolt.com/el/grc/ierapetra/restaurant/billy-s-pizza).

## How the home page moves

- **The open sign.** The line under the name is worked out from the clock in `Europe/Athens`, not the visitor's own timezone, so it stays right for someone checking from abroad. It re-checks every minute. Change the hours in one place: `OPEN_MIN` and `CLOSE_MIN` at the top of `script.js`.
- **The hero slider.** The three slides from the live site — margarita, turkey, hamburger, with their own captions, the `Ιεράπετρα, Κρήτη` label and its three buttons (gold / outline / ghost, uppercase and tracked, exactly as the live stylesheet draws them) — rebuilt full-bleed and centred, on a four-second timer. Slides cross-fade behind the logo; a gradient holds the dark floor and the reading edge. Arrows ride the left and right edges and fade in on hover (always visible on touch); dots sit under the buttons. The timer stops on keyboard focus or a hidden tab, but **not** on hover — the hero fills the screen, so a pointer resting anywhere in it would otherwise halt the slider for good. The interval is one number at the top of `initHeroSlider` in `script.js`.
- **The page foot.** `photos/oven-fire.jpg` is a single background for everything below the welcome band — the reel and the closing facts both sit on it. Sticky at viewport height so it holds still across the reel's three screens of scroll rather than being stretched over them, at 20% under a flat scrim.
- **The reel.** One pizza at a time, each drawing a leader line out to its name and price. It advances only on its arrows (or by clicking a tick) — never on scroll position, so you can look at a pizza without the page taking it away.
- Everything above is switched off under `prefers-reduced-motion`, where the reel becomes an ordinary list.

## Photos

Food photographs live in `photos/menu/` as circular WebP cut-outs with a transparent background, so they sit on the dark page without a grey box behind them. They were cut from the venue's Wolt listing originals, which are kept locally rather than in the repo (`photos/wolt menu/`, gitignored).

Menu rows carry a small rounded-square thumbnail from `photos/menu/thumbs/`, named `<category>-<number>.webp` to match the row it sits on.

**Items with no photograph get an empty slot** — a dashed outline in the list. Nothing stands in for them. Do not substitute a stock or generated image — add the real one and swap the placeholder for an `<img>`.

### The menu's vegetable rails

The menu page runs vegetables down both gutters, echoing the printed menu. `photos/veg/` holds both the supplied originals and the cut-outs the page uses:

| Original | Cut-out used by the page |
| --- | --- |
| `2-tomatoes.webp` (on white) | `tomatoes.webp` |
| `basil.avif` (checkerboard baked in) | `basil.webp` |
| `cheese.jpg` (on white) | `cheese.webp` |
| `garlic.avif` (checkerboard baked in) | `garlic.webp` |

None of the originals carried an alpha channel — two sat on white, two had a
transparency checkerboard baked in as real pixels. The cut-outs were made by
flooding the backdrop inwards from the border rather than thresholding the
whole image, which is what keeps the garlic: it is pale enough that a global
threshold removes it along with the background.

The rails sit **inside** the price column's own positioning context, hugging it
from outside via `right: 100%` / `left: 100%`, so they need no viewport
arithmetic. They scroll with the page, start below the category line and end
with the list, above the footer. Each image is displayed at or below its own
pixel width so nothing is upscaled.

Any of those files that is missing removes itself at load (`[data-veg]` in
`script.js`), so the page never shows a broken image — the rails simply stay
empty until the cut-outs exist. The rails are hidden below 68rem, where there
is no gutter to put them in.

A note for whoever maintains this: Wolt's listing carries photographs for most items, but only six are Billy's own shoot (pizza on the round wooden peel, light grey seamless). The rest are stock pictures of someone else's food, several stamped *Ενδεικτική εικόνα* — "indicative image". They are deliberately not used here.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home, menu, and visit in one page |
| `styles.css` | Layout, colours, and typography |
| `script.js` | Language switch, page navigation, mobile drawer, open sign, reel |
| `photos/menu/` | Circular cut-outs used on the page |
| `photos/oven-fire.jpg` | The wood-fired oven, behind the foot of the home page |
| `photos/image.png` | The map background on the visit page |
| `photos/veg/` | Vegetable cut-outs for the menu rails (see below) |

Phone: **+30 28420 26074**. Evenings Monday–Friday 18:30–23:30; closed Saturday and Sunday.
