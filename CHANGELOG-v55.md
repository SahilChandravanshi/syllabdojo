# v55 — Remove trailing mobile heatmap dates

- Mobile Last 12 months explicitly clamps the generated date sequence to today's date.
- The final partial week is not padded with future-day cells.
- Preserves current-month focus and horizontal scrolling.
- Desktop and shorter date ranges remain unchanged.
