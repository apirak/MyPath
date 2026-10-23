# Courses

## Identity

- **Route:** `/courses`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-41323&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=4-42078&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/pages/Courses.tsx`

## Purpose

The learner's course library. It provides subject tabs, status filters, search and sort controls, and grouped course cards so learners can find, resume, practice, or review courses.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Header | Course count, search field, sort chip | Full-width content header | Same controls compressed to the 375px frame |
| 2 | Subject tabs | All, Physics, Mathematics, English | Horizontal tabs | Same tabs, clipped to viewport |
| 3 | Status filters | Learn, Practice, E-Book, not started, in progress, completed, expired | One horizontal row | One horizontally clipped row |
| 4 | Sort menu | Six visible sort choices | Open overlay at top-right in supplied state | Open overlay at top-right in supplied state |
| 5 | Subject groups | Accordion labels and course cards | Four-column card grid | Two-column card grid |
| 6 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| Courses | `src/pages/Courses.tsx` | Composes the course-library screen | Static as-is logged-in state; Courses is active |
| CourseCard | `src/pages/Courses.tsx` | Shows a course thumbnail, type, progress, expiry and completion state | Supports learn, practice, E-Book, completed and expired/locked variants |
| SubjectGroup | `src/pages/Courses.tsx` | Groups cards under a subject accordion label | Expanded in supplied frame |
| Sort menu | `src/pages/Courses.tsx` | Shows the current sort choice and alternatives | Static open state matching Figma |
| Bottom navigation | `src/pages/Courses.tsx` | Persistent primary navigation | Courses is the active item; only Home and Courses routes are wired |

## States & variants

- Supplied state shows 21 courses, Physics selected, and the sort menu open with “ชื่อคอร์ส (A→Z, ก→ฮ)” selected.
- Course cards visibly vary between learning, practice, E-Book, completed, expired, and locked states.
- The mockup does not implement filtering, search, sorting, or accordion interaction yet.

## Open questions

- Destination routes for My Path, Profile, and individual course cards will be documented when their Figma frames arrive.
