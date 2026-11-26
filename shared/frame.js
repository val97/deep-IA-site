/* DEEP IA · the page frame (H2), shared by every page that opens in the player. Needs shared/shell.js (tracking) and
   shared/frame.css. The page holds   <main class="stage"><section class="tutor" id="tutor"></section><section class="desk">…</section></main>
   and calls
     const frame = Frame.init({ guide: "Anne", pose: "anne", steps: ["La vidéo · 4 min", "La frise", …], now: 1, narrow: true });
     frame.talk({ pose: "salue", say: "…", more: "…", keep: ["…"], replies: [[label, action, go?], …] })
         pose  = a picture bienvenue/images/<pose>-<name>.png (salue, montre, pense, debout…)
         say   = the big line (may hold <em> and <u>); more = text under it (a line, or paragraphs <p>…</p>); keep = a list of key points
         replies = what you can say to the guide: [label, action] chips under her text (action = a function, or an address)
                   [label, action, true] = the way on: the one mint button, always bottom-right of the desk (since 26 Nov 2026)
         wait  = a label for that button while it is not yet available (shown greyed out); lead = a few words before the chips
     frame.aside(true / false)   the guide's column folds away / comes back
     frame.steps(now, state)     redraws the step line: state(k) → { done, can } (can = a button that calls onStep(k))
   steps may also be objects { mark: "?", label: "Pourquoi" } (mark = what the circle shows); onStep(k) is optional.
     frame.scorm                 the tracking (get, set, commit, record), as in Shell.init
   Texts with French spaces: write them with &nbsp; before : ; ? ! » and after «. */
const Frame = (() => {
  const POSES = new URL("../bienvenue/images/", document.currentScript.src);
  /* where the body's centre line is in each pose picture, as a share of the picture's height (between the centre of the head
     and the centre of the legs; measured 26 Nov 2026 from the pictures): the figure is placed on it, so changing pose never moves her */
  const CENTER = { "anne-debout": .159, "anne-montre": .417, "anne-pense": .157, "anne-salue": .242,
                   "claudia-ouvre": .235, "claudia-pense": .127, "claudia-pointe": .143, "claudia-salue": .239,
                   "leo-montre": .438, "leo-ouvre": .296, "leo-pense": .153,
                   "tomas-ouvre": .228, "tomas-pense": .131, "tomas-pointe": .147, "tomas-salue": .219 };
  const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function init({ guide = "Anne", pose = "anne", steps = [], now = 1, narrow = false, onStep = null } = {}) {
    const tutor = document.getElementById("tutor");
    document.body.classList.toggle("narrow", narrow);
    tutor.setAttribute("aria-label", guide);
    const stepHTML = (at, state) => steps.map((s, i) => {
      const k = i + 1, mark = s.mark ?? k, label = s.label ?? s, st = state(k), cls = k === at ? "on" : st.done ? "done" : "";
      const inner = `<i>${mark}</i>${k === at ? `<span>${label}</span>` : `<span class="sr">${label}</span>`}`;
      return `${i ? "<b></b>" : ""}${k !== at && st.can && onStep ? `<button type="button" class="${cls}" data-step="${k}">${inner}</button>` : `<span class="${cls}"${k === at ? ' aria-current="step"' : ""}>${inner}</span>`}`;
    }).join("");
    tutor.innerHTML = `
      ${steps.length ? `<nav class="stepline${steps.length > 7 ? " many" : ""}" id="f-steps" aria-label="Les étapes">${stepHTML(now, k => ({ done: k < now, can: false }))}</nav>` : ""}
      <div class="bubble" aria-live="polite"><span class="who">${guide}</span><p class="say" id="f-say"></p><div class="more" id="f-more"></div><ul class="keep" id="f-keep"></ul><div class="replies" id="f-replies"></div></div>
      <div class="guide" aria-hidden="true"><img id="f-guide" alt=""></div>`;
    const $ = id => document.getElementById(id);

    const btn = ([label, action]) => {
      const b = document.createElement(typeof action === "string" ? "a" : "button");
      b.innerHTML = label;
      if (typeof action === "string") { b.href = action; b.target = "_top"; }
      else { b.type = "button"; b.addEventListener("click", action); }
      return b;
    };
    // the way on: one mint button, always in the same place (bottom-right of the desk); greyed out while the step is not done
    function setNext(go, wait) {
      document.getElementById("f-next")?.remove();
      if (!go && !wait) return;
      const b = go ? btn(go) : Object.assign(document.createElement("button"), { type: "button", disabled: true, innerHTML: wait });
      b.id = "f-next"; b.className = "f-next"; b.insertAdjacentHTML("beforeend", ARROW);
      document.body.appendChild(b);
    }
    /* The figure's top: fixed (frame.css, 44%), lowered only if a bubble would cover her face, and never raised again, so in
       practice it settles on the first (longest) screen and stays put (UI review, 26 Nov 2026).
       Since the narrower column (26 Nov 2026): the place she keeps is lowered at most to 52% of the column. A longer bubble
       (a story, the end summary) lowers her for that screen only; the next screens find her back in her place. */
    let low = 0;
    function keepClear() {
      const g = tutor.querySelector(".guide"), b = tutor.querySelector(".bubble");
      if (!g || !b || document.body.classList.contains("aside")) return;
      const need = b.getBoundingClientRect().bottom - tutor.getBoundingClientRect().top + 10;
      g.style.top = "";
      const cap = tutor.clientHeight * .52;
      if (need <= cap) low = Math.max(low, need);
      const top = Math.max(g.offsetTop, low, need);
      if (top > g.offsetTop) g.style.top = `${top}px`;
    }
    addEventListener("resize", () => { low = 0; keepClear(); });
    function talk({ pose: p = "salue", say = "", more = "", keep = [], replies = [], wait = "", lead = "" }) {
      const img = $("f-guide"), src = new URL(`${pose}-${p}.png`, POSES).href;
      if (img.src !== src) img.src = src;
      img.style.setProperty("--c", CENTER[`${pose}-${p}`] ?? .25);
      requestAnimationFrame(keepClear);
      const s = $("f-say"); s.innerHTML = say; s.classList.remove("anim"); void s.offsetWidth; s.classList.add("anim");
      $("f-more").innerHTML = more;
      $("f-keep").innerHTML = keep.map(k => `<li>${k}</li>`).join("");
      const asks = replies.filter(r => !r[2]);
      $("f-replies").replaceChildren(...(asks.length && lead ? [Object.assign(document.createElement("span"), { className: "lead", innerHTML: lead })] : []),
        ...asks.map(r => { const b = btn(r); b.className = "chip"; return b; }));
      setNext(replies.find(r => r[2]), wait);
    }
    const aside = on => document.body.classList.toggle("aside", !!on);
    const drawSteps = (at, state) => { const nav = $("f-steps"); if (nav) nav.innerHTML = stepHTML(at, state); };
    $("f-steps")?.addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b) onStep?.(+b.dataset.step); });
    return { talk, aside, steps: drawSteps, scorm: Shell.connect() };
  }
  return { init };
})();
