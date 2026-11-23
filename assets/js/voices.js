/* WalkAbout: Accessibility page "voices" wall.
   Every item is a real answer from the November 2026 questionnaire.
   Never show how many people answered, or anything about where or in what language they answered.
   k: "q" = open answer (q = full text), "s" = multiple-choice result (v = %, d = what it means).
   p = traveler types it belongs to: first, carry, care, mobility, older. Survey-wide results have no p. */
(function () {
  "use strict";

  var GROUPS = [
    ["in", "Getting in"],
    ["between", "Between buildings"],
    ["floor", "Which floor"],
    ["room", "On the floor"],
    ["help", "Falling back on people"],
    ["trust", "Can't trust the map"],
    ["pressure", "Under pressure"],
    ["signs", "Signs"],
    ["where", "Where it's hardest"],
    ["prefer", "How they'd rather go"],
    ["ask", "What they asked for"]
  ];

  var Q10 = "Hardest step last time in an unfamiliar building · one answer each";
  var Q12 = "What happened as a result · could pick several";
  var Q11 = "Extra time compared with what they expected";
  var Q14 = "Most-wanted features · each person picked two";
  var Q9 = "Where wayfinding feels hard · could pick several";
  var Q15 = "Route preference of people with a stroller, an injury, a cane or an older relative";

  var ITEMS = [
    // Getting in
    { g: "in", k: "s", t: "Finding the right entrance", v: 35, d: "said finding the right entrance was the hardest step", src: Q10 },
    { g: "in", k: "s", t: "Recommend the nearest entrance", v: 53, d: "want the nearest entrance recommended", src: Q14 },
    { g: "in", k: "q", t: "The entrance moved", s: 3, p: "first", who: "Age 18–30", q: "Temporary changes to entrances and exits due to renovations or other reasons often lack adequate notices and signs." },
    { g: "in", k: "s", t: "One route from the street to the door", v: 39, d: "want a continuous street-to-door route", src: Q14 },

    // Between buildings
    { g: "between", k: "q", t: "Floors don't connect", s: 4, p: "first", who: "Age 18–30", q: "Navigating inside [a large office and mall complex] is incredibly difficult. Some floors do not connect between buildings, so even finding an elevator doesn't help. Navigation that shows only one floor at a time isn't very useful either." },
    { g: "between", k: "q", t: "I keep having to turn back", s: 4, p: "carry care", who: "Age 30–45 · stroller, escorting an older relative", q: "Signs only provide floor directories, with no guiding lines on the ground. The connecting corridors between buildings are poorly marked, so I keep having to turn back." },
    { g: "between", k: "q", t: "No one to ask", s: 4, p: "mobility older", who: "Age 60+ · temporary injury", q: "Moving from Building A to Building B in a high-rise office complex, there was no one to ask for directions. It felt frightening, oppressive, and suffocating!" },

    // Which floor
    { g: "floor", k: "q", t: "Which floor am I on?", s: 4, p: "first", who: "Age 18–30", q: "The map doesn't show the floor. Two places may appear at the same location but be on different levels, so you can't tell whether the destination is above or below you. Sometimes the map is also outdated." },
    { g: "floor", k: "s", t: "Which elevator or stair to take", v: 47, d: "want to be told which elevator or stair to take", src: Q14 },
    { g: "floor", k: "s", t: "Wrong floor or a long detour", v: 40, d: "went to the wrong floor or took a long detour", src: Q12 },

    // On the floor
    { g: "room", k: "s", t: "Finding the room on the floor", v: 27, d: "said finding the room or shop on the floor was hardest", src: Q10 },
    { g: "room", k: "q", t: "Restrooms!!!!", s: 4, p: "first care", who: "Age 18–30", q: "Restrooms!!!!" },

    // Falling back on people
    { g: "help", k: "s", t: "Asked staff or passers-by", v: 59, d: "had to ask staff or passers-by", src: Q12 },
    { g: "help", k: "s", t: "Gave up, never arrived", v: 8, d: "gave up and never arrived", src: Q12 },

    // Can't trust the map
    { g: "trust", k: "q", t: "Like a headless chicken", s: 4, p: "carry", who: "Age 18–30 · luggage", q: "When the signal is poor, I wander around like a headless chicken." },
    { g: "trust", k: "q", t: "Keep up with me", s: 3, p: "care", who: "Age 18–30 · escorting an older relative", q: "Make the navigation pointer more responsive as I move." },

    // Under pressure
    { g: "pressure", k: "s", t: "5–10 extra minutes", v: 46, d: "lost 5 to 10 extra minutes finding their way inside", src: Q11 },
    { g: "pressure", k: "q", t: "Too much, in a hurry", s: 3, p: "first", who: "Age 18–30", q: "When I'm in a hurry, I find navigation hard to understand. When I'm not in a hurry, I don't need it." },
    { g: "pressure", k: "q", t: "Just say left or right", s: 4, p: "carry care", who: "Age 18–30 · stroller, escorting an older relative", q: "I think the navigation app could simply tell you to turn left or right." },
    { g: "pressure", k: "q", t: "Up and down the stairs", s: 3, p: "first", who: "Age 18–30 · campus", q: "She developed heatstroke after repeatedly climbing up and down stairs. I hope a useful indoor navigation system can be developed soon!" },
    { g: "pressure", k: "q", t: "Wasted energy", s: 3, p: "older", who: "Age 60+", q: "The older you get, the more you need clear route guidance. Otherwise, you waste time and physical energy." },

    // Signs
    { g: "signs", k: "q", t: "I need signs", s: 3, p: "first", who: "Age 45–60", q: "I'm bad with directions, so I need signs." },

    // Where it's hardest
    { g: "where", k: "s", t: "Shopping malls", v: 49, d: "find shopping malls hard to navigate", src: Q9 },
    { g: "where", k: "s", t: "Airports, rail and metro", v: 48, d: "find airports, rail and metro stations hard", src: Q9 },
    { g: "where", k: "s", t: "Hospitals", v: 40, d: "find hospitals hard to navigate", src: Q9 },

    // How they'd rather go (constrained travelers)
    { g: "prefer", k: "s", t: "Fewest level changes", v: 61, p: "carry care mobility", d: "would switch to fewest level changes (36% of everyone else)", src: Q15 },
    { g: "prefer", k: "s", t: "Stroller-friendly", v: 43, p: "carry care", d: "would switch to a stroller-friendly route (4% of everyone else)", src: Q15 },
    { g: "prefer", k: "s", t: "Fastest", v: 38, p: "carry care mobility", d: "would still pick fastest, against 73% of everyone else", src: Q15 },
    { g: "prefer", k: "s", t: "Step-free", v: 36, p: "carry care mobility", d: "would switch to step-free, by ramp or elevator (14% of everyone else)", src: Q15 },

    // What they asked for
    { g: "ask", k: "q", t: "Show me in AR", s: 3, p: "mobility", who: "Age 30–45 · temporary injury", q: "An AR view of the real environment would be best." }
  ];

  var LABELS = { first: "people in the building for the first time", carry: "people with luggage or a stroller",
    care: "people caring for someone", mobility: "people who are injured or use a cane", older: "people over 60" };

  var wall = document.getElementById("wall");
  if (!wall) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var countEl = document.querySelector(".voices-count");
  var card = document.getElementById("wall-card");
  var burst = document.getElementById("wall-burst");

  // Seeded random: the same gentle wobble on every visit
  var seed = 11;
  var rand = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // ---- Build the wall --------------------------------------------------------
  var words = [];
  var frag = document.createDocumentFragment();
  // One mixed cloud, no category labels: a seeded shuffle so big and small answers interleave
  var order = ITEMS.slice();
  for (var o = order.length - 1; o > 0; o--) {
    var r = Math.floor(rand() * (o + 1)), tmp = order[o]; order[o] = order[r]; order[r] = tmp;
  }
  order.forEach(function (it, i) {
    // Inline spans (not <button>) so justified lines can stretch and long phrases can wrap
    var b = document.createElement("span");
    b.setAttribute("role", "button");
    b.className = "wall__w wall__w--" + it.k;
    // Size (in em of the wall): quotes by weight, results by percentage, so the big answers read first
    // Wide range on purpose: a few answers shout, many whisper
    var size = it.k === "s" ? 0.7 + it.v / 20 : [0, 0.8, 1.2, 1.9, 2.9][it.s];
    b.style.setProperty("--fs", size.toFixed(2) + "em");
    b.style.setProperty("--dy", ((rand() - 0.5) * 6).toFixed(1) + "px");
    // Each voice surfaces at its own moment, then bobs very slightly
    b.style.setProperty("--delay", (0.15 + rand() * 2.6).toFixed(2) + "s");
    b.style.setProperty("--bob", (5 + rand() * 4).toFixed(1) + "s");
    b.style.setProperty("--bob-delay", (-rand() * 6).toFixed(1) + "s");
    b.textContent = it.t; // the percentage only shows in the hover card
    b.setAttribute("aria-describedby", "wall-card");
    b.tabIndex = -1;
    b._it = it;
    words.push(b);
    frag.appendChild(b);
    frag.appendChild(document.createTextNode(i < order.length - 1 ? ", " : "."));
  });
  wall.insertBefore(frag, card);
  words[0].tabIndex = 0;

  // ---- Voices surface when the wall comes into view ---------------------------------
  // A plain position check on scroll (not IntersectionObserver), so the voices can never stay hidden
  if (!reduceMotion) {
    wall.classList.add("js-surface");
    var surfaceCheck = function () {
      var r = wall.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
        wall.classList.add("is-surfaced");
        window.removeEventListener("scroll", surfaceCheck);
        window.removeEventListener("resize", surfaceCheck);
      }
    };
    window.addEventListener("scroll", surfaceCheck, { passive: true });
    window.addEventListener("resize", surfaceCheck);
    surfaceCheck();
  }

  // ---- Spotlight: phrases near the cursor (or the focused phrase) come into focus ----
  var spotFrame = null, spotX = 0, spotY = 0, spotOn = false, touchTimer = null;
  var distTo = function (el, x, y) {
    var rects = el.getClientRects(), best = Infinity;
    for (var r = 0; r < rects.length; r++) {
      var R = rects[r];
      var dx = Math.max(R.left - x, 0, x - R.right), dy = Math.max(R.top - y, 0, y - R.bottom);
      best = Math.min(best, Math.sqrt(dx * dx + dy * dy));
    }
    return best;
  };
  var paintSpot = function () {
    spotFrame = null;
    var radius = Math.max(160, wall.clientWidth * 0.16);
    words.forEach(function (b) {
      var near = spotOn ? Math.max(0, 1 - distTo(b, spotX, spotY) / radius) : 0;
      b.style.setProperty("--near", (near * near * (3 - 2 * near)).toFixed(3)); // smoothstep
    });
  };
  var spotAt = function (x, y) {
    spotX = x; spotY = y; spotOn = true;
    if (!spotFrame) spotFrame = window.requestAnimationFrame(paintSpot);
  };
  var spotOff = function () {
    spotOn = false;
    if (!spotFrame) spotFrame = window.requestAnimationFrame(paintSpot);
  };
  wall.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    spotAt(e.clientX, e.clientY);
  });
  wall.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") spotOff(); });
  wall.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "touch") return;
    clearTimeout(touchTimer);
    spotAt(e.clientX, e.clientY);
    touchTimer = setTimeout(spotOff, 2500);
  });
  window.addEventListener("scroll", function () { if (spotOn) spotOff(); }, { passive: true });

  // ---- Card beside the word ---------------------------------------------------
  var active = null, hideTimer = null;
  var fill = function (it) {
    var grp = GROUPS.filter(function (g) { return g[0] === it.g; })[0][1];
    if (it.k === "q") {
      card.innerHTML = '<p class="wall-card__k">' + esc(grp) + "</p>" +
        '<p class="wall-card__q">“' + esc(it.q) + "”</p>" +
        '<p class="wall-card__who">' + esc(it.who) + "</p>";
    } else {
      card.innerHTML = '<p class="wall-card__k">' + esc(grp) + "</p>" +
        '<p class="wall-card__stat"><b>' + it.v + "%</b> " + esc(it.d) + "</p>" +
        '<p class="wall-card__who">' + esc(it.src) + "</p>";
    }
  };
  var place = function (b) {
    var W = wall.clientWidth;
    var wr = b.getBoundingClientRect(), fr = wall.getBoundingClientRect();
    var x = wr.left - fr.left + wr.width / 2, top = wr.top - fr.top, bottom = top + wr.height;
    card.hidden = false;
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var left = Math.min(W - cw, Math.max(0, x - cw / 2));
    // Prefer below the word; go above when the card would run past the wall or the screen
    var below = bottom + 12, above = top - ch - 12;
    var roomBelow = window.innerHeight - wr.bottom;
    var y = (roomBelow < ch + 24 && above > 0) ? above : below;
    card.style.left = left + "px";
    card.style.top = y + "px";
    card.classList.toggle("is-above", y === above);
  };
  var spark = function (b) {
    if (reduceMotion || !burst) return;
    var wr = b.getBoundingClientRect(), fr = wall.getBoundingClientRect();
    burst.style.left = (wr.left - fr.left + wr.width / 2) + "px";
    burst.style.top = (wr.top - fr.top + wr.height / 2) + "px";
    // Ticks sit on an ellipse around the word and fly a little outward
    var rx = wr.width / 2 + 10, ry = wr.height / 2 + 8, ticks = burst.children;
    for (var k = 0; k < ticks.length; k++) {
      var th = (k / ticks.length) * Math.PI * 2 + 0.3;
      var cx = Math.cos(th), cy = Math.sin(th);
      var t = ticks[k].style;
      t.setProperty("--x0", (cx * rx).toFixed(1) + "px");
      t.setProperty("--y0", (cy * ry).toFixed(1) + "px");
      t.setProperty("--x1", (cx * (rx + 12)).toFixed(1) + "px");
      t.setProperty("--y1", (cy * (ry + 12)).toFixed(1) + "px");
      t.setProperty("--a", (th * 180 / Math.PI + 90).toFixed(0) + "deg");
    }
    burst.classList.remove("is-on");
    void burst.offsetWidth; // restart the animation
    burst.classList.add("is-on");
  };
  var show = function (b) {
    clearTimeout(hideTimer);
    if (active && active !== b) active.classList.remove("is-active");
    active = b;
    b.classList.add("is-active");
    fill(b._it);
    place(b);
    spark(b);
  };
  var hide = function () {
    hideTimer = setTimeout(function () {
      if (active) active.classList.remove("is-active");
      active = null;
      card.hidden = true;
    }, 120);
  };

  words.forEach(function (b, i) {
    b.addEventListener("mouseenter", function () { show(b); });
    b.addEventListener("mouseleave", hide);
    b.addEventListener("focus", function () {
      show(b);
      var r = b.getBoundingClientRect();
      spotAt(r.left + r.width / 2, r.top + r.height / 2);
    });
    b.addEventListener("blur", hide);
    b.addEventListener("click", function () { show(b); }); // taps on touch screens
    // One tab stop for the whole wall; arrow keys move between answers
    b.addEventListener("keydown", function (e) {
      var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === "Escape") { hide(); return; }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(b); return; }
      if (e.key === "Home") step = -i;
      if (e.key === "End") step = words.length - 1 - i;
      if (!step) return;
      e.preventDefault();
      var j = (i + step + words.length) % words.length;
      b.tabIndex = -1; words[j].tabIndex = 0; words[j].focus();
    });
  });
  document.addEventListener("click", function (e) { if (!wall.contains(e.target)) hide(); });
  window.addEventListener("resize", function () { if (active) place(active); });

  // ---- Fit the whole section in one screen (wide screens) -----------------------
  // Binary-search the wall's font size so heading, filters, wall and note fit the viewport.
  var section = wall.closest("section");
  var fitWide = window.matchMedia("(min-width: 901px) and (min-height: 620px)");
  var fit = function () {
    if (!fitWide.matches) { wall.style.fontSize = ""; return; }
    var header = document.querySelector(".site-header");
    var avail = window.innerHeight - (header ? header.offsetHeight : 0);
    var lo = 11, hi = 40;
    for (var n = 0; n < 9; n++) {
      var mid = (lo + hi) / 2;
      wall.style.fontSize = mid + "px";
      if (section.offsetHeight <= avail) lo = mid; else hi = mid;
    }
    wall.style.fontSize = lo + "px";
    if (window.walkaboutPins) window.walkaboutPins();
  };
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("resize", fit);

  // ---- Filter by who is traveling ------------------------------------------------
  var personaBtns = Array.prototype.slice.call(document.querySelectorAll(".persona"));
  var applyPersona = function (who) {
    var n = 0;
    words.forEach(function (b) {
      var p = b._it.p || "";
      var match = who === "all" || (" " + p + " ").indexOf(" " + who + " ") > -1;
      if (match) n++;
      b.classList.toggle("is-match", who !== "all" && match);
      b.classList.toggle("is-dim", !match);
    });
    wall.classList.toggle("is-filtered", who !== "all");
    if (countEl) countEl.textContent = who === "all"
      ? "Showing all answers. Hover over any of them to read it."
      : "Showing answers from " + LABELS[who] + ". Hover over any of them to read it.";
  };
  personaBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      personaBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === btn)); });
      applyPersona(btn.dataset.persona);
    });
  });
  applyPersona("all");

  // ---- Ambient: now and then one answer lights up, so the wall feels alive -----------
  if (!reduceMotion && "IntersectionObserver" in window) {
    var inView = false;
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.3 }).observe(wall);
    setInterval(function () {
      if (!inView || active || document.hidden) return;
      var pool = words.filter(function (b) { return !b.classList.contains("is-dim"); });
      var b = pool[Math.floor(Math.random() * pool.length)];
      if (!b) return;
      b.classList.add("is-ping");
      setTimeout(function () { b.classList.remove("is-ping"); }, 2200);
    }, 2400);
  }
})();
