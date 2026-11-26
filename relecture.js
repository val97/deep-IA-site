/* DEEP IA · « Relecture » mode (26 Nov 2026): reviewers (teacher trainers) suggest new wordings on the real pages, without
   touching any file. The build loads this script in every page of the site; it does nothing unless the mode is on.
     - Turn it on: add ?relecture to any address (it stays on in this browser). Turn it off: « Quitter » in the bar, or ?relecture=0.
     - « Proposer un changement », then click a text: write the new wording and/or a comment, « Enregistrer ».
     - « Envoyer mes suggestions » sends them to the team's Google Sheet (address in config.js; site/logger/README.md), or, without
       an address or if sending fails, downloads a CSV file (opens in Excel) to send by email.
   Suggestions are kept in this browser (localStorage deep:relecture:list) until the reviewer clears them.
   Works across the player: the bar lives in the top page, clicks are caught in every page, the activity's iframe included. */
(function () {
  const ON = "deep:relecture", LIST = "deep:relecture:list", WHO = "deep:relecture:nom";
  const q = new URLSearchParams(location.search);
  try {
    if (q.has("relecture")) q.get("relecture") === "0" ? localStorage.removeItem(ON) : localStorage.setItem(ON, "1");
    if (!localStorage.getItem(ON)) return;
  } catch { return; }

  /* ============================================================
     CONTENU — les textes de la barre de relecture
     ============================================================ */
  const T = {
    mode: "Mode relecture",
    pick: "✎ Proposer un changement",
    picking: "Clique sur un texte…",
    cancelPick: "Annuler",
    count: n => n === 0 ? "aucune suggestion" : n === 1 ? "1 suggestion" : `${n} suggestions`,
    list: "Voir",
    send: "Envoyer mes suggestions",
    quit: "Quitter",
    name: "Ton nom (pour savoir qui propose quoi)",
    current: "Texte actuel",
    proposal: "Ta proposition",
    comment: "Commentaire (facultatif)",
    save: "Enregistrer",
    cancel: "Annuler",
    del: "Supprimer",
    empty: "Aucune suggestion pour l’instant.",
    sent: "Le fichier est téléchargé : envoie-le par e-mail. Tes suggestions restent ici jusqu’à ce que tu les effaces.",
    sending: "Envoi…",
    sentOnline: n => `Merci&nbsp;! ${n === 1 ? "Ta suggestion est envoyée" : `Tes ${n} suggestions sont envoyées`} à l’équipe.`,
    offline: "L’envoi n’a pas fonctionné : le fichier est téléchargé à la place, envoie-le par e-mail.",
    clear: "Tout effacer",
    clearAsk: "Effacer toutes tes suggestions de ce navigateur ?",
    close: "Fermer"
  };
  /* ============================================================ */

  const top = (() => { try { return window.top.document && window.top; } catch { return window; } })();
  const isTop = top === window;
  const load = () => { try { return JSON.parse(localStorage.getItem(LIST) || "[]"); } catch { return []; } };
  const store = l => { try { localStorage.setItem(LIST, JSON.stringify(l)); } catch {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const CSS = `
    .rl-bar { position: fixed; left: 50%; bottom: 14px; translate: -50% 0; z-index: 2147483000; display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; white-space: nowrap;
      max-width: calc(100vw - 24px); padding: 8px 10px 8px 14px; border-radius: 14px; background: #1F1F1F; color: #fff; font: 600 14px/1.3 Inter, system-ui, sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,.3); }
    .rl-bar b { color: #C9A3FF; font-weight: 800; }
    @media (max-width: 760px) { .rl-bar { flex-wrap: wrap; white-space: normal; justify-content: center; } }
    .rl-bar button { min-height: 38px; padding: 0 12px; border-radius: 9px; border: 0; font: 700 14px Inter, system-ui, sans-serif; cursor: pointer; background: #3A3A3A; color: #fff; }
    .rl-bar button.rl-main { background: #77E5B6; color: #0B514D; }
    .rl-bar button.rl-on { background: #C9A3FF; color: #1F1F1F; }
    .rl-bar button:focus-visible, .rl-pop button:focus-visible { outline: 3px solid #C9A3FF; outline-offset: 2px; }
    .rl-n { color: #ddd; font-weight: 600; }
    .rl-picking, .rl-picking * { cursor: crosshair !important; }
    .rl-hover { outline: 3px dashed #600FBD !important; outline-offset: 2px !important; background-color: rgba(201,163,255,.18) !important; }
    .rl-pop { position: fixed; z-index: 2147483001; width: min(440px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto; padding: 16px 18px; border-radius: 14px;
      background: #fff; color: #1F1F1F; box-shadow: 0 16px 40px rgba(0,0,0,.28); font: 400 15px/1.4 Inter, system-ui, sans-serif; text-align: left; }
    .rl-pop h4 { margin: 0 0 4px; font: 800 12px Inter, system-ui, sans-serif; letter-spacing: .05em; text-transform: uppercase; color: #600FBD; }
    .rl-pop .rl-cur { margin: 0 0 12px; padding: 8px 10px; border-radius: 8px; background: #F4F4F2; color: #4A4A4A; white-space: pre-wrap; }
    .rl-pop textarea { display: block; width: 100%; box-sizing: border-box; min-height: 74px; margin: 0 0 12px; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #ccc;
      font: 400 15px/1.4 Inter, system-ui, sans-serif; resize: vertical; }
    .rl-pop textarea:focus { outline: none; border-color: #600FBD; }
    .rl-pop .rl-row { display: flex; justify-content: flex-end; gap: 8px; }
    .rl-pop button { min-height: 40px; padding: 0 14px; border-radius: 9px; border: 1.5px solid #0B514D; background: #fff; color: #0B514D; font: 700 14px Inter, system-ui, sans-serif; cursor: pointer; }
    .rl-pop button.rl-main { background: #77E5B6; border-color: #77E5B6; }
    .rl-pop input { width: 100%; box-sizing: border-box; min-height: 40px; margin: 6px 0 12px; padding: 0 10px; border-radius: 8px; border: 1.5px solid #ccc; font: 600 15px Inter, system-ui, sans-serif; }
    .rl-pop ol { margin: 0 0 12px; padding: 0 0 0 20px; display: grid; gap: 10px; }
    .rl-pop li small { display: block; color: #4A4A4A; }
    .rl-pop li .rl-del { min-height: 30px; padding: 0 8px; margin-top: 4px; font-size: 13px; border-color: #ccc; color: #4A4A4A; }
    .rl-note { margin: 0 0 12px; padding: 8px 10px; border-radius: 8px; background: #E9FCF4; color: #0B514D; }`;
  const addCSS = doc => { if (doc.getElementById("rl-css")) return; const s = doc.createElement("style"); s.id = "rl-css"; s.textContent = CSS; doc.head.appendChild(s); };
  addCSS(document);

  /* ---------- the bar (top page only) ---------- */
  if (isTop) {
    const bar = document.createElement("div");
    bar.className = "rl-bar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", T.mode);
    document.body.appendChild(bar);
    top.__rl = { picking: false };
    const draw = () => {
      const n = load().length, p = top.__rl.picking;
      bar.innerHTML = `<b>${T.mode}</b><button type="button" class="${p ? "rl-on" : "rl-main"}" data-rl="pick">${p ? T.picking + " · " + T.cancelPick : T.pick}</button>
        <span class="rl-n">${T.count(n)}</span><button type="button" data-rl="list">${T.list}</button>
        <button type="button" data-rl="send"${n ? "" : " disabled"}>${T.send}</button><button type="button" data-rl="quit">${T.quit}</button>`;
    };
    top.__rl.draw = draw;
    top.__rl.setPicking = on => { top.__rl.picking = on; document.documentElement.classList.toggle("rl-picking", on); for (const f of frames()) f.documentElement.classList.toggle("rl-picking", on); draw(); };
    bar.addEventListener("click", e => {
      const b = e.target.closest("[data-rl]"); if (!b) return;
      const a = b.dataset.rl;
      if (a === "pick") top.__rl.setPicking(!top.__rl.picking);
      if (a === "list") showList();
      if (a === "send") send();
      if (a === "quit") { try { localStorage.removeItem(ON); } catch {} location.reload(); }
    });
    addEventListener("storage", e => { if (e.key === LIST) draw(); });
    draw();
  }
  function frames() { const out = []; try { for (const f of top.document.querySelectorAll("iframe")) { try { if (f.contentDocument) out.push(f.contentDocument); } catch {} } } catch {} return out; }

  /* ---------- picking a text, in this page (and its activity iframe) ---------- */
  const SEL = "h1,h2,h3,h4,h5,p,li,button,a,label,figcaption,small,b,strong,em,span,td,th,dt,dd,summary,legend,blockquote";
  const pickable = el => {
    const t = el && el.closest && el.closest(SEL);
    if (!t || t.closest(".rl-bar, .rl-pop")) return null;
    const txt = (t.innerText || t.textContent || "").trim();
    return txt && txt.length <= 800 ? t : null;
  };
  let hover = null;
  document.addEventListener("mouseover", e => {
    if (!top.__rl?.picking) return;
    const t = pickable(e.target); if (hover && hover !== t) hover.classList.remove("rl-hover");
    hover = t; if (t) t.classList.add("rl-hover");
  }, true);
  document.addEventListener("mouseout", () => { if (hover) hover.classList.remove("rl-hover"); hover = null; }, true);
  document.addEventListener("click", e => {
    if (!top.__rl?.picking) return;
    const t = pickable(e.target); if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    t.classList.remove("rl-hover");
    top.__rl.setPicking(false);
    edit(t);
  }, true);
  if (!isTop && top.__rl?.picking) document.documentElement.classList.add("rl-picking");

  /* ---------- the editor, next to the text ---------- */
  function where() {   // the page as the reviewer sees it: the player's activity, or the page itself
    try { const a = new URLSearchParams(top.location.search).get("a"); if (a) return `${a} (${top.document.title.replace(/^DEEP( IA)? · /, "")})`; } catch {}
    return `${location.pathname.split("/").slice(-2).join("/")} (${document.title.replace(/^DEEP( IA)? · /, "")})`;
  }
  function pop(doc, html, near) {
    doc.querySelectorAll(".rl-pop").forEach(p => p.remove());
    const p = doc.createElement("div"); p.className = "rl-pop"; p.setAttribute("role", "dialog"); p.innerHTML = html;
    doc.body.appendChild(p);
    const r = near ? near.getBoundingClientRect() : null, W = p.offsetWidth, H = p.offsetHeight, vw = doc.documentElement.clientWidth, vh = doc.documentElement.clientHeight;
    let left = r ? r.left : (vw - W) / 2, topY = r ? r.bottom + 10 : (vh - H) / 2;
    if (r && topY + H > vh - 12) topY = Math.max(12, r.top - H - 10);
    p.style.left = `${Math.max(12, Math.min(left, vw - W - 12))}px`; p.style.top = `${Math.max(12, Math.min(topY, vh - H - 12))}px`;
    return p;
  }
  function edit(el) {
    const doc = el.ownerDocument, cur = (el.innerText || el.textContent || "").trim();
    let name = ""; try { name = localStorage.getItem(WHO) || ""; } catch {}
    const p = pop(doc, `${name ? "" : `<h4>${T.name}</h4><input class="rl-name" autocomplete="name">`}
      <h4>${T.current}</h4><p class="rl-cur">${esc(cur)}</p>
      <h4>${T.proposal}</h4><textarea class="rl-new">${esc(cur)}</textarea>
      <h4>${T.comment}</h4><textarea class="rl-com" style="min-height:52px"></textarea>
      <div class="rl-row"><button type="button" class="rl-x">${T.cancel}</button><button type="button" class="rl-main rl-ok">${T.save}</button></div>`, el);
    const first = p.querySelector(".rl-name") || p.querySelector(".rl-new"); first.focus(); if (first.select) first.select();
    p.querySelector(".rl-x").onclick = () => p.remove();
    p.addEventListener("keydown", e => { if (e.key === "Escape") p.remove(); });
    p.querySelector(".rl-ok").onclick = () => {
      const nm = p.querySelector(".rl-name")?.value.trim(); if (nm) try { localStorage.setItem(WHO, nm); } catch {}
      const proposal = p.querySelector(".rl-new").value.trim(), comment = p.querySelector(".rl-com").value.trim();
      if (proposal === cur && !comment) return p.remove();   // nothing to keep
      const l = load();
      l.push({ date: new Date().toISOString().slice(0, 16).replace("T", " "), nom: nm || name, page: where(), actuel: cur, proposition: proposal === cur ? "" : proposal, commentaire: comment });
      store(l); p.remove(); top.__rl?.draw?.();
    };
  }

  /* ---------- the list, sending, clearing (top page) ---------- */
  function showList() {
    const l = load();
    const p = pop(document, `<h4>${T.count(l.length)}</h4>${l.length ? `<ol>${l.map((s, i) => `<li><small>${esc(s.page)}</small>« ${esc(s.actuel.slice(0, 90))}${s.actuel.length > 90 ? "…" : ""} »
        ${s.proposition ? `<br>→ « ${esc(s.proposition.slice(0, 90))}${s.proposition.length > 90 ? "…" : ""} »` : ""}${s.commentaire ? `<br><small>${esc(s.commentaire)}</small>` : ""}
        <br><button type="button" class="rl-del" data-i="${i}">${T.del}</button></li>`).join("")}</ol>` : `<p>${T.empty}</p>`}
      <div class="rl-row">${l.length ? `<button type="button" class="rl-clear">${T.clear}</button>` : ""}<button type="button" class="rl-main rl-x">${T.close}</button></div>`);
    p.querySelector(".rl-x").onclick = () => p.remove();
    p.querySelectorAll(".rl-del").forEach(b => b.onclick = () => { const k = load(); k.splice(+b.dataset.i, 1); store(k); top.__rl.draw(); showList(); });
    const c = p.querySelector(".rl-clear"); if (c) c.onclick = () => { if (confirm(T.clearAsk)) { store([]); top.__rl.draw(); p.remove(); } };
  }
  /* « Envoyer »: straight to the team's Google Sheet when the site has an address (config.js), else (or if it fails) a CSV file */
  async function send() {
    const l = load(); if (!l.length) return;
    const ep = (() => { try { return top.DEEP_ENDPOINT || window.DEEP_ENDPOINT || ""; } catch { return window.DEEP_ENDPOINT || ""; } })();
    if (ep) {
      const wait = pop(document, `<p class="rl-note">${T.sending}</p>`);
      try {
        const r = await fetch(ep, { method: "POST", body: JSON.stringify({ type: "suggestions", items: l }), headers: { "Content-Type": "text/plain;charset=utf-8" } });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "refusé");
        store([]); top.__rl.draw(); wait.remove();
        const p = pop(document, `<p class="rl-note">${T.sentOnline(j.added || l.length)}</p><div class="rl-row"><button type="button" class="rl-main rl-x">${T.close}</button></div>`);
        p.querySelector(".rl-x").onclick = () => p.remove();
        return;
      } catch { wait.remove(); download(l, T.offline); return; }
    }
    download(l, T.sent);
  }
  function download(l, msg) {
    const cell = v => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["date", "nom", "page", "texte actuel", "proposition", "commentaire"], ...l.map(s => [s.date, s.nom, s.page, s.actuel, s.proposition, s.commentaire])];
    const csv = "﻿" + rows.map(r => r.map(cell).join(";")).join("\r\n");   // ; and a BOM: opens as columns in French Excel
    let nm = ""; try { nm = (localStorage.getItem(WHO) || "").replace(/[^\w-]+/g, "-"); } catch {}
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `suggestions-DEEP${nm ? "-" + nm : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    const p = pop(document, `<p class="rl-note">${msg}</p><div class="rl-row"><button type="button" class="rl-main rl-x">${T.close}</button></div>`);
    p.querySelector(".rl-x").onclick = () => p.remove();
  }
})();
