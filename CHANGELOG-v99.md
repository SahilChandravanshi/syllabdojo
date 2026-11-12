# v99 — Mobile exam reordering

- Added touch-start, touch-move, touch-end and touch-cancel handling to both exam selectors.
- Reordering now detects the exam row under the finger using its screen position.
- Kept desktop pointer and native drag-and-drop behavior intact.
- Limited pointer-down handling to non-touch pointers so it does not interfere with mobile touch events.
