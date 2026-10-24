# Profile

## Identity

- **Route:** `/profile`
- **Figma (desktop):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=3-31274&t=EJUDVJteWvhtznaT-4
- **Figma (mobile):** https://www.figma.com/design/iFHH2DGrbFd8cIOPVNHT1D/Tung-Kai?node-id=3-31279&t=EJUDVJteWvhtznaT-4
- **Mockup:** `src/pages/Profile.tsx`

## Purpose

The signed-in learner profile hub. It shows the learner identity and account-linked providers, progress currencies, avatar preview, and entry points to support/account actions.

## Layout

| # | Section | What it contains | Desktop | Mobile |
|---|---|---|---|---|
| 1 | Profile hero | Blue avatar stage and share/currency/outfit controls | Full-width 280px stage | Same 280px stage, 375px frame |
| 2 | Profile body | Name, Ondemand/Ignite login badges, settings control, four action rows | Max-width 1024px | Full-width padded list; long subtitle truncates |
| 3 | Bottom nav | Home, Courses, My Path, Profile | Fixed bottom navigation | Fixed bottom navigation |

## Components

| Component | File | Purpose | Behavior / states |
|---|---|---|---|
| Avatar preview | `src/pages/Profile.tsx` | Composes supplied Figma avatar layers | Static as-is preview |
| Profile tools | `src/pages/Profile.tsx` | Share, egg currency, mastery count, outfit entry points | Share/outfit are HeaderButton on the blue hero — borderless flavour (`header-button--plain`, edge `#d9e8f1`); the two counters stay plain badges |
| Profile menu | `src/pages/Profile.tsx` | Online Solution, report problem, rate us, contact links | Static rows built on HeaderButton (secondary) with trailing arrows |
| HeaderButton | `src/components/HeaderButton.tsx` | Shared push button (settings icon here too) | Press animation (solid edge + floating front — no blurred shadow, hover does not change colour); on white surfaces the secondary face carries a 3-side border in the edge colour (no bottom border, so visual height matches borderless buttons and primary); keyboard `:focus-visible` ring, honors `prefers-reduced-motion` |

## States & variants

Only the default signed-in state shown in Figma is mocked. No backend, editing, navigation destinations, or account state are implemented.

## Open questions

The destination and interaction details for the four menu rows and avatar/settings controls are not specified by the as-is frame.
