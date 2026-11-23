# WalkAbout website (draft)

A static three-page site: **Home** (`index.html`), **Navigate** (`navigate.html`) and **Technology** (`technology.html`).
No build step and no dependencies: plain HTML, CSS and JavaScript, ready for GitHub Pages.

```
index.html          Home: section-drawing hero, scenarios, pillars, where we're mapping, mission
navigate.html       Traveler experience: how it works, route profiles, availability check
technology.html     The pipeline: plans → 3D → network → route → section → positioning
assets/css/style.css  All styles. Colors and type scale are variables at the top.
assets/js/main.js     Mobile menu, route animation, "Is my building mapped?" check, profile chips
assets/media/         Put your GIFs/videos here (see assets/media/README.md)
.nojekyll           Tells GitHub Pages to serve the files as-is
```

## Filling in placeholders

- **Text:** every placeholder is wrapped in `<span class="ph">[...]</span>` and shows a yellow underline on the page.
  Search the HTML for `class="ph"`, replace the bracketed text, then delete the span.
- **Media:** every media slot is a `<figure class="media" data-ph="...">` whose label says what goes there and the aspect ratio.
  Put a video inside it:
  ```html
  <figure class="media">
    <video src="assets/media/scenario-elevator.mp4" autoplay muted loop playsinline
           poster="assets/media/scenario-elevator.jpg"
           aria-label="Concept: route reroutes to the ramp when the elevator is out of service"></video>
  </figure>
  ```
  For a GIF use `<img src="..." alt="...">` instead. Short MP4s are much smaller than GIFs and can be paused.
- **Email:** replace `[team@email]` in the "Pilot with us" links and footer.
- **Waitlist form:** the demo shows a confirmation but doesn't send anything. GitHub Pages can't run server code,
  so connect a form service (Formspree, Getform, or a Google Form) at the `TODO` in `assets/js/main.js`.

## Publishing on GitHub Pages

1. Create a repository (e.g. `walkabout-site`) and push these files to the `main` branch, with `index.html` at the root.
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the site is live at `https://<your-username>.github.io/walkabout-site/`.
4. Optional custom domain: add it under Settings → Pages, then point your DNS at GitHub.

Notes:
- On a free GitHub account the repository must be public for Pages to work.
- Keep the published site under 1 GB and every file under 100 MB. Compress videos (720p H.264, a few MB each).
  For long films, upload to YouTube/Vimeo and embed instead.

## Editing with Claude Code

Open the repo in Claude Code and ask for changes directly, e.g. "replace the hero placeholders with this copy" or
"add an Accessibility page using the same header and footer". The header and footer are repeated in each HTML
file, so update all three when you change navigation.
