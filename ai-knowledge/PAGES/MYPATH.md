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
| 1 | Sticky header | “แผนการเรียน”, Week / Month / Year control, and Study Calendar entry point | Full-width sticky bar | Tabs wrap below title; calendar control shows icon only |
| 2 | Monthly agenda | Current courses, then upcoming courses grouped by start date | Centered reading column | Single-column agenda |
| 3 | Course card | Subject-colour strip, cover, Subject, Course title, type and total hours/date range | Horizontal card | Compact horizontal card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Composes the as-is My Path screen | Static logged-in mock data; My Path is active |
| MyPathMonthlyPrototype | `src/pages/MyPathMonthlyPrototype.tsx` | Current implementation of the chosen Monthly agenda design | Static January 2569 data; Month is selected |
| Study calendar | `src/pages/MyPathMonthlyPrototype.tsx` | Entry point for study-capacity settings | Visual only; its settings page is not built yet |

## States & variants

- Month is the active tab; Week and Year are visual-only until their views are built.
- Available courses show in “วันนี้”; future courses are grouped under their start date.
- Course start/end ranges are supplied mock data; course-duration expansion is outside this page.

## Open questions

- The Study Calendar destination will configure regular-day/holiday study hours and per-day overrides.
- Weekly and Yearly views are still to be designed and implemented.
