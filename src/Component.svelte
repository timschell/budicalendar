<script>
  import { getContext } from "svelte"
  import {
    getLocale, parseDate, toISODate, toISODateTime,
    buildMonthGrid, buildWeekDays, weekdayHeaders,
    isoWeek, isToday, isCurMonth,
  } from "./utils"

  // ══════════════════════════════════════════════════════════════════════════
  // Props
  // ══════════════════════════════════════════════════════════════════════════

  export let dataProvider  = null
  export let fieldTitle    = ""
  export let fieldDate     = ""
  export let fieldStart    = ""
  export let fieldEnd      = ""
  export let fieldAllDay   = true
  export let fieldColor    = "#3b82f6"

  export let dataProvider2 = null
  export let fieldTitle2   = ""
  export let fieldDate2    = ""
  export let fieldStart2   = ""
  export let fieldEnd2     = ""
  export let fieldAllDay2  = true
  export let fieldColor2   = "#10b981"

  export let onDayClick    = null
  export let onEventClick  = null

  export let initialView     = "month"
  export let language        = "de"
  export let firstDay        = "1"
  export let showWeekends    = true
  export let showWeekNumbers = false
  export let maxEventsPerDay = 3

  export let showCountView = false
  export let countMin      = 1
  export let countMax      = 5
  export let colorLow      = "rgba(34,197,94,0.22)"
  export let colorMid      = "rgba(245,158,11,0.28)"
  export let colorHigh     = "rgba(239,68,68,0.28)"
  export let countLabel    = "{count}"

  // ══════════════════════════════════════════════════════════════════════════
  // Normalize view
  // ══════════════════════════════════════════════════════════════════════════

  function normalizeView(v) {
    if (!v) return "month"
    if (v === "month" || v === "dayGridMonth") return "month"
    if (v === "week"  || v === "dayGridWeek" || v === "timeGridWeek" || v === "timeGridDay") return "week"
    if (v === "list"  || v === "listMonth"   || v === "listWeek") return "list"
    return "month"
  }

  // ══════════════════════════════════════════════════════════════════════════
  // State
  // ══════════════════════════════════════════════════════════════════════════

  const today    = new Date()

  // Monat/Liste: Jahr + Monat
  let curYear    = today.getFullYear()
  let curMonth   = today.getMonth()

  // Woche: eigenständiges Datum (Anfang der aktuellen Woche)
  let curWeekStart = weekStart(today)

  let activeView = normalizeView(initialView)

  const { styleable } = getContext("sdk")
  const component     = getContext("component")

  // Hilfsfunktion: Montag (oder firstDay) der Woche berechnen
  function weekStart(d) {
    const fd = parseInt(firstDay, 10) || 1
    const dow = d.getDay()
    const diff = (dow - fd + 7) % 7
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
    return s
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Navigation
  // ══════════════════════════════════════════════════════════════════════════

  function goPrev() {
    if (activeView === "week") {
      // Eine Woche zurück
      const d = new Date(curWeekStart)
      d.setDate(d.getDate() - 7)
      curWeekStart = d
    } else {
      // Einen Monat zurück
      if (curMonth === 0) { curMonth = 11; curYear = curYear - 1 }
      else                { curMonth = curMonth - 1 }
    }
  }

  function goNext() {
    if (activeView === "week") {
      // Eine Woche vor
      const d = new Date(curWeekStart)
      d.setDate(d.getDate() + 7)
      curWeekStart = d
    } else {
      // Einen Monat vor
      if (curMonth === 11) { curMonth = 0; curYear = curYear + 1 }
      else                 { curMonth = curMonth + 1 }
    }
  }

  function goToday() {
    curYear      = today.getFullYear()
    curMonth     = today.getMonth()
    curWeekStart = weekStart(today)
  }

  function setView(v) {
    activeView = normalizeView(v)
    // Beim Wechsel in Wochenansicht: auf aktuelle Woche setzen
    if (activeView === "week") curWeekStart = weekStart(today)
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Derived
  // ══════════════════════════════════════════════════════════════════════════

  $: loc     = getLocale(language)
  $: fd      = parseInt(firstDay, 10) || 1
  $: maxEv   = Math.max(1, parseInt(maxEventsPerDay, 10) || 3)
  $: headers = weekdayHeaders(fd)
  $: visibleHeaders = showWeekends ? headers : headers.filter(h => h !== 0 && h !== 6)

  // Titel abhängig von Ansicht
  $: titleText = (() => {
    if (activeView === "week") {
      const days = buildWeekDays(curWeekStart, fd)
      const s    = days[0]
      const e    = days[6]
      if (s.getMonth() === e.getMonth())
        return `${loc.months[s.getMonth()]} ${s.getFullYear()}`
      return `${loc.monthsShort[s.getMonth()]} – ${loc.monthsShort[e.getMonth()]} ${e.getFullYear()}`
    }
    return `${loc.months[curMonth]} ${curYear}`
  })()

  // ── Events ────────────────────────────────────────────────────────────────

  function extractEvents(rows, cfg) {
    if (!rows?.length) return []
    return rows.flatMap(row => {
      const rawDate  = cfg.fDate  ? row?.[cfg.fDate]  : null
      const rawStart = cfg.fStart ? row?.[cfg.fStart] : null
      const rawEnd   = cfg.fEnd   ? row?.[cfg.fEnd]   : null
      const title    = cfg.fTitle ? (row?.[cfg.fTitle] ?? "") : ""
      const start    = parseDate(rawStart ?? rawDate)
      if (!start) return []
      const end = rawEnd ? parseDate(rawEnd) : null
      return [{
        title:     String(title),
        start, end,
        color:     cfg.color,
        allDay:    cfg.allDay,
        _row:      row,
        _id:       row?._id ?? row?.id ?? "",
        _isoStart: toISODate(start),
        _isoEnd:   end ? toISODate(end) : null,
      }]
    })
  }

  $: allEvents = [
    ...extractEvents(dataProvider?.rows, {
      fTitle: fieldTitle,  fDate: fieldDate,  fStart: fieldStart,  fEnd: fieldEnd,
      allDay: fieldAllDay, color: fieldColor,
    }),
    ...extractEvents(dataProvider2?.rows, {
      fTitle: fieldTitle2, fDate: fieldDate2, fStart: fieldStart2, fEnd: fieldEnd2,
      allDay: fieldAllDay2, color: fieldColor2,
    }),
  ]

  $: eventsByDay = (() => {
    const map = {}
    allEvents.forEach(ev => {
      const k = ev._isoStart
      if (!k) return
      if (!map[k]) map[k] = []
      map[k].push(ev)
    })
    return map
  })()

  // ── Monats-Grid ────────────────────────────────────────────────────────────

  $: monthDays = buildMonthGrid(curYear, curMonth, fd)

  $: monthRows = (() => {
    const days = showWeekends
      ? monthDays
      : monthDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
    const cols = showWeekends ? 7 : 5
    const rows = []
    for (let i = 0; i < days.length; i += cols) rows.push(days.slice(i, i + cols))
    return rows
  })()

  // ── Wochen-Grid (nutzt curWeekStart) ───────────────────────────────────────

  $: weekDays = (() => {
    const days = buildWeekDays(curWeekStart, fd)
    return showWeekends ? days : days.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
  })()

  // ── Liste: nach Datum gruppiert ────────────────────────────────────────────

  $: listEvents = allEvents
    .filter(ev => ev.start.getFullYear() === curYear && ev.start.getMonth() === curMonth)
    .sort((a, b) => a.start - b.start)

  // Für Listenansicht: Events nach Tag gruppiert
  $: listGroups = (() => {
    const groups = []
    const seen   = {}
    listEvents.forEach(ev => {
      const k = ev._isoStart
      if (!seen[k]) {
        seen[k] = true
        groups.push({ key: k, date: ev.start, events: [] })
      }
      groups[groups.length - 1].events.push(ev)
    })
    // Korrekt: events pro Gruppe sammeln
    const map = {}
    listEvents.forEach(ev => {
      const k = ev._isoStart
      if (!map[k]) map[k] = { key: k, date: ev.start, events: [] }
      map[k].events.push(ev)
    })
    return Object.values(map).sort((a, b) => a.date - b.date)
  })()

  // ── Interactions ───────────────────────────────────────────────────────────

  function handleDayClick(d) {
    if (!onDayClick) return
    const k = toISODate(d)
    const evs = eventsByDay[k] ?? []
    onDayClick({ date: k, count: evs.length, events: evs.map(e => e._row) })
  }
  function handleDayKey(e, d) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleDayClick(d) }
  }
  function handleEventClick(ev, e) {
    e.stopPropagation()
    if (!onEventClick) return
    onEventClick({ title: ev.title, start: ev._isoStart, end: ev._isoEnd ?? null,
      date: ev._isoStart, rowId: ev._id, row: ev._row })
  }
  function handleEventKey(ev, e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); e.stopPropagation(); handleEventClick(ev, e)
    }
  }

  // Count helpers
  function countBg(c) {
    if (c <= 0) return "transparent"
    if (c >= countMax) return colorHigh
    if (c <= countMin) return colorLow
    return colorMid
  }
  function fmtCount(c) {
    return (countLabel || "{count}").replaceAll("{count}", String(c))
  }
</script>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div use:styleable={$component.styles} class="bc-root">
  <div class="bc-card">

    <!-- ══════════════════════════════════════════════════════════════════
         TOOLBAR
         ══════════════════════════════════════════════════════════════════ -->
    <div class="bc-toolbar">
      <div class="bc-tb-left">
        <button class="bc-btn bc-btn--nav" on:click={goPrev} aria-label="Zurück">←</button>
        <button class="bc-btn bc-btn--nav" on:click={goNext} aria-label="Weiter">→</button>
        <button class="bc-btn bc-btn--pill" on:click={goToday}>{loc.today}</button>
      </div>
      <div class="bc-tb-center">
        <span class="bc-title">{titleText}</span>
      </div>
      <div class="bc-tb-right">
        <div class="bc-view-group">
          <button class="bc-btn bc-btn--view" class:bc-btn--active={activeView === "month"} on:click={() => setView("month")}>Monat</button>
          <button class="bc-btn bc-btn--view" class:bc-btn--active={activeView === "week"}  on:click={() => setView("week")}>Woche</button>
          <button class="bc-btn bc-btn--view" class:bc-btn--active={activeView === "list"}  on:click={() => setView("list")}>Liste</button>
        </div>
      </div>
    </div>

    <!-- ── Wochentagsheader ─────────────────────────────────────────────── -->
    {#if activeView === "month" || activeView === "week"}
      <div class="bc-weekheader"
        style="--cols:{visibleHeaders.length + (showWeekNumbers && activeView === 'month' ? 1 : 0)}">
        {#if showWeekNumbers && activeView === "month"}
          <div class="bc-wn-head"></div>
        {/if}
        {#each visibleHeaders as dow}
          <div class="bc-weekheader-cell">{loc.weekdaysShort[dow]}</div>
        {/each}
      </div>
    {/if}

    <!-- ══════════════════════════════════════════════════════════════════
         MONATSANSICHT
         ══════════════════════════════════════════════════════════════════ -->
    {#if activeView === "month"}
      <div class="bc-month">
        {#each monthRows as row}
          <div class="bc-month-row"
            style="--cols:{visibleHeaders.length + (showWeekNumbers ? 1 : 0)}">
            {#if showWeekNumbers}
              <div class="bc-wn">{isoWeek(row[0])}</div>
            {/if}
            {#each row as day}
              {@const k     = toISODate(day)}
              {@const evs   = eventsByDay[k] ?? []}
              {@const count = evs.length}
              {@const cur   = isCurMonth(day, curYear, curMonth)}
              {@const tod   = isToday(day)}
              <div
                class="bc-day"
                class:bc-day--other={!cur}
                class:bc-day--today={tod}
                style={showCountView && count > 0 ? `background:${countBg(count)}` : ""}
                role="button" tabindex="0"
                on:click={() => handleDayClick(day)}
                on:keydown={(e) => handleDayKey(e, day)}
              >
                <div class="bc-day-top">
                  <span class="bc-day-num" class:bc-day-num--today={tod}>{day.getDate()}</span>
                  {#if showCountView && count > 0}
                    <span class="bc-count-pill">{fmtCount(count)}</span>
                  {/if}
                </div>
                {#if !showCountView}
                  <div class="bc-events">
                    {#each evs.slice(0, maxEv) as ev}
                      <button class="bc-ev" class:bc-ev--today={tod}
                        style="--ec:{ev.color}"
                        on:click={(e) => handleEventClick(ev, e)}
                        on:keydown={(e) => handleEventKey(ev, e)}
                        title={ev.title}
                      >{ev.title}</button>
                    {/each}
                    {#if count > maxEv}
                      <span class="bc-more">+{count - maxEv} weitere</span>
                    {/if}
                  </div>
                {/if}
                {#if showCountView && count > 0}
                  <div class="bc-count-body">
                    <span class="bc-count-num">{count}</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/if}

    <!-- ══════════════════════════════════════════════════════════════════
         WOCHENANSICHT
         ══════════════════════════════════════════════════════════════════ -->
    {#if activeView === "week"}
      <div class="bc-week" style="--cols:{weekDays.length}">
        {#each weekDays as day}
          {@const k   = toISODate(day)}
          {@const evs = eventsByDay[k] ?? []}
          {@const tod = isToday(day)}
          <div class="bc-week-col" class:bc-week-col--today={tod}
            role="button" tabindex="0"
            on:click={() => handleDayClick(day)}
            on:keydown={(e) => handleDayKey(e, day)}
          >
            <div class="bc-week-date">
              <span class="bc-week-wd">{loc.weekdaysShort[day.getDay()]}</span>
              <span class="bc-week-num" class:bc-day-num--today={tod}>{day.getDate()}</span>
            </div>
            <div class="bc-week-events">
              {#each evs as ev}
                <button class="bc-ev bc-ev--week" class:bc-ev--today={tod}
                  style="--ec:{ev.color}"
                  on:click={(e) => handleEventClick(ev, e)}
                  on:keydown={(e) => handleEventKey(ev, e)}
                  title={ev.title}
                >{ev.title}</button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- ══════════════════════════════════════════════════════════════════
         LISTENANSICHT — nach Tagen gruppiert
         ══════════════════════════════════════════════════════════════════ -->
    {#if activeView === "list"}
      <div class="bc-list">
        {#if listGroups.length === 0}
          <div class="bc-list-empty">{loc.noEvents}</div>
        {:else}
          {#each listGroups as group}
            {@const tod = isToday(group.date)}
            <!-- Tageskopf -->
            <div class="bc-list-head" class:bc-list-head--today={tod}
              role="button" tabindex="0"
              on:click={() => handleDayClick(group.date)}
              on:keydown={(e) => handleDayKey(e, group.date)}
            >
              <div class="bc-list-head-date">
                <span class="bc-list-head-num" class:bc-day-num--today={tod}>
                  {group.date.getDate()}
                </span>
              </div>
              <div class="bc-list-head-info">
                <span class="bc-list-head-wd">{loc.weekdays[group.date.getDay()]}</span>
                <span class="bc-list-head-mon">{loc.monthsShort[group.date.getMonth()]} {group.date.getFullYear()}</span>
              </div>
              <span class="bc-list-head-count">{group.events.length} {group.events.length === 1 ? 'Eintrag' : 'Einträge'}</span>
            </div>
            <!-- Events des Tages -->
            {#each group.events as ev}
              <button class="bc-list-row"
                on:click={(e) => handleEventClick(ev, e)}
                on:keydown={(e) => handleEventKey(ev, e)}
              >
                <div class="bc-list-color" style="background:{ev.color}"></div>
                <span class="bc-list-title">{ev.title}</span>
                {#if !ev.allDay && ev._isoStart?.length > 10}
                  <span class="bc-list-time">{ev._isoStart.slice(11,16)}{ev._isoEnd ? ' – ' + ev._isoEnd.slice(11,16) : ''}</span>
                {/if}
              </button>
            {/each}
          {/each}
        {/if}
      </div>
    {/if}

  </div>
</div>

<style>
  .bc-root {
    width: 100%;
    min-height: 520px;
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif;
    font-size: 13px;
    color: #0f172a;
    box-sizing: border-box;
  }
  .bc-card {
    width: 100%;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 6px 28px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
  }

  /* ── Toolbar ─────────────────────────────────────────────────────────── */
  .bc-toolbar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 13px 18px 10px;
    border-bottom: 1px solid #f1f5f9;
    border-radius: 14px 14px 0 0;
    background: #fff;
  }
  .bc-tb-left  { display: flex; align-items: center; gap: 3px; }
  .bc-tb-center { display: flex; align-items: center; justify-content: center; }
  .bc-tb-right  { display: flex; align-items: center; justify-content: flex-end; }

  .bc-title { font-size: 1rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; white-space: nowrap; }

  .bc-btn { background: transparent; border: none; color: #475569; border-radius: 7px; font-size: 0.78rem; font-weight: 600; padding: 5px 8px; cursor: pointer; transition: background 0.1s, color 0.1s; line-height: 1.4; white-space: nowrap; font-family: inherit; }
  .bc-btn:hover { background: #f1f5f9; color: #0f172a; }
  .bc-btn--nav  { font-size: 1.1rem; color: #475569; padding: 5px 10px; font-weight: 400; }
  .bc-btn--nav:hover { background: #f1f5f9; color: #0f172a; }
  .bc-btn--pill { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px; font-size: 0.74rem; font-weight: 600; margin-left: 4px; }
  .bc-btn--pill:hover { background: #e2e8f0; }

  .bc-view-group { display: flex; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .bc-btn--view  { border: none; border-right: 1px solid #e2e8f0; border-radius: 0; background: #fff; font-size: 0.73rem; font-weight: 600; padding: 5px 12px; color: #64748b; font-family: inherit; cursor: pointer; transition: background 0.1s; }
  .bc-btn--view:last-child { border-right: none; }
  .bc-btn--view:hover { background: #f8fafc; }
  .bc-btn--active { background: #1e293b !important; color: #fff !important; border-color: transparent !important; }

  /* ── Wochentagszeile ─────────────────────────────────────────────────── */
  .bc-weekheader { display: grid; grid-template-columns: repeat(var(--cols), 1fr); background: #f8fafc; border-bottom: 1px solid #e8edf2; }
  .bc-weekheader-cell, .bc-wn-head { padding: 8px 0; text-align: center; font-size: 0.67rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #94a3b8; }
  .bc-wn-head { width: 28px; }

  /* ── Monatsansicht ───────────────────────────────────────────────────── */
  .bc-month { display: flex; flex-direction: column; }
  .bc-month-row { display: grid; grid-template-columns: repeat(var(--cols), 1fr); border-bottom: 1px solid #f1f5f9; }
  .bc-month-row:last-child { border-bottom: none; }

  .bc-wn { width: 28px; padding-top: 7px; text-align: center; font-size: 0.6rem; font-weight: 600; color: #cbd5e1; flex-shrink: 0; }

  .bc-day { border-right: 1px solid #f1f5f9; min-height: 96px; padding: 6px 6px 5px; cursor: pointer; display: flex; flex-direction: column; gap: 2px; outline: none; transition: background 0.08s; box-sizing: border-box; overflow: hidden; background: #fff; }
  .bc-day:last-child { border-right: none; }
  .bc-day:hover { background: #f8fafc !important; }
  .bc-day:focus-visible { outline: 2px solid #3b82f6; outline-offset: -2px; }
  .bc-day--other { opacity: 0.32; }
  .bc-day--today { background: #fff !important; border-left: 3px solid #3b82f6; }
  .bc-day--today:hover { background: #f0f7ff !important; }

  .bc-day-top { display: flex; align-items: center; justify-content: space-between; gap: 3px; margin-bottom: 1px; }
  .bc-day-num { font-size: 0.78rem; font-weight: 600; color: #64748b; line-height: 1; font-variant-numeric: tabular-nums; min-width: 20px; text-align: center; }
  .bc-day-num--today { background: #3b82f6; color: #fff !important; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; }

  .bc-events { display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; }
  .bc-ev { display: block; width: 100%; text-align: left; background: color-mix(in srgb, var(--ec) 10%, #fff); border: none; border-left: 3px solid var(--ec); border-radius: 4px; padding: 2px 5px; font-size: 0.68rem; font-weight: 600; color: color-mix(in srgb, var(--ec) 60%, #1e293b); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.55; font-family: inherit; transition: background 0.1s, transform 0.05s; box-sizing: border-box; flex-shrink: 0; }
  .bc-ev:hover { background: color-mix(in srgb, var(--ec) 20%, #fff); transform: translateX(1px); }
  .bc-ev:focus-visible { outline: 2px solid var(--ec); outline-offset: 1px; }
  .bc-ev--today { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.09); }
  .bc-ev--today:hover { background: color-mix(in srgb, var(--ec) 8%, #fff); }
  .bc-more { font-size: 0.62rem; font-weight: 600; color: #94a3b8; padding: 1px 4px; line-height: 1.4; }

  .bc-count-pill { font-size: 0.58rem; font-weight: 700; color: #475569; background: rgba(0,0,0,0.06); border-radius: 10px; padding: 1px 6px; }
  .bc-count-body { flex: 1; display: flex; align-items: center; justify-content: center; }
  .bc-count-num { font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; line-height: 1; }

  /* ── Wochenansicht ───────────────────────────────────────────────────── */
  .bc-week { display: grid; grid-template-columns: repeat(var(--cols), 1fr); min-height: 360px; }
  .bc-week-col { border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; cursor: pointer; outline: none; background: #fff; transition: background 0.08s; }
  .bc-week-col:last-child { border-right: none; }
  .bc-week-col:hover { background: #f8fafc; }
  .bc-week-col:focus-visible { outline: 2px solid #3b82f6; outline-offset: -2px; }
  .bc-week-col--today { border-top: 3px solid #3b82f6; }
  .bc-week-col--today:hover { background: #f0f7ff; }
  .bc-week-date { display: flex; flex-direction: column; align-items: center; padding: 10px 4px 6px; border-bottom: 1px solid #f1f5f9; gap: 3px; flex-shrink: 0; }
  .bc-week-wd { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; }
  .bc-week-num { font-size: 1rem; font-weight: 700; color: #475569; font-variant-numeric: tabular-nums; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  .bc-week-num.bc-day-num--today { background: #3b82f6; color: #fff; font-size: 0.88rem; }
  .bc-week-events { flex: 1; display: flex; flex-direction: column; gap: 3px; padding: 6px 5px; overflow: hidden; }
  .bc-ev--week { white-space: normal; word-break: break-word; line-height: 1.4; font-size: 0.72rem; }

  /* ══════════════════════════════════════════════════════════════════════
   * LISTENANSICHT — nach Tagen gruppiert
   * ══════════════════════════════════════════════════════════════════════ */
  .bc-list { display: flex; flex-direction: column; }

  .bc-list-empty { padding: 40px 20px; text-align: center; font-size: 0.9rem; font-weight: 500; color: #94a3b8; background: #f8fafc; border-radius: 0 0 14px 14px; }

  /* Tageskopf-Zeile */
  .bc-list-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px 8px;
    background: #f8fafc;
    border-bottom: 1px solid #e8edf2;
    cursor: pointer;
    outline: none;
    transition: background 0.08s;
    border: none;
    width: 100%;
    text-align: left;
  }
  .bc-list-head:hover { background: #f1f5f9; }
  .bc-list-head:focus-visible { outline: 2px solid #3b82f6; outline-offset: -2px; }
  .bc-list-head--today { background: #eff6ff; border-left: 3px solid #3b82f6; }
  .bc-list-head--today:hover { background: #dbeafe; }

  .bc-list-head-date {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bc-list-head-num {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  /* Heute-Nummer im Listenkopf */
  .bc-list-head-num.bc-day-num--today {
    background: #3b82f6;
    color: #fff !important;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .bc-list-head-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .bc-list-head-wd   { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
  .bc-list-head-mon  { font-size: 0.68rem; font-weight: 500; color: #94a3b8; }
  .bc-list-head-count { font-size: 0.68rem; font-weight: 600; color: #94a3b8; white-space: nowrap; }

  /* Event-Zeile innerhalb eines Tages */
  .bc-list-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px 9px 24px;
    border: none;
    border-bottom: 1px solid #f1f5f9;
    width: 100%;
    text-align: left;
    font-family: inherit;
    background: #fff;
    cursor: pointer;
    outline: none;
    transition: background 0.09s;
  }
  .bc-list-row:last-child { border-bottom: none; }
  .bc-list-row:hover { background: #f8fafc; }
  .bc-list-row:focus-visible { outline: 2px solid #3b82f6; outline-offset: -2px; }

  .bc-list-color { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  .bc-list-title { font-size: 0.85rem; font-weight: 500; color: #1e293b; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

  .bc-list-time { font-size: 0.72rem; font-weight: 500; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
</style>
