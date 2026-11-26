/* DEEP site · a small stand-in for Moodle's SCORM 1.2 API.
   The activities (shared/shell.js) look for window.API in the page around them. The player (play.html) defines it here:
   - what an activity saves (progress, status) is kept in the browser (localStorage), per participant code and activity,
     so a teacher who comes back finds their progress;
   - every value the activity sets (answers, interactions, status, time) is also sent to api/log.php, with the code,
     the activity and the time, and appended to a file on the server (data/log-YYYY-MM.jsonl).
   Nothing here needs changes in the activities. */
(function () {
  const CODE_KEY = "deep:code";
  const code = (() => { try { return localStorage.getItem(CODE_KEY) || ""; } catch { return ""; } })();
  const params = new URLSearchParams(location.search);
  const act = params.get("a") || "";
  const stateKey = `deep:state:${code}:${act}`;
  const session = Math.random().toString(36).slice(2, 10);   // one id per opening of the activity

  let state = {};
  try { state = JSON.parse(localStorage.getItem(stateKey) || "{}"); } catch { state = {}; }
  let queue = [];

  const save = () => { try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch {} };
  const send = () => {
    if (code === "sans-code") { queue = []; return; }   // « Découvrir sans code »: progress stays in this browser, nothing is sent
    if (!queue.length) return;
    const body = JSON.stringify({ code, act, session, events: queue });
    queue = [];
    try {
      if (!navigator.sendBeacon || !navigator.sendBeacon("api/log.php", new Blob([body], { type: "application/json" })))
        fetch("api/log.php", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    } catch {}
  };

  window.API = {
    LMSInitialize() {
      if (!state["cmi.core.lesson_status"]) state["cmi.core.lesson_status"] = "not attempted";
      queue.push({ k: "open", v: "", t: new Date().toISOString() });
      send();
      return "true";
    },
    LMSGetValue(k) {
      if (k === "cmi.core.student_id" || k === "cmi.core.student_name") return code;
      if (k === "cmi.interactions._count") return String(state["_count"] || 0);
      return state[k] == null ? "" : String(state[k]);
    },
    LMSSetValue(k, v) {
      v = String(v);
      const m = /^cmi\.interactions\.(\d+)\.id$/.exec(k);
      if (m) state["_count"] = Math.max(state["_count"] || 0, +m[1] + 1);
      if (state[k] === v) return "true";   // unchanged (also the time, while it has not moved): not logged again
      state[k] = v;
      if (k !== "cmi.suspend_data") queue.push({ k, v, t: new Date().toISOString() });   // suspend_data stays in the browser
      return "true";
    },
    LMSCommit() { save(); send(); return "true"; },
    LMSFinish() { save(); queue.push({ k: "close", v: "", t: new Date().toISOString() }); send(); return "true"; },
    LMSGetLastError: () => "0", LMSGetErrorString: () => "", LMSGetDiagnostic: () => ""
  };
})();
