# v98 — TypeScript fixes for exam reordering

- Imported the `Exam` type used by the selected-exam lists.
- Added component-scoped pointer-drag refs to Dashboard and Analytics.
- Fixed nullable `activePill` narrowing in the Analytics heatmap.
- These typing fixes also restore inference for exam categories and topic IDs.
