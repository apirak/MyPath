# My Path

## Identity

- **Route:** `/mypath`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42822&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42826&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/pages/MyPath.tsx`

## Purpose

The as-is My Path introduction and weekly-study overview. It explains the planning service, invites the learner to start planning, and summarizes the current week's study hours before the future redesign phase.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Hero | Blue starry learning-plan introduction, CTA, graduation-cap illustration and landscape | 240px full-width hero | Same height with a disabled-looking tablet/desktop CTA |
| 2 | Explanation | “MyPath คืออะไร” and three benefit statements | Bordered horizontal card | Bordered card with wrapped text |
| 3 | Weekly hours | Week range, 10-hour total, seven-day subject chart and legend | Wide chart card | Narrow chart card |
| 4 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar with My Path active |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| MyPath | `src/pages/MyPath.tsx` | Composes the as-is My Path screen | Static logged-in mock data; My Path is active |
| WeeklyHours | `src/pages/MyPath.tsx` | Shows weekly mathematics/physics study hours | Static 10-hour state with red/blue subject segments |
| Hero CTA | `src/pages/MyPath.tsx` | Entry point into planning | Visual mock only; no planner route exists yet |

## States & variants

- Supplied desktop state shows an enabled “วางแผนการเรียน” CTA.
- Supplied mobile state shows the CTA as “ใช้ Tablet / Desktop เพื่อวางแผน”, indicating planning is unavailable on mobile.
- Weekly chart shows five days with subject hours, with Friday highlighted as today.

## Open questions

- The planner destination and the eventual My Path redesign are intentionally not implemented until the remaining Figma flows are supplied.
