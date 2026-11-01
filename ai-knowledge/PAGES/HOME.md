# Home

## Identity

- **Route:** `/`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=3-31092&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=3-31096&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/host/pages/Home.tsx`

## Purpose

The signed-in learner's dashboard. It brings recently used courses, course progress, academic-support actions, guided practice, and the current week's planned learning hours into one starting point. The fixed navigation leads to Home, Courses, My Path, and Profile.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Header | Illustration, encouragement message, coin, bag, and notification controls | Full-width 120px banner | Same banner; controls remain top-right |
| 2 | Latest courses | Four visible course cards with progress; carousel controls | Four cards across | Horizontally scrollable cards, beginning with card one |
| 3 | Extensions | Academic-team chat and Guided Practice actions | Two columns | Stacked rows |
| 4 | Weekly hours | Week range, completed/planned time, seven-day segmented chart | Full content width | Full content width, condensed gaps |
| 5 | Navigation | Home, Courses, My Path, Profile | Fixed bottom bar | Fixed bottom bar |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| Home | `src/host/pages/Home.tsx` | Composes the Home dashboard | Static logged-in mock data; Home is active |
| CourseCard | `src/host/pages/Home.tsx` | Shows one recent course and its progress | Course list is horizontally scrollable on narrow screens |
| WeeklyHours | `src/host/pages/Home.tsx` | Shows current-week learning plan | Static empty-progress/planned-hours state |
| HeaderButton | `src/host/components/HeaderButton.tsx` | All push buttons here (coin/bag/notification, carousel ‹ ›, extension links) | Pushable button (solid edge + floating front, Comeau-style press animation — no blurred shadow, hover does not change colour); secondary has two flavours: `header-button--plain` (borderless) on the coloured banner, otherwise 3-side edge-coloured border on white; keyboard `:focus-visible` ring, honors `prefers-reduced-motion` |
| Bottom navigation | `src/host/pages/Home.tsx` | Persistent primary navigation | Visual mock only; links do not navigate yet |

## States & variants

- Visible state is a logged-in learner with four active courses and no completed weekly hours.
- The desktop frame includes previous/next course controls; mobile uses horizontal scrolling.
- The design includes an empty-course variant in Figma but it is not displayed in the supplied frame.

## Open questions

- The supplied frame's supplementary actions and account controls have no destination pages yet; do not infer their flows until their Figma links are supplied.
