# Learn Anywhere — Application Overview

> Knowledge base for AI agents (and humans) working on this repo. Read this before
> touching any page. Update it whenever understanding deepens.

## What the app is

- **Product name:** Learn Anywhere
- **Nickname:** Tung-Kai (ตั้งไข่) — the Figma file is named after the nickname
- **Type:** Learning platform
- **Users / domain details:** Logged-in learners studying course content, tracking active course progress, accessing learning support, and following a weekly study plan.

## What this repo is

A **frontend-only as-is mockup** of the current Learn Anywhere website:

- Vite + React + TypeScript + Tailwind CSS. No backend, no auth, no real data — all content is hardcoded mock data.
- One responsive codebase: every page renders a desktop layout and a mobile layout via CSS breakpoints, matching the two Figma frames per page.
- The goal of the as-is mockup is to give AI full context (purpose of the app, each page, each component) **before redesigning the My Path page**.

## Phases

| Phase | Goal | Status |
|---|---|---|
| 1. As-is mockup | Rebuild every existing page 1:1 from Figma (desktop + mobile), document each page & component in `ai-knowledge/PAGES/` | In progress |
| 2. My Path redesign | Redesign the My Path page on top of the as-is understanding | In progress |
| 3. My Path SDK | Package My Path as a React SDK that the real Learn Anywhere embeds in tab 3 — see `docs/adr/0001-mypath-as-react-sdk.md` and `docs/mypath-sdk-plan.md` | Planned |

## How we work

1. The owner sends Figma links page by page (desktop + mobile) — see `FIGMA-LINKS.md`.
2. Design details are read through the **Figma MCP** (server "Figma Desktop", `https://mcp.figma.com/mcp`, workspace-scoped in `.zcode/config.json`).
3. Each page is mocked up in `src/pages/<Page>.tsx`, shared components go in `src/components/`.
4. Every finished page gets a doc in `ai-knowledge/PAGES/<PAGE>.md` following `_TEMPLATE.md` — purpose, layout, every component, states.

## Page inventory

| Page | Route | Status | Doc |
|---|---|---|---|
| Home | `/` | Complete | `PAGES/HOME.md` |
| Courses | `/courses` | Complete | `PAGES/COURSES.md` |
| My Path | `/mypath` | Phase 2 redesign in progress | `PAGES/MYPATH.md` |
| Profile | `/profile` | Complete | `PAGES/PROFILE.md` |
| _more pages added as Figma links arrive_ | | | |
