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
| 1 | Sticky header | Month / Year / All control, period picker, and Study Calendar entry point | Full-width sticky bar: tabs align left, period picker stays centred, calendar aligns right | Tabs and calendar share line one; centred picker moves to line two |
| 2 | Monthly agenda | Current courses, then upcoming courses grouped by start date | Centered reading column | Single-column agenda |
| 3 | Course card | Subject-colour strip, cover, Subject, Course title, type and total hours/date range | Horizontal card | Compact horizontal card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Monthly agenda — the chosen Monthly design (formerly variant C) and the default `/mypath` view | **Fully data-driven from `plan.ts` (no hardcoded courses).** Renders the month window starting at the month of `TODAY`; ‹ › moves one calendar month within the computed axis, which ends at the end of the latest course month. Sections per `agendaFor()`: blue callout "วันนี้" only in TODAY's month (heading counts in-progress courses, "วันพัก" variant when zero) → "วันนี้ · กำลังเรียน" (current month) / "กำลังเรียนช่วงเดือนนี้" (other months: overlap window, not ended before R) → "ถัดไป" grouped by start date with exam/Mock rows merged into their date groups (exam blue / Mock red, tint = ยังไม่ได้ซื้อ, same encoding as Year) → "จบแล้วในเดือนนี้" (muted) → "ผ่านมาแล้ว" (past events) → dashed empty-state box for blank months. Course cards use `cover` from plan when present (`public/cover/*.png`), else a subject-coloured plate (solid = ซื้อแล้ว, tint + inset ring = ยังไม่ได้ซื้อ) with "ยังไม่ได้ซื้อ" appended to the meta line. Period label turns blue (`b.now`) when displaying TODAY's month. Includes a JSON data panel like Year |
| MyPathYear | `src/pages/MyPathYear.tsx` | Shared timeline for `/mypath/year` and `/mypath/all` | Year shows exactly 12 calendar months, defaults to the year of `TODAY`, and moves one year at a time within the plan's years. All retains the complete derived plan axis and has no navigation arrows. Both share the same desktop/mobile timeline, event rail, course ownership encoding, and weekly-load calculation. |
| Study calendar | `src/pages/MyPath.tsx` | Entry point for study-capacity settings | Visual only; its settings page is not built yet |
| PathHeader | `src/components/PathHeader.tsx` | Shared Month/Year header layout | Active tab and period label vary by view; responsive two-line mobile layout. Optional `now` prop highlights the period label blue; optional `onPrev`/`onNext`/`canPrev`/`canNext` make the ‹ › buttons real (disabled at axis bounds) — Year omits them and stays visual-only |
| HeaderButton | `src/components/HeaderButton.tsx` | Shared raised header button used by Profile and Path | Supports icon-only and labelled controls |
| courseCatalog | `src/mypath/courseCatalog.ts` | Shared course catalogue for all learners | Course identity, subject, hours, labels and cover only. It deliberately contains no student dates or ownership. |
| studentPlan | `src/mypath/studentPlan.ts` | This learner's plan and editable study-calendar defaults | Stores course ownership, optional earliest start and optional weekly course hours, plus weekday/weekend hours that derive the weekly budget. |
| plan | `src/mypath/plan.ts` | Shared derived plan — schedule simulation, day-exact geometry, and Month agenda derivation | Imports catalog + student plan, then recomputes every course start/end from course hours and its weekly pace. The Course Detail slider updates this derived plan immediately; Month and Year subscribe to the same result. Both Month and Year consume the same derived `subjects`. `TODAY = '2026-12-05'` remains the single mock "today". |
| BottomNav | `src/components/BottomNav.tsx` | Shared fixed bottom navigation (หน้าแรก, คอร์ส, แผนเรียน, โปรไฟล์) | `active` prop (`'home' \| 'courses' \| 'mypath' \| 'profile'`) highlights the current page; used by all five pages |

## States & variants

- Month, Year and All are the active tabs. Year links to `/mypath/year`, defaults to the year of `TODAY`, and shows 12 calendar months; All links to `/mypath/all`, renders the entire plan axis and has no period arrows. The Week tab was cut — the Monthly agenda covers it (owner decision 2026-10-24).
- Year is now an accepted production view, not an active design variant. Mobile cells use a 64px minimum with 4px vertical padding; course cards use a 38px minimum. The temporary height-adjustment panel has been removed.
- Mobile Year now places dated exam pills at each month's header. Course cards remain intact beneath them, and each month row expands naturally when it contains more events or course cards.
- A mobile course card stretches to fill its month's row only when that course covers the entire calendar month; partial-month courses keep their compact card height.
- Available courses show in “วันนี้”; future courses are grouped under their start date. All monthly content is derived by `agendaFor()` — moving `TODAY`, editing `hours`, flipping `owned`, or adding/removing events re-renders both pages with no page-specific edits.
- Both views highlight the month that contains `TODAY`: Month colours the period label; Year tints the month band and its header label blue on desktop and the whole month row on mobile.
- The desktop Year weekly-load display is the final row of the shared, horizontally scrollable course table: one bar represents one calendar week, its height scales to that week's load but stays within the row, and its colour continues to indicate the load against the Study Calendar budget.
- The monthly agenda leaves a 14px gap below the sticky header. In the desktop Year timeline, the subject-label column stays fixed while the month grid scrolls horizontally.
- On mobile Year, the subject-column header stays sticky immediately below the two-row Path header; the period picker has additional space around it to read as a separate, centred control.
- Course start/end ranges are derived mock data, never source data: changing `studyCalendar` or a catalog `hours` value recalculates both Month and Year.
- Course Detail is a bottom sheet on both desktop and mobile, easing smoothly into its final position from below and leaving quickly downward with a decelerating finish. It uses the same content: desktop places the course/CTA, schedule controls, and course summary horizontally; mobile stacks those panels vertically at full available width. The close button has equal top and right inset. Course-control labels share a 14px semibold style, and the custom 1–10 step slider draws its track, ticks, and thumb while retaining the numbers below. It immediately updates the estimated duration, plan, and timelines. “ตาม Course ก่อนหน้า” is a themed checkbox aligned with the “วันเริ่มต้น” label; it uses the same schedule rule as an empty earliest-start date, disables the date picker without deleting its value, and restores that value when unchecked. Desktop month columns have a 64px minimum width.
- Calendar requirements recorded for the next page: editable weekday/weekend hours that derive the weekly budget.

## Open questions

- The Study Calendar destination will configure regular-day/holiday study hours and per-day overrides.
- The legacy `/mypath/year-prototype` URL remains available during the transition; the Year tab uses `/mypath/year`.
- **Course-detail prototype** (branch `prototype/course-detail` only): clicking a course opens a detail view in 3 switchable variants — see `MYPATH-COURSE-DETAIL-PROTOTYPE.md`.
