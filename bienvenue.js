/* DEEP IA · Bienvenue (look E; content order F, 26 Nov 2026): three moments before the choice of questions.
   The home helps to decide; Bienvenue helps to start: why it matters for your class, then what comes next.
   1 « Tes élèves » (your opinion, then the children's drawings) · 2 « Et toi ? » (the six cards) · 3 « Ton parcours » (the guides).
   Claudia (left) and Léo (right) never change place; only their pose changes. Version C is in site/design/old/bienvenue-c/.
   ============================================================
   CONTENU — modifie seulement cette partie.
   Lines marked are drafts by Claude (see site/design/bienvenue-v2.md).
   Poses: a picture in bienvenue/images/ (claudia-salue, claudia-pointe, claudia-ouvre, leo-ouvre, leo-pense, leo-montre…).
   ============================================================ */
const MOMENTS = ["Tes élèves", "Et toi ?", "Ton parcours"];       // the names in the bar at the bottom

/* 1 · Tes élèves : first your opinion alone, then Léo answers and the drawings come */
const M1 = {
  hello: { title: "Bonjour ! Parler d’IA à l’école, qu’en penses-tu ?",   //
           lead: "Nous sommes Claudia et Léo, enseignant·e·s. D’abord, ton avis." },   //
  poll: { id: "ia_a_l_ecole", options: ["Bonne idée", "Je suis partagé·e", "Plutôt pas"] },
  react: { "Bonne idée": "Tant mieux : tes élèves, eux, en parlent déjà.",             // Léo answers the poll
           "Je suis partagé·e": "On comprend. Mais tes élèves, eux, en parlent déjà.",    //
           "Plutôt pas": "On comprend. Pourtant, tes élèves en parlent déjà." },         //
  title: "Qu’en savent les enfants ?",
  lead: "Une classe de Saint-Gall nous a dessiné l’IA. À ton avis ?",   //
  guess: { id: "representations_enfants", options: ["De bonnes idées", "Rien du tout", "Des idées très différentes"] },
  sheets: [
    { src: "bienvenue/images/l10.jpg", alt: "Dessin d’un enfant : un grand écran gris surmonté du signe du wifi", caption: "« ChatGPT, c’est comme Dieu, elle sait tout. »" },
    { src: "bienvenue/images/l15.jpg", alt: "Dessin d’un enfant : un bonhomme et une puce électronique en couleur", caption: "Une puce électronique, vue en démontant un ordinateur." },   //
    { src: "", alt: "Feuille blanche", caption: "Aucune représentation." }],   //
  closing: "Trois enfants, trois idées. Ce parcours t’aide à leur répondre." };   //

/* 2 · Et toi ? The six cards */
const M2 = {
  title: "Et toi, tu la reconnais ?",   //
  lead: "L’IA est partout. Touche ce qui l’utilise, puis vérifie.",   //
  items: [
    { ic: "video", label: "Les suggestions de vidéos", ai: true, why: "un modèle entraîné sur ce que tu regardes" },
    { ic: "calc", label: "La calculatrice", ai: false, why: "suit des règles fixes, écrites par des humains" },
    { ic: "lang", label: "La traduction automatique", ai: true, why: "un modèle entraîné sur des millions de textes" },
    { ic: "timer", label: "La minuterie du four", ai: false, why: "compte le temps, c’est tout" },
    { ic: "face", label: "Le déverrouillage par le visage", ai: true, why: "un modèle entraîné sur des photos de visages" },
    { ic: "lift", label: "L’ascenseur", ai: false, why: "suit un programme écrit à l’avance" }],
  score: [[6, "6 sur 6, bravo !"], [4, "{n} sur 6 !"], [0, "{n} sur 6."]],   // Léo, after « Vérifier »
  after: "Pas facile, même pour nous. C’est par là qu’on commence." };   //

/* 3 · Ton parcours */
const M3 = {
  title: "Quatre collègues t’accompagnent",   //
  lead: "Touche une personne pour savoir ce qu’elle t’apprend.",   //
  team: [
    { who: "Claudia", img: "claudia-salue", q: "L’IA générative", say: "Moi, je t’emmène dans « Comment fonctionne l’IA générative ? »." },
    { who: "Anne", img: "anne-salue", q: "Les fondements", say: "Avec moi, tu découvres les fondements de l’IA." },
    { who: "Léo", img: "leo-ouvre", q: "Quand l’utiliser", say: "Avec moi, tu découvres quand utiliser l’IA, et comment." },   // (shortened)
    { who: "Tomas", img: "tomas-ouvre", q: "Les données", say: "Avec moi, tu découvres les données : d’où elles viennent." }],   // (shortened)
  path: "Tu choisis au moins 3 questions. Pour chacune : comprendre, puis une activité prête pour ta classe." };   //

const LABELS = { check: "Vérifier", next: "Continuer", choose: window.BV_END?.label || "Choisir mes questions", swipe: "ou glisse ←" };
const CHOOSE_URL = window.BV_END?.url || "choisir.html";   // pourquoi.html sets BV_END: back to where the teacher came from
/* ============================================================ */


/* ---------- Saved progress (this browser) and the learning data (same names as before; « version » = f since this order) ---------- */
const KEY = `deep:bienvenue:f:${DEEP.code()}`;   // per code: two teachers on one computer don't share answers (code review)
let S = {}; try { S = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
S.answers ||= {}; S.picks ||= []; S.opened ||= 0; S.team ||= []; S.max ||= 1;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const log = (k, v) => DEEP.log(k, v, window.BV_END ? "pourquoi" : "bienvenue");   // pourquoi.html logs under its own name
const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w ]/g, "").replace(/ /g, "_");
if (!S.v) { S.v = "f"; save(); log("version", "f"); }   // f = order « Tes élèves · Et toi ? · Ton parcours » (before: « Où est l’IA ? · Les enfants · L’équipe »)

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const fr = s => s.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
const T = s => fr(s.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
const IMG = n => `bienvenue/images/${n}.png`;
const ICONS = {
  video: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  lang: '<path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 3-2 6-6 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  face: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>',
  lift: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 9l3-3 3 3M9 15l3 3 3-3"/>' };
/* The centre line of the body in each pose picture: halfway between the centre of the head and the centre of the legs,
   from the picture's left edge, as a share of its height (measured on the PNGs, 26 Nov 2026). The CSS pins that line,
   so the head and the body stay where they are when the pose changes; only the arms move. A new pose needs its value here. */
const FEET = { "claudia-ouvre": .234, "claudia-pense": .124, "claudia-pointe": .142, "claudia-salue": .242,
               "leo-montre": .439, "leo-ouvre": .294, "leo-pense": .151 };
function pose(img, name) { if (!img) return; img.style.setProperty("--feet", FEET[name] ?? .25); if (img.src.endsWith(`/${name}.png`)) return; img.src = IMG(name); img.classList.remove("pop"); void img.offsetWidth; img.classList.add("pop"); }
const say = t => { $("#said").textContent = t; };
const pollHTML = p => p.options.map(o => `<button type="button" class="opt" data-poll="${p.id}" aria-pressed="${S.answers[p.id] === o}">${T(o)}</button>`).join("");
const leo = t => `<span class="bub guide"><b>Léo</b>${T(t)}</span>`;
const SIDES = [0, 2];   // Claudia and Léo: the two guides at the sides (index in M3.team)

/* the poses of the two guides for each moment (they never change place) */
const spotScore = () => M2.items.filter((it, k) => it.ai === S.picks.includes(k)).length;
function poses() {
  const a = S.answers[M1.poll.id];
  const [l, r] = m === 1 ? (!a ? ["claudia-salue", "leo-ouvre"] : S.opened >= 3 ? ["claudia-ouvre", "leo-ouvre"] : ["claudia-pointe", a === "Plutôt pas" ? "leo-pense" : "leo-montre"])
               : m === 2 ? (S.checked ? ["claudia-ouvre", spotScore() >= 4 ? "leo-montre" : "leo-pense"] : [S.picks.length ? "claudia-pointe" : "claudia-ouvre", "leo-ouvre"])
               : ["claudia-salue", "leo-ouvre"];
  pose($("#gl"), l); pose($("#gr"), r);
}

/* ---------- Drawing the three moments ---------- */
function draw1() {
  const a = S.answers[M1.poll.id], can = !!S.answers[M1.guess.id];
  $("#m1").classList.toggle("hello", !a);
  $("#t1").innerHTML = T(a ? M1.title : M1.hello.title);
  const done = S.opened >= M1.sheets.length;   // after the three drawings, Léo says the closing line in his bubble
  $("#lead1").innerHTML = !a ? T(M1.hello.lead) : done ? leo(M1.closing) : (M1.react[a] ? leo(M1.react[a]) : "") + `<span class="task">${T(M1.lead)}</span>`;
  $("#poll1").hidden = !!a; $("#poll1").innerHTML = pollHTML(M1.poll);
  $("#poll1b").hidden = !a; $("#poll1b").innerHTML = pollHTML(M1.guess);
  $("#wall").hidden = !a;
  $("#wall").innerHTML = M1.sheets.map((sh, k) => {
    const open = k < S.opened;
    return `<button type="button" class="sheet${open ? " open" : ""}" data-sheet="${k}" ${open || k !== S.opened || !can ? "disabled" : ""} aria-label="${open ? T(sh.alt) : `Retourner le dessin ${k + 1}`}">
      <span class="tape" aria-hidden="true"></span><span class="in"><span class="fa back" aria-hidden="true">?</span>
      <span class="fa front">${sh.src ? `<img src="${sh.src}" alt="">` : "feuille blanche"}</span></span>
      <span class="cap"${open ? "" : " hidden"}>${T(sh.caption)}</span></button>`;
  }).join("");
}
function draw2() {
  const done = S.checked;
  $("#t2").innerHTML = T(M2.title);
  if (done) {
    const n = spotScore(), line = (M2.score.find(([k]) => n >= k) || [0, ""])[1].replace("{n}", n);
    $("#lead2").innerHTML = leo(`${line} ${M2.after}`);
  } else $("#lead2").innerHTML = `<span class="task">${T(M2.lead)}</span>`;
  $("#cards").innerHTML = M2.items.map((it, k) => {
    if (!done) return `<button type="button" class="gc" data-pick="${k}" aria-pressed="${S.picks.includes(k)}"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[it.ic]}</svg></span>${T(it.label)}</button>`;
    const ok = it.ai === S.picks.includes(k);
    return `<div class="gc shown ${it.ai ? "yes" : "no"} ${ok ? "right" : "wrong"}"><span class="v">${it.ai ? "IA" : "Pas d’IA"}</span>${T(it.label)}<span class="why">${T(it.why)}</span></div>`;
  }).join("");
}
function draw3() {
  $("#t3").innerHTML = T(M3.title);   // under the title: what comes next, then the task
  $("#lead3").innerHTML = `${T(M3.path)}<span class="task">${T(M3.lead)}</span>`;
  const q = p => `<b>${T(p.who)}</b>${T(p.q)}`;
  $("#team").innerHTML = M3.team.map((p, k) => SIDES.includes(k) ? "" : `<button type="button" class="member" data-who="${k}"><img src="${IMG(p.img)}" alt=""><span class="q">${q(p)}</span></button>`).join("");
  document.querySelectorAll(".gd").forEach(g => { g.querySelector(".q").innerHTML = q(M3.team[+g.dataset.who]); });
}

/* ---------- Moving between moments: the button, the 1 · 2 · 3, a swipe, the arrow keys ---------- */
let m = 0;
const stage = $(".stage");
const canLeave = k => k === 1 ? S.opened >= 3 : k === 2 ? !!S.checked : false;
function show(k, dir = 0) {
  if (k < 1 || k > 3) return;
  m = k;
  document.querySelectorAll(".m").forEach((s, i) => { s.classList.toggle("on", i === k - 1); s.classList.remove("from-r", "from-l"); });
  if (dir) $(`#m${k}`).classList.add(dir > 0 ? "from-r" : "from-l");
  if (k > S.max) { S.max = k; log("etape_max", `${k}/3`); }
  if (k === 3 && !S.completed) { S.completed = true; log("lesson_status", "completed"); }
  S.m = k; save();
  stage.classList.toggle("m3", k === 3);
  document.querySelectorAll(".gd").forEach(g => g.tabIndex = k === 3 ? 0 : -1);
  poses(); drawSteps(); drawAction();
  say(`${MOMENTS[k - 1]}. ${$(`#t${k}`).textContent}`);
}
function drawSteps() {
  $("#steps3").innerHTML = MOMENTS.map((name, i) => {
    const k = i + 1, cls = k === m ? "on" : k <= S.max ? "done" : "";
    const inner = `<i>${k}</i><em>${T(name)}</em>`, sep = i < 2 ? `<b class="sep" aria-hidden="true"></b>` : "";
    return (k !== m && k <= S.max ? `<button type="button" class="${cls}" data-go="${k}" aria-label="Aller au moment ${k} : ${T(name)}">${inner}</button>`
                                  : `<span class="${cls}"${k === m ? ' aria-current="step"' : ""}>${inner}</span>`) + sep;
  }).join("") + `<span class="hint" aria-hidden="true">${T(LABELS.swipe)}</span>`;
}
function drawAction() {
  const go = $("#go"), choose = $("#choose");
  go.hidden = m === 3; choose.hidden = m !== 3;
  if (m === 2 && !S.checked) { go.firstChild.textContent = `${LABELS.check} `; go.disabled = !S.picks.length; }
  else { go.firstChild.textContent = `${LABELS.next} `; go.disabled = !canLeave(m); }
  choose.firstChild.textContent = `${LABELS.choose} `; choose.href = CHOOSE_URL;
  const hint = $(".hint"); if (hint) hint.hidden = !(m < 3 && canLeave(m));
}
function next() {
  if (m === 2 && !S.checked) { if (S.picks.length) check(); return; }
  if (canLeave(m)) show(m + 1, 1);
}
function prev() { if (m > 1) show(m - 1, -1); }
function check() {
  S.checked = true; save();
  log("ia_partout", S.picks.map(k => k + 1).join(" ") || "aucun");
  log("ia_partout_score", String(spotScore()));
  draw2(); poses(); drawAction(); say($("#lead2").textContent);
  $("#go").focus();
}

/* ---------- Interactions ---------- */
document.addEventListener("click", e => {
  const p = e.target.closest("[data-poll]");
  if (p) {
    const poll = [M1.poll, M1.guess].find(q => q.id === p.dataset.poll), a = p.textContent;
    S.answers[poll.id] = a; save(); log(poll.id, slug(a));
    draw1(); poses();
    if (poll === M1.poll) { say(`Léo : ${M1.react[a] || ""} ${M1.title} ${M1.lead}`); $("#poll1b .opt")?.focus(); }
    else $('#wall [data-sheet="0"]:not(:disabled)')?.focus();
    return;
  }
  const c = e.target.closest("[data-pick]");
  if (c) {
    const k = +c.dataset.pick;
    S.picks = S.picks.includes(k) ? S.picks.filter(x => x !== k) : [...S.picks, k]; save();
    c.setAttribute("aria-pressed", S.picks.includes(k));
    poses(); drawAction();
    return;
  }
  const sh = e.target.closest("[data-sheet]");
  if (sh && !sh.disabled) {
    S.opened = +sh.dataset.sheet + 1; save(); log("dessins_retournes", String(S.opened));
    sh.classList.add("open"); sh.disabled = true; sh.querySelector(".cap").hidden = false;
    say(M1.sheets[S.opened - 1].caption);
    const n = $(`#wall [data-sheet="${S.opened}"]`);
    if (n) { n.disabled = false; n.focus(); }
    else { $("#lead1").innerHTML = leo(M1.closing); poses(); say(`Léo : ${M1.closing}`); drawAction(); $("#go").focus(); }
    return;
  }
  const w = e.target.closest("[data-who]");
  if (w) {
    if (m !== 3) return;
    const pp = M3.team[+w.dataset.who];
    document.querySelectorAll(".member, .gd").forEach(x => x.classList.toggle("on", x === w));
    stage.classList.add("picked");
    $("#teamsay").innerHTML = `<p class="bub guide new"><b>${T(pp.who)}</b>${T(pp.say)}</p>`;
    say(`${pp.who} : ${pp.say}`);
    if (!S.team.includes(pp.who)) { S.team.push(pp.who); save(); log("equipe_touchee", S.team.join(" ")); }
    return;
  }
  const g = e.target.closest("[data-go]");
  if (g) { const k = +g.dataset.go; show(k, k > m ? 1 : -1); return; }
  if (e.target.closest("#choose")) log(window.BV_END ? "retour" : "vers_choix", "1");
});
$("#go").addEventListener("click", next);

/* swipe: touch / pen (left = next, right = back), and a horizontal two-finger swipe on a trackpad */
let sx = null, sy = null;
stage.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } });
stage.addEventListener("pointerup", e => {
  if (sx === null) return;
  const dx = e.clientX - sx, dy = e.clientY - sy; sx = sy = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) dx < 0 ? next() : prev();
});
stage.addEventListener("pointercancel", () => { sx = sy = null; });
let wheel = 0, wheelLock = false;
stage.addEventListener("wheel", e => {
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
  e.preventDefault();
  if (wheelLock) return;
  wheel += e.deltaX;
  if (Math.abs(wheel) > 80) { wheel > 0 ? next() : prev(); wheel = 0; wheelLock = true; setTimeout(() => { wheelLock = false; }, 700); }
}, { passive: false });
document.addEventListener("keydown", e => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

draw1(); draw2(); draw3();
show(S.m || 1);
