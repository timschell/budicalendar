# BudiCalendar – Anleitung

## 1. Installation

1. Plugin bauen (falls noch nicht geschehen):
   ```bash
   npm install
   npm run build
   ```
2. In Budibase: **Plugins → Upload Plugin**
3. Die Datei `dist/budicalendar-1.1.1.tar.gz` hochladen
4. Fertig – der Kalender erscheint in der Komponenten-Liste als **BudiCalendar**

---

## 2. Grundaufbau in Budibase

```
Seite
└── Data Provider       ← zieht Daten aus einer Tabelle
    └── BudiCalendar    ← Kalender-Komponente
```

Der Kalender braucht mindestens einen **Data Provider** als übergeordnete Komponente.
Im Data Provider stellst du ein, aus welcher Tabelle die Daten kommen und wie viele Zeilen geladen werden sollen.

---

## 3. Einstellungen im Detail

### 📁 Datenquelle 1 (und Datenquelle 2)

Hier verbindest du den Kalender mit deinen Daten.

| Einstellung | Was du einträgst | Beispiel |
|---|---|---|
| **Data Provider** | Den Data Provider auswählen, der über dem Kalender liegt | `Data Provider - Termine` |
| **Titel-Feld** | Name des Feldes mit dem Ereignis-Titel | `name` oder `betreff` |
| **Datums-Feld** | Feld mit einem einzelnen Datum (wenn kein Start/Ende) | `datum` |
| **Start-Feld** | Feld mit dem Startdatum/-uhrzeit | `startdatum` |
| **Ende-Feld** | Feld mit dem Enddatum/-uhrzeit (optional) | `enddatum` |
| **Ganztägige Ereignisse** | Ein = ganztägig, Aus = Uhrzeit wird berücksichtigt | ✓ |
| **Ereignis-Farbe** | Farbe der Ereignisse dieser Quelle | `#3b82f6` (blau) |

> **Tipp:** Du kannst Datenquelle 1 und Datenquelle 2 gleichzeitig nutzen —
> z.B. Quelle 1 = Urlaube (blau), Quelle 2 = Meetings (grün).

---

### ⚡ Aktionen

Hier legst du fest, was passiert wenn jemand auf den Kalender klickt.

#### Bei Klick auf Tag
Wird ausgelöst, wenn jemand auf einen **Tag** klickt (auch auf "+N weitere").

Verfügbare Werte:
- `date` → das angeklickte Datum als Text, z.B. `2026-04-15`
- `count` → wie viele Ereignisse an diesem Tag liegen
- `events` → alle Zeilen aus der Datenbank, die an diesem Tag liegen

**Typischer Anwendungsfall:** Beim Klick auf einen Tag ein Formular öffnen, um einen neuen Eintrag für dieses Datum zu erstellen.

#### Bei Klick auf Ereignis
Wird ausgelöst, wenn jemand auf ein **Ereignis** klickt.

Verfügbare Werte:
- `title` → Titel des Ereignisses
- `start` → Startdatum
- `end` → Enddatum (falls vorhanden)
- `date` → Datum des Ereignisses
- `rowId` → die ID der Datenbankzeile
- `row` → die komplette Datenbankzeile mit allen Feldern

**Typischer Anwendungsfall:** Beim Klick auf ein Ereignis ein Detail-Panel oder eine Bearbeitungsmaske öffnen.

---

### 🎨 Darstellung

| Einstellung | Bedeutung | Standard |
|---|---|---|
| **Standardansicht** | Welche Ansicht beim Laden gezeigt wird | Monat |
| **Sprache** | Deutsch oder Englisch | Deutsch |
| **Erster Wochentag** | Montag, Sonntag oder Samstag | Montag |
| **Wochenenden anzeigen** | Samstag/Sonntag anzeigen oder ausblenden | ✓ |
| **Kalenderwochen anzeigen** | KW-Nummern links anzeigen | ✗ |
| **Max. Ereignisse pro Tag** | Wie viele Ereignisse pro Tageszelle sichtbar sind (Rest → +N weitere) | 3 |
| **Höhe des Kalenders** | Mindesthöhe: `px`, `vh` oder `%` | `600px` |

---

### 🎨 Farben

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

### 🔢 Count View (optional)

Der Count View ist ein **Heatmap-Modus**: Statt Ereignis-Titel zeigt jede Tageszelle nur eine große Zahl an, und die Zelle wird je nach Anzahl eingefärbt.

Nützlich z.B. für: Auslastungs-Übersichten, Verfügbarkeiten, Belegungspläne.

| Einstellung | Bedeutung | Beispiel |
|---|---|---|
| **Count View aktivieren** | Heatmap-Modus ein-/ausschalten | ✗ |
| **Schwelle: niedrig** | Bis zu diesem Wert = "niedrig"-Farbe | `1` |
| **Schwelle: hoch** | Ab diesem Wert = "hoch"-Farbe | `5` |
| **Farbe: niedrig** | Farbe für wenige Ereignisse | grün |
| **Farbe: mittel** | Farbe für mittlere Anzahl | gelb |
| **Farbe: hoch** | Farbe für viele Ereignisse | rot |
| **Beschriftung** | Text in der Tageszelle, `{count}` = die Zahl | `{count} frei` |

---

## 4. Beispiel: Einfacher Terminkalender

**Tabelle in Budibase:**
| Feld | Typ |
|---|---|
| `name` | Text |
| `startdatum` | Datum/Uhrzeit |
| `enddatum` | Datum/Uhrzeit |

**Einstellungen im Kalender:**
- Data Provider → Data Provider der Tabelle
- Titel-Feld → `name`
- Start-Feld → `startdatum`
- Ende-Feld → `enddatum`
- Ganztägige Ereignisse → Aus
- Bei Klick auf Ereignis → Seitenleiste mit Detailansicht öffnen

---

## 5. Beispiel: Auslastungs-Kalender (Count View)

**Idee:** Zeige pro Tag wie viele Ressourcen verfügbar oder belegt sind.

- Count View → **Ein**
- Schwelle niedrig → `1`, Schwelle hoch → `5`
- Farbe niedrig → Grün
- Farbe hoch → Rot
- Beschriftung → `{count} verfügbar`
- Bei Klick auf Tag → Buchungsformular für dieses Datum öffnen
