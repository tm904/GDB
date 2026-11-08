# Universitäts-Datenbank SQL Sandbox

Eine schlanke, schnelle und vollständig lokal im Browser laufende SQL-Testumgebung mit der klassischen **Universitäts-Datenbank** (bekannt aus *Kemper / Eickler: Datenbanksysteme – Eine Einführung*).

## Features

- **100 % Lokal & Sicher**: Nutzt **SQLite WebAssembly (`sql.js`)** direkt im Browser. Es werden keinerlei Daten an einen Server oder externe CDNs übertragen. Striktes Content-Security-Policy (CSP) und sicheres DOM-Rendering schützen vor XSS.
- **GitHub Pages Ready**: Reines statisches Hosting (HTML, CSS, JS, WASM) ohne Build-Schritt.
- **Exakter Datenbestand**:
  - `professoren` (7 Einträge)
  - `studenten` (8 Einträge)
  - `vorlesungen` (10 Einträge)
  - `voraussetzen` (7 Einträge)
  - `hoeren` (13 Einträge)
  - `assistenten` (6 Einträge)
  - `pruefen` (3 Einträge)
- **Komfortable Bedienung**:
  - Live-Ansicht aller 7 Tabellen inkl. Primär- und Fremdschlüssel-Markierung (aktualisiert sich auch bei `INSERT`, `UPDATE`, `DELETE`)
  - 1-Klick-Reset auf den Ausgangszustand
  - Beispiel-Abfragen, SQL-Bausteine, Abfrage-Verlauf, Volltext-Hervorhebung in den Referenztabellen, CSV-Export und Dark/Light-Mode

## Lokal starten

Da WebAssembly (`sql-wasm.wasm`) per `fetch` geladen wird, starte im Ordner einfach einen lokalen HTTP-Server:

```bash
cd uni-sql-sandbox
python3 -m http.server 8000
```

Anschließend im Browser öffnen: `http://localhost:8000`

## Auf GitHub Pages veröffentlichen

1. Neues GitHub-Repository erstellen und die Dateien aus diesem Ordner pushen.
2. Unter **Settings → Pages** als Source den Branch (`main`) auswählen.
3. Die Seite ist sofort unter deiner GitHub-Pages-URL erreichbar.

# GDB
