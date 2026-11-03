# v76 — Analytics exam selector CircleCheck fix

- Found and replaced the remaining square checkmark markup in the Analytics exam-selection modal.
- The modal now explicitly renders Lucide `Circle` for unselected exams and `CircleCheck` for selected exams.
- Added selector-specific CSS overrides to prevent old checkbox/check styles from rendering over the circle icons.
- Dashboard and Analytics selection continue to share the same selected-exam state.
