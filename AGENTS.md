# Learn Anywhere — As-Is Mockup

Before designing or coding any page, read `ai-knowledge/APP_OVERVIEW.md` and the page's doc in `ai-knowledge/PAGES/`.

- This repo is a **frontend-only mockup** (Vite + React + TS + Tailwind, react-router). No backend, no real data — hardcode mock data in the page/component.
- Phase 1 = mock the **as-is** design 1:1 from Figma (desktop + mobile frames, one responsive codebase with breakpoints). The **My Path redesign is Phase 2** — do not redesign anything early.
- Figma access comes through the "Figma Desktop" MCP server (configured in `.zcode/config.json`); the link registry with node-ids lives in `ai-knowledge/FIGMA-LINKS.md`.
- When a page is finished, write/refresh `ai-knowledge/PAGES/<PAGE>.md` using `_TEMPLATE.md` so the knowledge base stays the source of truth.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for apirak/MyPath (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.
