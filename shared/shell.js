/* ============================================================
   aprendo shell — shared by every activity.
   Usage in an activity, after its content:
     const shell = Shell.init({ intro: "…", links: [...], flow: true });
     shell.scorm.get / set / commit      (SCORM 1.2, no-op outside an LMS)
     shell.scorm.record(id, response, { type, result, latency })
                                          (learning data: one line per id in Moodle's Interaktionsbericht;
                                           calling it again with the same id updates that line)
     shell.scale                          (current stage scale, for drag & drop maths)
     onFit(shell)                         (optional, called after every resize)
     theme: "paper", title: "…"          (optional: beige panel with a white title band, no grey box)
     height: 1090                         (optional: taller stage than 1600×900)
   A full-screen button is added in the stage's bottom-right corner, the same place on every page
   (pages with a .controls bar and no #full of their own; the bar is shortened to leave it room).
   ============================================================ */
const Shell = (() => {
  const FULL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
  const SMALL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>`;
  const BOOK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`;

  /* ---------- SCORM 1.2 ---------- */
  // Seconds → SCORM 1.2 time span (HHHH:MM:SS)
  const span = (sec) => {
    sec = Math.max(0, Math.round(sec));
    return `${String(Math.floor(sec / 3600)).padStart(4, "0")}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  };

  function connectScorm() {
    let api = null;
    for (let w = window, i = 0; w && i < 10; i++) {
      if (w.API) { api = w.API; break; }
      w = (w.parent && w.parent !== w) ? w.parent : w.opener;
    }
    if (!api) {                          // opened outside an LMS: nothing is saved (window.SCORM_LOG = true shows what would be)
      const log = (...a) => window.SCORM_LOG && console.log("[scorm]", ...a);
      return { get: () => "", set: log, commit() {}, finish() {}, record: (...a) => log("record", ...a), span };
    }
    api.LMSInitialize("");
    let finished = false;

    // Time spent: only while the page is visible (a tab left open in the background does not count)
    let activeMs = 0, since = document.visibilityState === "visible" ? Date.now() : null;
    const seconds = () => (activeMs + (since ? Date.now() - since : 0)) / 1000;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") since = Date.now();
      else if (since) { activeMs += Date.now() - since; since = null; scorm.commit(); }
    });

    // suspend_data holds the activity's own data and the line number of each interaction id, so a learner who comes
    // back in the same attempt updates the same lines of the Interaktionsbericht instead of adding new ones
    let own = api.LMSGetValue("cmi.suspend_data"), index = {};
    try { const o = JSON.parse(own); if (o && o.shell) { own = o.a; index = o.i; } } catch {}
    const keep = () => api.LMSSetValue("cmi.suspend_data", JSON.stringify({ shell: 1, a: own, i: index }));

    const scorm = {
      get: (k) => k === "cmi.suspend_data" ? own : api.LMSGetValue(k),
      set: (k, v) => { if (k === "cmi.suspend_data") { own = String(v); keep(); } else api.LMSSetValue(k, v); },
      // Every save also sends the time spent so far in this session; Moodle adds it to the attempt's total time
      commit: () => { api.LMSSetValue("cmi.core.session_time", span(seconds())); api.LMSCommit(""); },
      finish: () => { if (!finished) { finished = true; scorm.commit(); api.LMSFinish(""); } },
      record(id, response, { type = "fill-in", result = "", latency = null } = {}) {
        if (!(id in index)) { index[id] = parseInt(api.LMSGetValue("cmi.interactions._count"), 10) || 0; keep(); }
        const n = `cmi.interactions.${index[id]}.`;
        api.LMSSetValue(n + "id", id);
        api.LMSSetValue(n + "type", type);
        api.LMSSetValue(n + "student_response", String(response).slice(0, 255));
        if (result) api.LMSSetValue(n + "result", result);
        if (latency !== null) api.LMSSetValue(n + "latency", span(latency));
        api.LMSSetValue(n + "time", new Date().toTimeString().slice(0, 8));
      },
      span
    };
    setInterval(() => scorm.commit(), 60000);   // also save once a minute, so time is kept if the browser closes abruptly
    if (["", "not attempted"].includes(scorm.get("cmi.core.lesson_status"))) {
      scorm.set("cmi.core.lesson_status", "incomplete");
      scorm.commit();
    }
    window.addEventListener("pagehide", scorm.finish);
    window.addEventListener("beforeunload", scorm.finish);
    return scorm;
  }

  function init({ intro = "", links = [], flow = false, onFit = null, theme = "", title = "", height = 900 } = {}) {
    const root = document.documentElement;
    const box = document.querySelector(".box"), frame = document.getElementById("frame"), stage = document.getElementById("stage");

    // "paper" style: beige panel with a white title band instead of the grey box
    if (theme === "paper") {
      root.classList.add("paper");
      stage.insertAdjacentHTML("afterbegin", `<header class="head"><h1>${title}</h1></header>`);
    }

    // Book icon, intro above the frame, section buttons below it
    box.insertAdjacentHTML("afterbegin", `<span class="book" aria-hidden="true">${BOOK}</span>`);
    if (intro) frame.insertAdjacentHTML("beforebegin", `<p class="box-intro">${intro}</p>`);
    if (links.length) frame.insertAdjacentHTML("afterend", `<nav class="nav" aria-label="Sections du module">${
      links.map(l => l.current ? `<a class="btn" aria-current="page">${l.label}</a>`
        : l.href ? `<a class="btn" href="${l.href}" target="_top">${l.label}</a>`
        : `<a class="btn">${l.label}</a>`).join("")}</nav>`);

    const embed = location.search.includes("embed") || root.hasAttribute("data-embed");
    root.classList.toggle("embed", embed);

    const shell = { scorm: connectScorm(), scale: 1 };

    // Full screen: the box (the frame, and a presenter standing beside it) fills the screen. Inside Moodle's SCORM player
    // the iframe may not allow it; then the player's iframe itself is put in full screen (same site), and the box fills it.
    const controls = stage.querySelector(".controls");
    if (controls && !document.getElementById("full")) {
      controls.classList.add("with-full");
      stage.insertAdjacentHTML("beforeend", `<button class="arrow full" type="button" id="full" aria-label="Plein écran">${FULL}</button>`);
      let outer = null;
      try { outer = window.frameElement; } catch {}
      const target = document.fullscreenEnabled ? box : outer?.requestFullscreen ? outer : null;
      const btn = document.getElementById("full");
      if (!target) btn.hidden = true;
      const doc = target === box ? document : outer?.ownerDocument;
      btn.addEventListener("click", () => doc.fullscreenElement ? doc.exitFullscreen() : target.requestFullscreen());
      doc?.addEventListener("fullscreenchange", () => {
        const on = !!doc.fullscreenElement;
        root.classList.toggle("full", on);
        btn.innerHTML = on ? SMALL : FULL; btn.setAttribute("aria-label", on ? "Quitter le plein écran" : "Plein écran");
        setTimeout(fit, 50);
      });
    }

    function fit() {
      const isFlow = flow && root.clientWidth < 700;
      root.classList.toggle("flow", isFlow);
      // A taller stage (height > 900) for pages where a 16:9 video or slide takes the full width
      frame.style.aspectRatio = isFlow ? "" : `1600 / ${height}`;
      stage.style.height = isFlow ? "" : `${height}px`;
      if (isFlow) { shell.scale = 1; onFit?.(shell); return; }
      if (root.classList.contains("full")) {      // full screen: as big as the screen allows (the box centres it)
        frame.style.width = `${Math.min(innerWidth, innerHeight * 1600 / height)}px`;
      } else if (!embed) {
        // As wide as the box allows, but never taller than the window, so nothing needs scrolling
        frame.style.width = "100%";
        const others = root.scrollHeight - frame.offsetHeight;
        const maxW = (window.innerHeight - others) * 1600 / height;
        if (frame.offsetWidth > maxW) frame.style.width = `${Math.max(320, maxW)}px`;
      }
      shell.scale = Math.min(frame.clientWidth / 1600, frame.clientHeight / height);
      stage.style.transform = `scale(${shell.scale})`;
      onFit?.(shell);                   // lets an activity size things that live outside the stage
    }
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    document.fonts?.ready.then(fit);    // the web font changes text height, so measure again once it is in
    fit();
    return shell;
  }

  return { init, connect: connectScorm };   // connect: the tracking alone, for pages drawn with shared/frame.js
})();
