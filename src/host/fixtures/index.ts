// Mock data the host passes into <MyPath>.
// Covers come only from public/cover; courses without one deliberately omit
// `cover` so the no-cover look stays visible.
// Subject ids are the real backend ids (a_lv_*, tgat, tpat*).
import type { ExamEvent, MyPathData } from '@learn/mypath'
import json from './mypath.json'

// The mock host's Today (GLOSSARY.md). Pinned because the mock dates are
// tied to Dec 2026; the test panel can change it.
export const TODAY = '2026-12-05'

// JSON widens `kind` to string; cast only `events` so TS still checks the
// rest against the real contract.
export const mypathData: MyPathData = {
  ...json,
  events: json.events as ExamEvent[],
}
