# WalkAbout website: context for Claude Code

## The project
WalkAbout is an AI-powered indoor navigation platform for complex, multi-level, multi-building environments
(campuses first, then hospitals; later transit, airports, malls). It guides people from the street to the exact room
on one continuous route, with routes tailored to how they move (step-free, stroller-friendly, cart/luggage,
fewest level changes, fastest; profiles combine). Accessibility for people with disabilities, older adults and
caregivers is the core mission.

Key differentiators to keep front and center in copy:
- **Street to room:** one set of directions across outdoor, entrances, buildings and levels; no app-switching at the door.
- **Section views:** at every level change, an architectural section drawing shows which elevator, ramp or stair to take.
- **Routes for who you are:** combinable traveler profiles, plus live conditions (elevator outages, closures, user-reported barriers).

Technical pipeline (Technology page): DWG/PDF plans in (images/photos later) → AI extraction of walls, doors,
stairs, elevators, ramps → 3D model (built in Rhino) → navigable graph with accessibility attributes, georeferenced →
A*/Dijkstra routing with weighted constraints → auto-generated route sections → smartphone positioning
(barometer, IMU, step tracking, map matching). The same map can serve service robots and drones.

Team: architects and urbanists at MIT and Harvard. Pilot: MIT campus (example route: Sloan E52 → 3rd-floor bridge → E51).
Pitching at the MIT IDEAS Social Innovation Challenge. Customers are venue operators (annual per-campus subscription);
users are everyone, especially people for whom the shortest route isn't usable.
There is **no working demo yet**: the site uses GIFs/videos of the intended vision, labeled as concept visualizations.

## The site
- Static HTML/CSS/JS, no build step, published with **GitHub Pages** from `main` / root (`.nojekyll` present).
- Structure modeled on **waymo.com**: video-led hero, "real situations" clip strip, "where we're mapping"
  (Piloting now / Up next), voices, technology teaser, "why we're here" stats, mission, recurring CTA.
- Pages built: `index.html` (Home), `navigate.html` (traveler experience: the demo film `assets/media/walkabout-demo.mp4`
  (720p copy on phones) fills the first screen and plays once with Pause/Play/Replay and Skip buttons. Page scroll is
  locked while it plays (`html.is-locked`); Pause, Skip, the end, an error, a 3 s stall or a safety timer release it.
  A scroll cue shows when it ends; then the caption
  "From Street to Room, for everybody" rises over it on scroll, then features, building check; the FAQ was removed),
  `technology.html` (two tabs: "The technology" pipeline and "How it works" demo film; `#how-it-works` opens the second).
  The headline (`.tech-stage`) pins, then the tabs and the first section slide up over it (no intro film or stage links).
  Beside the headline, `.navani` (9 s loop): the plan tilts into an axonometric 3D view as 24 stacked wall layers rise
  (CSS 3D), then a dot pulses and the blue route draws (SMIL) to a destination ring, holds, fades, and the plan settles back.
  Reduced motion: a still plan with the finished route.
  How it works: the four steps were replaced by the team's portrait concept demo `assets/media/walkabout-how-it-works.mp4`
  (720x1280, ~73 s, no sound; AR guidance to Room 516, Gund Hall; plays from 10 s to skip most of the floor scan) in a phone-shaped frame beside a short intro (`.hiw`).
  It loops only while on screen (`.clip__video`), with a Pause/Play button; reduced motion: no autoplay.
  The six pipeline steps are one pinned SVG drawing that evolves with scroll (`.scrolly`: plan → rooms → network →
  routes → section → blue dot). Layers use `data-draw` / `data-in` / `data-out` / `data-dim` = step number; logic in
  `main.js`. Phones and reduced motion get a plain list beside a still of step 4.
  After the pipeline (inside the "The technology" tab, one `.pin-scope`): "Under the hood" pins → the roadmap slides over
  it → "Bring WalkAbout to your campus" slides over the roadmap. Roadmap (`.roadmap`): a blue route winds up across the
  full page width (smooth curve, peaks and valleys); while it pins, scrolling moves a dot along it and each milestone lights up as it passes. Milestones are broad phases (Now: pilot on one campus;
  Then: build it with the community; Next: more campuses and hospitals; Later: wherever people need to arrive).
  Pinning needs ≥901px wide and ≥720px tall; otherwise, and with reduced motion, the full route shows (list on phones).
  The robots section was removed. Each tab ends with its own "Bring WalkAbout to your campus" section.
  `accessibility.html`: every section from the heading to "What we build from it" chains the same transition:
  each pins (`.pin-hold`, tall ones `.pin-hold--tall` stick by their bottom edge), a `.pin-gap` spacer holds it,
  and the next `.cover-up` slides over through a white fade, all inside one `.pin-scope`. A justified word wall (page column
  width, sized by voices.js so the whole section fits one screen on desktop) of 30 real survey answers (Nov 2026 questionnaire; never show how many people answered: no totals,
  no respondent IDs), no category labels, sized by weight or %, shuffled with a fixed seed;
  hover/focus shows the full answer in a card beside the word with a blue tick burst; filter by
  traveler type (first, carry, care, mobility, older). Data and logic live in `assets/js/voices.js` (only that page).
  Wall text is light grey with a wide size range; percentages appear only in the hover card.
  Motion: when the wall scrolls into view each voice surfaces from below as an outline and fills in (staggered,
  then a slight bob); no background text layer (removed as too busy); a cursor/focus/tap
  spotlight (`--near`) darkens nearby phrases. Reduced motion: no surfacing or bob; spotlight stays.
  Then "Where it breaks": six survey findings in a horizontal slider (`.findings__track`, native scroll-snap;
  main.js adds arrows, dots, counter, arrow keys and mouse drag): 87% unfamiliar building last month, 60% handoffs,
  63% lost 5+ min, 59% asked someone, 40% hospitals, 83% would use it. Then "The standards" (same layout as the opening: hero-size headline and one line on the left; compact
  lists on the right, "The code covers" in grey above "It leaves you to work out" in black), and "What we build from it":
  vertical tabs, "What people want" (needs, no numbers) on the left; choosing one grows the matching feature on the right. Below the wall: big blue numbers, short text, only what matters. Every answer comes from the
  team's report; never add invented responses. Never mention the survey's language or location on the site.
- Nav: Navigate, Technology, Accessibility, About (Venues was removed at the team's request).
  `about.html`: same pinned slide-over transitions as Accessibility: opening statement → "Why we're here" (three
  sourced stats: CDC disability share, Census 65+, our survey's 59% asked a stranger) → "Who we are" (architects and
  urbanists at MIT and Harvard: hero-size headline and one line, nothing on the right). No team section (removed at the team's request).
- Header and footer are duplicated in each HTML file: change all three when editing navigation.
  No Menu button: nav tabs sit top right (Waymo style) and become a scrollable row under the logo on phones.

## Design rules (keep consistent)
- Black and white, concise and clean. Palette in `assets/css/style.css` `:root`: ink `#0B0B0B`, paper `#FFFFFF`,
  greys for secondary text and hairlines. Access blue `#1D4ED8` is the one bright accent (buttons, links, active tab,
  walking routes). Signal yellow `#F5B700` survives only as a small level-change marker.
- Typeface: Futura PT (Adobe Fonts; kit link still to be added in each page `<head>`), with Jost from Google Fonts
  as the free stand-in.
  Slightly open letter spacing (`--track`). The header logo is the word "WalkAbout" only, no mark.
- Home hero is an animated SVG section drawing of the route (street → step-free entrance → elevator to level 3 →
  bridge → room). It draws once on load; respects `prefers-reduced-motion`.
- Numbered markers only for real sequences (How it works, pipeline, roadmap).
- Accessibility is non-negotiable: skip link, visible focus, semantic landmarks, alt text / aria-labels on media,
  captions on any narrated video, reduced-motion support, WCAG AA contrast.

- Asset links carry a version tag (`?v=...`) on all pages; bump it whenever CSS/JS changes so browsers don't serve stale files.

## Placeholders
- Text placeholders: `<span class="ph">[...]</span>` (yellow highlight). Replace the text and remove the span.
- Media slots: `<figure class="media" data-ph="...">`. Put `<video autoplay muted loop playsinline poster=... aria-label=...>`
  or `<img alt=...>` inside. Suggested filenames in `assets/media/README.md`. Keep clips small (720p H.264, a few MB).
- `[team@email]` in mailto links still needs the real address.
- Waitlist / "Is my building mapped?" forms are front-end only. Connect a form service (Formspree, Google Forms) at
  the `TODO` in `assets/js/main.js`; the `MAPPED` array there lists venues that return "being mapped".

## Next likely tasks
Fill in copy and media; wire the waitlist form;
add favicon and social preview image; optional custom domain.
