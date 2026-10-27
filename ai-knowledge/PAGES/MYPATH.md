# My Path

## Identity

- **Route:** `/mypath`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42822&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42826&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/pages/MyPath.tsx`

## Purpose

The redesigned My Path defaults to a monthly study agenda. It puts courses available now first, then upcoming courses grouped by their start date; All provides the complete plan at a glance.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Sticky header | Month / All control, period picker, and Study Calendar entry point | Full-width sticky bar: tabs align left, period picker stays centred, calendar aligns right | Tabs and calendar share line one; centred picker moves to line two |
| 2 | Monthly agenda | Current courses, then upcoming courses grouped by start date | Centered reading column | Single-column agenda |
| 3 | Course card | Subject-colour strip, cover, Subject, Course title, type and total hours/date range | Horizontal card | Compact horizontal card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Monthly agenda — the chosen Monthly design (formerly variant C) and the default `/mypath` view | **Fully data-driven from `plan.ts` (no hardcoded courses).** Renders the month in `?month=YYYY-MM` (missing/invalid/out-of-axis → replaced with TODAY's month); ‹ › pushes the adjacent month to the URL (so Back/Forward walk months) within the computed axis, which ends at the end of the latest course month. Sections per `agendaFor()`: blue callout "วันนี้" only in TODAY's month (heading counts in-progress courses, "วันพัก" variant when zero) → "วันนี้ · กำลังเรียน" (current month) / "กำลังเรียนช่วงเดือนนี้" (other months: overlap window, not ended before R) → "ถัดไป" grouped by start date with exam/Mock rows merged into their date groups (exam blue / Mock red, tint = ยังไม่ได้ซื้อ, same encoding as All) → "จบแล้วในเดือนนี้" (muted) → "ผ่านมาแล้ว" (past events) → dashed empty-state box for blank months. Course cards use `cover` from plan when present (`public/cover/*.png`), else a subject-coloured plate (solid = ซื้อแล้ว, tint + inset ring = ยังไม่ได้ซื้อ) with "ยังไม่ได้ซื้อ" appended to the meta line. Period label turns blue (`b.now`) when displaying TODAY's month. |
| MyPathAllTimeline | `src/pages/MyPathAllTimeline.tsx` | Full-plan timeline for `/mypath/all` | Desktop uses one calendar grid with shared day-weighted month columns, event rail, subject rows, and weekly-load graph. Mobile uses a vertical month list: sticky subject key, month-local events, and tappable subject course cards. |
| Study calendar | `src/mypath/StudyCalendarPanel.tsx` | Full-screen study-capacity settings panel | Opens from the shared header on Month and All; closes downwards with × or its backdrop |
| PathHeader | `src/components/PathHeader.tsx` | Shared Month/All header layout | Active tab and period label vary by view; Month/All tabs are React Router `Link`s that carry the current query (`month`, `course`, …) across, so switching never reloads the page; responsive two-line mobile layout. Optional `now` prop highlights the period label blue; optional `onPrev`/`onNext`/`canPrev`/`canNext` make the Month ‹ › buttons real (disabled at axis bounds). |
| HeaderButton | `src/components/HeaderButton.tsx` | Shared raised header button used by Profile and Path | Supports icon-only and labelled controls |
| courseCatalog | `src/mypath/courseCatalog.ts` | Shared course catalogue for all learners | Course identity, subject, hours, labels and cover only. It deliberately contains no student dates or ownership. |
| studentPlan | `src/mypath/studentPlan.ts` | This learner's plan and editable study-calendar defaults | Stores course ownership, optional earliest start and optional weekly course hours, plus weekday/weekend hours that derive the weekly budget. |
| plan | `src/mypath/plan.ts` | Shared derived plan — schedule simulation, day-exact geometry, and Month agenda derivation | Imports catalog + student plan, then recomputes every course start/end from course hours and its weekly pace. The Course Detail slider updates this derived plan immediately; Month and All subscribe to the same result. Both views consume the same derived `subjects`. `TODAY = '2026-12-05'` remains the single mock "today". |
| BottomNav | `src/components/BottomNav.tsx` | Shared fixed bottom navigation (หน้าแรก, คอร์ส, แผนเรียน, โปรไฟล์) | `active` prop (`'home' \| 'courses' \| 'mypath' \| 'profile'`) highlights the current page; used by all four pages |

## States & variants

- Month and All are the active tabs. Month remains the default `/mypath` view; All links to `/mypath/all`, renders the entire plan axis in the unified desktop calendar grid, and has no period arrows. Year and its routes were removed by owner decision 2026-10-26; no redirect is retained. The Week tab was cut — the Monthly agenda covers it (owner decision 2026-10-24).
- On mobile, All places dated exam pills at each month's header. Course cards remain intact beneath them, and each month row expands naturally when it contains more events or course cards. Its desktop-only weekly-load graph is intentionally omitted on mobile.
- A mobile course card stretches to fill its month's row only when that course covers the entire calendar month; partial-month courses keep their compact card height.
- Available courses show in “วันนี้”; future courses are grouped under their start date. All monthly content is derived by `agendaFor()` — moving `TODAY`, editing `hours`, flipping `owned`, or adding/removing events re-renders both pages with no page-specific edits.
- Both views highlight the month that contains `TODAY`: Month colours the period label; All tints the month header on desktop and the whole month row on mobile.
- The desktop All weekly-hours row ("ชั่วโมงเรียน/สัปดาห์", 42px tall) is the final row of the shared, horizontally scrollable course table: one bar per calendar week on a shared absolute-hours scale (34px plot, 1px above the bottom, 5px/2px corner radius). The part within the Study Calendar budget is green, the part above it is red and stacked on the same bar, and a light dashed line marks the budget. A black (?) button opens a popover legend; hovering a bar shows planned/actual/over hours. Chosen 2026-10-27 from three variants (bars + plan line, diff from plan, monthly summary) — prototype kept on branch `prototype/weekly-hours-graph`. Desktop month columns use a 2.2 px/day minimum width.
- The monthly agenda leaves a 14px gap below the sticky header. In the desktop All timeline, the subject-label column stays fixed while the month grid scrolls horizontally. On mobile All, the subject-column header begins immediately below and stays sticky beneath the two-row Path header; its subject-colour markers are circular like desktop, and month labels left-align. The period picker has additional space around it to read as a separate, centred control.
- Course start/end ranges are derived mock data: changing course weekly hours or catalog hours recalculates both Month and All. Study Calendar records learner availability and updates the shared capacity data without yet rescheduling course end dates.
- Course Detail is a bottom sheet on both desktop and mobile, easing smoothly into its final position from below and leaving quickly downward with a decelerating finish. It uses the same content: desktop places the course/CTA, schedule controls, and course summary horizontally; at 641–900px (including portrait iPad), it uses two columns with course title → summary → CTA on the left and schedule controls on the right; mobile stacks those panels vertically at full available width. The close button has equal top and right inset. Course-control labels share a 14px semibold style, and the custom 1–10 step slider draws its track, ticks, and thumb while retaining the numbers below. It immediately updates the estimated duration, plan, and timelines. “ตาม Course ก่อนหน้า” is a themed checkbox aligned with the “วันเริ่มต้น” label; it uses the same schedule rule as an empty earliest-start date, disables the date picker without deleting its value, and restores that value when unchecked. The first course in a subject has no predecessor, so this checkbox is disabled with the same “ไม่มี Course ก่อนหน้า” tooltip as the weekly-rhythm control; the plan also treats a stale stored value as off. Desktop month columns have a 64px minimum width.
- Study Calendar is an approved panel with regular-day, weekend/holiday, school-break, and special-day controls; see `MYPATH-STUDY-CALENDAR.md`.

## Open questions

- The Study Calendar destination will configure regular-day/holiday study hours and per-day overrides.
- **Course detail:** clicking a course opens its detail overlay — see `MYPATH-COURSE-DETAIL.md`.
