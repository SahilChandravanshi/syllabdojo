# v59 — Mobile month labels use heatmap week columns

- Fixed the actual source of the mobile month-label drift: the month header had fractional `grid-template-columns` from an inline style while the heatmap used fixed 12px week columns.
- Mobile 12-month month header now uses the same 12px column width and 3px gap as the daily heatmap.
- Month labels are positioned over the first Sunday-based week column of each month, so October begins after September's final week.
- Desktop and non-12-month views are unchanged.
