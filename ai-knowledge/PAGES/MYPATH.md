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
| 1 | Sticky header | Week / Month / Year control, period picker, and Study Calendar entry point | Full-width sticky bar: tabs align left, period picker stays centred, calendar aligns right | Tabs and calendar share line one; centred picker moves to line two |
| 2 | Monthly agenda | Current courses, then upcoming courses grouped by start date | Centered reading column | Single-column agenda |
| 3 | Course card | Subject-colour strip, cover, Subject, Course title, type and total hours/date range | Horizontal card | Compact horizontal card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Composes the as-is My Path screen | Static logged-in mock data; My Path is active |
| MyPathMonthlyPrototype | `src/pages/MyPathMonthlyPrototype.tsx` | Current implementation of the chosen Monthly agenda design | Static January 2569 data; Month is selected |
| MyPathYearPrototype | `src/pages/MyPathYearPrototype.tsx` | Yearly-view prototype (winner of the A/B/C round — owner picked the timeline grid; B/C variants and switcher removed) on `/mypath/year-prototype` | Axis = ต.ค. 69 → ก.พ. 71 (17 months, day-exact — month lines follow real month lengths). Mock data mirrors `SAMPLE_DATA/` (25 courses, 554.5 ชม., 8 single-day events: สอบจริง 2 + Mock 6). Exam-rail encoding: hue = ชนิด (blue = สอบจริง, red = Mock) and depth = การซื้อ (solid dark = ซื้อแล้ว, light tint + dashed = ยังไม่ได้ซื้อ — only Mock CBT). The rail renders two-line pills (name on top, date below) always centred on their true date; a pill that would collide with an earlier one stacks into the next row below (rows grow as needed), with faint straight leader lines down to its dot. **Course start/end are computed, not hardcoded**: a day-by-day simulation divides the 15 ชม./สปด. study budget evenly across whatever subjects run each day; a course ends when its hours are reached and the next volume in that subject starts the following day (edit `hours` in the data block and every date re-derives). Fixed exceptions: TGAT.1 (light 17-week bar) and MATH.UP+EX (13-week exam-season split). The weekly-load row plots required hours per real Monday-week (each course spreads its hours across the weeks it runs) against the 15 ชม./สัปดาห์ budget — hover tooltips show ชม./สัปดาห์; green ≤ budget, orange > budget, red > 1.5× (22.5 ชม.). Header (this page only, `.yp-header`): no page title — Week/Month/Year tabs left, period-range picker centred, study-calendar button right; mobile stacks line 1 = tabs + calendar button, line 2 = centred period picker. Desktop: X = months, Y = subjects; mobile ≤640px transposes to Y = months, X = subjects. Day-precision course bars, sequential within a subject, label tiers full → “เล่ม 1” → “ล. 1”. Ownership encoding (owner-set, replaces the earlier dashed outline): body = subject colour = ซื้อแล้ว (9 courses: TPAT3.1, MATH.1–3, PHY.0–4), body = light tint of the subject colour with subject-coloured head = ยังไม่ได้ซื้อ. Variant A adds a Monday-based weekly-load row plotted on the same day-exact scale as the grid |
| Study calendar | `src/pages/MyPathMonthlyPrototype.tsx` | Entry point for study-capacity settings | Visual only; its settings page is not built yet |
| PathHeader | `src/components/PathHeader.tsx` | Shared Month/Year header layout | Active tab and period label vary by view; responsive two-line mobile layout |
| HeaderButton | `src/components/HeaderButton.tsx` | Shared raised header button used by Profile and Path | Supports icon-only and labelled controls |

## States & variants

- Month is the active tab; the Year tab links to the yearly prototype `/mypath/year-prototype`; Week is visual-only until its view is built.
- Available courses show in “วันนี้”; future courses are grouped under their start date.
- Course start/end ranges are supplied mock data; course-duration expansion is outside this page.

## Open questions

- The Study Calendar destination will configure regular-day/holiday study hours and per-day overrides.
- Weekly view is still to be designed.
- Yearly view: pick the winning variant (A timeline grid / B subject cards / C exam-led) from `/mypath/year-prototype`, then fold it in and drop the prototype.
