# v47 — Precise weekday alignment

- Matched weekday label grid tracks to the heatmap's exact 12px row height and 3px row gap.
- Kept the 23px offset for the month-header row (16px month label + 7px bottom margin).
- Applied the same geometry on desktop and mobile to prevent cumulative vertical drift.
- No changes to heatmap data, date ranges, popup behavior, or other UI.
