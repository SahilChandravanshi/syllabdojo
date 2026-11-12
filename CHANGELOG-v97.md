# v97 — Fix v96 build-breaking trailing code

- Removed two accidentally appended `pointerDragExam` declarations after `export default App`.
- The declarations were outside any component and were not needed there; component-local drag state remains in place.
- Preserves the v96 exam reorder implementation.
