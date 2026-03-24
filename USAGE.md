# BudiCalendar – Anleitung

## 1. Installation

1. Plugin bauen (falls noch nicht geschehen):
   ```bash
   npm install
   npm run build
   ```
2. In Budibase: **Plugins → Upload Plugin**
3. Die Datei `dist/budicalendar-1.0.0.tar.gz` hochladen
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

### 📁 Data Source 1 (und Data Source 2)

Hier verbindest du den Kalender mit deinen Daten.

| Einstellung | Was du einträgst | Beispiel |
|---|---|---|
| **Data Provider** | Den Data Provider auswählen, der über dem Kalender liegt | `Data Provider - Termine` |
| **Title Field** | Name des Feldes mit dem Ereignis-Titel | `name` oder `Betreff` |
| **Date Field** | Feld mit einem einzelnen Datum (wenn kein Start/End) | `Datum` |
| **Start Field** | Feld mit dem Startdatum/-uhrzeit | `Startdatum` |
| **End Field** | Feld mit dem Enddatum/-uhrzeit (optional) | `Enddatum` |
| **All-day events** | An = ganztägig, Aus = Uhrzeit wird berücksichtigt | ✓ |
| **Event Color** | Farbe der Ereignisse dieser Quelle | `#3b82f6` (blau) |

> **Tipp:** Du kannst Data Source 1 und Data Source 2 gleichzeitig nutzen –  
> z.B. Quelle 1 = Urlaube (blau), Quelle 2 = Meetings (grün).

---

### ⚡ Actions

Hier legst du fest, was passiert wenn jemand auf den Kalender klickt.

#### On Day Click
Wird ausgelöst, wenn jemand auf einen **Tag** klickt (nicht auf ein Ereignis).

Verfügbare Werte:
- `date` → das angeklickte Datum als Text, z.B. `2025-06-15`
- `count` → wie viele Ereignisse an diesem Tag liegen
- `events` → alle Zeilen aus der Datenbank, die an diesem Tag liegen

**Typischer Anwendungsfall:** Beim Klick auf einen Tag ein Formular öffnen, um ein neues Ereignis für dieses Datum zu erstellen.

#### On Event Click
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

### 🎨 Appearance & Behaviour

| Einstellung | Bedeutung | Standard |
|---|---|---|
| **Default View** | Welche Ansicht beim Laden gezeigt wird | Monat |
| **Language** | Deutsch oder Englisch | Deutsch |
| **First Day of Week** | Montag, Sonntag oder Samstag | Montag |
| **Show Weekends** | Samstag/Sonntag anzeigen oder ausblenden | ✓ |
| **Show Week Numbers** | Kalenderwochen links anzeigen | ✗ |
| **Nav Links** | Klick auf Tageszahl springt in die Wochenansicht | ✓ |

---

### 🔧 Header Toolbar

Hier steuerst du welche Buttons oben im Kalender erscheinen.
Du trägst die Button-Namen kommagetrennt ein.

**Verfügbare Schlüsselwörter:**

| Schlüssel | Beschreibung |
|---|---|
| `prev` | Zurück-Button (‹) |
| `next` | Weiter-Button (›) |
| `today` | „Heute"-Button |
| `title` | Zeigt den aktuellen Monat/Zeitraum als Text |
| `month` | Wechselt zur Monatsansicht |
| `week` | Wechselt zur Wochenansicht |
| `list` | Wechselt zur Listenansicht |

**Standardkonfiguration:**
- Links: `prev,next,today`
- Mitte: `title`
- Rechts: `month,week,list`

---

### 🔢 Count View (optional)

Der Count View ist ein **Heatmap-Modus**: Statt Ereignis-Titel zeigt jede Tageszelle nur eine große Zahl an, und die Zelle wird je nach Anzahl eingefärbt.

Nützlich z.B. für: Auslastungs-Übersichten, Verfügbarkeiten, Belegungspläne.

| Einstellung | Bedeutung | Beispiel |
|---|---|---|
| **Enable Count View** | Heatmap-Modus ein-/ausschalten | ✗ |
| **Low Threshold** | Ab dieser Zahl = "wenig" (grüne Farbe) | `1` |
| **High Threshold** | Ab dieser Zahl = "viel" (rote Farbe) | `5` |
| **Low Color** | Farbe für wenige Ereignisse | `rgba(34,197,94,0.22)` |
| **Mid Color** | Farbe für mittlere Anzahl | `rgba(245,158,11,0.28)` |
| **High Color** | Farbe für viele Ereignisse | `rgba(239,68,68,0.28)` |
| **Count Label** | Text in der Tageszelle, `{count}` = die Zahl | `{count} frei` |

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
- Title Field → `name`
- Start Field → `startdatum`
- End Field → `enddatum`
- All-day → Aus
- On Event Click → Seitenleiste mit Detailansicht öffnen

---

## 5. Beispiel: Verfügbarkeits-Kalender (Count View)

**Idee:** Zeige pro Tag wie viele Ressourcen (z.B. Geräte, Personen) verfügbar sind.

- Count View → **Ein**
- Low Threshold → `1`, High Threshold → `5`
- Low Color → Grün (viel verfügbar)
- High Color → Rot (wenig/nichts verfügbar)
- Count Label → `{count} verfügbar`
- On Day Click → Buchungsformular für dieses Datum öffnen
