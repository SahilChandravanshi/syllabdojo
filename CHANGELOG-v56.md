# v56 — TypeScript syntax correction

- Corrected the date-generation loop in the mobile 12-month heatmap from an invalid `for...of` form to a standard initialized `for` loop.
- Preserves the v55 behavior: mobile 12-month heatmap stops at today without trailing future-day cells.
