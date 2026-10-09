# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static, no-build marketing site for the Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce (Savannah, GA). Plain HTML/CSS/vanilla JS: no package manager, bundler, linter, or tests. Not a git repository. Deploys to Netlify (`netlify.toml`), which also hosts the one serverless function and the forms.

## Running

Dev server is defined in `.claude/launch.json` (name `site`): `python -m http.server 5173`, then open http://localhost:5173. The Python server can't run the Netlify function or accept form POSTs, so checkout and form submissions only work on a Netlify deploy (or `netlify dev`).

## Architecture

- **Content lives in `js/data.js`** as global consts: `SITE` (contact info, donate and social links, `checkoutEndpoint`), `CATEGORIES`, `AREAS`, `MEMBERS`, `EVENTS`, `GALLERY`, `VIDEOS`, `LEADERS`, `REGISTRATION_FEE`, `TIERS`. Editing site content means editing this file, not the HTML.
- **Draft mode**: while `SAMPLE_DATA` is true, `main.js` adds `.is-draft` to `<html>`, which shows the dashed `.draft-note` elements (static in the HTML) and keeps empty sections visible. With it false, notes hide, sample `LEADERS` are dropped, and any section whose list is empty gets `data-empty` and is hidden (gallery, videos, leaders). Links set to `"#"` (`SITE.donate`, social URLs, member `url`) are never rendered.
- **`js/main.js`** (single IIFE, loaded after `data.js` on every page) does all rendering:
  - Injects the shared header/footer by replacing the empty `#site-header` / `#site-footer` placeholders. Nav links are in its `NAV` array; the active link comes from `location.pathname`. To add a page, update `NAV` and copy an existing page's `<head>` and script tags.
  - Renders data into elements by id, each guarded by an existence check: `#home-events`, `#events-list`, `#home-dir`, `#dir-grid` (with `#q`, `#cat`, `#area`, `#chips`, `#count`), `#gallery` (optional `data-limit`, native `<dialog>` viewer), `#videos`, `#leaders`, `#tier-list`, `#hero-signup`.
  - Appends the email signup band (`#newsletter`, email + zip) above the footer on every page except `membership-success.html`.
  - User-facing strings from data go through `esc()`. Keep that when adding renderers.
- **Forms**: the newsletter (`newsletter`) and contact (`contact`) forms post to Netlify Forms via `fetch("/")` with a `form-name` field. Netlify only stores fields declared in static HTML: the newsletter form is declared by the hidden form at the top of `index.html`, and the contact form is static in `contact.html`. Adding a field means adding it there too. Both use a `website` honeypot field.
- **Membership checkout**: the `#tier-list` radios are step 1 of `#join-form`, grouped by each tier's `group` and showing its `fit` tag and `blurb` (wording taken from the client's live membership page), plus an `includes` list (`includesFrom` renders "Everything in X, plus:"). The current `includes` lists are a proposal the chamber hasn't approved: `includesDraft: true` shows them with a "Draft" label only while `SAMPLE_DATA` is true, and hides them otherwise. Flip it to false per tier once the chamber confirms that tier's list. A tier with `guardian: true` (Youngpreneur, ages 15 and under) reveals `#guardian-note` in step 2. Keep that note: the form collects contact details, and COPPA requires parental consent for children under 13. Submitting POSTs JSON to `netlify/functions/create-checkout.js`, which builds a Stripe Checkout session with the membership and the $25 registration fee as separate line items and stores the member's answers as metadata. **Tier ids, names and prices exist twice**: `TIERS` in `data.js` (display) and `TIERS` in the function (what Stripe charges and the receipt shows). Keep them in sync. Needs `STRIPE_SECRET_KEY` in Netlify (see `.env.example`).
- **Chat assistant**: `js/qa.js` is the Q&A knowledge base (`QA`, `FALLBACK`, `SYSTEM_PROMPT` for any future AI model); `js/chat.js` matches questions by keyword overlap against it, ignoring a stop-word list, and offers to email unanswered questions to the team.
- **Motion**: the home hero has CSS load animations (sun rays turning behind the emblem). Lists marked `data-reveal="stagger"` animate in with the Web Animations API, only when they start below the fold. Content is never hidden by default, and both paths respect `prefers-reduced-motion`.

## Design system (`css/styles.css`)

- Palette is sampled from the chamber emblem (navy `#232856`, gold `#dc9c28`, teal `#159aab`, Sankofa brown `#633b14`, on white), defined as OKLCH tokens in `:root`. Haint blue (`--haint-*`, the pale blue-green of Lowcountry porch ceilings) is the light ground. The client asked to keep these colors for cultural representation. Contrast is checked against WCAG AA: never put gold or `--teal-500` text on light grounds, and use navy, not teal, for links on `--haint-200`.
- Grounds: `.on-navy`, `.on-gold`, `.on-haint`, `.on-haint-soft`. Each re-sets `--focus` and link colors.
- Type: Besley (display) + Libre Franklin (body), loaded from Google Fonts in each page's `<head>`. Don't use `tabular-nums` with Besley; its tabular zero renders at the wrong weight.
- Section kickers (small uppercase labels above headings) and numbered markers are deliberately avoided, except the real 1-2-3 steps of the membership form.
- Brand assets in `images/`: `emblem-*.webp` (Sankofa shield, opaque white background, so it sits on white surfaces with `mix-blend-mode: multiply`), `crest-*.webp` (round seal, shown with `clip-path: circle()` to drop its cream corners), favicons cut from the crest, and `rays.svg` (the emblem's sunburst, used as a CSS mask so CSS sets its color).
