import { Resend } from "resend";

interface Env {
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  RESEND_TO: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_EXPECTED_HOSTNAME: string;
  CORS_ORIGIN?: string;
}

const PRODUCTION_ORIGIN = "https://luizwitt.dev";
const MAX_BODY_BYTES = 32_000;
const REQUIRED = ["name", "email", "demand", "deadline", "budget"] as const;
const OPTIONAL = ["company", "phone", "site", "technology"] as const;
const TURNSTILE_ACTION = "contact_form";
const MAX_LENGTHS: Record<string, number> = {
  name: 100, email: 254, demand: 5_000, deadline: 200, budget: 200,
  company: 150, phone: 50, site: 2_048, technology: 500, honeypot: 200,
};

type Contact = Record<(typeof REQUIRED)[number] | (typeof OPTIONAL)[number], string>;

function logError(stage: string, code: string): void {
  console.error("contact_worker_error", { stage, code });
}

function headers(origin: string | null, env: Env): Headers {
  const allowed = env.CORS_ORIGIN || PRODUCTION_ORIGIN;
  const result = new Headers({ "Content-Type": "application/json; charset=utf-8", "Vary": "Origin" });
  if (origin === allowed) {
    result.set("Access-Control-Allow-Origin", allowed);
    result.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    result.set("Access-Control-Allow-Headers", "Content-Type");
    result.set("Access-Control-Max-Age", "86400");
  }
  return result;
}

function json(data: unknown, status: number, request: Request, env: Env): Response {
  return new Response(JSON.stringify(data), { status, headers: headers(request.headers.get("Origin"), env) });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanText(value: unknown, field: string): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  const controls = field === "demand" ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/;
  if (!result || result.length > MAX_LENGTHS[field] || controls.test(result)) return null;
  return result;
}

function validate(input: unknown): { contact?: Contact; token?: string; error?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Request body must be a JSON object." };
  const data = input as Record<string, unknown>;
  const allowed = new Set([...REQUIRED, ...OPTIONAL, "honeypot", "turnstileToken"]);
  if (Object.keys(data).some((key) => !allowed.has(key))) return { error: "Unknown contact field." };
  if (data.honeypot !== undefined && (typeof data.honeypot !== "string" || data.honeypot.trim())) return { error: "Invalid submission." };
  const token = cleanText(data.turnstileToken, "honeypot");
  if (!token) return { error: "Invalid or missing turnstile token." };
  const contact = {} as Contact;
  for (const field of REQUIRED) {
    const value = cleanText(data[field], field);
    if (!value) return { error: `Invalid or missing ${field}.` };
    contact[field] = value;
  }
  if (!isEmail(contact.email)) return { error: "Invalid email." };
  for (const field of OPTIONAL) {
    if (data[field] === undefined || data[field] === "") continue;
    const value = cleanText(data[field], field);
    if (!value) return { error: `Invalid ${field}.` };
    contact[field] = value;
  }
  if (contact.site && !/^https?:\/\/[^\s]+$/i.test(contact.site)) return { error: "Invalid site URL." };
  return { contact, token };
}

async function readBody(request: Request): Promise<{ body?: string; tooLarge?: boolean }> {
  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return { tooLarge: true };
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return { body: new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes) }; } catch { return {}; }
}

async function verifyTurnstile(token: string, env: Env): Promise<boolean> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    if (!response.ok) { logError("turnstile", "http_failure"); return false; }
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string };
    return result.success === true && result.action === TURNSTILE_ACTION && result.hostname === env.TURNSTILE_EXPECTED_HOSTNAME;
  } catch { logError("turnstile", "request_failure"); return false; }
}

function emailBodies(contact: Contact): { text: string; html: string } {
  const labels: Record<string, string> = { name: "Name", email: "Email", demand: "Demand", deadline: "Deadline", budget: "Budget", company: "Company", phone: "Phone", site: "Site", technology: "Technology" };
  const fields = [...REQUIRED, ...OPTIONAL].filter((field) => contact[field]);
  const text = `New contact request\n\n${fields.map((field) => `${labels[field]}: ${contact[field]}`).join("\n")}`;
  const html = `<h1>New contact request</h1><dl>${fields.map((field) => `<dt><strong>${escapeHtml(labels[field])}</strong></dt><dd>${escapeHtml(contact[field]).replace(/\n/g, "<br>")}</dd>`).join("")}</dl>`;
  return { text, html };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") return json({ error: "Not found." }, 404, request, env);
    const origin = request.headers.get("Origin");
    const allowedOrigin = env.CORS_ORIGIN || PRODUCTION_ORIGIN;
    if ((request.method === "POST" || request.method === "OPTIONS") && origin !== allowedOrigin) return json({ error: "Origin not allowed." }, 403, request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin, env) });
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, request, env);
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413, request, env);
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return json({ error: "Content-Type must be application/json." }, 415, request, env);
    const read = await readBody(request);
    if (read.tooLarge) return json({ error: "Request is too large." }, 413, request, env);
    let body: unknown;
    try { body = JSON.parse(read.body ?? ""); } catch { return json({ error: "Invalid JSON." }, 400, request, env); }
    const validation = validate(body);
    if (validation.error || !validation.contact || !validation.token) return json({ error: validation.error }, 400, request, env);
    if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.RESEND_TO || !env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_EXPECTED_HOSTNAME) {
      logError("configuration", "missing_required_setting");
      return json({ error: "Service is not configured." }, 500, request, env);
    }
    if (!(await verifyTurnstile(validation.token, env))) {
      logError("turnstile", "verification_failed");
      return json({ error: "Unable to verify submission." }, 403, request, env);
    }
    const contact = validation.contact;
    const { text, html } = emailBodies(contact);
    try {
      const { error } = await new Resend(env.RESEND_API_KEY).emails.send({ from: env.RESEND_FROM, to: env.RESEND_TO, replyTo: contact.email, subject: `Contact request from ${contact.name}`, text, html });
      if (error) { logError("resend", "api_failure"); return json({ error: "Unable to send message." }, 502, request, env); }
    } catch { logError("resend", "request_failure"); return json({ error: "Unable to send message." }, 502, request, env); }
    return json({ ok: true }, 200, request, env);
  },
};
