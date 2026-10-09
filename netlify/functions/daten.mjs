import { getStore } from "@netlify/blobs";

// Passwort: Umgebungsvariable BIER_PASSWORT in Netlify, sonst "bierkapitän".
const norm = (p) => (p || "").trim().normalize("NFC").toLowerCase();
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function clean(list) {
  if (!Array.isArray(list) || list.length > 200000) return null;
  const out = [];
  for (const b of list) {
    if (!b || !STAMP.test(b.t) || typeof b.name !== "string") return null;
    const nr = Number(b.nr);
    if (!Number.isInteger(nr) || nr < 0 || nr > 99999) return null;
    out.push({ t: b.t, name: b.name.slice(0, 60), nr });
  }
  return out;
}

export default async (req) => {
  let pw = "";
  try { pw = decodeURIComponent(req.headers.get("x-bier-pw") || ""); } catch {}
  const env = globalThis.Netlify?.env?.get("BIER_PASSWORT") || "bierkapitän";
  if (norm(pw) !== norm(env)) return json({ error: "Falsches Passwort" }, 401);

  const store = getStore({ name: "bierzaehler", consistency: "strong" });
  const current = (await store.get("daten", { type: "json" })) || { stand: null, biere: [] };

  if (req.method === "GET") return json(current);

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "Ungültige Daten" }, 400); }
    const incoming = clean(body?.biere);
    if (!incoming) return json({ error: "Ungültige Daten" }, 400);
    let biere = incoming;
    if (body.mode !== "replace") {
      const seen = new Map();
      for (const b of [...current.biere, ...incoming]) seen.set(`${b.t}|${b.name}|${b.nr}`, b);
      biere = [...seen.values()];
    }
    biere.sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : a.nr - b.nr));
    const data = { stand: new Date().toISOString(), biere };
    await store.setJSON("daten", data);
    return json({ ...data, neu: biere.length - (body.mode === "replace" ? 0 : current.biere.length) });
  }

  return json({ error: "Nicht erlaubt" }, 405);
};

export const config = { path: "/api/daten" };
