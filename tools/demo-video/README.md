# Demo film source

`demo.html` is the whole 18.4 s film: canvas 2D for the phone UI and text, three.js for the white model and the AR corridor.
Every frame is a pure function of time (`renderFrame(t)`), so it renders the same way every time.

- Watch it live: open `demo.html?play` in Chrome. Jump to a moment: `demo.html?t=8.6`.
- Timings: the `T` object at the top of the script. Copy (origin, destination, labels, captions) is inline. Search for the text.
- Render: `npm i puppeteer-core ffmpeg-static` somewhere outside the site, then
  `NODE_PATH=<that>/node_modules node render.js`. This writes `assets/media/walkabout-demo.mp4` (1080p),
  `walkabout-demo-720p.mp4`, `walkabout-demo.gif` (800 px, 15 fps) and `walkabout-demo.jpg` (poster).
  `node render.js --stills 3,8.6` saves only review PNGs.

Scenes: "Where to?" → phone: type origin and destination (Fastest is the default profile), Start route → zoom into the route card →
rotating white model. The Fastest route draws first: main entrance with 4 steps, then stairs to Level 3 (5 min, arrive 9:46).
Then "Stroller" is tapped in the profile bar: the stairs route fades to grey and a new route draws along the sidewalk, up the 1:12 ramp,
through the side door and elevator (yellow level marker), across the 3rd-floor bridge to E51 Room 345 (6 min, arrive 9:47) →
white dissolve → AR on the phone in a corridor (focus blur on the world, ETA, section view card) → "WalkAbout" end card.
It keeps a "Concept visualization" label in the corner, because there is no working demo yet.
