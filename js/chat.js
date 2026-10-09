// Chat assistant widget, fronted by the chamber's Sankofa bird. Matches questions against QA (js/qa.js) by keyword
// overlap. Anything below the match threshold goes to FALLBACK and can be sent to the team.
// The launcher is the animated bird from js/sankofa-mascot.js (built from mascot/) when it loads, and the chat drives
// its states; otherwise a plain "Ask us" button. Once per visit a speech bubble (ASSISTANT.hello) greets the visitor.
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

  // Unanswered questions and newsletter sign-ups go to the server with the other form submissions.
  // Sign-ups are tagged "(chat)" so staff can see which leads the assistant brought in.
  const page = location.pathname.split("/").pop() || "index.html";
  const post = (fields) => fetch(SITE.formsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  }).then((r) => { if (!r.ok) throw new Error(String(r.status)); });
  const sendQuestion = (question, email) => post({ "form-name": "question", question, email, page });
  const signUp = (email, zip) => post({ "form-name": "newsletter", email, zip, page: `${page} (chat)` });
  let forms = 0;

  // Per-visit memory (sessionStorage). If storage is blocked, the bubble may just show again on the next page.
  const memo = (key, value) => { try { if (value !== undefined) sessionStorage.setItem(key, String(value)); return sessionStorage.getItem(key); } catch { return null; } };
  const flag = (key, set) => memo(key, set ? "1" : undefined) === "1";
  const bump = (key) => { const n = Number(memo(key) || 0) + 1; memo(key, n); return n; };
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const BIRD = "images/sankofa-mascot.webp";
  const H = ASSISTANT.hello;
  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <div class="chat-hello" hidden></div>
    <button class="chat-toggle" aria-expanded="false" aria-controls="chat-panel" hidden>Ask us<span class="chat-disc"><img src="${BIRD}" alt="" width="72" height="72"></span></button>
    <section class="chat-panel" id="chat-panel" role="dialog" aria-label="${esc(ASSISTANT.name)}" hidden>
      <header><span class="chat-who"><span class="chat-disc"><img src="${BIRD}" alt="" width="40" height="40"></span><b>${esc(ASSISTANT.name)}</b></span><button class="chat-x" aria-label="Close chat">×</button></header>
      <div class="chat-log" aria-live="polite" tabindex="-1"></div>
      <form class="chat-form"><label class="sr" for="chat-in" style="position:absolute;left:-999px">Your question</label>
        <input id="chat-in" autocomplete="off" placeholder="Type your question…"><button class="btn btn-dark" type="submit">Send</button></form>
    </section>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const log = $(".chat-log"), panel = $(".chat-panel"), toggle = $(".chat-toggle"), hello = $(".chat-hello"), input = $("#chat-in");
  const add = (who, html) => { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };

  // ---------- The launcher: the animated bird, or the plain button ----------
  let mascot = null; // controller from window.SankofaMascot.mount() once js/sankofa-mascot.js has loaded
  const mood = (state) => mascot?.setState(state);
  const focusLauncher = () => (mascot ? mascot.focus() : toggle.focus());
  const showButton = () => { if (!mascot) toggle.hidden = false; };
  const useMascot = (M) => {
    const holder = document.createElement("div");
    holder.className = "chat-mascot";
    root.insertBefore(holder, toggle);
    const hadFocus = document.activeElement === toggle;
    toggle.hidden = true;
    root.classList.add("has-mascot");
    mascot = M.mount(holder, {
      src: BIRD,
      label: "Ask us: chat with the chamber assistant",
      tag: "Ask us",
      controls: "chat-panel",
      placement: "inline",
      open: !panel.hidden,
      onClick: () => open(panel.hidden),
    });
    if (hadFocus) setTimeout(focusLauncher);
    if (!hello.hidden && said?.kind === "welcome") mood("welcome");
  };
  // About 100 KB (React and Motion), so it loads after the page and is skipped when the visitor asks to save data.
  // A slow or failed load shows the plain button instead.
  if (navigator.connection?.saveData) showButton();
  else {
    const slow = setTimeout(showButton, 2500);
    const script = document.createElement("script");
    script.src = "js/sankofa-mascot.js";
    script.onload = () => { clearTimeout(slow); window.SankofaMascot ? useMascot(window.SankofaMascot) : showButton(); };
    script.onerror = () => { clearTimeout(slow); showButton(); };
    document.head.appendChild(script);
  }

  // Newsletter sign-up inside a bot message: the same email + zip the site's other sign-up forms collect
  const signupForm = (msg) => {
    const n = ++forms, f = document.createElement("form");
    f.className = "chat-ask chat-signup"; f.noValidate = true;
    f.innerHTML = `<div><label for="chat-email-${n}">Email</label><input id="chat-email-${n}" type="email" required autocomplete="email" placeholder="you@example.com"></div>
      <div><label for="chat-zip-${n}">Zip code</label><input id="chat-zip-${n}" required inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" maxlength="10" placeholder="31401"></div>
      <button class="btn btn-gold" type="submit">${esc(ASSISTANT.signup.button)}</button>`;
    msg.appendChild(f);
    log.scrollTop = log.scrollHeight;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const [email, zip] = [...f.querySelectorAll("input")].map((i) => i.value.trim()), btn = f.querySelector("button");
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await signUp(email, zip);
        f.remove();
        add("bot", `<p>${esc(ASSISTANT.signup.thanks)}</p>`);
        mood("happy");
      } catch {
        btn.disabled = false; btn.textContent = ASSISTANT.signup.button;
        add("bot", `<p>${esc(ASSISTANT.signup.failed)}</p>`);
      }
    });
  };

  // Shows the answer (or the offer to pass the question on) and returns the matched entry, if any
  const reply = (q) => {
    const hit = answer(q);
    if (hit) {
      const d = add("bot", `<p>${esc(hit.a)}</p>${hit.link ? `<a class="chat-link" href="${esc(hit.link[1])}">${esc(hit.link[0])} →</a>` : ""}`);
      if (hit.form === "newsletter") signupForm(d);
      return hit;
    }
    const id = `chat-ask-${++forms}`;
    const d = add("bot", `<p>${esc(FALLBACK.text)}</p>
      <form class="chat-ask" novalidate><label for="${id}">${esc(FALLBACK.emailLabel)}</label>
        <input id="${id}" type="email" autocomplete="email" placeholder="you@example.com">
        <button class="btn btn-gold" type="submit">${esc(FALLBACK.sendLabel)}</button></form>`);
    const form = d.querySelector(".chat-ask"), email = form.querySelector("input"), btn = form.querySelector("button");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const address = email.value.trim();
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await sendQuestion(q, address);
        form.remove();
        add("bot", `<p>${esc(address ? FALLBACK.thanks : FALLBACK.thanksNoEmail)}</p>`);
        mood("happy");
      } catch {
        btn.disabled = false; btn.textContent = FALLBACK.sendLabel;
        add("bot", `<p>${esc(FALLBACK.failed)}</p>`);
      }
    });
    return null;
  };

  const greeting = () => add("bot", `<p>${esc(ASSISTANT.greeting)}</p><div class="chat-sugg">${ASSISTANT.suggestions.map((s) => `<button type="button">${esc(s)}</button>`).join("")}</div>`);
  const hideHello = () => {
    if (hello.hidden) return;
    const moveFocus = hello.contains(document.activeElement);
    hello.hidden = true;
    if (panel.hidden && (mascot?.getState() === "welcome" || mascot?.getState() === "speaking")) mascot.settle();
    if (moveFocus) focusLauncher();
  };
  // Whether the visitor wants the bubble: two closes in a row quiet it for the rest of the visit
  const engaged = () => memo("chat-closes", 0);
  const dismiss = () => {
    if (bump("chat-closes") >= 2) flag("chat-quiet", true);
    hideHello();
  };
  // first: what an empty conversation starts with; focus: where focus lands (the question box unless a
  // question is already being answered, so phones don't pop the keyboard over the answer)
  const open = (o, first = greeting, focus = "#chat-in") => {
    panel.hidden = !o;
    toggle.setAttribute("aria-expanded", o);
    mascot?.setOpen(o);
    if (!o) return mood("idle");
    flag("chat-hello", true);
    engaged();
    hideHello();
    if (!log.children.length) first();
    $(focus).focus();
    // The focus event can arrive late (or not at all while the window is in the background), so don't wait for it
    if (document.activeElement === input) mascot?.setRest("listening");
  };
  toggle.addEventListener("click", () => open(panel.hidden));
  $(".chat-x").addEventListener("click", () => { open(false); focusLauncher(); });
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); focusLauncher(); } });
  // The bird listens while the question box has focus
  input.addEventListener("focus", () => mascot?.setRest("listening"));
  input.addEventListener("blur", () => mascot?.setRest("idle"));

  // With the bird, each answer waits a moment while it thinks, then shows while it speaks (or cheers a thank-you).
  // Questions asked in quick succession are answered in order.
  let turns = Promise.resolve();
  const ask = (q) => {
    add("user", `<p>${esc(q)}</p>`);
    if (!mascot) return void reply(q);
    turns = turns
      .then(async () => {
        mood("thinking");
        await wait(650);
        const hit = reply(q);
        if (hit?.id === "thanks") return mood("happy");
        mood("speaking");
        await wait(Math.min(2600, 700 + (hit ? hit.a.length : FALLBACK.text.length) * 10));
        mascot.settle();
      })
      .catch(() => mascot.settle());
  };
  log.addEventListener("click", (e) => { const b = e.target.closest(".chat-sugg button"); if (b) ask(b.textContent); });
  $(".chat-form").addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ""; ask(q); } });

  // ---------- The speech bubble: the welcome on the first page, then a tip on each new page ----------
  // message: { title?, text, asks: [[label, question]] (an empty question just opens the chat), link?: [label, href] }
  let said = null;
  const say = (message) => {
    said = message;
    hello.innerHTML = `<button class="chat-hello-x" type="button" aria-label="Close the message">×</button>
      <p>${message.title ? `<b>${esc(message.title)}</b> ` : ""}${esc(message.text)}</p>
      <div class="chat-hello-opts">${message.asks.map(([label, q]) => `<button type="button" data-ask="${esc(q)}">${esc(label)}</button>`).join("")}${message.link ? `<a href="${esc(message.link[1])}">${esc(message.link[0])}</a>` : ""}</div>`;
    hello.hidden = false;
    hello.animate(calm() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(10px) scale(0.92)" }, { opacity: 1, transform: "none" }],
      { duration: calm() ? 200 : 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  };
  hello.addEventListener("click", (e) => {
    if (e.target.closest(".chat-hello-x")) return dismiss();
    // A link to somewhere on this page: go there, and put keyboard focus there too
    const a = e.target.closest("a");
    if (a) {
      engaged();
      hideHello();
      const target = a.hash && a.pathname === location.pathname && document.querySelector(a.hash);
      if (target) {
        if (!target.matches("a[href], button, input, select, textarea")) target.tabIndex = -1;
        setTimeout(() => target.focus({ preventScroll: true }));
      }
      return;
    }
    const b = e.target.closest("[data-ask]");
    if (!b) return;
    const q = b.dataset.ask, message = said;
    if (!q) return open(true);
    // The chat starts with what the bird just said, then the visitor's question
    open(true, () => add("bot", `<p>${message.title ? `${esc(message.title)} ` : ""}${esc(message.text)}</p>`), ".chat-log");
    ask(q);
  });
  hello.addEventListener("keydown", (e) => { if (e.key === "Escape") dismiss(); });

  // Not while the chat or a bubble is open, or while someone is typing in a form
  const quietMoment = () => panel.hidden && hello.hidden && !document.activeElement?.matches("input, textarea, select");
  const showHello = () => {
    if (flag("chat-hello") || !quietMoment()) return; // a later page can try again
    flag("chat-hello", true);
    say({ kind: "welcome", title: H.title, text: H.text, asks: [...H.options.map((o) => [o, o]), [H.other, ""]] });
    mood("welcome");
  };

  // After the welcome, the bird thinks on each new page, then shares one of that page's tips (PAGE_TIPS in qa.js),
  // picked at random: once per page per visit, four per visit at most, and none once the visitor has closed two
  // bubbles in a row.
  const TIP_LIMIT = 4;
  const tips = (typeof PAGE_TIPS !== "undefined" && PAGE_TIPS[page]) || [];
  const tipWanted = () => tips.length > 0 && !flag("chat-quiet") && !flag(`chat-tip:${page}`) && Number(memo("chat-tips") || 0) < TIP_LIMIT;
  const showTip = async () => {
    if (!tipWanted() || !quietMoment()) return;
    if (mascot) {
      mood("thinking");
      await wait(1400);
      if (!quietMoment()) return void (panel.hidden && mascot.settle()); // they started something meanwhile
    }
    flag(`chat-tip:${page}`, true);
    bump("chat-tips");
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const asks = typeof tip.ask === "string" ? [[tip.ask, tip.ask]] : tip.ask ? [tip.ask] : [];
    say({ text: tip.text, asks, link: tip.link });
    mood("speaking");
    await wait(2600);
    if (panel.hidden && mascot?.getState() === "speaking") mascot.settle();
  };

  // A few seconds after the page loads, counted while the tab is visible. Not on the post-payment welcome page.
  const later = (fn, ms) => setTimeout(() => (document.hidden ? document.addEventListener("visibilitychange", () => later(fn, ms), { once: true }) : fn()), ms);
  if (page !== "membership-success.html") {
    if (!flag("chat-hello")) later(showHello, 4000);
    else later(showTip, 3000);
  }
})();
