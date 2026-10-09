// Chat assistant widget. Matches questions against QA (js/qa.js) by keyword overlap.
// Anything below the match threshold goes to FALLBACK and can be sent to the team.
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Filler words never count as a match, so "do you have parking" doesn't latch onto "what have you accomplished"
  const STOP = new Set("a an the is are am was were be been do does did have has had will would should could can i me my we you your our us to of in on at for from and or it its this that there any some how what when where who why with about get got please tell know want need just also".split(" "));
  const tokens = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
  const index = QA.map((e) => ({ e, sets: e.q.map((q) => new Set(tokens(q))), phrases: e.q.map((q) => q.toLowerCase()) }));

  const THRESHOLD = 0.5;
  const answer = (text) => {
    const t = tokens(text), low = text.toLowerCase().trim();
    const exact = index.find(({ phrases }) => phrases.includes(low));
    if (exact) return exact.e;
    if (!t.length) return null;
    let best = null, score = 0;
    for (const { e, sets, phrases } of index) {
      phrases.forEach((p, i) => {
        if (!sets[i].size) return;
        const hit = t.filter((w) => sets[i].has(w)).length;
        const s = hit / Math.max(sets[i].size, t.length) + (low.includes(p) ? 0.5 : 0);
        if (s > score) { score = s; best = e; }
      });
    }
    return score >= THRESHOLD ? best : null;
  };

  // Unanswered questions go to the server with the other form submissions
  const sendQuestion = (question, email) => fetch(SITE.formsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": "question", question, email, page: location.pathname.split("/").pop() || "index.html" }).toString(),
  }).then((r) => { if (!r.ok) throw new Error(String(r.status)); });
  let asked = 0;

  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <button class="chat-toggle" aria-expanded="false" aria-controls="chat-panel">Ask us</button>
    <section class="chat-panel" id="chat-panel" role="dialog" aria-label="${esc(ASSISTANT.name)}" hidden>
      <header><b>${esc(ASSISTANT.name)}</b><button class="chat-x" aria-label="Close chat">×</button></header>
      <div class="chat-log" aria-live="polite"></div>
      <form class="chat-form"><label class="sr" for="chat-in" style="position:absolute;left:-999px">Your question</label>
        <input id="chat-in" autocomplete="off" placeholder="Type your question…"><button class="btn btn-dark" type="submit">Send</button></form>
    </section>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const log = $(".chat-log"), panel = $(".chat-panel"), toggle = $(".chat-toggle");
  const add = (who, html) => { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };

  const reply = (q) => {
    const hit = answer(q);
    if (hit) return add("bot", `<p>${esc(hit.a)}</p>${hit.link ? `<a class="chat-link" href="${esc(hit.link[1])}">${esc(hit.link[0])} →</a>` : ""}`);
    const id = `chat-ask-${++asked}`;
    const d = add("bot", `<p>${esc(FALLBACK.text)}</p>
      <form class="chat-ask" novalidate><label for="${id}">${esc(FALLBACK.emailLabel)}</label>
        <input id="${id}" type="email" autocomplete="email" placeholder="you@example.com">
        <button class="btn btn-gold" type="submit">${esc(FALLBACK.sendLabel)}</button></form>`);
    const form = d.querySelector(".chat-ask"), input = form.querySelector("input"), btn = form.querySelector("button");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const email = input.value.trim();
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await sendQuestion(q, email);
        form.remove();
        add("bot", `<p>${esc(email ? FALLBACK.thanks : FALLBACK.thanksNoEmail)}</p>`);
      } catch {
        btn.disabled = false; btn.textContent = FALLBACK.sendLabel;
        add("bot", `<p>${esc(FALLBACK.failed)}</p>`);
      }
    });
  };

  const open = (o) => { panel.hidden = !o; toggle.setAttribute("aria-expanded", o); if (o) { if (!log.children.length) { add("bot", `<p>${esc(ASSISTANT.greeting)}</p><div class="chat-sugg">${ASSISTANT.suggestions.map((s) => `<button type="button">${esc(s)}</button>`).join("")}</div>`); } $("#chat-in").focus(); } };
  toggle.addEventListener("click", () => open(panel.hidden));
  $(".chat-x").addEventListener("click", () => { open(false); toggle.focus(); });
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); toggle.focus(); } });
  const ask = (q) => { add("user", `<p>${esc(q)}</p>`); reply(q); };
  log.addEventListener("click", (e) => { const b = e.target.closest(".chat-sugg button"); if (b) ask(b.textContent); });
  $(".chat-form").addEventListener("submit", (e) => { e.preventDefault(); const i = $("#chat-in"), q = i.value.trim(); if (q) { i.value = ""; ask(q); } });
})();
