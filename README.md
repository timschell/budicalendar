# BudiCalendar

> Ein modernes, vollständig eigenständiges Kalender-Plugin für Budibase — gebaut von Grund auf in Svelte, ohne externe Kalender-Bibliothek.

**Autor:** [Tim Schellenberg](https://github.com/timschellenberg)  
**Lizenz:** MIT  
**Aktuelle Version:** 1.1.1  
**Budibase:** 3.24.0+

---

## Inhaltsverzeichnis

- [Features](#features)
- [Installation](#installation)
- [Schnellstart](#schnellstart)
- [Einstellungen](#einstellungen)
  - [Datenquellen](#datenquellen)
  - [Aktionen](#aktionen)
  - [Darstellung](#darstellung)
  - [Farben](#farben)
  - [Count View](#count-view)
- [Ansichten](#ansichten)
- [Aufbau in Budibase](#aufbau-in-budibase)
- [Datums-Formate](#datums-formate)
- [Changelog](#changelog)
- [Lizenz](#lizenz)

---

## Features

| | |
|---|---|
| 📅 | **3 Ansichten** — Monat, Woche, Liste (nach Tagen gruppiert) |
| 🗂️ | **2 unabhängige Datenquellen** mit freiem Feld-Mapping |
| 🖱️ | **On Day Click** — gibt Datum, Event-Anzahl und alle Zeilen des Tages zurück |
| 🖱️ | **On Event Click** — gibt Titel, Start, Ende, Row-ID und komplette Zeile zurück |
| ➕ | **+N weitere** — klickbar, löst ebenfalls On Day Click aus |
| 🔢 | **Count View** — optionaler Heatmap-Modus mit Schwellenwerten und 3 Farben |
| 🎨 | **Vollständig anpassbare UI-Farben** — Akzent, Toolbar, Zellen, Rahmen, Hover |
| ⚙️ | Sprache (DE/EN), erster Wochentag, Wochenenden, Kalenderwochen, max. Events/Tag |
| 📐 | Frei konfigurierbare Höhe (px, vh, %) |
| 💡 | **Geführter Empty State** — Schritt-für-Schritt-Anleitung wenn kein Data Provider verbunden |
| ✅ | Kompatibel mit Budibase 3.24.0 — Svelte 4 Legacy Bridge eingebaut |
| 🚫 | **Keine externen Kalender-Abhängigkeiten** — vollständig eigenständig |

---

## Installation

### 1. Plugin bauen

```bash
git clone https://github.com/timschellenberg/budicalendar.git
cd budicalendar
npm install
npm run build
```

Die fertige Upload-Datei liegt danach unter:

```
dist/budicalendar-1.1.1.tar.gz
```

### 2. In Budibase hochladen

1. Budibase öffnen → **Plugins** (oben rechts im Menü)
2. **Upload Plugin** klicken
3. `budicalendar-1.1.1.tar.gz` auswählen
4. Fertig — **BudiCalendar** erscheint in der Komponenten-Liste

---

## Schnellstart

### Aufbau auf der Seite

```
Seite
└── Data Provider          ← Tabelle auswählen (z.B. "Termine")
    └── BudiCalendar       ← Kalender-Komponente
```

> **Wichtig:** Der Data Provider muss ein **übergeordnetes Element** von BudiCalendar sein, nicht daneben.

### Mindest-Konfiguration

Öffne die BudiCalendar-Einstellungen und trage unter **Datenquelle 1** ein:

| Einstellung | Wert (Beispiel) |
|---|---|
| Data Provider | `Data Provider - Termine` |
| Titel-Feld | `name` |
| Datums-Feld | `datum` |

Der Kalender zeigt sofort alle Einträge aus der Tabelle an.

---

## Einstellungen

### Datenquellen

Der Kalender unterstützt **zwei unabhängige Datenquellen** gleichzeitig — z.B. Termine aus zwei verschiedenen Tabellen in unterschiedlichen Farben.

| Einstellung | Bedeutung | Beispiel |
|---|---|---|
| **Data Provider** | Der Data Provider, der über dem Kalender liegt | `Data Provider - Termine` |
| **Titel-Feld** | Spaltenname für den Ereignis-Titel | `name` |
| **Datums-Feld** | Spaltenname für ein einzelnes Datum (wenn kein Start/Ende) | `datum` |
| **Start-Feld** | Spaltenname für das Startdatum (überschreibt Datums-Feld) | `startdatum` |
| **Ende-Feld** | Spaltenname für das Enddatum (optional) | `enddatum` |
| **Ganztägige Ereignisse** | Ein = nur Datum; Aus = Uhrzeit wird berücksichtigt | ✓ |
| **Ereignis-Farbe** | Farbe der Chips für diese Datenquelle | `#3b82f6` |

> Die Feldnamen müssen **exakt** den Spaltennamen in deiner Budibase-Tabelle entsprechen — Groß-/Kleinschreibung beachten.

---

### Aktionen

#### On Day Click
Wird ausgelöst wenn der Nutzer auf eine **Tageszelle** oder auf **+N weitere** klickt.

Verfügbare Werte in der Action:

| Schlüssel | Typ | Inhalt |
|---|---|---|
| `date` | String | Datum im ISO-Format, z.B. `2026-04-15` |
| `count` | Number | Anzahl der Ereignisse an diesem Tag |
| `events` | Array | Alle Datenbankzeilen dieses Tages (komplette Row-Objekte) |

**Typischer Anwendungsfall:** Beim Klick auf einen Tag einen Drawer oder ein Modal öffnen, das alle Ereignisse des Tages auflistet oder ein Formular zum Erstellen eines neuen Eintrags zeigt.

#### On Event Click
Wird ausgelöst wenn der Nutzer auf ein **konkretes Ereignis** (Chip) klickt.

| Schlüssel | Typ | Inhalt |
|---|---|---|
| `title` | String | Titel des Ereignisses |
| `start` | String | Startdatum (ISO) |
| `end` | String \| null | Enddatum (ISO) oder null |
| `date` | String | Datum (ISO) |
| `rowId` | String | Datenbank-ID der Zeile |
| `row` | Object | Komplette Zeile mit allen Feldern |

**Typischer Anwendungsfall:** Beim Klick auf ein Ereignis ein Detail-Panel oder eine Bearbeitungsmaske öffnen, vorausgefüllt mit den Daten des angeklickten Eintrags.

---

### Darstellung

| Einstellung | Bedeutung | Standard |
|---|---|---|
| **Standardansicht** | Welche Ansicht beim Laden gezeigt wird | Monat |
| **Sprache** | Deutsch oder Englisch | Deutsch |
| **Erster Wochentag** | Montag, Sonntag oder Samstag | Montag |
| **Wochenenden anzeigen** | Sa + So ein- oder ausblenden | ✓ |
| **Kalenderwochen anzeigen** | KW-Nummern links anzeigen | ✗ |
| **Max. Ereignisse pro Tag** | Wie viele Chips sichtbar sind (Rest → +N weitere) | 3 |
| **Höhe des Kalenders** | Mindesthöhe: `px`, `vh` oder `%` | `600px` |

---

### Farben

Alle UI-Farben des Kalenders sind frei anpassbar:

| Einstellung | Was sie steuert | Standard |
|---|---|---|
| **Akzentfarbe** | Heute-Markierung, Fokus-Rahmen, aktiver View-Button | `#3b82f6` |
| **Toolbar-Hintergrund** | Hintergrund der oberen Leiste | `#ffffff` |
| **Wochentags-Header** | Hintergrund der MO DI MI ... Zeile | `#f8fafc` |
| **Tageszellen Hintergrund** | Standardfarbe leerer Zellen | `#ffffff` |
| **Tageszellen Hover** | Farbe beim Hover über eine Zelle | `#f8fafc` |
| **Rahmenfarbe** | Linien zwischen den Zellen | `#f1f5f9` |
| **Aktiver Button** | Hintergrund des aktiven Monat/Woche/Liste-Buttons | `#1e293b` |

---

### Count View

Der Count View ist ein **Heatmap-Modus**: Statt Ereignis-Chips zeigt jede Tageszelle eine große Zahl — und die Zelle wird je nach Anzahl eingefärbt.

Nützlich für: Auslastungs-Übersichten, Verfügbarkeitskalender, Belegungspläne.

| Einstellung | Bedeutung | Standard |
|---|---|---|
| **Count View aktivieren** | Heatmap-Modus ein-/ausschalten | ✗ |
| **Schwelle: niedrig** | Bis zu diesem Wert = "niedrig"-Farbe | `1` |
| **Schwelle: hoch** | Ab diesem Wert = "hoch"-Farbe | `5` |
| **Farbe: niedrig** | Zellfarbe bei niedriger Anzahl | grün |
| **Farbe: mittel** | Zellfarbe bei mittlerer Anzahl | gelb |
| **Farbe: hoch** | Zellfarbe bei hoher Anzahl | rot |
| **Beschriftung** | Text in der Zelle — `{count}` = die Zahl | `{count}` |

Beispiel für `Beschriftung`: `{count} frei` → zeigt `3 frei` in der Zelle.

---

## Ansichten

### Monatsansicht
Klassisches Monats-Grid. Bis zu N Ereignisse pro Zelle (einstellbar), weitere als `+N weitere`-Button. Heute wird mit einem blauen linken Rand markiert.

### Wochenansicht
7-Tage-Spalten (oder 5 ohne Wochenende). Die ← → Navigation springt **wochenweise**. Heute bekommt einen blauen oberen Rand.

### Listenansicht
Alle Ereignisse des aktuellen Monats, nach Tagen gruppiert. Oben ein Monatsbanner mit Gesamtzahl der Einträge — bleibt auch bei leerem Monat sichtbar. Die ← → Navigation springt **monatsweise**.

---

## Aufbau in Budibase

```
Seite
└── Data Provider (Tabelle: Termine)        ← Übergeordnetes Element
    └── BudiCalendar
          Datenquelle 1:
            Data Provider  → Data Provider - Termine
            Titel-Feld     → name
            Datums-Feld    → datum
            Ereignis-Farbe → #3b82f6
          Bei Klick auf Ereignis:
            → Seitenleiste öffnen
            → Feld "Titel" = {{ On Event Click - Titel }}
```

Für **zwei Datenquellen** (z.B. Urlaube + Meetings):

```
Seite
├── Data Provider (Tabelle: Urlaube)
├── Data Provider (Tabelle: Meetings)
└── BudiCalendar
      Datenquelle 1: Data Provider - Urlaube  → Farbe: #3b82f6
      Datenquelle 2: Data Provider - Meetings → Farbe: #10b981
```

---

## Datums-Formate

Der Kalender versteht automatisch alle gängigen Formate:

| Format | Beispiel |
|---|---|
| ISO (bevorzugt) | `2026-04-15` |
| Deutsch | `15.04.2026` |
| Deutsch mit Uhrzeit | `15.04.2026 14:30` |
| ISO mit Uhrzeit | `2026-04-15T14:30:00` |
| Unix Timestamp | `1744718400000` |

Budibase-Datumsfelder (Typ "Datum/Uhrzeit") funktionieren direkt ohne Anpassung.

---

## Changelog

### 1.1.1 — 2026-03-24
- `+N weitere` ist jetzt ein echter klickbarer Button → löst `On Day Click` aus
- Listenansicht: Monatsbanner wird immer angezeigt (auch bei leerem Monat)

### 1.1.0 — 2026-03-24
- **Vollständig anpassbare UI-Farben** (7 Farbwerte, alle per Settings einstellbar)
- **Einstellbare Höhe** — neues Setting `Höhe des Kalenders` (px/vh/%)
- **Empty State** — geführte Schritt-für-Schritt-Anleitung wenn kein Data Provider verbunden
- Bessere Labels und `helpText` für alle Settings — intuitivere Konfiguration
- Sektion-Namen mit Emojis für schnellere Orientierung im Settings-Panel

### 1.0.0 — 2026-03-24
- Erste stabile Version
- Monats-, Wochen- und Listenansicht (nach Tagen gruppiert)
- 2 Datenquellen mit freiem Feld-Mapping
- On Day Click / On Event Click Actions
- Count View (Heatmap-Modus)
- Wochennavigation springt wochenweise, Monatsnavigation monatsweise
- Keine externen Kalender-Abhängigkeiten

---

## Mitmachen

Fehler gefunden oder eine Idee? Issues und Pull Requests sind willkommen:

1. Repository forken
2. Feature-Branch erstellen: `git checkout -b feature/mein-feature`
3. Änderungen committen: `git commit -m "feat: mein feature"`
4. Push: `git push origin feature/mein-feature`
5. Pull Request öffnen

---

## Lizenz

MIT © [Tim Schellenberg](https://github.com/timschellenberg)

Freie Nutzung, Änderung und Weitergabe — in privaten Projekten, kommerziellen Produkten und behördlichen Anwendungen gleichermaßen.  
Third-party dependencies (Svelte, @crownframework/svelte-error-boundary) unterliegen ihren eigenen Lizenzen.
