// ─── Lokalisierung ────────────────────────────────────────────────────────────

export const LOCALES = {
  de: {
    months: [
      "Januar","Februar","März","April","Mai","Juni",
      "Juli","August","September","Oktober","November","Dezember",
    ],
    monthsShort: [
      "Jan","Feb","Mär","Apr","Mai","Jun",
      "Jul","Aug","Sep","Okt","Nov","Dez",
    ],
    weekdays: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
    weekdaysShort: ["So","Mo","Di","Mi","Do","Fr","Sa"],
    weekdaysMini:  ["S","M","D","M","D","F","S"],
    today: "Heute",
    noEvents: "Keine Ereignisse",
    week: "KW",
  },
  en: {
    months: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ],
    monthsShort: [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ],
    weekdays: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    weekdaysShort: ["Su","Mo","Tu","We","Th","Fr","Sa"],
    weekdaysMini:  ["S","M","T","W","T","F","S"],
    today: "Today",
    noEvents: "No events",
    week: "Wk",
  },
}

export function getLocale(lang) {
  return LOCALES[lang] ?? LOCALES["de"]
}

// ─── Datum-Parsing ────────────────────────────────────────────────────────────

/**
 * Parst beliebige Datumsdarstellungen in ein JS-Date.
 * Unterstützt: DD.MM.YYYY, YYYY-MM-DD, ISO-Strings, Unix-Timestamps, Date-Objekte
 */
export function parseDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val
  if (typeof val === "number") {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof val === "string") {
    const s = val.trim()
    // DD.MM.YYYY [HH:MM[:SS]]
    const m1 = s.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    )
    if (m1) {
      return new Date(
        +m1[3], +m1[2] - 1, +m1[1],
        m1[4] ? +m1[4] : 0,
        m1[5] ? +m1[5] : 0,
        m1[6] ? +m1[6] : 0
      )
    }
    // YYYY-MM-DD  → lokal (kein UTC-Shift)
    const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m2) return new Date(+m2[1], +m2[2] - 1, +m2[3])
    // ISO oder sonstiges
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/** Date → "YYYY-MM-DD" */
export function toISODate(val) {
  const d = val instanceof Date ? val : parseDate(val)
  if (!d) return null
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, "0")
  const dy = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dy}`
}

/** Date → "YYYY-MM-DDTHH:MM:SS" (lokal) */
export function toISODateTime(val) {
  const d = val instanceof Date ? val : parseDate(val)
  if (!d) return null
  const base = toISODate(d)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${base}T${hh}:${mm}:${ss}`
}

// ─── Kalender-Logik ───────────────────────────────────────────────────────────

/**
 * Gibt alle Tage zurück, die im Monats-Grid für year/month angezeigt werden.
 * Das Grid beginnt immer am firstDay (0=So, 1=Mo) und hat exakt 6×7 = 42 Zellen.
 *
 * @returns Array von Date-Objekten
 */
export function buildMonthGrid(year, month, firstDay = 1) {
  const first = new Date(year, month, 1)
  const dow   = first.getDay() // 0=So … 6=Sa

  // Wie viele Tage müssen wir zurückgehen, um am firstDay zu starten?
  let offset = (dow - firstDay + 7) % 7
  const start = new Date(year, month, 1 - offset)

  const days = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return days
}

/**
 * Gibt die 7 Wochentag-Header zurück (ab firstDay),
 * als Indizes in das weekdays-Array der Locale.
 */
export function weekdayHeaders(firstDay = 1) {
  return Array.from({ length: 7 }, (_, i) => (firstDay + i) % 7)
}

/**
 * Gibt alle 7 Tage der Woche zurück, die das übergebene Datum enthält.
 * Wochenbeginn = firstDay.
 */
export function buildWeekDays(date, firstDay = 1) {
  const dow    = date.getDay()
  const offset = (dow - firstDay + 7) % 7
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  )
}

/** ISO-Wochennummer (ISO 8601) */
export function isoWeek(d) {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7)
}

/** Ist d heute? */
export function isToday(d) {
  const t = new Date()
  return d.getFullYear() === t.getFullYear() &&
         d.getMonth()    === t.getMonth()    &&
         d.getDate()     === t.getDate()
}

/** Ist d im aktuell angezeigten Monat? */
export function isCurMonth(d, year, month) {
  return d.getFullYear() === year && d.getMonth() === month
}
