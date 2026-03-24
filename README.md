# BudiCalendar

Ein modernes, universell einsetzbares Kalender-Plugin für **Budibase 3.24.0** — vollständig selbst in Svelte geschrieben, ohne externe Kalender-Bibliothek.

**Autor:** [Tim Schellenberg](https://github.com/timschellenberg)
**Lizenz:** MIT
**Version:** 1.0.0

📖 **[→ Ausführliche Anleitung (USAGE.md)](./USAGE.md)**

---

## Features

- 📅 **3 Ansichten** — Monat, Woche, Liste (nach Tagen gruppiert)
- 🗂️ **2 unabhängige Datenquellen** mit freiem Field-Mapping
- 🖱️ **On Day Click** — gibt Datum, Anzahl Events und alle Zeilen des Tages zurück
- 🖱️ **On Event Click** — gibt Titel, Start, Ende, Row-ID und komplette Zeile zurück
- 🔢 **Count View** — optionaler Heatmap-Modus mit konfigurierbaren Schwellenwerten und Farben
- ⚙️ Einstellbar: Sprache (DE/EN), erster Wochentag, Wochenenden, Kalenderwochen, max. Events pro Tag
- 🎨 Modernes Design — Slate-Farbpalette, abgerundete Ecken, weiche Schatten
- ✅ Kompatibel mit Budibase 3.24.0 (Svelte 4 Legacy Bridge)
- 🚫 **Keine externen Abhängigkeiten** — vollständig eigenständig

---

## Build & Installation

```bash
npm install
npm run build
```

Die fertige Datei liegt danach unter:

```
dist/budicalendar-1.0.0.tar.gz
```

In Budibase hochladen unter **Plugins → Upload Plugin**.

---

## Schnellstart

```
Seite
└── Data Provider   (Tabelle mit Einträgen auswählen)
    └── BudiCalendar
          Title Field  → name
          Date Field   → datum
```

---

## Einstellungen

| Bereich | Einstellungen |
|---|---|
| **Data Source 1 & 2** | DataProvider, Title / Date / Start / End Field, All-day, Farbe |
| **Actions** | *On Day Click* → `date`, `count`, `events[]` · *On Event Click* → `title`, `start`, `end`, `rowId`, `row` |
| **Darstellung** | Standardansicht, Sprache, erster Wochentag, Wochenenden, Kalenderwochen, max. Events pro Tag |
| **Count View** | Aktivieren, untere/obere Schwelle, 3 Farben, Label-Template mit `{count}` |

---

## Changelog

### 1.0.0 — 2026-03-24
- Erste stabile Version
- Monats-, Wochen- und Listenansicht (nach Tagen gruppiert)
- 2 Datenquellen mit freiem Field-Mapping
- On Day Click / On Event Click Actions
- Count View (Heatmap-Modus)
- Konfigurierbare max. Events pro Tageszelle
- Wochennavigation springt wochenweise, Monatsnavigation monatsweise
- Vollständig eigenständig, keine externen Kalender-Bibliotheken

---

## Lizenz

MIT © [Tim Schellenberg](https://github.com/timschellenberg)

Freie Nutzung, Änderung und Weitergabe — in privaten Projekten, kommerziellen Produkten und behördlichen Anwendungen.
