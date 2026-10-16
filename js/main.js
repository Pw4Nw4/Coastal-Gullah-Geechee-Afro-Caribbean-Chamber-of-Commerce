// Shared header/footer, data-driven sections, forms and motion for every page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const page = location.pathname.split("/").pop() || "index.html";
  const isSet = (url) => Boolean(url) && url !== "#";
  // The server stamps this script's URL with the site's asset version (?v=...); our own files named in data.js reuse it
  // (URLs from a page's HTML already carry the stamp)
  const VERSION = document.currentScript ? new URL(document.currentScript.src).search : "";
  const asset = (url) => (/^(?:css|js|images)\/[^?]*$/.test(url) ? url + VERSION : url);

  // Draft mode shows the dashed "Draft" notes and keeps empty sections visible (see .is-draft in styles.css)
  if (SAMPLE_DATA) document.documentElement.classList.add("is-draft");

  // ---------- Shared header / footer ----------
  const NAV = [
    ["about.html", "About"], ["events.html", "Programs & Events"], ["directory.html", "Member Directory"],
    ["resources.html", "Resources & Grants"], ["contact.html", "Contact"],
  ];
  const ABOUT_NAV = [["about.html", "About the chamber"], ["about.html#leadership", "Leadership & ambassadors"], ["about.html#gullah", "What is Gullah Geechee?"]];
  const currentPage = (href) => href === page ? ' aria-current="page"' : "";
  const aboutCurrent = (href) => {
    if (page !== "about.html") return "";
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    return hash === location.hash ? ` aria-current="${hash ? "location" : "page"}"` : "";
  };
  const navItem = ([href, text]) => href === "about.html"
    ? `<li><details class="nav-about"><summary${page === "about.html" ? ' class="is-current"' : ""}>About</summary><ul class="nav-submenu">${ABOUT_NAV.map(([h, t]) => `<li><a href="${h}"${aboutCurrent(h)}>${esc(t)}</a></li>`).join("")}</ul></details></li>`
    : `<li><a href="${href}"${currentPage(href)}>${esc(text)}</a></li>`;
  const donate = isSet(SITE.donate) ? `<a href="${esc(SITE.donate)}">Donate</a>` : "";
  const socials = SITE.social.filter((s) => isSet(s.url));

  $("#site-header").outerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <div class="utility"><div class="wrap">
      <span class="utility-where">Savannah, Georgia · Open by appointment</span>
      <span class="utility-links"><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a>${donate}</span>
    </div></div>
    <header class="site"><div class="wrap">
      <a class="brand" href="index.html"${currentPage("index.html")}><img src="images/emblem-200.webp" width="56" height="56" alt=""><span><b>Coastal Gullah Geechee</b><small>&amp; Afro-Caribbean Chamber of Commerce</small></span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav"><span class="menu-icon" aria-hidden="true"></span><span class="menu-label">Menu</span></button>
      <nav class="main" id="nav" aria-label="Main"><ul>
        ${NAV.map(navItem).join("")}
        <li class="nav-join"><a class="btn btn-gold" href="membership.html"${currentPage("membership.html")}>Membership</a></li>
      </ul></nav>
    </div></header>`;

  $("#site-footer").outerHTML = `
    <footer class="site"><div class="wrap">
      <div class="foot-top">
        <div class="foot-brand"><img src="images/crest-256.webp" width="88" height="88" alt="" loading="lazy">
          <div><b>${esc(SITE.name)}</b><p>Educating, empowering and advocating for Gullah Geechee, Afro-Caribbean, minority-owned and women-owned businesses across the Georgia Coast and beyond.</p></div></div>
        <div><h2 class="foot-h">Explore</h2><ul><li><a href="index.html">Home</a></li>${NAV.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}<li><a href="membership.html">Membership</a></li><li><a href="about.html#leadership">Leadership &amp; ambassadors</a></li><li><a href="about.html#gullah">What is Gullah Geechee?</a></li></ul></div>
        <div><h2 class="foot-h">Visit</h2><ul><li>${esc(SITE.address)}</li><li>By appointment and at community events</li><li><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></li>${donate ? `<li>${donate}</li>` : ""}</ul></div>
        ${socials.length ? `<div><h2 class="foot-h">Follow</h2><ul>${socials.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul></div>` : ""}
      </div>
      <div class="legal"><span>© ${new Date().getFullYear()} ${esc(SITE.name)}</span><span class="motto-line">Build Business. Preserve Culture. Strengthen Legacy.</span></div>
    </div></footer>`;

  // Static homepage contact details share the same authoritative SITE data as the header/footer.
  $$("a[data-site-phone]").forEach((a) => { a.href = SITE.phoneHref; a.textContent = SITE.phone; });
  $$("[data-site-address]").forEach((el) => { el.textContent = SITE.address; });
  $$("a[data-site-donate]").forEach((a) => { a.hidden = !isSet(SITE.donate); if (!a.hidden) a.href = SITE.donate; });

  const menuBtn = $(".menu-btn"), nav = $("#nav"), aboutMenu = $(".nav-about");
  const setMenu = (open) => { nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open); $(".menu-label", menuBtn).textContent = open ? "Close" : "Menu"; if (!open) aboutMenu.open = false; };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (aboutMenu.open) { aboutMenu.open = false; $("summary", aboutMenu).focus(); }
    else if (nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("click", (e) => { if (!aboutMenu.contains(e.target)) aboutMenu.open = false; });
  window.addEventListener("hashchange", () => {
    $$("a", aboutMenu).forEach((a) => { a.removeAttribute("aria-current"); if (aboutCurrent(a.getAttribute("href"))) a.setAttribute("aria-current", location.hash ? "location" : "page"); });
  });

  // ---------- Renderers ----------
  const money = (n, cents = false) => "$" + n.toLocaleString("en-US", cents ? { minimumFractionDigits: 2 } : {});
  const MONO = [["var(--teal-500)", "var(--navy-950)"], ["var(--gold-500)", "var(--navy-950)"], ["var(--sepia-700)", "var(--gold-300)"], ["var(--navy-800)", "var(--gold-400)"]];
  const initials = (name) => name.replace(/&/g, " ").split(/\s+/).filter((w) => w && !/^(the|and|of|co\.?)$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const monogram = (name, i, cls) => { const [bg, fg] = MONO[i % MONO.length]; return `<div class="${cls}" style="--mono-bg:${bg};--mono-fg:${fg}" aria-hidden="true">${esc(initials(name))}</div>`; };
  const hideIfEmpty = (el, empty) => { if (empty) el.closest("section").dataset.empty = ""; };

  const bizCard = (b, i) => `
    <li class="biz">${b.img ? `<img class="biz-img" src="${esc(b.img)}" alt="" loading="lazy">` : monogram(b.name, i, "monogram")}
      <div class="biz-body"><span class="tag">${esc(b.cat)}</span><h3>${esc(b.name)}</h3>
        <p class="meta">${esc(b.area)}</p><p>${esc(b.desc)}</p>
        <ul class="badges" aria-label="Ownership">${b.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="links">${isSet(b.url) ? `<a href="${esc(b.url)}" rel="noopener">Website</a>` : ""}${b.phone ? `<a href="tel:${esc(b.phone)}">Call</a>` : ""}</div></div></li>`;

  const eventRow = (e, full) => `
    <li class="event"><div class="date"><b>${esc(e.d)}</b><span>${esc(e.m)}</span></div>
      <div><span class="tag">${esc(e.type)}</span><h3>${esc(e.title)}</h3><p class="meta">${esc(e.where)}</p>${full ? `<p class="event-desc">${esc(e.desc)}</p>` : ""}</div>
      <a class="btn btn-outline" href="${esc(e.url)}">RSVP<span class="visually-hidden"> for ${esc(e.title)}</span></a></li>`;

  const homeEvents = $("#home-events");
  const eventsEmpty = `<li class="empty"><p>New programs and events will be announced here. Contact the chamber for upcoming opportunities to meet, learn and connect.</p><a class="btn btn-outline" href="contact.html">Ask about upcoming events</a></li>`;
  if (homeEvents) homeEvents.innerHTML = EVENTS.length ? EVENTS.slice(0, 3).map((e) => eventRow(e, false)).join("") : eventsEmpty;
  const allEvents = $("#events-list");
  if (allEvents) allEvents.innerHTML = EVENTS.length ? EVENTS.map((e) => eventRow(e, true)).join("") : eventsEmpty;

  const homeDir = $("#home-dir");
  const directoryEmpty = `<li class="empty"><p>Member listings are being prepared. Contact the chamber to find a business or ask about adding your member profile.</p><a class="btn btn-outline" href="contact.html">Connect with the chamber</a></li>`;
  if (homeDir) homeDir.innerHTML = MEMBERS.length ? MEMBERS.slice(0, 3).map(bizCard).join("") : directoryEmpty;

  // Past event pictures with a native <dialog> viewer
  const gal = $("#gallery");
  if (gal) {
    const shots = GALLERY.filter((g) => g.src).slice(0, Number(gal.dataset.limit) || undefined);
    hideIfEmpty(gal, !shots.length);
    if (shots.length) {
      gal.innerHTML = shots.map((g, i) => `<figure><button type="button" class="shot" data-i="${i}" aria-label="Enlarge: ${esc(g.cap)}"><img src="${esc(g.src)}" alt="${esc(g.cap)}" loading="lazy"></button><figcaption>${esc(g.cap)}</figcaption></figure>`).join("");
      const viewer = document.createElement("dialog");
      viewer.className = "lightbox";
      viewer.setAttribute("aria-label", "Photo viewer");
      viewer.innerHTML = `<form method="dialog"><button class="lightbox-close" aria-label="Close photo">×</button></form><figure><img alt=""><figcaption></figcaption></figure>`;
      document.body.append(viewer);
      gal.addEventListener("click", (e) => {
        const b = e.target.closest(".shot"); if (!b) return;
        const g = shots[Number(b.dataset.i)], img = $("img", viewer);
        img.src = g.src; img.alt = g.cap; $("figcaption", viewer).textContent = g.cap;
        viewer.showModal();
      });
      viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
    }
  }

  // Videos: YouTube through its privacy-enhanced player, Instagram through its official embed (which credits the poster),
  // our own MP4s in a plain player (#t=0.1 makes iPhones show the first frame instead of a blank box)
  const videoCard = (v, solo) => {
    const caption = `<figcaption>${esc(v.title)}${v.credit ? `<span class="video-credit">Video by ${esc(v.credit)}</span>` : ""}</figcaption>`;
    if (v.file) return `<figure class="video-card file-card${solo ? " video-solo" : ""}"><video src="${esc(v.file)}${v.poster ? "" : "#t=0.1"}"${v.poster ? ` poster="${esc(asset(v.poster))}"` : ""} controls playsinline preload="metadata" aria-label="${esc(v.title)}"></video>${caption}</figure>`;
    if (!v.instagram) return `<figure class="video-card${solo ? " video-solo" : ""}"><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>${caption}</figure>`;
    const link = `https://www.instagram.com/reel/${esc(v.instagram)}/`;
    return `<figure class="video-card insta-card${solo ? " video-solo" : ""}"><blockquote class="instagram-media" data-instgrm-permalink="${link}" data-instgrm-version="14"><a href="${link}" target="_blank" rel="noopener">Watch “${esc(v.title)}” on Instagram</a></blockquote>${caption}</figure>`;
  };
  const videos = VIDEOS.filter((v) => v.id || v.instagram || v.file);
  const vids = $("#videos");
  if (vids) {
    hideIfEmpty(vids, !videos.length);
    vids.innerHTML = videos.map((v) => videoCard(v)).join("");
  }
  // A slot can give its video a cover of its own with data-poster
  $$("[data-video]").forEach((slot) => {
    const v = videos.find((x) => x.key === slot.dataset.video);
    if (v) slot.outerHTML = videoCard(slot.dataset.poster ? { ...v, poster: slot.dataset.poster } : v, true);
    else slot.remove();
  });
  // Instagram's script turns those links into players. It loads only when one is about to scroll into view.
  const reels = $$(".instagram-media");
  if (reels.length) {
    const loadInstagram = () => {
      if (window.instgrm) return window.instgrm.Embeds.process();
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.append(s);
    };
    if (!("IntersectionObserver" in window)) loadInstagram();
    else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); loadInstagram(); }
      }, { rootMargin: "600px 0px" });
      reels.forEach((r) => io.observe(r));
    }
  }

  const leaders = $("#leaders");
  if (leaders) {
    const list = SAMPLE_DATA ? LEADERS : LEADERS.filter((l) => !l.sample);
    hideIfEmpty(leaders, !list.length);
    leaders.innerHTML = list.map((l, i) => {
      const face = l.img ? `<img class="avatar" src="${esc(asset(l.img))}" alt="" loading="lazy">`
        : l.sample ? `<div class="avatar avatar-pending" aria-hidden="true"><img src="images/emblem-200.webp" alt=""></div>`
        : monogram(l.name, i, "avatar");
      return `<li class="leader">${face}<h3>${esc(l.name)}</h3><p>${esc(l.role)}</p></li>`;
    }).join("");
  }

  // Gold and Platinum partners strip (home page); hidden until PARTNERS has entries
  const partners = $("#partners");
  if (partners) {
    hideIfEmpty(partners, !PARTNERS.length);
    partners.innerHTML = PARTNERS.map((p) => {
      const face = p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : esc(p.name);
      return `<li>${isSet(p.url) ? `<a class="partner" href="${esc(p.url)}" rel="noopener">${face}</a>` : `<span class="partner">${face}</span>`}</li>`;
    }).join("");
  }

  // Directory with search + filters
  const grid = $("#dir-grid");
  if (grid) {
    const q = $("#q"), cat = $("#cat"), area = $("#area"), chips = $("#chips");
    q.value = new URLSearchParams(location.search).get("q") || ""; // search sent from the home page
    cat.innerHTML = `<option value="">All categories</option>` + CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join("");
    area.innerHTML = `<option value="">All areas</option>` + AREAS.map((c) => `<option>${esc(c)}</option>`).join("");
    const TAGS = ["Gullah Geechee", "Afro-Caribbean", "Minority-owned", "Women-owned"];
    const active = new Set();
    chips.insertAdjacentHTML("beforeend", TAGS.map((t) => `<button class="chip" type="button" aria-pressed="false" data-tag="${esc(t)}">${esc(t)}</button>`).join(""));
    if (!MEMBERS.length) { const filters = $(".filters"); if (filters) filters.hidden = true; chips.hidden = true; $("#count").hidden = true; }
    const render = () => {
      if (!MEMBERS.length) { grid.innerHTML = directoryEmpty; return; }
      const t = q.value.trim().toLowerCase();
      const res = MEMBERS.filter((m) => (!cat.value || m.cat === cat.value) && (!area.value || m.area === area.value)
        && [...active].every((a) => m.tags.includes(a)) && (!t || [m.name, m.desc, m.cat, m.area, ...m.tags].join(" ").toLowerCase().includes(t)));
      $("#count").textContent = `${res.length} ${res.length === 1 ? "business" : "businesses"}`;
      grid.innerHTML = res.length ? res.map(bizCard).join("")
        : `<li class="empty"><p>No businesses match those filters yet.</p><button class="btn btn-outline" type="button" data-clear>Clear filters</button></li>`;
    };
    chips.addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      const on = c.getAttribute("aria-pressed") !== "true";
      c.setAttribute("aria-pressed", on);
      on ? active.add(c.dataset.tag) : active.delete(c.dataset.tag);
      render();
    });
    grid.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear]")) return;
      q.value = cat.value = area.value = ""; active.clear();
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", "false"));
      render(); q.focus();
    });
    [q, cat, area].forEach((el) => el.addEventListener("input", render));
    render();
  }

  // ---------- Membership: price list doubles as step 1 of the form, grouped by who each level is for ----------
  const tierList = $("#tier-list");
  if (tierList) {
    // Unapproved benefit lists (includesDraft) only show in draft mode, labeled as drafts
    const showIncludes = (t) => t.includes?.length && (!t.includesDraft || SAMPLE_DATA);
    const includes = (t) => {
      const base = TIERS.find((x) => x.id === t.includesFrom);
      return `<span class="tier-includes" id="tier-${esc(t.id)}-inc">
        <span class="tier-inc-title">${base ? `Everything in ${esc(base.name)}, plus:` : "Includes:"}${t.includesDraft ? ` <span class="tier-draft">Draft</span>` : ""}</span>
        <span class="tier-inc-list">${t.includes.map((item) => `<span class="tier-inc-item">${esc(item)}<span class="visually-hidden">;</span></span>`).join("")}</span></span>`;
    };
    const groups = [...new Set(TIERS.map((t) => t.group))];
    tierList.innerHTML = groups.map((g, gi) => `
      <div class="tier-group" role="group" aria-labelledby="tier-group-${gi}">
        <p class="tier-group-title" id="tier-group-${gi}">${esc(g)}</p>
        ${TIERS.filter((t) => t.group === g).map((t) => {
          const id = esc(t.id), inc = showIncludes(t);
          return `
        <label class="tier-opt${t.featured ? " featured" : ""}">
          <input type="radio" name="tier" value="${id}" required aria-labelledby="tier-${id}-name tier-${id}-fit tier-${id}-price" aria-describedby="tier-${id}-desc${inc ? ` tier-${id}-inc` : ""}">
          <span class="tier-main"><span class="tier-head"><span class="tier-name" id="tier-${id}-name">${esc(t.name)}</span><span class="tier-fit" id="tier-${id}-fit">${esc(t.fit)}</span></span>
            <span class="tier-desc" id="tier-${id}-desc">${esc(t.blurb)}</span></span>
          <span class="tier-price" id="tier-${id}-price"><b>${money(t.price)}</b> <small>+ ${money(REGISTRATION_FEE)} fee · ${money(t.price + REGISTRATION_FEE)} total</small></span>
          ${inc ? includes(t) : ""}
        </label>`;
        }).join("")}
      </div>`).join("");
  }

  // Membership form -> Stripe Checkout (the server creates the session; see server/checkout.js)
  const jf = $("#join-form");
  if (jf) {
    const sum = $("#sum", jf), err = $("#join-err", jf), go = $("button[type=submit]", jf), goLabel = go.textContent;
    const chosen = () => TIERS.find((t) => t.id === jf.elements.tier.value);
    const guardian = $("#guardian-note", jf);
    const update = () => {
      const t = chosen();
      if (guardian) guardian.hidden = !t?.guardian;
      sum.innerHTML = t
        ? `<div><dt>${esc(t.name)} membership</dt><dd>${money(t.price, true)}</dd></div><div><dt>Registration fee (one time)</dt><dd>${money(REGISTRATION_FEE, true)}</dd></div><div class="total"><dt>Total due today</dt><dd>${money(t.price + REGISTRATION_FEE, true)}</dd></div>`
        : `<div class="total"><dt>Total due today</dt><dd>Choose a level in step 1</dd></div>`;
    };
    jf.addEventListener("change", (e) => { if (e.target.name === "tier") update(); });
    const pre = new URLSearchParams(location.search).get("tier");
    const preInput = $$('input[name="tier"]', jf).find((i) => i.value === pre);
    if (preInput) preInput.checked = true;
    update();
    jf.addEventListener("submit", async (e) => {
      e.preventDefault(); err.hidden = true;
      if (!jf.reportValidity()) return;
      go.disabled = true; go.textContent = "Opening secure checkout…";
      try {
        const body = Object.fromEntries(new FormData(jf).entries());
        body.newsletter = jf.elements.newsletter.checked; body.sms = jf.elements.sms.checked;
        const r = await fetch(SITE.checkoutEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.url) throw new Error(d.error || "We couldn't start checkout.");
        location.href = d.url;
      } catch (x) {
        err.textContent = `${x.message} Please try again, or call ${SITE.phone} and we'll help you join.`; err.hidden = false;
        go.disabled = false; go.textContent = goLabel;
      }
    });
  }

  // ---------- Forms (newsletter + contact) post to the site's server (server/forms.js) ----------
  const postForm = (form, name) => {
    const d = new FormData(form); d.set("form-name", name);
    return fetch(SITE.formsEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(d).toString() });
  };
  const wireForm = (form, name, okText) => {
    const msg = $(".form-msg", form), go = $("button[type=submit]", form), label = go.textContent;
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); msg.hidden = true;
      if (!form.reportValidity()) return;
      go.disabled = true; go.textContent = "Sending…";
      try {
        if (form.elements.website.value) throw new Error("spam");
        const r = await postForm(form, name);
        if (!r.ok) throw new Error(String(r.status));
        form.reset(); msg.className = "form-msg ok"; msg.textContent = okText;
      } catch {
        msg.className = "form-msg bad"; msg.textContent = `Sorry, that didn't go through. Please try again, or call ${SITE.phone}.`;
      }
      msg.hidden = false; go.disabled = false; go.textContent = label;
    });
  };

  // Home asks for email only; the shared band also gathers a zip code.
  const signupForm = (id, emailOnly = false) => `
    <form class="signup-form" id="${id}" novalidate>
      <div class="signup-row${emailOnly ? " email-only" : ""}">
        <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div>
        ${emailOnly ? "" : `<div class="field"><label for="${id}-zip">Zip code</label><input id="${id}-zip" name="zip" required inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" maxlength="10" placeholder="31401"></div>`}
        <button class="btn btn-gold" type="submit">Join our email list</button>
      </div>
      <input type="hidden" name="page" value="${esc(page)}">
      <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="fine">Free. Unsubscribe anytime; we never sell your information.</p>
      <p class="form-msg" role="status" hidden></p>
    </form>`;
  const SIGNUP_OK = "You're on the list! Watch your inbox for chamber news.";
  const heroSignup = $("#hero-signup");
  if (heroSignup) { heroSignup.innerHTML = signupForm("hero-signup-form", true); wireForm($("form", heroSignup), "newsletter", SIGNUP_OK); }
  // The band above the footer, except on the welcome page and home, which has its own signup.
  if (page !== "membership-success.html" && !heroSignup) {
    const band = document.createElement("section");
    band.className = "signup"; band.id = "newsletter"; band.setAttribute("aria-labelledby", "newsletter-title");
    band.innerHTML = `<div class="wrap">
      <div><h2 id="newsletter-title">Never miss an event, grant or opportunity.</h2><p>Chamber news, upcoming events, funding leads and member spotlights, straight to your inbox.</p></div>
      <div class="signup-card">${signupForm("band-signup-form")}</div></div>`;
    $("footer.site").before(band);
    wireForm($("form", band), "newsletter", SIGNUP_OK);
  }

  const contact = $("#contact-form");
  if (contact) wireForm(contact, "contact", "Thank you! Your message is on its way, and a member of the chamber team will reply soon.");

  // ---------- Motion: lists stagger in as they scroll into view ----------
  // Content is visible by default; only elements that start below the fold animate, and only once.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      for (const { target: el, isIntersecting } of entries) {
        if (!seen.has(el)) { seen.add(el); if (isIntersecting) io.unobserve(el); continue; }
        if (!isIntersecting) continue;
        io.unobserve(el);
        const items = el.dataset.reveal === "stagger" ? [...el.children] : [el];
        items.forEach((item, i) => item.animate(
          [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
          { duration: 700, delay: Math.min(i, 6) * 70, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
        ));
      }
    });
    $$("[data-reveal]").forEach((el) => io.observe(el));
  }
})();
