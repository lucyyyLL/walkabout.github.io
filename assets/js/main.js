/* WalkAbout — shared interactions (no dependencies) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header height, for sticky elements below it -------------------------- */
  var header = document.querySelector(".site-header");
  var tabBar = document.querySelector(".tabs");
  function setHeaderH() {
    if (!header) return;
    var h = header.offsetHeight;
    document.documentElement.style.setProperty("--header-h", h + "px");
    // Sticky steps sit below the header and, on Technology, the tab bar
    document.documentElement.style.setProperty("--stick-top", h + (tabBar ? tabBar.offsetHeight : 0) + "px");
  }
  setHeaderH();
  window.addEventListener("resize", setHeaderH);

  /* Pinned sections taller than the screen stick by their bottom edge, so all of
     them is seen before the next section slides over (see .pin-hold) */
  var pinWide = window.matchMedia("(min-width: 901px) and (min-height: 620px)");
  var setPinTops = function () {
    var top = parseFloat(document.documentElement.style.getPropertyValue("--stick-top")) || 0;
    document.querySelectorAll(".pin-hold").forEach(function (el) {
      el.style.top = pinWide.matches ? Math.min(top, window.innerHeight - el.offsetHeight) + "px" : "";
    });
  };
  window.walkaboutPins = setPinTops; // voices.js calls this after resizing the wall
  window.addEventListener("load", setPinTops);
  window.addEventListener("resize", setPinTops);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setPinTops);

  /* Technology: steps ease in, then stack (see .steps--stack) ------------ */
  if (!reduceMotion && document.querySelector(".steps--stack, .pin-hold, .scrolly")) {
    document.documentElement.classList.add("js-motion");
  }
  var stackSteps = document.querySelectorAll(".steps--stack > li");
  if (stackSteps.length && !reduceMotion && "IntersectionObserver" in window) {
    var stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); stepIO.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    stackSteps.forEach(function (li) { stepIO.observe(li); });
  }

  /* Navigate: the demo film plays once, full screen ------------------------
     One button pauses, plays and replays it (needed for any moving content over
     5 seconds). When it ends, a scroll cue appears. Reduced motion: no autoplay. */
  var demo = document.getElementById("demo-video");
  var demoBtn = document.getElementById("demo-toggle");
  var demoStage = document.querySelector(".demo-stage");
  if (demo && demoBtn) {
    // "Done" also covers Skip, which jumps to the end while paused (no "ended" event then)
    var done = function () { return demo.ended || (demo.duration > 0 && demo.currentTime >= demo.duration - 0.05); };
    var label = function () {
      var t = done() ? "Replay" : demo.paused ? "Play" : "Pause";
      demoBtn.textContent = t;
      demoBtn.setAttribute("aria-label", t + " the demo film");
      demoStage.classList.toggle("is-ended", done());
    };
    if (reduceMotion) { demo.removeAttribute("autoplay"); demo.pause(); }
    ["play", "pause", "ended", "seeked"].forEach(function (ev) { demo.addEventListener(ev, label); });
    demoBtn.addEventListener("click", function () {
      demo._autoPaused = false;
      if (done()) demo.currentTime = 0;
      if (demo.paused) demo.play().catch(function () {}); else demo.pause();
    });

    // Scroll stays locked while the film plays from the top of the page.
    // Released by: the film ending, Pause, Skip, an error, a stall over 3 s, or a safety timer.
    var root = document.documentElement, stallTimer = null, safetyTimer = null;
    var lock = function (on) {
      root.classList.toggle("is-locked", on);
      clearTimeout(safetyTimer);
      if (on) {
        var left = ((demo.duration || 20) - demo.currentTime) / (demo.playbackRate || 1);
        safetyTimer = setTimeout(function () { lock(false); }, (left + 3) * 1000);
      }
    };
    demo.addEventListener("play", function () {
      if (!reduceMotion && window.scrollY < 10) { window.scrollTo(0, 0); lock(true); }
    });
    ["pause", "ended", "error", "emptied"].forEach(function (ev) {
      demo.addEventListener(ev, function () { lock(false); });
    });
    demo.addEventListener("waiting", function () {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(function () { lock(false); }, 3000);
    });
    demo.addEventListener("playing", function () { clearTimeout(stallTimer); });
    var skip = document.getElementById("demo-skip");
    if (skip) skip.addEventListener("click", function () {
      demo._autoPaused = false;
      if (demo.duration) demo.currentTime = demo.duration; // jump to the end card and the scroll cue
      demo.pause();
      lock(false);
    });
    if (!demo.paused) demo.dispatchEvent(new Event("play")); // autoplay may have started before this ran
    label();
  }

  /* Navigate: demo holds, caption scrolls up over it --------------------- */
  var stage = document.querySelector(".demo-stage");
  if (stage && !reduceMotion) {
    stage.classList.add("is-scrolly");
    var ticking = false;
    var update = function () {
      ticking = false;
      var sticky = stage.querySelector(".demo-stage__sticky");
      // Measured in screen heights scrolled into the stage:
      // 0–0.25 demo alone, 0.25–1.45 caption rises as demo fades, then the caption holds
      // until the next section (.cover-up) slides up over it.
      var vh = sticky.offsetHeight || window.innerHeight;
      var scrolled = -stage.getBoundingClientRect().top / vh;
      var p = Math.min(1, Math.max(0, (scrolled - 0.25) / 1.2));
      stage.style.setProperty("--p", p.toFixed(3));
      // Once the caption has taken over, pause the film; resume if they scroll back up mid-film
      if (demo && !demo.ended) {
        if (p > 0.85 && !demo.paused) { demo.pause(); demo._autoPaused = true; }
        else if (p < 0.2 && demo._autoPaused) { demo._autoPaused = false; demo.play().catch(function () {}); }
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* Technology: tabs (works as plain anchors without JS) ----------------- */
  var tablist = document.querySelector('.tabs [role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
      window.dispatchEvent(new Event("scroll")); // let scroll-driven drawings re-measure
    };
    var fromHash = function () {
      var id = location.hash.slice(1);
      var match = tabs.filter(function (t) { return t.getAttribute("aria-controls") === id; })[0];
      select(match || tabs[0], false);
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        select(t, false);
        history.replaceState(null, "", "#" + t.getAttribute("aria-controls"));
      });
      t.addEventListener("keydown", function (e) {
        var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (next === null) return;
        e.preventDefault();
        var target = tabs[(next + tabs.length) % tabs.length];
        select(target, true);
        history.replaceState(null, "", "#" + target.getAttribute("aria-controls"));
      });
    });
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* Technology: one drawing that evolves with scroll (.scrolly) -----------
     Scroll through the block maps to t = 0..6 (one unit per step). Within a
     step the drawing animates over the first 60%, then holds. */
  var story = document.querySelector(".scrolly");
  if (story) {
    var storyStage = story.querySelector(".scrolly__stage");
    var storySteps = Array.prototype.slice.call(story.querySelectorAll(".scrolly__steps > li"));
    var ticks = Array.prototype.slice.call(story.querySelectorAll(".scrolly__ticks span"));
    var parts = Array.prototype.slice.call(story.querySelectorAll("[data-draw], [data-in], [data-out], [data-dim], [data-fade]"));
    var storyRoute = document.getElementById("story-route");
    var you = story.querySelectorAll(".sv-you circle");
    var readout = story.querySelector(".sv-readout");
    var N = storySteps.length;
    var wide = window.matchMedia("(min-width: 901px) and (min-height: 620px)");
    var live = false, storyTick = false;

    var stepAmt = function (t, k) { return Math.min(1, Math.max(0, (t - (k - 1)) / 0.6)); };
    var lengthOf = function (el) {
      if (!el._len) { try { el._len = el.getTotalLength(); } catch (e) { el._len = 0; } }
      return el._len;
    };

    var render = function (t) {
      parts.forEach(function (el) {
        var o = 1;
        if (el.dataset.in) o *= stepAmt(t, +el.dataset.in);
        if (el.dataset.out) o *= 1 - stepAmt(t, +el.dataset.out);
        if (el.dataset.dim) o *= 1 - 0.7 * stepAmt(t, +el.dataset.dim);
        // data-fade: the floor plan steps back (to 40%) so the network and route stand out
        if (el.dataset.fade) o *= 1 - 0.6 * stepAmt(t, +el.dataset.fade);
        el.style.opacity = o;
        if (el.dataset.draw) {
          var len = lengthOf(el);
          if (len) {
            el.style.strokeDasharray = len + " " + len;
            el.style.strokeDashoffset = len * (1 - stepAmt(t, +el.dataset.draw));
          }
        }
      });
      // Step 6: the blue dot follows the section route
      var len6 = storyRoute ? lengthOf(storyRoute) : 0;
      if (len6) {
        var pt = storyRoute.getPointAtLength(len6 * stepAmt(t, 6));
        Array.prototype.forEach.call(you, function (c) { c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); });
        if (readout) readout.textContent = "You are on Level " + (pt.y > 250 ? 1 : pt.y > 150 ? 2 : 3);
      }
      var active = Math.min(N - 1, Math.floor(t));
      storySteps.forEach(function (li, i) { li.classList.toggle("is-active", i === active); });
      ticks.forEach(function (s, i) {
        s.classList.toggle("is-active", i === active);
        s.classList.toggle("is-done", i < active);
      });
    };

    var storyTravel = function () { return story.offsetHeight - storyStage.offsetHeight; };
    var stickTop = function () {
      return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stick-top")) || 0;
    };
    var storyUpdate = function () {
      storyTick = false;
      if (!live || !story.offsetParent) return; // hidden tab or still mode
      var travel = storyTravel();
      var p = travel > 0 ? (stickTop() - story.getBoundingClientRect().top) / travel : 0;
      render(Math.min(N - 0.0001, Math.max(0, p) * N));
    };
    var setStoryMode = function () {
      live = !reduceMotion && wide.matches;
      story.classList.toggle("is-live", live);
      if (live) storyUpdate();
      else render(4); // still: plan with network and the step-free route
    };
    window.addEventListener("scroll", function () {
      if (!storyTick) { storyTick = true; window.requestAnimationFrame(storyUpdate); }
    }, { passive: true });
    window.addEventListener("resize", setStoryMode);
    if (wide.addEventListener) wide.addEventListener("change", setStoryMode);
    setStoryMode();

    // Stage links jump to the middle of that step's scroll range
    document.querySelectorAll(".pipeline-map a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var idx = storySteps.map(function (li) { return li.id; }).indexOf(a.getAttribute("href").slice(1));
        if (!live || idx < 0) return;
        e.preventDefault();
        var top = story.getBoundingClientRect().top + window.scrollY - stickTop();
        window.scrollTo({ top: top + ((idx + 0.7) / N) * storyTravel(), behavior: "smooth" });
      });
    });
  }

  /* Accessibility: findings slider -----------------------------------------
     The track is a native horizontal scroller with snap points; this adds the
     arrows, dots, counter, arrow keys and click-and-drag for mice. */
  var track = document.querySelector(".findings__track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".finding"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".findings__dots button"));
    var arrows = Array.prototype.slice.call(document.querySelectorAll(".findings__arrow"));
    var nowEl = document.querySelector(".findings__now");
    var hint = document.querySelector(".findings__hint");
    var current = 0;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var goTo = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    };
    var sync = function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === current && nowEl.textContent === pad(i + 1)) return;
      current = i;
      if (nowEl) nowEl.textContent = pad(i + 1);
      dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === i)); });
      arrows[0].disabled = i === 0;
      arrows[1].disabled = i === slides.length - 1;
      if (hint && i > 0) hint.style.visibility = "hidden";
    };
    track.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    arrows.forEach(function (a) {
      a.addEventListener("click", function () { goTo(current + Number(a.dataset.dir)); });
    });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { goTo(k); }); });
    track.addEventListener("keydown", function (e) {
      var step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); goTo(0); return; }
      if (e.key === "End") { e.preventDefault(); goTo(slides.length - 1); return; }
      if (!step) return;
      e.preventDefault();
      goTo(current + step);
    });
    // Click-and-drag for mice (touch and trackpads already scroll natively)
    var dragX = null, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragX = e.clientX; startLeft = track.scrollLeft; moved = false;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    var endDrag = function (e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      dragX = null;
      track.classList.remove("is-dragging");
      // A short flick is enough to move on; otherwise settle on the nearest slide
      var base = Math.round(startLeft / track.clientWidth);
      goTo(Math.abs(dx) > track.clientWidth * 0.12 ? base - Math.sign(dx) : base);
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    window.addEventListener("resize", function () { track.scrollLeft = current * track.clientWidth; });
    current = -1; sync();
  }

  /* Accessibility: "What people want" → "What we build" ------------------
     Vertical tabs: choosing a need reveals the feature that answers it.
     Without JS all features stay listed. */
  var wantTabs = Array.prototype.slice.call(document.querySelectorAll(".wants__tab"));
  if (wantTabs.length) {
    document.querySelector(".wants").classList.add("js-tabs");
    var showWant = function (tab, focus) {
      wantTabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        if (on) {
          panel.classList.remove("is-entering");
          void panel.offsetWidth; // restart the grow-in
          panel.classList.add("is-entering");
        }
      });
      if (focus) tab.focus();
    };
    wantTabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showWant(t, false); });
      t.addEventListener("keydown", function (e) {
        var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === "Home") step = -i;
        if (e.key === "End") step = wantTabs.length - 1 - i;
        if (!step) return;
        e.preventDefault();
        showWant(wantTabs[(i + step + wantTabs.length) % wantTabs.length], true);
      });
    });
    wantTabs.forEach(function (t) {
      document.getElementById(t.getAttribute("aria-controls")).hidden = t.getAttribute("aria-selected") !== "true";
    });
  }

  /* Technology "How it works": each step loops its own part of the demo film.
     Plays only while on screen; a button pauses it (needed for moving content
     over 5 seconds). Reduced motion: no autoplay, the button starts it. */
  var clips = Array.prototype.slice.call(document.querySelectorAll(".clip__video"));
  if (clips.length) {
    clips.forEach(function (v) {
      var start = parseFloat(v.dataset.start) || 0, end = parseFloat(v.dataset.end) || 0;
      var btn = v.parentElement.querySelector(".clip__toggle");
      v._userPaused = reduceMotion;
      var label = function () {
        var t = v.paused ? "Play" : "Pause";
        btn.textContent = t;
        btn.setAttribute("aria-label", t + " this clip");
      };
      v.addEventListener("loadedmetadata", function () { if (v.currentTime < start) v.currentTime = start; });
      v.addEventListener("timeupdate", function () {
        if (end && (v.currentTime >= end || v.currentTime < start - 0.3)) v.currentTime = start;
      });
      v.addEventListener("play", label);
      v.addEventListener("pause", label);
      btn.addEventListener("click", function () {
        if (v.paused) { v._userPaused = false; v.play().catch(function () {}); }
        else { v._userPaused = true; v.pause(); }
      });
      label();
    });
    if ("IntersectionObserver" in window) {
      var clipIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting && !v._userPaused) v.play().catch(function () {});
          else if (!en.isIntersecting && !v.paused) v.pause();
        });
      }, { threshold: 0.5 });
      clips.forEach(function (v) { clipIO.observe(v); });
    }
  }

  /* Technology headline route animation: reduced motion shows the finished route */
  if (reduceMotion) {
    document.querySelectorAll(".navani animate, .navani animateMotion").forEach(function (el) { el.remove(); });
    var me = document.querySelector(".navani__me");
    if (me) me.remove();
  }

  /* Technology roadmap: the dot travels along the zigzag as you scroll ----
     Milestones light up as it passes them. Without motion (or on small screens)
     the whole route is drawn and every milestone shows. */
  var road = document.querySelector(".roadmap");
  if (road) {
    var roadSticky = road.querySelector(".roadmap__sticky");
    var done = road.querySelector(".roadmap__done");
    var dot = road.querySelector(".roadmap__dot"), ring = road.querySelector(".roadmap__ring");
    var stops = Array.prototype.slice.call(road.querySelectorAll(".roadmap__stop"));
    var stopLabels = Array.prototype.slice.call(road.querySelectorAll(".roadmap__labels li"));
    var roadWide = window.matchMedia("(min-width: 901px) and (min-height: 720px)"); // needs room for labels above and below
    var roadLen = 0, stopAt = [], roadLive = false, roadTick = false;
    var measureRoad = function () {
      try { roadLen = done.getTotalLength(); } catch (e) { roadLen = 0; }
      if (!roadLen) return;
      // where along the route each milestone sits
      stopAt = stops.map(function (s) {
        var cx = +s.getAttribute("cx"), cy = +s.getAttribute("cy"), best = 0, bestD = Infinity;
        for (var L = 0; L <= roadLen; L += 4) {
          var pt = done.getPointAtLength(L), d = Math.abs(pt.x - cx) + Math.abs(pt.y - cy);
          if (d < bestD) { bestD = d; best = L; }
        }
        return best / roadLen;
      });
      done.style.strokeDasharray = roadLen + " " + roadLen;
    };
    var drawRoad = function (p) {
      if (!roadLen) measureRoad();
      if (!roadLen) return;
      done.style.strokeDashoffset = roadLen * (1 - p);
      var pt = done.getPointAtLength(roadLen * p);
      [dot, ring].forEach(function (c) { c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); });
      stops.forEach(function (s, i) {
        var reached = p >= stopAt[i] - 0.005;
        s.classList.toggle("is-reached", reached);
        if (stopLabels[i]) stopLabels[i].classList.toggle("is-reached", reached);
      });
    };
    var roadUpdate = function () {
      roadTick = false;
      if (!roadLive || !road.offsetParent) return;
      var vh = window.innerHeight;
      var top = parseFloat(document.documentElement.style.getPropertyValue("--stick-top")) || 0;
      var scrolled = (top - road.getBoundingClientRect().top) / vh;
      // the dot travels over ~1.5 screens of scrolling, then rests before the next section slides over
      drawRoad(Math.min(1, Math.max(0, (scrolled - 0.15) / 1.5)));
    };
    var setRoadMode = function () {
      roadLive = !reduceMotion && roadWide.matches;
      road.classList.toggle("is-live", roadLive);
      measureRoad();
      if (roadLive) roadUpdate(); else drawRoad(1);
    };
    window.addEventListener("scroll", function () {
      if (!roadTick) { roadTick = true; window.requestAnimationFrame(roadUpdate); }
    }, { passive: true });
    window.addEventListener("resize", setRoadMode);
    setRoadMode();
  }

  /* Section-drawing route: measure each path so it can draw itself ------ */
  document.querySelectorAll(".sd-anim").forEach(function (path) {
    if (path.getTotalLength) {
      path.style.setProperty("--len", Math.ceil(path.getTotalLength()));
    }
  });

  /* Concept videos: once real files are in, respect reduced motion ------ */
  document.querySelectorAll(".media video, .media img").forEach(function (v) {
    v.closest(".media").classList.add("has-video");
    if (v.tagName === "VIDEO" && reduceMotion) { v.removeAttribute("autoplay"); v.pause(); v.controls = true; }
  });

  /* "Is my building mapped?" — demo only. Wire to a form service later
     (see README: Formspree / Google Forms). ----------------------------- */
  var MAPPED = ["mit", "massachusetts institute of technology", "e52", "e51"]; // venues that answer "being mapped"

  function checkPlace(form, out) {
    var input = form.querySelector("input[name='place']");
    var value = (input.value || "").trim();
    if (!value) {
      out.innerHTML = "<p>Enter a campus or building name to check.</p>";
      input.focus();
      return;
    }
    var known = MAPPED.some(function (m) { return value.toLowerCase().indexOf(m) !== -1; });
    out.innerHTML = known
      ? "<p><strong>" + escapeHtml(value) + " is being mapped.</strong> Join the waitlist to hear when routes go live.</p>" + waitlistHtml(value)
      : "<p><strong>" + escapeHtml(value) + " isn't mapped yet.</strong> Join the waitlist and we'll tell you when it is.</p>" + waitlistHtml(value);
    var email = out.querySelector("input[type='email']");
    if (email) email.focus();
  }

  function waitlistHtml(place) {
    return (
      '<form class="waitlist" novalidate>' +
      '<input type="hidden" name="place" value="' + escapeHtml(place) + '">' +
      '<label for="wl-email-' + uid + '">Email</label>' +
      '<div class="form-row"><input id="wl-email-' + uid + '" type="email" name="email" autocomplete="email" required>' +
      '<button class="btn" type="submit">Join the waitlist</button></div>' +
      '<div class="form-msg" role="status"></div></form>'
    );
  }
  var uid = 0;

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (form.matches(".check-form")) {
      e.preventDefault();
      uid += 1;
      checkPlace(form, form.parentElement.querySelector(".check-result"));
    } else if (form.matches(".waitlist")) {
      e.preventDefault();
      var email = form.querySelector("input[type='email']");
      var msg = form.querySelector(".form-msg");
      if (!email.value || !email.checkValidity()) {
        msg.textContent = "Enter an email address like name@example.com.";
        email.focus();
        return;
      }
      // TODO: send to your form service here.
      msg.innerHTML = "<p><strong>You're on the waitlist.</strong> We'll email " + escapeHtml(email.value) + " when routes go live.</p>";
      form.querySelector("button").disabled = true;
    }
  });

  /* Dialog ---------------------------------------------------------------- */
  var dialog = document.getElementById("check-dialog");
  document.querySelectorAll("[data-open-check]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (dialog && dialog.showModal) {
        dialog.showModal();
        var i = dialog.querySelector("input[name='place']");
        if (i) i.focus();
      } else {
        var inline = document.getElementById("check");
        if (inline) inline.scrollIntoView();
      }
    });
  });
  if (dialog) {
    dialog.querySelector(".dialog__close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* Route profile chips (Navigate) -------------------------------------- */
  var chipNote = document.querySelector(".chip-note");
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var on = chip.getAttribute("aria-pressed") !== "true";
      chip.setAttribute("aria-pressed", String(on));
      if (!chipNote) return;
      var picked = Array.prototype.slice
        .call(document.querySelectorAll('.chip[aria-pressed="true"]'))
        .map(function (c) { return c.textContent.toLowerCase(); });
      chipNote.textContent = picked.length
        ? "Your route will be " + picked.join(" + ") + "."
        : "Pick one or more. Profiles combine.";
    });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
