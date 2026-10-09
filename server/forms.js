// Saves form submissions (email signups, contact messages and the chat assistant's unanswered questions) as one
// JSON line each on the data volume, optionally forwards each to a webhook, and exports them as CSV for staff.
const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "submissions.jsonl");
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ZIP = /^\d{5}(-\d{4})?$/;
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

// Each form lists the fields it keeps (with a length cap) and what must be valid. Anything else posted is dropped.
const FORMS = {
  newsletter: { label: "New email signup", fields: { email: 200, zip: 10, page: 80 }, valid: (f) => EMAIL.test(f.email) && ZIP.test(f.zip) },
  contact: { label: "New message", fields: { name: 120, email: 200, topic: 80, message: 4000 }, valid: (f) => f.name && EMAIL.test(f.email) && f.message },
  question: { label: "Question the website assistant couldn't answer", fields: { question: 1000, email: 200, page: 80 }, valid: (f) => f.question && (!f.email || EMAIL.test(f.email)) },
};

// Returns [status, body].
async function saveSubmission(input) {
  const name = input["form-name"], form = FORMS[name];
  if (!form) return [400, { error: "Unknown form." }];
  if (input.website) return [200, { ok: true }]; // honeypot: look successful to bots, store nothing
  const fields = Object.fromEntries(Object.entries(form.fields).map(([k, max]) => [k, clip(input[k], max)]));
  if (!form.valid(fields)) return [400, { error: "Please check the form and try again." }];

  const entry = { at: new Date().toISOString(), form: name, ...fields };
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  await fs.promises.appendFile(FILE, JSON.stringify(entry) + "\n");
  notify(form.label, entry);
  return [200, { ok: true }];
}

// Posts each submission to FORMS_WEBHOOK_URL if set. "text" suits Slack and n8n, "content" suits Discord.
function notify(label, entry) {
  const url = process.env.FORMS_WEBHOOK_URL;
  if (!url) return;
  const details = Object.entries(entry).filter(([k, v]) => v && k !== "at" && k !== "form").map(([k, v]) => `${k}: ${v}`);
  const text = [label, ...details].join("\n");
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, content: text.slice(0, 1900), ...entry }),
    signal: AbortSignal.timeout(5000),
  })
    .then((r) => { if (!r.ok) console.error("Form webhook failed:", r.status); })
    .catch((e) => console.error("Form webhook failed:", e.message));
}

// All saved submissions as CSV, optionally only one form. Cells starting with = + - @ are prefixed so a
// spreadsheet never runs them as formulas.
async function submissionsCsv(only) {
  let raw = "";
  try { raw = await fs.promises.readFile(FILE, "utf8"); } catch {}
  const rows = raw.split("\n").filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter((r) => r && (!only || r.form === only));
  const cols = ["at", "form", "name", "email", "zip", "topic", "message", "question", "page"];
  const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n";
}

module.exports = { saveSubmission, submissionsCsv };
