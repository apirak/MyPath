# My Path — Study Calendar

## Identity

- **Route:** Panel overlay from the Study Calendar button on `/mypath` and `/mypath/all`
- **Figma:** _No as-is frame; promoted from the approved My Path prototype_
- **Mockup:** `src/mypath/StudyCalendarPanel.tsx`

## Purpose

Lets a learner choose which subjects are enabled, set their usual available study time, personal school-break periods, and one-off special days without leaving My Path. The enabled subjects decide which courses exist in the plan. The time controls calculate the weekly **Calendar budget** that All compares with the courses' **Course budget**.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Full-screen panel | Sheet rises from the bottom over the current My Path view; a dim backdrop remains behind it | Full viewport | Full viewport, scrollable |
| 2 | Header | Calendar title and close button | Sticky | Sticky |
| 3 | Subjects | “วิชาที่เรียน”: toggle chips in three groups (TPAT/TGAT · คณิต–วิทย์ · ภาษา–สังคม), each with select-all / clear-all | One card | One card, chips wrap |
| 4 | Regular study time | Separate 0–10 hour sliders for Mon–Fri and Sat/Sun/holidays | Two cards | Stacked cards |
| 5 | School break | Addable date ranges and a 0–10 hours-per-day slider; new ranges start at 2 hours/day | One panel | One panel |
| 6 | Special day | Initially collapsed; opening it shows the calendar beside the chosen-day slider | Two columns | Stacked |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| StudyCalendarPanel | `src/mypath/StudyCalendarPanel.tsx` | The overlay and calendar controls | Opens from `PathHeader`; closes with × or backdrop and animates down before unmounting |
| PathHeader | `src/components/PathHeader.tsx` | My Path shared header | Owns open/closed panel state for Month and All |
| studyCalendar | `src/mypath/studentPlan.ts` | Learner calendar source data | Enabled subjects, regular hours, special-day overrides, and break periods |
| setStudyCalendar | `src/mypath/plan.ts` | In-memory update entry point | Rebuilds the plan, then notifies Month / All |
| subjectGroups | `src/mypath/courseCatalog.ts` | The 17 selectable subjects in 3 groups | Its order is the All row order |

## States & rules

- Enabled subjects live in `studyCalendar.subjects` (17 subjects in 3 groups; default TPAT, TGAT, คณิต, ฟิสิกส์, เคมี). Only these subjects' courses appear in Month / All and count toward Course budget (owned courses included); disabling a subject leaves its `studentCourses` settings intact, so re-enabling restores them. With no subject enabled, Month and All show the plan empty state (see `MYPATH.md`). Layout chosen from a 3-variant prototype (chip groups won); the variants are kept on branch `prototype/subject-enable`.

- The weekly-total summary (“เรียนสัปดาห์ละ”) was removed by owner decision 2026-10-27; Calendar budget remains visible as the dashed line in All.
- Daily capacity priority: special day → school-break range → normal weekly setting.
- A school-break range may not overlap another range. A special day inside a school-break range replaces that day's break hours.
- Calendar budget is the sum of the final hours for Monday–Sunday. For example, changing one weekday from 1 to 5 hours raises an 11-hour base week to 15 hours.
- Course budget is the planned course-hours total for that same week. The All weekly-hours chart shows hours within Calendar budget in green and hours above it in red on the same bar, with Calendar budget drawn as a dashed line.
- Actual study time will later be recorded per course and day; it is intentionally not part of this mock yet.
- A one-digit special-day hour marker is circular; `10` is a same-height pill.
- Sliders are visually cloned from the course weekly-hours control; this panel allows 0 (“พัก”).
- This is a frontend mock: changes persist only while the app runs.

## Open questions

- Holidays and special-day capacity do not reschedule course end dates; the plan remains weekly.
