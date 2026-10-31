# v58 — Accurate mobile month-to-week alignment

- Rebuilt mobile 12-month month-label positions from calendar dates and Sunday-based week columns, rather than the rendered day-array index.
- Each label anchors to the first Sunday starting a full week within its month.
- Month labels use an explicit single-row header grid with the same fixed-width week columns as the heatmap.
- Desktop labels and all heatmap data remain unchanged.
