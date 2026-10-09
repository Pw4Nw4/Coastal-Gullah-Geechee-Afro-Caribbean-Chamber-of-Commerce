# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Marketing site for the Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce (Savannah, GA). Plain HTML/CSS/vanilla JS with no build step, served by a small dependency-free Node server (`server/`) that also handles Stripe checkout and form submissions. No package manager, linter or tests. GitHub: `Pw4Nw4/Coastal-Gullah-Geechee-Afro-Caribbean-Chamber-of-Commerce` (public). Hosted on F09 Tech's Coolify with the `Dockerfile` build pack; the ops record lives in `D:\projects` (see that folder's `AGENTS.md`).

## Running

Dev server is defined in `.claude/launch.json` (name `site`): `node server/index.js --port=5173`, then open http://localhost:5173. It needs Node 20+ and nothing installed. Locally, submissions are saved to `data/` (git-ignored). Checkout returns "Payments are not configured yet" until `STRIPE_SECRET_KEY` is set. All settings are environment variables documented in `.env.example`.

The server only serves files matching its `PUBLIC` pattern (`*.html` at the root, `/css`, `/js`, `/images`). A new public folder or file type must be added there and to `TYPES`, or it 404s.

## Architecture

- **Content lives in `js/data.js`** as global consts: `SITE` (contact info, donate and social links, `checkoutEndpoint`, `formsEndpoint`), `CATEGORIES`, `AREAS`, `MEMBERS`, `EVENTS`, `GALLERY`, `VIDEOS`, `LEADERS`, `REGISTRATION_FEE`, `TIERS`. Editing site content means editing this file, not the HTML.
- **Draft mode**: while `SAMPLE_DATA` is true, `main.js` adds `.is-draft` to `<html>`, which shows the dashed `.draft-note` elements (static in the HTML) and keeps empty sections visible. With it false, notes hide, sample `LEADERS` are dropped, and any section whose list is empty gets `data-empty` and is hidden (gallery, videos, leaders). Links set to `"#"` (`SITE.donate`, social URLs, member `url`) are never rendered.
- **`js/main.js`** (single IIFE, loaded after `data.js` on every page) does all rendering:
  - Injects the shared header/footer by replacing the empty `#site-header` / `#site-footer` placeholders. Nav links are in its `NAV` array; the active link comes from `location.pathname`. To add a page, update `NAV` and copy an existing page's `<head>` and script tags.
  - Renders data into elements by id, each guarded by an existence check: `#home-events`, `#events-list`, `#home-dir`, `#dir-grid` (with `#q`, `#cat`, `#area`, `#chips`, `#count`), `#gallery` (optional `data-limit`, native `<dialog>` viewer), `#videos`, `#leaders`, `#tier-list`, `#hero-signup`.
  - Appends the email signup band (`#newsletter`, email + zip) above the footer on every page except `membership-success.html`.
  - User-facing strings from data go through `esc()`. Keep that when adding renderers.
- **Forms**: the newsletter, contact and chat-question forms POST urlencoded data with a `form-name` field to `/api/forms`. `server/forms.js` keeps only the fields listed for that form in `FORMS` (adding a field means adding it there), validates them, appends one JSON line per submission to `$DATA_DIR/submissions.jsonl`, and posts it to `FORMS_WEBHOOK_URL` if set. Staff download everything as CSV from `/admin/submissions.csv` (Basic auth, password = `ADMIN_TOKEN`; `?form=newsletter` filters). All forms use a `website` honeypot field, and the server rate-limits posts per visitor.
- **Membership checkout**: the `#tier-list` radios are step 1 of `#join-form`, grouped by each tier's `group` and showing its `fit` tag and `blurb` (wording taken from the client's live membership page), plus an `includes` list (`includesFrom` renders "Everything in X, plus:"). The current `includes` lists are a proposal the chamber hasn't approved: `includesDraft: true` shows them with a "Draft" label only while `SAMPLE_DATA` is true, and hides them otherwise. Flip it to false per tier once the chamber confirms that tier's list. A tier with `guardian: true` (Youngpreneur, ages 15 and under) reveals `#guardian-note` in step 2. Keep that note: the form collects contact details, and COPPA requires parental consent for children under 13. Submitting POSTs JSON to `/api/checkout` (`server/checkout.js`), which builds a Stripe Checkout session with the membership and the $25 registration fee as separate line items and stores the member's answers as metadata. **Tier ids, names and prices exist twice**: `TIERS` in `data.js` (display) and `TIERS` in `server/checkout.js` (what Stripe charges and the receipt shows). Keep them in sync. Needs `STRIPE_SECRET_KEY` and `SITE_URL` (the public https address, used for Stripe's return links).
- **Chat assistant**: `js/qa.js` is the Q&A knowledge base (`QA`, `FALLBACK`, `SYSTEM_PROMPT` for any future AI model); `js/chat.js` matches questions by keyword overlap against it, ignoring a stop-word list, and offers to send unanswered questions (with an optional reply email) to the team through `/api/forms` as the `question` form.
- **Motion**: the home hero has CSS load animations (sun rays turning behind the emblem). Lists marked `data-reveal="stagger"` animate in with the Web Animations API, only when they start below the fold. Content is never hidden by default, and both paths respect `prefers-reduced-motion`.

## Design system (`css/styles.css`)

- Palette is sampled from the chamber emblem (navy `#232856`, gold `#dc9c28`, teal `#159aab`, Sankofa brown `#633b14`, on white), defined as OKLCH tokens in `:root`. Haint blue (`--haint-*`, the pale blue-green of Lowcountry porch ceilings) is the light ground. The client asked to keep these colors for cultural representation. Contrast is checked against WCAG AA: never put gold or `--teal-500` text on light grounds, and use navy, not teal, for links on `--haint-200`.
- Grounds: `.on-navy`, `.on-gold`, `.on-haint`, `.on-haint-soft`. Each re-sets `--focus` and link colors.
- Type: Besley (display) + Libre Franklin (body), loaded from Google Fonts in each page's `<head>`. Don't use `tabular-nums` with Besley; its tabular zero renders at the wrong weight.
- Section kickers (small uppercase labels above headings) and numbered markers are deliberately avoided, except the real 1-2-3 steps of the membership form.
- Brand assets in `images/`: `emblem-*.webp` (Sankofa shield, opaque white background, so it sits on white surfaces with `mix-blend-mode: multiply`), `crest-*.webp` (round seal, shown with `clip-path: circle()` to drop its cream corners), favicons cut from the crest, and `rays.svg` (the emblem's sunburst, used as a CSS mask so CSS sets its color).
