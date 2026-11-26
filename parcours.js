/* DEEP IA · the 8 questions and the teacher's path, shared by choisir.html, parcours.html and play.html.
   The path is kept in this browser, under the teacher's code (localStorage "deep:parcours:<code>", since 26 Nov 2026;
   before: one "deep:parcours" for the whole browser, moved under the first code that loads it):
     { questions: ["generative", "fondements", ...]   the chosen questions, in the teacher's order
       done: ["generative"]                             the questions the teacher has moved on from (« Question suivante »)
       chosen: "2026-11-26T…"                           when the path was chosen }
   open: the module is on the site; board: its home in the player. goal: the pupils' side (draft pairing, from the Figma mockup).
   parts: what the question holds, in the order of the question's page (« Pour toi » = me, « Pour ta classe » = class);
     a = the activity in the player, way = the two ways in for the teacher (1 = watch, 2 = read), img = the picture on the board.
     A part counts as done when its activity is « completed » in this browser (see isDone).
   pose: the host's picture on the bridge between two questions (pont.html); keep: what to take away, shown when the
   teacher leaves the question; hello: the host's line when the question comes next (✎ drafts).
   Objectives: from choix-modules (Moodle). */
(function () {
  const Q = [
    { id: "fondements", title: "Quels sont les fondements de l’IA ?", short: "Les fondements", host: "Anne", img: "images/anne-salue.png", pose: "bienvenue/images/anne-salue.png",
      keep: ["Une machine calcule très vite, mais ne comprend pas comme nous ce qu’elle fait.",          /* the slides' key points (texte-fondements) */
             "Un algorithme est une suite d’instructions précises : la machine les suit à la lettre.",
             "Avec l’apprentissage automatique, la machine trouve elle‑même des règles à partir d’exemples."],
      hello: "Une machine qui dessine, qui apprend… Mais sur quoi repose l’IA ? On commence par les bases.",
      open: true, module: "Module1", board: "play.html?a=Module1/intro-module", goal: "découvrent ce qu’est une machine",
      obj: ["Les trois bases de l’IA : la machine, les algorithmes et l’apprentissage à partir de données.", "Les grandes étapes de son histoire."],
      parts: [
        { id: "video", a: "Module1/video-algorithmes", side: "me", way: 1, t: "La vidéo", m: "4 min" },
        { id: "frise", a: "Module1/frise-ia-scorm", side: "me", way: 1, t: "La frise", m: "5 min" },
        { id: "texte", a: "Module1/texte-fondements", side: "me", way: 2, t: "Le texte", m: "10 min" },
        { id: "quiz", a: "Module1/quiz-texte", side: "me", way: 2, t: "Le quiz", m: "5 min" },
        { id: "fin", a: "Module1/quiz-fin", side: "me", t: "Teste tes connaissances", m: "" },
        { id: "rd1", a: "Module1/robot-dessine-1-ecm", side: "class", t: "Robot dessine 1", m: "Suivre un programme · 20 min", img: "Module1/images-catalogue/robot-dessine-1.jpg" },
        { id: "rd2", a: "Module1/robot-dessine-2-ecm", side: "class", t: "Robot dessine 2", m: "Une instruction floue · 20 min", img: "Module1/images-catalogue/robot-dessine-2.jpg" },
        { id: "ra", a: "Module1/robot-apprend-ecm", side: "class", t: "Robot apprend à dessiner", m: "Apprendre d’exemples · 20 min", img: "Module1/images-catalogue/robot-apprend.jpg" }
      ] },
    { id: "generative", title: "Comment fonctionne l’IA générative ?", short: "L’IA générative", host: "Claudia", img: "images/claudia-salue.png", pose: "bienvenue/images/claudia-salue.png",
      hello: "Une IA qui écrit, dessine, répond… mais comment fait-elle ? Et pourquoi se trompe-t-elle parfois avec tant d’assurance ?",
      open: true /* on the site since 26 Nov 2026 */, module: "Module2", board: "play.html?a=Module2/intro-module", goal: "comprennent comment elle fonctionne",
      obj: ["Comment une IA générative produit ses réponses.", "Pourquoi elle peut « halluciner »."],
      keep: [   /* the slides' key points (Module2/texte-ia), from Module2/site.json */
             "L’IA générative prédit le mot suivant en calculant des probabilités.",
             "Elle ne manipule que des nombres : elle ne comprend pas comme nous ce qu’elle écrit.",
             "Des humains ont noté ses réponses pour la corriger ; ce travail reste souvent invisible."],
      parts: [   /* from Module2/site.json */
        {"id": "video", "a": "Module2/video-ia", "side": "me", "way": 1, "t": "La vidéo", "m": "3 min"},
        {"id": "cartes", "a": "Module2/flash-cards", "side": "me", "way": 1, "t": "Les cartes", "m": "5 min"},
        {"id": "texte", "a": "Module2/texte-ia", "side": "me", "way": 2, "t": "Les diapositives", "m": "8 min"},
        {"id": "trous", "a": "Module2/texte-trous", "side": "me", "way": 2, "t": "Le texte à trous", "m": "10 min"},
        {"id": "fin", "a": "Module2/quiz-fin", "side": "me", "t": "Teste tes connaissances", "m": ""},
        {"id": "mh", "a": "Module2/machine-histoires-ecm-v2", "side": "class", "t": "La Machine à Histoires", "m": "Jouer la machine · 45 min", "img": "Module2/images-catalogue/machine-histoires.jpg"},
        {"id": "pr", "a": "Module2/parcours-requete-ecm", "side": "class", "t": "Parcours d’une requête", "m": "De la question à la réponse · 20 min", "img": "Module2/images-catalogue/parcours-requete.jpg"}
      ] },
    { id: "quand", title: "Quand utilise-t-on l’IA ?", short: "Quand l’utiliser", host: "Léo", img: "images/leo-ouvre.png", pose: "bienvenue/images/leo-ouvre.png",
      open: true /* on the site since 26 Nov 2026 */, module: "Module3", board: "play.html?a=Module3/intro-module",
      hello: "L’IA peut beaucoup… mais faut-il tout lui demander ? Voyons quand elle vaut vraiment la peine.",
      keep: [   /* the slides' key points (Module3/texte-usages), from Module3/site.json */
             "L’IA est un outil, pas un remplaçant : ce qu’elle produit est un brouillon, l’enseignant·e valide, adapte et décide.",
             "La qualité du résultat dépend de la demande : rôle, objectif, contexte, contraintes.",
             "Rester critique : vérifier les faits et les sources, repérer les biais, dire qu’on a utilisé l’IA."],
      parts: [   /* from Module3/site.json */
        {"id": "video", "a": "Module3/video-usages", "side": "me", "way": 1, "t": "La vidéo", "m": "2 min"},
        {"id": "cartes", "a": "Module3/flash-cards-usages", "side": "me", "way": 1, "t": "Les cartes", "m": "5 min"},
        {"id": "texte", "a": "Module3/texte-usages", "side": "me", "way": 2, "t": "Les diapositives", "m": "10 min"},
        {"id": "exercices", "a": "Module3/texte-reviser", "side": "me", "way": 2, "t": "Les exercices", "m": "10 min"},
        {"id": "identifia", "a": "Module3/identifia-ecm", "side": "class", "t": "Identif’IA", "m": "Avec ou sans IA ? · 45 min", "img": "Module3/images-catalogue/identifia.jpg"}
      ],
      goal: "portent un regard critique sur l’IA",
      obj: ["Quelles tâches confier à l’IA… et lesquelles ne pas lui confier.", "Garder la main : vérifier, adapter, décider."] },
    { id: "donnees", title: "Qu’est-ce que les données ?", short: "Les données", host: "Tomas", img: "images/tomas-ouvre.png", pose: "bienvenue/images/tomas-salue.png", open: false,
      goal: "comprennent comment l’IA utilise les données",
      obj: ["D’où viennent les données qui nourrissent une IA.", "Les biais des données et leurs conséquences."] },
    { id: "concevons", title: "Comment concevons-nous l’IA ?", short: "Concevoir l’IA", open: false, goal: "comprennent que les algorithmes ne sont pas neutres", obj: [] },
    { id: "responsabilites", title: "Quelles sont nos responsabilités ?", short: "Nos responsabilités", open: false, goal: "comprennent que les algorithmes ne sont pas neutres", obj: [] },
    { id: "cout", title: "Quel est le coût de l’IA ?", short: "Le coût de l’IA", open: false, goal: "sachent que l’IA consomme des ressources", obj: [] },
    { id: "humains", title: "Comment interagissent les humains et les machines ?", short: "Humains et machines", open: false, goal: "", obj: [] }
  ];
  const byId = id => Q.find(q => q.id === id);
  const code = () => { try { return localStorage.getItem("deep:code") || ""; } catch { return ""; } };
  const key = () => `deep:parcours:${code()}`;

  function load() {
    let p = {};
    try {
      const old = localStorage.getItem("deep:parcours");   // the path saved before 26 Nov 2026: it goes to the code in use
      if (old && code() && !localStorage.getItem(key())) { localStorage.setItem(key(), old); localStorage.removeItem("deep:parcours"); }
      p = JSON.parse(localStorage.getItem(key()) || "{}");
    } catch {}
    const questions = (p.questions || []).filter(byId);
    return { questions, done: (p.done || []).filter(id => questions.includes(id)), chosen: p.chosen || "" };
  }
  function save(p) { try { localStorage.setItem(key(), JSON.stringify(p)); } catch {} }

  /* Where « Commencer » leads: the code page the first time; then the welcome (no questions chosen yet), else
     the page of the question the teacher is on, else (all done) the path. */
  function resume() {
    if (!code()) return "code.html";
    const p = load(), q = current(p);
    const last = [...p.questions].reverse().map(byId).find(x => x.open);   // all done: back to the last open question
    return !p.questions.length ? "bienvenue.html" : q ? q.board : last ? last.board : "parcours.html";
  }

  /* The question to work on now: the first open one in the teacher's order that is not done. */
  function current(p) { return p.questions.map(byId).find(q => q.open && !p.done.includes(q.id)) || null; }

  /* Is this part done? Its activity's state, as deep-api.js keeps it (« deep:state:<code>:<activity> »). */
  function isDone(part) {
    try {
      const st = JSON.parse(localStorage.getItem(`deep:state:${code()}:${part.a}`) || "{}");
      return ["completed", "passed"].includes(st["cmi.core.lesson_status"]);
    } catch { return false; }
  }
  /* What to do next in a question: the way in already started (else the first), then « Teste tes connaissances »,
     then the classroom activities. null when everything is done. */
  function suggest(q) {
    const parts = q.parts || [], done = new Set(parts.filter(isDone).map(x => x.id));
    const ways = [1, 2].map(w => parts.filter(x => x.way === w));
    const way = ways.find(w => w.some(x => done.has(x.id))) || ways[0];
    return [...way, ...parts.filter(x => !x.way)].find(x => !done.has(x.id)) || null;
  }
  /* The question a player activity belongs to, and its part */
  function partOf(a) {
    for (const q of Q) { const x = (q.parts || []).find(p => p.a === a); if (x) return { q, part: x }; }
    return null;
  }

  /* « Premiers pas »: the four steps of the first visit, shown in the header of the code page, Bienvenue and the choice
     (26 Nov 2026). n = the step shown now. Only on the first visit (no path chosen yet), except on the code page. */
  const FIRST = ["Ton code", "Bienvenue", "Tes questions", "C’est parti"];
  function firstSteps(el, n, always = false) {
    if (!el || (!always && load().questions.length)) return false;
    el.innerHTML = `<span class="lbl">Premiers pas</span>` + FIRST.map((s, i) => `${i ? "<b></b>" : ""}<span class="${i + 1 < n ? "done" : i + 1 === n ? "on" : ""}"${i + 1 === n ? ' aria-current="step"' : ""}><i>${i + 1 < n ? "✓" : i + 1}</i>${s}</span>`).join("");
    el.hidden = false;
    return true;
  }
  /* Without a code (« Découvrir sans code »): the site works, nothing is sent */
  const NO_CODE = "sans-code";

  /* Same log as the activities (deep-api.js): code, activity, session, events. */
  function log(k, v, act = "parcours") {
    if (code() === NO_CODE) return;   // without a code, nothing is recorded
    const body = JSON.stringify({ code: code(), act, session: Math.random().toString(36).slice(2, 10),
      events: [{ k, v: String(v), t: new Date().toISOString() }] });
    try { navigator.sendBeacon && navigator.sendBeacon("api/log.php", new Blob([body], { type: "application/json" })); } catch {}
  }

  window.DEEP = { Q, byId, load, save, current, log, isDone, suggest, partOf, resume, code, firstSteps, NO_CODE };
})();
