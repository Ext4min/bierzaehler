# Bierzähler

Wöchentliches Bier-Scoreboard für die WhatsApp-Gruppe, gehostet auf Netlify.

- `public/index.html`: die Website (Passwort-Abfrage, Scoreboard, Upload)
- `netlify/functions/daten.mjs`: prüft das Passwort und speichert die Biere im Netlify-Speicher (Blobs)

## Einrichten
1. Dieses Repo bei Netlify verbinden: *Add new project → Import an existing project → GitHub*.
2. Build-Einstellungen leer lassen, `netlify.toml` regelt alles. Deploy klicken.
3. Optional: Passwort ändern unter *Project configuration → Environment variables* → `BIER_PASSWORT`. Danach einmal neu deployen. Ohne Variable gilt `bierkapitän`.

## Jede Woche
Chat exportieren (ohne Medien), auf der Website einloggen, unten „Export hochladen“. Fertig.
Gespeichert werden nur Name, Uhrzeit und Bier-Nummer.
