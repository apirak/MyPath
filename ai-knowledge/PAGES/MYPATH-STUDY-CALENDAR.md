# My Path — Study Calendar

## Identity

- **Route:** Panel overlay from the Study Calendar button on `/mypath`, `/mypath/year`, and `/mypath/all`
- **Figma:** _No as-is frame; promoted from the approved My Path prototype_
- **Mockup:** `src/mypath/StudyCalendarPanel.tsx`

## Purpose

Lets a learner set their usual available study time, personal school-break periods, and one-off special days without leaving My Path. The controls update the shared in-memory calendar used by the plan views.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Full-screen panel | Sheet rises from the bottom over the current My Path view; a dim backdrop remains behind it | Full viewport | Full viewport, scrollable |
| 2 | Header | Calendar title and close button | Sticky | Sticky |
| 3 | Weekly budget | `weekday × 5 + weekend/holiday × 2` | Full-width blue summary | Full-width blue summary |
| 4 | Regular study time | Separate 0–10 hour sliders for Mon–Fri and Sat/Sun/holidays | Two cards | Stacked cards |
| 5 | School break | Addable date ranges and a 0–10 hours-per-day slider | One panel | One panel |
| 6 | Special day | Initially collapsed; opening it shows the calendar beside the chosen-day slider | Two columns | Stacked |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| StudyCalendarPanel | `src/mypath/StudyCalendarPanel.tsx` | The overlay and calendar controls | Opens from `PathHeader`; closes with × or backdrop and animates down before unmounting |
| PathHeader | `src/components/PathHeader.tsx` | My Path shared header | Owns open/closed panel state for Month, Year, and All |
| studyCalendar | `src/mypath/studentPlan.ts` | Learner calendar source data | Regular hours, special-day overrides, and break periods |
| setStudyCalendar | `src/mypath/plan.ts` | In-memory update entry point | Notifies Month / Year / All to refresh their view state |

## States & rules

- Daily capacity priority: special day → school-break range → normal weekly setting.
- A one-digit special-day hour marker is circular; `10` is a same-height pill.
- Sliders are visually cloned from the course weekly-hours control; this panel allows 0 (“พัก”).
- The summary deliberately reflects only the recurring weekly budget; exceptional dates stay in the lower controls.
- This is a frontend mock: changes persist only while the app runs.

## Open questions

- Holidays and special-day capacity do not yet reschedule course end dates; they are recorded as learner availability for the next scheduling-engine iteration.
