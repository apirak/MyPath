# My Path

## Identity

- **Route:** `/mypath`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42822&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42826&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/pages/MyPath.tsx`

## Purpose

The redesigned My Path defaults to a monthly study agenda. It puts courses available now first, then upcoming courses grouped by their start date.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Sticky header | Month / Year control, period picker, and Study Calendar entry point | Full-width sticky bar: tabs align left, period picker stays centred, calendar aligns right | Tabs and calendar share line one; centred picker moves to line two |
| 2 | Monthly agenda | Current courses, then upcoming courses grouped by start date | Centered reading column | Single-column agenda |
| 3 | Course card | Subject-colour strip, cover, Subject, Course title, type and total hours/date range | Horizontal card | Compact horizontal card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Monthly agenda — the chosen Monthly design (formerly variant C) and the default `/mypath` view | **Fully data-driven from `plan.ts` (no hardcoded courses).** Renders the month window starting at the month of `TODAY`; ‹ › moves one calendar month within the computed axis, which ends at the end of the latest course month. Sections per `agendaFor()`: blue callout "วันนี้" only in TODAY's month (heading counts in-progress courses, "วันพัก" variant when zero) → "วันนี้ · กำลังเรียน" (current month) / "กำลังเรียนช่วงเดือนนี้" (other months: overlap window, not ended before R) → "ถัดไป" grouped by start date with exam/Mock rows merged into their date groups (exam blue / Mock red, tint = ยังไม่ได้ซื้อ, same encoding as Year) → "จบแล้วในเดือนนี้" (muted) → "ผ่านมาแล้ว" (past events) → dashed empty-state box for blank months. Course cards use `cover` from plan when present (`public/cover/*.png`), else a subject-coloured plate (solid = ซื้อแล้ว, tint + inset ring = ยังไม่ได้ซื้อ) with "ยังไม่ได้ซื้อ" appended to the meta line. Period label turns blue (`b.now`) when displaying TODAY's month. Includes a JSON data panel like Year |
| MyPathYear | `src/pages/MyPathYear.tsx` | Yearly view (winner of the A/B/C round — owner picked the timeline grid; B/C variants and switcher removed) on `/mypath/year` | The axis begins ต.ค. 69 and ends at the last course's month, recalculating its month count and header label with the plan. Mock data mirrors `SAMPLE_DATA/` (25 courses, 554.5 ชม., 8 single-day events: สอบจริง 2 + Mock 6). Exam-rail encoding: hue = ชนิด (blue = สอบจริง, red = Mock) and depth = การซื้อ (solid dark = ซื้อแล้ว, light tint + dashed = ยังไม่ได้ซื้อ — only Mock CBT). The rail renders two-line pills (name on top, date below) always centred on their true date; a pill that would collide with an earlier one stacks into the next row below (rows grow as needed), with faint straight leader lines down to its dot. **Course start/end are computed, not hardcoded**: each course has a 1–10 ชั่วโมง/สัปดาห์ pace (default 5). Its duration is course hours ÷ weekly hours, rounded up; each derived week is 7 calendar days from the course start, and the next volume in that subject starts the following day. The weekly-load row distributes a course's total hours over its derived days, so partial Monday–Sunday windows do not overcount it; it compares the total against the Study Calendar budget — green ≤ budget, orange > budget to 1.5×, red > 1.5×. Header uses the shared PathHeader. Desktop: X = months, Y = subjects; mobile ≤640px transposes to Y = months, X = subjects. Alternating white / very-light-grey month bands follow the true calendar on desktop and month rows on mobile. Day-precision course bars, sequential within a subject, label tiers full → “เล่ม 1” → “ล. 1”. Ownership encoding (owner-set, replaces the earlier dashed outline): body = subject colour = ซื้อแล้ว (9 courses: TPAT3.1, MATH.1–3, PHY.0–4), body = light tint of the subject colour with subject-coloured head = ยังไม่ได้ซื้อ. |
| Study calendar | `src/pages/MyPath.tsx` | Entry point for study-capacity settings | Visual only; its settings page is not built yet |
| PathHeader | `src/components/PathHeader.tsx` | Shared Month/Year header layout | Active tab and period label vary by view; responsive two-line mobile layout. Optional `now` prop highlights the period label blue; optional `onPrev`/`onNext`/`canPrev`/`canNext` make the ‹ › buttons real (disabled at axis bounds) — Year omits them and stays visual-only |
| HeaderButton | `src/components/HeaderButton.tsx` | Shared raised header button used by Profile and Path | Supports icon-only and labelled controls |
| courseCatalog | `src/mypath/courseCatalog.ts` | Shared course catalogue for all learners | Course identity, subject, hours, labels and cover only. It deliberately contains no student dates or ownership. |
| studentPlan | `src/mypath/studentPlan.ts` | This learner's plan and editable study-calendar defaults | Stores course ownership, optional earliest start and optional weekly course hours, plus weekday/weekend hours that derive the weekly budget. |
| plan | `src/mypath/plan.ts` | Shared derived plan — schedule simulation, day-exact geometry, and Month agenda derivation | Imports catalog + student plan, then recomputes every course start/end from course hours and its weekly pace. The Course Detail slider updates this derived plan immediately; Month and Year subscribe to the same result. Both Month and Year consume the same derived `subjects`. `TODAY = '2026-12-05'` remains the single mock "today". |
| BottomNav | `src/components/BottomNav.tsx` | Shared fixed bottom navigation (หน้าแรก, คอร์ส, แผนเรียน, โปรไฟล์) | `active` prop (`'home' \| 'courses' \| 'mypath' \| 'profile'`) highlights the current page; used by all five pages |

## States & variants

- Month is the active tab; the Year tab links to the yearly view `/mypath/year`. The Week tab was cut — the Monthly agenda covers it (owner decision 2026-10-24).
- Year is now an accepted production view, not an active design variant. Mobile cells use a 64px minimum with 4px vertical padding; course cards use a 38px minimum. The temporary height-adjustment panel has been removed.
- Mobile Year now places dated exam pills at each month's header. Course cards remain intact beneath them, and each month row expands naturally when it contains more events or course cards.
- A mobile course card stretches to fill its month's row only when that course covers the entire calendar month; partial-month courses keep their compact card height.
- Available courses show in “วันนี้”; future courses are grouped under their start date. All monthly content is derived by `agendaFor()` — moving `TODAY`, editing `hours`, flipping `owned`, or adding/removing events re-renders both pages with no page-specific edits.
- Both views highlight the month that contains `TODAY`: Month colours the period label; Year tints the month band and its header label blue on desktop and the whole month row on mobile.
- The monthly agenda leaves a 14px gap below the sticky header. In the desktop Year timeline, the subject-label column stays fixed while the month grid scrolls horizontally.
- On mobile Year, the subject-column header stays sticky immediately below the two-row Path header; the period picker has additional space around it to read as a separate, centred control.
- Course start/end ranges are derived mock data, never source data: changing `studyCalendar` or a catalog `hours` value recalculates both Month and Year.
- Course Detail contains an immediate, accessible 1–10 stepped weekly-hours control plus an optional earliest-start date. It displays the estimated duration rounded up to weeks.
- Calendar requirements recorded for the next page: editable weekday/weekend hours that derive the weekly budget.

## Open questions

- The Study Calendar destination will configure regular-day/holiday study hours and per-day overrides.
- The legacy `/mypath/year-prototype` URL remains available during the transition; the Year tab uses `/mypath/year`.
- **Course-detail prototype** (branch `prototype/course-detail` only): clicking a course opens a detail view in 3 switchable variants — see `MYPATH-COURSE-DETAIL-PROTOTYPE.md`.
